import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App';
import { IS_PROD, assertProductionReady } from './lib/env';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

if (IS_PROD) {
  try {
    assertProductionReady();
  } catch (error) {
    if (Capacitor.isNativePlatform()) {
      throw error;
    }

    // eslint-disable-next-line no-console
    console.error(error);
  }
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
