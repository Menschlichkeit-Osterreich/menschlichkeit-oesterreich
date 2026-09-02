import { Link, useNavigate } from 'react-router-dom';
import SeoHead from '../components/seo/SeoHead';
import { CONTACT_EMAIL } from '../config/siteConfig';

const QUICK_LINKS = [
  {
    number: '01',
    label: 'Mitglied werden',
    href: '/mitglied-werden',
    description: 'Beitrittsantrag stellen, ab 18 € im Jahr.',
  },
  {
    number: '02',
    label: 'Spenden',
    href: '/spenden',
    description: 'Einmalig oder monatlich, ohne Registrierung.',
  },
  {
    number: '03',
    label: 'Veranstaltungen',
    href: '/veranstaltungen',
    description: 'Termine, Workshops und offene Treffen.',
  },
  {
    number: '04',
    label: 'Transparenz',
    href: '/transparenz',
    description: 'Statuten, Beitragsordnung und Registerauszug.',
  },
];

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main id="main" className="bg-white">
      <SeoHead
        title="Seite nicht gefunden – Menschlichkeit Österreich"
        description="Diese Seite existiert nicht. Besuchen Sie unsere Startseite oder navigieren Sie zu einem unserer Angebote."
        noIndex={true}
      />
      <div className="mx-auto grid max-w-[1080px] gap-12 px-5 pb-24 pt-16 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-[72px] lg:pt-[88px]">
        <div>
          <p className="font-mono text-[15px] font-medium uppercase tracking-[0.2em] text-primary-600">
            Fehler 404
          </p>
          <h1 className="mt-5 font-heading text-[40px] font-bold leading-[1.05] tracking-[-0.03em] text-ink-deep sm:text-[56px]">
            Diese Seite gibt es nicht.
          </h1>
          <p className="mt-5 max-w-[52ch] text-[19px] leading-relaxed text-ink-body">
            Vielleicht wurde sie verschoben, umbenannt oder ist nie erschienen. Von hier aus kommen
            Sie zurück auf einen bekannten Weg.
          </p>

          <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
            <Link
              to="/"
              className="inline-flex min-h-[52px] items-center justify-center rounded-sm bg-primary-600 px-6 text-base font-semibold text-white transition-colors duration-150 hover:bg-primary-700"
            >
              Zur Startseite
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex min-h-[52px] items-center justify-center rounded-sm border border-ink-deep bg-white px-6 text-base font-semibold text-ink-deep transition-colors duration-150 hover:bg-paper"
            >
              Eine Seite zurück
            </button>
          </div>

          <p className="mt-10 border-t border-paper-rule pt-6 text-base leading-relaxed text-ink-body">
            Falls der Link von uns kam, ist das unser Fehler. Schreiben Sie kurz an{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-primary-600 underline underline-offset-4 hover:text-primary-700"
            >
              {CONTACT_EMAIL}
            </a>{' '}
            — dann räumen wir ihn weg.
          </p>
        </div>

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            Häufig gesucht
          </h2>
          <ul className="hairline-grid mt-4 border border-paper-rule">
            {QUICK_LINKS.map((link) => (
              <li key={link.href} className="bg-white">
                <Link
                  to={link.href}
                  className="block px-6 py-5 transition-colors duration-150 hover:bg-paper"
                >
                  <span className="block font-mono text-[13px] text-ink-muted">{link.number}</span>
                  <span className="mt-1.5 block font-heading text-[17px] font-semibold text-ink-deep">
                    {link.label}
                  </span>
                  <span className="mt-1 block text-[15px] leading-relaxed text-ink-body">
                    {link.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
