// Phase 4.16: 抽選のためのエントロピー基盤。
//
// 思想:
// - 抽選アルゴリズム（Fisher-Yates）は「バイト列を受け取る純粋同期関数」に保つ。
//   非同期の QRNG 取得は呼び出し側（acquireEntropy）に閉じ込める。
// - 整数化は必ず rejection sampling を通し、modulo bias を入れない（§3.2）。
//   これが「最も自然な確率＝バイアスのない一様抽選」の技術的核心。
// - QRNG が失敗・遅延・オフラインでも必ず引けるよう、フォールバックは
//   crypto.getRandomValues()。Math.random() は使わない（§4）。
//
// このファイルの「純粋関数」群（entropyFromBytes / shuffleWithEntropy /
// cryptoEntropy / recommendedByteLength）は app 固有 import を持たないため、
// Node 単体（scripts/entropy-selftest.ts）で検証できる。BFF 連携が必要な
// acquireEntropy だけが env を動的 import する。

export type EntropySource = 'qrng' | 'crypto';

/** 整数化の単位。rejection sampling を内部で行う一様整数ソース。 */
export interface Entropy {
  /** 0..(n-1) の一様乱数を返す。内部バイトが尽きたら例外を投げる。 */
  nextInt(n: number): number;
  /** この抽選が量子由来か、フォールバックかの記録用。 */
  readonly source: EntropySource;
}

/** QRNG 取得に失敗した理由の種別（診断用。UI には出さない）。 */
export type EntropyFailureKind =
  | 'none'
  | 'no-backend'
  | 'timeout'
  | 'http-error'
  | 'bad-response'
  | 'network-error';

/** 直近の抽選がどのソースで確定したかの診断記録（問い・結果とは結びつけない）。 */
export interface EntropyDiagnostics {
  source: EntropySource;
  provider: string | null;
  failure: EntropyFailureKind;
  at: number;
}

/** QRNG fetch のタイムアウト（演出時間と協調。実測で調整可）。 */
const RANDOM_TIMEOUT_MS = 2500;

/**
 * バイト列から Entropy を作る。rejection sampling の実装はここに一本化する。
 *
 * uint8（0-255）ベース。カード枚数は最大でも数十なので n <= 256 で十分。
 * 将来 n > 256 が必要になったら複数バイト合成へ拡張する（現状は明示的に未対応）。
 */
export function entropyFromBytes(bytes: Uint8Array, source: EntropySource): Entropy {
  let pos = 0;

  const nextByte = (): number => {
    if (pos >= bytes.length) {
      throw new Error('entropy exhausted');
    }
    return bytes[pos++];
  };

  const nextInt = (n: number): number => {
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error(`nextInt requires a positive integer, got ${n}`);
    }
    if (n > 256) {
      throw new Error('nextInt supports n <= 256 (uint8 rejection sampling)');
    }
    // n の倍数の最大値を閾値とし、それ以上は棄却して引き直す。
    // 例: n=48 なら threshold = 256 - (256 % 48) = 240。240..255 は棄却。
    // n が 256 を割り切るとき（2,4,8,...,256）は threshold=256 で棄却ゼロ。
    const threshold = 256 - (256 % n);
    for (;;) {
      const b = nextByte();
      if (b < threshold) return b % n;
    }
  };

  return { nextInt, source };
}

/**
 * Fisher-Yates シャッフル。各ステップの j を Entropy の rejection sampling で生成する。
 * 純粋・同期。同じバイト列を渡せば決定的に同じ並びになる（テスト容易性）。
 */
export function shuffleWithEntropy<T>(arr: readonly T[], e: Entropy): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = e.nextInt(i + 1); // 0..i の一様整数
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/**
 * deckSize 枚のシャッフルに十分なバイト数を見積もる。
 * 棄却ぶんを大きめに見込み（各ステップ最大数バイト想定）、1〜1024 に収める。
 */
export function recommendedByteLength(deckSize: number): number {
  const budget = Math.floor(deckSize) * 4 + 16;
  return Math.max(32, Math.min(1024, budget));
}

/** crypto.getRandomValues() で byteLength バイト生成する。 */
export function cryptoBytes(byteLength: number): Uint8Array {
  const len = Math.max(1, Math.min(1024, Math.floor(byteLength)));
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  return buf;
}

/** 同期の crypto Entropy（後方互換の同期抽選用）。 */
export function cryptoEntropy(byteLength: number): Entropy {
  return entropyFromBytes(cryptoBytes(byteLength), 'crypto');
}

// ── 診断記録（UI には出さない。問い・結果とは結びつけない） ──────────────
let lastDiagnostics: EntropyDiagnostics | null = null;

function recordDiagnostics(d: EntropyDiagnostics): void {
  lastDiagnostics = d;
  if (typeof window !== 'undefined') {
    window.__oracleMirrorEntropyDiagnostics = d;
  }
}

/** 直近の抽選の診断記録を返す（テスト・開発確認用）。 */
export function getEntropyDiagnostics(): EntropyDiagnostics | null {
  return lastDiagnostics;
}

/**
 * 抽選のための十分なバイトを取得する。
 *
 * Phase 4.16-a 時点では BFF `/random` がまだ無いため、常に crypto フォールバックで
 * 完結する（呼び出しインターフェースだけ先に確定させる）。実際の BFF fetch 結線は
 * Phase 4.16-c で本関数を差し替える。
 *
 * いずれの経路でも「引いた瞬間」に呼ばれ、プールはしない（§1-2 / §3.3）。
 */
export async function acquireEntropy(byteLength: number): Promise<Entropy> {
  const len = Math.max(1, Math.min(1024, Math.floor(byteLength)));
  void RANDOM_TIMEOUT_MS; // 4.16-c で fetch のタイムアウトに使用する
  recordDiagnostics({ source: 'crypto', provider: null, failure: 'no-backend', at: Date.now() });
  return entropyFromBytes(cryptoBytes(len), 'crypto');
}
