import type { OracleCard, SelfReadingDeck } from '../types';
import {
  acquireEntropy,
  cryptoEntropy,
  recommendedByteLength,
  shuffleWithEntropy,
  type EntropySource,
} from './entropy';

// Phase 4.16-a: 乱数源を Math.random から crypto（rejection sampling 経由）へ。
// シグネチャ・戻り値型は不変。出力は同じ一様分布で、体感・確率分布は変わらない。
export const drawCards = (deck: SelfReadingDeck, num: number): OracleCard[] => {
  if (!deck.ready || deck.cards.length === 0) return [];

  const clampedNum = Math.min(Math.max(0, num), deck.cards.length);
  const e = cryptoEntropy(recommendedByteLength(deck.cards.length));
  return shuffleWithEntropy(deck.cards, e).slice(0, clampedNum);
};

/**
 * Phase 4.16: QRNG 主経路。引いた瞬間に BFF 経由で量子乱数を取得して抽選を確定する。
 * 取得失敗・タイムアウト・オフライン時は crypto に静かにフォールバックし、必ず引ける。
 * 戻り値の source は診断記録用（UI には出さない）。
 */
export const drawCardsQuantum = async (
  deck: SelfReadingDeck,
  num: number,
): Promise<{ cards: OracleCard[]; source: EntropySource }> => {
  if (!deck.ready || deck.cards.length === 0) return { cards: [], source: 'crypto' };

  const clampedNum = Math.min(Math.max(0, num), deck.cards.length);
  const byteLen = recommendedByteLength(deck.cards.length);
  const e = await acquireEntropy(byteLen);
  try {
    return { cards: shuffleWithEntropy(deck.cards, e).slice(0, clampedNum), source: e.source };
  } catch {
    // 万一エントロピーが尽きても必ず引けるよう crypto で引き直す
    const fallback = cryptoEntropy(byteLen * 2);
    return { cards: shuffleWithEntropy(deck.cards, fallback).slice(0, clampedNum), source: 'crypto' };
  }
};
