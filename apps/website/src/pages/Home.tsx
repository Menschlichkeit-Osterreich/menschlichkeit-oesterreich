import { Link } from 'react-router-dom';
import SeoHead from '../components/seo/SeoHead';
import { CONTACT_EMAIL, LEGAL_DOCS, LEGAL_FACTS } from '../config/siteConfig';

interface HomePageProps {
  /** Transparenz-Streifen ausblenden, sobald die Startseite genug eigene Belege trägt. */
  showProofStrip?: boolean;
}

const WORK_AREAS = [
  {
    number: '01',
    title: 'Politische Bildung',
    description:
      'Workshops und Materialien, die erklären, wie Entscheidungen in Österreich zustande kommen — verständlich, überprüfbar und ohne Parteibuch.',
    linkLabel: 'Zu den Bildungsangeboten',
    to: '/bildung',
  },
  {
    number: '02',
    title: 'Veranstaltungen',
    description:
      'Offene Treffen, Diskussionsabende und Beteiligungsformate. Wer kommt, muss weder Mitglied sein noch etwas bezahlen.',
    linkLabel: 'Termine ansehen',
    to: '/veranstaltungen',
  },
  {
    number: '03',
    title: 'Demokratie spielbar',
    description:
      'Ein Browserspiel, in dem demokratische Aushandlung geübt wird: zuhören, vermitteln, entscheiden — unter Zeitdruck.',
    linkLabel: 'Spiel starten',
    to: '/spiel',
  },
];

