import { Card } from '../components/ui/Card';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import SeoHead from '../components/seo/SeoHead';
import { Alert } from '../components/ui/Alert';

// Fail-closed (Track A / #564):
//   * Ein Browser-Return-URL ist KEIN Zahlungsnachweis. Query-Parameter wie
//     amount/purpose/method dürfen nicht als bestätigte Zahlung dargestellt
//     werden. Wir zeigen einen neutralen "Status wird geprüft"-Zustand; die
//     verbindliche Bestätigung erfolgt serverseitig (Stripe-Webhook) per E-Mail.
//   * Beleg-/PDF-Aktionen sind entfernt, solange die Belegfreigabe fachlich
//     nicht entschieden ist und kein autoritativer Beleg-Contract existiert.
export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 space-y-3">
      <SeoHead
        title="Vielen Dank – Menschlichkeit Österreich"
        description="Vielen Dank für Ihre Unterstützung von Menschlichkeit Österreich. Der Zahlungsstatus wird geprüft."
        noIndex={true}
      />
      <Breadcrumb items={[{ label: 'Erfolg' }]} />
      <h1 className="text-2xl font-semibold">Vielen Dank!</h1>
      <Card className="p-4 space-y-2">
        <Alert variant="info" role="status">
          Zahlungsstatus wird geprüft.
        </Alert>
        <p className="text-secondary-800">
          Ihre Angaben wurden übermittelt. Sobald Ihre Zahlung bestätigt ist,
          erhalten Sie eine Bestätigung per E‑Mail. Bitte prüfen Sie ggf. auch
          Ihren Spam-Ordner.
        </p>
        <p className="text-secondary-700">
          Falls Sie eine Zahlung über Ihr Zahlungsfenster begonnen, aber noch
          nicht abgeschlossen haben, schließen Sie diese bitte dort ab.
        </p>
      </Card>
    </div>
  );
}
