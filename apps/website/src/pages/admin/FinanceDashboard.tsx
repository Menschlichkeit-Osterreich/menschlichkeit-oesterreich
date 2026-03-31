import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../services/api';
import { dashboardApi } from '../../services/dashboard-api';

interface FinanceOverview {
  einnahmen_monat_cents: number;
  ausgaben_monat_cents: number;
  saldo_monat_cents: number;
  einnahmen_jahr_cents: number;
  ausgaben_jahr_cents: number;
  saldo_jahr_cents: number;
  offene_rechnungen: number;
  ueberfaellige_rechnungen: number;
}

interface InvoiceListItem {
  id: number;
  invoice_number: string;
  recipient_name: string;
  total_amount: number;
  currency: string;
  issue_date: string;
  due_date: string;
  status: string;
  pdf_path?: string | null;
}

interface DonationListItem {
  id: number;
  donor_name: string;
  amount: number;
  currency: string;
  donation_type: string;
  status: string;
  donation_date: string;
  receipt_eligible: boolean;
}

interface SepaMandate {
  id: number;
  mandate_reference: string;
  account_holder: string;
  signed_date: string;
  is_active: boolean;
}

interface SepaBatch {
  id: number;
  batch_reference: string;
  batch_type: string;
  collection_date: string;
  total_amount: number;
  mandate_count: number;
  status: string;
}

const formatCurrency = (amountInEuro: number, currency = 'EUR') =>
  new Intl.NumberFormat('de-AT', { style: 'currency', currency }).format(amountInEuro);

const centsToCurrency = (amountInCents: number) => formatCurrency(amountInCents / 100);

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('de-AT') : 'Noch offen';

type TabId = 'overview' | 'invoices' | 'donations' | 'sepa' | 'accounting';

