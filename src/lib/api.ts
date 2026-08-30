import type {
  BackendErrorCode,
  ChatMessage,
  FatalError,
  SamplingParams,
  TwoStageResult,
} from '../types';
import type { MessageKey, TFunction } from '../i18n';
import { BACKEND_URL, IS_PROD, isBackendUrlPlaceholder } from './env';
import { extractFinalForDisplay } from './streamText';

type OracleError = FatalError & { oracleErrorKey: MessageKey };

function oracleError(key: MessageKey): OracleError {
  const err = new Error(key) as OracleError;
  err.fatal = true;
  err.oracleErrorKey = key;
  return err;
}

/** 部屋削除など、呼び出し側が意図して中断した。リトライせず UI にも出さない。 */
export class OracleCancelledError extends Error {
  readonly cancelled = true as const;
  readonly fatal = true as const;
  constructor() {
    super('cancelled');
    this.name = 'OracleCancelledError';
  }
}

export function isOracleCancelled(error: unknown): boolean {
  return error instanceof OracleCancelledError
    || (Boolean(error) && typeof error === 'object' && (error as { cancelled?: unknown }).cancelled === true);
}

function isAbortError(error: unknown): boolean {
  return (error instanceof DOMException || error instanceof Error) && error.name === 'AbortError';
}

export function getOracleErrorMessage(error: unknown, t: TFunction): string {
  if (isOracleCancelled(error)) return '';
  if (error && typeof error === 'object' && 'oracleErrorKey' in error) {
    const key = (error as { oracleErrorKey: unknown }).oracleErrorKey;
    if (typeof key === 'string') return t(key as MessageKey);
  }
  return t('error.connection');
}

// QRNG は 1.5s。LLM は数秒〜十数秒が通常。ハングでスピナーが永続しないよう 1 試行 45s。
const ORACLE_FETCH_TIMEOUT_MS = 45_000;

async function fetchOraclePost(body: unknown, parentSignal?: AbortSignal): Promise<Response> {
  if (parentSignal?.aborted) throw new OracleCancelledError();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ORACLE_FETCH_TIMEOUT_MS);
  const onParentAbort = (): void => { controller.abort(); };
  parentSignal?.addEventListener('abort', onParentAbort);

  try {
    return await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    if (parentSignal?.aborted) throw new OracleCancelledError();
    if (isAbortError(e)) throw new Error('timeout');
    throw e;
  } finally {
    clearTimeout(timer);
    parentSignal?.removeEventListener('abort', onParentAbort);
  }
}

type Stage = 'reception' | 'discernment';
type BackendResult = { text: string } | { error: BackendErrorCode; message?: string };

const BACKEND_ERROR_CODES: readonly BackendErrorCode[] = [
  'NOT_FOUND',
  'ORIGIN_NOT_ALLOWED',
  'UNSUPPORTED_MEDIA_TYPE',
  'BODY_TOO_LARGE',
  'INVALID_JSON',
  'INVALID_STAGE',
  'INVALID_REQUEST',
  'RATE_LIMITED',
  'SERVER_MISCONFIGURED',
  'UPSTREAM_ERROR',
];

function normalizeBackendErrorCode(code: unknown): BackendErrorCode {
  if (typeof code === 'string' && BACKEND_ERROR_CODES.includes(code as BackendErrorCode)) {
    return code as BackendErrorCode;
  }
  return 'UPSTREAM_ERROR';
}

/**
 * BFF 経由で LLM を呼び出す。
 *
 * Phase 5.5 時点で、フロントエンドが持つ LLM インターフェースはこれだけ。
 * BFF (Cloudflare Workers) がプロバイダ差分と秘密情報を吸収し、
 * フロントエンドは ChatMessage / SamplingParams / BackendErrorCode だけを境界型として扱う。
 *
 * @param messages 4 層プロンプトの ChatMessage 配列
 * @param sampling temperature / topP / maxOutputTokens
 * @param stage BFF が Stage 別 instruction を選ぶための識別子
 * @param signal 部屋削除などで中断するための AbortSignal
 * @returns BFF の生テキスト、または正規化済みエラーコード
 * @throws FatalError 接続設定不備 or 通信失敗
 * @throws OracleCancelledError 呼び出し側が中断したとき
 */
