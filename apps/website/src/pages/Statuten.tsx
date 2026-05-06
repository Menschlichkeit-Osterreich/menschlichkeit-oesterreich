import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import SeoHead from '../components/seo/SeoHead';
import { PageHeader } from '../components/ui/PageHeader';
import { LEGAL_DOCS, LEGAL_FACTS } from '../config/siteConfig';

const STATUTEN_HIGHLIGHTS = [
  {
    title: 'Name, Sitz und Tätigkeitsbereich',
    content:
      'Die Statuten nennen den Vereinsnamen „Menschlichkeit Österreich“, den Vereinssitz in St. Pölten-Pottenbrunn und einen Tätigkeitsbereich, der sich auf ganz Österreich und bei Bedarf auch grenzüberschreitende Aktivitäten erstreckt.',
  },
  {
    title: 'Vereinszweck',
    content:
      'Als Ziele werden insbesondere Demokratie, Menschenrechte, soziale Gerechtigkeit, ökologische Verantwortung, Bildungsarbeit, soziale Unterstützung und zivilgesellschaftliche Teilhabe beschrieben.',
  },
  {
    title: 'Mitgliedschaft und Beiträge',
    content:
      'Die Statuten unterscheiden ordentliche, außerordentliche und Ehrenmitglieder. Rechte, Pflichten, Austritt, Ausschluss und die Rolle einer gesonderten Beitragsordnung sind dort ausdrücklich geregelt.',
  },
  {
    title: 'Organe und Kontrolle',
    content:
      'Mitgliederversammlung, Vorstand, Rechnungsprüfer*innen und Schiedsgericht bilden die zentralen Organe. Die Statuten enthalten außerdem Regeln zu Aufgaben, Vertretung, Kontrolle und Auflösung des Vereins.',
  },
  {
    title: 'Datenschutz und Schlussbestimmungen',
    content:
      'Die aktuelle Fassung umfasst auch eigene Bestimmungen zu Datenschutz und Datenverarbeitung. Für die rechtlich verbindliche Wortlaut-Fassung ist ausschließlich das PDF maßgeblich.',
  },
];

export default function StatutenPage() {
  return (
    <div className="mx-auto max-w-4xl p-4 space-y-6">
      <SeoHead
        title="Statuten – Menschlichkeit Österreich"
        description="Überblick über die Statuten von Menschlichkeit Österreich mit direktem Download der verbindlichen PDF-Fassung."
      />
      <PageHeader
        title="Statuten"
        description="Die verbindliche Fassung der Vereinsstatuten stellen wir als PDF bereit. Auf dieser Seite finden Sie eine kurze Orientierung zu Aufbau und Inhalt."
        breadcrumb={<Breadcrumb items={[{ label: 'Statuten' }]} />}
      />

      <Card className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap mb-6">
          <a
            className="inline-flex items-center gap-2 rounded bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700"
            href={LEGAL_DOCS.statutes.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            📄 {LEGAL_DOCS.statutes.label}
          </a>
          <a
            className="inline-flex items-center gap-2 rounded border border-primary-600 px-4 py-2 text-primary-600 transition-colors hover:bg-primary-50"
            href={LEGAL_DOCS.registerExcerpt.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            🏛️ Vereinsregisterauszug
          </a>
          <Link
            className="inline-flex items-center gap-2 rounded border border-primary-600 px-4 py-2 text-primary-600 transition-colors hover:bg-primary-50"
            to="/mitglied-werden"
          >
            🤝 Mitglied werden
          </Link>
        </div>

        <div className="rounded-2xl border border-secondary-200 bg-secondary-50 p-5 text-sm text-secondary-700">
          <p>
            <strong>Wichtige Eckdaten:</strong> ZVR {LEGAL_FACTS.zvr}, Vereinssitz {LEGAL_FACTS.seat},
            Zustellanschrift {LEGAL_FACTS.mailingAddressLabel}, Entstehungsdatum {LEGAL_FACTS.foundingDateLabel}.
          </p>
          <p className="mt-3">
            Die verbindliche juristische Formulierung entnehmen Sie bitte immer der PDF-Fassung. Die Zusammenfassung
            auf dieser Seite dient nur der Orientierung.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {STATUTEN_HIGHLIGHTS.map((section) => (
            <section key={section.title} className="border-b border-secondary-200 pb-5 last:border-0 last:pb-0">
              <h2 className="mb-2 text-lg font-semibold text-primary-700">{section.title}</h2>
              <p className="text-sm leading-relaxed text-secondary-700">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-secondary-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-secondary-900">Passende Seiten dazu</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link to="/beitragsordnung" className="font-medium text-primary-700 hover:underline">
              Beitragsordnung
            </Link>
            <Link to="/transparenz" className="font-medium text-primary-700 hover:underline">
              Transparenz
            </Link>
            <Link to="/kontakt" className="font-medium text-primary-700 hover:underline">
              Kontakt
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
