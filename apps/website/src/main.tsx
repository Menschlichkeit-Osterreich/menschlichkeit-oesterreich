import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import CookieConsent from './components/CookieConsent';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

const app = (
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <App />
          <CookieConsent />
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);

// Use hydrateRoot when the root element already has SSG/SSR content,
// otherwise fall back to createRoot for a clean CSR mount.
if (root.innerHTML.trim() !== '') {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
