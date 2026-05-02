import { useCallback, useEffect, useRef, useState } from 'react';
import {
  COOKIE_PREFERENCES_UPDATED_EVENT,
  loadConsentPreferences,
  saveConsentPreferences,
} from '../utils/consentStorage';

interface CookieConsentProps {
  onCustomize?: () => void;
}

export default function CookieConsent({ onCustomize }: CookieConsentProps) {
  const [visible, setVisible] = useState(false);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const syncVisibility = useCallback(() => {
    setVisible(loadConsentPreferences() === null);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(syncVisibility, 1000);
    const handlePreferencesUpdated = () => syncVisibility();

    window.addEventListener(COOKIE_PREFERENCES_UPDATED_EVENT, handlePreferencesUpdated);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(COOKIE_PREFERENCES_UPDATED_EVENT, handlePreferencesUpdated);
    };
  }, [syncVisibility]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => acceptButtonRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(frame);
      previousFocusRef.current?.focus();
    };
  }, [visible]);

  function acceptAll() {
    saveConsentPreferences({
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true,
      socialMedia: true,
    });
    setVisible(false);
  }

  function acceptEssentialOnly() {
    saveConsentPreferences({
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false,
      socialMedia: false,
    });
    setVisible(false);
  }

  function customizePreferences() {
    if (!onCustomize) {
      return;
    }

    setVisible(false);
    onCustomize();
  }

  if (!visible) return null;

  return (
    <section
      data-testid="cookie-consent-banner"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
      role="region"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      aria-live="polite"
    >
      <div className="mx-auto max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h2 id="cookie-consent-title" className="font-semibold text-gray-900 text-sm mb-1">
              Datenschutz & Cookies
            </h2>
            <p id="cookie-consent-description" className="text-xs text-gray-600 leading-relaxed">
              Aktuell verwenden wir nur technisch notwendige Cookies für Sicherheit, Login und
              Sitzungsverwaltung. Analyse-, Marketing- und Social-Media-Cookies sind standardmäßig
              deaktiviert. Details in unserer{' '}
              <a href="/datenschutz" className="text-red-600 hover:underline">
                Datenschutzerklärung
              </a>
              .
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={acceptEssentialOnly}
              className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Nur notwendige
            </button>
            <button
              type="button"
              onClick={customizePreferences}
              className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Anpassen
            </button>
            <button
              ref={acceptButtonRef}
              type="button"
              onClick={acceptAll}
              className="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Alle akzeptieren
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
