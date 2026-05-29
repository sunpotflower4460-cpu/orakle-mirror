import { Purchases } from './capacitorMocks';
// NOTE: capacitorMocks.ts は env.ts を import しないこと（循環依存になる）

// 実行環境の判定フラグ群
// 元 App.tsx の IS_PROD / USE_JS_KEYBOARD_PADDING をそのまま移動

// 実行環境が本番(PROD)かどうかを安全に判定する定数
export const IS_PROD: boolean = (() => {
  try {
    return typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD === true;
  } catch {
    return false;
  }
})();

/**
 * BFF (Cloudflare Workers) のエンドポイント URL。
 *
 * 開発: .env.local で http://localhost:8787/oracle を指定
 * 本番: .env.production または Vite ビルド時の環境変数で
 *       https://oracle-mirror-bff.<subdomain>.workers.dev/oracle を指定
 *
 * フロントエンドは Phase 5.5 以降この URL だけを見ており、
 * LLM プロバイダ固有の情報は BFF 側に閉じ込める。
 * 未設定の場合、本番ビルドの実行時(ランタイム)に callLLMWithSampling 側でエラーを投げる。
 */
export const BACKEND_URL: string =
  (typeof import.meta !== 'undefined'
    && import.meta.env
    && typeof import.meta.env.VITE_BACKEND_URL === 'string')
    ? import.meta.env.VITE_BACKEND_URL
    : '';

export const TERMS_URL: string =
  (typeof import.meta !== 'undefined'
    && import.meta.env
    && typeof import.meta.env.VITE_TERMS_URL === 'string')
    ? import.meta.env.VITE_TERMS_URL
    : '';

export const PRIVACY_URL: string =
  (typeof import.meta !== 'undefined'
    && import.meta.env
    && typeof import.meta.env.VITE_PRIVACY_URL === 'string')
    ? import.meta.env.VITE_PRIVACY_URL
    : '';

/**
 * BACKEND_URL がプレースホルダ／未設定であるかを判定する。
 * 部分一致で既知のプレースホルダー断片を検出する。
 *
 * 現時点ではビルド時の console.warn と callLLMWithSampling の実行時ガード、
 * および assertProductionReady() の本番前検査に利用する。
 */

/** プレースホルダ文字列に含まれる既知の断片リスト */
const BACKEND_PLACEHOLDER_TOKENS = [
  'your-backend.com',
  '<subdomain>',
  'your-subdomain',
  'oracle-mirror-bff..workers.dev', // 二重ドットの誤コピー
];

const LEGAL_PLACEHOLDER_TOKENS = [
  'your-website.com',
  'example.com',
  'example.org',
  'example.net',
  'your-domain.com',
];

/** 文字列がいずれかのプレースホルダ断片を含むかを判定する共通ヘルパー */
function containsPlaceholderToken(value: string, tokens: string[]): boolean {
  return tokens.some((t) => value.includes(t));
}

export function isBackendUrlPlaceholder(): boolean {
  const v = BACKEND_URL.trim();
  if (!v) return true;
  return containsPlaceholderToken(v, BACKEND_PLACEHOLDER_TOKENS);
}

export function isLegalUrlPlaceholder(url: string): boolean {
  const v = url.trim();
  if (!v) return true;
  return containsPlaceholderToken(v, LEGAL_PLACEHOLDER_TOKENS);
}

export function assertProductionReady(): void {
  if (!IS_PROD) return;

  const errors: string[] = [];

  if (isBackendUrlPlaceholder()) {
    errors.push('VITE_BACKEND_URL is missing or placeholder');
  }
  if (isLegalUrlPlaceholder(TERMS_URL)) {
    errors.push('VITE_TERMS_URL is missing or placeholder');
  }
  if (isLegalUrlPlaceholder(PRIVACY_URL)) {
    errors.push('VITE_PRIVACY_URL is missing or placeholder');
  }
  // Phase 6 完了まで Purchases.isMock === true のままになる（capacitorMocks.ts を参照）。
  // この check は意図的な fail-fast: Phase 6 で RevenueCat 実プラグインに差し替えた時点で
  // isMock が undefined になり、ガードを通過するようになる。
  // それまでの本番ビルド起動停止は「誤って Phase 6 前にリリースする事故を防ぐ」フェイルセーフ。
  if (Purchases.isMock) {
    errors.push('RevenueCat Purchases plugin is still running in mock mode');
  }

  if (errors.length > 0) {
    throw new Error(`[prod-guard] Production readiness check failed: ${errors.join('; ')}`);
  }
}

// 本番ビルドの起動時に開発者へ警告(ブラウザ console)。
// 実際に止めるガードは assertProductionReady() 側で扱う。
if (IS_PROD && isBackendUrlPlaceholder()) {
  // eslint-disable-next-line no-console
  console.warn(
    '[env] VITE_BACKEND_URL is not configured for production. '
    + 'The app will fail to call the oracle backend at runtime.',
  );
}

// 本番ネイティブ環境で Keyboard プラグインの resize: 'body' を利用する場合のフラグ
export const USE_JS_KEYBOARD_PADDING: boolean = false;
