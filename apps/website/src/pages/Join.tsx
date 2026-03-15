import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import SeoHead from '../components/seo/SeoHead';
import { api, CreateMembershipRequest } from '../services/api';

// ── Typen ──────────────────────────────────────────────────────────────────

type MembershipType = 'ordentlich' | 'ausserordentlich' | 'foerdernd';
type FeeCategory    = 'standard' | 'ermaessigt' | 'haertefall';
type PaymentMethod  = 'stripe_card' | 'sepa';

interface FormData {
  // Schritt 1
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  // Schritt 2
  type:     MembershipType;
  category: FeeCategory;
  // Schritt 3
  paymentMethod: PaymentMethod;
  iban:          string;
  bic:           string;
  kontoinhaber:  string;
  // Schritt 4
  agreeStatuten:       boolean;
  agreeDSGVO:          boolean;
  agreeBeitragsordnung: boolean;
  agreeMandat:         boolean;
  newsletterOptIn:     boolean;
}

const FEE_MAP: Record<MembershipType, Record<FeeCategory, string>> = {
  ordentlich:      { standard: '60 €/Jahr', ermaessigt: '30 €/Jahr', haertefall: 'nach Vereinbarung' },
  ausserordentlich:{ standard: '30 €/Jahr', ermaessigt: '15 €/Jahr', haertefall: 'nach Vereinbarung' },
  foerdernd:       { standard: '120 €/Jahr', ermaessigt: '60 €/Jahr', haertefall: 'nach Vereinbarung' },
};

const MEMBERSHIP_LABELS: Record<MembershipType, string> = {
  ordentlich:       'Ordentliches Mitglied (Stimmrecht)',
  ausserordentlich: 'Außerordentliches Mitglied',
  foerdernd:        'Fördermitglied',
};

const STEPS = ['Persönliche Daten', 'Mitgliedschaft', 'Zahlung', 'Bestätigung'];

// ── Fortschrittsanzeige ────────────────────────────────────────────────────

function ProgressBar({ current }: { current: number }) {
  return (
    <nav aria-label="Antragsschritte" className="mb-6">
      <ol className="flex items-center gap-0">
        {STEPS.map((label, i) => {
          const done    = i < current;
          const active  = i === current;
          return (
            <React.Fragment key={label}>
              <li className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                    ${done   ? 'bg-primary-500 border-primary-500 text-white'
                    : active ? 'bg-white border-primary-500 text-primary-600'
                    :          'bg-white border-secondary-300 text-secondary-400'}`}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span className={`mt-1 text-xs text-center leading-tight hidden sm:block
                  ${active ? 'font-semibold text-primary-600' : 'text-secondary-500'}`}>
                  {label}
                </span>
              </li>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-colors ${done ? 'bg-primary-500' : 'bg-secondary-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// ── Schritt 1: Persönliche Daten ───────────────────────────────────────────

function Step1({ data, set }: { data: FormData; set: (d: Partial<FormData>) => void }) {
  const valid = data.firstName.trim() && data.lastName.trim() && /.+@.+\..+/.test(data.email);
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Persönliche Daten</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <Input label="Vorname *" value={data.firstName} onChange={e => set({ firstName: e.target.value })}
          required autoComplete="given-name" />
        <Input label="Nachname *" value={data.lastName} onChange={e => set({ lastName: e.target.value })}
          required autoComplete="family-name" />
      </div>
      <Input type="email" label="E-Mail-Adresse *" value={data.email}
        onChange={e => set({ email: e.target.value })} required autoComplete="email" placeholder="name@beispiel.at" />
      <Input type="tel" label="Telefon (optional)" value={data.phone}
        onChange={e => set({ phone: e.target.value })} autoComplete="tel" />
      <p className="text-xs text-secondary-500">* Pflichtfelder</p>
      <div className="flex justify-end pt-2">
        <Button disabled={!valid} onClick={() => {}}>Weiter →</Button>
      </div>
    </div>
  );
}

// ── Schritt 2: Mitgliedschaftskategorie ────────────────────────────────────

function Step2({ data, set, onBack }: { data: FormData; set: (d: Partial<FormData>) => void; onBack: () => void }) {
  const fee = FEE_MAP[data.type][data.category];
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Mitgliedschaftskategorie</h2>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-secondary-700">Mitgliedsart *</legend>
        {(Object.entries(MEMBERSHIP_LABELS) as [MembershipType, string][]).map(([key, label]) => (
          <label key={key} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors
            ${data.type === key ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:bg-secondary-50'}`}>
            <input type="radio" name="membershipType" value={key} checked={data.type === key}
              onChange={() => set({ type: key })} className="mt-1" />
            <div>
              <span className="font-medium text-sm">{label}</span>
              <p className="text-xs text-secondary-500 mt-0.5">{FEE_MAP[key][data.category]}</p>
            </div>
          </label>
        ))}
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium text-secondary-700">Beitragskategorie *</span>
        <select className="mt-1 w-full rounded-lg border border-secondary-200 p-2.5 text-sm"
          value={data.category} onChange={e => set({ category: e.target.value as FeeCategory })}>
          <option value="standard">Standard</option>
          <option value="ermaessigt">Ermäßigt (Schüler:in / Student:in / Pensionist:in)</option>
          <option value="haertefall">Härtefall (Betrag nach Vereinbarung)</option>
        </select>
      </label>

      <div className="rounded-lg bg-primary-50 border border-primary-200 p-3 text-sm">
        <span className="font-semibold">Ihr Mitgliedsbeitrag:</span>{' '}
        <span className="text-primary-700">{fee}</span>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={onBack}>← Zurück</Button>
        <Button>Weiter →</Button>
      </div>
    </div>
  );
}

