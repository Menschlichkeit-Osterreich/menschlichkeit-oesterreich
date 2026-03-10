import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/ui/Alert';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { PageHeader } from '../components/ui/PageHeader';
import { http } from '../services/http';

interface MemberProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  membership_type: string;
  membership_status: string;
  member_since: string;
  next_payment_due?: string;
}

export default function MemberAreaPage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await http.get('/api/members/me/profile', token);
        setProfile(data as MemberProfile);
      } catch {
        setError('Profildaten konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const statusColor = (status: string) => {
    if (status === 'active') return 'text-green-700 bg-green-100';
    if (status === 'pending') return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const statusLabel = (status: string) => {
    if (status === 'active') return 'Aktiv';
    if (status === 'pending') return 'Ausstehend';
    return 'Abgelaufen';
  };

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-6">
      <PageHeader
        title="Mitgliederbereich"
        description="Willkommen in Ihrem persönlichen Mitgliederbereich."
        breadcrumb={<Breadcrumb items={[{ label: 'Mitgliederbereich' }]} />}
      />

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <Card className="p-8 text-center text-secondary-500">Profil wird geladen…</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-1">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-primary-700">
                {profile ? `${profile.first_name[0]}${profile.last_name[0]}` : '?'}
              </div>
              <h2 className="text-lg font-semibold">
                {profile ? `${profile.first_name} ${profile.last_name}` : 'Unbekannt'}
              </h2>
              <p className="text-sm text-secondary-500">{profile?.email}</p>
            </div>
            {profile && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-500">Mitgliedschaft:</span>
                  <span className="font-medium">{profile.membership_type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(profile.membership_status)}`}>
                    {statusLabel(profile.membership_status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-500">Mitglied seit:</span>
                  <span>{new Date(profile.member_since).toLocaleDateString('de-AT')}</span>
                </div>
                {profile.next_payment_due && (
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Nächste Zahlung:</span>
                    <span>{new Date(profile.next_payment_due).toLocaleDateString('de-AT')}</span>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 space-y-2">
              <Button variant="secondary" className="w-full text-sm" onClick={() => window.location.href = '/account/privacy'}>
                Datenschutz-Einstellungen
              </Button>
              <Button variant="secondary" className="w-full text-sm" onClick={() => window.location.href = '/spenden'}>
                Spende tätigen
              </Button>
            </div>
          </Card>

          <div className="md:col-span-2 space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-base mb-3">Schnellzugriff</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Mitgliedsdaten ändern', href: '/account/profile', icon: '✏️' },
                  { label: 'SEPA-Mandat', href: '/account/sepa', icon: '🏦' },
                  { label: 'Spendenquittung', href: '/account/receipts', icon: '🧾' },
                  { label: 'Newsletter', href: '/account/newsletter', icon: '📧' },
                  { label: 'Veranstaltungen', href: '/veranstaltungen', icon: '📅' },
                  { label: 'Forum', href: 'https://forum.menschlichkeit-oesterreich.at', icon: '💬' },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center p-3 rounded-lg border border-secondary-200 hover:border-primary-400 hover:bg-primary-50 transition-colors text-center text-sm"
                  >
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <span className="text-secondary-700">{item.label}</span>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
