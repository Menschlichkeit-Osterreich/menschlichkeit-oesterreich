import { Suspense } from 'react';
import AppRoutes from './AppRoutes';
import CookieConsent from './components/CookieConsent';
import ErrorBoundary from './components/ErrorBoundary';
import SkipLink from './components/SkipLink';

export default function App() {
  return (
    <ErrorBoundary>
      <SkipLink />
      <Suspense
        fallback={<div className="min-h-[30vh] animate-pulse bg-neutral-100" aria-hidden="true" />}
      >
        <AppRoutes />
      </Suspense>
      <CookieConsent />
    </ErrorBoundary>
  );
}
