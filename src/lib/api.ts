import type {
  BackendErrorCode,
  ChatMessage,
  FatalError,
  SamplingParams,
  TwoStageResult,
} from '../types';
import { BACKEND_URL, IS_PROD, isBackendUrlPlaceholder } from './env';
import { extractFinalForDisplay } from './streamText';

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
 * @returns BFF の生テキスト、または正規化済みエラーコード
 * @throws FatalError 接続設定不備 or 通信失敗
 */
export async function callLLMWithSampling(
  messages: ChatMessage[],
  sampling: SamplingParams,
  stage: Stage,
): Promise<BackendResult> {
  if (!BACKEND_URL || isBackendUrlPlaceholder()) {
    const msg = IS_PROD
      ? '神託サーバーへの接続設定が不完全です。'
      : 'VITE_BACKEND_URL is not configured. Set it in .env.local '
        + '(e.g. http://localhost:8787/oracle for local wrangler dev).';
    const err = new Error(msg) as FatalError;
    err.fatal = true;
    throw err;
  }

  // MAX_ATTEMPTS = 試行上限回数。RETRY_DELAYS_MS の要素数は必ず MAX_ATTEMPTS - 1 にすること。
  const MAX_ATTEMPTS = 3;
  const RETRY_DELAYS_MS = [500, 1500]; // MAX_ATTEMPTS - 1 = 2 要素
  let lastError: Error | null = null;
  let lastCode: BackendErrorCode | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, sampling, stage }),
      });

      if (res.ok) {
        const data = await res.json() as { text?: string };
        if (typeof data.text === 'string' && data.text.length > 0) {
          return { text: data.text };
        }
        const err = new Error('神託の声が届きませんでした。') as FatalError;
        err.fatal = true;
        throw err;
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
      const err = e as FatalError;
      if (err?.fatal) throw err;
      lastCode = 'UPSTREAM_ERROR';
      lastError = err instanceof Error ? err : new Error(String(e));
    }

    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    }
  }

  // 全試行失敗: 最後のエラーコードに応じたユーザー向け文言を返す
  // (例: 429 が連続した場合は RATE_LIMITED 文言になる)
  const finalMsg = lastCode
    ? buildUserFacingError(lastCode, lastError?.message ?? '')
    : '天との接続が安定しません。少し時間をおいてから再び問いかけてください。';
  const err = new Error(finalMsg) as FatalError & { cause?: unknown };
  err.fatal = true;
  err.cause = lastError ?? undefined;
  throw err;
}

/**
 * BFF エラーコードをユーザー向けメッセージに変換する。
 * 詳細を出しすぎない、世界観を保つ文言。
 */
function buildUserFacingError(code: BackendErrorCode, _message: string): string {
  switch (code) {
    case 'RATE_LIMITED':
      return '今、あまりに多くの問いが鏡に投げかけられています。少し休んでから再び訪れてください。';
    case 'BODY_TOO_LARGE':
      return '問いが長すぎるようです。少し言葉を整えてから再び投げかけてください。';
    case 'NOT_FOUND':
    case 'ORIGIN_NOT_ALLOWED':
    case 'UNSUPPORTED_MEDIA_TYPE':
    case 'INVALID_JSON':
    case 'INVALID_STAGE':
    case 'INVALID_REQUEST':
      return '神託の経路が乱れています。アプリを再起動して再び試してください。';
    case 'SERVER_MISCONFIGURED':
    case 'UPSTREAM_ERROR':
      return '天との接続が途切れました。少し時間をおいてから再び問いかけてください。';
    default:
      return '神託の声が届きませんでした。少し時間をおいてから再び問いかけてください。';
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
): Promise<TwoStageResult> => {
  const t1Start = Date.now();
  const rawResponse = await callLLMWithSampling(receptionMsgs, RECEPTION_SAMPLING, 'reception');
  if ('error' in rawResponse) {
    const err = new Error(buildUserFacingError(rawResponse.error, rawResponse.message ?? '')) as FatalError;
    err.fatal = true;
    throw err;
  }
  const raw = extractTag(rawResponse.text, 'reception');
  const receptionMs = Date.now() - t1Start;

  if (!raw) {
    throw new Error('Stage 1 (reception) returned empty content');
  }

  const t2Start = Date.now();
  const discernmentMsgs = discernmentBuilder(raw);
  const finalResponse = await callLLMWithSampling(discernmentMsgs, DISCERNMENT_SAMPLING, 'discernment');
  if ('error' in finalResponse) {
    const err = new Error(buildUserFacingError(finalResponse.error, finalResponse.message ?? '')) as FatalError;
    err.fatal = true;
    throw err;
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
): Promise<BackendResult> {
  if (!BACKEND_URL || isBackendUrlPlaceholder()) {
    return { error: 'SERVER_MISCONFIGURED' };
  }

  let res: Response;
  try {
    res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, sampling, stage, stream: true }),
    });
  } catch (e) {
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

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sep: number;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);

        let evName = 'message';
        let dataStr = '';
        for (const line of rawEvent.split('\n')) {
          const l = line.trimStart();
          if (l.startsWith('event:')) evName = l.slice(6).trim();
          else if (l.startsWith('data:')) dataStr += l.slice(5).trim();
        }
        if (!dataStr) continue;

        let payload: { text?: unknown; code?: unknown };
        try {
          payload = JSON.parse(dataStr);
        } catch {
          continue;
        }

        if (evName === 'delta' && typeof payload.text === 'string') {
          raw += payload.text;
          update();
        } else if (evName === 'done') {
          doneText = typeof payload.text === 'string' ? payload.text : raw;
        } else if (evName === 'error') {
          streamError = { error: normalizeBackendErrorCode(payload.code) };
        }
      }
    }
  } catch (e) {
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
): Promise<TwoStageResult> => {
  const t1Start = Date.now();
  const rawResponse = await callLLMWithSampling(receptionMsgs, RECEPTION_SAMPLING, 'reception');
  if ('error' in rawResponse) {
    const err = new Error(buildUserFacingError(rawResponse.error, rawResponse.message ?? '')) as FatalError;
    err.fatal = true;
    throw err;
  }
  const raw = extractTag(rawResponse.text, 'reception');
  const receptionMs = Date.now() - t1Start;

  if (!raw) {
    throw new Error('Stage 1 (reception) returned empty content');
  }

  const t2Start = Date.now();
  const discernmentMsgs = discernmentBuilder(raw);

  let finalText: string;
  const streamed = await callLLMStreaming(discernmentMsgs, DISCERNMENT_SAMPLING, 'discernment', onText);
  if ('text' in streamed) {
    finalText = streamed.text;
  } else {
    // ストリーム失敗 → Stage 2 を非ストリームでやり直す(必ず答えが出る)。
    const finalResponse = await callLLMWithSampling(discernmentMsgs, DISCERNMENT_SAMPLING, 'discernment');
    if ('error' in finalResponse) {
      const err = new Error(buildUserFacingError(finalResponse.error, finalResponse.message ?? '')) as FatalError;
      err.fatal = true;
      throw err;
    }
    finalText = finalResponse.text;
    // 表示ターゲットを確定本文に一括設定(絶対指定なので重複しない)。
    onText(extractTag(finalText, 'final'));
  }

  const final = extractTag(finalText, 'final');
  const discernmentMs = Date.now() - t2Start;

  return { raw, final: final || raw, receptionMs, discernmentMs };
};
