import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import SeoHead from '../components/seo/SeoHead';
import { PageHeader } from '../components/ui/PageHeader';
import { LEGAL_DOCS, LEGAL_FACTS } from '../config/siteConfig';

const BEITRAEGE = [
  {
    kategorie: 'Standardmitgliedschaft',
    betrag: '€ 36,00 pro Jahr',
    hinweis: 'Alternativ € 3,00 pro Monat',
  },
  {
    kategorie: 'Ermäßigte Mitgliedschaft',
    betrag: '€ 18,00 pro Jahr',
    hinweis: 'Alternativ € 1,50 pro Monat',
  },
  {
    kategorie: 'Härtefallregelung',
    betrag: '€ 0,00',
    hinweis: 'Auf begründeten Antrag an den Vorstand',
  },
];

export default function BeitragsordnungPage() {
  return (
    <div className="mx-auto max-w-4xl p-4 space-y-6">
      <SeoHead
        title="Beitragsordnung – Menschlichkeit Österreich"
        description="Aktuelle Beitragsordnung von Menschlichkeit Österreich mit direktem PDF-Download und Überblick über Beitragshöhen und Zahlungsmodalitäten."
      />
      <PageHeader
        title="Beitragsordnung"
        description="Die aktuelle Neufassung 2025 stellen wir als PDF bereit. Hier finden Sie die wichtigsten Eckpunkte in kurzer Form."
        breadcrumb={<Breadcrumb items={[{ label: 'Beitragsordnung' }]} />}
      />

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            className="inline-flex items-center gap-2 rounded bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700"
            href={LEGAL_DOCS.contributionRules.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            📄 {LEGAL_DOCS.contributionRules.label}
          </a>
          <Link
            className="inline-flex items-center gap-2 rounded border border-primary-600 px-4 py-2 text-primary-600 transition-colors hover:bg-primary-50"
            to="/mitglied-werden"
          >
            🤝 Jetzt Mitglied werden
          </Link>
        </div>

        <div className="rounded-2xl border border-secondary-200 bg-secondary-50 p-5 text-sm text-secondary-700">
          <p>
            <strong>Beschlussdatum der Neufassung:</strong> {LEGAL_FACTS.contributionOrderResolutionLabel}
          </p>
          <p className="mt-2">
            <strong>Gültig ab:</strong> {LEGAL_FACTS.contributionOrderEffectiveLabel}
          </p>
          <p className="mt-3">
            Für den verbindlichen Wortlaut gilt ausschließlich die PDF-Fassung. Die Website-Zusammenfassung dient der
            schnellen Orientierung.
          </p>
        </div>

        <h2 className="mt-8 text-lg font-semibold mb-4">Beitragshöhen ab 2025</h2>
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary-50">
                <th className="border border-secondary-200 p-3 text-left font-semibold">Kategorie</th>
                <th className="border border-secondary-200 p-3 text-left font-semibold">Beitrag</th>
                <th className="border border-secondary-200 p-3 text-left font-semibold">Hinweis</th>
              </tr>
            </thead>
            <tbody>
              {BEITRAEGE.map((row, idx) => (
                <tr key={row.kategorie} className={idx % 2 === 0 ? 'bg-white' : 'bg-secondary-50'}>
                  <td className="border border-secondary-200 p-3">{row.kategorie}</td>
                  <td className="border border-secondary-200 p-3 font-medium text-primary-700">{row.betrag}</td>
                  <td className="border border-secondary-200 p-3 text-secondary-600">{row.hinweis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 text-sm text-secondary-700">
          <section>
            <h3 className="mb-1 text-base font-semibold">Zweck der Beiträge</h3>
            <p>
              Laut Beitragsordnung dienen die Mitgliedsbeiträge der Finanzierung der gemeinnützigen Vereinsarbeit,
              insbesondere in den Bereichen soziale Gerechtigkeit, ökologische Verantwortung, demokratische Bildung
              und Solidarität.
            </p>
          </section>
          <section>
            <h3 className="mb-1 text-base font-semibold">Zahlungsmodalitäten</h3>
            <p>
              Beiträge können jährlich oder monatlich geleistet werden. Bei Eintritt während des laufenden Jahres
              wird der Beitrag aliquot ab dem Beitrittsmonat fällig.
            </p>
          </section>
          <section>
            <h3 className="mb-1 text-base font-semibold">Fälligkeit</h3>
            <p>
              Jahresbeiträge sind laut Neufassung bis 31. März, Monatsbeiträge jeweils bis zum 5. des laufenden
              Monats zu entrichten.
            </p>
          </section>
          <section>
            <h3 className="mb-1 text-base font-semibold">Zahlungsarten</h3>
            <p>
              Die Ordnung nennt Banküberweisung auf das offizielle Vereinskonto sowie nach Absprache SEPA-Dauerauftrag
              oder digitale Zahlung. Die konkreten Zahlungsdaten werden individuell übermittelt.
            </p>
          </section>
        </div>
      </Card>
    </div>
  );
}
