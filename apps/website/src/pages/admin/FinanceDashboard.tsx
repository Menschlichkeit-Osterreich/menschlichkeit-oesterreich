import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  dashboardApi,
  type FinanceActionResult,
  type FinanceCockpit,
  type FinanceReportDescriptor,
} from '../../services/dashboard-api';

type TabId =
  | 'overview'
  | 'receivables'
  | 'payables'
  | 'banking'
  | 'payroll'
  | 'assets'
  | 'closing'
  | 'sync'
  | 'reports';

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Übersicht' },
  { id: 'receivables', label: 'Forderungen' },
  { id: 'payables', label: 'Kreditoren & Ausgaben' },
  { id: 'banking', label: 'Zahlungen & Bank' },
  { id: 'payroll', label: 'Lohn' },
  { id: 'assets', label: 'Anlagen' },
  { id: 'closing', label: 'Monatsabschluss' },
  { id: 'sync', label: 'Fehler & Sync' },
  { id: 'reports', label: 'Berichte' },
];

const formatCurrency = (amountInEuro: number, currency = 'EUR') =>
  new Intl.NumberFormat('de-AT', { style: 'currency', currency }).format(amountInEuro);

const centsToCurrency = (amountInCents: number) => formatCurrency(amountInCents / 100);

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('de-AT') : 'Noch offen';

