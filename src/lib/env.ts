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

// 本番ネイティブ環境で Keyboard プラグインの resize: 'body' を利用する場合のフラグ
export const USE_JS_KEYBOARD_PADDING: boolean = false;
