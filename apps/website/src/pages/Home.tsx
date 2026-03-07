import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { ButtonLink } from '../components/ui/Button';

const topics = [
  {
    title: 'Solidarität',
    icon: '🤝',
    description: 'Zusammenhalt statt Spaltung – wir stehen füreinander ein und lassen niemanden zurück.',
  },
  {
    title: 'Soziale Gerechtigkeit',
    icon: '⚖️',
    description: 'Chancengleichheit und faire Teilhabe für alle Menschen in Österreich.',
  },
  {
    title: 'Klimaschutz',
    icon: '🌱',
    description: 'Ökologische Verantwortung und Nachhaltigkeit für kommende Generationen.',
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8" data-component="Home">

      {/* Hero */}
      <section
        id="hero-section"
        className="rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white px-6 py-12 mb-10 text-center"
        aria-label="Einstieg"
        data-component="Hero"
      >
        <h1
          className="mb-4 text-3xl md:text-5xl font-bold leading-tight"
          data-testid="hero.title"
        >
          Gemeinsam gestalten –<br />
          <span className="text-primary-200">Ein Österreich, das niemanden zurücklässt.</span>
        </h1>
        <p className="mb-8 text-lg md:text-xl text-primary-100 max-w-2xl mx-auto" data-testid="hero.lead">
          Initiative für soziale Gerechtigkeit, demokratische Teilhabe und ökologische Verantwortung.
        </p>
        <div className="flex flex-wrap gap-3 justify-center" role="group" aria-label="Wichtige Aktionen">
          <ButtonLink
            href="/mitglied-werden"
            className="bg-white text-primary-700 hover:bg-primary-50 font-semibold px-6 py-3"
            data-testid="cta.join"
          >
            Jetzt Mitglied werden
          </ButtonLink>
          <ButtonLink
            href="/spenden"
            className="border-2 border-white text-white hover:bg-white hover:text-primary-700 bg-transparent font-semibold px-6 py-3"
            data-testid="cta.donate"
          >
            Jetzt spenden
          </ButtonLink>
        </div>
      </section>

      {/* Themen */}
      <section
        className="mb-10"
        aria-labelledby="topics-title"
        data-component="CardGrid"
      >
        <h2 id="topics-title" className="text-2xl font-bold mb-6 text-center text-secondary-800">
          Unsere Schwerpunkte
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topics.map((t) => (
            <Card key={t.title} className="p-5 card-modern hover:shadow-md transition-shadow" data-testid={`topic.${t.title}`}>
              <div className="text-4xl mb-3" aria-hidden="true">{t.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-secondary-900">{t.title}</h3>
              <p className="text-secondary-600 text-sm leading-relaxed">{t.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Mitmachen / Call to Action */}
      <section
        className="mb-10 bg-secondary-50 rounded-xl p-6 md:p-8"
        aria-labelledby="join-title"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 id="join-title" className="text-xl font-bold text-secondary-900 mb-1">
              Werde Teil der Bewegung
            </h2>
            <p className="text-secondary-600 text-sm">
              Als Mitglied gestaltest du aktiv mit und stärkst die Gemeinschaft.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/mitglied-werden"
              className="inline-flex items-center rounded-md bg-primary-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Mitglied werden
            </Link>
            <Link
              to="/statuten"
              className="inline-flex items-center rounded-md border border-secondary-300 bg-white text-secondary-800 px-5 py-2.5 text-sm font-medium hover:bg-secondary-50 transition-colors"
            >
              Statuten lesen
            </Link>
          </div>
        </div>
      </section>

      {/* Rechtliches / Datenschutz */}
      <section className="mb-4" aria-labelledby="legal-title">
        <h2 id="legal-title" className="mb-3 text-lg font-semibold text-secondary-800">Rechtliches &amp; Datenschutz</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link className="text-primary-600 hover:text-primary-800 underline underline-offset-2" to="/account/privacy" data-testid="link.privacy">
            Datenschutzeinstellungen / DSGVO Art. 17
          </Link>
          <Link className="text-primary-600 hover:text-primary-800 underline underline-offset-2" to="/statuten">
            Statuten
          </Link>
          <Link className="text-primary-600 hover:text-primary-800 underline underline-offset-2" to="/beitragsordnung">
            Beitragsordnung
          </Link>
        </div>
      </section>
    </div>
  );
}
