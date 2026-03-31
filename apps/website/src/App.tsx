import React from 'react';
import SkipLink from './components/SkipLink';
import ErrorBoundary from './components/ErrorBoundary';
import CookieConsent from './components/CookieConsent';
import AppRoutes from './AppRoutes';

export default function App() {
  return (
    <ErrorBoundary>
      <SkipLink />
      <AppRoutes />
      <CookieConsent />
    </ErrorBoundary>
  );
}
