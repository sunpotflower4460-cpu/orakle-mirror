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
 * 未設定の場合、本番ビルド時はランタイムでエラーを投げる
 * (callLLMWithSampling 側でチェック)。
 */
export const BACKEND_URL: string =
  (typeof import.meta !== 'undefined'
    && import.meta.env
    && typeof import.meta.env.VITE_BACKEND_URL === 'string')
    ? import.meta.env.VITE_BACKEND_URL
    : '';

/**
 * BACKEND_URL がプレースホルダ／未設定であるかを判定する。
 * 部分一致で既知のプレースホルダー断片を検出する。
 *
 * Phase 7-3 の assertProductionReady() で利用する想定。
 * 現時点ではビルド時の console.warn にのみ使用し、起動時 fatal は Phase 7-3 で実装予定。
 */
export function isBackendUrlPlaceholder(): boolean {
  const v = BACKEND_URL.trim();
  if (!v) return true;
  // 既知のプレースホルダー断片 (部分一致)
  const PLACEHOLDER_TOKENS = [
    'your-backend.com',
    '<subdomain>',
    'your-subdomain',
    'oracle-mirror-bff..workers.dev', // 二重ドットの誤コピー
  ];
  return PLACEHOLDER_TOKENS.some((t) => v.includes(t));
}

// 本番ビルドの起動時に開発者へ警告 (ブラウザ console)。
// 起動時 fatal への昇格は Phase 7-3 の assertProductionReady() で対応予定。
if (IS_PROD && isBackendUrlPlaceholder()) {
  // eslint-disable-next-line no-console
  console.warn(
    '[env] VITE_BACKEND_URL is not configured for production. '
    + 'The app will fail to call the oracle backend at runtime.',
  );
}

// 本番ネイティブ環境で Keyboard プラグインの resize: 'body' を利用する場合のフラグ
export const USE_JS_KEYBOARD_PADDING: boolean = false;
