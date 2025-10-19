import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { Alert } from '../components/ui/Alert';
import { http } from '../services/http';

interface MembersMetrics {
  total: number;
  active: number;
  pending: number;
  expired: number;
  new_30d: number;
  new_90d: number;
  churn_30d: number;
}

interface FinanceMetrics {
  donations_mtd: number;
  donations_ytd: number;
  avg_donation: number;
  recurring_count: number;
  open_invoices: number;
}

interface ActivityMetrics {
  last_updates: Array<{ subject: string; date: string }>;
  recent_changes: number;
}

export default function BoardTreasurerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [membersMetrics, setMembersMetrics] = useState<MembersMetrics | null>(null);
  const [financeMetrics, setFinanceMetrics] = useState<FinanceMetrics | null>(null);
  const [activityMetrics, setActivityMetrics] = useState<ActivityMetrics | null>(null);

  // Get token from localStorage (AuthContext)
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);

      try {
        const [members, finance, activity] = await Promise.all([
          http.get<{ success: boolean; data: MembersMetrics }>('/metrics/members', { token }),
          http.get<{ success: boolean; data: FinanceMetrics }>('/metrics/finance', { token }),
          http.get<{ success: boolean; data: ActivityMetrics }>('/metrics/activity?limit=5', { token }),
        ]);

        setMembersMetrics(members.data);
        setFinanceMetrics(finance.data);
        setActivityMetrics(activity.data);
      } catch (err: any) {
        console.error('Failed to fetch dashboard metrics:', err);
        setError(err.message || 'Fehler beim Laden der Dashboard-Daten');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Vorstand/Kassier</h1>
          <p className="text-gray-600 mt-2">Kennzahlen für Mitglieder, Finanzen und Aktivitäten</p>
        </header>
        {error && (
          <Alert variant="error" className="mb-6">
            <p className="font-semibold">Fehler beim Laden der Dashboard-Daten</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm underline"
            >
              Seite neu laden
            </button>
          </Alert>
        )}

        {/* Mitglieder KPIs */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Mitglieder
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Gesamt"
              value={membersMetrics?.total ?? 0}
              icon={<Users className="w-6 h-6 text-blue-600" />}
              loading={loading}
            />
            <KpiCard
              title="Aktiv"
              value={membersMetrics?.active ?? 0}
              variant="success"
              loading={loading}
            />
            <KpiCard
              title="Neu (30 Tage)"
              value={membersMetrics?.new_30d ?? 0}
              deltaText="Neue Mitglieder"
              icon={<TrendingUp className="w-6 h-6 text-green-600" />}
              loading={loading}
            />
            <KpiCard
              title="Abgänge (30 Tage)"
              value={membersMetrics?.churn_30d ?? 0}
              variant={membersMetrics && membersMetrics.churn_30d > 5 ? 'warning' : 'default'}
              deltaText="Churn Rate"
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <KpiCard
              title="Pending"
              value={membersMetrics?.pending ?? 0}
              variant="warning"
              deltaText="Warten auf Freigabe"
              loading={loading}
            />
            <KpiCard
              title="Abgelaufen"
              value={membersMetrics?.expired ?? 0}
              variant="error"
              deltaText="Erneuerung erforderlich"
              loading={loading}
            />
            <KpiCard
              title="Neu (90 Tage)"
              value={membersMetrics?.new_90d ?? 0}
              deltaText="Quartalswachstum"
              loading={loading}
            />
          </div>
        </section>

        {/* Finanzen KPIs */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Finanzen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              title="Spenden MTD"
              value={`€ ${financeMetrics?.donations_mtd.toFixed(2) ?? '0.00'}`}
              deltaText="Monat aktuell"
              icon={<DollarSign className="w-6 h-6 text-green-600" />}
              loading={loading}
            />
            <KpiCard
              title="Spenden YTD"
              value={`€ ${financeMetrics?.donations_ytd.toFixed(2) ?? '0.00'}`}
              deltaText="Jahr aktuell"
              loading={loading}
            />
            <KpiCard
              title="Ø Spende"
              value={`€ ${financeMetrics?.avg_donation.toFixed(2) ?? '0.00'}`}
              deltaText="Durchschnitt"
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <KpiCard
              title="Dauerspenden"
              value={financeMetrics?.recurring_count ?? 0}
              variant="success"
              deltaText="Aktive Abos"
              loading={loading}
            />
            <KpiCard
              title="Offene Posten"
              value={financeMetrics?.open_invoices ?? 0}
              variant={financeMetrics && financeMetrics.open_invoices > 10 ? 'warning' : 'default'}
              deltaText="Unbezahlte Rechnungen"
              loading={loading}
            />
          </div>
        </section>

        {/* Aktivität */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            Aktivität
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <KpiCard
              title="Änderungen (24h)"
              value={activityMetrics?.recent_changes ?? 0}
              deltaText="Letzte 24 Stunden"
              icon={<Activity className="w-6 h-6 text-purple-600" />}
              loading={loading}
            />

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Letzte Updates</h3>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : activityMetrics?.last_updates && activityMetrics.last_updates.length > 0 ? (
                <ul className="space-y-2">
                  {activityMetrics.last_updates.map((update, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex justify-between">
                      <span>{update.subject}</span>
                      <span className="text-gray-500">
                        {new Date(update.date).toLocaleDateString('de-AT', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Keine aktuellen Updates</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
