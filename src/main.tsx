import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Guard against benign iframe/browser environment noise (e.g. ResizeObserver loop notifications)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (
      e.message &&
      (e.message.includes('ResizeObserver') ||
        e.message.includes('Script error.') ||
        e.message.includes('setPointerCapture'))
    ) {
      e.stopImmediatePropagation();
    }
  });

  window.addEventListener('unhandledrejection', (e) => {
    if (
      e.reason &&
      (e.reason.name === 'NotAllowedError' ||
        e.reason.message?.includes('fullscreen') ||
        e.reason.message?.includes('AudioContext') ||
        e.reason.message?.includes('clipboard'))
    ) {
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