export default function FinanceDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<TabId>('overview');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [overview, setOverview] = React.useState<FinanceOverview | null>(null);
  const [invoices, setInvoices] = React.useState<InvoiceListItem[]>([]);
  const [donations, setDonations] = React.useState<DonationListItem[]>([]);
  const [mandates, setMandates] = React.useState<SepaMandate[]>([]);
  const [batches, setBatches] = React.useState<SepaBatch[]>([]);

  React.useEffect(() => {
    if (!token) {
      return;
    }
    const authToken = token;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [overviewResponse, invoiceResponse, donationResponse, mandateResponse, batchResponse] = await Promise.all([
          dashboardApi.getFinanceOverview(),
          api.invoices.list(authToken),
          api.donations.list(authToken),
          api.sepa.listMandates(authToken, false),
          api.sepa.listBatches(authToken),
        ]);

        if (cancelled) {
          return;
        }

        setOverview(overviewResponse.data);
        setInvoices((invoiceResponse.invoices || []) as InvoiceListItem[]);
        setDonations((donationResponse.donations || []) as DonationListItem[]);
        setMandates((mandateResponse.mandates || []) as SepaMandate[]);
        setBatches((batchResponse.batches || []) as SepaBatch[]);
      } catch {
        if (!cancelled) {
          setError('Finanzdaten konnten nicht geladen werden.');
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

  async function downloadInvoice(invoiceId: number) {
    if (!token) {
      return;
    }
    const authToken = token;

    const response = await api.invoices.downloadUrl(invoiceId, authToken);
    window.open(response.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Finanz-Dashboard</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Reale Vereinsfinanzdaten aus Rechnungen, Spenden und SEPA-Prozessen.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Jahreseinnahmen', value: overview ? centsToCurrency(overview.einnahmen_jahr_cents) : '…' },
          { label: 'Jahresausgaben', value: overview ? centsToCurrency(overview.ausgaben_jahr_cents) : '…' },
          { label: 'Jahressaldo', value: overview ? centsToCurrency(overview.saldo_jahr_cents) : '…' },
          { label: 'Offene Rechnungen', value: overview?.offene_rechnungen ?? '…' },
        ].map(item => (
          <div key={item.label} className="rounded-3xl border border-secondary-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-secondary-500">{item.label}</div>
            <div className="mt-2 text-2xl font-bold text-secondary-900">{loading ? '…' : item.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 rounded-full bg-secondary-100 p-1">
        {([
          { id: 'overview', label: 'Übersicht' },
          { id: 'invoices', label: 'Rechnungen' },
          { id: 'donations', label: 'Spenden' },
          { id: 'sepa', label: 'SEPA' },
          { id: 'accounting', label: 'Buchhaltung' },
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
          Finanzdaten werden geladen…
        </div>
      ) : activeTab === 'overview' ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-secondary-900">Monatsstatus</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-secondary-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">Einnahmen</div>
                <div className="mt-1 text-xl font-bold text-secondary-900">
                  {overview ? centsToCurrency(overview.einnahmen_monat_cents) : '—'}
                </div>
              </div>
              <div className="rounded-2xl bg-secondary-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">Ausgaben</div>
                <div className="mt-1 text-xl font-bold text-secondary-900">
                  {overview ? centsToCurrency(overview.ausgaben_monat_cents) : '—'}
                </div>
              </div>
              <div className="rounded-2xl bg-secondary-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">Saldo</div>
                <div className="mt-1 text-xl font-bold text-secondary-900">
                  {overview ? centsToCurrency(overview.saldo_monat_cents) : '—'}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-secondary-900">Offene Vorgänge</h2>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-secondary-200 px-4 py-4">
                <div className="font-medium text-secondary-900">Offene Rechnungen</div>
                <div className="mt-1 text-sm text-secondary-500">
                  {overview?.offene_rechnungen ?? 0} Rechnungen warten auf Zahlung.
                </div>
              </div>
              <div className="rounded-2xl border border-secondary-200 px-4 py-4">
                <div className="font-medium text-secondary-900">Überfällige Rechnungen</div>
                <div className="mt-1 text-sm text-secondary-500">
                  {overview?.ueberfaellige_rechnungen ?? 0} Rechnungen sind bereits überfällig.
                </div>
              </div>
              <div className="rounded-2xl border border-secondary-200 px-4 py-4">
                <div className="font-medium text-secondary-900">SEPA-Mandate</div>
                <div className="mt-1 text-sm text-secondary-500">
                  {mandates.filter(mandate => mandate.is_active).length} aktive Mandate im System.
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : activeTab === 'invoices' ? (
        <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Rechnungen</h2>
          {invoices.length === 0 ? (
            <p className="mt-4 text-sm text-secondary-500">Keine Rechnungen vorhanden.</p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-secondary-200 text-secondary-500">
                    <th className="pb-3 font-medium">Rechnung</th>
                    <th className="pb-3 font-medium">Empfänger</th>
                    <th className="pb-3 font-medium">Ausgestellt</th>
                    <th className="pb-3 font-medium">Fällig</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 text-right font-medium">Betrag</th>
                    <th className="pb-3 text-right font-medium">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice.id} className="border-b border-secondary-100">
                      <td className="py-3 font-medium text-secondary-900">{invoice.invoice_number}</td>
                      <td className="py-3 text-secondary-600">{invoice.recipient_name || '—'}</td>
                      <td className="py-3 text-secondary-600">{formatDate(invoice.issue_date)}</td>
                      <td className="py-3 text-secondary-600">{formatDate(invoice.due_date)}</td>
                      <td className="py-3 text-secondary-600">{invoice.status}</td>
                      <td className="py-3 text-right font-semibold text-secondary-900">
                        {formatCurrency(Number(invoice.total_amount || 0), invoice.currency)}
                      </td>
                      <td className="py-3 text-right">
                        <button className="text-sm font-semibold text-primary-700 hover:underline" onClick={() => downloadInvoice(invoice.id)}>
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : activeTab === 'donations' ? (
        <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Spenden</h2>
          {donations.length === 0 ? (
            <p className="mt-4 text-sm text-secondary-500">Keine Spenden vorhanden.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {donations.map(donation => (
                <div key={donation.id} className="flex flex-col gap-3 rounded-2xl border border-secondary-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium text-secondary-900">{donation.donor_name || 'Unbekannt'}</div>
                    <div className="mt-1 text-sm text-secondary-500">
                      {donation.donation_type} · {formatDate(donation.donation_date)} · {donation.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-secondary-900">
                      {formatCurrency(Number(donation.amount || 0), donation.currency)}
                    </div>
                    <div className="text-xs text-secondary-500">
                      {donation.receipt_eligible ? 'Quittung möglich' : 'Ohne Quittung'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : activeTab === 'sepa' ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-secondary-900">Mandate</h2>
            {mandates.length === 0 ? (
              <p className="mt-4 text-sm text-secondary-500">Keine SEPA-Mandate vorhanden.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {mandates.map(mandate => (
                  <div key={mandate.id} className="rounded-2xl border border-secondary-200 px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-secondary-900">{mandate.account_holder}</div>
                        <div className="mt-1 text-sm text-secondary-500">
                          {mandate.mandate_reference} · {formatDate(mandate.signed_date)}
                        </div>
                      </div>
                      <span className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-700">
                        {mandate.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-secondary-900">SEPA-Batches</h2>
            {batches.length === 0 ? (
              <p className="mt-4 text-sm text-secondary-500">Noch keine SEPA-Batches vorhanden.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {batches.map(batch => (
                  <div key={batch.id} className="rounded-2xl border border-secondary-200 px-4 py-4">
                    <div className="font-medium text-secondary-900">{batch.batch_reference}</div>
                    <div className="mt-1 text-sm text-secondary-500">
                      {batch.batch_type} · {formatDate(batch.collection_date)} · {batch.mandate_count} Mandate
                    </div>
                    <div className="mt-2 text-sm font-semibold text-secondary-900">
                      {formatCurrency(Number(batch.total_amount || 0))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Buchhaltung & Exporte</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-secondary-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">Jahresergebnis</div>
              <div className="mt-1 text-xl font-bold text-secondary-900">
                {overview ? centsToCurrency(overview.saldo_jahr_cents) : '—'}
              </div>
            </div>
            <div className="rounded-2xl bg-secondary-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">Rechnungsbestand</div>
              <div className="mt-1 text-xl font-bold text-secondary-900">{invoices.length}</div>
            </div>
            <div className="rounded-2xl bg-secondary-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-secondary-500">Spendenvorgänge</div>
              <div className="mt-1 text-xl font-bold text-secondary-900">{donations.length}</div>
            </div>
          </div>
          <p className="mt-5 text-sm text-secondary-500">
            Exportfunktionen bauen auf diesen Live-Datenbeständen auf. In dieser Oberfläche werden keine Beispielwerte mehr eingeblendet.
          </p>
        </section>
      )}
    </div>
  );
}
