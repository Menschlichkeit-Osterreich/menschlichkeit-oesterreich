import React from 'react';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QUICK_LINKS = [
  { label: 'Über uns', href: '/ueber-uns', emoji: '🤝' },
  { label: 'Mitglied werden', href: '/mitglied-werden', emoji: '✨' },
  { label: 'Spenden', href: '/spenden', emoji: '💙' },
  { label: 'Veranstaltungen', href: '/veranstaltungen', emoji: '📅' },
  { label: 'Bildung', href: '/bildung', emoji: '📚' },
  { label: 'Kontakt', href: '/kontakt', emoji: '📬' },
];

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-semantic-background flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Illustration */}
        <div className="text-8xl mb-6 select-none" aria-hidden="true">🗺️</div>

        {/* Error Code */}
        <div className="text-6xl font-black text-primary-200 mb-2 tracking-tight">404</div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-secondary-900 mb-3">
          Diese Seite existiert nicht
        </h1>
        <p className="text-secondary-500 mb-8 max-w-sm mx-auto">
          Die gesuchte Seite wurde möglicherweise verschoben, umbenannt oder existiert nicht mehr.
          Vielleicht hilft Ihnen einer der folgenden Links weiter.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 bg-secondary-100 text-secondary-700 font-medium py-2.5 px-6 rounded-xl hover:bg-secondary-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 bg-primary-600 text-white font-medium py-2.5 px-6 rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Zur Startseite
          </a>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-secondary-200 p-6">
          <h2 className="text-sm font-semibold text-secondary-500 uppercase tracking-wide mb-4">
            Beliebte Seiten
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUICK_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-primary-50 text-secondary-700 hover:text-primary-700 transition-colors text-sm"
              >
                <span>{link.emoji}</span>
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Contact */}
        <p className="mt-8 text-sm text-secondary-400">
          Problem gemeldet werden?{' '}
          <a href="/kontakt" className="text-primary-600 hover:underline">
            Kontaktieren Sie uns
          </a>
        </p>
      </div>
    </div>
  );
}
