import React, { useState, useEffect, useCallback } from 'react';

// ── Typen ──────────────────────────────────────────────────────────────────────

interface KPI {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: string;
  color: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  status: 'paid' | 'open' | 'overdue';
  invoice_number?: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  result: number;
}

interface DonationCampaign {
  name: string;
  target: number;
  raised: number;
  donors: number;
}

// ── Hilfsfunktionen ────────────────────────────────────────────────────────────

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(amount);

const formatDate = (dateStr: string): string =>
  new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr));

// ── Mock-Daten für die Entwicklung ─────────────────────────────────────────────

const MOCK_KPIs: KPI[] = [
  { label: 'Jahreseinnahmen', value: '€ 48.750', change: 12.5, changeLabel: 'vs. Vorjahr', icon: '📈', color: 'green' },
  { label: 'Jahresausgaben', value: '€ 41.200', change: -3.2, changeLabel: 'vs. Vorjahr', icon: '📉', color: 'red' },
  { label: 'Jahresergebnis', value: '€ 7.550', change: 85.0, changeLabel: 'vs. Vorjahr', icon: '💰', color: 'blue' },
  { label: 'Offene Rechnungen', value: '€ 3.240', change: 0, changeLabel: '12 Rechnungen', icon: '📋', color: 'yellow' },
  { label: 'Überfällige Rechnungen', value: '€ 840', change: 0, changeLabel: '3 Rechnungen', icon: '⚠️', color: 'red' },
  { label: 'Aktive Mitglieder', value: '247', change: 8.3, changeLabel: 'vs. Vormonat', icon: '👥', color: 'green' },
  { label: 'Spendeneinnahmen', value: '€ 12.300', change: 22.1, changeLabel: 'vs. Vorjahr', icon: '❤️', color: 'purple' },
  { label: 'Bankguthaben', value: '€ 18.450', change: 0, changeLabel: 'Aktueller Stand', icon: '🏦', color: 'blue' },
];

const MOCK_MONTHLY: MonthlyData[] = [
  { month: 'Jan', income: 3200, expenses: 2800, result: 400 },
  { month: 'Feb', income: 4100, expenses: 3200, result: 900 },
  { month: 'Mär', income: 5200, expenses: 3800, result: 1400 },
  { month: 'Apr', income: 3800, expenses: 3500, result: 300 },
  { month: 'Mai', income: 4500, expenses: 4100, result: 400 },
  { month: 'Jun', income: 3900, expenses: 3200, result: 700 },
  { month: 'Jul', income: 2800, expenses: 2900, result: -100 },
  { month: 'Aug', income: 3100, expenses: 2700, result: 400 },
  { month: 'Sep', income: 4800, expenses: 3600, result: 1200 },
  { month: 'Okt', income: 5100, expenses: 4200, result: 900 },
  { month: 'Nov', income: 4300, expenses: 3800, result: 500 },
  { month: 'Dez', income: 3900, expenses: 3400, result: 500 },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-02-28', description: 'Mitgliedsbeitrag – Maria Huber', amount: 120, type: 'income', category: 'membership_fee', status: 'paid', invoice_number: 'RE-2026-000247' },
  { id: '2', date: '2026-02-27', description: 'Spende – Klaus Berger', amount: 250, type: 'income', category: 'donation', status: 'paid' },
  { id: '3', date: '2026-02-26', description: 'Miete Büro März 2026', amount: 850, type: 'expense', category: 'rent', status: 'paid' },
  { id: '4', date: '2026-02-25', description: 'Mitgliedsbeitrag – Thomas Maier', amount: 120, type: 'income', category: 'membership_fee', status: 'open', invoice_number: 'RE-2026-000246' },
  { id: '5', date: '2026-02-20', description: 'Büromaterial', amount: 45.50, type: 'expense', category: 'office_supplies', status: 'paid' },
  { id: '6', date: '2026-02-15', description: 'Mitgliedsbeitrag – Anna Schneider', amount: 120, type: 'income', category: 'membership_fee', status: 'overdue', invoice_number: 'RE-2026-000231' },
  { id: '7', date: '2026-02-10', description: 'Veranstaltung: Demokratie-Workshop', amount: 1200, type: 'income', category: 'event_income', status: 'paid' },
  { id: '8', date: '2026-02-08', description: 'Druckkosten Flyer', amount: 180, type: 'expense', category: 'office_supplies', status: 'paid' },
];

