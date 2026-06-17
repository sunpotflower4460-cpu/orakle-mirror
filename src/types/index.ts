import type { ReactNode } from 'react';
import type { MessageKey } from '../i18n';

// ─── Persona ───────────────────────────────────────────
export type PersonaId = 'lumina' | 'zenith' | 'archivist';

export interface Persona {
  id: PersonaId;
  name: string;
  title: string;
  icon: ReactNode;
  accent: string;
  soft: string;
  border: string;
  guidance: string;
  system: string;
}

export type PersonasMap = Record<PersonaId, Persona>;

// ─── Mode ──────────────────────────────────────────────
export type ModeId = 'pure' | 'card';

export interface Mode {
  id: ModeId;
  name: string;
  label: string;
  icon: ReactNode;
  guidance: string;
  systemAdd: string;
}

// MODES オブジェクトのキー名は 'PURE' / 'CARD'(大文字)である点に注意
export interface ModesMap {
  PURE: Mode;
  CARD: Mode;
}

// ─── Card ──────────────────────────────────────────────
export interface OracleCard {
  name: string;
  meaning: string;
  /** 後からカード画像を差し込むための任意フィールド。例: /cards/star-pilgrimage.webp */
  image?: string;
  /** 画像の代替テキスト。未指定の場合はカード名を利用する */
  imageAlt?: string;
}

export interface UserCard extends OracleCard {
  id: string;
  createdAt: number;
}

// ─── Self Reading ─────────────────────────────────────
export type SelfReadingDeckId = 'classic48' | 'deck24' | 'deck36' | 'userCards';

export interface SelfReadingDeck {
  id: SelfReadingDeckId;
  nameKey: MessageKey;
  descriptionKey: MessageKey;
  ready: boolean;
  cards: readonly OracleCard[];
}

export type SelfReadingSpreadId = 'one' | 'two' | 'three';

export interface SelfReadingSpread {
  id: SelfReadingSpreadId;
  nameKey: MessageKey;
  positionKeys: readonly MessageKey[];
}

export interface SelfReadingResultCard {
  card: OracleCard;
  positionId: string;
}

export interface SelfReading {
  id: string;
  createdAt: number;
  deckId: SelfReadingDeckId;
  spreadId: SelfReadingSpreadId;
  question?: string;
  cards: SelfReadingResultCard[];
}

// ─── Message / Room / Storage ──────────────────────────
export type Role = 'user' | 'model';

export interface Message {
  id: string;
  role: Role;
  text: string;
  personaId?: PersonaId;
  modeId?: ModeId;
  drawnCards?: OracleCard[];
}

export interface Room {
  title: string;
  personaId: PersonaId;
  messages: Message[];
}

export interface Storage {
  rooms: Record<string, Room>;
  roomOrder: string[];
}

// ─── Chat Message(プロバイダ非依存の内部表現) ──────────
export type ChatRole = 'system' | 'developer' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// ─── Capacitor Plugin Mocks ────────────────────────────
// Phase 6 で実プラグインに差し替える際、これらのインターフェースは
// 実プラグインの型と互換になるよう設計されている

export interface PreferencesGetResult {
  value: string | null;
}

export interface PreferencesPlugin {
  isMock?: boolean;
  get(options: { key: string }): Promise<PreferencesGetResult>;
  set(options: { key: string; value: string }): Promise<void>;
  remove(options: { key: string }): Promise<void>;
}

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}

export interface SharePlugin {
  isMock?: boolean;
  share(options: ShareOptions): Promise<void>;
}

export interface PurchasePackage {
  identifier: string;
  product: {
    priceString: string;
  };
}

export interface Offerings {
  current: {
    monthly: PurchasePackage | null;
  } | null;
}

export interface CustomerInfo {
  entitlements: {
    active: Record<string, unknown>;
  };
}

// ─── Plugin Interfaces (Capacitor) ─────────────────────
// Phase 6 で実プラグインに差し替える際、これらのインターフェースは
// 実プラグインの型と互換になるよう設計されている

export interface PluginListenerHandle {
  remove: () => Promise<void>;
}

export interface KeyboardInfo {
  keyboardHeight: number;
}

export type KeyboardEventName = 'keyboardWillShow' | 'keyboardWillHide' | 'keyboardDidShow' | 'keyboardDidHide';

export interface PurchasesPlugin {
  isMock?: boolean;
  configure?(options: { apiKey: string }): Promise<void>;
  getOfferings(): Promise<Offerings>;
  purchasePackage(options: { aPackage: PurchasePackage }): Promise<{ customerInfo: CustomerInfo }>;
  restorePurchases(): Promise<{ customerInfo: CustomerInfo }>;
}

export interface SplashScreenPlugin {
  isMock?: boolean;
  hide(): Promise<void>;
}

export interface KeyboardPlugin {
  isMock?: boolean;
  addListener(eventName: 'keyboardWillShow', callback: (info: KeyboardInfo) => void): Promise<PluginListenerHandle>;
  addListener(eventName: 'keyboardWillHide', callback: () => void): Promise<PluginListenerHandle>;
  addListener(eventName: KeyboardEventName, callback: (info?: KeyboardInfo) => void): Promise<PluginListenerHandle>;
}

export interface StatusBarPlugin {
  isMock?: boolean;
  setBackgroundColor(options: { color: string }): Promise<void>;
}

export interface BrowserPlugin {
  isMock?: boolean;
  open(options: { url: string }): Promise<void>;
}

// ─── API / LLM Types ───────────────────────────────────

export interface SamplingParams {
  temperature: number;
  topP: number;
  topK?: number;
}

export interface TwoStageResult {
  raw: string;
  final: string;
  receptionMs: number;
  discernmentMs: number;
}

export interface BackendErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

export interface FatalError extends Error {
  fatal: true;
  cause?: unknown;
}
