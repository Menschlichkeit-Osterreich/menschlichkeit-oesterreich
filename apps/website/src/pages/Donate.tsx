import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';
import JsonLdFaq from '../components/seo/JsonLdFaq';
import SeoHead from '../components/seo/SeoHead';
import { Alert } from '../components/ui/Alert';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { api } from '../services/api';
import { createStripeIntent, getStripe } from '../services/payments';
// Lazy Stripe checkout module – wird nur bei Karten/Wallets geladen
const StripeCheckout = React.lazy(() => import('./donate/StripeCheckout'));

type Interval = 'once' | 'monthly' | 'quarterly' | 'yearly';
type Instrument =
  | 'bank_transfer'
  | 'sepa'
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'apple_pay'
  | 'google_pay'
  | 'eps'
  | 'sofort'
  | 'revolut'
  | 'wise'
  | 'pos'
  | 'cash';

// Stripe Checkout wird lazy geladen, um Third-Party Requests nur bei Bedarf zu triggern

const FAQ_ITEMS = [
  {
    question: 'Welche Zahlungsarten stehen zur Verfügung?',
    answer:
      'Je nach Auswahl stehen SEPA-Lastschrift, Online-Zahlung über Stripe, Banküberweisung und weitere unterstützte Zahlungswege zur Verfügung.',
  },
  {
    question: 'Kann ich regelmäßig spenden?',
    answer:
      'Ja. Sie können zwischen einmaliger, monatlicher, vierteljährlicher und jährlicher Unterstützung wählen.',
  },
  {
    question: 'Wo finde ich mehr Informationen zur Mittelverwendung?',
    answer:
      'Details zu Vereinsdaten, Transparenz und organisatorischen Grundlagen finden Sie auf unseren Seiten zu Transparenz, Statuten und Datenschutz.',
  },
];

