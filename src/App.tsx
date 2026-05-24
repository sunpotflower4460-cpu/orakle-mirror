// @ts-nocheck
// このファイルは Phase 4 で段階的に TS 化する。それまでは型チェックを無効化する。
import React from 'react';

/* ========================================================================
  【本番ビルド・App Store審査に向けた設定確認リスト】
  
  1. index.html の meta viewport の設定（セーフエリア・自動ズーム防止）
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no">

  2. capacitor.config.ts の必須プラグイン設定（キーボード・スクロール制御）
  import { CapacitorConfig } from '@capacitor/cli';
  const config: CapacitorConfig = {
    appId: 'com.yourcompany.oraclemirror',
    appName: 'Oracle Mirror',
    webDir: 'dist',
    plugins: {
      Keyboard: { resize: 'body', resizeOnFullScreen: true }, // ※有効にした場合、JS側のPadding補正は削除してください
      SplashScreen: { launchShowDuration: 2000, backgroundColor: '#fff1f2', showSpinner: false },
      StatusBar: { style: 'Dark', backgroundColor: '#fff1f2' }
    }
  };
  export default config;
  ========================================================================
*/

import { MainApp } from './MainApp';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
