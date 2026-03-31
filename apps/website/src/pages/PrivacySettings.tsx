import React, { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, DataDeletionCreateRequest, DeletionRequestItem } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { http } from '../services/http';

export default function PrivacySettings() {
  const { token } = useAuth();
  const [reason, setReason] = useState('Ich möchte meinen Account löschen');
  const [scope, setScope] = useState<'full' | 'partial'>('full');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<DeletionRequestItem[] | null>(null);
  const [consents, setConsents] = useState<Array<{ consent_type: string; status: string; granted_at?: string | null; revoked_at?: string | null }>>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => Boolean(token && reason.trim().length > 5), [token, reason]);

  async function fetchRequests() {
    if (!token) return;
    try {
      const [deletionRes, consentRes] = await Promise.all([
        api.privacy.listDeletions(token),
        http.get<{ success: boolean; data: { consents: Array<{ consent_type: string; status: string; granted_at?: string | null; revoked_at?: string | null }> } }>('/api/privacy/consents', { token }),
      ]);
      const list = deletionRes?.data?.requests || [];
      setRequests(list);
      setConsents(consentRes.data.consents || []);
    } catch (_e) {
      // ignore
    }
  }

  async function onRequestDataExport() {
    if (!token) return;
    setExportLoading(true);
    setExportMessage(null);
    try {
      await api.members.requestDataExport('Datenauskunft gemäß Art. 15 DSGVO', token);
      setExportMessage('Ihr Datenexport wurde angefordert. Sie erhalten in Kürze eine E-Mail.');
    } catch (_e) {
      setExportMessage('Fehler beim Anfordern des Datenexports. Bitte versuchen Sie es erneut.');
    } finally {
      setExportLoading(false);
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
   
  }, [token]);

  if (!token) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Datenschutz & Konto</h1>
        <p className="mb-2">Bitte melde dich an, um Export-, Consent- und Löschanfragen zu verwalten.</p>
        <a className="text-blue-600 underline" href="/login">Zum Login</a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Datenschutz-Center"
        description="Datenexport, Einwilligungen und Löschanfragen an einem Ort. Rechtliche Aufbewahrungspflichten können bestimmte Daten weiterhin erfordern."
        breadcrumb={<Breadcrumb items={[{ label: 'Mitgliederbereich' }, { label: 'Datenschutz' }]} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="border rounded-md p-4 space-y-3 bg-white">
          <h2 className="text-xl font-semibold">Datenexport anfordern</h2>
          <p className="text-sm text-gray-600">
            Sie können eine Kopie Ihrer gespeicherten Daten anfordern. Der Export wird nach Bearbeitung per E-Mail bereitgestellt.
          </p>
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={onRequestDataExport}
            disabled={exportLoading}
          >
            {exportLoading ? 'Sende Anfrage…' : 'Datenexport anfordern'}
          </button>
          {exportMessage && (
            <p className={`text-sm ${exportMessage.includes('Fehler') ? 'text-red-700' : 'text-green-700'}`}>
              {exportMessage}
            </p>
          )}
        </section>

        <section className="border rounded-md p-4 bg-white">
          <h2 className="text-xl font-semibold mb-3">Einwilligungen</h2>
          {!consents.length ? (
            <p className="text-sm text-gray-600">Noch keine gespeicherten Einwilligungen vorhanden.</p>
          ) : (
            <ul className="space-y-3">
              {consents.map((consent, index) => (
                <li key={`${consent.consent_type}-${index}`} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{consent.consent_type}</span>
                    <span className={`text-xs font-semibold ${consent.status === 'granted' ? 'text-green-700' : 'text-red-700'}`}>
                      {consent.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Aktiv seit: {consent.granted_at ? new Date(consent.granted_at).toLocaleString('de-AT') : '—'}
                    {consent.revoked_at ? ` · Widerrufen: ${new Date(consent.revoked_at).toLocaleString('de-AT')}` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <form onSubmit={onRequestDeletion} className="space-y-4 border rounded-md p-4 bg-white">
        <h2 className="text-xl font-semibold">Löschantrag stellen</h2>
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

      <section className="bg-white border rounded-md p-4">
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
