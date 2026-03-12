import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function PublicLayout() {
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <div className="flex-1" role="main" id="main">
        <Outlet />
      </div>
      <footer className="bg-secondary-900 text-secondary-300 mt-auto" role="contentinfo" aria-label="Seitenfooter">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Brand column */}
            <div>
              <Link to="/" className="flex items-center gap-3 mb-4 group w-fit">
                <img
                  src="/logo.jpg"
                  alt="Menschlichkeit Österreich Logo"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-secondary-700 group-hover:ring-primary-500 transition-all"
                />
                <div>
                  <span className="block text-xs text-secondary-500 uppercase tracking-wider">Verein</span>
                  <span className="block font-bold text-white group-hover:text-primary-400 transition-colors">
                    Menschlichkeit Österreich
                  </span>
                </div>
              </Link>
              <p className="text-sm text-secondary-400 leading-relaxed mb-3">
                Initiative für soziale Gerechtigkeit, demokratische Teilhabe und ökologische Verantwortung in Österreich.
              </p>
              <p className="text-xs text-secondary-500">
                ZVR: 1182213083 · Gegründet: 28. Mai 2025
              </p>
            </div>

            {/* Navigation column */}
            <div>
              <h3 className="text-xs font-semibold text-secondary-400 uppercase tracking-widest mb-4">Navigation</h3>
              <nav className="flex flex-col gap-2.5" aria-label="Footer-Navigation">
                {[
                  { to: '/mitglied-werden', label: 'Mitglied werden' },
                  { to: '/spenden', label: 'Spenden' },
                  { to: '/statuten', label: 'Statuten' },
                  { to: '/beitragsordnung', label: 'Beitragsordnung' },
                  { to: '/ueber-uns', label: 'Über uns' },
                  { to: '/veranstaltungen', label: 'Veranstaltungen' },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="text-sm text-secondary-400 hover:text-white transition-colors w-fit"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Legal & Contact column */}
            <div>
              <h3 className="text-xs font-semibold text-secondary-400 uppercase tracking-widest mb-4">Rechtliches &amp; Kontakt</h3>
              <nav className="flex flex-col gap-2.5 mb-5" aria-label="Rechtliche Links">
                {[
                  { to: '/account/privacy', label: 'Datenschutz (DSGVO)' },
                  { to: '/impressum', label: 'Impressum' },
                  { to: '/kontakt', label: 'Kontakt' },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="text-sm text-secondary-400 hover:text-white transition-colors w-fit"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div>
                <p className="text-xs text-secondary-500 mb-0.5">Pottenbrunner Hauptstraße 108/Top 1</p>
                <p className="text-xs text-secondary-500 mb-3">3140 Pottenbrunn</p>
                <a
                  href="mailto:kontakt@menschlichkeit-oesterreich.at"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors break-all"
                >
                  kontakt@menschlichkeit-oesterreich.at
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-secondary-800 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-secondary-500">
              © {year} Verein Menschlichkeit Österreich. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
              <span className="text-xs text-secondary-500">DSGVO-konform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
