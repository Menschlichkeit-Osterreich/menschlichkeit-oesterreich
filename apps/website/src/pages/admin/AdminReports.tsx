import React, { useState } from 'react';

interface Report {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'finance' | 'members' | 'events' | 'compliance';
  format: 'PDF' | 'Excel' | 'CSV';
}

const REPORTS: Report[] = [
  { id: 'annual-report', title: 'Jahresbericht 2025', description: 'Vollständiger Vereinsjahresbericht mit Finanzen, Aktivitäten und Mitgliederentwicklung', icon: '📋', category: 'finance', format: 'PDF' },
  { id: 'ea-rechnung', title: 'Einnahmen-Ausgaben-Rechnung', description: 'E/A-Rechnung nach österreichischem Vereinsrecht (§22 VerG)', icon: '💰', category: 'finance', format: 'PDF' },
  { id: 'member-list', title: 'Mitgliederliste', description: 'Vollständige Mitgliederliste mit Status und Kontaktdaten', icon: '👥', category: 'members', format: 'Excel' },
  { id: 'member-stats', title: 'Mitglieder-Statistiken', description: 'Entwicklung, Fluktuation, Altersstruktur und geografische Verteilung', icon: '📊', category: 'members', format: 'PDF' },
  { id: 'donation-report', title: 'Spendenbericht', description: 'Alle Spenden mit Quittungsnummern für die Steuererklärung', icon: '🎁', category: 'finance', format: 'PDF' },
  { id: 'sepa-export', title: 'SEPA-Lastschrift-Export', description: 'XML-Datei für Bankeinzug der Mitgliedsbeiträge', icon: '🏦', category: 'finance', format: 'CSV' },
  { id: 'event-report', title: 'Veranstaltungsbericht', description: 'Teilnehmerzahlen, Feedback und Kosten aller Events', icon: '📅', category: 'events', format: 'PDF' },
  { id: 'dsgvo-report', title: 'DSGVO-Compliance-Bericht', description: 'Datenschutz-Audit, Einwilligungen und Verarbeitungsverzeichnis', icon: '🔒', category: 'compliance', format: 'PDF' },
  { id: 'tax-report', title: 'Steuerliche Unterlagen', description: 'Gemeinnützigkeitsnachweis und steuerrelevante Dokumente', icon: '📑', category: 'finance', format: 'PDF' },
];

const CATEGORY_LABELS: Record<string, string> = {
  finance: '💰 Finanzen',
  members: '👥 Mitglieder',
  events: '📅 Events',
  compliance: '🔒 Compliance',
};

export default function AdminReports() {
  const [filter, setFilter] = useState<'all' | 'finance' | 'members' | 'events' | 'compliance'>('all');
  const [generating, setGenerating] = useState<string | null>(null);

  const filtered = REPORTS.filter(r => filter === 'all' || r.category === filter);

  const handleGenerate = (id: string) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Berichte & Exporte</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Alle Berichte, Statistiken und Datenexporte</p>
      </div>

      {/* Schnell-Aktionen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { title: 'Jahresbericht 2025', desc: 'Vollständiger Bericht als PDF', icon: '📋', color: 'bg-blue-600' },
          { title: 'E/A-Rechnung', desc: 'Für Finanzamt und Vereinsregister', icon: '💰', color: 'bg-green-600' },
          { title: 'SEPA-Export', desc: 'Für Bankeinzug bereit', icon: '🏦', color: 'bg-purple-600' },
        ].map((a, i) => (
          <button key={i} onClick={() => handleGenerate(a.title)}
            className={`${a.color} text-white rounded-xl p-4 text-left hover:opacity-90 transition-opacity`}>
            <div className="text-2xl mb-2">{a.icon}</div>
            <div className="font-semibold text-sm">{a.title}</div>
            <div className="text-xs opacity-80 mt-0.5">{a.desc}</div>
            {generating === a.title && (
              <div className="mt-2 text-xs opacity-80">⏳ Wird generiert...</div>
            )}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'finance', 'members', 'events', 'compliance'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}>
            {f === 'all' ? 'Alle' : CATEGORY_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Berichte-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(report => (
          <div key={report.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{report.icon}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                report.format === 'PDF' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                report.format === 'Excel' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              }`}>{report.format}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{report.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{report.description}</p>
            <button
              onClick={() => handleGenerate(report.id)}
              disabled={generating === report.id}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
              {generating === report.id ? '⏳ Generiert...' : `⬇️ ${report.format} herunterladen`}
            </button>
          </div>
        ))}
      </div>

      {/* Zeitraum-Selektor */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Benutzerdefinierter Zeitraum</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Von</label>
            <input type="date" defaultValue="2026-01-01" className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bis</label>
            <input type="date" defaultValue="2026-12-31" className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Berichtstyp</label>
            <select className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
              <option>Finanzbericht</option>
              <option>Mitgliederbericht</option>
              <option>Aktivitätsbericht</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            Bericht erstellen
          </button>
        </div>
      </div>
    </div>
  );
}
