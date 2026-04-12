import React from 'react';
import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';
import SeoHead from '../components/seo/SeoHead';
import { CONTACT_EMAIL } from '../config/siteConfig';

export default function Barrierefreiheit() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <SeoHead
        title="Barrierefreiheit – Menschlichkeit Österreich"
        description="Informationen zur digitalen Barrierefreiheit von Menschlichkeit Österreich, Kontakt für Rückmeldungen und laufende Verbesserungen."
      />
      <JsonLdBreadcrumb
        items={[
          { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
          {
            name: 'Barrierefreiheit',
            url: 'https://www.menschlichkeit-oesterreich.at/barrierefreiheit',
          },
        ]}
      />

      <h1 className="text-3xl font-bold text-secondary-900">Barrierefreiheit</h1>
      <p className="mt-3 text-secondary-700 leading-relaxed">
        Wir arbeiten laufend daran, unsere Website, das Mitgliederportal, das Forum und das Spiel
        möglichst barrierearm und technisch robust nutzbar zu machen. Grundlage sind
        WCAG-orientierte Best Practices, semantisches HTML, Tastaturbedienbarkeit und verständliche
        Rückmeldungen für Screenreader.
      </p>

      <section className="mt-8 rounded-2xl border border-secondary-100 bg-secondary-50 p-6">
        <h2 className="text-xl font-semibold text-secondary-900">Aktueller Stand</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-secondary-700">
          <li>Öffentliche Hauptseiten sind semantisch aufgebaut und per Tastatur bedienbar.</li>
          <li>
            Dialoge, Formulare und Statusmeldungen wurden technisch für Hilfstechnologien
            nachgeschärft.
          </li>
          <li>
            Für das Babylon-Spiel gibt es zusätzlich einen linearen Textmodus als Alternative zur
            3D-Interaktion.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-secondary-900">Barrieren melden</h2>
        <p className="mt-3 text-secondary-700 leading-relaxed">
          Wenn Ihnen eine digitale Barriere auffällt oder Sie eine Information in einer besser
          zugänglichen Form benötigen, schreiben Sie uns bitte an{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-700 hover:underline">
            {CONTACT_EMAIL}
          </a>
          . Bitte nennen Sie nach Möglichkeit die betroffene Seite, das verwendete Gerät und die
          beobachtete Hürde.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-secondary-900">Unser Vorgehen</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-secondary-700">
          <li>
            Probleme mit hoher Auswirkung werden direkt im Code behoben, nicht nur optisch
            überdeckt.
          </li>
          <li>
            Neue Funktionen werden gegen Tastaturbedienung, Fokusführung und
            Screenreader-Rückmeldungen geprüft.
          </li>
          <li>
            Zusätzliche Komfortfunktionen sind willkommen, ersetzen aber keine saubere
            Grundumsetzung.
          </li>
        </ul>
      </section>
    </div>
  );
}
