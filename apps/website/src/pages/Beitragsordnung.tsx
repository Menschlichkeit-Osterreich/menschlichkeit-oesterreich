import React from 'react';
import { Card } from '../components/ui/Card';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { PageHeader } from '../components/ui/PageHeader';

const BEITRAEGE = [
  { kategorie: 'Ordentliches Mitglied (Standard)', betrag: '€ 36,– / Jahr', hinweis: 'Entspricht € 3,– pro Monat' },
  { kategorie: 'Ordentliches Mitglied (Ermäßigt)', betrag: '€ 18,– / Jahr', hinweis: 'Für Studierende, Arbeitssuchende, Pensionist*innen · Entspricht € 1,50 pro Monat' },
  { kategorie: 'Ordentliches Mitglied (Härtefall)', betrag: '€ 0,– / Jahr', hinweis: 'Auf begründeten Antrag beim Vorstand; volle Mitgliedsrechte bleiben erhalten' },
];

export default function BeitragsordnungPage() {
  return (
    <div className="mx-auto max-w-4xl p-4 space-y-6">
      <PageHeader
        title="Beitragsordnung 2025"
        description="Mitgliedsbeiträge des Vereins Menschlichkeit Österreich"
        breadcrumb={<Breadcrumb items={[{ label: 'Beitragsordnung 2025' }]} />}
      />

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <a
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            href="/docs/beitragsordnung-2025.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            📄 Beitragsordnung als PDF herunterladen
          </a>
          <a
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-primary-600 text-primary-600 hover:bg-primary-50 transition-colors"
            href="/mitglied-werden"
          >
            🤝 Jetzt Mitglied werden
          </a>
        </div>

        <p className="text-sm text-secondary-600 mb-6">
          Beschlossen am 21. Mai 2025 · Gültig ab 1. Juli 2025
        </p>

        <h2 className="text-lg font-semibold mb-4">§ 1 – Mitgliedsbeiträge</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary-50">
                <th className="text-left p-3 border border-secondary-200 font-semibold">Kategorie</th>
                <th className="text-left p-3 border border-secondary-200 font-semibold">Jahresbeitrag</th>
                <th className="text-left p-3 border border-secondary-200 font-semibold">Hinweis</th>
              </tr>
            </thead>
            <tbody>
              {BEITRAEGE.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-secondary-50'}>
                  <td className="p-3 border border-secondary-200">{row.kategorie}</td>
                  <td className="p-3 border border-secondary-200 font-medium text-primary-700">{row.betrag}</td>
                  <td className="p-3 border border-secondary-200 text-secondary-600">{row.hinweis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 text-sm text-secondary-700">
          <div>
            <h3 className="font-semibold text-base mb-1">§ 2 – Fälligkeit und Zahlungsmodalitäten</h3>
            <p>Jahresbeiträge sind bis spätestens 31. März des jeweiligen Jahres zu entrichten. Monatsbeiträge sind bis zum 5. des jeweiligen Monats fällig. Die Zahlung erfolgt per SEPA-Lastschrift oder Banküberweisung.</p>
          </div>
          <div>
            <h3 className="font-semibold text-base mb-1">§ 3 – Ermäßigter Beitrag</h3>
            <p>Der ermäßigte Beitrag gilt für Studierende, Arbeitssuchende und Pensionist*innen. Ein entsprechender Nachweis ist beim Beitritt vorzulegen.</p>
          </div>
          <div>
            <h3 className="font-semibold text-base mb-1">§ 4 – Härtefallregelung</h3>
            <p>Mitglieder, die den Beitrag aus finanziellen Gründen nicht entrichten können, können beim Vorstand einen begründeten Antrag auf Befreiung stellen. Die vollen Mitgliedsrechte bleiben in jedem Fall erhalten.</p>
          </div>
          <div>
            <h3 className="font-semibold text-base mb-1">§ 5 – Steuerliche Absetzbarkeit</h3>
            <p>Mitgliedsbeiträge und Spenden sind im Rahmen der geltenden österreichischen Steuergesetze steuerlich absetzbar. Der Verein ist beim Finanzamt als gemeinnützig anerkannt.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

