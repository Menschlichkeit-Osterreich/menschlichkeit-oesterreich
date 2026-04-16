import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SeoHead from '../components/seo/SeoHead';

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
    <main id="main" className="flex min-h-screen flex-col items-center justify-center bg-semantic-background px-4 py-16">
      <SeoHead
        title="Seite nicht gefunden – Menschlichkeit Österreich"
        description="Diese Seite existiert nicht. Besuchen Sie unsere Startseite oder navigieren Sie zu einem unserer Angebote."
        noIndex={true}
      />
      <div className="max-w-lg w-full text-center">
        {/* Illustration */}
        <div className="text-8xl mb-6 select-none" aria-hidden="true">🗺️</div>

        {/* Error Code */}
        <div className="mb-2 text-6xl font-black tracking-tight text-primary-700">404</div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-secondary-900 mb-3">
          Diese Seite existiert nicht
        </h1>
        <p className="mx-auto mb-8 max-w-sm text-secondary-700">
          Die gesuchte Seite wurde möglicherweise verschoben, umbenannt oder existiert nicht mehr.
          Vielleicht hilft Ihnen einer der folgenden Links weiter.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 rounded-xl bg-secondary-100 px-6 py-2.5 font-medium text-secondary-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 hover:bg-secondary-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 hover:bg-primary-700"
          >
            <Home className="w-4 h-4" />
            Zur Startseite
          </Link>
        </div>

        {/* Quick Links */}
        <div className="rounded-2xl border border-secondary-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-700">
            Beliebte Seiten
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUICK_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-2 rounded-xl p-2.5 text-sm text-secondary-800 transition-colors hover:bg-primary-50 hover:text-primary-700"
              >
                <span>{link.emoji}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <p className="mt-8 text-sm text-secondary-700">
          Problem gemeldet werden?{' '}
          <Link to="/kontakt" className="text-primary-600 hover:underline">
            Kontaktieren Sie uns
          </Link>
        </p>
      </div>
    </main>
  );
}
