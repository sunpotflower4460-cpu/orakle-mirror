import type {
  ChatMessage,
  Env,
  GeminiHistoryEntry,
  GeminiPayload,
  GeminiResponse,
  SamplingParams,
} from './types';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const RETRY_DELAYS_MS = [800, 2000, 5000];
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_OUTPUT_TOKENS = 2048;

/**
 * フロント側 toGeminiPayload と同等の変換。
 * system / developer ロールは systemInstruction に集約。
 * user / assistant は contents に変換(assistant → model)。
 */
export function toGeminiPayload(messages: ChatMessage[], sampling: SamplingParams): GeminiPayload {
  const systemTexts: string[] = [];
  const conversation: ChatMessage[] = [];
  for (const m of messages) {
    if (m.role === 'system' || m.role === 'developer') {
      systemTexts.push(m.content);
    } else {
      conversation.push(m);
    }
  }
  const contents: GeminiHistoryEntry[] = conversation.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  return {
    contents,
    systemInstruction: { parts: [{ text: systemTexts.join('\n\n') }] },
    generationConfig: {
      temperature: sampling.temperature,
      topP: sampling.topP,
      ...(typeof sampling.topK === 'number' ? { topK: sampling.topK } : {}),
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  };
}

function extractText(data: GeminiResponse): string | null {
  const cand = data.candidates?.[0];
  const text = cand?.content?.parts?.[0]?.text;
  return typeof text === 'string' && text.length > 0 ? text : null;
}

export interface GeminiCallResult {
  ok: true;
  text: string;
}

export interface GeminiCallError {
  ok: false;
  status: number;
  code: string;
  message: string;
}

export async function callGemini(
  messages: ChatMessage[],
  sampling: SamplingParams,
  env: Env,
): Promise<GeminiCallResult | GeminiCallError> {
  const payload = toGeminiPayload(messages, sampling);
  // API キーは URL クエリではなくヘッダで送る(URL はログに残りやすいため)
  const url = `${GEMINI_BASE_URL}/${env.GEMINI_MODEL}:generateContent`;

  let lastError: GeminiCallError | null = null;

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length + 1; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = (await res.json()) as GeminiResponse;
        const text = extractText(data);
        if (text === null) {
          // Gemini が空・ブロック・異常レスポンスを返した場合はエラーとして扱う
          return {
            ok: false,
            status: 502,
            code: 'NO_CANDIDATE_TEXT',
            message: 'Gemini returned no usable candidate text',
          };
        }
        return { ok: true, text };
      }

      const errJson = (await res.json().catch(() => ({} as { error?: { message?: string } }))) as { error?: { message?: string } };
      const message = errJson.error?.message ?? `HTTP ${res.status}`;
      lastError = {
        ok: false,
        status: res.status,
        code: `GEMINI_HTTP_${res.status}`,
        message,
      };

      if (!RETRYABLE_STATUSES.has(res.status)) {
        return lastError;
      }
    } catch (e) {
      lastError = {
        ok: false,
        status: 502,
        code: 'GEMINI_NETWORK_ERROR',
        message: e instanceof Error ? e.message : 'Network error',
      };
    }

    if (attempt < RETRY_DELAYS_MS.length) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
    }
  }

  return lastError ?? {
    ok: false,
    status: 502,
    code: 'GEMINI_UNKNOWN_ERROR',
    message: 'Unknown error after retries',
  };
}
