import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/auth/password-reset`, {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✉️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">E-Mail gesendet</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Falls ein Konto mit der Adresse <strong>{email}</strong> existiert, haben wir eine E-Mail mit einem Link zur Passwortwiederherstellung gesendet.
          </p>
          <Link to="/login" className="text-red-600 hover:underline font-medium">Zurück zur Anmeldung</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Passwort zurücksetzen</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zur Passwortwiederherstellung.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-Mail-Adresse</label>
            <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="ihre@email.at" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold py-3 rounded-lg hover:from-red-700 hover:to-orange-600 transition-all disabled:opacity-50">
            {loading ? 'Wird gesendet…' : 'Link senden'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link to="/login" className="text-red-600 hover:underline font-medium">Zurück zur Anmeldung</Link>
        </p>
      </div>
    </div>
  );
}
