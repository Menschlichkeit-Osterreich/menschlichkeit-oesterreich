import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Mail, Phone, MapPin, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { useAuth } from '../../auth/AuthContext';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  membership_type?: string;
  membership_status?: 'active' | 'pending' | 'expired' | 'cancelled';
  join_date?: string;
  end_date?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  birth_date?: string;
  payment_method?: string;
  last_payment?: string;
  total_contributions?: number;
  notes?: string;
}

interface MemberDetailProps {
  member: Member;
  onClose: () => void;
  onUpdate?: (updatedMember: Member) => void;
}

export function MemberDetail({ member, onClose, onUpdate }: MemberDetailProps) {
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<Member>(member);
  const [memberships, setMemberships] = useState<any[]>([]);

  useEffect(() => {
    loadMembershipDetails();
  }, [member.id]);

  async function loadMembershipDetails() {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/memberships/contact/${member.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMemberships(data.data?.values || []);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Mitgliedschaftsdetails:', err);
    }
  }

  function handleInputChange(field: keyof Member, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!token) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/contacts/${member.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            birth_date: formData.birth_date,
            street_address: formData.address,
            city: formData.city,
            postal_code: formData.postal_code,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Änderungen');
      }

      setSuccess('Änderungen erfolgreich gespeichert');
      setIsEditing(false);
      onUpdate?.(formData);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status?: string) {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'expired': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  function getStatusLabel(status?: string) {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'pending': return 'Ausstehend';
      case 'expired': return 'Abgelaufen';
      case 'cancelled': return 'Gekündigt';
      default: return 'Unbekannt';
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">
              {formData.first_name} {formData.last_name}
            </h2>
            <p className="text-gray-600 mt-1">{formData.email}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  setFormData(member);
                }}>
                  Abbrechen
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Speichern...' : 'Speichern'}
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" className="mb-4">
              {success}
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-4">Persönliche Daten</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vorname
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{formData.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nachname
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{formData.last_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="inline h-4 w-4 mr-1" />
                    E-Mail
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{formData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Telefon
                  </label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{formData.phone || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Geburtsdatum
                  </label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={formData.birth_date || ''}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">
                      {formData.birth_date 
                        ? new Date(formData.birth_date).toLocaleDateString('de-AT')
                        : '—'}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Address */}
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-4">
                <MapPin className="inline h-5 w-5 mr-1" />
                Adresse
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Straße & Hausnummer
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{formData.address || '—'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PLZ
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.postal_code || ''}
                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{formData.postal_code || '—'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ort
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{formData.city || '—'}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Membership Information */}
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-4">Mitgliedschaft</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Badge variant={formData.membership_status === 'active' ? 'success' : 'secondary'}>
                    {getStatusLabel(formData.membership_status)}
                  </Badge>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mitgliedsart
                  </label>
                  <p className="text-gray-900">{formData.membership_type || '—'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beitrittsdatum
                  </label>
                  <p className="text-gray-900">
                    {formData.join_date
                      ? new Date(formData.join_date).toLocaleDateString('de-AT')
                      : '—'}
                  </p>
                </div>

                {formData.end_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enddatum
                    </label>
                    <p className="text-gray-900">
                      {new Date(formData.end_date).toLocaleDateString('de-AT')}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Payment Information */}
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-4">
                <CreditCard className="inline h-5 w-5 mr-1" />
                Zahlungsinformationen
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zahlungsart
                  </label>
                  <p className="text-gray-900">{formData.payment_method || '—'}</p>
                </div>

                {formData.last_payment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Letzte Zahlung
                    </label>
                    <p className="text-gray-900">
                      {new Date(formData.last_payment).toLocaleDateString('de-AT')}
                    </p>
                  </div>
                )}

                {formData.total_contributions !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gesamtbeiträge
                    </label>
                    <p className="text-gray-900 text-lg font-semibold">
                      € {formData.total_contributions.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Memberships History */}
          {memberships.length > 0 && (
            <Card className="p-4 mt-6">
              <h3 className="font-semibold text-lg mb-4">Mitgliedschaftsverlauf</h3>
              <div className="space-y-2">
                {memberships.map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Mitgliedschaft #{m.id}</p>
                      <p className="text-sm text-gray-600">
                        {m.start_date} bis {m.end_date || 'laufend'}
                      </p>
                    </div>
                    <Badge variant={m.status_id === 1 ? 'success' : 'secondary'}>
                      {m.status_id === 1 ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          {formData.notes && (
            <Card className="p-4 mt-6">
              <h3 className="font-semibold text-lg mb-4">
                <AlertCircle className="inline h-5 w-5 mr-1" />
                Notizen
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{formData.notes}</p>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Schließen
          </Button>
          <Button variant="secondary">
            <Mail className="h-4 w-4 mr-2" />
            E-Mail senden
          </Button>
        </div>
      </div>
    </div>
  );
}
