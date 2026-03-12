import React, { useState, useEffect } from 'react';

const CONSENT_KEY = 'moe_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

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
    <div
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
      role="dialog"
      aria-label="Cookie-Einwilligung"
    >
      <div className="mx-auto max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-sm mb-1">Datenschutz & Cookies</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Diese Website verwendet nur technisch notwendige Cookies. Es werden keine
              Tracking- oder Marketing-Cookies eingesetzt. Details in unserer{' '}
              <a href="/datenschutz" className="text-red-600 hover:underline">
                Datenschutzerklärung
              </a>.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={reject}
              className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ablehnen
            </button>
            <button
              onClick={accept}
              className="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Verstanden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
