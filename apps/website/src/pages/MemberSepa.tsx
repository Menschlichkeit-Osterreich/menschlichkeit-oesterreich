import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { CONTACT_EMAIL } from '../config/siteConfig';
import { http } from '../services/http';

interface SepaMandate {
  id: number;
  mandate_reference: string;
  mandate_type: string;
  iban: string;
  bic: string;
  account_holder: string;
  signed_date: string;
  is_active: boolean;
}

export default function MemberSepa() {
  const { token } = useAuth();
  const [mandate, setMandate] = React.useState<SepaMandate | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
        const response = await http.get<{ success: boolean; data: SepaMandate | null }>('/api/members/me/sepa', {
          token: authToken,
        });
        if (!cancelled) {
          setMandate(response.data);
        }
      } catch {
        if (!cancelled) {
          setError('Der aktuelle SEPA-Status konnte nicht geladen werden.');
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

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-secondary-900">SEPA-Mandat</h1>
        <p className="mt-2 max-w-3xl text-sm text-secondary-500">
          Hier sehen Sie den aktuell mit Ihrem Mitgliedskonto verknüpften Lastschriftstatus.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-secondary-200 bg-white p-6 text-sm text-secondary-500 shadow-sm">
          SEPA-Daten werden geladen…
        </div>
      ) : mandate ? (
        <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">Aktives Mandat</h2>
              <p className="text-sm text-secondary-500">
                Referenz {mandate.mandate_reference} · {mandate.mandate_type}
              </p>
            </div>
            <span className="rounded-full bg-success-100 px-3 py-1 text-xs font-semibold text-success-700">
              {mandate.is_active ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-secondary-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
                Kontoinhaber
              </div>
              <div className="mt-1 text-sm font-medium text-secondary-900">{mandate.account_holder}</div>
            </div>
            <div className="rounded-2xl bg-secondary-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
                Unterzeichnet
              </div>
              <div className="mt-1 text-sm font-medium text-secondary-900">
                {mandate.signed_date ? new Date(mandate.signed_date).toLocaleDateString('de-AT') : 'Nicht hinterlegt'}
              </div>
            </div>
            <div className="rounded-2xl bg-secondary-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
                IBAN
              </div>
              <div className="mt-1 text-sm font-medium text-secondary-900">{mandate.iban}</div>
            </div>
            <div className="rounded-2xl bg-secondary-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
                BIC
              </div>
              <div className="mt-1 text-sm font-medium text-secondary-900">{mandate.bic || 'Nicht hinterlegt'}</div>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Noch kein Mandat hinterlegt</h2>
          <p className="mt-2 text-sm text-secondary-500">
            Für Ihr Konto wurde aktuell kein aktives SEPA-Mandat gefunden. Wenn Sie künftig per Lastschrift zahlen möchten,
            melden Sie sich bitte beim Vereinsbüro.
          </p>
          <a
            className="mt-5 inline-flex rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            href={`mailto:${CONTACT_EMAIL}?subject=SEPA-Mandat%20Menschlichkeit%20%C3%96sterreich`}
          >
            SEPA-Mandat anfragen
          </a>
        </section>
      )}
    </div>
  );
}