export async function callLLMWithSampling(
  messages: ChatMessage[],
  sampling: SamplingParams,
  stage: Stage,
  signal?: AbortSignal,
): Promise<BackendResult> {
  if (!BACKEND_URL || isBackendUrlPlaceholder()) {
    if (!IS_PROD) {
      // eslint-disable-next-line no-console
      console.error(
        'VITE_BACKEND_URL is not configured. Set it in .env.local '
        + '(e.g. http://localhost:8787/oracle for local wrangler dev).',
      );
    }
    throw oracleError('error.misconfigured');
  }

  // MAX_ATTEMPTS = 試行上限回数。RETRY_DELAYS_MS の要素数は必ず MAX_ATTEMPTS - 1 にすること。
  const MAX_ATTEMPTS = 3;
  const RETRY_DELAYS_MS = [500, 1500]; // MAX_ATTEMPTS - 1 = 2 要素
  let lastError: Error | null = null;
  let lastCode: BackendErrorCode | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      if (signal?.aborted) throw new OracleCancelledError();
      const res = await fetchOraclePost({ messages, sampling, stage }, signal);

      if (res.ok) {
        const data = await res.json() as { text?: string };
        if (typeof data.text === 'string' && data.text.length > 0) {
          return { text: data.text };
        }
        throw oracleError('error.emptyResponse');
      }

      const errBody = (await res.json().catch(() => null)) as { error?: { code?: unknown; message?: unknown } } | null;
      const code = normalizeBackendErrorCode(errBody?.error?.code);
      const message = typeof errBody?.error?.message === 'string' ? errBody.error.message : `HTTP ${res.status}`;
      const retryable = res.status === 429 || (res.status >= 500 && res.status <= 599);

      if (!retryable) {
        return { error: code, message };
      }

      // リトライ可能エラー: コードを保持して次の試行へ
      lastCode = code;
      lastError = new Error(message);
    } catch (e: unknown) {
      if (e instanceof OracleCancelledError) throw e;
      const err = e as FatalError;
      if (err?.fatal) throw err;
      // タイムアウトはハング回復が目的。45s 待ったあとに同じ長さの再試行はしない。
      if (e instanceof Error && e.message === 'timeout') {
        throw oracleError('error.timeout');
      }
      lastCode = 'UPSTREAM_ERROR';
      lastError = err instanceof Error ? err : new Error(String(e));
    }

    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    }
  }

  // 全試行失敗: 最後のエラーコードを i18n キーへ正規化して投げる。
  const err = oracleError(lastCode ? errorKeyForCode(lastCode) : 'error.connection');
  err.cause = lastError ?? undefined;
  throw err;
}

/**
 * BFF エラーコードを UI 辞書キーへ変換する。
 * 詳細を出しすぎない、世界観を保つ文言は ja.ts / en.ts 側に置く。
 */
function errorKeyForCode(code: BackendErrorCode): MessageKey {
  switch (code) {
    case 'RATE_LIMITED':
      return 'error.rateLimited';
    case 'BODY_TOO_LARGE':
      return 'error.bodyTooLarge';
    case 'NOT_FOUND':
    case 'ORIGIN_NOT_ALLOWED':
    case 'UNSUPPORTED_MEDIA_TYPE':
    case 'INVALID_JSON':
    case 'INVALID_STAGE':
    case 'INVALID_REQUEST':
      return 'error.path';
    case 'SERVER_MISCONFIGURED':
      return 'error.misconfigured';
    case 'UPSTREAM_ERROR':
      return 'error.connection';
    default:
      return 'error.emptyResponse';
  }
}

/**
 * <reception> ... </reception> または <final> ... </final> タグから中身を抽出する。
 * タグが見つからない場合は、応答全体をトリムして返す(フォールバック)。
 */
export const extractTag = (text: string, tag: 'reception' | 'final'): string => {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = text.match(re);
  if (match && match[1]) return match[1].trim();
  return text.trim();
};

/**
 * Stage 1: 純粋受信 API 呼び出し。
 * temperature を高めにして、揺らぎと断片性を許容する。
 */
const RECEPTION_SAMPLING: SamplingParams = {
  temperature: 1.1,
  topP: 0.95,
};

