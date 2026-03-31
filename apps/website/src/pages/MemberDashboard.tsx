import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { http } from '../services/http';
import { buildPublicUrl } from '../utils/runtimeHost';

interface OverviewResponse {
  success: boolean;
  data: {
    profile: {
      firstName?: string;
      lastName?: string;
      email: string;
      mitgliedschaftTyp?: string;
      status?: string;
      createdAt?: string | null;
      civicrmContactId?: number | null;
    };
    newsletter: {
      status: string;
      confirmedAt?: string | null;
      updatedAt?: string | null;
    };
    sepa: {
      mandate_reference: string;
      account_holder: string;
      signed_date?: string | null;
      is_active: boolean;
    } | null;
    consents: Array<{
      consent_type: string;
      status: string;
      granted_at?: string | null;
      revoked_at?: string | null;
    }>;
    events: Array<{
      id: string;
      title: string;
      status?: string;
      startDate?: string | null;
      location?: string | null;
    }>;
    invoices: Array<{
      id: number;
      invoice_number: string;
      total_amount: number;
      currency: string;
      issue_date: string;
      due_date: string;
      status: string;
    }>;
    donations: Array<{
      id: number;
      amount: number;
      currency: string;
      donation_date: string;
      status: string;
      donation_type: string;
    }>;
  };
}

const formatCurrency = (amount: number, currency = 'EUR') =>
  new Intl.NumberFormat('de-AT', { style: 'currency', currency }).format(amount);

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('de-AT') : 'Noch offen';