const MOCK_CAMPAIGNS: DonationCampaign[] = [
  { name: 'Demokratiebildung 2026', target: 10000, raised: 7850, donors: 43 },
  { name: 'Schulprojekt Wien', target: 5000, raised: 3200, donors: 28 },
  { name: 'Jahresfonds', target: 20000, raised: 12300, donors: 89 },
];

// ── Unterkomponenten ───────────────────────────────────────────────────────────

const KPICard: React.FC<{ kpi: KPI }> = ({ kpi }) => {
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };
  const changeColor = kpi.change > 0 ? 'text-green-600' : kpi.change < 0 ? 'text-red-600' : 'text-gray-500';

  return (
    <div className={`rounded-xl border p-4 ${colorMap[kpi.color] || 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{kpi.icon}</span>
        {kpi.change !== 0 && (
          <span className={`text-xs font-medium ${changeColor}`}>
            {kpi.change > 0 ? '▲' : '▼'} {Math.abs(kpi.change)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
      <div className="text-sm font-medium text-gray-600">{kpi.label}</div>
      <div className="text-xs text-gray-400 mt-1">{kpi.changeLabel}</div>
    </div>
  );
};

const BarChart: React.FC<{ data: MonthlyData[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.income, d.expenses)));
  return (
    <div className="flex items-end gap-1 h-48 w-full">
      {data.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full flex gap-0.5 items-end" style={{ height: '160px' }}>
            <div
              className="flex-1 bg-green-400 rounded-t opacity-80 hover:opacity-100 transition-opacity"
              style={{ height: `${(d.income / maxValue) * 100}%` }}
              title={`Einnahmen: ${formatCurrency(d.income)}`}
            />
            <div
              className="flex-1 bg-red-400 rounded-t opacity-80 hover:opacity-100 transition-opacity"
              style={{ height: `${(d.expenses / maxValue) * 100}%` }}
              title={`Ausgaben: ${formatCurrency(d.expenses)}`}
            />
          </div>
          <span className="text-xs text-gray-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

const CampaignProgress: React.FC<{ campaign: DonationCampaign }> = ({ campaign }) => {
  const percent = Math.min((campaign.raised / campaign.target) * 100, 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{campaign.name}</span>
        <span className="text-xs text-gray-500">{campaign.donors} Spender</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-purple-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{formatCurrency(campaign.raised)} gesammelt</span>
        <span>{percent.toFixed(0)}% von {formatCurrency(campaign.target)}</span>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: Transaction['status'] }> = ({ status }) => {
  const map = {
    paid: { label: 'Bezahlt', cls: 'bg-green-100 text-green-800' },
    open: { label: 'Offen', cls: 'bg-yellow-100 text-yellow-800' },
    overdue: { label: 'Überfällig', cls: 'bg-red-100 text-red-800' },
  };
  const { label, cls } = map[status];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
};

// ── Hauptkomponente ────────────────────────────────────────────────────────────

const FinanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'invoices' | 'donations' | 'accounting'>('overview');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'open' | 'overdue'>('all');

  const filteredTransactions = MOCK_TRANSACTIONS.filter(
    tx => filterStatus === 'all' || tx.status === filterStatus
  );

  const handleExportDATEV = useCallback(async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/finance/accounting/datev-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: selectedYear, month: selectedMonth }),
      });
      if (!response.ok) throw new Error('Export fehlgeschlagen');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datev-export-${selectedYear}${selectedMonth ? `-${String(selectedMonth).padStart(2, '0')}` : ''}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('DATEV Export Fehler:', error);
      alert('Export fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsExporting(false);
    }
  }, [selectedYear, selectedMonth]);

  const handleExportEAR = useCallback(async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/finance/accounting/ear-report-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: selectedYear }),
      });
      if (!response.ok) throw new Error('Export fehlgeschlagen');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ear-bericht-${selectedYear}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('E/A-Bericht Export Fehler:', error);
    } finally {
      setIsExporting(false);
    }
  }, [selectedYear]);

  const tabs = [
    { id: 'overview', label: '📊 Übersicht' },
    { id: 'transactions', label: '💳 Transaktionen' },
    { id: 'invoices', label: '📄 Rechnungen' },
    { id: 'donations', label: '❤️ Spenden' },
    { id: 'accounting', label: '📒 Buchhaltung' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanz-Dashboard</h1>
          <p className="text-sm text-gray-500">Menschlichkeit Österreich – Vereinsfinanzen {selectedYear}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={handleExportDATEV}
            disabled={isExporting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isExporting ? '⏳ Exportiere...' : '⬇️ DATEV Export'}
          </button>
          <button
            onClick={handleExportEAR}
            disabled={isExporting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isExporting ? '⏳ Exportiere...' : '📄 E/A-Bericht PDF'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Übersicht */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI-Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOCK_KPIs.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monatlicher Verlauf */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Monatlicher Verlauf {selectedYear}</h2>
              <div className="flex gap-4 mb-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded inline-block" /> Einnahmen</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded inline-block" /> Ausgaben</span>
              </div>
              <BarChart data={MOCK_MONTHLY} />
            </div>

            {/* Spendenkampagnen */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Aktive Spendenkampagnen</h2>
              {MOCK_CAMPAIGNS.map((c, i) => <CampaignProgress key={i} campaign={c} />)}
            </div>
          </div>

          {/* Letzte Transaktionen */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Letzte Transaktionen</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Datum</th>
                    <th className="pb-3 font-medium">Beschreibung</th>
                    <th className="pb-3 font-medium">Kategorie</th>
                    <th className="pb-3 font-medium text-right">Betrag</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TRANSACTIONS.slice(0, 5).map(tx => (
                    <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 text-gray-500">{formatDate(tx.date)}</td>
                      <td className="py-3 text-gray-900">{tx.description}</td>
                      <td className="py-3 text-gray-500 capitalize">{tx.category.replace('_', ' ')}</td>
                      <td className={`py-3 text-right font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3"><StatusBadge status={tx.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transaktionen */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Alle Transaktionen</h2>
            <div className="flex gap-2">
              {(['all', 'paid', 'open', 'overdue'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all' ? 'Alle' : s === 'paid' ? 'Bezahlt' : s === 'open' ? 'Offen' : 'Überfällig'}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Datum</th>
                  <th className="pb-3 font-medium">Beschreibung</th>
                  <th className="pb-3 font-medium">Rechnungs-Nr.</th>
                  <th className="pb-3 font-medium">Kategorie</th>
                  <th className="pb-3 font-medium text-right">Betrag</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 text-gray-500">{formatDate(tx.date)}</td>
                    <td className="py-3 text-gray-900">{tx.description}</td>
                    <td className="py-3 text-gray-500 font-mono text-xs">{tx.invoice_number || '—'}</td>
                    <td className="py-3 text-gray-500 capitalize">{tx.category.replace('_', ' ')}</td>
                    <td className={`py-3 text-right font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3"><StatusBadge status={tx.status} /></td>
                    <td className="py-3">
                      <button className="text-blue-600 hover:text-blue-800 text-xs mr-2">Details</button>
                      {tx.invoice_number && (
                        <button className="text-gray-500 hover:text-gray-700 text-xs">PDF</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Buchhaltung */}
      {activeTab === 'accounting' && (
        <div className="space-y-6">
          {/* E/A-Rechnung Zusammenfassung */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Einnahmen-Ausgaben-Rechnung {selectedYear}</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-700">€ 48.750</div>
                <div className="text-sm text-green-600">Gesamteinnahmen</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-700">€ 41.200</div>
                <div className="text-sm text-red-600">Gesamtausgaben</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">€ 7.550</div>
                <div className="text-sm text-blue-600">Jahresergebnis</div>
              </div>
            </div>

            {/* Kontenübersicht */}
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Kontenübersicht</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Konto</th>
                  <th className="pb-2 font-medium">Bezeichnung</th>
                  <th className="pb-2 font-medium text-right">Betrag</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-green-50"><td colSpan={3} className="py-2 px-1 text-xs font-semibold text-green-700">EINNAHMEN</td></tr>
                {[
                  { konto: '5000', name: 'Mitgliedsbeiträge', amount: 29640 },
                  { konto: '5100', name: 'Spenden', amount: 12300 },
                  { konto: '5300', name: 'Veranstaltungen', amount: 4800 },
                  { konto: '5400', name: 'Sonstige Einnahmen', amount: 2010 },
                ].map(row => (
                  <tr key={row.konto} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 font-mono text-xs text-gray-500">{row.konto}</td>
                    <td className="py-2 text-gray-700">{row.name}</td>
                    <td className="py-2 text-right text-green-600 font-medium">{formatCurrency(row.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-red-50"><td colSpan={3} className="py-2 px-1 text-xs font-semibold text-red-700">AUSGABEN</td></tr>
                {[
                  { konto: '6000', name: 'Personalaufwand', amount: 18000 },
                  { konto: '6100', name: 'Miete & Betriebskosten', amount: 10200 },
                  { konto: '6200', name: 'Bürobedarf & Verwaltung', amount: 3800 },
                  { konto: '6300', name: 'Projekt- & Veranstaltungsaufwand', amount: 6500 },
                  { konto: '6400', name: 'Werbe- & Reisekosten', amount: 2700 },
                ].map(row => (
                  <tr key={row.konto} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 font-mono text-xs text-gray-500">{row.konto}</td>
                    <td className="py-2 text-gray-700">{row.name}</td>
                    <td className="py-2 text-right text-red-600 font-medium">{formatCurrency(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export-Aktionen */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Exporte & Berichte</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'DATEV CSV Export', icon: '📊', action: handleExportDATEV, color: 'blue' },
                { label: 'E/A-Bericht PDF', icon: '📄', action: handleExportEAR, color: 'green' },
                { label: 'Jahresbericht PDF', icon: '📋', action: () => {}, color: 'purple' },
                { label: 'SEPA XML Export', icon: '🏦', action: () => {}, color: 'orange' },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action}
                  disabled={isExporting}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-${btn.color}-200 bg-${btn.color}-50 hover:bg-${btn.color}-100 transition-colors disabled:opacity-50`}
                >
                  <span className="text-2xl">{btn.icon}</span>
                  <span className="text-xs font-medium text-gray-700 text-center">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spenden */}
      {activeTab === 'donations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">€ 12.300</div>
              <div className="text-sm text-purple-600">Gesamtspenden {selectedYear}</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">89</div>
              <div className="text-sm text-purple-600">Einzelspender</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">€ 138</div>
              <div className="text-sm text-purple-600">Ø Spendenbetrag</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Spendenkampagnen</h2>
            {MOCK_CAMPAIGNS.map((c, i) => <CampaignProgress key={i} campaign={c} />)}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Spendenquittungen</h2>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                Jahresquittungen erstellen
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Erstellen Sie automatisch alle Spendenquittungen für das Steuerjahr {selectedYear - 1} und versenden Sie diese per E-Mail.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceDashboard;
