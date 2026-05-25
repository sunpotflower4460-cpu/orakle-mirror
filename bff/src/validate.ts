import type { ChatMessage, OracleRequest, SamplingParams } from './types';

export interface ValidationError {
  code: string;
  message: string;
}

const MAX_BODY_BYTES = 32 * 1024;
const MAX_TOTAL_CONTENT_CHARS = 16000;
const ALLOWED_ROLES = new Set(['system', 'developer', 'user', 'assistant']);

export function validateBodySize(bodyText: string): ValidationError | null {
  const enc = new TextEncoder();
  const bytes = enc.encode(bodyText).length;
  if (bytes > MAX_BODY_BYTES) {
    return { code: 'BODY_TOO_LARGE', message: 'Request body exceeds 32KB.' };
  }
  return null;
}

function isChatMessage(v: unknown): v is ChatMessage {
  if (typeof v !== 'object' || v === null) return false;
  const m = v as Record<string, unknown>;
  return typeof m.role === 'string'
    && ALLOWED_ROLES.has(m.role)
    && typeof m.content === 'string';
}

function isSamplingParams(v: unknown): v is SamplingParams {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  if (typeof s.temperature !== 'number' || s.temperature < 0 || s.temperature > 2) return false;
  if (typeof s.topP !== 'number' || s.topP < 0 || s.topP > 1) return false;
  if (s.topK !== undefined && (typeof s.topK !== 'number' || s.topK < 1 || s.topK > 100)) return false;
  return true;
}

export function validateRequest(parsed: unknown): { ok: true; data: OracleRequest } | { ok: false; error: ValidationError } {
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: { code: 'INVALID_BODY', message: 'Body must be a JSON object.' } };
  }
  const req = parsed as Record<string, unknown>;

  if (!Array.isArray(req.messages) || req.messages.length === 0) {
    return { ok: false, error: { code: 'INVALID_MESSAGES', message: 'messages must be a non-empty array.' } };
  }
  if (req.messages.length > 64) {
    return { ok: false, error: { code: 'TOO_MANY_MESSAGES', message: 'messages must contain at most 64 entries.' } };
  }
  for (const m of req.messages) {
    if (!isChatMessage(m)) {
      return { ok: false, error: { code: 'INVALID_MESSAGE_SHAPE', message: 'Each message must have role and content.' } };
    }
  }

  const totalChars = (req.messages as ChatMessage[]).reduce((sum, m) => sum + m.content.length, 0);
  if (totalChars > MAX_TOTAL_CONTENT_CHARS) {
    return { ok: false, error: { code: 'CONTENT_TOO_LONG', message: 'Total content length exceeds limit.' } };
  }

  if (!isSamplingParams(req.sampling)) {
    return { ok: false, error: { code: 'INVALID_SAMPLING', message: 'Invalid sampling params.' } };
  }

  return { ok: true, data: { messages: req.messages as ChatMessage[], sampling: req.sampling } };
}
