import type {
  BackendErrorCode,
  ChatMessage,
  FatalError,
  SamplingParams,
  TwoStageResult,
} from '../types';
import { BACKEND_URL, IS_PROD, isBackendUrlPlaceholder } from './env';

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
