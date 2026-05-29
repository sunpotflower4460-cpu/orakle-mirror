import type { ReactNode } from 'react';

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
