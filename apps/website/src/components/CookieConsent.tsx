import { useCallback, useEffect, useRef, useState } from 'react';
import {
  COOKIE_PREFERENCES_UPDATED_EVENT,
  loadConsentPreferences,
  saveConsentPreferences,
} from '../utils/consentStorage';

interface CookieConsentProps {
  onCustomize?: () => void;
}

const actionBase =
  'w-full rounded-sm px-4 py-4 text-base font-semibold transition-colors duration-150';

export default function CookieConsent({ onCustomize }: CookieConsentProps) {
  const [visible, setVisible] = useState(() => loadConsentPreferences() === null);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const syncVisibility = useCallback(() => {
    setVisible(loadConsentPreferences() === null);
  }, []);

  useEffect(() => {
    const handlePreferencesUpdated = () => syncVisibility();

    window.addEventListener(COOKIE_PREFERENCES_UPDATED_EVENT, handlePreferencesUpdated);

    return () => {
      window.removeEventListener(COOKIE_PREFERENCES_UPDATED_EVENT, handlePreferencesUpdated);
    };
  }, [syncVisibility]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => firstActionRef.current?.focus());

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
      className="fixed bottom-0 inset-x-0 z-50 max-h-[85dvh] overflow-y-auto overscroll-contain border-t-[3px] border-ink-surface bg-white"
      role="region"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      aria-live="polite"
    >
      <div className="mx-auto grid max-w-[1280px] gap-6 px-5 py-6 sm:px-7 lg:grid-cols-[1fr_300px] lg:gap-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Datenschutz
          </p>
          <h2
            id="cookie-consent-title"
            className="mt-2 font-heading text-2xl font-semibold text-ink-deep"
          >
            Wir setzen nur notwendige Cookies
          </h2>
          <p
            id="cookie-consent-description"
            className="mt-3 max-w-[62ch] text-base leading-relaxed text-ink-body"
          >
            Für Sicherheit, Anmeldung und Sitzungsverwaltung brauchen wir technisch notwendige
            Cookies. Analyse-, Marketing- und Social-Media-Cookies sind standardmäßig deaktiviert.
            Was wir speichern, steht in der{' '}
            <a
              href="/datenschutz"
              className="font-semibold text-primary-600 underline underline-offset-4 hover:text-primary-700"
            >
              Datenschutzerklärung
            </a>
            .
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <button
            ref={firstActionRef}
            type="button"
            onClick={acceptEssentialOnly}
            className={`${actionBase} bg-ink-deep text-paper hover:bg-ink-surface`}
          >
            Nur notwendige
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className={`${actionBase} bg-primary-600 text-white hover:bg-primary-700`}
          >
            Alle akzeptieren
          </button>
          <button
            type="button"
            onClick={customizePreferences}
            className={`${actionBase} border border-ink-deep bg-white text-ink-deep hover:bg-paper`}
          >
            Einstellungen
          </button>
        </div>
      </div>
    </section>
  );
}
