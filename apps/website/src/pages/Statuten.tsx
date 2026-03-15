import React from 'react';
import { Card } from '../components/ui/Card';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import SeoHead from '../components/seo/SeoHead';
import { PageHeader } from '../components/ui/PageHeader';

const STATUTEN_SECTIONS = [
  {
    title: '§ 1 – Name, Sitz und Tätigkeitsbereich',
    content: 'Der Verein führt den Namen „Menschlichkeit Österreich". Er hat seinen Sitz in St. Pölten und erstreckt seine Tätigkeit auf das gesamte Bundesgebiet der Republik Österreich. Die Errichtung von Zweigvereinen ist zulässig.',
  },
  {
    title: '§ 2 – Zweck',
    content: 'Der Verein, dessen Tätigkeit nicht auf Gewinn gerichtet ist, bezweckt die Förderung einer solidarischen, gerechten und ökologisch verantwortungsvollen Gesellschaft in Österreich. Er setzt sich ein für den Schutz der Menschenwürde und der Menschenrechte, die Stärkung sozialer Gerechtigkeit und Chancengleichheit, den Schutz der natürlichen Lebensgrundlagen sowie die Förderung demokratischer Teilhabe.',
  },
  {
    title: '§ 3 – Mittel zur Erreichung des Vereinszwecks',
    content: 'Der Vereinszweck soll durch Veranstaltungen, Vorträge, Bildungsarbeit, Öffentlichkeitsarbeit und Vernetzung (ideelle Mittel) sowie durch Mitgliedsbeiträge, Spenden und Subventionen (materielle Mittel) erreicht werden.',
  },
  {
    title: '§ 4 – Arten der Mitgliedschaft',
    content: 'Die Mitglieder gliedern sich in: (a) ordentliche Mitglieder, (b) außerordentliche Mitglieder und (c) Ehrenmitglieder.',
  },
  {
    title: '§ 5 – Erwerb der Mitgliedschaft',
    content: 'Mitglieder können alle natürlichen Personen sowie juristische Personen werden. Über die Aufnahme entscheidet der Vorstand. Die Aufnahme kann ohne Angabe von Gründen verweigert werden.',
  },
  {
    title: '§ 6 – Beendigung der Mitgliedschaft',
    content: 'Die Mitgliedschaft erlischt durch Tod, freiwilligen Austritt, Streichung wegen Nichtzahlung des Mitgliedsbeitrags oder Ausschluss durch den Vorstand bei vereinsschädigendem Verhalten.',
  },
  {
    title: '§ 7 – Rechte und Pflichten der Mitglieder',
    content: 'Mitglieder sind berechtigt, an Veranstaltungen teilzunehmen. Das Stimmrecht steht nur ordentlichen Mitgliedern zu. Mitglieder sind verpflichtet, die Interessen des Vereins zu fördern und den Mitgliedsbeitrag pünktlich zu entrichten.',
  },
  {
    title: '§ 8 – Vereinsorgane',
    content: 'Die Organe des Vereins sind: (a) die Mitgliederversammlung, (b) der Vorstand, (c) die Rechnungsprüfer*innen, (d) das Schiedsgericht und (e) die Arbeitsgruppen.',
  },
  {
    title: '§ 9 – Mitgliederversammlung',
    content: 'Die ordentliche Mitgliederversammlung findet jährlich statt. Eine außerordentliche Mitgliederversammlung findet auf Beschluss des Vorstands oder auf schriftlichen Antrag von mindestens einem Zehntel der Mitglieder statt.',
  },
  {
    title: '§ 10 – Vorstand',
    content: 'Der Vorstand besteht aus mindestens drei Mitgliedern: der Obperson, der stellvertretenden Obperson und der Kassier*in. Optional kann ein*e Schriftführer*in bestellt werden. Die Funktionsperiode beträgt bis zu fünf Jahre; Wiederwahl ist möglich.',
  },
  {
    title: '§ 11 – Auflösung des Vereins',
    content: 'Die freiwillige Auflösung kann nur in einer außerordentlichen Mitgliederversammlung mit Zweidrittelmehrheit beschlossen werden. Das verbleibende Vereinsvermögen ist einer gemeinnützigen Organisation zu übertragen.',
  },
];

export default function StatutenPage() {
  return (
    <div className="mx-auto max-w-4xl p-4 space-y-6">
      <SeoHead
        title="Statuten – Menschlichkeit Österreich"
        description="Die Statuten des Vereins Menschlichkeit Österreich. Vereinszweck, Mitgliedschaft, Organe und Rechte und Pflichten der Mitglieder."
      />
      <PageHeader
        title="Statuten"
        description="Statuten des Vereins Menschlichkeit Österreich"
        breadcrumb={<Breadcrumb items={[{ label: 'Statuten' }]} />}
      />

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <a
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            href="/docs/statuten.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            📄 Statuten als PDF herunterladen
          </a>
          <a
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-primary-600 text-primary-600 hover:bg-primary-50 transition-colors"
            href="/mitglied-werden"
          >
            🤝 Mitglied werden
          </a>
        </div>

        <p className="text-sm text-secondary-600 mb-6">
          Beschlossen: 21. Mai 2025 · Registriert beim Vereinsregister (ZVR: 1182213083)
        </p>

        <div className="space-y-6">
          {STATUTEN_SECTIONS.map((section, idx) => (
            <div key={idx} className="border-b border-secondary-200 pb-5 last:border-0 last:pb-0">
              <h2 className="text-lg font-semibold text-primary-700 mb-2">{section.title}</h2>
              <p className="text-secondary-700 leading-relaxed text-sm">{section.content}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
