import React, { useState } from 'react';
import { civicrm } from '../../services/civicrm';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

interface NewsletterSignupProps {
  variant?: 'inline' | 'card';
  className?: string;
}

export function NewsletterSignup({ variant = 'inline', className = '' }: NewsletterSignupProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('Bitte stimmen Sie der Datenschutzerklärung zu.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await civicrm.newsletter.subscribe(email, firstName, lastName);
      setSuccess(true);
    } catch (err: unknown) {
      setError(`Anmeldung fehlgeschlagen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <p className="text-green-700 font-medium">✅ Danke! Sie erhalten in Kürze eine Bestätigungs-E-Mail.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      {error && <Alert variant="error">{error}</Alert>}
      {variant === 'card' && (
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Vorname"
            required
          />
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Nachname"
            required
          />
        </div>
      )}
      <div className={variant === 'inline' ? 'flex gap-2' : ''}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ihre E-Mail-Adresse"
          required
          className={variant === 'inline' ? 'flex-1' : 'w-full'}
        />
        {variant === 'inline' && (
          <Button type="submit" disabled={loading}>
            {loading ? '…' : 'Anmelden'}
          </Button>
        )}
      </div>
      <label className="flex items-start gap-2 text-xs text-secondary-600 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
          className="mt-0.5"
        />
        <span>
          Ich stimme der Verarbeitung meiner Daten gemäß der{' '}
          <a href="/datenschutz" className="text-primary-600 hover:underline" target="_blank">
            Datenschutzerklärung
          </a>{' '}
          zu und möchte den Newsletter erhalten. Abmeldung jederzeit möglich.
        </span>
      </label>
      {variant === 'card' && (
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Wird angemeldet…' : 'Newsletter abonnieren'}
        </Button>
      )}
    </form>
  );
}
