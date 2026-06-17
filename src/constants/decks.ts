import { ORACLE_CARDS } from './cards';
import type { OracleCard, SelfReadingDeck } from '../types';

// Deck 2 content is intentionally empty.
// Add exactly 24 OracleCard entries here when final text is ready.
// Do not modify ORACLE_CARDS; keep safety copy free of medical/legal/financial/self-harm or deterministic claims.
export const DECK_24_CARDS: readonly OracleCard[] = [];

// Deck 3 content is intentionally empty.
// Add exactly 36 OracleCard entries here when final text is ready.
// Readiness is derived from this array length; do not set ready manually while empty.
export const DECK_36_CARDS: readonly OracleCard[] = [];

export const DECKS: readonly SelfReadingDeck[] = [
  {
    id: 'classic48',
    nameKey: 'selfReading.deck.classic48.name',
    descriptionKey: 'selfReading.deck.classic48.description',
    ready: true,
    cards: ORACLE_CARDS,
  },
  {
    id: 'deck24',
    nameKey: 'selfReading.deck.deck24.name',
    descriptionKey: 'selfReading.deck.deck24.description',
    ready: DECK_24_CARDS.length > 0,
    cards: DECK_24_CARDS,
  },
  {
    id: 'deck36',
    nameKey: 'selfReading.deck.deck36.name',
    descriptionKey: 'selfReading.deck.deck36.description',
    ready: DECK_36_CARDS.length > 0,
    cards: DECK_36_CARDS,
  },
];
