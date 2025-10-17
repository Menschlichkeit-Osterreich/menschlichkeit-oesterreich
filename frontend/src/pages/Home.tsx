import React from 'react';
import { Card } from '../components/ui/Card';
import { Button, ButtonLink } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl p-4" data-component="Home">
      <section id="hero-section" className="hero mb-8" aria-label="Einstieg" data-component="Hero">
        <h1 className="mb-2 text-3xl md:text-4xl font-semibold text-primary-700" data-testid="hero.title">Gemeinsam gestalten</h1>
        <p className="mb-6 text-secondary-700" data-testid="hero.lead">Initiative für soziale Gerechtigkeit und demokratische Teilhabe.</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Wichtige Aktionen">
          <ButtonLink href="/mitmachen" data-testid="cta.join">Jetzt mitmachen</ButtonLink>
          <ButtonLink href="/themen" variant="secondary" data-testid="cta.topics">Themen entdecken</ButtonLink>
        </div>
      </section>

      <section className="topics u-grid grid grid-cols-1 md:grid-cols-3 gap-4" data-component="CardGrid" aria-labelledby="topics-title">
        <h2 id="topics-title" className="sr-only">Themen</h2>
        {["Bildung","Solidarität","Klimaschutz"].map((t) => (
          <Card key={t} className="p-4 card-modern" data-testid={`topic.${t}`}>
            <h3 className="mb-2 text-xl font-medium">{t}</h3>
            <p className="text-secondary-700">Kurzbeschreibung zum Schwerpunkt „{t}“.</p>
          </Card>
        ))}
      </section>

      <section className="mt-8" aria-labelledby="privacy-title">
        <h2 id="privacy-title" className="mb-2 text-xl font-medium">Datenschutz</h2>
        <p className="mb-3 text-secondary-700">Verwalte deine Datenschutzeinstellungen und kontobezogene Anfragen.</p>
        <Link className="text-blue-600 underline" to="/account/privacy" data-testid="link.privacy">Mein Konto löschen (DSGVO Art. 17)</Link>
      </section>
    </div>
  );
}
