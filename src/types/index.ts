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

// ─── Gemini API ────────────────────────────────────────
export interface GeminiHistoryPart {
  text: string;
}

export interface GeminiHistoryEntry {
  role: Role;
  parts: GeminiHistoryPart[];
}

// ─── Chat Message(プロバイダ非依存の内部表現) ──────────
export type ChatRole = 'system' | 'developer' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// Gemini 出力形式(既存の GeminiHistoryEntry と systemInstruction を合わせた形)
export interface GeminiPayload {
  contents: GeminiHistoryEntry[];
  systemInstruction: { parts: GeminiHistoryPart[] };
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

export interface PurchasesPlugin {
  isMock?: boolean;
  getOfferings(): Promise<Offerings>;
  purchasePackage(options: { aPackage: PurchasePackage }): Promise<{ customerInfo: CustomerInfo }>;
  restorePurchases(): Promise<{ customerInfo: CustomerInfo }>;
}

export interface SplashScreenPlugin {
  isMock?: boolean;
  hide(): Promise<void>;
}

export interface KeyboardInfo {
  keyboardHeight: number;
}

export interface KeyboardListenerHandle {
  remove(): Promise<void>;
}

export type KeyboardEventName = 'keyboardWillShow' | 'keyboardWillHide';

export interface KeyboardPlugin {
  isMock?: boolean;
  addListener(
    eventName: KeyboardEventName,
    callback: (info: KeyboardInfo) => void
  ): Promise<KeyboardListenerHandle>;
}

export interface StatusBarPlugin {
  isMock?: boolean;
  setBackgroundColor(options: { color: string }): Promise<void>;
}

export interface BrowserPlugin {
  isMock?: boolean;
  open(options: { url: string }): Promise<void>;
}

export interface RawTransmission {
  raw: string;
  receivedAt: number;
}

export interface TwoStageResult {
  raw: string;
  final: string;
  receptionMs: number;
  discernmentMs: number;
}

export type SamplingParams = {
  temperature: number;
  topP: number;
  topK?: number;
};

// ─── Gemini API Response ───────────────────────────────
export interface GeminiResponseCandidate {
  content: {
    parts: { text: string }[];
  };
}

export interface GeminiResponse {
  candidates?: GeminiResponseCandidate[];
}

// ─── API Error ─────────────────────────────────────────
export interface FatalError extends Error {
  fatal?: boolean;
}

/**
 * BFF (Cloudflare Workers) のエラーレスポンス型。
 * 成功時は { text: string }、失敗時は以下の構造。
 */
export interface BackendErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

/**
 * BFF が返しうるエラーコードの主要パターン(参考定義、網羅ではない)。
 * UPSTREAM_ERROR は Gemini 由来エラーを丸めたもの。
 */
export type BackendErrorCode =
  | 'ORIGIN_NOT_ALLOWED'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'BODY_TOO_LARGE'
  | 'INVALID_JSON'
  | 'INVALID_BODY'
  | 'INVALID_MESSAGES'
  | 'TOO_MANY_MESSAGES'
  | 'INVALID_MESSAGE_SHAPE'
  | 'CONTENT_TOO_LONG'
  | 'INVALID_SAMPLING'
  | 'RATE_LIMITED'
  | 'SERVER_MISCONFIGURED'
  | 'UPSTREAM_ERROR'
  | 'NOT_FOUND'
  | string;
