import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';
import JsonLdFaq from '../components/seo/JsonLdFaq';
import SeoHead from '../components/seo/SeoHead';
import { Alert } from '../components/ui/Alert';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { CONTACT_EMAIL, LEGAL_DOCS } from '../config/siteConfig';
import { api, CreateMembershipRequest } from '../services/api';
import { http } from '../services/http';

// ── Typen ──────────────────────────────────────────────────────────────────

type MembershipType = 'ordentlich' | 'ausserordentlich' | 'foerdernd';
type FeeCategory = 'standard' | 'ermaessigt' | 'haertefall';
type PaymentMethod = 'stripe_card' | 'sepa';

interface FormData {
  // Schritt 1
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  // Schritt 2
  type: MembershipType;
  category: FeeCategory;
  // Schritt 3
  paymentMethod: PaymentMethod;
  iban: string;
  bic: string;
  kontoinhaber: string;
  // Schritt 4
  agreeStatuten: boolean;
  agreeDSGVO: boolean;
  agreeBeitragsordnung: boolean;
  agreeMandat: boolean;
  newsletterOptIn: boolean;
}

const FEE_MAP: Record<MembershipType, Record<FeeCategory, string>> = {
  ordentlich: {
    standard: '36 €/Jahr oder 3 €/Monat',
    ermaessigt: '18 €/Jahr oder 1,50 €/Monat',
    haertefall: '0 € auf begründeten Antrag',
  },
  ausserordentlich: {
    standard: '36 €/Jahr oder 3 €/Monat',
    ermaessigt: '18 €/Jahr oder 1,50 €/Monat',
    haertefall: '0 € auf begründeten Antrag',
  },
  foerdernd: {
    standard: '36 €/Jahr oder 3 €/Monat',
    ermaessigt: '18 €/Jahr oder 1,50 €/Monat',
    haertefall: '0 € auf begründeten Antrag',
  },
};

const FEE_VALUES: Record<MembershipType, Record<'standard' | 'ermaessigt', number>> = {
  ordentlich: { standard: 36, ermaessigt: 18 },
  ausserordentlich: { standard: 36, ermaessigt: 18 },
  foerdernd: { standard: 36, ermaessigt: 18 },
};

const MEMBERSHIP_LABELS: Record<MembershipType, string> = {
  ordentlich: 'Ordentliches Mitglied (Stimmrecht)',
  ausserordentlich: 'Außerordentliches Mitglied',
  foerdernd: 'Fördermitglied',
};

const FAQ_ITEMS = [
  {
    question: 'Wie läuft der Mitgliedsantrag ab?',
    answer:
      'Sie erfassen Ihre Daten digital, wählen Mitgliedschaft und Zahlungsweg und bestätigen Statuten, Datenschutz und Beitragsordnung. Danach wird Ihr Antrag gespeichert und die nächsten Schritte werden angezeigt.',
  },
  {
    question: 'Welche Unterlagen sollte ich vorher prüfen?',
    answer:
      'Für eine informierte Entscheidung empfehlen wir die Statuten, die Beitragsordnung, die Datenschutzerklärung und die Transparenz-Seite des Vereins.',
  },
  {
    question: 'Was passiert bei einem Härtefall-Beitrag?',
    answer:
      'Bei Härtefällen erfolgt die Beitragsfestlegung nach Vereinbarung. In diesem Fall wird keine starre Online-Zahlung vorausgesetzt, sondern der weitere Ablauf individuell abgestimmt.',
  },
];

function getFeeValue(type: MembershipType, category: FeeCategory): number | null {
  if (category === 'haertefall') {
    return null;
  }

  return FEE_VALUES[type][category];
}

const STEPS = ['Persönliche Daten', 'Mitgliedschaft', 'Zahlung', 'Bestätigung'];

// ── Fortschrittsanzeige ────────────────────────────────────────────────────

