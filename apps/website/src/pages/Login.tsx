import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/ui/Alert';
import { CONTACT_EMAIL } from '../config/siteConfig';
import { buildPublicUrl } from '../utils/runtimeHost';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation() as any;
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      // Defense-in-depth: nur relative, sichere Pfade akzeptieren (kein Open Redirect)
      const raw: string = location.state?.from?.pathname ?? '';
      const redirectTo = /^\/[^/]/.test(raw) || raw === '/' ? raw : '/member';
      nav(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Zugangsdaten.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  }

  const redirected = location?.state?.reason === 'unauthorized';
  const disabled = loading || !email || !password;

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-heading text-[32px] font-bold leading-tight text-ink-deep">
          Willkommen zurück
        </h2>
        <p className="mt-2 text-base text-ink-body">
          Melden Sie sich mit Ihrem Mitgliedskonto an.
        </p>
      </div>

      {redirected && (
        <Alert variant="info" title="Sitzung erforderlich" className="mb-5" role="status">
          Bitte melden Sie sich an, um auf diesen Bereich zuzugreifen.
        </Alert>
      )}

      {error && (
        <Alert variant="error" title="Anmeldefehler" className="mb-5" role="alert">
          {error}
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-[15px] font-medium text-ink-body">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            spellCheck={false}
            placeholder="name@example.at"
            className="block min-h-[52px] w-full rounded-sm border border-paper-rule bg-white px-4 py-3.5 text-base text-ink-deep transition-colors duration-150 placeholder:text-ink-subtle"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="block text-[15px] font-medium text-ink-body">
              Passwort
            </label>
            <button
              type="button"
              className="text-[15px] font-semibold text-primary-600 transition-colors hover:text-primary-700"
              onClick={() => nav('/passwort-vergessen')}
            >
              Passwort vergessen?
            </button>
          </div>
          <div
            className={[
              'flex items-stretch overflow-hidden rounded-sm border bg-white',
              error ? 'border-2 border-error-600' : 'border-paper-rule',
            ].join(' ')}
          >
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="min-h-[52px] flex-1 border-0 bg-transparent px-4 py-3.5 text-base text-ink-deep placeholder:text-ink-subtle"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="w-[52px] shrink-0 border-l border-paper-rule text-[14px] font-semibold text-ink-body transition-colors hover:bg-paper"
              aria-label={showPassword ? 'Passwort verstecken' : 'Passwort anzeigen'}
            >
              {showPassword ? 'verbergen' : 'zeigen'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className={[
            'flex min-h-[54px] w-full items-center justify-center gap-2 rounded-sm px-4 text-[17px] font-semibold transition-colors duration-150',
            loading
              ? 'bg-primary-800 text-primary-200'
              : disabled
                ? 'cursor-not-allowed bg-secondary-100 text-secondary-400'
                : 'bg-primary-600 text-white hover:bg-primary-700',
          ].join(' ')}
        >
          {loading ? 'Anmeldung läuft …' : 'Anmelden'}
        </button>
      </form>

      <div className="mt-7 border-t border-paper-rule pt-6 text-center">
        <p className="text-base text-ink-body">
          Noch kein Mitglied?{' '}
          <a
            href={buildPublicUrl('/mitglied-werden')}
            className="font-semibold text-primary-600 underline underline-offset-4 transition-colors hover:text-primary-700"
          >
            Jetzt Mitglied werden
          </a>
        </p>
        <p className="mt-2.5 text-[15px] text-ink-muted">
          Fragen?{' '}
          <a
            className="font-semibold text-primary-600 underline underline-offset-4 hover:text-primary-700"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}
