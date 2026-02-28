import React, { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Download, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../services/api';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  membership_type?: string;
  membership_status?: 'active' | 'pending' | 'expired' | 'cancelled';
  join_date?: string;
  address?: string;
}

interface MemberListProps {
  onMemberSelect?: (member: Member) => void;
}

export function MemberList({ onMemberSelect }: MemberListProps) {
  const { token } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchTerm, statusFilter, typeFilter, members]);

  async function loadMembers() {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // API-Call to get all contacts with memberships
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contacts/search`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Mitglieder');
      }

      const data = await response.json();
      const memberData = data.data?.contacts || [];
      setMembers(memberData);
      setFilteredMembers(memberData);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Mitglieder');
    } finally {
      setLoading(false);
    }
  }

  function filterMembers() {
    let filtered = [...members];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.first_name?.toLowerCase().includes(term) ||
        m.last_name?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.membership_status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(m => m.membership_type === typeFilter);
    }

    setFilteredMembers(filtered);
  }

  function getStatusBadgeVariant(status?: string) {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'expired': return 'error';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
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

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Lade Mitglieder...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-red-200 bg-red-50">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadMembers}>Erneut versuchen</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Suche nach Name oder E-Mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Neues Mitglied
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="all">Alle Status</option>
              <option value="active">Aktiv</option>
              <option value="pending">Ausstehend</option>
              <option value="expired">Abgelaufen</option>
              <option value="cancelled">Gekündigt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mitgliedsart
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="all">Alle Arten</option>
              <option value="Standard">Standard (36 €/Jahr)</option>
              <option value="Ermäßigt">Ermäßigt (18 €/Jahr)</option>
              <option value="Härtefall">Härtefall (0 €)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredMembers.length} von {members.length} Mitgliedern
      </div>

      {/* Member Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card
            key={member.id}
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onMemberSelect?.(member)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">
                  {member.first_name} {member.last_name}
                </h3>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>
              <Badge variant={getStatusBadgeVariant(member.membership_status)}>
                {getStatusLabel(member.membership_status)}
              </Badge>
            </div>

            {member.phone && (
              <p className="text-sm text-gray-600 mb-2">
                📞 {member.phone}
              </p>
            )}

            {member.membership_type && (
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-gray-600">
                  {member.membership_type}
                </span>
                {member.join_date && (
                  <span className="text-xs text-gray-500">
                    Seit {new Date(member.join_date).toLocaleDateString('de-AT')}
                  </span>
                )}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Bearbeiten
              </Button>
              <Button variant="ghost" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-600">Keine Mitglieder gefunden</p>
          {searchTerm && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchTerm('')}
            >
              Filter zurücksetzen
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
