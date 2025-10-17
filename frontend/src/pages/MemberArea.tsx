import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/ui/Alert';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api, CreateContactRequest, CreateMembershipRequest } from '../services/api';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { PageHeader } from '../components/ui/PageHeader';

export default function MemberAreaPage() {
  const { token } = useAuth();
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function quickContact() {
    if (!token) return;
    setMessage(null);
    setError(null);
    try {
      const payload: CreateContactRequest = {
        email: `test+${Date.now()}@example.org`,
        first_name: 'Test',
        last_name: 'User',
      };
      await api.contacts.create(payload, token);
      setMessage('Kontakt erstellt (Demo)');
    } catch (e: any) {
      setError('Kontakt erstellen fehlgeschlagen');
      console.error(e);
    }
  }

  async function quickMembership() {
    if (!token) return;
    setMessage(null);
    setError(null);
    try {
      const payload: CreateMembershipRequest = {
        contact_id: 1,
        membership_type_id: 1,
      };
      await api.memberships.create(payload, token);
      setMessage('Mitgliedschaft erstellt (Demo)');
    } catch (e: any) {
      setError('Mitgliedschaft erstellen fehlgeschlagen');
      console.error(e);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-3">
      <PageHeader
        title="Mitgliederbereich"
        description="Nur mit Login erreichbar."
        breadcrumb={<Breadcrumb items={[{ label: 'Mitgliederbereich' }]} />}
      />
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}
      <Card className="p-4">
        <h2 className="mb-2 text-xl font-medium">Schnellaktionen (Demo)</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={quickContact}>Kontakt erstellen (Demo)</Button>
          <Button variant="secondary" onClick={quickMembership}>Mitgliedschaft erstellen (Demo)</Button>
        </div>
      </Card>
    </div>
  );
}
