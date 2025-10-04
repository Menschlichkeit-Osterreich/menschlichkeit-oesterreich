import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
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
      setError(err?.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  const redirected = location?.state?.reason === 'unauthorized';

  return (
    <div className="mx-auto max-w-md p-4">
      <Card className="p-4">
        <h1 className="mb-4 text-xl font-semibold">Login</h1>
        {redirected && (
          <Alert variant="info" title="Sitzung erforderlich">
            Bitte melde dich an, um fortzufahren.
          </Alert>
        )}
        {error && <Alert variant="error" title="Fehler">{error}</Alert>}
        <form className="mt-3 space-y-3" onSubmit={onSubmit}>
          <Input
            type="email"
            label="E‑Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="name@example.org"
          />
          <Input
            type="password"
            label="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Bitte warten …' : 'Anmelden'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