function ProgressBar({ current }: { current: number }) {
  return (
    <nav aria-label="Antragsschritte" className="mb-6">
      <p className="sr-only" aria-live="polite">
        Schritt {current + 1} von {STEPS.length}: {STEPS[current]}
      </p>
      <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex flex-col items-center">
              <div className="flex min-h-[3.5rem] flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors
                    ${
                      done
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : active
                          ? 'bg-white border-primary-500 text-primary-600'
                          : 'bg-secondary-50 border-secondary-400 text-secondary-700'
                    }`}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span
                  className={`mt-2 text-center text-xs leading-tight ${active ? 'font-semibold text-primary-700' : 'text-secondary-600'}`}
                >
                  {label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ── Schritt 1: Persönliche Daten ───────────────────────────────────────────

function Step1({
  data,
  set,
  onNext,
}: {
  data: FormData;
  set: (d: Partial<FormData>) => void;
  onNext: () => void;
}) {
  const valid = data.firstName.trim() && data.lastName.trim() && /.+@.+\..+/.test(data.email);
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Persönliche Daten</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <Input
          label="Vorname"
          value={data.firstName}
          onChange={e => set({ firstName: e.target.value })}
          required
          autoComplete="given-name"
        />
        <Input
          label="Nachname"
          value={data.lastName}
          onChange={e => set({ lastName: e.target.value })}
          required
          autoComplete="family-name"
        />
      </div>
      <Input
        type="email"
        label="E-Mail-Adresse"
        value={data.email}
        onChange={e => set({ email: e.target.value })}
        required
        autoComplete="email"
        placeholder="name@beispiel.at"
      />
      <Input
        type="tel"
        label="Telefon (optional)"
        value={data.phone}
        onChange={e => set({ phone: e.target.value })}
        autoComplete="tel"
      />
      <input
        type="text"
        tabIndex={-1}
        autoComplete="organization"
        aria-hidden="true"
        className="hidden"
        value={data.company}
        onChange={e => set({ company: e.target.value })}
      />
      <p className="text-xs text-secondary-700">
        <span aria-hidden="true" className="font-semibold text-error-700">
          *
        </span>{' '}
        Pflichtfelder
      </p>
      <div className="flex justify-end pt-2">
        <Button type="button" disabled={!valid} onClick={onNext}>
          Weiter →
        </Button>
      </div>
    </div>
  );
}

// ── Schritt 2: Mitgliedschaftskategorie ────────────────────────────────────

function Step2({
  data,
  set,
  onBack,
  onNext,
}: {
  data: FormData;
  set: (d: Partial<FormData>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const fee = FEE_MAP[data.type][data.category];
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Mitgliedschaftskategorie</h2>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-secondary-700">
          Mitgliedsart{' '}
          <span aria-hidden="true" className="font-semibold text-error-700">
            *
          </span>
          <span className="sr-only">Pflichtfeld</span>
        </legend>
        {(Object.entries(MEMBERSHIP_LABELS) as [MembershipType, string][]).map(([key, label]) => (
          <label
            key={key}
            className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors
            ${data.type === key ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:bg-secondary-50'}`}
          >
            <input
              type="radio"
              name="membershipType"
              value={key}
              checked={data.type === key}
              onChange={() => set({ type: key })}
              className="mt-1"
            />
            <div>
              <span className="font-medium text-sm">{label}</span>
              <p className="text-xs text-secondary-500 mt-0.5">{FEE_MAP[key][data.category]}</p>
            </div>
          </label>
        ))}
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium text-secondary-700">
          Beitragskategorie{' '}
          <span aria-hidden="true" className="font-semibold text-error-700">
            *
          </span>
          <span className="sr-only">Pflichtfeld</span>
        </span>
        <select
          className="mt-1 w-full rounded-lg border border-secondary-200 p-2.5 text-sm"
          value={data.category}
          onChange={e => set({ category: e.target.value as FeeCategory })}
        >
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
        <Button type="button" variant="secondary" onClick={onBack}>
          ← Zurück
        </Button>
        <Button type="button" onClick={onNext}>
          Weiter →
        </Button>
      </div>
    </div>
  );
}

