import type {
  BackendErrorResponse,
  ChatMessage,
  FatalError,
  SamplingParams,
  TwoStageResult,
} from '../types';
import { BACKEND_URL, IS_PROD, isBackendUrlPlaceholder } from './env';

/**
 * BFF 経由で LLM を呼び出す。
 *
 * Phase 5.5 時点で、フロントエンドが持つ LLM インターフェースはこれだけ。
 * BFF (Cloudflare Workers) がプロバイダ差分と秘密情報を吸収し、
 * フロントエンドは ChatMessage / SamplingParams だけを送る。
 *
 * @param messages 4 層プロンプトの ChatMessage 配列
 * @param sampling temperature / topP / topK
 * @returns LLM の生テキスト
 * @throws FatalError BFF 経由でエラーが返った場合 or 通信失敗
 */
export async function callLLMWithSampling(
  messages: ChatMessage[],
  sampling: SamplingParams,
): Promise<string> {
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
  let lastCode: string | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, sampling }),
      });

      if (res.ok) {
        const data = await res.json() as { text?: string };
        if (typeof data.text === 'string' && data.text.length > 0) {
          return data.text;
        }
        const err = new Error('神託の声が届きませんでした。') as FatalError;
        err.fatal = true;
        throw err;
      }

      const errBody = (await res.json().catch(() => null)) as BackendErrorResponse | null;
      const code = errBody?.error?.code ?? `HTTP_${res.status}`;
      const message = errBody?.error?.message ?? `HTTP ${res.status}`;
      const retryable = res.status === 429 || (res.status >= 500 && res.status <= 599);

      if (!retryable) {
        const err = new Error(buildUserFacingError(code, message)) as FatalError;
        err.fatal = true;
        throw err;
      }

      // リトライ可能エラー: コードを保持して次の試行へ
      lastCode = code;
      lastError = new Error(message);
    } catch (e: unknown) {
      const err = e as FatalError;
      if (err?.fatal) throw err;
      lastCode = 'NETWORK_ERROR';
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
function buildUserFacingError(code: string, _message: string): string {
  switch (code) {
    case 'RATE_LIMITED':
      return '今、あまりに多くの問いが鏡に投げかけられています。少し休んでから再び訪れてください。';
    case 'CONTENT_TOO_LONG':
    case 'BODY_TOO_LARGE':
    case 'TOO_MANY_MESSAGES':
      return '問いが長すぎるようです。少し言葉を整えてから再び投げかけてください。';
    case 'ORIGIN_NOT_ALLOWED':
    case 'UNSUPPORTED_MEDIA_TYPE':
    case 'INVALID_JSON':
    case 'INVALID_BODY':
    case 'INVALID_MESSAGES':
    case 'INVALID_MESSAGE_SHAPE':
    case 'INVALID_SAMPLING':
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
  const rawResponse = await callLLMWithSampling(receptionMsgs, RECEPTION_SAMPLING);
  const raw = extractTag(rawResponse, 'reception');
  const receptionMs = Date.now() - t1Start;

  if (!raw) {
    throw new Error('Stage 1 (reception) returned empty content');
  }

  const t2Start = Date.now();
  const discernmentMsgs = discernmentBuilder(raw);
  const finalResponse = await callLLMWithSampling(discernmentMsgs, DISCERNMENT_SAMPLING);
  const final = extractTag(finalResponse, 'final');
  const discernmentMs = Date.now() - t2Start;

  if (!final) {
    return { raw, final: raw, receptionMs, discernmentMs };
  }

  return { raw, final, receptionMs, discernmentMs };
};
