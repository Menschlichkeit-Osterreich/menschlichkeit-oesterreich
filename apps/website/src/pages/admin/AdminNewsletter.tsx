import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { http } from '../../services/http';

interface NewsletterOverview {
  subscribersTotal: number;
  averageOpenRate: number;
  averageClickRate: number;
  campaignsYtd: number;
}

interface NewsletterSegment {
  id: string;
  label: string;
  recipients: number;
}

interface NewsletterCampaign {
  id: string;
  subject: string;
  segment: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipients_count: number;
  open_rate: number;
  click_rate: number;
  scheduled_at?: string | null;
  sent_at?: string | null;
  created_at: string;
  updated_at: string;
}

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString('de-AT') : 'Nicht gesetzt';

export default function AdminNewsletter() {
  const { token } = useAuth();
  const [overview, setOverview] = React.useState<NewsletterOverview | null>(null);
  const [segments, setSegments] = React.useState<NewsletterSegment[]>([]);
  const [campaigns, setCampaigns] = React.useState<NewsletterCampaign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'campaigns' | 'segments' | 'stats'>('campaigns');
  const [showComposer, setShowComposer] = React.useState(false);
  const [form, setForm] = React.useState({
    subject: '',
    segment: 'all_members',
    content: '',
    scheduled_at: '',
  });

  const loadData = React.useCallback(async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [overviewResponse, segmentResponse, campaignResponse] = await Promise.all([
        http.get<{ success: boolean; data: NewsletterOverview }>('/api/newsletter/admin/overview', { token }),
        http.get<{ success: boolean; data: NewsletterSegment[] }>('/api/newsletter/admin/segments', { token }),
        http.get<{ success: boolean; data: NewsletterCampaign[] }>('/api/newsletter/admin/campaigns', { token }),
      ]);

      setOverview(overviewResponse.data);
      setSegments(segmentResponse.data);
      setCampaigns(campaignResponse.data);
    } catch {
      setError('Newsletter-Daten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await http.post(
        '/api/newsletter/admin/campaigns',
        {
          ...form,
          scheduled_at: form.scheduled_at || null,
        },
        { token },
      );
      setShowComposer(false);
      setForm({
        subject: '',
        segment: 'all_members',
        content: '',
        scheduled_at: '',
      });
      setMessage('Kampagne wurde gespeichert.');
      await loadData();
    } catch {
      setError('Die Kampagne konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSend(campaignId: string) {
    if (!token) {
      return;
    }

    setError(null);
    setMessage(null);
    try {
      await http.post(`/api/newsletter/admin/campaigns/${campaignId}/send`, {}, { token });
      setMessage('Kampagne wurde als versendet markiert.');
      await loadData();
    } catch {
      setError('Die Kampagne konnte nicht versendet werden.');
    }
  }

  const segmentLabelById = React.useMemo(
    () => Object.fromEntries(segments.map(segment => [segment.id, segment.label])),
    [segments],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Newsletter-Kampagnen</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Segmente, Kampagnenplanung und Versandstatus für das CRM-Portal.
          </p>
        </div>
        <button
          className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          onClick={() => setShowComposer(true)}
        >
          Neue Kampagne
        </button>
      </div>

      {message && (
        <div className="rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Abonnenten', value: overview?.subscribersTotal ?? 0 },
          { label: 'Ø Öffnungsrate', value: `${overview?.averageOpenRate ?? 0}%` },
          { label: 'Ø Klickrate', value: `${overview?.averageClickRate ?? 0}%` },
          { label: 'Kampagnen (YTD)', value: overview?.campaignsYtd ?? 0 },
        ].map(item => (
          <div key={item.label} className="rounded-3xl border border-secondary-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-secondary-500">{item.label}</div>
            <div className="mt-2 text-2xl font-bold text-secondary-900">
              {loading ? '…' : item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 rounded-full bg-secondary-100 p-1">
        {([
          { id: 'campaigns', label: 'Kampagnen' },
          { id: 'segments', label: 'Segmente' },
          { id: 'stats', label: 'Auswertung' },
        ] as const).map(tab => (
          <button
            key={tab.id}
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

      {loading ? (
        <div className="rounded-3xl border border-secondary-200 bg-white p-6 text-sm text-secondary-500 shadow-sm">
          Newsletter-Daten werden geladen…
        </div>
      ) : activeTab === 'campaigns' ? (
        <div className="space-y-3">
          {campaigns.length === 0 ? (
            <div className="rounded-3xl border border-secondary-200 bg-white p-6 text-sm text-secondary-500 shadow-sm">
              Noch keine Kampagnen vorhanden.
            </div>
          ) : (
            campaigns.map(campaign => (
              <div key={campaign.id} className="rounded-3xl border border-secondary-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-700">
                        {segmentLabelById[campaign.segment] || campaign.segment}
                      </span>
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                        {campaign.status}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-secondary-900">{campaign.subject}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-secondary-500">
                      <span>{campaign.recipients_count} Empfänger</span>
                      <span>Geplant: {formatDateTime(campaign.scheduled_at)}</span>
                      <span>Versendet: {formatDateTime(campaign.sent_at)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {campaign.status !== 'sent' && (
                      <button
                        className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                        onClick={() => handleSend(campaign.id)}
                      >
                        Versand markieren
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'segments' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {segments.map(segment => (
            <div key={segment.id} className="rounded-3xl border border-secondary-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-medium uppercase tracking-wide text-secondary-500">
                {segment.label}
              </div>
              <div className="mt-3 text-3xl font-bold text-secondary-900">{segment.recipients}</div>
              <div className="mt-2 text-sm text-secondary-500">Empfangsbereite Kontakte</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Versandqualität</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-secondary-50 p-5">
              <div className="text-sm font-medium text-secondary-500">Durchschnittliche Öffnungsrate</div>
              <div className="mt-2 text-3xl font-bold text-secondary-900">
                {overview?.averageOpenRate ?? 0}%
              </div>
            </div>
            <div className="rounded-2xl bg-secondary-50 p-5">
              <div className="text-sm font-medium text-secondary-500">Durchschnittliche Klickrate</div>
              <div className="mt-2 text-3xl font-bold text-secondary-900">
                {overview?.averageClickRate ?? 0}%
              </div>
            </div>
          </div>
          <p className="mt-5 text-sm text-secondary-500">
            Diese Werte basieren auf bereits als versendet markierten Kampagnen und werden aus dem Kampagnenbestand aggregiert.
          </p>
        </div>
      )}

      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">Neue Kampagne</h2>
              <button className="text-sm font-semibold text-secondary-500 hover:text-secondary-900" onClick={() => setShowComposer(false)}>
                Schließen
              </button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <input
                className="w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                placeholder="Betreff"
                required
                value={form.subject}
                onChange={event => setForm(prev => ({ ...prev, subject: event.target.value }))}
              />
              <select
                className="w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                value={form.segment}
                onChange={event => setForm(prev => ({ ...prev, segment: event.target.value }))}
              >
                {segments.map(segment => (
                  <option key={segment.id} value={segment.id}>
                    {segment.label} ({segment.recipients})
                  </option>
                ))}
              </select>
              <textarea
                className="min-h-56 w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                placeholder="Inhalt der Kampagne"
                required
                value={form.content}
                onChange={event => setForm(prev => ({ ...prev, content: event.target.value }))}
              />
              <input
                className="w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                type="datetime-local"
                value={form.scheduled_at}
                onChange={event => setForm(prev => ({ ...prev, scheduled_at: event.target.value }))}
              />
              <div className="flex justify-end gap-3">
                <button
                  className="rounded-full border border-secondary-300 px-4 py-2 text-sm font-semibold text-secondary-700 hover:bg-secondary-50"
                  onClick={() => setShowComposer(false)}
                  type="button"
                >
                  Abbrechen
                </button>
                <button
                  className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                  disabled={saving}
                  type="submit"
                >
                  {saving ? 'Speichert…' : 'Kampagne speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
