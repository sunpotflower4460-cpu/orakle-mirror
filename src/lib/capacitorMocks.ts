// ─── Capacitor Plugin Loader (Platform-aware) ─────────────────────────────────
// ネイティブ(iOS)では実プラグインを、Web環境ではモックを使う。
//
// ⚠️ 循環依存防止: このファイルは src/lib/env.ts を import しないこと。
//    env.ts が capacitorMocks.ts を import しているため、逆方向の import は循環参照になる。

import { Capacitor } from '@capacitor/core';
import { Preferences as PreferencesReal } from '@capacitor/preferences';
import { Share as ShareReal } from '@capacitor/share';
import { Purchases as PurchasesReal } from '@revenuecat/purchases-capacitor';
import { SplashScreen as SplashScreenReal } from '@capacitor/splash-screen';
import { Keyboard as KeyboardReal } from '@capacitor/keyboard';
import { StatusBar as StatusBarReal } from '@capacitor/status-bar';
import { Browser as BrowserReal } from '@capacitor/browser';
import * as Mocks from './capacitorWebMocks';

import type {
  PreferencesPlugin,
  SharePlugin,
  PurchasesPlugin,
  SplashScreenPlugin,
  KeyboardPlugin,
  StatusBarPlugin,
  BrowserPlugin,
} from '../types';

const isNative = Capacitor.isNativePlatform();

export const Preferences: PreferencesPlugin = isNative
  ? (PreferencesReal as unknown as PreferencesPlugin)
  : Mocks.Preferences;

export const Share: SharePlugin = isNative
  ? (ShareReal as unknown as SharePlugin)
  : Mocks.Share;

// RevenueCat: isMock が undefined になることで assertProductionReady() のガードを通過する
export const Purchases: PurchasesPlugin = isNative
  ? (PurchasesReal as unknown as PurchasesPlugin)
  : Mocks.Purchases;

export const SplashScreen: SplashScreenPlugin = isNative
  ? (SplashScreenReal as unknown as SplashScreenPlugin)
  : Mocks.SplashScreen;

export const Keyboard: KeyboardPlugin = isNative
  ? (KeyboardReal as unknown as KeyboardPlugin)
  : Mocks.Keyboard;

export const StatusBar: StatusBarPlugin = isNative
  ? (StatusBarReal as unknown as StatusBarPlugin)
  : Mocks.StatusBar;

export const Browser: BrowserPlugin = isNative
  ? (BrowserReal as unknown as BrowserPlugin)
  : Mocks.Browser;
