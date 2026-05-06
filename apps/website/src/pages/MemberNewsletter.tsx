import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { http } from '../services/http';

interface NewsletterState {
  status: string;
  confirmedAt?: string | null;
  unsubscribedAt?: string | null;
  updatedAt?: string | null;
}

export default function MemberNewsletter() {
  const { token } = useAuth();
  const [state, setState] = React.useState<NewsletterState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const subscribed =
    state?.status === 'confirmed' || state?.status === 'active' || state?.status === 'subscribed';

  React.useEffect(() => {
    const authToken = token ?? undefined;
    if (!authToken) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await http.get<{ success: boolean; data: NewsletterState }>('/api/members/me/newsletter', {
          token: authToken,
        });
        if (!cancelled) {
          setState(response.data);
        }
      } catch {
        if (!cancelled) {
          setError('Newsletter-Einstellungen konnten nicht geladen werden.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function updateSubscription(nextValue: boolean) {
    const authToken = token ?? undefined;
    if (!authToken) {
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await http.put<{ success: boolean; data: NewsletterState }>(
        '/api/members/me/newsletter',
        { subscribe: nextValue },
        { token: authToken },
      );
      setState(response.data);
      setMessage(nextValue ? 'Newsletter wurde aktiviert.' : 'Newsletter wurde pausiert.');
    } catch {
      setError('Die Newsletter-Einstellung konnte nicht aktualisiert werden.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-secondary-900">Newsletter</h1>
        <p className="mt-2 max-w-3xl text-sm text-secondary-500">
          Verwalten Sie, ob Sie Vereins-Updates, Einladungen und Hinweise aus der Community erhalten möchten.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
          {message}
        </div>
      )}

      <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-secondary-500">Newsletter-Status wird geladen…</p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-secondary-900">Aktueller Status</h2>
                <p className="mt-1 text-sm text-secondary-500">
                  {subscribed
                    ? 'Sie erhalten derzeit Vereinsnewsletter und redaktionelle Hinweise.'
                    : 'Ihr Konto erhält derzeit keine Newsletter-Zusendungen.'}
                </p>
              </div>
              <span
                className={[
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  subscribed
                    ? 'bg-success-100 text-success-700'
                    : 'bg-secondary-100 text-secondary-700',
                ].join(' ')}
              >
                {subscribed ? 'Aktiv' : 'Pausiert'}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-secondary-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
                  Bestätigt am
                </div>
                <div className="mt-1 text-sm font-medium text-secondary-900">
                  {state?.confirmedAt ? new Date(state.confirmedAt).toLocaleString('de-AT') : 'Noch nicht bestätigt'}
                </div>
              </div>
              <div className="rounded-2xl bg-secondary-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
                  Zuletzt geändert
                </div>
                <div className="mt-1 text-sm font-medium text-secondary-900">
                  {state?.updatedAt ? new Date(state.updatedAt).toLocaleString('de-AT') : 'Noch keine Änderung'}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                disabled={saving || subscribed}
                onClick={() => updateSubscription(true)}
              >
                Newsletter aktivieren
              </button>
              <button
                className="rounded-full border border-secondary-300 px-4 py-2 text-sm font-semibold text-secondary-800 hover:bg-secondary-50 disabled:opacity-60"
                disabled={saving || !subscribed}
                onClick={() => updateSubscription(false)}
              >
                Newsletter pausieren
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