export default function FinanceDashboard() {
  const location = useLocation();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<TabId>(
    location.pathname.includes('/rechnungen') ? 'receivables' : 'overview'
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [cockpit, setCockpit] = React.useState<FinanceCockpit | null>(null);
  const [reports, setReports] = React.useState<FinanceReportDescriptor[]>([]);
  const [busyAction, setBusyAction] = React.useState<string | null>(null);
  const [payableForm, setPayableForm] = React.useState({
    supplier_name: '',
    supplier_email: '',
    description: '',
    amount: '',
    due_date: '',
  });
  const [journalForm, setJournalForm] = React.useState({
    posting_date: new Date().toISOString().slice(0, 10),
    memo: '',
    debit_account: '',
    credit_account: '',
    amount: '',
  });

  const load = React.useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [cockpitResponse, reportResponse] = await Promise.all([
        dashboardApi.getFinanceCockpit(token),
        dashboardApi.getFinanceReportCatalog(token),
      ]);
      setCockpit(cockpitResponse.data);
      setReports(reportResponse.data || []);
    } catch (err) {
      setError('Das Finanzcockpit konnte nicht geladen werden.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    load();
  }, [load]);

  const runAction = React.useCallback(
    async (actionKey: string, action: () => Promise<FinanceActionResult | void>) => {
      setBusyAction(actionKey);
      setError(null);
      setNotice(null);
      try {
        const result = await action();
        if (result && typeof result === 'object' && 'target_name' in result) {
          setNotice(`ERPNext-Dokument erstellt: ${result.target_name}`);
        } else {
          setNotice('Aktion erfolgreich ausgeführt.');
        }
        await load();
      } catch (err: any) {
        const message =
          err?.body?.error?.message ||
          err?.body?.detail ||
          err?.message ||
          'Die Aktion konnte nicht abgeschlossen werden.';
        setError(String(message));
      } finally {
        setBusyAction(null);
      }
    },
    [load]
  );

  async function handleCreatePayable(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    await runAction('payable', () =>
      dashboardApi.createFinancePayable(
        {
          supplier_name: payableForm.supplier_name,
          supplier_email: payableForm.supplier_email || undefined,
          description: payableForm.description,
          amount: Number(payableForm.amount || 0),
          due_date: payableForm.due_date || undefined,
        },
        token
      )
    );
    setPayableForm({
      supplier_name: '',
      supplier_email: '',
      description: '',
      amount: '',
      due_date: '',
    });
  }

  async function handleCreateJournal(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    await runAction('journal', () =>
      dashboardApi.createManualJournal(
        {
          posting_date: journalForm.posting_date,
          memo: journalForm.memo,
          lines: [
            {
              account: journalForm.debit_account,
              debit: Number(journalForm.amount || 0),
            },
            {
              account: journalForm.credit_account,
              credit: Number(journalForm.amount || 0),
            },
          ],
        },
        token
      )
    );
    setJournalForm(current => ({ ...current, memo: '', debit_account: '', credit_account: '', amount: '' }));
  }

  async function handleProcessSync() {
    if (!token) return;
    await runAction('sync', async () => {
      await dashboardApi.processFinanceSync(token, 20);
    });
  }

  async function handleRequeue(syncId: string) {
    if (!token) return;
    await runAction(`requeue-${syncId}`, async () => {
      await dashboardApi.requeueFinanceSync(syncId, token);
    });
  }

  async function handleDownloadReport(reportId: string, format: 'json' | 'csv') {
    if (!token) return;
    setBusyAction(`report-${reportId}`);
    setError(null);
    try {
      const response = await dashboardApi.getFinanceReport(reportId, token, format);
      const data = response.data;
      const content =
        format === 'csv'
          ? data.content || ''
          : JSON.stringify(data.rows ?? data, null, 2);
      const blob = new Blob([content], {
        type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportId}-${data.generated_at}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice(`Report ${reportId} wurde bereitgestellt.`);
    } catch (err: any) {
      const message =
        err?.body?.error?.message ||
        err?.body?.detail ||
        err?.message ||
        'Der Report konnte nicht erzeugt werden.';
      setError(String(message));
    } finally {
      setBusyAction(null);
    }
  }

  const overview = cockpit?.overview;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Finanzcockpit</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Portal-Hauptcockpit für ERPNext-Buchhaltung, offene Posten, Sync und Monatsabschluss.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleProcessSync}
            disabled={!token || busyAction === 'sync'}
            className="rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busyAction === 'sync' ? 'Synchronisiere…' : 'Sync jetzt ausführen'}
          </button>
          <Link
            to="/admin/reports"
            className="rounded-full border border-secondary-300 px-4 py-2 text-sm font-semibold text-secondary-700"
          >
            Berichte öffnen
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800">
          {notice}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Jahreseinnahmen', value: overview ? centsToCurrency(overview.einnahmen_jahr_cents) : '…' },
          { label: 'Jahresausgaben', value: overview ? centsToCurrency(overview.ausgaben_jahr_cents) : '…' },
          { label: 'Offene Forderungen', value: cockpit?.receivables.length ?? '…' },
          { label: 'Sync-Fehler', value: cockpit?.sync.failed ?? '…' },
        ].map(item => (
          <div key={item.label} className="rounded-3xl border border-secondary-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-secondary-500">{item.label}</div>
            <div className="mt-2 text-2xl font-bold text-secondary-900">{loading ? '…' : item.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 rounded-3xl bg-secondary-100 p-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              activeTab === tab.id
                ? 'bg-white text-secondary-900 shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900',
            ].join(' ')}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading || !cockpit ? (
        <div className="rounded-3xl border border-secondary-200 bg-white p-6 text-sm text-secondary-500 shadow-sm">
          Finanzdaten werden geladen…
        </div>
      ) : activeTab === 'overview' ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-secondary-900">Monatsstatus</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <SummaryCard label="Einnahmen" value={centsToCurrency(cockpit.overview.einnahmen_monat_cents)} />
              <SummaryCard label="Ausgaben" value={centsToCurrency(cockpit.overview.ausgaben_monat_cents)} />
              <SummaryCard label="Saldo" value={centsToCurrency(cockpit.overview.saldo_monat_cents)} />
            </div>
          </section>

          <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-secondary-900">Systemstatus</h2>
            <div className="mt-5 space-y-3">
              <StatusRow label="Datenquelle" value={cockpit.overview.source_system} />
              <StatusRow label="ERPNext aktiviert" value={cockpit.overview.erpnext_enabled ? 'Ja' : 'Nein'} />
              <StatusRow label="Offene Forderungen" value={String(cockpit.receivables.length)} />
              <StatusRow label="Offene Verbindlichkeiten" value={String(cockpit.payables.length)} />
              <StatusRow label="Letzter erfolgreicher Sync" value={formatDate(cockpit.sync.latest_success_at)} />
            </div>
          </section>
        </div>
      ) : activeTab === 'receivables' ? (
        <DataTableSection
          title="Forderungen & Debitoren"
          emptyText="Keine offenen Forderungen vorhanden."
          headers={['Beleg', 'Kunde', 'Status', 'Fällig', 'Offen']}
          rows={cockpit.receivables.map(row => [
            row.name,
            row.display_name || row.party || '—',
            row.status || '—',
            formatDate(row.due_date),
            formatCurrency(row.outstanding_amount || 0),
          ])}
        />
      ) : activeTab === 'payables' ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <DataTableSection
            title="Verbindlichkeiten & Eingangsrechnungen"
            emptyText="Keine offenen Verbindlichkeiten vorhanden."
            headers={['Beleg', 'Lieferant', 'Status', 'Fällig', 'Offen']}
            rows={cockpit.payables.map(row => [
              row.name,
              row.display_name || row.party || '—',
              row.status || '—',
              formatDate(row.due_date),
              formatCurrency(row.outstanding_amount || 0),
            ])}
          />

          <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-secondary-900">Neue Ausgabe erfassen</h2>
            <form className="mt-5 space-y-4" onSubmit={handleCreatePayable}>
              <Input
                label="Lieferant"
                value={payableForm.supplier_name}
                onChange={value => setPayableForm(current => ({ ...current, supplier_name: value }))}
              />
              <Input
                label="E-Mail"
                type="email"
                value={payableForm.supplier_email}
                onChange={value => setPayableForm(current => ({ ...current, supplier_email: value }))}
              />
              <Input
                label="Beschreibung"
                value={payableForm.description}
                onChange={value => setPayableForm(current => ({ ...current, description: value }))}
              />
              <Input
                label="Betrag in EUR"
                type="number"
                step="0.01"
                value={payableForm.amount}
                onChange={value => setPayableForm(current => ({ ...current, amount: value }))}
              />
              <Input
                label="Fällig am"
                type="date"
                value={payableForm.due_date}
                onChange={value => setPayableForm(current => ({ ...current, due_date: value }))}
              />
              <button
                type="submit"
                disabled={busyAction === 'payable'}
                className="rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busyAction === 'payable' ? 'Speichere…' : 'Ausgabe in ERPNext anlegen'}
              </button>
            </form>
          </section>
        </div>
      ) : activeTab === 'banking' ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <DataTableSection
            title="Bankkonten"
            emptyText="Keine ERPNext-Bankkonten gefunden."
            headers={['Konto', 'Bank', 'Kontonummer', 'Firma']}
            rows={cockpit.bank_accounts.map(row => [
              row.name,
              row.bank || '—',
              row.bank_account_no || '—',
              row.company || '—',
            ])}
          />
          <DataTableSection
            title="Offene Expense Claims"
            emptyText="Keine offenen Expense Claims gefunden."
            headers={['Beleg', 'Mitarbeiter*in', 'Status', 'Datum', 'Betrag']}
            rows={cockpit.expense_claims.map(row => [
              row.name,
              row.employee_name || '—',
              row.approval_status || '—',
              formatDate(row.posting_date),
              formatCurrency(Number(row.total_claimed_amount || 0)),
            ])}
          />
        </div>
      ) : activeTab === 'payroll' ? (
        <DataTableSection
          title="Payroll-Läufe"
          emptyText="Keine Payroll Entries verfügbar."
          headers={['Run', 'Firma', 'Von', 'Bis', 'Status']}
          rows={cockpit.payroll_runs.map(row => [
            row.name,
            row.company || '—',
            formatDate(row.start_date),
            formatDate(row.end_date),
            row.status || '—',
          ])}
        />
      ) : activeTab === 'assets' ? (
        <DataTableSection
          title="Anlagenmanagement"
          emptyText="Keine Assets verfügbar."
          headers={['Asset', 'Name', 'Status', 'Kaufdatum', 'Anschaffung']}
          rows={cockpit.assets.map(row => [
            row.name,
            row.asset_name || '—',
            row.status || '—',
            formatDate(row.purchase_date),
            formatCurrency(Number(row.gross_purchase_amount || 0)),
          ])}
        />
      ) : activeTab === 'closing' ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-secondary-900">Manuelle Journalbuchung</h2>
            <form className="mt-5 space-y-4" onSubmit={handleCreateJournal}>
              <Input
                label="Buchungsdatum"
                type="date"
                value={journalForm.posting_date}
                onChange={value => setJournalForm(current => ({ ...current, posting_date: value }))}
              />
              <Input
                label="Memo"
                value={journalForm.memo}
                onChange={value => setJournalForm(current => ({ ...current, memo: value }))}
              />
              <Input
                label="Sollkonto"
                value={journalForm.debit_account}
                onChange={value => setJournalForm(current => ({ ...current, debit_account: value }))}
              />
              <Input
                label="Habenkonto"
                value={journalForm.credit_account}
                onChange={value => setJournalForm(current => ({ ...current, credit_account: value }))}
              />
              <Input
                label="Betrag in EUR"
                type="number"
                step="0.01"
                value={journalForm.amount}
                onChange={value => setJournalForm(current => ({ ...current, amount: value }))}
              />
              <button
                type="submit"
                disabled={busyAction === 'journal'}
                className="rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busyAction === 'journal' ? 'Buche…' : 'Journal Entry anlegen'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-secondary-900">Konten- und Mapping-Status</h2>
            <div className="mt-5 space-y-3">
              {Object.entries(cockpit.mapping).map(([key, value]) => (
                <StatusRow key={key} label={key} value={value} />
              ))}
            </div>
          </section>
        </div>
      ) : activeTab === 'sync' ? (
        <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">Fehler, Queue und Requeue</h2>
              <p className="mt-1 text-sm text-secondary-500">
                Pending: {cockpit.sync.pending} · Failed: {cockpit.sync.failed} · Success: {cockpit.sync.success}
              </p>
            </div>
            <button
              type="button"
              onClick={handleProcessSync}
              disabled={busyAction === 'sync'}
              className="rounded-full border border-secondary-300 px-4 py-2 text-sm font-semibold text-secondary-700 disabled:opacity-60"
            >
              {busyAction === 'sync' ? 'Synchronisiere…' : 'Queue verarbeiten'}
            </button>
          </div>
          {cockpit.sync.failures.length === 0 ? (
            <p className="mt-6 text-sm text-secondary-500">Keine offenen Sync-Fehler vorhanden.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {cockpit.sync.failures.map(failure => (
                <div key={failure.id} className="rounded-2xl border border-secondary-200 px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-medium text-secondary-900">
                        {failure.operation} · {failure.source_entity_type}:{failure.source_entity_id}
                      </div>
                      <div className="mt-1 text-sm text-secondary-500">
                        {failure.last_error || 'Ohne Fehlertext'} · Versuche: {failure.attempts}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRequeue(failure.id)}
                      disabled={busyAction === `requeue-${failure.id}`}
                      className="rounded-full bg-secondary-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {busyAction === `requeue-${failure.id}` ? 'Requeue…' : 'Erneut einreihen'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Berichte & Exporte</h2>
          {reports.length === 0 ? (
            <p className="mt-4 text-sm text-secondary-500">Keine Reports konfiguriert.</p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {reports.map(report => (
                <div key={report.id} className="rounded-2xl border border-secondary-200 p-4">
                  <div className="font-medium text-secondary-900">{report.title}</div>
                  <p className="mt-1 text-sm text-secondary-500">{report.description}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadReport(report.id, 'json')}
                      disabled={busyAction === `report-${report.id}`}
                      className="rounded-full border border-secondary-300 px-3 py-1.5 text-xs font-semibold text-secondary-700 disabled:opacity-60"
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadReport(report.id, 'csv')}
                      disabled={busyAction === `report-${report.id}`}
                      className="rounded-full border border-secondary-300 px-3 py-1.5 text-xs font-semibold text-secondary-700 disabled:opacity-60"
                    >
                      CSV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-secondary-900">{value}</div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-secondary-200 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-secondary-900">{value}</div>
    </div>
  );
}

function DataTableSection({
  title,
  headers,
  rows,
  emptyText,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  emptyText: string;
}) {
  return (
    <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-secondary-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-secondary-500">{emptyText}</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-secondary-200 text-secondary-500">
                {headers.map(header => (
                  <th key={header} className="pb-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${title}-${rowIndex}`} className="border-b border-secondary-100">
                  {row.map(cell => (
                    <td key={`${title}-${rowIndex}-${cell}`} className="py-3 text-secondary-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-secondary-700">{label}</span>
      <input
        type={type}
        value={value}
        step={step}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-2xl border border-secondary-300 px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
      />
    </label>
  );
}
