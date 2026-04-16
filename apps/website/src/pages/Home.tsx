import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import SeoHead from '../components/seo/SeoHead';
import { CONTACT_EMAIL, LEGAL_DOCS, LEGAL_FACTS, WHATSAPP_URL } from '../config/siteConfig';

const topics = [
  {
    title: 'Solidarität',
    icon: '🤝',
    color: 'bg-secondary-50 border-secondary-100',
    iconBg: 'bg-secondary-100',
    description:
      'Zusammenhalt statt Spaltung – wir stehen füreinander ein und lassen niemanden zurück.',
  },
  {
    title: 'Soziale Gerechtigkeit',
    icon: '⚖️',
    color: 'bg-primary-50 border-primary-100',
    iconBg: 'bg-primary-100',
    description: 'Chancengleichheit und faire Teilhabe für alle Menschen in Österreich.',
  },
  {
    title: 'Klimaschutz',
    icon: '🌱',
    color: 'bg-green-50 border-green-100',
    iconBg: 'bg-green-100',
    description: 'Ökologische Verantwortung und Nachhaltigkeit für kommende Generationen.',
  },
  {
    title: 'Demokratie',
    icon: '🗳️',
    color: 'bg-blue-50 border-blue-100',
    iconBg: 'bg-blue-100',
    description: 'Aktive Mitgestaltung und Stärkung demokratischer Teilhabe auf allen Ebenen.',
  },
  {
    title: 'Bildung',
    icon: '📚',
    color: 'bg-purple-50 border-purple-100',
    iconBg: 'bg-purple-100',
    description:
      'Wissen schafft Wandel – Bildungsangebote für alle Altersgruppen und Hintergründe.',
  },
  {
    title: 'Gemeinschaft',
    icon: '🏘️',
    color: 'bg-yellow-50 border-yellow-100',
    iconBg: 'bg-yellow-100',
    description:
      'Starke Netzwerke und lokale Gemeinschaften als Fundament einer gerechten Gesellschaft.',
  },
];

const stats = [
  { value: 'ZVR', label: LEGAL_FACTS.zvr },
  { value: '2025', label: 'Gegründet' },
  { value: '3140', label: 'Pottenbrunn' },
  { value: 'de-AT', label: 'Sprache & Fokus' },
];