export default function DonatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [amount, setAmount] = React.useState<number>(50);
  const [interval, setInterval] = React.useState<Interval>('once');
  const [purpose, setPurpose] = React.useState('Allgemein');
  const [anonymous, setAnonymous] = React.useState(false);
  const [tribute, setTribute] = React.useState('');
  const [consentPrivacy, setConsentPrivacy] = React.useState(false);
  const [instrument, setInstrument] = React.useState<Instrument>('sepa');
  const [iban, setIban] = React.useState('');
  const [bic, setBic] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const membershipContext = searchParams.get('context') === 'membership';
  const financialType = membershipContext ? 'membership_fee' : 'donation';
  const fieldClass =
    'mt-1 w-full rounded-lg border border-secondary-300 bg-white p-2.5 text-secondary-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:bg-secondary-50';

  React.useEffect(() => {
    const amountParam = Number(searchParams.get('amount') || '');
    if (Number.isFinite(amountParam) && amountParam > 0) {
      setAmount(amountParam);
    }

    const intervalParam = searchParams.get('interval');
    if (
      intervalParam === 'once' ||
      intervalParam === 'monthly' ||
      intervalParam === 'quarterly' ||
      intervalParam === 'yearly'
    ) {
      setInterval(intervalParam);
    }

    const purposeParam = searchParams.get('purpose');
    if (purposeParam) {
      setPurpose(purposeParam);
    }
  }, [searchParams]);

  const emailValid = /.+@.+\..+/.test(email);
  const amountValid = amount > 0;
  const ibanRequired = instrument === 'sepa';
  const ibanValid = !ibanRequired || iban.trim().length > 0;
  const valid = emailValid && amountValid && ibanValid && consentPrivacy;
  const showFieldErrors = submitAttempted;
  const formErrors: { id: string; label: string; message: string }[] = [];
  if (showFieldErrors && !amountValid) {
    formErrors.push({
      id: 'donation-amount',
      label: 'Betrag',
      message: 'Bitte geben Sie einen Betrag größer als 0 ein.',
    });
  }
  if (showFieldErrors && !emailValid) {
    formErrors.push({
      id: 'donation-email',
      label: 'E-Mail',
      message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    });
  }
  if (showFieldErrors && !ibanValid) {
    formErrors.push({
      id: 'donation-iban',
      label: 'IBAN',
      message: 'Für SEPA-Lastschrift ist eine IBAN erforderlich.',
    });
  }
  if (showFieldErrors && !consentPrivacy) {
    formErrors.push({
      id: 'donation-consent',
      label: 'Datenschutz',
      message: 'Bitte bestätigen Sie die Datenschutzerklärung.',
    });
  }
  const buildSuccessPath = React.useCallback(
    (method: string) => {
      const params = new URLSearchParams({
        amount: String(amount),
        currency: 'EUR',
        purpose,
        method,
        interval,
      });
      return `/erfolg?${params.toString()}`;
    },
    [amount, interval, purpose]
  );
  const buildSuccessUrl = React.useCallback(
    (method: string) => `${window.location.origin}${buildSuccessPath(method)}`,
    [buildSuccessPath]
  );

  // Debounced, cached PaymentIntent for Payment Element
  const piCacheRef = React.useRef<{ key: string; cs: string | null }>({ key: '', cs: null });
  React.useEffect(() => {
    const needsPE = ['visa', 'mastercard', 'amex', 'apple_pay', 'google_pay'].includes(instrument);
    if (!needsPE) {
      setClientSecret(null);
      return;
    }
    if (!/.+@.+\..+/.test(email) || amount <= 0) return;
    const key = `${instrument}|${email}|${amount}|${purpose}|${interval}`;
    if (piCacheRef.current.key === key && piCacheRef.current.cs) {
      setClientSecret(piCacheRef.current.cs);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await createStripeIntent({
          amount,
          currency: 'EUR',
          email,
          purpose,
          financial_type: financialType,
          interval,
        });
        const cs = (res.data as any)?.client_secret || null;
        if (!cancelled) {
          piCacheRef.current = { key, cs };
          setClientSecret(cs);
        }
      } catch {
        if (!cancelled) setClientSecret(null);
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [instrument, amount, email, purpose, financialType, interval]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!valid) {
      setError('Bitte korrigieren Sie die markierten Felder im Formular.');
      return;
    }
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      if (['eps', 'sofort'].includes(instrument)) {
        const stripe = await getStripe();
        if (!stripe) throw new Error('Stripe nicht verfügbar');
        const init = await createStripeIntent({
          amount,
          currency: 'EUR',
          email,
          purpose,
          method: instrument as any,
          financial_type: financialType,
          interval,
        });
        const clientSecret = (init.data as any)?.client_secret;
        if (!clientSecret) throw new Error('Payment Intent fehlgeschlagen');
        const return_url = buildSuccessUrl(instrument);
        const confirm = await stripe.confirmPayment({
          clientSecret,
          confirmParams: { return_url },
        });
        if ((confirm as any)?.error) throw (confirm as any).error;
        setMessage('Zahlung gestartet. Bitte Schritt im Zahlungsfenster abschließen.');
        return;
      }

      if (instrument === 'sepa') {
        const stripe = await getStripe();
        if (!stripe) throw new Error('Stripe nicht verfügbar');
        const init = await createStripeIntent({
          amount,
          currency: 'EUR',
          email,
          purpose,
          method: 'sepa',
          financial_type: financialType,
          interval,
        });
        const clientSecret = (init.data as any)?.client_secret;
        const result = await stripe.confirmSepaDebitPayment(clientSecret, {
          payment_method: {
            sepa_debit: { iban },
            billing_details: { name: `${firstName} ${lastName}`.trim() || email, email },
          },
          return_url: buildSuccessUrl('sepa'),
        });
        if ((result as any)?.error) throw (result as any).error;
        setMessage('SEPA-Mandat erteilt. Vielen Dank!');
        return;
      }

      // Fallback (Banküberweisung, POS, Cash): Unterstützung oder Dauerspende registrieren
      if (
        interval !== 'once' &&
        ['bank_transfer', 'sepa', 'visa', 'mastercard', 'amex'].includes(instrument)
      ) {
        await api.contributions.recur({
          email,
          amount,
          currency: 'EUR',
          interval,
          financial_type: financialType,
          purpose,
          payment_instrument: instrument as
            | 'bank_transfer'
            | 'sepa'
            | 'visa'
            | 'mastercard'
            | 'amex',
        });
      } else {
        await api.contributions.create({
          email,
          amount,
          currency: 'EUR',
          financial_type: financialType,
          purpose,
          anonymous,
          tribute_name: tribute || undefined,
          payment_instrument: instrument,
        });
      }

      setMessage('Vielen Dank für Ihre Unterstützung! Bestätigung erfolgt per E‑Mail.');
      navigate(buildSuccessPath(instrument));
    } catch (err: any) {
      console.error(
        'Spendenvorgang fehlgeschlagen:',
        err instanceof Error ? err.message : 'Unknown error'
      );
      setError(err?.message || 'Spende fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <SeoHead
        title="Spenden – Demokratie und Menschenrechte unterstützen"
        description="Unterstützen Sie Menschlichkeit Österreich mit einer Spende und helfen Sie uns, Demokratie, Menschenrechte und soziale Gerechtigkeit in Österreich zu stärken."
      />
      <JsonLdBreadcrumb
        items={[
          { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
          { name: 'Spenden', url: 'https://www.menschlichkeit-oesterreich.at/spenden' },
        ]}
      />
      <JsonLdFaq items={FAQ_ITEMS} />
      <Breadcrumb items={[{ label: 'Spenden' }]} />
      <h1 className="text-2xl font-semibold">Spenden</h1>
      <p className="text-secondary-700">
        {membershipContext
          ? 'Sie befinden sich im sicheren Zahlungsabschnitt für Ihren Mitgliedsbeitrag.'
          : 'Einmalig oder regelmäßig – sicher und DSGVO‑konform.'}
      </p>

      {message && (
        <Alert variant="success" role="status">
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="error" role="alert">
          {error}
        </Alert>
      )}
      {membershipContext && (
        <Alert variant="info" role="status">
          Ihr Mitgliedsantrag wurde bereits erfasst. Bitte schließen Sie hier nur noch die
          Zahlungsseite für den Mitgliedsbeitrag ab.
        </Alert>
      )}

      <Card className="p-4">
        <form onSubmit={onSubmit} aria-busy={submitting}>
          {formErrors.length > 0 && (
            <div
              className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3"
              role="alert"
              aria-live="assertive"
            >
              <p className="text-sm font-semibold text-red-900">
                Bitte prüfen Sie folgende Eingaben:
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-red-800">
                {formErrors.map(item => (
                  <li key={item.id}>
                    <a className="underline" href={`#${item.id}`}>
                      {item.label}: {item.message}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <fieldset className="grid gap-3" disabled={submitting}>
            <legend className="sr-only">Spendenformular</legend>
            <div className="flex gap-2 flex-wrap">
              {[20, 50, 100, 250].map(preset => (
                <button
                  key={preset}
                  type="button"
                  className={[
                    'rounded-lg border px-3 py-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
                    amount === preset
                      ? 'border-primary-300 bg-primary-50 text-primary-800'
                      : 'border-secondary-300 bg-white text-secondary-800 hover:bg-secondary-50',
                  ].join(' ')}
                  onClick={() => setAmount(preset)}
                  aria-pressed={amount === preset}
                >
                  {preset} €
                </button>
              ))}
              <div className="ml-auto min-w-[12rem]">
                <label
                  className="block text-sm font-medium text-secondary-800"
                  htmlFor="donation-amount"
                >
                  Betrag
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    id="donation-amount"
                    name="amount"
                    type="number"
                    className={fieldClass}
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    aria-invalid={showFieldErrors && !amountValid}
                    aria-describedby={
                      showFieldErrors && !amountValid ? 'donation-amount-error' : undefined
                    }
                  />
                  <span aria-hidden="true">€</span>
                </div>
                {showFieldErrors && !amountValid && (
                  <p id="donation-amount-error" className="mt-1 text-sm text-red-700">
                    Bitte geben Sie einen Betrag größer als 0 ein.
                  </p>
                )}
              </div>
            </div>

            <label className="block" htmlFor="donation-interval">
              <span className="block text-sm font-medium">Rhythmus *</span>
              <select
                id="donation-interval"
                name="interval"
                className={fieldClass}
                value={interval}
                onChange={e => setInterval(e.target.value as Interval)}
              >
                <option value="once">Einmalig</option>
                <option value="monthly">Monatlich</option>
                <option value="quarterly">Vierteljährlich</option>
                <option value="yearly">Jährlich</option>
              </select>
            </label>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="block" htmlFor="donation-first-name">
                <span className="block text-sm font-medium">Vorname</span>
                <input
                  id="donation-first-name"
                  name="given-name"
                  autoComplete="given-name"
                  className={fieldClass}
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </label>
              <label className="block" htmlFor="donation-last-name">
                <span className="block text-sm font-medium">Nachname</span>
                <input
                  id="donation-last-name"
                  name="family-name"
                  autoComplete="family-name"
                  className={fieldClass}
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </label>
            </div>
            <label className="block" htmlFor="donation-email">
              <span className="block text-sm font-medium">E‑Mail *</span>
              <input
                id="donation-email"
                name="email"
                className={fieldClass}
                type="email"
                autoComplete="email"
                spellCheck={false}
                value={email}
                onChange={e => setEmail(e.target.value)}
                aria-invalid={showFieldErrors && !emailValid}
                aria-describedby={
                  showFieldErrors && !emailValid ? 'donation-email-error' : undefined
                }
                required
              />
              {showFieldErrors && !emailValid && (
                <p id="donation-email-error" className="mt-1 text-sm text-red-700">
                  Bitte geben Sie eine gültige E-Mail-Adresse ein.
                </p>
              )}
            </label>

            <label className="block" htmlFor="donation-purpose">
              <span className="block text-sm font-medium">Zweck (optional)</span>
              <input
                id="donation-purpose"
                name="purpose"
                className={fieldClass}
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="Projekt oder Fonds…"
              />
            </label>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="flex items-center gap-2" htmlFor="donation-anonymous">
                <input
                  id="donation-anonymous"
                  name="anonymous"
                  type="checkbox"
                  checked={anonymous}
                  onChange={e => setAnonymous(e.target.checked)}
                />
                <span>Anonyme Spende</span>
              </label>
              <label className="block" htmlFor="donation-tribute">
                <span className="block text-sm font-medium">Tribute (optional)</span>
                <input
                  id="donation-tribute"
                  name="tribute"
                  className={fieldClass}
                  value={tribute}
                  onChange={e => setTribute(e.target.value)}
                  placeholder="Im Namen von …"
                />
              </label>
            </div>

            <label className="block" htmlFor="donation-instrument">
              <span className="block text-sm font-medium">Zahlungsart *</span>
              <select
                id="donation-instrument"
                name="payment-instrument"
                className={fieldClass}
                value={instrument}
                onChange={e => setInstrument(e.target.value as Instrument)}
              >
                <option value="sepa">SEPA‑Lastschrift</option>
                <option value="bank_transfer">Banküberweisung (IBAN)</option>
                <option value="eps">EPS</option>
                <option value="sofort">Sofort/Klarna</option>
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
                <label className="block" htmlFor="donation-iban">
                  <span className="block text-sm font-medium">IBAN *</span>
                  <input
                    id="donation-iban"
                    name="iban"
                    className={fieldClass}
                    autoComplete="off"
                    value={iban}
                    onChange={e => setIban(e.target.value)}
                    aria-invalid={showFieldErrors && !ibanValid}
                    aria-describedby={
                      showFieldErrors && !ibanValid ? 'donation-iban-error' : undefined
                    }
                    required
                  />
                  {showFieldErrors && !ibanValid && (
                    <p id="donation-iban-error" className="mt-1 text-sm text-red-700">
                      Für SEPA-Lastschrift ist eine IBAN erforderlich.
                    </p>
                  )}
                </label>
                <label className="block" htmlFor="donation-bic">
                  <span className="block text-sm font-medium">BIC (optional)</span>
                  <input
                    id="donation-bic"
                    name="bic"
                    className={fieldClass}
                    autoComplete="off"
                    value={bic}
                    onChange={e => setBic(e.target.value)}
                  />
                </label>
              </div>
            )}

            {(instrument === 'visa' ||
              instrument === 'mastercard' ||
              instrument === 'amex' ||
              instrument === 'apple_pay' ||
              instrument === 'google_pay') &&
              clientSecret && (
                <React.Suspense
                  fallback={
                    <div className="p-2 text-sm text-muted">Zahlungsmodul wird geladen…</div>
                  }
                >
                  <StripeCheckout
                    clientSecret={clientSecret}
                    disabled={!valid || submitting}
                    payer={{
                      name: `${firstName} ${lastName}`.trim() || email,
                      email,
                      iban: undefined,
                    }}
                    returnUrl={buildSuccessUrl(instrument)}
                    onDone={(msg: string) => {
                      setMessage(msg);
                      navigate(buildSuccessPath(instrument));
                    }}
                    onError={(msg: string) => setError(msg)}
                  />
                </React.Suspense>
              )}

            <div className="rounded-xl border border-secondary-200 bg-secondary-50 p-4">
              <label className="flex items-start gap-2 text-sm text-secondary-700" htmlFor="donation-consent">
                <input
                  id="donation-consent"
                  name="consent-privacy"
                  type="checkbox"
                  checked={consentPrivacy}
                  onChange={e => setConsentPrivacy(e.target.checked)}
                  className="mt-0.5"
                  aria-describedby={showFieldErrors && !consentPrivacy ? 'donation-consent-error' : undefined}
                  required
                />
                <span>
                  Ich habe die{' '}
                  <Link to="/datenschutz" className="font-medium text-primary-700 hover:underline">
                    Datenschutzerklärung
                  </Link>{' '}
                  gelesen und stimme der Verarbeitung meiner Angaben zur Spendenabwicklung zu. *
                </span>
              </label>
              {showFieldErrors && !consentPrivacy && (
                <p id="donation-consent-error" className="mt-2 text-sm text-red-700">
                  Bitte bestätigen Sie die Datenschutzerklärung.
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button type="submit" disabled={!valid || submitting} aria-busy={submitting}>
                {submitting ? 'Wird übermittelt…' : 'Jetzt spenden'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => window.history.back()}>
                Abbrechen
              </Button>
            </div>
          </fieldset>
        </form>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Transparenz vor der Spende</h2>
          <p className="mt-4 text-sm leading-relaxed text-secondary-700">
            Bevor Sie unterstützen, können Sie Vereinsdaten, Mittelverwendung, Statuten und
            Datenschutz prüfen. So bleibt der Prozess nachvollziehbar und vertrauenswürdig.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link to="/transparenz" className="font-medium text-primary-700 hover:underline">
              Transparenz
            </Link>
            <Link to="/statuten" className="font-medium text-primary-700 hover:underline">
              Statuten
            </Link>
            <Link to="/datenschutz" className="font-medium text-primary-700 hover:underline">
              Datenschutz
            </Link>
          </div>
        </article>
        <article className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Weitere Wege zu unterstützen</h2>
          <p className="mt-4 text-sm leading-relaxed text-secondary-700">
            Neben Spenden können Sie Mitglied werden, Veranstaltungen besuchen oder Bildungsangebote
            weiterempfehlen.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link to="/mitglied-werden" className="font-medium text-primary-700 hover:underline">
              Mitglied werden
            </Link>
            <Link to="/veranstaltungen" className="font-medium text-primary-700 hover:underline">
              Veranstaltungen
            </Link>
            <Link to="/bildung" className="font-medium text-primary-700 hover:underline">
              Bildung
            </Link>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-secondary-900">
          Häufige Fragen zum Unterstützen
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {FAQ_ITEMS.map(item => (
            <article
              key={item.question}
              className="rounded-2xl border border-secondary-100 bg-secondary-50 p-5"
            >
              <h3 className="font-semibold text-secondary-900">{item.question}</h3>
              <p className="mt-3 text-sm leading-relaxed text-secondary-700">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
