import { Preferences } from './capacitorMocks';
import type { UserCard } from '../types';

export const SR_LS_KEY = 'oracle_self_reading_v1';

const USER_CARD_LIMIT = 50;

export interface SelfReadingStore {
  readings: unknown[];
  userCards: UserCard[];
}

const emptyStore = (): SelfReadingStore => ({
  readings: [],
  userCards: [],
});

const isUserCard = (value: unknown): value is UserCard => {
  if (!value || typeof value !== 'object') return false;

  const source = value as Partial<UserCard>;
  return (
    typeof source.id === 'string' &&
    typeof source.name === 'string' &&
    typeof source.meaning === 'string' &&
    typeof source.createdAt === 'number'
  );
};

const normalizeStore = (value: unknown): SelfReadingStore => {
  if (!value || typeof value !== 'object') return emptyStore();

  const source = value as Partial<SelfReadingStore>;
  return {
    readings: Array.isArray(source.readings) ? source.readings : [],
    userCards: Array.isArray(source.userCards) ? source.userCards.filter(isUserCard).slice(0, USER_CARD_LIMIT) : [],
  };
};

const writeStore = async (store: SelfReadingStore): Promise<SelfReadingStore> => {
  const nextStore = {
    ...store,
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

export async function saveUserCard(card: UserCard): Promise<SelfReadingStore> {
  const store = await loadSelfReadingStore();
  const userCards = [card, ...store.userCards.filter(userCard => userCard.id !== card.id)].slice(0, USER_CARD_LIMIT);
  return writeStore({ ...store, userCards });
}

export async function deleteUserCard(cardId: string): Promise<SelfReadingStore> {
  const store = await loadSelfReadingStore();
  return writeStore({ ...store, userCards: store.userCards.filter(card => card.id !== cardId) });
}
