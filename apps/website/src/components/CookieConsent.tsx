import React, { useEffect, useRef, useState } from 'react';

const CONSENT_KEY = 'moe_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

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

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  }

  function reject() {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <section
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
              onClick={reject}
              className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Nur notwendige Cookies
            </button>
            <button
              ref={acceptButtonRef}
              type="button"
              onClick={accept}
              className="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Verstanden
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
