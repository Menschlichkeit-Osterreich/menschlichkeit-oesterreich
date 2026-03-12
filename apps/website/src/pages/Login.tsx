import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../auth/AuthContext';

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
      const redirectTo = location.state?.from?.pathname || '/member';
      nav(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Login fehlgeschlagen. Bitte prüfe deine Zugangsdaten.');
    } finally {
      setLoading(false);
    }
  }

  const redirected = location?.state?.reason === 'unauthorized';

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-1">Willkommen zurück</h2>
        <p className="text-secondary-500 text-sm">Melde dich mit deinem Mitgliedskonto an.</p>
      </div>

      {redirected && (
        <Alert variant="info" title="Sitzung erforderlich" className="mb-5">
          Bitte melde dich an, um auf diesen Bereich zuzugreifen.
        </Alert>
      )}

      {error && (
        <Alert variant="error" title="Anmeldefehler" className="mb-5">
          {error}
        </Alert>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1.5">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="name@example.at"
            className="w-full px-3.5 py-2.5 rounded-xl border border-secondary-200 bg-white text-secondary-900 text-sm placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
              Passwort
            </label>
            <button
              type="button"
              className="text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors"
              onClick={() => alert('Bitte kontaktiere office@menschlichkeit-oesterreich.at')}
            >
              Passwort vergessen?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-secondary-200 bg-white text-secondary-900 text-sm placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
              aria-label={showPassword ? 'Passwort verstecken' : 'Passwort anzeigen'}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full py-3 px-4 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Anmeldung läuft…
            </>
          ) : (
            'Anmelden'
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-secondary-100">
        <p className="text-sm text-secondary-500 text-center">
          Noch kein Mitglied?{' '}
          <Link to="/mitglied-werden" className="font-semibold text-primary-600 hover:text-primary-800 transition-colors">
            Jetzt Mitglied werden
          </Link>
        </p>
      </div>
    </div>
  );
}
