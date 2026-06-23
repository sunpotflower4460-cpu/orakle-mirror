// Phase 4.16-b: /random プロバイダの最小検証スクリプト（依存追加なし）。
//
// 実行: npm run test  (bff ディレクトリ内。node --experimental-strip-types を使用)
//
// ANU 応答を globalThis.fetch のモックで差し替え、正規化・形不正・HTTP エラー・
// タイムアウト・キー未設定の挙動を検証する。実 API キーは使わない。

import { fetchQuantumBytes } from '../src/random.ts';

type Env = { OPENAI_API_KEY: string; OPENAI_MODEL: string; ALLOWED_ORIGINS: string; ANU_API_KEY: string };
const env: Env = { OPENAI_API_KEY: 'x', OPENAI_MODEL: 'x', ALLOWED_ORIGINS: 'x', ANU_API_KEY: 'test-key' };

const realFetch = globalThis.fetch;
let failures = 0;

function check(label: string, cond: boolean): void {
  if (cond) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FAIL ${label}`); }
}

function mockFetch(impl: (url: string, init?: RequestInit) => Promise<Response>): void {
  // @ts-expect-error テスト用にグローバル fetch を差し替える
  globalThis.fetch = impl;
}

async function run(): Promise<void> {
  // 1. 正常系: success=true の uint8 配列を正規化する
  console.log('• success path normalizes to bytes[]');
  mockFetch(async (url) => {
    check('requests ANU with type=uint8 and length', url.includes('type=uint8') && url.includes('length=8'));
    return new Response(JSON.stringify({ success: true, type: 'uint8', length: '8', data: [0, 1, 2, 3, 254, 255, 128, 64] }), { status: 200 });
  });
  const ok = await fetchQuantumBytes(8, env);
  check('ok=true', ok.ok === true);
  if (ok.ok) {
    check('source is qrng', ok.source === 'qrng');
    check('bytes length >= requested', ok.bytes.length >= 8);
    check('bytes are uint8', ok.bytes.every((b) => Number.isInteger(b) && b >= 0 && b <= 255));
  }

  // 2. キー未設定 → SERVER_MISCONFIGURED
  console.log('• missing key fails closed');
  const noKey = await fetchQuantumBytes(8, { ...env, ANU_API_KEY: '' });
  check('not ok', noKey.ok === false);
  if (!noKey.ok) check('code SERVER_MISCONFIGURED', noKey.code === 'SERVER_MISCONFIGURED');

  // 3. success!=true → UPSTREAM_ERROR
  console.log('• invalid provider response is rejected');
  mockFetch(async () => new Response(JSON.stringify({ success: false }), { status: 200 }));
  const bad = await fetchQuantumBytes(8, env);
  check('not ok on success=false', bad.ok === false);

  // 4. 非 uint8 データ → UPSTREAM_ERROR
  console.log('• non-uint8 data is rejected');
  mockFetch(async () => new Response(JSON.stringify({ success: true, data: [0, 1, 999] }), { status: 200 }));
  const nonByte = await fetchQuantumBytes(3, env);
  check('not ok on out-of-range data', nonByte.ok === false);

  // 5. HTTP エラー → UPSTREAM_ERROR
  console.log('• upstream HTTP error is mapped');
  mockFetch(async () => new Response('rate limited', { status: 429 }));
  const httpErr = await fetchQuantumBytes(8, env);
  check('not ok on HTTP 429', httpErr.ok === false);
  if (!httpErr.ok) check('status is 5xx-normalized', httpErr.status >= 500);

  // 6. タイムアウト(abort 相当)→ 504
  console.log('• timeout aborts to 504');
  mockFetch(async () => { throw new DOMException('aborted', 'AbortError'); });
  const timeoutResult = await fetchQuantumBytes(8, env);
  check('not ok on timeout', timeoutResult.ok === false);
  if (!timeoutResult.ok) check('status 504 on timeout', timeoutResult.status === 504);

  globalThis.fetch = realFetch;

  if (failures > 0) { console.error(`\n${failures} check(s) failed`); process.exit(1); }
  console.log('\nall checks passed');
}

console.log('random provider self-test');
void run();
