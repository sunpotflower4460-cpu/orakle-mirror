/**
 * 簡易レート制限(IP ベース)。
 *
 * 制限値:
 *   - 1 分あたり 20 リクエスト
 *   - 1 時間あたり 200 リクエスト
 *
 * 注意:
 *   Workers は各リクエストで isolate が再利用される保証がないため、
 *   このインメモリ実装は完璧な厳密性は保証しない。
 *   将来的には Cloudflare KV / Durable Objects / Rate Limiting Binding に
 *   移行することを推奨(Phase 後続で検討)。
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const minuteBuckets = new Map<string, Bucket>();
const hourBuckets = new Map<string, Bucket>();

const MINUTE_LIMIT = 20;
const HOUR_LIMIT = 200;
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

function checkBucket(map: Map<string, Bucket>, key: string, limit: number, windowMs: number, now: number): boolean {
  const bucket = map.get(key);
  if (!bucket || bucket.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/**
 * 過剰な map 肥大化を防ぐため、定期的に古いエントリをクリーンアップする。
 * (Workers の isolate ライフタイムは短いので問題は限定的だが念のため)
 */
function cleanup(now: number): void {
  if (minuteBuckets.size > 10000) {
    for (const [k, v] of minuteBuckets) if (v.resetAt < now) minuteBuckets.delete(k);
  }
  if (hourBuckets.size > 10000) {
    for (const [k, v] of hourBuckets) if (v.resetAt < now) hourBuckets.delete(k);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
}

export function checkRateLimit(clientIp: string): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  const minuteKey = `${clientIp}:m`;
  const hourKey = `${clientIp}:h`;

  if (!checkBucket(minuteBuckets, minuteKey, MINUTE_LIMIT, MINUTE_MS, now)) {
    return { allowed: false, reason: '1 分あたりの制限を超過' };
  }
  if (!checkBucket(hourBuckets, hourKey, HOUR_LIMIT, HOUR_MS, now)) {
    return { allowed: false, reason: '1 時間あたりの制限を超過' };
  }

  return { allowed: true };
}

/**
 * クライアント IP を取得する。
 * Cloudflare Workers では CF-Connecting-IP を優先する。
 */
export function getClientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0] ?? 'unknown';
}
