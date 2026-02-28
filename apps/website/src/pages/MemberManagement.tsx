import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { MemberList } from '../components/members/MemberList';
import { MemberDetail } from '../components/members/MemberDetail';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Alert } from '../components/ui/Alert';

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

export default function MemberManagementPage() {
  const { token } = useAuth();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function handleMemberSelect(member: Member) {
    setSelectedMember(member);
  }

  function handleMemberClose() {
    setSelectedMember(null);
  }

  function handleMemberUpdate(updatedMember: Member) {
    setSelectedMember(updatedMember);
    // Trigger refresh of member list
    setRefreshTrigger(prev => prev + 1);
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <Alert variant="error">
          Bitte melden Sie sich an, um die Mitgliederverwaltung zu nutzen.
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 space-y-4">
      <PageHeader
        title="Mitgliederverwaltung"
        description="Verwaltung aller Vereinsmitglieder und deren Mitgliedschaften"
        breadcrumb={
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/member-area' },
              { label: 'Mitgliederverwaltung' },
            ]}
          />
        }
      />

      <MemberList 
        key={refreshTrigger}
        onMemberSelect={handleMemberSelect} 
      />

      {selectedMember && (
        <MemberDetail
          member={selectedMember}
          onClose={handleMemberClose}
          onUpdate={handleMemberUpdate}
        />
      )}
    </div>
  );
}
