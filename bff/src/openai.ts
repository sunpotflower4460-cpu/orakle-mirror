import type { ChatMessage, Env, SamplingParams } from './types';

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const RETRY_DELAYS_MS = [800, 2000, 5000];
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_OUTPUT_TOKENS = 900;

/**
 * BFF 側の developer instruction。
 * フロントエンドには公開せず、BFF でのみ使用する。
 */
const DEVELOPER_INSTRUCTIONS = `\
You are the Oracle Mirror backend voice.
Return only the requested XML-style tag content expected by the app.
Do not claim certainty about divination, fate, medical, legal, or financial outcomes.
Speak poetically but keep the answer grounded, gentle, and non-coercive.
If the user asks for harmful or unsafe guidance, redirect toward safety and reflection.
Preserve Japanese when the user writes Japanese.`;

type OpenAIRole = 'developer' | 'user' | 'assistant';

interface OpenAIInputMessage {
  role: OpenAIRole;
  content: string;
}

interface OpenAIPayload {
  model: string;
  input: OpenAIInputMessage[];
  temperature: number;
  top_p: number;
  max_output_tokens: number;
}

interface OpenAIOutputContent {
  type: string;
  text?: string;
}

interface OpenAIOutputItem {
  type: string;
  role?: string;
  content?: OpenAIOutputContent[];
}

interface OpenAIResponse {
  output?: OpenAIOutputItem[];
  error?: {
    message?: string;
    code?: string;
    type?: string;
  };
}

/**
 * フロントエンドの ChatMessage を OpenAI Responses API の input 形式に変換する。
 * system / developer ロールは developer として渡す(OpenAI Responses API の慣習)。
 */
function toOpenAIInput(messages: ChatMessage[]): OpenAIInputMessage[] {
  return messages.map((m) => ({
    role: (m.role === 'system' || m.role === 'developer' ? 'developer' : m.role) as OpenAIRole,
    content: m.content,
  }));
}

function buildPayload(messages: ChatMessage[], sampling: SamplingParams, model: string): OpenAIPayload {
  return {
    model,
    input: [
      { role: 'developer', content: DEVELOPER_INSTRUCTIONS },
      ...toOpenAIInput(messages),
    ],
    temperature: sampling.temperature,
    top_p: sampling.topP,
    max_output_tokens: MAX_OUTPUT_TOKENS,
  };
}

/**
 * OpenAI Responses API レスポンスからテキストを抽出する。
 * output[].type === 'message' の最初の output_text を返す。
 */
function extractText(data: OpenAIResponse): string | null {
  const outputs = data.output ?? [];
  for (const out of outputs) {
    if (out.type === 'message' && Array.isArray(out.content)) {
      for (const part of out.content) {
        if (part.type === 'output_text' && typeof part.text === 'string' && part.text.length > 0) {
          return part.text;
        }
      }
    }
  }
  return null;
}

export interface OpenAICallResult {
  ok: true;
  text: string;
}

export interface OpenAICallError {
  ok: false;
  status: number;
  code: string;
  message: string;
}

export async function callOpenAI(
  messages: ChatMessage[],
  sampling: SamplingParams,
  env: Env,
): Promise<OpenAICallResult | OpenAICallError> {
  const model = env.OPENAI_MODEL || 'gpt-5.5';
  const payload = buildPayload(messages, sampling, model);

  let lastError: OpenAICallError | null = null;

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length + 1; attempt++) {
    try {
      const res = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + env.OPENAI_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = (await res.json()) as OpenAIResponse;
        const text = extractText(data);
        if (text === null) {
          return {
            ok: false,
            status: 502,
            code: 'NO_OUTPUT_TEXT',
            message: 'OpenAI returned no usable output text',
          };
        }
        return { ok: true, text };
      }

      const errJson = (await res.json().catch(() => ({} as OpenAIResponse))) as OpenAIResponse;
      const message = errJson.error?.message ?? `HTTP ${res.status}`;
      lastError = {
        ok: false,
        status: res.status,
        code: `OPENAI_HTTP_${res.status}`,
        message,
      };

      if (!RETRYABLE_STATUSES.has(res.status)) {
        return lastError;
      }
    } catch (e) {
      lastError = {
        ok: false,
        status: 502,
        code: 'OPENAI_NETWORK_ERROR',
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
    code: 'OPENAI_UNKNOWN_ERROR',
    message: 'Unknown error after retries',
  };
}
