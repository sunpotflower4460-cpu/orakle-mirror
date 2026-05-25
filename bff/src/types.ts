// フロントエンドの src/types/index.ts と互換のある型を BFF 側にも定義する。
// Phase 5.5 でプロバイダ抽象化する際に、両者を OpenAPI スキーマ等で生成する案もあるが、
// 現時点では手動でコピー管理する。差分が出たら同期すること。

export type ChatRole = 'system' | 'developer' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface SamplingParams {
  temperature: number;
  topP: number;
  topK?: number;
}

export interface OracleRequest {
  messages: ChatMessage[];
  sampling: SamplingParams;
}

export interface OracleResponseSuccess {
  text: string;
}

export interface OracleResponseError {
  error: {
    message: string;
    code: string;
  };
}

export interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  ALLOWED_ORIGINS: string;
}

// Gemini API の型(必要最小限)
export interface GeminiHistoryPart {
  text: string;
}

export interface GeminiHistoryEntry {
  role: 'user' | 'model';
  parts: GeminiHistoryPart[];
}

export interface GeminiPayload {
  contents: GeminiHistoryEntry[];
  systemInstruction: { parts: GeminiHistoryPart[] };
  generationConfig: {
    temperature: number;
    topP: number;
    topK?: number;
    maxOutputTokens: number;
  };
}

export interface GeminiResponseCandidate {
  content: {
    parts: { text: string }[];
  };
}

export interface GeminiResponse {
  candidates?: GeminiResponseCandidate[];
  error?: {
    message?: string;
    code?: number;
    status?: string;
  };
}
