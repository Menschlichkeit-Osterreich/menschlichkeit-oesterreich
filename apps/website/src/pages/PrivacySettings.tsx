import React, { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, DataDeletionCreateRequest, DeletionRequestItem } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';

export default function PrivacySettings() {
  const { token } = useAuth();
  const [reason, setReason] = useState('Ich möchte meinen Account löschen');
  const [scope, setScope] = useState<'full' | 'partial'>('full');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<DeletionRequestItem[] | null>(null);

  const canSubmit = useMemo(() => Boolean(token && reason.trim().length > 5), [token, reason]);

  async function fetchRequests() {
    if (!token) return;
    try {
      const res = await api.privacy.listDeletions(token);
      const list = res?.data?.requests || [];
      setRequests(list);
    } catch (e) {
      // ignore
    }
  }

  async function onRequestDeletion(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError('Bitte einloggen, um die Löschung anzufordern.');
      return;
    }
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const payload: DataDeletionCreateRequest = { reason, scope };
      const res = await api.privacy.requestDeletion(payload, token);
      setMessage(res?.message || 'Löschantrag wurde übermittelt.');
      await fetchRequests();
    } catch (err: any) {
      setError(err?.message || 'Fehler beim Übermitteln des Löschantrags');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Datenschutz & Konto</h1>
        <p className="mb-2">Bitte melde dich an, um Kontolöschungen zu verwalten.</p>
        <a className="text-blue-600 underline" href="/Login">Zum Login</a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Mein Konto löschen (DSGVO Art. 17)"
        description="Anfragen können rechtliche Ausnahmen (z. B. Aufbewahrungspflichten) berücksichtigen und ggf. zur Anonymisierung führen."
        breadcrumb={<Breadcrumb items={[{ label: 'Einstellungen' }, { label: 'Datenschutz' }]} />}
      />
      <header>
        <h1 className="text-2xl font-semibold">Mein Konto löschen (DSGVO Art. 17)</h1>
        <p className="text-sm text-gray-600">Anfragen können rechtliche Ausnahmen (z. B. Aufbewahrungspflichten) berücksichtigen und ggf. zur Anonymisierung führen.</p>
      </header>

      <form onSubmit={onRequestDeletion} className="space-y-4 border rounded-md p-4">
        <div>
          <label className="block text-sm font-medium mb-1">Begründung</label>
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Umfang</label>
          <select
            className="border rounded p-2"
            value={scope}
            onChange={(e) => setScope(e.target.value as any)}
          >
            <option value="full">Vollständige Löschung (falls zulässig)</option>
            <option value="partial">Teilweise (nur Marketingdaten)</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={!canSubmit || loading}
          >
            {loading ? 'Sende…' : 'Löschantrag stellen'}
          </button>
          {message && <span className="text-green-700 text-sm">{message}</span>}
          {error && <span className="text-red-700 text-sm">{error}</span>}
        </div>
      </form>

      <section>
        <h2 className="text-xl font-semibold mb-2">Meine Löschanträge</h2>
        {!requests?.length && <p className="text-sm text-gray-600">Keine Anträge vorhanden.</p>}
        {!!requests?.length && (
          <ul className="divide-y border rounded-md">
            {requests.map((r) => (
              <li key={r.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">#{r.id} · {r.status}</div>
                  <div className="text-xs text-gray-500">Angefragt: {new Date(r.requested_at).toLocaleString()}</div>
                </div>
                {r.completed_at && (
                  <div className="text-xs text-gray-500">Abgeschlossen: {new Date(r.completed_at).toLocaleString()}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
