import { Suspense, useEffect, useState } from 'react';
import AppRoutes from './AppRoutes';
import CookieConsent from './components/CookieConsent';
import ErrorBoundary from './components/ErrorBoundary';
import SkipLink from './components/SkipLink';
import { PrivacyCenter } from './components/privacy/PrivacyCenter';
import { migrateOldConsent } from './utils/consentStorage';

type PrivacyCenterTab = 'overview' | 'cookies' | 'requests' | 'settings';

export default function App() {
  const [isPrivacyCenterOpen, setIsPrivacyCenterOpen] = useState(false);
  const [privacyCenterTab, setPrivacyCenterTab] = useState<PrivacyCenterTab>('cookies');
  const [isConsentMigrationReady, setIsConsentMigrationReady] = useState(false);

  useEffect(() => {
    migrateOldConsent();
    setIsConsentMigrationReady(true);
  }, []);

  const openPrivacyCenter = (tab: PrivacyCenterTab = 'cookies') => {
    setPrivacyCenterTab(tab);
    setIsPrivacyCenterOpen(true);
  };

  return (
    <ErrorBoundary>
      <SkipLink />
      <Suspense
        fallback={<div className="min-h-[30vh] animate-pulse bg-neutral-100" aria-hidden="true" />}
      >
        <AppRoutes />
      </Suspense>
      {isConsentMigrationReady && (
        <CookieConsent onCustomize={() => openPrivacyCenter('cookies')} />
      )}
      {isPrivacyCenterOpen && (
        <PrivacyCenter
          isOpen={isPrivacyCenterOpen}
          onClose={() => setIsPrivacyCenterOpen(false)}
          initialTab={privacyCenterTab}
        />
      )}
    </ErrorBoundary>
  );
}
