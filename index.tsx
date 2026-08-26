import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Ignore unhandled rejection errors originating from browser extensions (e.g. MetaMask, web3 injects)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || event.reason || '';
    if (
      typeof reason === 'string' &&
      (reason.toLowerCase().includes('metamask') ||
       reason.toLowerCase().includes('ethereum') ||
       reason.toLowerCase().includes('wallet'))
    ) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('[Extension Guard] Ignored external extension rejection:', reason);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    const src = event.filename || '';
    if (
      msg.toLowerCase().includes('metamask') ||
      src.includes('chrome-extension://') ||
      src.includes('moz-extension://')
    ) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('[Extension Guard] Ignored external extension error:', msg);
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Register PWA Service Worker in production/browser environment
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('[PWA] ServiceWorker registration skipped or failed:', err);
    });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);