/**
 * Stage 2: 識別と調律 API 呼び出し。
 * temperature を落として、識別の安定性を確保する。
 */
const DISCERNMENT_SAMPLING: SamplingParams = {
  temperature: 0.7,
  topP: 0.9,
};

/**
 * 二段階処理の本体。
 * Stage 1 で純粋受信、Stage 2 で識別と調律を行い、最終応答を返す。
 *
 * 設計方針:
 * - Stage 1 が失敗したら Stage 2 は呼ばずにエラーを投げる。
 * - Stage 1 で得た raw は変更せず、そのまま Stage 2 に渡す。
 */
export const fetchOracleTwoStage = async (
  receptionMsgs: ChatMessage[],
  discernmentBuilder: (raw: string) => ChatMessage[],
  signal?: AbortSignal,
): Promise<TwoStageResult> => {
  const t1Start = Date.now();
  const rawResponse = await callLLMWithSampling(receptionMsgs, RECEPTION_SAMPLING, 'reception', signal);
  if ('error' in rawResponse) {
    throw oracleError(errorKeyForCode(rawResponse.error));
  }
  const raw = extractTag(rawResponse.text, 'reception');
  const receptionMs = Date.now() - t1Start;

  if (!raw) {
    throw oracleError('error.emptyResponse');
  }

  const t2Start = Date.now();
  const discernmentMsgs = discernmentBuilder(raw);
  const finalResponse = await callLLMWithSampling(discernmentMsgs, DISCERNMENT_SAMPLING, 'discernment', signal);
  if ('error' in finalResponse) {
    throw oracleError(errorKeyForCode(finalResponse.error));
  }
  const final = extractTag(finalResponse.text, 'final');
  const discernmentMs = Date.now() - t2Start;

  if (!final) {
    return { raw, final: raw, receptionMs, discernmentMs };
  }

  return { raw, final, receptionMs, discernmentMs };
};

// ── Phase L-3b: ストリーミング版 ────────────────────────────────────────────

/**
 * 表示用テキストの累積を受け取るコールバック。
 * delta ではなく「今わかっている表示本文の全体」を渡す(絶対指定)。タイプ表示 UI は
 * これを「ターゲット」にして一定速度で追いかける。絶対指定なので、ストリーム途中で
 * 非ストリームにフォールバックしても重複や巻き戻りが起きない。
 */
export type OnDisplayText = (displaySoFar: string) => void;

/**
 * BFF /oracle を stream:true で呼び、SSE(event: delta / done / error)を解釈する。
 * 受信した増分を extractFinalForDisplay で「タグを含まない表示本文」に整え、
 * 伸びるたびに onText に累積で渡す。戻り値はストリームで得た全文(<final> タグ込み)
 * または正規化エラー。ストリーム非対応/失敗時はエラーを返し、呼び出し側が非ストリームへ
 * フォールバックできるようにする。
 */
