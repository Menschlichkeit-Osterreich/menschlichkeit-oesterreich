import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_V2_URL } from '@/constants/api';

const RESET_LINK_VALIDITY_MINUTES = 60;

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_V2_URL}/auth/password-reset-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Anfrage fehlgeschlagen');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div role="status" aria-live="polite">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-success-600">
          Gesendet
        </p>
        <h1 className="mt-2 font-heading text-[32px] font-bold leading-tight text-ink-deep">
          Prüfen Sie Ihr Postfach
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-body">
          Falls ein Konto mit der Adresse{' '}
          <span className="tabular-id break-all font-medium text-ink-deep">{email}</span> existiert,
          haben wir eine E-Mail mit einem Link zur Passwortwiederherstellung gesendet.
        </p>

        <ul className="mt-7 border-t border-paper-rule text-[15px] leading-relaxed text-ink-body">
          <li className="border-b border-paper-rule-soft py-3.5">
            Der Link ist {RESET_LINK_VALIDITY_MINUTES} Minuten gültig.
          </li>
          <li className="border-b border-paper-rule-soft py-3.5">
            Keine E-Mail erhalten? Sehen Sie bitte auch im Spam-Ordner nach.
          </li>
          <li className="py-3.5">
            Adresse falsch getippt?{' '}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="font-semibold text-primary-600 underline underline-offset-4 transition-colors hover:text-primary-700"
            >
              Erneut eingeben
            </button>
          </li>
        </ul>

        <p className="mt-7 text-[15px]">
          <Link
            to="/login"
            className="font-semibold text-primary-600 underline underline-offset-4 transition-colors hover:text-primary-700"
          >
            Zurück zur Anmeldung
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-[32px] font-bold leading-tight text-ink-deep">
        Passwort zurücksetzen
      </h1>
      <p className="mt-2 text-base leading-relaxed text-ink-body">
        Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link, mit dem Sie ein neues
        Passwort vergeben können.
      </p>

      {error && (
        <div
          className="mt-5 border-l-[3px] border-error-600 bg-error-50 px-4 py-3 text-[15px] text-error-700"
          role="alert"
          aria-live="assertive"
        >
          <span aria-hidden="true" className="mr-2 font-bold">
            !
          </span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" aria-busy={loading}>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-[15px] font-medium text-ink-body">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block min-h-[52px] w-full rounded-sm border border-paper-rule bg-white px-4 py-3.5 text-base text-ink-deep placeholder:text-ink-subtle"
            placeholder="name@example.at"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          aria-busy={loading}
          className={[
            'flex min-h-[54px] w-full items-center justify-center rounded-sm px-4 text-[17px] font-semibold transition-colors duration-150',
            loading
              ? 'bg-primary-800 text-primary-200'
              : !email
                ? 'cursor-not-allowed bg-secondary-100 text-secondary-400'
                : 'bg-primary-600 text-white hover:bg-primary-700',
          ].join(' ')}
        >
          {loading ? 'Wird gesendet …' : 'Link senden'}
        </button>
      </form>

      <p className="mt-7 border-t border-paper-rule pt-6 text-center text-[15px]">
        <Link
          to="/login"
          className="font-semibold text-primary-600 underline underline-offset-4 transition-colors hover:text-primary-700"
        >
          Zurück zur Anmeldung
        </Link>
      </p>
    </div>
  );
}
