import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Alert } from '../components/ui/Alert';
import { triggerReceipt, downloadReceipt } from '../services/receipts';
import { useAuth } from '../auth/AuthContext';

export default function SuccessPage() {
  const [params] = useSearchParams();
  const { token } = useAuth();
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const amount = Number(params.get('amount') || '0');
  const currency = params.get('currency') || 'EUR';
  const purpose = params.get('purpose') || 'Spende';
  const method = params.get('method') || 'unbekannt';

  async function onReceipt() {
    setMessage(null); setError(null);
    try {
      await triggerReceipt({ amount, currency, purpose, provider: method }, token || undefined);
      setMessage('PDF-Beleg wird erstellt/zugestellt.');
    } catch (e: any) {
      setError(e?.message || 'Beleg-Erstellung fehlgeschlagen');
    }
  }

  async function onDownload() {
    setMessage(null); setError(null);
    try {
      const blob = await downloadReceipt({ amount, currency, purpose, provider: method }, token || undefined);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beleg_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || 'PDF-Download fehlgeschlagen');
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-3">
      <Breadcrumb items={[{ label: 'Erfolg' }]} />
      <h1 className="text-2xl font-semibold">Vielen Dank!</h1>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}
      <Card className="p-4 space-y-2">
        <p className="text-secondary-800">Ihre Zahlung wurde entgegengenommen.</p>
        <ul className="text-secondary-700">
          <li>Betrag: <strong>{amount.toFixed(2)} {currency}</strong></li>
          <li>Zweck: <strong>{purpose}</strong></li>
          <li>Art: <strong>{method}</strong></li>
        </ul>
        <div className="pt-2">
          <div className="flex gap-2">
            <Button onClick={onReceipt}>PDF‑Beleg zusenden</Button>
            <Button variant="secondary" onClick={onDownload}>PDF herunterladen</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