export default function HomePage({ showProofStrip = true }: HomePageProps) {
  const proofDocs = [
    { label: LEGAL_DOCS.statutes.label, meta: `Beschlossen ${LEGAL_FACTS.statutesResolutionLabel}`, href: LEGAL_DOCS.statutes.href },
    {
      label: LEGAL_DOCS.contributionRules.label,
      meta: `Gültig ab ${LEGAL_FACTS.contributionOrderEffectiveLabel}`,
      href: LEGAL_DOCS.contributionRules.href,
    },
    { label: LEGAL_DOCS.registerExcerpt.label, meta: 'LPD Niederösterreich', href: LEGAL_DOCS.registerExcerpt.href },
  ];

  return (
    <div data-component="Home">
      <SeoHead
        title="Menschlichkeit Österreich – Verein für Demokratie &amp; Menschenrechte"
        description="Verein zur Förderung von Demokratie, Menschenrechten und Zivilgesellschaft in Österreich. Jetzt Mitglied werden, spenden oder unsere Vereinsdokumente einsehen."
        canonical="https://www.menschlichkeit-oesterreich.at/"
      />

      {/* Hero */}
      <section className="bg-ink-surface" aria-label="Einstieg" data-component="Hero">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-16 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-[72px] lg:py-24">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-primary-300">
              Gemeinnütziger Verein · ZVR {LEGAL_FACTS.zvr}
            </p>
            <h1
              className="mt-6 font-heading text-[38px] font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-[52px] lg:text-[66px] lg:leading-[1.02]"
              data-testid="hero.title"
            >
              Ein Österreich, das niemanden zurücklässt.
            </h1>
            <p
              className="mt-6 max-w-[620px] text-[19px] leading-relaxed text-ink-on-dark sm:text-[21px]"
              data-testid="hero.lead"
            >
              Wir machen politische Bildung greifbar, bringen Menschen ins Gespräch und halten
              offen, wie wir arbeiten und wofür wir Geld ausgeben.
            </p>

            <div
              className="mt-9 flex flex-col gap-3.5 sm:flex-row"
              role="group"
              aria-label="Wichtige Aktionen"
            >
              <Link
                to="/mitglied-werden"
                className="inline-flex min-h-[52px] items-center justify-center rounded-sm bg-primary-600 px-6 text-base font-semibold text-white transition-colors duration-150 hover:bg-primary-700"
                data-testid="cta.join"
              >
                Mitglied werden — ab 18 € im Jahr
              </Link>
              <Link
                to="/spenden"
                className="on-dark inline-flex min-h-[52px] items-center justify-center rounded-sm border border-[rgba(247,244,241,0.55)] px-6 text-base font-semibold text-paper transition-colors duration-150 hover:border-paper hover:bg-white/10"
                data-testid="cta.donate"
              >
                Einmalig spenden
              </Link>
            </div>

            <ul className="mt-10 flex flex-col gap-3 border-t border-[rgba(247,244,241,0.2)] pt-6 text-[15px] text-ink-on-dark-muted sm:flex-row sm:gap-10">
              <li>Gegründet {LEGAL_FACTS.foundingDateLabel}</li>
              <li>Sitz {LEGAL_FACTS.seat}</li>
              <li>Statuten und Beitragsordnung öffentlich</li>
            </ul>
          </div>

          <div className="flex items-start">
            <div className="aspect-[4/5] w-full border border-[rgba(247,244,241,0.3)]">
              <img
                src="/logo.jpg"
                alt="Verein Menschlichkeit Österreich"
                width={960}
                height={960}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Woran wir arbeiten */}
      <section
        className="border-b border-paper-rule bg-white"
        aria-labelledby="topics-title"
        data-component="CardGrid"
      >
        <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-10 lg:py-20">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Unsere Arbeit
              </p>
              <h2
                id="topics-title"
                className="mt-2 font-heading text-[32px] font-bold tracking-[-0.02em] text-ink-deep sm:text-[42px]"
              >
                Woran wir arbeiten
              </h2>
            </div>
            <Link
              to="/themen"
              className="w-fit text-[15px] font-semibold text-primary-600 underline underline-offset-4 transition-colors hover:text-primary-700"
            >
              Alle Themen ansehen →
            </Link>
          </div>

          <div className="hairline-grid border border-paper-rule md:grid-cols-3">
            {WORK_AREAS.map((area) => (
              <article
                key={area.number}
                className="bg-white p-8 sm:p-10"
                data-testid={`topic.${area.title}`}
              >
                <p className="font-mono text-[13px] text-ink-muted">{area.number}</p>
                <h3 className="mt-3 font-heading text-[22px] font-semibold text-ink-deep sm:text-[26px]">
                  {area.title}
                </h3>
                <p className="mt-3 text-base leading-[1.65] text-ink-body">{area.description}</p>
                <Link
                  to={area.to}
                  className="mt-5 inline-block text-[15px] font-semibold text-primary-600 underline underline-offset-4 transition-colors hover:text-primary-700"
                >
                  {area.linkLabel}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Transparenz-Streifen */}
      {showProofStrip && (
        <section className="border-b border-paper-rule bg-paper" aria-labelledby="trust-title">
          <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-20">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Transparenz
              </p>
              <h2
                id="trust-title"
                className="mt-2 font-heading text-[28px] font-bold tracking-[-0.02em] text-ink-deep sm:text-[34px]"
              >
                Nachlesbar statt behauptet
              </h2>
              <p className="mt-4 max-w-[46ch] text-base leading-[1.65] text-ink-body">
                Statuten, Beitragsordnung und Registerauszug liegen offen. Wer wissen will, wie der
                Verein verfasst ist und was ein Beitrag kostet, muss niemanden fragen.
              </p>
              <p className="mt-4 text-base text-ink-body">
                Fragen?{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-semibold text-primary-600 underline underline-offset-4 hover:text-primary-700"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>

            <div className="hairline-grid border border-paper-rule sm:grid-cols-2">
              {proofDocs.map((doc) => (
                <a
                  key={doc.href}
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-6 transition-colors duration-150 hover:bg-paper"
                >
                  <span className="block font-heading text-[17px] font-semibold text-ink-deep">
                    {doc.label}
                  </span>
                  <span className="mt-1 block text-[15px] text-ink-muted">{doc.meta}</span>
                </a>
              ))}
              <Link
                to="/datenschutz"
                className="bg-white p-6 transition-colors duration-150 hover:bg-paper"
                data-testid="link.privacy"
              >
                <span className="block font-heading text-[17px] font-semibold text-ink-deep">
                  Datenschutzerklärung
                </span>
                <span className="mt-1 block text-[15px] text-ink-muted">
                  Betroffenenrechte nach DSGVO
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-ink-deep" aria-labelledby="join-title">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-10">
          <h2 id="join-title" className="sr-only">
            Mitmachen und unterstützen
          </h2>
          <div className="grid border-x border-[rgba(247,244,241,0.2)] md:grid-cols-2">
            <div className="border-b border-[rgba(247,244,241,0.2)] p-8 sm:p-12 md:border-b-0 md:border-r">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-300">
                Mitgliedschaft
              </p>
              <h3 className="mt-3 font-heading text-[26px] font-semibold text-white sm:text-[30px]">
                Mitglied werden
              </h3>
              <p className="mt-3 max-w-[42ch] text-base leading-[1.65] text-ink-on-dark">
                36 € im Jahr, 18 € ermäßigt, 0 € auf begründeten Antrag. Mitglieder entscheiden in
                der Generalversammlung mit.
              </p>
              <Link
                to="/mitglied-werden"
                className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-sm bg-primary-600 px-6 text-base font-semibold text-white transition-colors duration-150 hover:bg-primary-700"
              >
                Beitritt starten
              </Link>
            </div>

            <div className="p-8 sm:p-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-300">
                Spende
              </p>
              <h3 className="mt-3 font-heading text-[26px] font-semibold text-white sm:text-[30px]">
                Einmalig oder monatlich spenden
              </h3>
              <p className="mt-3 max-w-[42ch] text-base leading-[1.65] text-ink-on-dark">
                Drei Eingaben, keine Registrierung. Der Betrag lässt sich jederzeit ändern oder
                beenden.
              </p>
              <Link
                to="/spenden"
                className="on-dark mt-6 inline-flex min-h-[52px] items-center justify-center rounded-sm border border-[rgba(247,244,241,0.55)] px-6 text-base font-semibold text-paper transition-colors duration-150 hover:border-paper hover:bg-white/10"
              >
                Zur Spende
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
