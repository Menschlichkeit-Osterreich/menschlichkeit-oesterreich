import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';

export default function AdminQueuePage() {
  const { token, isAdmin } = useAuth();
  const [stats, setStats] = React.useState<any | null>(null);
  const [dlq, setDlq] = React.useState<{ total: number; items: any[] } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [delay, setDelay] = React.useState<number>(60);

  async function refresh() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.queue.stats(token);
      setStats(res.data);
      const d = await api.queue.dlqList(token, 50, 0);
      setDlq({ total: d?.data?.total || 0, items: d?.data?.items || [] });
    } catch (e: any) {
      setError(e?.message || 'Konnte Queue-Status nicht laden');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { refresh(); }, [token]);

  if (!token || !isAdmin) {
    return (
      <div className="p-6">
        <div className="text-red-700">Kein Zugriff.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Queue-Status"
        description="Überblick über Webhook-Warteschlange und Dead-Letter-Queue."
        breadcrumb={<Breadcrumb items={[{ label: 'Admin' }, { label: 'Queue' }]} />}
        actions={<button className="px-3 py-2 border rounded" onClick={refresh} disabled={loading}>{loading ? 'Aktualisiere…' : 'Aktualisieren'}</button>}
      />

      {error && <div className="text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border rounded p-3">
          <div className="text-sm text-secondary-600">Main</div>
          <div className="text-2xl font-semibold">{stats?.main?.size ?? '—'}</div>
          <div className="text-xs text-secondary-600">Ältestes Alter: {stats?.main?.oldest_age_seconds ?? '—'}s</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-sm text-secondary-600">Delayed</div>
          <div className="text-2xl font-semibold">{stats?.delayed?.size ?? '—'}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-sm text-secondary-600">DLQ</div>
          <div className="text-2xl font-semibold">{stats?.dlq?.size ?? '—'}</div>
        </div>
      </div>

      <section className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Dead‑Letter‑Queue</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-secondary-700 flex items-center gap-2">
              <span>Requeue‑Delay (s)</span>
              <input type="number" className="w-24 border rounded p-1" value={delay} min={0} onChange={e => setDelay(Number(e.target.value))} />
            </label>
            <button
              className="px-3 py-2 border rounded text-red-700"
              onClick={async () => {
                if (!token) return; if (!confirm('DLQ vollständig leeren?')) return;
                setBusyId('ALL');
                try {
                  await api.queue.dlqPurge(token);
                  await refresh();
                } catch (e: any) {
                  setError(e?.message || 'Purge fehlgeschlagen');
                } finally { setBusyId(null); }
              }}
              disabled={busyId !== null}
            >
              Alle löschen
            </button>
          </div>
        </div>

        {!dlq?.items?.length && <p className="text-sm text-secondary-600">DLQ leer.</p>}
        {!!dlq?.items?.length && (
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-secondary-50 text-secondary-700">
                <tr>
                  <th className="text-left px-2 py-2">ID</th>
                  <th className="text-left px-2 py-2">Versuche</th>
                  <th className="text-left px-2 py-2">Letzter Fehler</th>
                  <th className="text-left px-2 py-2">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {dlq.items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="px-2 py-2 font-mono text-xs break-all">{it.id}</td>
                    <td className="px-2 py-2">{it.attempts} / {it.max_attempts}</td>
                    <td className="px-2 py-2 max-w-[24rem] truncate" title={it.last_error || ''}>{it.last_error || '—'}</td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-2 py-1 border rounded"
                          onClick={async () => {
                            if (!token) return;
                            setBusyId(it.id);
                            try {
                              await api.queue.dlqRequeue(it.id, token, delay);
                              await refresh();
                            } catch (e: any) {
                              setError(e?.message || 'Requeue fehlgeschlagen');
                            } finally { setBusyId(null); }
                          }}
                          disabled={busyId !== null}
                        >
                          Requeue
                        </button>
                        <button
                          className="px-2 py-1 border rounded text-red-700"
                          onClick={async () => {
                            if (!token) return; if (!confirm('Item aus DLQ löschen?')) return;
                            setBusyId(it.id + ':purge');
                            try {
                              await api.queue.dlqPurge(token, it.id);
                              await refresh();
                            } catch (e: any) {
                              setError(e?.message || 'Purge fehlgeschlagen');
                            } finally { setBusyId(null); }
                          }}
                          disabled={busyId !== null}
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
