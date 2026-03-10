/**
 * Passwort zurücksetzen – Issue #119: [P0] Auth + Dashboard
 *
 * Zwei Modi:
 *  1. Ohne ?token=… → E-Mail-Eingabe, sendet Reset-Link
 *  2. Mit ?token=…  → Neues Passwort setzen
 */
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export default function PasswordResetPage() {
  const [params]    = useSearchParams();
  const nav         = useNavigate();
  const token       = params.get('token');

  const [email,      setEmail]      = React.useState('');
  const [password,   setPassword]   = React.useState('');
  const [password2,  setPassword2]  = React.useState('');
  const [loading,    setLoading]    = React.useState(false);
  const [success,    setSuccess]    = React.useState(false);
  const [error,      setError]      = React.useState<string | null>(null);

  /* ── Modus 1: Reset anfordern ─────────────────────────────────────── */
  async function onRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Anfrage fehlgeschlagen.');
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? 'Unbekannter Fehler.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Modus 2: Neues Passwort setzen ──────────────────────────────── */
  async function onConfirmReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== password2) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }
    if (password.length < 10) {
      setError('Das Passwort muss mindestens 10 Zeichen lang sein.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/password-reset/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail ?? 'Fehler beim Setzen des Passworts.');
      setSuccess(true);
      setTimeout(() => nav('/login'), 3000);
    } catch (err: any) {
      setError(err?.message ?? 'Unbekannter Fehler.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Modus 1: Formular ────────────────────────────────────────────── */
  if (!token) {
    return (
      <div className="mx-auto max-w-md p-4">
        <Card className="p-6 space-y-4">
          <h1 className="text-xl font-semibold">Passwort zurücksetzen</h1>
          {success ? (
            <Alert variant="success" title="E-Mail gesendet">
              Falls die Adresse bei uns registriert ist, erhalten Sie in Kürze einen Reset-Link.
            </Alert>
          ) : (
            <>
              <p className="text-sm text-secondary-600">
                Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen des Passworts.
              </p>
              {error && <Alert variant="error">{error}</Alert>}
              <form onSubmit={onRequestReset} className="space-y-3">
                <Input
                  type="email"
                  label="E-Mail-Adresse"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="name@beispiel.at"
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Wird gesendet …' : 'Reset-Link anfordern'}
                </Button>
              </form>
              <div className="text-center text-sm">
                <a href="/login" className="text-primary-600 hover:underline">Zurück zum Login</a>
              </div>
            </>
          )}
        </Card>
      </div>
    );
  }

  /* ── Modus 2: Neues Passwort ────────────────────────────────────── */
  return (
    <div className="mx-auto max-w-md p-4">
      <Card className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Neues Passwort setzen</h1>
        {success ? (
          <Alert variant="success" title="Passwort geändert">
            Ihr Passwort wurde erfolgreich geändert. Sie werden zum Login weitergeleitet …
          </Alert>
        ) : (
          <>
            {error && <Alert variant="error">{error}</Alert>}
            <form onSubmit={onConfirmReset} className="space-y-3">
              <Input
                type="password"
                label="Neues Passwort (mind. 10 Zeichen)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <Input
                type="password"
                label="Passwort bestätigen"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                autoComplete="new-password"
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Wird gespeichert …' : 'Passwort speichern'}
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
