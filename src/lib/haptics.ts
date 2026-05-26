// 触覚フィードバックの薄い抽象化。
// 触覚は装飾であり、無くても機能は完結する(失敗は常に握りつぶす)。
//
// 現状: Web Vibration API による控えめなフォールバック。
//   iOS WKWebView では navigator.vibrate が無効なため、実機では現状ほぼ無反応。
// Phase 6: capacitorMocks の他プラグインと同様に @capacitor/haptics
//   (iOS Taptic Engine)へ差し替え、この関数の内部実装のみを置き換える。
export type HapticStyle = 'light' | 'medium' | 'success';

const PATTERNS: Record<HapticStyle, number> = {
  light: 8,
  medium: 14,
  success: 20,
};

export const haptic = (style: HapticStyle = 'light'): void => {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(PATTERNS[style]);
    }
  } catch {
    // 触覚は装飾。失敗しても何もしない。
  }
};
