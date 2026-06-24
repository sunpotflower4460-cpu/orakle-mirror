// Phase A-2: キーワード選定の最小検証スクリプト（依存追加なし）。
//
// 実行: npm run test:keywords  （node --experimental-strip-types を使用）
//
// 検証内容（設計書 §5 A-2）:
//   1. 指定数を返す（プール未満ならクランプ）
//   2. 重複なし
//   3. プール内の語のみ
//   4. 既知バイト列で決定的
//
// 注: src/lib/keywords.ts は拡張子なしの相対 import を持つため、env/fetch を
// 経由しないこのテストでは、その純粋ロジック（selectKeywords = shuffleWithEntropy +
// クランプ + slice）を leaf モジュール（entropy.ts / constants/keywords.ts）から
// 直接再現して検証する。実プール・実シャッフルを使うため挙動は同一。

import { entropyFromBytes, shuffleWithEntropy, cryptoBytes, type Entropy } from '../src/lib/entropy.ts';
import { KEYWORD_POOL, KEYWORD_COUNT, type KeywordEntry } from '../src/constants/keywords.ts';

// src/lib/keywords.ts の selectKeywords と同一ロジック。
function selectKeywords(entropy: Entropy, count = KEYWORD_COUNT): KeywordEntry[] {
  if (KEYWORD_POOL.length === 0) return [];
  const n = Math.min(Math.max(0, count), KEYWORD_POOL.length);
  return shuffleWithEntropy(KEYWORD_POOL, entropy).slice(0, n);
}

let failures = 0;
function check(label: string, cond: boolean): void {
  if (cond) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FAIL ${label}`); }
}

const poolWords = new Set(KEYWORD_POOL.map((k) => k.word));

console.log('keywords self-test');

// 1 & 2 & 3: count 個、重複なし、プール内の語のみ
console.log('• selects N distinct words from the pool');
{
  const picked = selectKeywords(entropyFromBytes(cryptoBytes(64), 'crypto'), 3);
  check('returns requested count', picked.length === 3);
  const words = picked.map((k) => k.word);
  check('no duplicates', new Set(words).size === words.length);
  check('all from pool', words.every((w) => poolWords.has(w)));
}

// クランプ: プールより多い数を要求してもプール数まで
console.log('• clamps when count exceeds pool size');
{
  const picked = selectKeywords(entropyFromBytes(cryptoBytes(128), 'crypto'), KEYWORD_POOL.length + 5);
  check('clamped to pool size', picked.length === KEYWORD_POOL.length);
  check('still no duplicates', new Set(picked.map((k) => k.word)).size === picked.length);
}

// 4: 既知バイト列で決定的
console.log('• deterministic for a fixed byte sequence');
{
  const fixed = new Uint8Array([5, 240, 17, 88, 3, 199, 41, 130, 22, 70, 9, 211]);
  const a = selectKeywords(entropyFromBytes(fixed, 'crypto'), 3).map((k) => k.word).join('|');
  const b = selectKeywords(entropyFromBytes(fixed, 'crypto'), 3).map((k) => k.word).join('|');
  check('same input -> same selection', a === b);
}

// 0 個要求は空
console.log('• count 0 -> empty');
check('empty for count 0', selectKeywords(entropyFromBytes(cryptoBytes(16), 'crypto'), 0).length === 0);

if (failures > 0) { console.error(`\n${failures} check(s) failed`); process.exit(1); }
console.log('\nall checks passed');
