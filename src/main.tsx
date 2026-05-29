import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { IS_PROD, assertProductionReady } from './lib/env';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

if (IS_PROD) {
  // 本番起動時の fail-fast ガード。
  // throw すると ErrorBoundary の外で発生するため白画面になるが、これは意図的。
  // 「開発者がビルド設定ミスを必ず気づく」ことを優先している。
  // Phase 6 完了 (RevenueCat 実装差し替え) まで Purchases.isMock === true のため、
  // 本番ビルドは intentionally ここで停止する（誤リリース防止）。
  assertProductionReady();
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
