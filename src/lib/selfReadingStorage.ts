import { Preferences } from './capacitorMocks';
import type { OracleCard, SelfReading, SelfReadingDeckId, SelfReadingSpreadId, UserCard } from '../types';

export const SR_LS_KEY = 'oracle_self_reading_v1';

const READING_LIMIT = 30;
const USER_CARD_LIMIT = 50;
const DECK_IDS: SelfReadingDeckId[] = ['classic48', 'deck24', 'deck36', 'userCards'];
const SPREAD_IDS: SelfReadingSpreadId[] = ['one', 'two', 'three'];

export interface SelfReadingStore {
  readings: SelfReading[];
  userCards: UserCard[];
}

const emptyStore = (): SelfReadingStore => ({
  readings: [],
  userCards: [],
});

const isOracleCard = (value: unknown): value is OracleCard => {
  if (!value || typeof value !== 'object') return false;

  const source = value as Partial<OracleCard>;
  return (
    typeof source.name === 'string' &&
    typeof source.meaning === 'string' &&
    (source.image === undefined || typeof source.image === 'string') &&
    (source.imageAlt === undefined || typeof source.imageAlt === 'string')
  );
};

const isUserCard = (value: unknown): value is UserCard => {
  if (!value || typeof value !== 'object') return false;

  const source = value as Partial<UserCard>;
  return (
    isOracleCard(value) &&
    typeof source.id === 'string' &&
    typeof source.createdAt === 'number'
  );
};

const isSelfReading = (value: unknown): value is SelfReading => {
  if (!value || typeof value !== 'object') return false;

  const source = value as Partial<SelfReading>;
  return (
    typeof source.id === 'string' &&
    typeof source.createdAt === 'number' &&
    typeof source.deckId === 'string' &&
    DECK_IDS.includes(source.deckId as SelfReadingDeckId) &&
    typeof source.spreadId === 'string' &&
    SPREAD_IDS.includes(source.spreadId as SelfReadingSpreadId) &&
    (source.question === undefined || typeof source.question === 'string') &&
    Array.isArray(source.cards) &&
    source.cards.every(item => {
      if (!item || typeof item !== 'object') return false;
      const resultCard = item as Partial<SelfReading['cards'][number]>;
      return typeof resultCard.positionId === 'string' && isOracleCard(resultCard.card);
    })
  );
};

const normalizeStore = (value: unknown): SelfReadingStore => {
  if (!value || typeof value !== 'object') return emptyStore();

  const source = value as Partial<SelfReadingStore>;
  return {
    readings: Array.isArray(source.readings) ? source.readings.filter(isSelfReading).slice(0, READING_LIMIT) : [],
    userCards: Array.isArray(source.userCards) ? source.userCards.filter(isUserCard).slice(0, USER_CARD_LIMIT) : [],
  };
};

const writeStore = async (store: SelfReadingStore): Promise<SelfReadingStore> => {
  const nextStore = {
    readings: store.readings.slice(0, READING_LIMIT),
    userCards: store.userCards.slice(0, USER_CARD_LIMIT),
  };
  await Preferences.set({ key: SR_LS_KEY, value: JSON.stringify(nextStore) });
  return nextStore;
};

export async function loadSelfReadingStore(): Promise<SelfReadingStore> {
  const { value } = await Preferences.get({ key: SR_LS_KEY });
  if (!value) return emptyStore();

  try {
    return normalizeStore(JSON.parse(value));
  } catch {
    return emptyStore();
  }
}

export async function saveSelfReading(reading: SelfReading): Promise<SelfReadingStore> {
  const store = await loadSelfReadingStore();
  const readings = [reading, ...store.readings.filter(item => item.id !== reading.id)].slice(0, READING_LIMIT);
  return writeStore({ ...store, readings });
}

export async function deleteSelfReading(readingId: string): Promise<SelfReadingStore> {
  const store = await loadSelfReadingStore();
  return writeStore({ ...store, readings: store.readings.filter(reading => reading.id !== readingId) });
}

export async function clearSelfReadings(): Promise<SelfReadingStore> {
  const store = await loadSelfReadingStore();
  return writeStore({ ...store, readings: [] });
}

export async function saveUserCard(card: UserCard): Promise<SelfReadingStore> {
  const store = await loadSelfReadingStore();
  const userCards = [card, ...store.userCards.filter(userCard => userCard.id !== card.id)].slice(0, USER_CARD_LIMIT);
  return writeStore({ ...store, userCards });
}

export async function deleteUserCard(cardId: string): Promise<SelfReadingStore> {
  const store = await loadSelfReadingStore();
  return writeStore({ ...store, userCards: store.userCards.filter(card => card.id !== cardId) });
}
