import type { Env, OracleResponseError, OracleResponseSuccess, RandomResponseSuccess } from './types';
import { buildCorsHeaders, handlePreflight, isOriginAllowed } from './cors';
import { checkRateLimit, getClientIp } from './rateLimit';
import { MAX_BODY_BYTES, validateBodySize, validateRequest } from './validate';
import { selectProvider } from './providers';
import { fetchQuantumBytes } from './random';

// /random が要求できるバイト数の上限。フロントの上限(1024)および ANU の
// length 上限(1024)と揃える。1 抽選ぶんを 1 リクエストで満たすための範囲。
const RANDOM_MAX_BYTES = 1024;

function jsonResponse(status: number, body: OracleResponseSuccess | OracleResponseError | RandomResponseSuccess, corsHeaders: Record<string, string>): Response {
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

    // 量子乱数(QRNG)エンドポイント(GET /random?bytes=NN)
    // フロントは ANU の URL/キー/仕様を持たない。バイト数だけを受け取る(§7 プライバシー)。
    if (url.pathname === '/random') {
      if (request.method !== 'GET') {
        return jsonResponse(404, { error: { code: 'NOT_FOUND', message: 'Route not found' } }, corsHeaders);
      }
      // Origin ガード(/oracle と同じ方針)
      if (!isOriginAllowed(origin, env)) {
        return jsonResponse(403, { error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origin not allowed' } }, corsHeaders);
      }
      // レート制限(/oracle とは別バケット。card モードでクォータを食い合わない)
      const clientIp = getClientIp(request);
      const rate = checkRateLimit(clientIp, 'random');
      if (!rate.allowed) {
        return jsonResponse(429, { error: { code: 'RATE_LIMITED', message: `Too many requests (${rate.reason})` } }, corsHeaders);
      }
      // bytes クエリ検証(1..RANDOM_MAX_BYTES の整数)
      const bytesParam = url.searchParams.get('bytes');
      const requested = Number(bytesParam);
      if (bytesParam === null || !Number.isInteger(requested) || requested < 1 || requested > RANDOM_MAX_BYTES) {
        return jsonResponse(400, { error: { code: 'INVALID_REQUEST', message: `bytes must be an integer in 1..${RANDOM_MAX_BYTES}` } }, corsHeaders);
      }
      const result = await fetchQuantumBytes(requested, env);
      if (!result.ok) {
        // 詳細・キーは出さない。フロントが crypto フォールバックへ切れる形に正規化する。
        console.error('QRNG fetch failed', { status: result.status, code: result.code });
        return jsonResponse(
          result.status >= 500 ? 502 : result.status,
          { error: { code: 'UPSTREAM_ERROR', message: 'QRNG provider unavailable' } },
          corsHeaders,
        );
      }
      return jsonResponse(200, { bytes: result.bytes, source: result.source }, corsHeaders);
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
      const contentLengthVal = Number(contentLengthHeader);
      if (Number.isFinite(contentLengthVal) && contentLengthVal > MAX_BODY_BYTES) {
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
    if (!env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return jsonResponse(
        500,
        { error: { code: 'SERVER_MISCONFIGURED', message: 'Server is not properly configured' } },
        corsHeaders,
      );
    }

    // Provider 呼び出し（現在は OpenAI 固定）
    const provider = selectProvider(env);

    // Phase L-3a: stream:true かつ provider が callStream 対応なら SSE(text/event-stream)で返す。
    // 既存の Origin / CORS / Content-Type / レート制限 / env チェックは上で通過済み(ストリーム経路も同じ守り)。
    // stream 未指定/false は下の非ストリーム JSON パス(挙動不変)。
    if (validated.data.stream === true && provider.callStream) {
      const callStream = provider.callStream.bind(provider);
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const sse = (event: string, data: unknown): void => {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
          };
          try {
            const streamResult = await callStream(
              validated.data.messages,
              validated.data.sampling,
              validated.data.stage,
              env,
              (delta) => sse('delta', { text: delta }),
            );
            if (streamResult.ok) {
              // 全文を done で送る。フロントは increments で表示しつつ、確定は done の全文を使う。
              sse('done', { text: streamResult.text });
            } else {
              console.error('Provider stream failed', { provider: provider.name, status: streamResult.status, code: streamResult.code });
              sse('error', { code: 'UPSTREAM_ERROR', message: '天との接続が途切れました。少し時間をおいてから再び問いかけてください。' });
            }
          } catch (e) {
            console.error('Provider stream crashed', e);
            sse('error', { code: 'UPSTREAM_ERROR', message: '天との接続が途切れました。少し時間をおいてから再び問いかけてください。' });
          } finally {
            controller.close();
          }
        },
      });
      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          ...corsHeaders,
        },
      });
    }

    const result = await provider.call(validated.data.messages, validated.data.sampling, validated.data.stage, env);

    if (!result.ok) {
      console.error('Provider call failed', { provider: provider.name, status: result.status, code: result.code, message: result.message });
      // クライアントには詳細を返さない(セキュリティ)
      return jsonResponse(
        result.status >= 500 ? 502 : result.status,
        {
          error: {
            // プロバイダ固有のエラーコード（OPENAI_*, GEMINI_*, NO_OUTPUT_TEXT 等）はすべて UPSTREAM_ERROR に正規化する。
            // フロントが期待する BackendErrorCode 集合に含まれない値は外部に出さない。
            code: 'UPSTREAM_ERROR',
            message: '天との接続が途切れました。少し時間をおいてから再び問いかけてください。',
          },
        },
        corsHeaders,
      );
    }

    return jsonResponse(200, { text: result.text }, corsHeaders);
  },
};
