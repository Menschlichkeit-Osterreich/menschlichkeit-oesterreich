import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { api, CreateMembershipRequest } from '../services/api';
import { useAuth } from '../auth/AuthContext';

type MembershipType = 'ordentlich' | 'ausserordentlich' | 'ehrenmitglied';
type FeeCategory = 'standard' | 'ermaessigt' | 'haertefall';

export default function JoinPage() {
  const { setAuth } = useAuth();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [type, setType] = React.useState<MembershipType>('ordentlich');
  const [category, setCategory] = React.useState<FeeCategory>('standard');
  const [agreeStatuten, setAgreeStatuten] = React.useState(false);
  const [agreeDSGVO, setAgreeDSGVO] = React.useState(false);
  const [agreeBeitragsordnung, setAgreeBeitragsordnung] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const valid =
    firstName.trim() &&
    lastName.trim() &&
    /.+@.+\..+/.test(email) &&
    agreeStatuten &&
    agreeDSGVO &&
    agreeBeitragsordnung;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      // 1) Register (creates/updates contact and returns tokens)
      const reg = await api.auth.register({ email, first_name: firstName, last_name: lastName });
      const tokens = (reg.data as any)?.tokens;
      if (!tokens?.token) throw new Error('Registrierung fehlgeschlagen');
      // set auth context so subsequent calls include token
      setAuth({ token: tokens.token, expiresIn: tokens.expires_in, refreshToken: tokens.refresh_token });

      // 2) Create membership (basic demo: type mapping -> numeric id)
      const membershipTypeId = type === 'ordentlich' ? 1 : type === 'ausserordentlich' ? 2 : 3;
      const contactId = (reg.data as any)?.contact?.id ?? undefined;
      const payload: CreateMembershipRequest = {
        contact_id: contactId ?? 1,
        membership_type_id: membershipTypeId,
      };
      await api.memberships.create(payload, tokens.token);

      setMessage('Vielen Dank! Ihr Mitgliedsantrag wurde übermittelt.');
    } catch (err) {
      console.error(err);
      setError('Übermittlung fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <Breadcrumb items={[{ label: 'Mitglied werden' }]} />
      <h1 className="text-2xl font-semibold">Mitglied werden</h1>
      <p className="text-secondary-700">Digitaler Beitrittsantrag gemäß Statuten und DSGVO.</p>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <Card className="p-4">
        <form onSubmit={onSubmit} noValidate aria-describedby="legal-hinweise">
          <fieldset className="grid gap-3" disabled={submitting}>
            <legend className="sr-only">Persönliche Angaben</legend>
            <label className="block">
              <span className="block text-sm font-medium">Vorname *</span>
              <input
                className="mt-1 w-full rounded border p-2"
                name="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium">Nachname *</span>
              <input
                className="mt-1 w-full rounded border p-2"
                name="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium">E‑Mail *</span>
              <input
                className="mt-1 w-full rounded border p-2"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium">Telefon (optional)</span>
              <input
                className="mt-1 w-full rounded border p-2"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>

            <fieldset className="mt-2">
              <legend className="text-sm font-medium">Mitgliedsart *</legend>
              <div className="mt-1 flex flex-wrap gap-4">
                {(
                  [
                    { key: 'ordentlich', label: 'Ordentlich' },
                    { key: 'ausserordentlich', label: 'Außerordentlich' },
                    { key: 'ehrenmitglied', label: 'Ehrenmitglied' },
                  ] as const
                ).map((opt) => (
                  <label key={opt.key} className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="membershipType"
                      value={opt.key}
                      checked={type === opt.key}
                      onChange={() => setType(opt.key)}
                      required
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block mt-2">
              <span className="text-sm font-medium">Beitragskategorie *</span>
              <select
                className="mt-1 w-full rounded border p-2"
                value={category}
                onChange={(e) => setCategory(e.target.value as FeeCategory)}
                required
              >
                <option value="standard">Standard</option>
                <option value="ermaessigt">Ermäßigt</option>
                <option value="haertefall">Härtefall</option>
              </select>
            </label>

            <div id="legal-hinweise" className="mt-3 space-y-2">
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={agreeStatuten} onChange={(e) => setAgreeStatuten(e.target.checked)} required />
                <span>Ich erkenne die Statuten an.</span>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={agreeDSGVO} onChange={(e) => setAgreeDSGVO(e.target.checked)} required />
                <span>Ich willige in die Verarbeitung meiner Daten gemäß DSGVO ein.</span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreeBeitragsordnung}
                  onChange={(e) => setAgreeBeitragsordnung(e.target.checked)}
                  required
                />
                <span>Ich akzeptiere die Beitragsordnung 2025.</span>
              </label>
              <p className="text-xs text-secondary-600">Austritt (Statuten §7), Ausschluss (§8), Schiedsgericht (§14), Widerrufsrecht DSGVO (Art. 7 Abs. 3).</p>
            </div>

            <div className="mt-4 flex gap-2">
              <Button type="submit" disabled={!valid || submitting}>
                {submitting ? 'Wird übermittelt…' : 'Antrag senden'}
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

