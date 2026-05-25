import type { Env, OracleResponseError, OracleResponseSuccess } from './types';
import { buildCorsHeaders, handlePreflight, isOriginAllowed } from './cors';
import { checkRateLimit, getClientIp } from './rateLimit';
import { MAX_BODY_BYTES, validateBodySize, validateRequest } from './validate';
import { callGemini } from './gemini';

function jsonResponse(status: number, body: OracleResponseSuccess | OracleResponseError, corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const corsHeaders = buildCorsHeaders(origin, env);

    // OPTIONS: CORS プリフライト
    if (request.method === 'OPTIONS') {
      return handlePreflight(request, env);
    }

    // ヘルスチェック(GET /)
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/') {
      return jsonResponse(200, { text: 'oracle-mirror-bff is alive' }, corsHeaders);
    }

    // ここから先は POST /oracle のみ
    if (request.method !== 'POST' || url.pathname !== '/oracle') {
      return jsonResponse(
        404,
        { error: { code: 'NOT_FOUND', message: 'Route not found' } },
        corsHeaders,
      );
    }

    // Origin 必須ポリシー:
    // - ブラウザ呼び出し:Origin ヘッダが必ず付く
    // - Capacitor (iOS/Android) WebView:capacitor://localhost / ionic://localhost が付く
    // - サーバー間呼び出し・curl からの直接呼び出しは想定しない(403 で拒否)
    // 将来サーバー間呼び出しを許可する場合は、API キーや署名ヘッダによる
    // 別経路の認証を追加すること(CORS だけでは防衛にならない)
    if (!isOriginAllowed(origin, env)) {
      return jsonResponse(
        403,
        { error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origin not allowed' } },
        corsHeaders,
      );
    }

    // Content-Type 検証
    const contentType = request.headers.get('Content-Type') ?? '';
    if (!contentType.includes('application/json')) {
      return jsonResponse(
        415,
        { error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Content-Type must be application/json' } },
        corsHeaders,
      );
    }

    // Content-Length が存在する場合は body を読む前に早期拒否する
    // (大量ペイロードのメモリ消費を抑制する一次防衛)
    const contentLengthHeader = request.headers.get('Content-Length');
    if (contentLengthHeader !== null) {
      const contentLengthVal = parseInt(contentLengthHeader, 10);
      if (!isNaN(contentLengthVal) && contentLengthVal > MAX_BODY_BYTES) {
        return jsonResponse(413, { error: { code: 'BODY_TOO_LARGE', message: 'Request body exceeds 32KB.' } }, corsHeaders);
      }
    }

    // ボディサイズ検証
    const bodyText = await request.text();
    const sizeError = validateBodySize(bodyText);
    if (sizeError) {
      return jsonResponse(413, { error: sizeError }, corsHeaders);
    }

    // JSON パース
    let parsed: unknown;
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      return jsonResponse(
        400,
        { error: { code: 'INVALID_JSON', message: 'Body is not valid JSON' } },
        corsHeaders,
      );
    }

    // スキーマ検証
    const validated = validateRequest(parsed);
    if (!validated.ok) {
      return jsonResponse(400, { error: validated.error }, corsHeaders);
    }

    // レート制限
    const clientIp = getClientIp(request);
    const rate = checkRateLimit(clientIp);
    if (!rate.allowed) {
      return jsonResponse(
        429,
        { error: { code: 'RATE_LIMITED', message: `Too many requests (${rate.reason})` } },
        corsHeaders,
      );
    }

    // 環境変数チェック(早期失敗)
    if (!env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return jsonResponse(
        500,
        { error: { code: 'SERVER_MISCONFIGURED', message: 'Server is not properly configured' } },
        corsHeaders,
      );
    }

    // Gemini 呼び出し
    const result = await callGemini(validated.data.messages, validated.data.sampling, env);

    if (!result.ok) {
      console.error('Gemini call failed', { status: result.status, code: result.code, message: result.message });
      // クライアントには詳細を返さない(セキュリティ)
      return jsonResponse(
        result.status >= 500 ? 502 : result.status,
        {
          error: {
            code: result.code.startsWith('GEMINI_') ? 'UPSTREAM_ERROR' : result.code,
            message: '天との接続が途切れました。少し時間をおいてから再び問いかけてください。',
          },
        },
        corsHeaders,
      );
    }

    return jsonResponse(200, { text: result.text }, corsHeaders);
  },
};
