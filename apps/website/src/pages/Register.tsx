import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      setError('Bitte stimmen Sie den Nutzungsbedingungen und der Datenschutzerklärung zu');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/auth/register`, {
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
      if (data?.data?.token) {
        sessionStorage.setItem('moe_auth_token', data.data.token);
        window.location.href = '/member/onboarding';
      }
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 to-orange-500 text-white flex-col justify-center items-center p-12">
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

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mitglied werden</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Erstellen Sie Ihr Konto bei Menschlichkeit Österreich
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="vorname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vorname</label>
                <input id="vorname" name="vorname" type="text" required value={form.vorname} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="nachname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nachname</label>
                <input id="nachname" name="nachname" type="text" required value={form.nachname} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-Mail-Adresse</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>

            <div>
              <label htmlFor="mitgliedschaft_typ" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mitgliedschaftsart</label>
              <select id="mitgliedschaft_typ" name="mitgliedschaft_typ" value={form.mitgliedschaft_typ} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent">
                <option value="ordentlich">Ordentliches Mitglied (€ 36/Jahr)</option>
                <option value="ermaessigt">Ermäßigtes Mitglied (€ 18/Jahr)</option>
                <option value="ausserordentlich">Außerordentliches Mitglied</option>
                <option value="haertefall">Härtefall (beitragsfrei)</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passwort</label>
              <input id="password" name="password" type="password" required minLength={8} value={form.password} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Mindestens 8 Zeichen" />
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passwort bestätigen</label>
              <input id="passwordConfirm" name="passwordConfirm" type="password" required value={form.passwordConfirm} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-2">
                <input type="checkbox" name="agb" checked={form.agb} onChange={handleChange}
                  className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Ich akzeptiere die <Link to="/statuten" className="text-red-600 hover:underline">Statuten</Link> und die <Link to="/beitragsordnung" className="text-red-600 hover:underline">Beitragsordnung</Link>
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" name="datenschutz" checked={form.datenschutz} onChange={handleChange}
                  className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Ich habe die <Link to="/datenschutz" className="text-red-600 hover:underline">Datenschutzerklärung</Link> gelesen und akzeptiert
                </span>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold py-3 rounded-lg hover:from-red-700 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Wird registriert…' : 'Jetzt Mitglied werden'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Bereits Mitglied? <Link to="/login" className="text-red-600 hover:underline font-medium">Jetzt anmelden</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
