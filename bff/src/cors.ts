import type { Env } from './types';

/**
 * 許可された Origin を判定する。
 * Env.ALLOWED_ORIGINS はカンマ区切り文字列。
 * 完全一致のみ許可(ワイルドカードはサポートしない)。
 */
export function isOriginAllowed(origin: string | null, env: Env): boolean {
  if (!origin) return false;
  // env.ALLOWED_ORIGINS が未設定でも例外を投げないよう nullish 対策
  const raw = env.ALLOWED_ORIGINS ?? '';
  const allowed = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return allowed.includes(origin);
}

/**
 * CORS レスポンスヘッダを生成する。
 * 許可されていない Origin の場合、Access-Control-Allow-Origin は付与しない
 * (= ブラウザ側で CORS エラーになる)。
 */
export function buildCorsHeaders(origin: string | null, env: Env): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (origin && isOriginAllowed(origin, env)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

/**
 * OPTIONS プリフライトに対する応答を返す。
 */
export function handlePreflight(request: Request, env: Env): Response {
  const origin = request.headers.get('Origin');
  const headers = buildCorsHeaders(origin, env);
  return new Response(null, { status: 204, headers });
}
