import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { dashboardApi, type FinanceReportDescriptor } from '../../services/dashboard-api';

type ReportFormat = 'json' | 'csv';

export default function AdminReports() {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [reports, setReports] = React.useState<FinanceReportDescriptor[]>([]);
  const [busyReport, setBusyReport] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    async function load() {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const response = await dashboardApi.getFinanceReportCatalog(token);
        if (!active) return;
        setReports(response.data || []);
      } catch (err: any) {
        if (!active) return;
        setError(
          err?.body?.error?.message ||
            err?.body?.detail ||
            err?.message ||
            'Die Reportliste konnte nicht geladen werden.'
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [token]);

  async function handleDownload(reportId: string, format: ReportFormat) {
    if (!token) return;
    setBusyReport(`${reportId}-${format}`);
    setNotice(null);
    setError(null);
    try {
      const response = await dashboardApi.getFinanceReport(reportId, token, format);
      const data = response.data;
      const content =
        format === 'csv'
          ? data.content || ''
          : JSON.stringify(data.rows ?? data, null, 2);

      const blob = new Blob([content], {
        type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportId}-${data.generated_at}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice(`Report ${reportId} wurde generiert.`);
    } catch (err: any) {
      setError(
        err?.body?.error?.message ||
          err?.body?.detail ||
          err?.message ||
          'Der Report konnte nicht generiert werden.'
      );
    } finally {
      setBusyReport(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Berichte & Exporte</h1>
        <p className="mt-1 text-sm text-gray-500">
          API-basierte Reports aus dem ERPNext-Hybridcockpit, ohne Mock-Daten und ohne Platzhalter.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {notice && (
        <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
          Reports werden geladen…
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
          Keine Reports verfügbar.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map(report => (
            <article
              key={report.id}
              className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{report.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{report.description}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  {report.source}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(report.id, 'json')}
                  disabled={busyReport === `${report.id}-json`}
                  className="rounded-full border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 disabled:opacity-60"
                >
                  {busyReport === `${report.id}-json` ? 'Generiere…' : 'JSON'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(report.id, 'csv')}
                  disabled={busyReport === `${report.id}-csv`}
                  className="rounded-full border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 disabled:opacity-60"
                >
                  {busyReport === `${report.id}-csv` ? 'Generiere…' : 'CSV'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
