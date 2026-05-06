import React, { useState } from 'react';
import { http } from '../../services/http';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

interface JoinFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  postal_code: string;
  city: string;
  membership_type: 'standard' | 'ermaessigt' | 'haertefall';
  consent_newsletter: boolean;
  consent_dsgvo: boolean;
}

const MEMBERSHIP_TYPES: { value: JoinFormData['membership_type']; label: string; price: string; type_id: number }[] = [
  { value: 'standard', label: 'Ordentliches Mitglied (Standard)', price: '€ 36,– / Jahr (€ 3,– / Monat)', type_id: 1 },
  { value: 'ermaessigt', label: 'Ordentliches Mitglied (Ermäßigt)', price: '€ 18,– / Jahr (€ 1,50 / Monat)', type_id: 2 },
  { value: 'haertefall', label: 'Ordentliches Mitglied (Härtefall)', price: '€ 0,– / Jahr', type_id: 3 },
];

export function CiviJoinForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState<JoinFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    postal_code: '',
    city: '',
    membership_type: 'standard',
    consent_newsletter: false,
    consent_dsgvo: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent_dsgvo) {
      setError('Bitte stimmen Sie der Datenschutzerklärung zu.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const contactResult = await http.post<{ success: boolean; data?: { contact?: { id?: number } } }>('/api/contacts/create', {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        city: form.city,
        postal_code: form.postal_code,
      });
      const contactId = contactResult.data?.contact?.id;
      if (!contactId) throw new Error('Kontakt konnte nicht erstellt werden.');

      const selectedType = MEMBERSHIP_TYPES.find((t) => t.value === form.membership_type);
      await http.post('/api/memberships/create', {
        contact_id: contactId,
        membership_type_id: selectedType?.type_id ?? 1,
        start_date: new Date().toISOString().split('T')[0],
        source: 'Website-Beitrittsformular',
      });

      if (form.consent_newsletter) {
        await http.post('/api/newsletter/subscribe', {
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          consent: true,
        });
      }

      setSuccess(true);
      onSuccess?.();
    } catch (e: unknown) {
      setError(`Fehler beim Beitritt: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-semibold text-green-700">Willkommen bei Menschlichkeit Österreich!</h2>
        <p className="text-secondary-600">
          Ihr Beitrittsantrag wurde erfolgreich übermittelt. Sie erhalten in Kürze eine Bestätigungs-E-Mail.
        </p>
        <a href="/" className="inline-block px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">
          Zur Startseite
        </a>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Mitglied werden</h2>
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Persönliche Daten */}
        <fieldset>
          <legend className="font-medium text-base mb-3">Persönliche Daten</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="first_name">Vorname *</label>
              <Input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} required placeholder="Max" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="last_name">Nachname *</label>
              <Input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} required placeholder="Mustermann" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">E-Mail-Adresse *</label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="max@beispiel.at" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="phone">Telefon</label>
              <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+43 1 234 5678" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="postal_code">PLZ</label>
              <Input id="postal_code" name="postal_code" value={form.postal_code} onChange={handleChange} placeholder="1010" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="city">Ort</label>
              <Input id="city" name="city" value={form.city} onChange={handleChange} placeholder="Wien" />
            </div>
          </div>
        </fieldset>

        {/* Mitgliedschaftstyp */}
        <fieldset>
          <legend className="font-medium text-base mb-3">Mitgliedschaftstyp</legend>
          <div className="space-y-2">
            {MEMBERSHIP_TYPES.map((type) => (
              <label key={type.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.membership_type === type.value ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:border-primary-300'}`}>
                <input
                  type="radio"
                  name="membership_type"
                  value={type.value}
                  checked={form.membership_type === type.value}
                  onChange={handleChange}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-medium text-sm">{type.label}</span>
                  <span className="ml-2 text-primary-600 font-semibold text-sm">{type.price}</span>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Einwilligungen */}
        <fieldset>
          <legend className="font-medium text-base mb-3">Einwilligungen</legend>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="consent_newsletter"
                checked={form.consent_newsletter}
                onChange={handleChange}
                className="mt-0.5"
              />
              <span className="text-sm text-secondary-700">
                Ich möchte den Newsletter von Menschlichkeit Österreich erhalten und über Neuigkeiten und Veranstaltungen informiert werden.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="consent_dsgvo"
                checked={form.consent_dsgvo}
                onChange={handleChange}
                required
                className="mt-0.5"
              />
              <span className="text-sm text-secondary-700">
                Ich habe die{' '}
                <a href="/datenschutz" className="text-primary-600 hover:underline" target="_blank">Datenschutzerklärung</a>
                {' '}gelesen und stimme der Verarbeitung meiner Daten zu. *
              </span>
            </label>
          </div>
        </fieldset>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Wird übermittelt…' : 'Jetzt Mitglied werden'}
        </Button>
        <p className="text-xs text-secondary-500 text-center">* Pflichtfeld</p>
      </form>
    </Card>
  );
}