// ── Schritt 3: Zahlung ─────────────────────────────────────────────────────

function Step3({ data, set, onBack }: { data: FormData; set: (d: Partial<FormData>) => void; onBack: () => void }) {
  const sepaValid = data.paymentMethod === 'stripe_card' ||
    (data.iban.trim().length >= 15 && data.kontoinhaber.trim().length > 0);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Zahlungsweise</h2>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-secondary-700">Zahlungsart wählen *</legend>

        <label className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors
          ${data.paymentMethod === 'stripe_card' ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:bg-secondary-50'}`}>
          <input type="radio" name="paymentMethod" value="stripe_card"
            checked={data.paymentMethod === 'stripe_card'} onChange={() => set({ paymentMethod: 'stripe_card' })} />
          <div>
            <span className="font-medium text-sm">Kreditkarte / EPS / Sofortüberweisung</span>
            <p className="text-xs text-secondary-500">Sicher via Stripe. Visa, Mastercard, EPS.</p>
          </div>
        </label>

        <label className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors
          ${data.paymentMethod === 'sepa' ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:bg-secondary-50'}`}>
          <input type="radio" name="paymentMethod" value="sepa"
            checked={data.paymentMethod === 'sepa'} onChange={() => set({ paymentMethod: 'sepa' })} />
          <div>
            <span className="font-medium text-sm">SEPA-Lastschrift</span>
            <p className="text-xs text-secondary-500">Jährliche Abbuchung. Gläubiger-ID: AT12ZZZ00000012345</p>
          </div>
        </label>
      </fieldset>

      {data.paymentMethod === 'stripe_card' && (
        <div className="rounded-lg border border-secondary-200 bg-secondary-50 p-4 text-sm text-secondary-600">
          Nach Absenden des Antrags werden Sie zur sicheren Stripe-Zahlungsseite weitergeleitet.
        </div>
      )}

      {data.paymentMethod === 'sepa' && (
        <div className="space-y-3 rounded-lg border border-secondary-200 p-4">
          <h3 className="text-sm font-semibold">SEPA-Lastschrift-Mandat</h3>
          <Input label="Kontoinhaber:in *" value={data.kontoinhaber}
            onChange={e => set({ kontoinhaber: e.target.value })} autoComplete="name" />
          <Input label="IBAN *" value={data.iban} placeholder="AT61 1904 3002 3457 3201"
            onChange={e => set({ iban: e.target.value.replace(/\s/g, '').toUpperCase() })} />
          <Input label="BIC (optional im SEPA-Raum)" value={data.bic} placeholder="OPSKATWW"
            onChange={e => set({ bic: e.target.value.toUpperCase() })} />
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={onBack}>← Zurück</Button>
        <Button disabled={!sepaValid}>Weiter →</Button>
      </div>
    </div>
  );
}

// ── Schritt 4: Bestätigung + DSGVO ────────────────────────────────────────

function Step4({
  data, set, onBack, onSubmit, submitting
}: {
  data: FormData;
  set: (d: Partial<FormData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const canSubmit =
    data.agreeStatuten && data.agreeDSGVO && data.agreeBeitragsordnung &&
    (data.paymentMethod === 'stripe_card' || data.agreeMandat);

  const fee = FEE_MAP[data.type][data.category];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Zusammenfassung</h2>

      {/* Übersicht */}
      <div className="rounded-lg border border-secondary-200 divide-y divide-secondary-100 text-sm">
        {[
          ['Name', `${data.firstName} ${data.lastName}`],
          ['E-Mail', data.email],
          ['Telefon', data.phone || '—'],
          ['Mitgliedsart', MEMBERSHIP_LABELS[data.type]],
          ['Beitragskategorie', data.category === 'standard' ? 'Standard' : data.category === 'ermaessigt' ? 'Ermäßigt' : 'Härtefall'],
          ['Jahresbeitrag', fee],
          ['Zahlung', data.paymentMethod === 'stripe_card' ? 'Kreditkarte / EPS' : `SEPA-Lastschrift (${data.iban})`],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-2 px-3 py-2">
            <span className="w-36 shrink-0 text-secondary-500">{k}</span>
            <span className="font-medium">{v}</span>
          </div>
        ))}
      </div>

      {/* Rechtliches */}
      <div className="space-y-2">
        {[
          { key: 'agreeStatuten', label: <>Ich habe die <a href="/statuten" className="text-primary-600 underline" target="_blank">Vereinsstatuten</a> gelesen und erkenne sie an.</> },
          { key: 'agreeDSGVO', label: <>Ich stimme der Verarbeitung meiner Daten gemäß <a href="/datenschutz" className="text-primary-600 underline" target="_blank">Datenschutzerklärung</a> zu.</> },
          { key: 'agreeBeitragsordnung', label: <>Ich akzeptiere die <a href="/beitragsordnung" className="text-primary-600 underline" target="_blank">Beitragsordnung 2025</a>.</> },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="mt-0.5"
              checked={data[key as keyof FormData] as boolean}
              onChange={e => set({ [key]: e.target.checked })} />
            <span>{label}</span>
          </label>
        ))}

        {data.paymentMethod === 'sepa' && (
          <label className="flex items-start gap-2 text-sm cursor-pointer rounded-lg border border-secondary-200 p-3 bg-secondary-50">
            <input type="checkbox" className="mt-0.5 shrink-0"
              checked={data.agreeMandat} onChange={e => set({ agreeMandat: e.target.checked })} />
            <span>
              Ich ermächtige Menschlichkeit Österreich (Gläubiger-ID: AT12ZZZ00000012345),
              den jährlichen Mitgliedsbeitrag von meinem Konto per SEPA-Lastschrift einzuziehen.
              Ich kann innerhalb von 8 Wochen Erstattung verlangen.
            </span>
          </label>
        )}

        <label className="flex items-start gap-2 text-sm cursor-pointer text-secondary-600">
          <input type="checkbox" className="mt-0.5"
            checked={data.newsletterOptIn} onChange={e => set({ newsletterOptIn: e.target.checked })} />
          <span>Ich möchte den Newsletter von Menschlichkeit Österreich erhalten. (optional)</span>
        </label>

        <p className="text-xs text-secondary-400 pt-1">
          Austritt gemäß §7, Ausschluss §8, Schiedsgericht §14 der Statuten. Widerrufsrecht DSGVO Art. 7 Abs. 3.
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={onBack} disabled={submitting}>← Zurück</Button>
        <Button onClick={onSubmit} disabled={!canSubmit || submitting}>
          {submitting ? 'Wird übermittelt …' : 'Mitgliedschaft beantragen ✓'}
        </Button>
      </div>
    </div>
  );
}

// ── Hauptkomponente ─────────────────────────────────────────────────────────

const INITIAL: FormData = {
  firstName: '', lastName: '', email: '', phone: '',
  type: 'ordentlich', category: 'standard',
  paymentMethod: 'sepa', iban: '', bic: '', kontoinhaber: '',
  agreeStatuten: false, agreeDSGVO: false, agreeBeitragsordnung: false,
  agreeMandat: false, newsletterOptIn: false,
};

export default function JoinPage() {
  const nav = useNavigate();
  const [step,       setStep]       = React.useState(0);
  const [data,       setData]       = React.useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = React.useState(false);
  const [error,      setError]      = React.useState<string | null>(null);

  function set(partial: Partial<FormData>) {
    setData(prev => ({ ...prev, ...partial }));
  }

  function next() { setStep(s => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      // 1) Registrierung
      const reg = await api.auth.register({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
      });
      const token = (reg.data as any)?.tokens?.token ?? (reg.data as any)?.access_token;
      if (!token) throw new Error('Registrierung fehlgeschlagen.');
      sessionStorage.setItem('moe_auth_token', token);

      // 2) Mitgliedschaft anlegen
      const membershipTypeId =
        data.type === 'ordentlich' ? 1 : data.type === 'ausserordentlich' ? 2 : 3;
      const contactId = (reg.data as any)?.contact?.id ?? 1;
      const payload: CreateMembershipRequest = {
        contact_id: contactId,
        membership_type_id: membershipTypeId,
      };
      await api.memberships.create(payload, token);

      // 3) Bei Stripe-Zahlung: Redirect zu Stripe Checkout
      if (data.paymentMethod === 'stripe_card') {
        nav('/checkout?membership=new');
        return;
      }

      // 4) Erfolgreich
      nav('/mitglied-werden/danke');
    } catch (err: any) {
      setError(err?.message ?? 'Übermittlung fehlgeschlagen. Bitte erneut versuchen.');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <SeoHead
        title="Mitglied werden – Menschlichkeit Österreich"
        description="Werden Sie Mitglied bei Menschlichkeit Österreich und setzen Sie sich gemeinsam mit uns für Demokratie, Menschenrechte und soziale Gerechtigkeit ein. Jetzt beitreten."
      />
      <Breadcrumb items={[{ label: 'Mitglied werden' }]} />
      <h1 className="text-2xl font-bold">Mitglied werden</h1>
      <p className="text-secondary-600 text-sm">
        Digitaler Beitrittsantrag gemäß Vereinsstatuten und DSGVO.
      </p>
      <ProgressBar current={step} />
      {error && <Alert variant="error">{error}</Alert>}
      <Card className="p-4">
        <div onClick={(e) => {
          const btn = (e.target as HTMLElement).closest('button');
          if (!btn || btn.disabled) return;
          const text = btn.textContent ?? '';
          if (text.includes('Weiter') && step < STEPS.length - 1) next();
        }}>
          {step === 0 && <Step1 data={data} set={set} />}
          {step === 1 && <Step2 data={data} set={set} onBack={back} />}
          {step === 2 && <Step3 data={data} set={set} onBack={back} />}
          {step === 3 && (
            <Step4 data={data} set={set} onBack={back} onSubmit={onSubmit} submitting={submitting} />
          )}
        </div>
      </Card>
    </div>
  );
}