async function callLLMStreaming(
  messages: ChatMessage[],
  sampling: SamplingParams,
  stage: Stage,
  onText: OnDisplayText,
  signal?: AbortSignal,
): Promise<BackendResult> {
  if (!BACKEND_URL || isBackendUrlPlaceholder()) {
    return { error: 'SERVER_MISCONFIGURED' };
  }

  let res: Response;
  try {
    res = await fetchOraclePost({ messages, sampling, stage, stream: true }, signal);
  } catch (e) {
    if (e instanceof OracleCancelledError) throw e;
    if (e instanceof Error && e.message === 'timeout') {
      throw oracleError('error.timeout');
    }
    return { error: 'UPSTREAM_ERROR', message: e instanceof Error ? e.message : 'network error' };
  }

  if (!res.ok) {
    const errBody = (await res.json().catch(() => null)) as { error?: { code?: unknown } } | null;
    return { error: normalizeBackendErrorCode(errBody?.error?.code) };
  }

  const contentType = res.headers.get('Content-Type') ?? '';
  if (!contentType.includes('text/event-stream') || !res.body) {
    // ストリーム非対応(古い BFF 等)。フォールバックさせる。
    return { error: 'UPSTREAM_ERROR', message: 'not a stream' };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let raw = '';
  let shownLen = 0;
  let doneText: string | null = null;
  let streamError: BackendResult | null = null;

  const update = (): void => {
    const display = extractFinalForDisplay(raw);
    if (display.length > shownLen) {
      shownLen = display.length;
      onText(display);
    }
  };

  const consumeEvent = (rawEvent: string): void => {
    let evName = 'message';
    let dataStr = '';
    for (const line of rawEvent.split('\n')) {
      const l = line.trimStart();
      if (l.startsWith('event:')) evName = l.slice(6).trim();
      else if (l.startsWith('data:')) dataStr += l.slice(5).trim();
    }
    if (!dataStr) return;

    let payload: { text?: unknown; code?: unknown };
    try {
      payload = JSON.parse(dataStr);
    } catch {
      return;
    }

    if (evName === 'delta' && typeof payload.text === 'string') {
      raw += payload.text;
      update();
    } else if (evName === 'done') {
      doneText = typeof payload.text === 'string' ? payload.text : raw;
    } else if (evName === 'error') {
      streamError = { error: normalizeBackendErrorCode(payload.code) };
    }
  };

  const drainBuffer = (): void => {
    let sep: number;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      consumeEvent(rawEvent);
    }
  };

  try {
    for (;;) {
      if (signal?.aborted) throw new OracleCancelledError();
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      drainBuffer();
    }
    buffer += decoder.decode();
    drainBuffer();
    if (buffer.trim()) consumeEvent(buffer);
  } catch (e) {
    if (e instanceof OracleCancelledError) throw e;
    if (signal?.aborted) throw new OracleCancelledError();
    if (isAbortError(e)) throw oracleError('error.timeout');
    return { error: 'UPSTREAM_ERROR', message: e instanceof Error ? e.message : 'stream read error' };
  }

  if (streamError) return streamError;

  const fullText = doneText ?? raw;
  if (!fullText) return { error: 'UPSTREAM_ERROR', message: 'empty stream' };

  // done の全文で表示を確定(取りこぼした増分があれば最後に流す)。
  raw = fullText;
  update();

  return { text: fullText };
}

/**
 * 二段階処理のストリーミング版。
 * Stage 1(純粋受信)は内部処理なのでストリームしない(従来どおり完了待ち)。
 * Stage 2(識別と調律)のみをストリーミングし、表示用本文の累積を onText に渡す。
 * ストリーム失敗時は Stage 2 を非ストリームでやり直してフォールバック(Stage 1 は再実行しない)。
 *
 * テキストそのものは従来 fetchOracleTwoStage と同一。「出し方」だけが変わる(設計書 §5.7)。
 */
export const fetchOracleTwoStageStreaming = async (
  receptionMsgs: ChatMessage[],
  discernmentBuilder: (raw: string) => ChatMessage[],
  onText: OnDisplayText,
  signal?: AbortSignal,
): Promise<TwoStageResult> => {
  const t1Start = Date.now();
  const rawResponse = await callLLMWithSampling(receptionMsgs, RECEPTION_SAMPLING, 'reception', signal);
  if ('error' in rawResponse) {
    throw oracleError(errorKeyForCode(rawResponse.error));
  }
  const raw = extractTag(rawResponse.text, 'reception');
  const receptionMs = Date.now() - t1Start;

  if (!raw) {
    throw oracleError('error.emptyResponse');
  }

  const t2Start = Date.now();
  const discernmentMsgs = discernmentBuilder(raw);

  let finalText: string;
  const streamed = await callLLMStreaming(discernmentMsgs, DISCERNMENT_SAMPLING, 'discernment', onText, signal);
  if ('text' in streamed) {
    finalText = streamed.text;
  } else {
    // ストリーム失敗 → Stage 2 を非ストリームでやり直す(必ず答えが出る)。
    const finalResponse = await callLLMWithSampling(discernmentMsgs, DISCERNMENT_SAMPLING, 'discernment', signal);
    if ('error' in finalResponse) {
      throw oracleError(errorKeyForCode(finalResponse.error));
    }
    finalText = finalResponse.text;
    // 表示ターゲットを確定本文に一括設定(絶対指定なので重複しない)。
    onText(extractTag(finalText, 'final'));
  }

  const final = extractTag(finalText, 'final');
  const discernmentMs = Date.now() - t2Start;

  return { raw, final: final || raw, receptionMs, discernmentMs };
};
