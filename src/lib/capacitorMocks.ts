// ─── Capacitor Plugins (Mock for Canvas environment) ──────────────────────────
// 【本番環境】実際のプロジェクトでは以下のコメントアウトを外し、モックを削除してください。
// import { Preferences } from '@capacitor/preferences';
// import { Share } from '@capacitor/share';
// import { Purchases } from '@revenuecat/purchases-capacitor';
// import { SplashScreen } from '@capacitor/splash-screen';
// import { Keyboard } from '@capacitor/keyboard';
// import { StatusBar } from '@capacitor/status-bar';
// import { Browser } from '@capacitor/browser';
//
// ⚠️ 循環依存防止: このファイルは src/lib/env.ts を import しないこと。
//    env.ts が capacitorMocks.ts を import しているため、逆方向の import は循環参照になる。

import type {
  PreferencesPlugin,
  SharePlugin,
  PurchasesPlugin,
  SplashScreenPlugin,
  KeyboardPlugin,
  StatusBarPlugin,
  BrowserPlugin,
} from '../types';

// 本番ビルドでのモック外し忘れ防止用フラグを付与
export const Preferences: PreferencesPlugin = {
  isMock: true,
  async get({ key }) { 
    try { return { value: localStorage.getItem(key) }; } catch (e) { return { value: null }; }
  },
  async set({ key, value }) { 
    try { localStorage.setItem(key, value); } catch (e) { console.warn('Storage set blocked'); }
  },
  async remove({ key }) { 
    try { localStorage.removeItem(key); } catch (e) { console.warn('Storage remove blocked'); }
  }
};

export const Share: SharePlugin = {
  isMock: true,
  async share(options) {
    if (navigator.share) {
      try { await navigator.share(options); } catch (e) { console.error(e); }
    } else { alert(`共有:\n${options.title}\n${options.text}\n${options.url}`); }
  }
};

export const Purchases: PurchasesPlugin = {
  isMock: true,
  async getOfferings() { 
    // App Store審査対応: ダミーの価格情報を返す
    return { 
      current: { 
        monthly: { 
          identifier: 'monthly_plan',
          product: { priceString: '¥480' }
        } 
      } 
    }; 
  },
  async purchasePackage({ aPackage }) { return { customerInfo: { entitlements: { active: { 'premium': {} } } } }; },
  // 復元機能のモック
  async restorePurchases() { return { customerInfo: { entitlements: { active: {} } } }; }
};

export const SplashScreen: SplashScreenPlugin = { isMock: true, async hide() {} };

export const Keyboard: KeyboardPlugin = {
  isMock: true,
  async addListener(_eventName, _callback) { return { remove: async () => {} }; }
};

export const StatusBar: StatusBarPlugin = {
  isMock: true,
  async setBackgroundColor({ color: _color }) {}
};

// 法的リンクを安全に開くためのBrowserモック
export const Browser: BrowserPlugin = {
  isMock: true,
  async open({ url }) { window.open(url, '_blank', 'noopener,noreferrer'); }
};
