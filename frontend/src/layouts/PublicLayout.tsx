import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function PublicLayout() {
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen flex flex-col bg-semantic-background">
      <NavBar />
      <div className="flex-1" role="main" id="main">
        <Outlet />
      </div>
      <footer className="border-t bg-white mt-auto" role="contentinfo" aria-label="Seitenfooter">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Brand + Tagline */}
            <div>
              <Link to="/" className="flex items-center gap-2 font-bold text-primary-700 hover:text-primary-800 mb-1">
                <span aria-hidden="true">🤝</span> Menschlichkeit Österreich
              </Link>
              <p className="text-xs text-secondary-500">
                Verein für soziale Gerechtigkeit und demokratische Teilhabe
              </p>
              <p className="text-xs text-secondary-400 mt-1">
                ZVR: 1182213083 · Gegründet: 28. Mai 2025
              </p>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Footer-Navigation">
              <Link to="/mitglied-werden" className="text-secondary-600 hover:text-primary-700 transition-colors">
                Mitglied werden
              </Link>
              <Link to="/spenden" className="text-secondary-600 hover:text-primary-700 transition-colors">
                Spenden
              </Link>
              <Link to="/statuten" className="text-secondary-600 hover:text-primary-700 transition-colors">
                Statuten
              </Link>
              <Link to="/beitragsordnung" className="text-secondary-600 hover:text-primary-700 transition-colors">
                Beitragsordnung
              </Link>
              <Link to="/account/privacy" className="text-secondary-600 hover:text-primary-700 transition-colors">
                Datenschutz (DSGVO)
              </Link>
            </nav>
          </div>

          <div className="border-t border-secondary-100 mt-4 pt-4 text-xs text-secondary-400 text-center md:text-left">
            © {year} Menschlichkeit Österreich · Pottenbrunner Hauptstraße 108/1, 3140 St. Pölten ·{' '}
            <a
              href="mailto:menschlichkeit-oesterreich@outlook.at"
              className="hover:text-primary-600 transition-colors"
            >
              menschlichkeit-oesterreich@outlook.at
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
