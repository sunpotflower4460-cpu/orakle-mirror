import { ORACLE_CARDS } from './cards';
import type { SelfReadingDeck } from '../types';

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
    ready: false,
    cards: [],
  },
  {
    id: 'deck36',
    nameKey: 'selfReading.deck.deck36.name',
    descriptionKey: 'selfReading.deck.deck36.description',
    ready: false,
    cards: [],
  },
];