// ── Schritt 3: Zahlung ─────────────────────────────────────────────────────

function Step3({
  data,
  set,
  onBack,
  onNext,
}: {
  data: FormData;
  set: (d: Partial<FormData>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const paymentReady = data.paymentMethod === 'stripe_card' || data.paymentMethod === 'sepa';

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Zahlungsweise</h2>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-secondary-700">
          Zahlungsart wählen{' '}
          <span aria-hidden="true" className="font-semibold text-error-700">
            *
          </span>
          <span className="sr-only">Pflichtfeld</span>
        </legend>

        <label
          className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors
          ${data.paymentMethod === 'stripe_card' ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:bg-secondary-50'}`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="stripe_card"
            checked={data.paymentMethod === 'stripe_card'}
            onChange={() => set({ paymentMethod: 'stripe_card' })}
          />
          <div>
            <span className="font-medium text-sm">Digitale Zahlung</span>
            <p className="text-xs text-secondary-500">
              Online-Zahlung über unterstützte Zahlungsdienstleister.
            </p>
          </div>
        </label>

        <label
          className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors
          ${data.paymentMethod === 'sepa' ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:bg-secondary-50'}`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="sepa"
            checked={data.paymentMethod === 'sepa'}
            onChange={() => set({ paymentMethod: 'sepa' })}
          />
          <div>
            <span className="font-medium text-sm">Überweisung / Dauerauftrag</span>
            <p className="text-xs text-secondary-500">
              Die konkreten Zahlungsdaten werden nach dem Antrag individuell übermittelt.
            </p>
          </div>
        </label>
      </fieldset>

      {data.paymentMethod === 'stripe_card' && (
        <div className="rounded-lg border border-secondary-200 bg-secondary-50 p-4 text-sm text-secondary-600">
          Nach Absenden des Antrags leiten wir Sie bei beitragspflichtigen Kategorien in den
          sicheren Online-Zahlungsablauf weiter.
        </div>
      )}

      {data.paymentMethod === 'sepa' && (
        <div className="rounded-lg border border-secondary-200 p-4 text-sm text-secondary-600">
          Bei Überweisung oder Dauerauftrag erhalten Sie die Zahlungsinformationen nach Eingang
          Ihres Antrags direkt von uns. Falls Sie vorab Rückfragen haben, erreichen Sie uns unter{' '}
          {CONTACT_EMAIL}.
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          ← Zurück
        </Button>
        <Button type="button" disabled={!paymentReady} onClick={onNext}>
          Weiter →
        </Button>
      </div>
    </div>
  );
}

// ── Schritt 4: Bestätigung + DSGVO ────────────────────────────────────────

function Step4({
  data,
  set,
  onBack,
  onSubmit,
  submitting,
}: {
  data: FormData;
  set: (d: Partial<FormData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const canSubmit = data.agreeStatuten && data.agreeDSGVO && data.agreeBeitragsordnung;

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
          [
            'Beitragskategorie',
            data.category === 'standard'
              ? 'Standard'
              : data.category === 'ermaessigt'
                ? 'Ermäßigt'
                : 'Härtefall',
          ],
          ['Jahresbeitrag', fee],
          [
            'Zahlung',
            data.paymentMethod === 'stripe_card'
              ? 'Digitale Zahlung'
              : 'Überweisung / Dauerauftrag',
          ],
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
          {
            key: 'agreeStatuten',
            label: (
              <>
                Ich habe die{' '}
                <a href="/statuten" className="text-primary-600 underline" target="_blank">
                  Vereinsstatuten
                </a>{' '}
                gelesen und erkenne sie an.
              </>
            ),
          },
          {
            key: 'agreeDSGVO',
            label: (
              <>
                Ich stimme der Verarbeitung meiner Daten gemäß{' '}
                <a href="/datenschutz" className="text-primary-600 underline" target="_blank">
                  Datenschutzerklärung
                </a>{' '}
                zu.
              </>
            ),
          },
          {
            key: 'agreeBeitragsordnung',
            label: (
              <>
                Ich akzeptiere die{' '}
                <a href="/beitragsordnung" className="text-primary-600 underline" target="_blank">
                  Beitragsordnung 2025
                </a>
                .
              </>
            ),
          },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-start gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              name={key}
              className="mt-0.5"
              checked={data[key as keyof FormData] as boolean}
              onChange={e => set({ [key]: e.target.checked })}
            />
            <span>{label}</span>
          </label>
        ))}

        <label className="flex items-start gap-2 text-sm cursor-pointer text-secondary-600">
          <input
            type="checkbox"
            name="newsletterOptIn"
            className="mt-0.5"
            checked={data.newsletterOptIn}
            onChange={e => set({ newsletterOptIn: e.target.checked })}
          />
          <span>
            Ich möchte den Newsletter von Menschlichkeit Österreich erhalten (optional). Die
            Anmeldung erfolgt per Double-Opt-In, und der Widerruf ist jederzeit möglich. Details in
            der{' '}
            <a href="/datenschutz" className="text-primary-600 underline" target="_blank">
              Datenschutzerklärung
            </a>
            .
          </span>
        </label>

        <p className="text-xs text-secondary-600 pt-1">
          Für den verbindlichen Wortlaut gelten die Statuten, die Beitragsordnung und die
          Datenschutzerklärung in der jeweils bereitgestellten Fassung.
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={onBack} disabled={submitting}>
          ← Zurück
        </Button>
        <Button onClick={onSubmit} disabled={!canSubmit || submitting}>
          {submitting ? 'Wird übermittelt …' : 'Mitgliedschaft beantragen ✓'}
        </Button>
      </div>
    </div>
  );
}

// ── Hauptkomponente ─────────────────────────────────────────────────────────

const INITIAL: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  type: 'ordentlich',
  category: 'standard',
  paymentMethod: 'sepa',
  iban: '',
  bic: '',
  kontoinhaber: '',
  agreeStatuten: false,
  agreeDSGVO: false,
  agreeBeitragsordnung: false,
  agreeMandat: false,
  newsletterOptIn: false,
};

export default function JoinPage() {
  const nav = useNavigate();
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function set(partial: Partial<FormData>) {
    setData(prev => ({ ...prev, ...partial }));
  }

  function next() {
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep(s => Math.max(s - 1, 0));
  }

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const contactResult = await http.post<{
        success: boolean;
        data?: { contact?: { id?: number } };
      }>('/api/contacts/create', {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || undefined,
        company: data.company || undefined,
      });
      const contactId = contactResult.data?.contact?.id;

      if (contactId) {
        const membershipTypeId =
          data.type === 'ordentlich' ? 1 : data.type === 'ausserordentlich' ? 2 : 3;
        const payload: CreateMembershipRequest = {
          contact_id: contactId,
          membership_type_id: membershipTypeId,
        };
        await api.memberships.create(payload);
      }

      if (data.newsletterOptIn) {
        await api.newsletter.subscribe({
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          consent: true,
          company: data.company || undefined,
        });
      }

      const successParams = new URLSearchParams({
        type: data.type,
        category: data.category,
        payment: data.paymentMethod,
      });

      // 3) Bei Online-Zahlung: in den bestehenden Spenden-/Zahlungsflow weiterleiten
      if (data.paymentMethod === 'stripe_card') {
        const membershipFee = getFeeValue(data.type, data.category);
        if (membershipFee !== null) {
          const paymentParams = new URLSearchParams({
            amount: String(membershipFee),
            interval: 'yearly',
            purpose: `Mitgliedsbeitrag – ${MEMBERSHIP_LABELS[data.type]}`,
            context: 'membership',
          });
          nav(`/spenden?${paymentParams.toString()}`);
          return;
        }

        nav(`/mitglied-werden/danke?${successParams.toString()}`);
        return;
      }

      // 4) Erfolgreich
      nav(`/mitglied-werden/danke?${successParams.toString()}`);
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
      <JsonLdBreadcrumb
        items={[
          { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
          {
            name: 'Mitglied werden',
            url: 'https://www.menschlichkeit-oesterreich.at/mitglied-werden',
          },
        ]}
      />
      <JsonLdFaq items={FAQ_ITEMS} />
      <Breadcrumb items={[{ label: 'Mitglied werden' }]} />
      <h1 className="text-2xl font-bold">Mitglied werden</h1>
      <p className="text-secondary-600 text-sm">
        Digitaler Beitrittsantrag gemäß Vereinsstatuten, Beitragsordnung und DSGVO.
      </p>
      <section
        className="rounded-2xl border border-primary-200 bg-primary-50 p-4 sm:p-5"
        aria-label="Vertrauen und Orientierung"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-primary-800">
          <span className="rounded-full bg-white px-3 py-1">ZVR 1182213083</span>
          <span className="rounded-full bg-white px-3 py-1">DSGVO-konformer Ablauf</span>
          <span className="rounded-full bg-white px-3 py-1">Klare Beitragsordnung</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-primary-900">
          In 4 Schritten zum Beitrittsantrag. Sie behalten jederzeit den Überblick über
          Mitgliedsart, Beitrag und Zahlungsweg.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link to="/mitmachen" className="font-semibold text-primary-800 hover:underline">
            Erst Mitmach-Möglichkeiten ansehen
          </Link>
          <Link to="/transparenz" className="font-semibold text-primary-800 hover:underline">
            Transparenzbericht öffnen
          </Link>
        </div>
      </section>
      <ProgressBar current={step} />
      {error && <Alert variant="error">{error}</Alert>}
      <Card className="p-4">
        {step === 0 && <Step1 data={data} set={set} onNext={next} />}
        {step === 1 && <Step2 data={data} set={set} onBack={back} onNext={next} />}
        {step === 2 && <Step3 data={data} set={set} onBack={back} onNext={next} />}
        {step === 3 && (
          <Step4 data={data} set={set} onBack={back} onSubmit={onSubmit} submitting={submitting} />
        )}
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Vor dem Absenden sinnvoll</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-secondary-700">
            <li>Statuten und Beitragsordnung prüfen</li>
            <li>Datenschutz und Betroffenenrechte ansehen</li>
            <li>Bei Fragen vorab Kontakt aufnehmen</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link to="/statuten" className="font-medium text-primary-700 hover:underline">
              Statuten
            </Link>
            <Link to="/beitragsordnung" className="font-medium text-primary-700 hover:underline">
              Beitragsordnung
            </Link>
            <Link to="/datenschutz" className="font-medium text-primary-700 hover:underline">
              Datenschutz
            </Link>
            <a
              href={LEGAL_DOCS.statutes.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-700 hover:underline"
            >
              Statuten als PDF
            </a>
            <a
              href={LEGAL_DOCS.contributionRules.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-700 hover:underline"
            >
              Beitragsordnung als PDF
            </a>
          </div>
        </article>
        <article className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Warum Mitglied werden?</h2>
          <p className="mt-4 text-sm leading-relaxed text-secondary-700">
            Mit Ihrer Mitgliedschaft stärken Sie eine Organisation, die demokratische Teilhabe,
            Menschenrechte und soziale Gerechtigkeit in Österreich praktisch unterstützt.
            Gleichzeitig erhalten Sie einen klaren, transparenten Antragsweg ohne unnötige Hürden.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link to="/transparenz" className="font-medium text-primary-700 hover:underline">
              Transparenz
            </Link>
            <Link to="/ueber-uns" className="font-medium text-primary-700 hover:underline">
              Über uns
            </Link>
            <Link to="/kontakt" className="font-medium text-primary-700 hover:underline">
              Kontakt
            </Link>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-secondary-900">
          Häufige Fragen zur Mitgliedschaft
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
