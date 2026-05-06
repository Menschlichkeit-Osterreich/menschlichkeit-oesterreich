import { http } from '../http';

export interface AdminCrmContactSummary {
  contactId: number;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  postalCode: string;
  memberId: string | null;
  memberRole: string | null;
  memberStatus: string | null;
  membershipType: string | null;
  newsletterStatus: string;
  donationCount: number;
  totalDonations: number;
  openInvoices: number;
  lastInvoiceDate: string | null;
  lastDonationDate: string | null;
  openIssuesCount: number;
  lastFailureAt: string | null;
  syncState: 'ok' | 'attention' | 'degraded';
  hasLinkedMember: boolean;
  openInCiviUrl: string | null;
}

export interface AdminCrmContactDetail {
  profile: {
    contactId: number;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    streetAddress: string;
    postalCode: string;
    city: string;
    memberId: string | null;
    memberRole: string | null;
    memberStatus: string | null;
    membershipType: string | null;
    joinedAt: string | null;
    openInCiviUrl: string | null;
  };
  memberships: Array<{
    id: number | string;
    membershipType: string | null;
    status: string | null;
    joinDate: string | null;
    startDate: string | null;
    endDate: string | null;
    source: string | null;
  }>;
  contributions: Array<{
    id: number | string;
    amount: number;
    currency: string;
    status: string | null;
    kind: string | null;
    date: string | null;
    source: string | null;
    transactionId?: string | null;
    sourceSystem: 'civicrm' | 'platform';
    civicrmContributionId?: number | null;
  }>;
  invoices: Array<{
    id: number;
    invoiceNumber: string;
    totalAmount: number;
    currency: string;
    status: string;
    invoiceType: string;
    issueDate: string | null;
    dueDate: string | null;
    paidAt: string | null;
    pdfPath: string | null;
  }>;
  consents: Array<{
    id: string;
    member_id?: string | null;
    email?: string | null;
    consent_type: string;
    version: string;
    status: string;
    source: string;
    legal_basis: string;
    created_at: string;
  }>;
  events: Array<{
    id: number | string;
    title: string | null;
    category: string | null;
    status: string | null;
    role?: string | null;
    location?: string | null;
    startDate: string | null;
    endDate: string | null;
    sourceSystem: 'civicrm' | 'platform';
  }>;
  newsletter: {
    status: string;
    confirmedAt: string | null;
    unsubscribedAt: string | null;
    updatedAt: string | null;
  };
  sync: {
    crmReachable: boolean;
    hasLinkedMember: boolean;
    openIssuesCount: number;
    state: 'ok' | 'attention' | 'degraded';
    warnings: string[];
    lastLocalUpdateAt: string | null;
  };
}

export interface AdminCrmContactUpdatePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  street_address?: string;
  postal_code?: string;
  city?: string;
  newsletter_status?: string;
}

export interface AdminCrmListResponse {
  items: AdminCrmContactSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  meta: {
    crmReachable: boolean;
    warnings: string[];
  };
}

function buildListQuery(params: { search?: string; page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  const rendered = query.toString();
  return rendered ? `?${rendered}` : '';
}

export const adminCrmApi = {
  listContacts: (token: string, params: { search?: string; page?: number; pageSize?: number } = {}) =>
    http.get<{ success: boolean; data: AdminCrmListResponse }>(
      `/api/admin/crm/contacts${buildListQuery(params)}`,
      { token }
    ),

  getContact: (contactId: number, token: string) =>
    http.get<{ success: boolean; data: AdminCrmContactDetail }>(
      `/api/admin/crm/contacts/${contactId}`,
      { token }
    ),

  updateContact: (contactId: number, payload: AdminCrmContactUpdatePayload, token: string) =>
    http.put<{ success: boolean; data: AdminCrmContactDetail; message?: string }>(
      `/api/admin/crm/contacts/${contactId}`,
      payload,
      { token }
    ),

  createMembership: (contactId: number, membershipKey: string, token: string) =>
    http.post<{
      success: boolean;
      data: {
        membership: {
          id: number | string;
          membershipType: string | null;
          status: string | null;
          joinDate: string | null;
          startDate: string | null;
          endDate: string | null;
          source: string | null;
        };
      };
      message?: string;
    }>(
      `/api/admin/crm/contacts/${contactId}/memberships`,
      { membership_key: membershipKey },
      { token }
    ),
};

