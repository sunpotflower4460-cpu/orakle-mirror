// Phase 4.16-a: エントロピー基盤の最小検証スクリプト（依存追加なし）。
//
// 実行: npm run test:entropy
//   （内部で node --experimental-strip-types を使用。新規 npm 依存は足さない）
//
// 検証内容（§9.3 / §11.4）:
//   1. nextInt(n) が常に 0..n-1 に収まる
//   2. rejection sampling が概ね一様（度数の範囲チェック）
//   3. シャッフルが全要素を保存する（多重集合として不変）
//   4. 既知バイト列で決定的に同じ並びになる（再現性）
//
// このスクリプトは acquireEntropy（env / fetch 依存）を呼ばない。純粋関数のみを検証する。

import {
  entropyFromBytes,
  shuffleWithEntropy,
  cryptoBytes,
  recommendedByteLength,
} from '../src/lib/entropy.ts';

let failures = 0;
function check(label: string, cond: boolean): void {
  if (cond) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${label}`);
  }
}

// 1 & 2: nextInt の範囲と一様性（N=48 を多数回サンプリング）
function testUniformity(): void {
  console.log('• nextInt range & uniformity (N=48)');
  const N = 48;
  const SAMPLES = 48000;
  const counts = new Array<number>(N).fill(0);
  // crypto から十分なバイトを供給しつつ、尽きたら補充する
  let bytes = cryptoBytes(1024);
  let e = entropyFromBytes(bytes, 'crypto');
  let inRange = true;
  for (let i = 0; i < SAMPLES; i++) {
    let v: number;
    try {
      v = e.nextInt(N);
    } catch {
      bytes = cryptoBytes(1024);
      e = entropyFromBytes(bytes, 'crypto');
      v = e.nextInt(N);
    }
    if (v < 0 || v >= N || !Number.isInteger(v)) inRange = false;
    counts[v] += 1;
  }
  check('all samples within 0..N-1', inRange);
  const expected = SAMPLES / N;
  // 一様性の緩い範囲チェック（厳密な統計検定は不要）: 各度数が期待値の ±25% 以内
  const lo = expected * 0.75;
  const hi = expected * 1.25;
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  check(`frequencies within +-25% (min=${min}, max=${max}, exp=${expected})`, min >= lo && max <= hi);
}

// 3: シャッフルが多重集合として不変
function testPermutation(): void {
  console.log('• shuffle preserves all elements');
  const deck = Array.from({ length: 48 }, (_, i) => i);
  const e = entropyFromBytes(cryptoBytes(recommendedByteLength(deck.length)), 'crypto');
  const out = shuffleWithEntropy(deck, e);
  check('same length', out.length === deck.length);
  const sorted = [...out].sort((a, b) => a - b);
  let preserved = true;
  for (let i = 0; i < deck.length; i++) if (sorted[i] !== i) preserved = false;
  check('multiset preserved', preserved);
}

// 4: 既知バイト列で決定的（再現性）
function testDeterminism(): void {
  console.log('• deterministic for a fixed byte sequence');
  const fixed = new Uint8Array([7, 200, 13, 91, 4, 250, 33, 128, 19, 64, 1, 222]);
  const deck = ['a', 'b', 'c', 'd', 'e'];
  const a = shuffleWithEntropy(deck, entropyFromBytes(fixed, 'crypto'));
  const b = shuffleWithEntropy(deck, entropyFromBytes(fixed, 'crypto'));
  check('same input -> same order', a.join('') === b.join(''));
  check('result is a permutation', [...a].sort().join('') === [...deck].sort().join(''));
}

console.log('entropy self-test');
testUniformity();
testPermutation();
testDeterminism();

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\nall checks passed');
