import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import JsonLdOrganization from '../components/seo/JsonLdOrganization';
import JsonLdWebsite from '../components/seo/JsonLdWebsite';
import { CONTACT_EMAIL, LEGAL_DOCS, LEGAL_FACTS, WHATSAPP_URL } from '../config/siteConfig';

export default function PublicLayout() {
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <JsonLdOrganization />
      <JsonLdWebsite />
      <main className="flex-1" id="main">
        <Outlet />
      </main>
      <footer className="mt-auto bg-secondary-900 text-secondary-200" role="contentinfo" aria-label="Seitenfooter">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Brand column */}
            <div>
              <Link to="/" className="flex items-center gap-3 mb-4 group w-fit">
                <img
                  src="/logo.jpg"
                  alt="Menschlichkeit Österreich Logo"
                  width={960}
                  height={960}
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-secondary-700 group-hover:ring-primary-500 transition-all"
                />
                <div>
                  <span className="block text-xs uppercase tracking-wider text-secondary-300">Verein</span>
                  <span className="block font-bold text-white group-hover:text-primary-400 transition-colors">
                    Menschlichkeit Österreich
                  </span>
                </div>
              </Link>
              <p className="mb-3 text-sm leading-relaxed text-secondary-200">
                Initiative für soziale Gerechtigkeit, demokratische Teilhabe und ökologische Verantwortung in Österreich.
              </p>
              <p className="text-xs text-secondary-300">
                <Link to="/transparenz" className="transition-colors hover:text-white">ZVR: {LEGAL_FACTS.zvr}</Link> · Gegründet: {LEGAL_FACTS.foundingDateLabel}
              </p>
            </div>

            {/* Navigation column */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-secondary-200">Navigation</h3>
              <nav className="flex flex-col gap-2.5" aria-label="Footer-Navigation">
                {[
                  { to: '/mitglied-werden', label: 'Mitglied werden' },
                  { to: '/spenden', label: 'Spenden' },
                  { to: '/themen', label: 'Themen' },
                  { to: '/veranstaltungen', label: 'Veranstaltungen' },
                  { to: '/bildung', label: 'Bildung' },
                  { to: '/blog', label: 'Neuigkeiten' },
                  { to: '/forum', label: 'Forum' },
                  { to: '/ueber-uns', label: 'Über uns' },
                  { to: '/team', label: 'Team' },
                  { to: '/transparenz', label: 'Transparenz' },
                  { to: '/presse', label: 'Presse' },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="w-fit text-sm text-secondary-200 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Legal & Contact column */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-secondary-200">Rechtliches &amp; Kontakt</h3>
              <nav className="flex flex-col gap-2.5 mb-5" aria-label="Rechtliche Links">
                {[
                  { to: '/datenschutz', label: 'Datenschutz' },
                  { to: '/impressum', label: 'Impressum' },
                  { to: '/kontakt', label: 'Kontakt' },
                  { to: '/statuten', label: 'Statuten' },
                  { to: '/beitragsordnung', label: 'Beitragsordnung' },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="w-fit text-sm text-secondary-200 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div>
                <p className="mb-0.5 text-xs text-secondary-300">Pottenbrunner Hauptstraße 108/Top 1</p>
                <p className="mb-3 text-xs text-secondary-300">3140 Pottenbrunn</p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="break-all text-sm text-primary-300 transition-colors hover:text-primary-200"
                >
                  {CONTACT_EMAIL}
                </a>
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-secondary-200 transition-colors hover:text-white">
                    WhatsApp kontaktieren
                  </a>
                  <a href={LEGAL_DOCS.statutes.href} target="_blank" rel="noopener noreferrer" className="text-secondary-200 transition-colors hover:text-white">
                    {LEGAL_DOCS.statutes.label}
                  </a>
                  <a href={LEGAL_DOCS.registerExcerpt.href} target="_blank" rel="noopener noreferrer" className="text-secondary-200 transition-colors hover:text-white">
                    {LEGAL_DOCS.registerExcerpt.label}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-secondary-800 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-secondary-300">
              © {year} Verein Menschlichkeit Österreich. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
              <span className="text-xs text-secondary-200">DSGVO-konform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
