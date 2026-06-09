import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { StoreProvider } from './store';
import { ReaderProvider } from './reader-context';
import { AlertsProvider } from './alerts';
import './index.css';

// Register PWA service worker (only in production build to avoid HMR conflicts).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <AlertsProvider>
          <ReaderProvider>
            <App />
          </ReaderProvider>
        </AlertsProvider>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