export default function HomePage() {
  return (
    <div data-component="Home">
      <SeoHead
        title="Menschlichkeit Österreich – Verein für Demokratie &amp; Menschenrechte"
        description="Verein zur Förderung von Demokratie, Menschenrechten und Zivilgesellschaft in Österreich. Jetzt Mitglied werden, spenden oder unsere Vereinsdokumente einsehen."
        canonical="https://www.menschlichkeit-oesterreich.at/"
      />

      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-accent-900"
        aria-label="Einstieg"
        data-component="Hero"
      >
        <div className="absolute inset-0 opacity-5" aria-hidden="true">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl -translate-y-1/2 translate-x-1/4" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold tracking-widest text-white uppercase mb-6 backdrop-blur-sm">
                Verein Menschlichkeit Österreich
              </span>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
                data-testid="hero.title"
              >
                Gemeinsam gestalten –{' '}
                <span className="mt-2 block text-white">
                  Ein Österreich, das niemanden zurücklässt.
                </span>
              </h1>
              <p
                className="mb-8 max-w-2xl text-lg leading-relaxed text-white md:text-xl"
                data-testid="hero.lead"
              >
                Initiative für soziale Gerechtigkeit, demokratische Teilhabe und ökologische
                Verantwortung in Österreich.
              </p>
              <div
                className="flex flex-wrap gap-3 justify-center md:justify-start"
                role="group"
                aria-label="Wichtige Aktionen"
              >
                <Link
                  to="/mitglied-werden"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-secondary-900 font-bold text-sm hover:bg-secondary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  data-testid="cta.join"
                >
                  <span aria-hidden="true">✨</span>
                  Jetzt Mitglied werden
                </Link>
                <Link
                  to="/spenden"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-white/70 text-white font-bold text-sm hover:bg-white/15 transition-all"
                  data-testid="cta.donate"
                >
                  <span aria-hidden="true">❤️</span>
                  Jetzt spenden
                </Link>
              </div>
            </div>

            {/* Logo */}
            <div className="shrink-0">
              <div className="relative">
                <div className="w-44 h-44 md:w-52 md:h-52 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/30">
                  <img
                    src="/logo.jpg"
                    alt="Verein Menschlichkeit Österreich Logo"
                    width={960}
                    height={960}
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-white rounded-xl px-3 py-2 shadow-lg border border-secondary-100">
                  <span className="text-xs font-bold text-primary-700">ZVR: 1182213083</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-secondary-100 shadow-sm" aria-label="Kennzahlen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-secondary-100">
            {stats.map(s => (
              <div key={s.label} className="text-center py-5 px-4">
                <div className="text-2xl font-bold text-primary-700">{s.value}</div>
                <div className="text-xs text-secondary-500 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        {/* Schwerpunkte */}
        <section
          className="mb-16 rounded-3xl border border-secondary-100 bg-secondary-50 p-8 md:p-10"
          aria-labelledby="trust-title"
        >
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
            <div>
              <h2 id="trust-title" className="text-3xl font-bold text-secondary-900 mb-4">
                In Österreich verankert und transparent organisiert
              </h2>
              <p className="text-secondary-700 leading-relaxed mb-4">
                Menschlichkeit Österreich arbeitet von Pottenbrunn aus an Bildungsangeboten,
                Veranstaltungen und Beteiligungsformaten für Menschen in ganz Österreich.
                Transparenz, Datenschutz und nachvollziehbare Vereinsstrukturen gehören für uns zur
                öffentlichen Verantwortung.
              </p>
              <p className="text-secondary-700 leading-relaxed">
                Wenn Sie sich ein genaueres Bild machen möchten, finden Sie auf unseren Seiten zu
                Transparenz, Statuten, Beitragsordnung und Datenschutz die wichtigsten Grundlagen
                unserer Arbeit.
              </p>
            </div>
            <div className="rounded-2xl border border-white bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-secondary-900">Schneller Überblick</h3>
              <ul className="mt-4 space-y-3 text-sm text-secondary-700">
                <li>Vereinssitz: {LEGAL_FACTS.seat}</li>
                <li>Zustellanschrift: {LEGAL_FACTS.mailingAddressLabel}</li>
                <li>Vereinsregister: ZVR {LEGAL_FACTS.zvr}</li>
                <li>Kontakt: {CONTACT_EMAIL}</li>
                <li>WhatsApp: 0680 1608053</li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/transparenz"
                  className="text-sm font-semibold text-primary-700 hover:underline"
                >
                  Transparenz ansehen
                </Link>
                <Link
                  to="/impressum"
                  className="text-sm font-semibold text-primary-700 hover:underline"
                >
                  Impressum
                </Link>
                <Link
                  to="/datenschutz"
                  className="text-sm font-semibold text-primary-700 hover:underline"
                >
                  Datenschutz
                </Link>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-primary-700 hover:underline"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Schwerpunkte */}
        <section className="mb-16" aria-labelledby="topics-title" data-component="CardGrid">
          <div className="text-center mb-10">
            <h2 id="topics-title" className="text-3xl font-bold text-secondary-900 mb-3">
              Unsere Schwerpunkte
            </h2>
            <p className="text-secondary-500 max-w-lg mx-auto leading-relaxed">
              Sechs Kernbereiche, in denen wir aktiv für eine bessere und gerechtere Gesellschaft in
              Österreich eintreten.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topics.map(t => (
              <div
                key={t.title}
                className={`rounded-2xl border p-6 ${t.color} hover:shadow-md transition-all duration-200 hover:-translate-y-1 group`}
                data-testid={`topic.${t.title}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${t.iconBg} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
                  aria-hidden="true"
                >
                  {t.icon}
                </div>
                <h3 className="text-base font-bold text-secondary-900 mb-2">{t.title}</h3>
                <p className="text-secondary-600 text-sm leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section
          className="relative mb-16 overflow-hidden rounded-3xl border border-secondary-100 bg-secondary-50 p-8 md:p-12"
          aria-labelledby="join-title"
        >
          <div
            className="absolute -right-8 -top-8 opacity-10 text-[8rem] leading-none select-none"
            aria-hidden="true"
          >
            🌳
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-lg">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold mb-4">
                Mitmachen
              </span>
              <h2
                id="join-title"
                className="text-2xl md:text-3xl font-bold text-secondary-900 mb-3"
              >
                Werde Teil der Bewegung
              </h2>
              <p className="text-secondary-800 leading-relaxed">
                Als Mitglied gestaltest du aktiv mit und stärkst unsere Gemeinschaft. Gemeinsam
                setzen wir uns für ein gerechtes und solidarisches Österreich ein.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/mitglied-werden"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 text-white px-6 py-3.5 text-sm font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <span aria-hidden="true">✨</span> Mitglied werden
              </Link>
              <Link
                to="/statuten"
                className="inline-flex items-center justify-center rounded-xl border-2 border-secondary-200 bg-white text-secondary-800 px-6 py-3.5 text-sm font-semibold hover:bg-secondary-50 transition-all"
              >
                Statuten lesen
              </Link>
              <a
                href={LEGAL_DOCS.registerExcerpt.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border-2 border-secondary-200 bg-white text-secondary-800 px-6 py-3.5 text-sm font-semibold hover:bg-secondary-50 transition-all"
              >
                Registerauszug herunterladen
              </a>
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="mb-14 grid md:grid-cols-2 gap-5">
          <Card className="p-6 rounded-2xl border border-secondary-100 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl shrink-0"
                aria-hidden="true"
              >
                📋
              </div>
              <div>
                <h3 className="font-bold text-secondary-900 mb-1.5">Über den Verein</h3>
                <p className="text-sm text-secondary-600 mb-3 leading-relaxed">
                  Gegründet am 28. Mai 2025. Wir vertreten die Interessen aller Menschen in
                  Österreich, unabhängig von Herkunft, Status oder Überzeugung.
                </p>
                <Link
                  to="/ueber-uns"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors group"
                >
                  Mehr erfahren
                  <svg
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border border-secondary-100 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl bg-secondary-50 flex items-center justify-center text-2xl shrink-0"
                aria-hidden="true"
              >
                ❤️
              </div>
              <div>
                <h3 className="font-bold text-secondary-900 mb-1.5">Spenden & Unterstützen</h3>
                <p className="text-sm text-secondary-600 mb-3 leading-relaxed">
                  Deine Unterstützung ermöglicht es uns, Projekte für soziale Gerechtigkeit und
                  demokratische Teilhabe umzusetzen.
                </p>
                <Link
                  to="/spenden"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors group"
                >
                  Jetzt spenden
                  <svg
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </Card>
        </section>

        {/* Legal Links */}
        <section className="border-t border-secondary-100 pt-6" aria-labelledby="legal-title">
          <h2
            id="legal-title"
            className="text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-3"
          >
            Rechtliches &amp; Datenschutz
          </h2>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {[
              {
                to: '/datenschutz#betroffenenrechte',
                label: 'Betroffenenrechte nach DSGVO',
                testId: 'link.privacy',
              },
              { to: '/statuten', label: 'Statuten' },
              { to: '/beitragsordnung', label: 'Beitragsordnung' },
              { to: '/impressum', label: 'Impressum' },
            ].map(l => (
              <Link
                key={l.to}
                to={l.to}
                data-testid={l.testId}
                className="text-secondary-700 hover:text-primary-700 transition-colors hover:underline underline-offset-2"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
