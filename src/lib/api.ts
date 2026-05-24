import type {
  ChatMessage,
  FatalError,
  GeminiHistoryEntry,
  GeminiPayload,
  GeminiResponse,
  Message,
  SamplingParams,
  TwoStageResult,
} from '../types';

// ─── Backend API Logic ───────────────────────────────────────────────────────

/** @deprecated Use fetchBackendAPIv2(messages, sampling) instead. Will be removed in Phase 5.5. */
export const fetchBackendAPI = async (history: GeminiHistoryEntry[], systemPrompt: string): Promise<string> => {
  // 【重要】本番環境では、GeminiAPIキーを隠蔽するためのプロキシサーバー(Cloudflare Workers等)のURLを指定してください
  const API_URL = 'https://api.your-backend.com/oracle';
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, systemPrompt }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as { text: string };
  return data.text;
};

/** @deprecated Use fetchPreviewAPIv2(messages, sampling) instead. Will be removed in Phase 5.5. */
export const fetchPreviewAPI = async (history: GeminiHistoryEntry[], systemPrompt: string): Promise<string> => {
  const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  const apiKey = (() => {
    try {
      return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || '';
    } catch {
      return '';
    }
  })();

  const delays = [1000, 2000, 4000, 8000, 16000, 32000];
  const maxRetries = 5;
  const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: history,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 1.0, topP: 0.95, maxOutputTokens: 2048 },
        }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({})) as { error?: { message?: string } };
        const msg = (e.error && e.error.message) || `HTTP ${res.status}`;
        const err = new Error(msg) as FatalError;
        if (!RETRYABLE_STATUSES.has(res.status)) { err.fatal = true; throw err; }
        throw err;
      }
      const data = await res.json() as GeminiResponse;
      return (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) || '…沈黙…';
    } catch (e: unknown) {
      const err = e as FatalError;
      if (err.fatal) throw err;
      if (attempt >= maxRetries) throw new Error('天との接続が途切れました。少し時間をおいてから再び問いかけてください。');
      await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
    }
  }
  throw new Error('Unreachable');
};

/** @deprecated Use buildChatMessages instead. Will be removed in Phase 5.5. */
export const buildHistory = (messages: Message[], newUserText: string): GeminiHistoryEntry[] => {
  const history: GeminiHistoryEntry[] = messages
    .filter((m) => typeof m.text === 'string' && m.text.trim().length > 0)
    .map((m) => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: m.text }] } as GeminiHistoryEntry));

  const alternated: GeminiHistoryEntry[] = [];
  for (const m of history) {
    const last = alternated[alternated.length - 1];
    if (last && last.role === m.role) continue;
    alternated.push(m);
  }

  while (alternated.length > 0 && alternated[alternated.length - 1].role !== 'user') alternated.pop();
  if (alternated.length > 0 && alternated[alternated.length - 1].role === 'user') alternated.pop();

  alternated.push({ role: 'user', parts: [{ text: newUserText }] });
  return alternated;
};

// ────────────────────────────────────────────────────────
// 内部 ChatMessage[] を Gemini API の payload に変換
// ────────────────────────────────────────────────────────
export const toGeminiPayload = (messages: ChatMessage[]): GeminiPayload => {
  const systemTexts: string[] = [];
  const conversation: ChatMessage[] = [];

  for (const m of messages) {
    if (m.role === 'system' || m.role === 'developer') {
      systemTexts.push(m.content);
    } else {
      conversation.push(m);
    }
  }

  const systemInstructionText = systemTexts.join('\n\n');

  const contents: GeminiHistoryEntry[] = conversation.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  return {
    contents,
    systemInstruction: { parts: [{ text: systemInstructionText }] },
  };
};

const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const DEFAULT_SAMPLING: SamplingParams = { temperature: 1.0, topP: 0.95 };
const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000, 32000];
const MAX_RETRIES = 5;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

const getGeminiApiKey = (): string => {
  try {
    return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || '';
  } catch {
    return '';
  }
};

const extractGeminiText = (data: GeminiResponse): string => {
  return (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) || '…沈黙…';
};

/** @deprecated Use callLLMWithSampling(messages, sampling) instead. Will be removed in Phase 5.5. */
export const fetchPreviewAPIv2 = async (
  messages: ChatMessage[],
  sampling: SamplingParams = DEFAULT_SAMPLING,
): Promise<string> => {
  const payload = toGeminiPayload(messages);
  const apiKey = getGeminiApiKey();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          generationConfig: {
            temperature: sampling.temperature,
            topP: sampling.topP,
            ...(typeof sampling.topK === 'number' ? { topK: sampling.topK } : {}),
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({})) as { error?: { message?: string } };
        const msg = (e.error && e.error.message) || `HTTP ${res.status}`;
        const err = new Error(msg) as FatalError;
        if (!RETRYABLE_STATUSES.has(res.status)) { err.fatal = true; throw err; }
        throw err;
      }

      const data = await res.json() as GeminiResponse;
      return extractGeminiText(data);
    } catch (e: unknown) {
      const err = e as FatalError;
      if (err.fatal) throw err;
      if (attempt >= MAX_RETRIES) throw new Error('天との接続が途切れました。少し時間をおいてから再び問いかけてください。');
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
    }
  }

  throw new Error('Unreachable');
};

/** @deprecated Use callLLMWithSampling(messages, sampling) instead. Will be removed in Phase 5.5. */
export const fetchBackendAPIv2 = async (
  messages: ChatMessage[],
  sampling: SamplingParams = DEFAULT_SAMPLING,
): Promise<string> => {
  const API_URL = 'https://api.your-backend.com/oracle';

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, sampling }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({})) as { error?: { message?: string } };
        const msg = (e.error && e.error.message) || `HTTP ${res.status}`;
        const err = new Error(msg) as FatalError;
        if (!RETRYABLE_STATUSES.has(res.status)) { err.fatal = true; throw err; }
        throw err;
      }

      const data = await res.json() as { text: string };
      return data.text;
    } catch (e: unknown) {
      const err = e as FatalError;
      if (err.fatal) throw err;
      if (attempt >= MAX_RETRIES) throw new Error('天との接続が途切れました。少し時間をおいてから再び問いかけてください。');
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
    }
  }

  throw new Error('Unreachable');
};

export const callLLMWithSampling = async (
  messages: ChatMessage[],
  sampling: SamplingParams,
): Promise<string> => {
  return import.meta.env.PROD
    ? await fetchBackendAPIv2(messages, sampling)
    : await fetchPreviewAPIv2(messages, sampling);
};

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
