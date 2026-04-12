import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/constants/api';
import { STORAGE_KEYS } from '@/constants/storage';
import { buildPortalUrl } from '../utils/runtimeHost';
export default function Register() {
  const _navigate = useNavigate();
  const [form, setForm] = useState({
    vorname: '',
    nachname: '',
    email: '',
    password: '',
    passwordConfirm: '',
    mitgliedschaft_typ: 'ordentlich',
    agb: false,
    datenschutz: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value;
    setForm(prev => ({ ...prev, [target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.passwordConfirm) {
      setError('Passwörter stimmen nicht überein');
      return;
    }
    if (form.password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }
    if (!form.agb || !form.datenschutz) {
      setError('Bitte bestätigen Sie Statuten, Beitragsordnung und Datenschutzerklärung.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          vorname: form.vorname,
          nachname: form.nachname,
          mitgliedschaft_typ: form.mitgliedschaft_typ,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Registrierung fehlgeschlagen');
      sessionStorage.removeItem(STORAGE_KEYS.authToken);
      window.location.href = buildPortalUrl('/login');
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-800 to-accent-600 text-white flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🤝</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Willkommen bei Menschlichkeit Österreich</h2>
          <p className="text-lg opacity-90">
            Werden Sie Teil unserer Gemeinschaft für Demokratie, Menschenrechte und sozialen Zusammenhalt.
          </p>
          <div className="mt-8 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">✓</span>
              <span>Zugang zum Mitgliederbereich</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">✓</span>
              <span>Forum und Community</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">✓</span>
              <span>Veranstaltungen und Bildungsangebote</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-secondary-50 p-6">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-2xl font-bold text-secondary-950">Mitglied werden</h1>
          <p className="mb-6 text-secondary-600">
            Erstellen Sie Ihr Konto bei Menschlichkeit Österreich
          </p>

          {error && (
            <div
              className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-error-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="vorname" className="mb-1 block text-sm font-medium text-secondary-700">
                  Vorname
                </label>
                <input
                  id="vorname"
                  name="vorname"
                  type="text"
                  required
                  value={form.vorname}
                  onChange={handleChange}
                  autoComplete="given-name"
                  className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-secondary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
              <div>
                <label htmlFor="nachname" className="mb-1 block text-sm font-medium text-secondary-700">
                  Nachname
                </label>
                <input
                  id="nachname"
                  name="nachname"
                  type="text"
                  required
                  value={form.nachname}
                  onChange={handleChange}
                  autoComplete="family-name"
                  className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-secondary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-secondary-700">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                spellCheck={false}
                className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-secondary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <div>
              <label htmlFor="mitgliedschaft_typ" className="mb-1 block text-sm font-medium text-secondary-700">
                Mitgliedschaftsart
              </label>
              <select
                id="mitgliedschaft_typ"
                name="mitgliedschaft_typ"
                value={form.mitgliedschaft_typ}
                onChange={handleChange}
                className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-secondary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option value="ordentlich">Ordentliches Mitglied (€ 36/Jahr)</option>
                <option value="ermaessigt">Ermäßigtes Mitglied (€ 18/Jahr)</option>
                <option value="ausserordentlich">Außerordentliches Mitglied</option>
                <option value="haertefall">Härtefall (beitragsfrei)</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-secondary-700">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-secondary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="Mindestens 8 Zeichen…"
              />
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="mb-1 block text-sm font-medium text-secondary-700">
                Passwort bestätigen
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                required
                value={form.passwordConfirm}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-secondary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  name="agb"
                  checked={form.agb}
                  onChange={handleChange}
                  className="mt-1 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-600">
                  Ich akzeptiere die{' '}
                  <Link to="/statuten" className="font-medium text-primary-700 hover:underline">
                    Statuten
                  </Link>{' '}
                  und die{' '}
                  <Link to="/beitragsordnung" className="font-medium text-primary-700 hover:underline">
                    Beitragsordnung
                  </Link>
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  name="datenschutz"
                  checked={form.datenschutz}
                  onChange={handleChange}
                  className="mt-1 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-600">
                  Ich habe die{' '}
                  <Link to="/datenschutz" className="font-medium text-primary-700 hover:underline">
                    Datenschutzerklärung
                  </Link>{' '}
                  gelesen und akzeptiert
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full rounded-lg bg-gradient-to-r from-primary-700 to-accent-600 py-3 font-semibold text-white transition-all hover:from-primary-800 hover:to-accent-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Wird registriert…' : 'Jetzt Mitglied werden'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-secondary-600">
            Bereits Mitglied?{' '}
            <Link to="/login" className="font-medium text-primary-700 hover:underline">
              Jetzt anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
