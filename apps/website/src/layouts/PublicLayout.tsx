import { Link, Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import JsonLdOrganization from '../components/seo/JsonLdOrganization';
import JsonLdWebsite from '../components/seo/JsonLdWebsite';
import {
  CONTACT_EMAIL,
  LEGAL_DOCS,
  LEGAL_FACTS,
  POSTAL_ADDRESS,
  WHATSAPP_URL,
} from '../config/siteConfig';
import { requestPrivacyCenter } from '../utils/consentStorage';

const footerLinkClass =
  'w-fit text-[15px] text-ink-on-dark transition-colors hover:text-white hover:underline hover:underline-offset-4';

const columnHeadingClass =
  'mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-on-dark-muted';

const NAVIGATION_LINKS = [
  { to: '/mitglied-werden', label: 'Mitglied werden' },
  { to: '/spenden', label: 'Spenden' },
  { to: '/themen', label: 'Themen' },
  { to: '/veranstaltungen', label: 'Veranstaltungen' },
  { to: '/bildung', label: 'Bildung' },
  { to: '/blog', label: 'Neuigkeiten' },
  { to: '/forum', label: 'Forum' },
];

const ORGANISATION_LINKS = [
  { to: '/ueber-uns', label: 'Über uns' },
  { to: '/team', label: 'Team' },
  { to: '/transparenz', label: 'Transparenz' },
  { to: '/presse', label: 'Presse' },
  { to: '/kontakt', label: 'Kontakt' },
];

const LEGAL_LINKS = [
  { to: '/datenschutz', label: 'Datenschutz' },
  { to: '/impressum', label: 'Impressum' },
  { to: '/statuten', label: 'Statuten' },
  { to: '/beitragsordnung', label: 'Beitragsordnung' },
];

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
      <footer
        className="mt-auto bg-ink-surface text-ink-on-dark"
        role="contentinfo"
        aria-label="Seitenfooter"
      >
        <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-10">
          <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
            {/* Verein */}
            <div>
              <Link to="/" className="mb-5 flex w-fit items-center gap-3">
                <img
                  src="/logo.jpg"
                  alt="Menschlichkeit Österreich Logo"
                  width={960}
                  height={960}
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-10 object-cover"
                />
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-on-dark-muted">
                    Verein
                  </span>
                  <span className="block font-heading text-[17px] font-semibold text-white">
                    Menschlichkeit Österreich
                  </span>
                </span>
              </Link>
              <p className="mb-4 max-w-[38ch] text-[15px] leading-relaxed text-ink-on-dark">
                Initiative für soziale Gerechtigkeit, demokratische Teilhabe und ökologische
                Verantwortung in Österreich.
              </p>
              <address className="not-italic text-[15px] leading-relaxed text-ink-on-dark-muted">
                {POSTAL_ADDRESS.streetAddress}
                <br />
                {POSTAL_ADDRESS.postalCode} {POSTAL_ADDRESS.addressLocality}
              </address>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-3 inline-block break-all text-[15px] font-semibold text-primary-300 transition-colors hover:text-white"
              >
                {CONTACT_EMAIL}
              </a>
            </div>

            {/* Navigation */}
            <div>
              <h3 className={columnHeadingClass}>Navigation</h3>
              <nav className="flex flex-col gap-2.5" aria-label="Footer-Navigation">
                {NAVIGATION_LINKS.map((l) => (
                  <Link key={l.to} to={l.to} className={footerLinkClass}>
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Verein & Transparenz */}
            <div>
              <h3 className={columnHeadingClass}>Verein</h3>
              <nav className="flex flex-col gap-2.5" aria-label="Vereinsinformationen">
                {ORGANISATION_LINKS.map((l) => (
                  <Link key={l.to} to={l.to} className={footerLinkClass}>
                    {l.label}
                  </Link>
                ))}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClass}
                >
                  WhatsApp kontaktieren
                </a>
              </nav>
            </div>

            {/* Rechtliches */}
            <div>
              <h3 className={columnHeadingClass}>Rechtliches</h3>
              <nav className="flex flex-col gap-2.5" aria-label="Rechtliche Links">
                {LEGAL_LINKS.map((l) => (
                  <Link key={l.to} to={l.to} className={footerLinkClass}>
                    {l.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={requestPrivacyCenter}
                  className={`${footerLinkClass} text-left`}
                >
                  Cookie-Einstellungen
                </button>
                <a
                  href={LEGAL_DOCS.statutes.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClass}
                >
                  {LEGAL_DOCS.statutes.label}
                </a>
                <a
                  href={LEGAL_DOCS.registerExcerpt.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClass}
                >
                  {LEGAL_DOCS.registerExcerpt.label}
                </a>
              </nav>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-ink-on-dark-muted">
              © {year} Verein Menschlichkeit Österreich · Alle Rechte vorbehalten
            </p>
            <p className="text-[13px] text-ink-on-dark-muted">
              <Link to="/transparenz" className="transition-colors hover:text-white">
                ZVR {LEGAL_FACTS.zvr}
              </Link>{' '}
              · Gegründet {LEGAL_FACTS.foundingDateLabel} · {LEGAL_FACTS.seat}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
