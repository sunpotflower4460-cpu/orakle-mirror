// Phase A: 並走キーワードの選定ロジック。
//
// 量子乱数でキーワードを N 個選ぶ。AI 非関与・適合判定なし・重複なし。
// Phase 4.16 の既存 Entropy 基盤（acquireEntropy / shuffleWithEntropy）をそのまま流用し、
// 新しい乱数経路を作らない。取得失敗時は entropy 側が crypto フォールバックするため必ず返る。

import { KEYWORD_POOL, KEYWORD_COUNT, type KeywordEntry } from '../constants/keywords';
import {
  acquireEntropy,
  cryptoEntropy,
  recommendedByteLength,
  shuffleWithEntropy,
  type Entropy,
  type EntropySource,
} from './entropy';

/**
 * 純粋・同期。与えられた Entropy でプールから count 個を重複なしに選ぶ。
 * プールが count 未満ならある分だけ（クランプ）。同じバイト列なら決定的。
 */
export function selectKeywords(entropy: Entropy, count = KEYWORD_COUNT): KeywordEntry[] {
  if (KEYWORD_POOL.length === 0) return [];
  const n = Math.min(Math.max(0, count), KEYWORD_POOL.length);
  return shuffleWithEntropy(KEYWORD_POOL, entropy).slice(0, n);
}

/**
 * 量子乱数でキーワードを count 個選ぶ。
 * 取得失敗・枯渇時も crypto にフォールバックして必ず返る。
 * 戻り値の source は診断用（UI には出さない）。
 */
export async function pickKeywordsQuantum(
  count = KEYWORD_COUNT,
): Promise<{ keywords: KeywordEntry[]; source: EntropySource }> {
  if (KEYWORD_POOL.length === 0) return { keywords: [], source: 'crypto' };
  const byteLen = recommendedByteLength(KEYWORD_POOL.length);
  const e = await acquireEntropy(byteLen);
  try {
    return { keywords: selectKeywords(e, count), source: e.source };
  } catch {
    // 万一エントロピーが尽きても返せるよう crypto で選び直す
    return { keywords: selectKeywords(cryptoEntropy(byteLen * 2), count), source: 'crypto' };
  }
}
