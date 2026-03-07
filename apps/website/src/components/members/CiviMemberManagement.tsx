import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { civicrm, CiviContact, CiviMembership } from '../../services/civicrm';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Input } from '../ui/Input';

interface MemberRow {
  contact: CiviContact;
  membership?: CiviMembership;
}

export function CiviMemberManagement() {
  const { token } = useAuth();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 25;

  const fetchMembers = async (offset = 0) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await civicrm.contacts.list(token, PAGE_SIZE, offset);
      const rows: MemberRow[] = result.values.map((c) => ({ contact: c }));
      setMembers(rows);
      setTotal(result.count);
    } catch (e: unknown) {
      setError(`Fehler beim Laden der Mitglieder: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!token || !searchQuery.trim()) {
      fetchMembers(0);
      return;
    }
    setLoading(true);
    try {
      const result = await civicrm.contacts.search(searchQuery, token);
      setMembers(result.values.map((c) => ({ contact: c })));
      setTotal(result.values.length);
    } catch (e: unknown) {
      setError(`Suche fehlgeschlagen: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(page * PAGE_SIZE);
  }, [token, page]);

  const statusBadge = (status?: string) => {
    if (!status) return null;
    const colorMap: Record<string, string> = {
      Current: 'bg-green-100 text-green-700',
      New: 'bg-blue-100 text-blue-700',
      Grace: 'bg-yellow-100 text-yellow-700',
      Expired: 'bg-red-100 text-red-700',
      Cancelled: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[status] ?? 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Suche nach Name oder E-Mail..."
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>Suchen</Button>
        <Button variant="secondary" onClick={() => { setSearchQuery(''); fetchMembers(0); }}>Zurücksetzen</Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left p-3 font-semibold">Name</th>
                <th className="text-left p-3 font-semibold">E-Mail</th>
                <th className="text-left p-3 font-semibold">Ort</th>
                <th className="text-left p-3 font-semibold">Mitgliedschaft</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-secondary-500">Lade Mitglieder…</td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-secondary-500">Keine Mitglieder gefunden.</td>
                </tr>
              ) : (
                members.map(({ contact, membership }) => (
                  <tr key={contact.id} className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors">
                    <td className="p-3 font-medium">{contact.display_name}</td>
                    <td className="p-3 text-secondary-600">{contact.email_primary ?? '–'}</td>
                    <td className="p-3 text-secondary-600">
                      {contact.postal_code ? `${contact.postal_code} ` : ''}{contact.city ?? '–'}
                    </td>
                    <td className="p-3 text-secondary-600">{membership?.membership_type ?? '–'}</td>
                    <td className="p-3">{statusBadge(membership?.status)}</td>
                    <td className="p-3">
                      <a
                        href={`${import.meta.env.VITE_CIVICRM_BASE_URL}/civicrm/contact/view?cid=${contact.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline text-xs"
                      >
                        CiviCRM öffnen ↗
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t border-secondary-200 text-sm text-secondary-600">
          <span>{total} Kontakte gesamt</span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
            >
              ← Zurück
            </Button>
            <span className="flex items-center px-2">Seite {page + 1} / {Math.ceil(total / PAGE_SIZE) || 1}</span>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * PAGE_SIZE >= total || loading}
            >
              Weiter →
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
