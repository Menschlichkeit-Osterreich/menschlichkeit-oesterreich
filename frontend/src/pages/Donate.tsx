import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { api } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import { getStripe, createStripeIntent, createPayPalOrder, capturePayPalOrder } from '../services/payments';
import { PayPalScriptProvider, PayPalButtons as PayPalButtonsReact } from '@paypal/react-paypal-js';
// Lazy Stripe checkout module – wird nur bei Karten/Wallets geladen
const StripeCheckout = React.lazy(() => import('./donate/StripeCheckout'));

type Interval = 'once' | 'monthly' | 'quarterly' | 'yearly';
type Instrument =
  | 'bank_transfer'
  | 'sepa'
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay'
  | 'eps'
  | 'sofort'
  | 'revolut'
  | 'wise'
  | 'pos'
  | 'cash';

// Stripe Checkout wird lazy geladen, um Third-Party Requests nur bei Bedarf zu triggern

// (Removed duplicate PaymentElementCheckout and legacy PayPalButtons helper)

import { useNavigate } from 'react-router-dom';

export default function DonatePage() {
  const { setAuth, token } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [amount, setAmount] = React.useState<number>(50);
  const [interval, setInterval] = React.useState<Interval>('once');
  const [purpose, setPurpose] = React.useState('Allgemein');
  const [anonymous, setAnonymous] = React.useState(false);
  const [tribute, setTribute] = React.useState('');
  const [instrument, setInstrument] = React.useState<Instrument>('sepa');
  const [iban, setIban] = React.useState('');
  const [bic, setBic] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);

  const valid = /.+@.+\..+/.test(email) && amount > 0 && (!!iban || instrument !== 'sepa');

  // Debounced, cached PaymentIntent for Payment Element
  const piCacheRef = React.useRef<{ key: string; cs: string | null }>({ key: '', cs: null });
  React.useEffect(() => {
    const needsPE = ['visa', 'mastercard', 'amex', 'apple_pay', 'google_pay'].includes(instrument);
    if (!needsPE) { setClientSecret(null); return; }
    if (!/.+@.+\..+/.test(email) || amount <= 0) return;
    const key = `${instrument}|${email}|${amount}|${purpose}`;
    if (piCacheRef.current.key === key && piCacheRef.current.cs) {
      setClientSecret(piCacheRef.current.cs);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await createStripeIntent({ amount, currency: 'EUR', email, purpose }, token || undefined);
        const cs = (res.data as any)?.client_secret || null;
        if (!cancelled) {
          piCacheRef.current = { key, cs };
          setClientSecret(cs);
        }
      } catch {
        if (!cancelled) setClientSecret(null);
      }
    }, 600);
    return () => { cancelled = true; clearTimeout(t); };
  }, [instrument, amount, email, purpose, token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      // 1) Ensure contact exists via register (idempotent on email)
      const reg = await api.auth.register({ email, first_name: firstName, last_name: lastName });
      const tokens = (reg.data as any)?.tokens;
      if (!tokens?.token) throw new Error('Registrierung fehlgeschlagen');
      setAuth({ token: tokens.token, expiresIn: tokens.expires_in, refreshToken: tokens.refresh_token });

      // 2) PSP flows
      if (['eps', 'sofort'].includes(instrument)) {
        const stripe = await getStripe();
        if (!stripe) throw new Error('Stripe nicht verfügbar');
        const init = await createStripeIntent({ amount, currency: 'EUR', email, purpose, method: instrument as any, financial_type: 'donation' }, tokens.token);
        const clientSecret = (init.data as any)?.client_secret;
        if (!clientSecret) throw new Error('Payment Intent fehlgeschlagen');
        const return_url = window.location.href;
        const confirm = await stripe.confirmPayment({ clientSecret, confirmParams: { return_url } });
        if ((confirm as any)?.error) throw (confirm as any).error;
        setMessage('Zahlung gestartet. Bitte Schritt im Zahlungsfenster abschließen.');
        return;
      }

      if (instrument === 'sepa') {
        const stripe = await getStripe();
        if (!stripe) throw new Error('Stripe nicht verfügbar');
        const init = await createStripeIntent({ amount, currency: 'EUR', email, purpose, method: 'sepa', financial_type: 'donation' }, tokens.token);
        const clientSecret = (init.data as any)?.client_secret;
        const result = await stripe.confirmSepaDebitPayment(clientSecret, {
          payment_method: {
            sepa_debit: { iban },
            billing_details: { name: `${firstName} ${lastName}`.trim() || email, email },
          },
          return_url: window.location.href,
        });
        if ((result as any)?.error) throw (result as any).error;
        setMessage('SEPA-Mandat erteilt. Vielen Dank!');
        return;
      }

      if (instrument === 'paypal') {
        setMessage('Bitte mit PayPal Buttons bezahlen.');
        return;
      }

      // Fallback (Banküberweisung, POS, Cash): Contribution nur registrieren
      await api.contributions.create(
        {
          email,
          amount,
          currency: 'EUR',
          financial_type: 'donation',
          purpose,
          anonymous,
          tribute_name: tribute || undefined,
          payment_instrument: instrument,
        },
        tokens.token
      );

      setMessage('Vielen Dank für Ihre Unterstützung! Bestätigung erfolgt per E‑Mail.');
      navigate(`/erfolg?amount=${encodeURIComponent(amount)}&currency=EUR&purpose=${encodeURIComponent(purpose)}&method=${encodeURIComponent(instrument)}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Spende fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <Breadcrumb items={[{ label: 'Spenden' }]} />
      <h1 className="text-2xl font-semibold">Spenden</h1>
      <p className="text-secondary-700">Einmalig oder regelmäßig – sicher und DSGVO‑konform.</p>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <Card className="p-4">
        <form onSubmit={onSubmit} noValidate>
          <fieldset className="grid gap-3" disabled={submitting}>
            <legend className="sr-only">Spendenformular</legend>
            <div className="flex gap-2 flex-wrap">
              {[20, 50, 100, 250].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`px-3 py-2 rounded border ${amount === preset ? 'bg-primary-50 border-primary-300' : 'hover:bg-secondary-50'}`}
                  onClick={() => setAmount(preset)}
                  aria-pressed={amount === preset}
                >
                  {preset} €
                </button>
              ))}
              <label className="ml-auto flex items-center gap-2">
                <span className="text-sm">Betrag</span>
                <input
                  type="number"
                  className="w-28 rounded border p-2"
                  min={1}
                  step={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <span>€</span>
              </label>
            </div>

            <label className="block">
              <span className="block text-sm font-medium">Rhythmus *</span>
              <select className="mt-1 w-full rounded border p-2" value={interval} onChange={(e) => setInterval(e.target.value as Interval)}>
                <option value="once">Einmalig</option>
                <option value="monthly">Monatlich</option>
                <option value="quarterly">Vierteljährlich</option>
                <option value="yearly">Jährlich</option>
              </select>
            </label>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-sm font-medium">Vorname</span>
                <input className="mt-1 w-full rounded border p-2" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </label>
              <label className="block">
                <span className="block text-sm font-medium">Nachname</span>
                <input className="mt-1 w-full rounded border p-2" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm font-medium">E‑Mail *</span>
              <input className="mt-1 w-full rounded border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            <label className="block">
              <span className="block text-sm font-medium">Zweck (optional)</span>
              <input className="mt-1 w-full rounded border p-2" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Projekt/Fonds" />
            </label>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
                <span>Anonyme Spende</span>
              </label>
              <label className="block">
                <span className="block text-sm font-medium">Tribute (optional)</span>
                <input className="mt-1 w-full rounded border p-2" value={tribute} onChange={(e) => setTribute(e.target.value)} placeholder="Im Namen von …" />
              </label>
            </div>

            <label className="block">
              <span className="block text-sm font-medium">Zahlungsart *</span>
              <select className="mt-1 w-full rounded border p-2" value={instrument} onChange={(e) => setInstrument(e.target.value as Instrument)}>
                <option value="sepa">SEPA‑Lastschrift</option>
                <option value="bank_transfer">Banküberweisung (IBAN)</option>
                <option value="eps">EPS</option>
                <option value="sofort">Sofort/Klarna</option>
                <option value="paypal">PayPal</option>
                <option value="visa">VISA</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">Amex</option>
                <option value="apple_pay">Apple Pay</option>
                <option value="google_pay">Google Pay</option>
                <option value="pos">Kartenterminal (POS)</option>
                <option value="cash">Bar (nur mit Quittung)</option>
              </select>
            </label>

            {instrument === 'sepa' && (
              <div className="grid md:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-sm font-medium">IBAN *</span>
                  <input className="mt-1 w-full rounded border p-2" value={iban} onChange={(e) => setIban(e.target.value)} required />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium">BIC (optional)</span>
                  <input className="mt-1 w-full rounded border p-2" value={bic} onChange={(e) => setBic(e.target.value)} />
                </label>
              </div>
            )}

            {(instrument === 'visa' || instrument === 'mastercard' || instrument === 'amex' || instrument === 'apple_pay' || instrument === 'google_pay') && clientSecret && (
              <React.Suspense fallback={<div className="p-2 text-sm text-muted">Zahlungsmodul wird geladen…</div>}>
                <StripeCheckout
                  clientSecret={clientSecret}
                  disabled={!valid || submitting}
                  payer={{
                    name: `${firstName} ${lastName}`.trim() || email,
                    email,
                    iban: undefined,
                  }}
                  onDone={(msg: string) => setMessage(msg)}
                  onError={(msg: string) => setError(msg)}
                />
              </React.Suspense>
            )}

            {instrument === 'paypal' && (
              <div className="mt-2">
                <PayPalScriptProvider options={{ 'client-id': (import.meta as any).env.VITE_PAYPAL_CLIENT_ID || 'sb', currency: 'EUR' }}>
                  <PayPalButtonsReact
                    style={{ layout: 'vertical' }}
                    createOrder={async () => {
                      try {
                        const order = await createPayPalOrder({ amount, currency: 'EUR', email, purpose }, token || undefined);
                        return (order.data as any)?.id;
                      } catch (e: any) {
                        setError(e?.message || 'PayPal Order fehlgeschlagen');
                        throw e;
                      }
                    }}
                    onApprove={async (data) => {
                      try {
                        await capturePayPalOrder({ order_id: (data as any).orderID, email, purpose }, token || undefined);
                        setMessage('PayPal Zahlung erfasst. Vielen Dank!');
                      } catch (e: any) {
                        setError(e?.message || 'PayPal Capture fehlgeschlagen');
                      }
                    }}
                    onError={(err) => setError((err as any)?.message || 'PayPal Fehler')}
                  />
                </PayPalScriptProvider>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button type="submit" disabled={!valid || submitting}>
                {submitting ? 'Wird übermittelt…' : 'Jetzt spenden'}
              </Button>
              <Button type="reset" variant="secondary" onClick={() => window.history.back()}>
                Abbrechen
              </Button>
            </div>
          </fieldset>
        </form>
      </Card>
    </div>
  );
}