export default function MemberDashboard() {
  const { token } = useAuth();
  const [overview, setOverview] = React.useState<OverviewResponse['data'] | null>(null);
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
        const response = await http.get<OverviewResponse>('/api/members/me/overview', { token: authToken });
        if (!cancelled) {
          setOverview(response.data);
        }
      } catch {
        if (!cancelled) {
          setError('Das Mitglieder-Dashboard konnte nicht geladen werden.');
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

  const profile = overview?.profile;
  const invoices = overview?.invoices ?? [];
  const donations = overview?.donations ?? [];
  const newsletter = overview?.newsletter;
  const sepa = overview?.sepa;
  const events = overview?.events ?? [];
  const consents = overview?.consents ?? [];

  const openInvoices = invoices.filter(invoice => invoice.status !== 'paid');
  const donationTotal = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
  const activeConsents = consents.filter(consent => consent.status === 'granted').length;
  const newsletterActive =
    newsletter?.status === 'confirmed' ||
    newsletter?.status === 'active' ||
    newsletter?.status === 'subscribed';

  if (loading) {
    return (
      <div className="rounded-3xl border border-secondary-200 bg-white p-8 text-sm text-secondary-500 shadow-sm">
        Dashboard wird geladen…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Willkommen{profile?.firstName ? `, ${profile.firstName}` : ''}.
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-secondary-500">
              Ihr Portal bündelt Mitgliedsdaten, Zahlungen, Datenschutz, Newsletter und Community-Zugänge an einem Ort.
            </p>
          </div>
          <div className="rounded-2xl bg-secondary-50 px-4 py-3 text-sm text-secondary-700">
            {profile?.mitgliedschaftTyp || 'Mitgliedschaft'} · {profile?.status || 'Status offen'}
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-secondary-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-secondary-500">Offene Rechnungen</div>
          <div className="mt-2 text-2xl font-bold text-secondary-900">{openInvoices.length}</div>
        </div>
        <div className="rounded-3xl border border-secondary-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-secondary-500">Spenden gesamt</div>
          <div className="mt-2 text-2xl font-bold text-secondary-900">{formatCurrency(donationTotal)}</div>
        </div>
        <div className="rounded-3xl border border-secondary-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-secondary-500">Newsletter</div>
          <div className="mt-2 text-2xl font-bold text-secondary-900">{newsletterActive ? 'Aktiv' : 'Pausiert'}</div>
        </div>
        <div className="rounded-3xl border border-secondary-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-secondary-500">DSGVO-Einwilligungen</div>
          <div className="mt-2 text-2xl font-bold text-secondary-900">{activeConsents}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Nächste Schritte</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { to: '/member/profil', label: 'Profil aktualisieren', meta: profile?.email || 'Kontaktdaten pflegen', external: false },
              { to: '/member/rechnungen', label: 'Rechnungen prüfen', meta: `${openInvoices.length} offen`, external: false },
              { to: '/member/sepa', label: 'SEPA-Status ansehen', meta: sepa?.is_active ? 'Mandat aktiv' : 'Kein Mandat', external: false },
              { to: '/member/newsletter', label: 'Newsletter verwalten', meta: newsletterActive ? 'Aktiv' : 'Pausiert', external: false },
              { to: '/member/datenschutz', label: 'Datenschutz-Center', meta: `${activeConsents} Einwilligungen`, external: false },
              { to: buildPublicUrl('/forum'), label: 'Community besuchen', meta: 'Forum auf www', external: true },
            ].map(item => item.external ? (
              <a
                key={item.label}
                className="rounded-2xl border border-secondary-200 px-4 py-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
                href={item.to}
              >
                <div className="font-semibold text-secondary-900">{item.label}</div>
                <div className="mt-1 text-sm text-secondary-500">{item.meta}</div>
              </a>
            ) : (
              <Link
                key={item.label}
                className="rounded-2xl border border-secondary-200 px-4 py-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
                to={item.to}
              >
                <div className="font-semibold text-secondary-900">{item.label}</div>
                <div className="mt-1 text-sm text-secondary-500">{item.meta}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Mitgliedskonto</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-secondary-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">E-Mail</div>
              <div className="mt-1 text-sm font-medium text-secondary-900">{profile?.email || 'Nicht hinterlegt'}</div>
            </div>
            <div className="rounded-2xl bg-secondary-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">Mitglied seit</div>
              <div className="mt-1 text-sm font-medium text-secondary-900">
                {formatDate(profile?.createdAt)}
              </div>
            </div>
            <div className="rounded-2xl bg-secondary-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">SEPA-Referenz</div>
              <div className="mt-1 text-sm font-medium text-secondary-900">
                {sepa?.mandate_reference || 'Noch kein Mandat verknüpft'}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-secondary-900">Zuletzt erfasste Rechnungen</h2>
        {invoices.length === 0 ? (
          <p className="mt-4 text-sm text-secondary-500">Es sind derzeit keine Rechnungen hinterlegt.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="border-b border-secondary-200 text-secondary-500">
                  <th className="pb-3 font-medium">Rechnung</th>
                  <th className="pb-3 font-medium">Ausgestellt</th>
                  <th className="pb-3 font-medium">Fällig</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Betrag</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map(invoice => (
                  <tr key={invoice.id} className="border-b border-secondary-100">
                    <td className="py-3 font-medium text-secondary-900">{invoice.invoice_number}</td>
                    <td className="py-3 text-secondary-600">{formatDate(invoice.issue_date)}</td>
                    <td className="py-3 text-secondary-600">{formatDate(invoice.due_date)}</td>
                    <td className="py-3 text-secondary-600">{invoice.status}</td>
                    <td className="py-3 text-right font-semibold text-secondary-900">
                      {formatCurrency(Number(invoice.total_amount || 0), invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Kommende Teilnahmen</h2>
          {events.length === 0 ? (
            <p className="mt-4 text-sm text-secondary-500">
              Noch keine Event-Teilnahmen hinterlegt. Öffentliche Veranstaltungen finden Sie auf der Website.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {events.slice(0, 4).map(event => (
                <div key={event.id} className="rounded-2xl border border-secondary-200 px-4 py-4">
                  <div className="font-medium text-secondary-900">{event.title}</div>
                  <div className="mt-1 text-sm text-secondary-500">
                    {formatDate(event.startDate)} · {event.status || 'Geplant'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Spendenhistorie</h2>
          {donations.length === 0 ? (
            <p className="mt-4 text-sm text-secondary-500">
              Ihrem Konto sind noch keine Spenden zugeordnet.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {donations.slice(0, 4).map(donation => (
                <div key={donation.id} className="flex items-center justify-between rounded-2xl border border-secondary-200 px-4 py-4">
                  <div>
                    <div className="font-medium text-secondary-900">{donation.donation_type}</div>
                    <div className="mt-1 text-sm text-secondary-500">{formatDate(donation.donation_date)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-secondary-900">
                      {formatCurrency(Number(donation.amount || 0), donation.currency)}
                    </div>
                    <div className="text-xs text-secondary-500">{donation.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
