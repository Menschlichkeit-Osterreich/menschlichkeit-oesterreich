import React from 'react';
import { Activity, DollarSign, RefreshCcw, Users } from 'lucide-react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../auth/AuthContext';
import { dashboardApi } from '../services/dashboard-api';

function centsToEur(cents: number): string {
  return `€ ${(cents / 100).toLocaleString('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BoardTreasurerDashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [kpis, setKpis] = React.useState<Awaited<ReturnType<typeof dashboardApi.getKpis>> | null>(null);
  const [cockpit, setCockpit] = React.useState<Awaited<ReturnType<typeof dashboardApi.getFinanceCockpit>> | null>(null);

  const load = React.useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [kpiData, cockpitData] = await Promise.all([
        dashboardApi.getKpis(token),
        dashboardApi.getFinanceCockpit(token),
      ]);
      setKpis(kpiData);
      setCockpit(cockpitData);
    } catch (err: any) {
      setError(
        err?.body?.error?.message ||
          err?.body?.detail ||
          err?.message ||
          'Die Finanzkennzahlen konnten nicht geladen werden.'
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    load();
  }, [load]);

  const finance = cockpit?.data;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Vorstand/Kassier</h1>
            <p className="mt-2 text-gray-600">
              Live-Kennzahlen für Mitglieder, ERPNext-Sync, offene Posten und Abschlussstatus
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-60"
          >
            <RefreshCcw className="h-4 w-4" />
            Aktualisieren
          </button>
        </header>

        {error && (
          <Alert variant="error" className="mb-6">
            <p className="font-semibold">Fehler beim Laden der Vorstandsansicht</p>
            <p className="mt-1 text-sm">{error}</p>
          </Alert>
        )}

        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <Users className="h-6 w-6 text-blue-600" />
            Mitglieder & Bewegung
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Gesamtmitglieder"
              value={kpis?.members_total ?? 0}
              icon={<Users className="h-6 w-6 text-blue-600" />}
              loading={loading}
            />
            <KpiCard
              title="Netto neu (Monat)"
              value={kpis?.net_new_members_month ?? 0}
              variant={(kpis?.net_new_members_month ?? 0) >= 0 ? 'success' : 'warning'}
              loading={loading}
            />
            <KpiCard
              title="Spenden YTD"
              value={centsToEur(kpis?.donations_ytd_cents ?? 0)}
              icon={<DollarSign className="h-6 w-6 text-green-600" />}
              loading={loading}
            />
            <KpiCard
              title="Monatssaldo"
              value={centsToEur(finance?.overview.saldo_monat_cents ?? 0)}
              variant={(finance?.overview.saldo_monat_cents ?? 0) >= 0 ? 'success' : 'error'}
              loading={loading}
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <DollarSign className="h-6 w-6 text-green-600" />
            Buchhaltung & Offene Posten
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Offene Forderungen"
              value={finance?.receivables.length ?? 0}
              deltaText="Sales Invoices"
              loading={loading}
            />
            <KpiCard
              title="Offene Verbindlichkeiten"
              value={finance?.payables.length ?? 0}
              deltaText="Purchase Invoices"
              loading={loading}
            />
            <KpiCard
              title="Payroll Runs"
              value={finance?.payroll_runs.length ?? 0}
              deltaText="ERPNext HR/Payroll"
              loading={loading}
            />
            <KpiCard
              title="Assets"
              value={finance?.assets.length ?? 0}
              deltaText="ERPNext Asset Management"
              loading={loading}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <Activity className="h-6 w-6 text-purple-600" />
            Integrations- und Kontrollstatus
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <KpiCard
              title="Sync Pending"
              value={finance?.sync.pending ?? 0}
              deltaText="Warten auf Verarbeitung"
              loading={loading}
            />
            <KpiCard
              title="Sync-Fehler"
              value={finance?.sync.failed ?? 0}
              variant={(finance?.sync.failed ?? 0) > 0 ? 'warning' : 'success'}
              deltaText={finance?.sync.erpnext_enabled ? 'ERPNext aktiv' : 'ERPNext noch nicht verbunden'}
              loading={loading}
            />

            <div className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2">
              <h3 className="mb-3 text-sm font-medium text-gray-600">Letzte ERP-/Sync-Fehler</h3>
              {!finance || finance.sync.failures.length === 0 ? (
                <p className="text-sm italic text-gray-500">Keine offenen Fehler vorhanden.</p>
              ) : (
                <ul className="space-y-2">
                  {finance.sync.failures.map(failure => (
                    <li key={failure.id} className="flex flex-col gap-1 rounded-lg border border-gray-100 px-4 py-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {failure.operation} · {failure.source_entity_type}:{failure.source_entity_id}
                        </div>
                        <div className="text-xs text-gray-500">{failure.last_error || 'Ohne Fehlertext'}</div>
                      </div>
                      <div className="text-xs text-gray-500">Versuche: {failure.attempts}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
