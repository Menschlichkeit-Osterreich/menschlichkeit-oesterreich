import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../services/api';

interface InvoiceItem {
  id: number;
  invoice_number: string;
  total_amount: number;
  currency: string;
  issue_date: string;
  due_date: string;
  status: string;
  invoice_type: string;
  pdf_path: string | null;
}

interface DonationItem {
  id: number;
  amount: number;
  currency: string;
  donation_type: string;
  status: string;
  donation_date: string;
  receipt_eligible: boolean;
}

const formatCurrency = (amount: number, currency = 'EUR') =>
  new Intl.NumberFormat('de-AT', { style: 'currency', currency }).format(amount);

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('de-AT') : 'Noch offen';

export default function MemberBilling() {
  const { token } = useAuth();
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([]);
  const [donations, setDonations] = React.useState<DonationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
        const [invoiceData, donationData] = await Promise.all([
          api.members.getInvoices(authToken),
          api.members.getDonations(authToken),
        ]);

        if (cancelled) {
          return;
        }

        setInvoices(invoiceData);
        setDonations(donationData);
      } catch {
        if (!cancelled) {
          setError('Abrechnungsdaten konnten nicht geladen werden.');
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

  const totalInvoices = invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);
  const totalDonations = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
  const openInvoices = invoices.filter(invoice => invoice.status !== 'paid');

  async function handleDownload(invoiceId: number) {
    if (!token) {
      return;
    }
    const authToken = token;

    const response = await api.invoices.downloadUrl(invoiceId, authToken);
    window.open(response.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-secondary-900">Rechnungen und Belege</h1>
        <p className="mt-2 max-w-3xl text-sm text-secondary-500">
          Hier sehen Sie Ihre Mitgliedsrechnungen, Spendenbelege und den aktuellen Stand offener Zahlungen.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-secondary-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-secondary-500">Rechnungen gesamt</div>
          <div className="mt-2 text-2xl font-bold text-secondary-900">
            {loading ? '…' : formatCurrency(totalInvoices)}
          </div>
        </div>
        <div className="rounded-3xl border border-secondary-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-secondary-500">Offene Rechnungen</div>
          <div className="mt-2 text-2xl font-bold text-secondary-900">
            {loading ? '…' : openInvoices.length}
          </div>
        </div>
        <div className="rounded-3xl border border-secondary-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-secondary-500">Spenden gesamt</div>
          <div className="mt-2 text-2xl font-bold text-secondary-900">
            {loading ? '…' : formatCurrency(totalDonations)}
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">Mitgliedsrechnungen</h2>
            <p className="text-sm text-secondary-500">PDFs und Zahlungsstände Ihrer Rechnungen.</p>
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-sm text-secondary-500">Rechnungen werden geladen…</p>
        ) : invoices.length === 0 ? (
          <p className="py-8 text-sm text-secondary-500">
            Derzeit sind keine Rechnungen hinterlegt.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-secondary-200 text-secondary-500">
                  <th className="pb-3 font-medium">Rechnung</th>
                  <th className="pb-3 font-medium">Typ</th>
                  <th className="pb-3 font-medium">Ausgestellt</th>
                  <th className="pb-3 font-medium">Fällig</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Betrag</th>
                  <th className="pb-3 text-right font-medium">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id} className="border-b border-secondary-100">
                    <td className="py-3 font-medium text-secondary-900">{invoice.invoice_number}</td>
                    <td className="py-3 text-secondary-600">{invoice.invoice_type}</td>
                    <td className="py-3 text-secondary-600">{formatDate(invoice.issue_date)}</td>
                    <td className="py-3 text-secondary-600">{formatDate(invoice.due_date)}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-secondary-100 px-2.5 py-1 text-xs font-semibold text-secondary-700">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-secondary-900">
                      {formatCurrency(Number(invoice.total_amount || 0), invoice.currency)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        className="text-sm font-semibold text-primary-700 hover:underline"
                        onClick={() => handleDownload(invoice.id)}
                      >
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

      <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-secondary-900">Spendenhistorie</h2>
        <p className="text-sm text-secondary-500">Alle Spenden, die Ihrem Mitgliedskonto zugeordnet sind.</p>

        {loading ? (
          <p className="py-8 text-sm text-secondary-500">Spenden werden geladen…</p>
        ) : donations.length === 0 ? (
          <p className="py-8 text-sm text-secondary-500">
            Es sind noch keine Spendenbelege vorhanden.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {donations.map(donation => (
              <div
                key={donation.id}
                className="flex flex-col gap-3 rounded-2xl border border-secondary-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-medium text-secondary-900">{donation.donation_type}</div>
                  <div className="text-sm text-secondary-500">
                    {formatDate(donation.donation_date)} · Status: {donation.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-secondary-900">
                    {formatCurrency(Number(donation.amount || 0), donation.currency)}
                  </div>
                  <div className="text-xs text-secondary-500">
                    {donation.receipt_eligible ? 'Spendenquittung möglich' : 'Ohne Quittung'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
