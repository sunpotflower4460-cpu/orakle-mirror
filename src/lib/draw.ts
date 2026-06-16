import type { OracleCard, SelfReadingDeck } from '../types';

export const drawCards = (deck: SelfReadingDeck, num: number): OracleCard[] => {
  if (!deck.ready || deck.cards.length === 0) return [];

  const clampedNum = Math.min(Math.max(0, num), deck.cards.length);
  const cards = [...deck.cards];

  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards.slice(0, clampedNum);
};
