import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { IS_PROD, assertProductionReady } from './lib/env';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

if (IS_PROD) {
  assertProductionReady();
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
