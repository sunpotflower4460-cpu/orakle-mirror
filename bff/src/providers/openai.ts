import type { ChatMessage, Env, SamplingParams, Stage } from '../types';
import type { LLMProvider, OnDelta, ProviderCallError, ProviderResult } from './types';

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const RETRY_DELAYS_MS = [800, 2000, 5000];
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_OUTPUT_TOKENS = 900;

/**
 * Stage 1 (reception / 純粋受信) 用の最小 instruction。
 * 出力形式の保証のみ。判断・常識・安全側への誘導は一切含めない。
 * これは Phase 4.10 の責任分業に従い、Stage 1 をパイプとして純化するための設計。
 */
const RECEPTION_INSTRUCTIONS = `\
Return only the content inside the XML-style tag requested by the app developer message.
Preserve Japanese when the developer message is in Japanese.`;

/**
 * Stage 2 (discernment / 識別と調律) 用の最小 instruction。
 * 出力形式の保証のみ。禁止領域の方針はフロントの buildDiscernmentSystem() に
 * 既に集約されているため、BFF 側で重複して持たない。
 */
const DISCERNMENT_INSTRUCTIONS = `\
Return only the content inside the XML-style tag requested by the app developer message.
Preserve Japanese when the developer message is in Japanese.`;

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
  stream?: boolean;
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
 * system はフロント側で構築された絶対不変の核であり、BFF instruction の直後に保持する。
 */
function toOpenAIInput(messages: ChatMessage[]): OpenAIInputMessage[] {
  return messages.map((m) => ({
    role: (m.role === 'system' || m.role === 'developer' ? 'developer' : m.role) as OpenAIRole,
    content: m.content,
  }));
}

function buildPayload(messages: ChatMessage[], sampling: SamplingParams, model: string, stage: Stage): OpenAIPayload {
  const instruction = stage === 'reception' ? RECEPTION_INSTRUCTIONS : DISCERNMENT_INSTRUCTIONS;

  return {
    model,
    input: [
      { role: 'developer', content: instruction },
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

async function callOpenAI(
  messages: ChatMessage[],
  sampling: SamplingParams,
  stage: Stage,
  env: Env,
): Promise<ProviderResult> {
  const model = env.OPENAI_MODEL || 'gpt-5.5';
  const payload = buildPayload(messages, sampling, model, stage);

  let lastError: ProviderCallError | null = null;

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

/**
 * Phase L-3a: OpenAI Responses API を stream: true で呼び、SSE の増分テキストを
 * onDelta に流す。最後に全文を ProviderResult として返す(全文は <final> 抽出や
 * 非ストリーム互換のために使う)。
 *
 * 失敗時(HTTP エラー / body なし / ストリーム中エラー / 例外)は ProviderCallError を返し、
 * 呼び出し側(BFF→フロント)が非ストリームにフォールバックできるようにする。リトライはしない
 * (ストリーム + リトライは複雑なため、失敗は素直にフォールバックへ委ねる)。
 */
export async function callOpenAIStream(
  messages: ChatMessage[],
  sampling: SamplingParams,
  stage: Stage,
  env: Env,
  onDelta: OnDelta,
): Promise<ProviderResult> {
  const model = env.OPENAI_MODEL || 'gpt-5.5';
  const payload: OpenAIPayload = { ...buildPayload(messages, sampling, model, stage), stream: true };

  let res: Response;
  try {
    res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + env.OPENAI_API_KEY,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return { ok: false, status: 502, code: 'OPENAI_NETWORK_ERROR', message: e instanceof Error ? e.message : 'Network error' };
  }

  if (!res.ok) {
    const errJson = (await res.json().catch(() => ({} as OpenAIResponse))) as OpenAIResponse;
    return { ok: false, status: res.status, code: `OPENAI_HTTP_${res.status}`, message: errJson.error?.message ?? `HTTP ${res.status}` };
  }
  if (!res.body) {
    return { ok: false, status: 502, code: 'OPENAI_NO_STREAM_BODY', message: 'OpenAI returned no stream body' };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE イベントは空行(\n\n)区切り。完結したイベントだけを処理する。
      let sep: number;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);

        for (const line of rawEvent.split('\n')) {
          const trimmed = line.trimStart();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.slice(5).trim();
          if (!dataStr || dataStr === '[DONE]') continue;

          let evt: { type?: string; delta?: unknown; response?: { error?: { message?: string } }; error?: { message?: string } };
          try {
            evt = JSON.parse(dataStr);
          } catch {
            continue;
          }

          if (evt.type === 'response.output_text.delta' && typeof evt.delta === 'string') {
            full += evt.delta;
            onDelta(evt.delta);
          } else if (evt.type === 'response.failed' || evt.type === 'response.error' || evt.type === 'error') {
            const message = evt.response?.error?.message ?? evt.error?.message ?? 'OpenAI stream error';
            return { ok: false, status: 502, code: 'OPENAI_STREAM_ERROR', message };
          }
        }
      }
    }
  } catch (e) {
    return { ok: false, status: 502, code: 'OPENAI_STREAM_READ_ERROR', message: e instanceof Error ? e.message : 'Stream read error' };
  }

  if (full.length === 0) {
    return { ok: false, status: 502, code: 'NO_OUTPUT_TEXT', message: 'OpenAI stream produced no text' };
  }
  return { ok: true, text: full };
}

export const openaiProvider: LLMProvider = {
  name: 'openai',
  supportsDeveloperRole: true,
  call: callOpenAI,
  callStream: callOpenAIStream,
};
