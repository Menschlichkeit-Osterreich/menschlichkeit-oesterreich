/**
 * CiviCRM API Service – Menschlichkeit Österreich
 * Wraps the CiviCRM REST API v4 for use in the React frontend.
 * Base URL is configured via VITE_CIVICRM_BASE_URL in .env files.
 */

const BASE_URL = import.meta.env.VITE_CIVICRM_BASE_URL ?? 'https://crm.menschlichkeit-oesterreich.at';
const API_ENDPOINT = import.meta.env.VITE_CIVICRM_API_ENDPOINT ?? '/api/v4';

// ============================================================
// Types
// ============================================================

export interface CiviContact {
  id: number;
  contact_type: 'Individual' | 'Organization' | 'Household';
  first_name: string;
  last_name: string;
  display_name: string;
  email_primary?: string;
  phone_primary?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  do_not_email?: boolean;
  do_not_mail?: boolean;
  is_deleted?: boolean;
}

export interface CiviMembership {
  id: number;
  contact_id: number;
  membership_type_id: number;
  membership_type: string;
  start_date: string;
  end_date: string;
  status_id: number;
  status: string;
  source?: string;
}

export interface CiviContribution {
  id: number;
  contact_id: number;
  financial_type_id: number;
  total_amount: number;
  currency: string;
  receive_date: string;
  contribution_status_id: number;
  contribution_status: string;
  payment_instrument: string;
  source?: string;
  note?: string;
}

export interface CiviEvent {
  id: number;
  title: string;
  event_type_id: number;
  start_date: string;
  end_date?: string;
  description?: string;
  max_participants?: number;
  is_public: boolean;
  is_active: boolean;
  location?: string;
}

export interface CiviCreateContactPayload {
  contact_type: 'Individual' | 'Organization';
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  postal_code?: string;
}

export interface CiviCreateMembershipPayload {
  contact_id: number;
  membership_type_id: number;
  start_date?: string;
  source?: string;
}

// ============================================================
// HTTP Helper
// ============================================================

async function civiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${BASE_URL}${API_ENDPOINT}${path}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`CiviCRM API Error ${response.status}: ${errorBody}`);
  }
  return response.json();
}

// ============================================================
// Contacts API
// ============================================================

export const civiContacts = {
  /** Alle Kontakte abrufen (paginiert) */
  list: (token: string, limit = 25, offset = 0) =>
    civiFetch<{ values: CiviContact[]; count: number }>(
      `/Contact?select=["id","contact_type","first_name","last_name","display_name","email_primary.email","phone_primary.phone","address_primary.city","address_primary.postal_code"]&limit=${limit}&offset=${offset}&where=[["is_deleted","=",false]]`,
      { method: 'GET' },
      token
    ),

  /** Einzelnen Kontakt abrufen */
  get: (id: number, token: string) =>
    civiFetch<{ values: CiviContact[] }>(
      `/Contact/${id}?select=["*","email_primary.email","phone_primary.phone"]`,
      { method: 'GET' },
      token
    ),

  /** Kontakt suchen */
  search: (query: string, token: string) =>
    civiFetch<{ values: CiviContact[] }>(
      `/Contact?select=["id","display_name","email_primary.email"]&where=[["display_name","LIKE","%${encodeURIComponent(query)}%"],["is_deleted","=",false]]&limit=20`,
      { method: 'GET' },
      token
    ),

  /** Neuen Kontakt erstellen */
  create: (data: CiviCreateContactPayload, token?: string) =>
    civiFetch<{ values: CiviContact[] }>(
      '/Contact',
      {
        method: 'POST',
        body: JSON.stringify({ values: data }),
      },
      token
    ),

  /** Kontakt aktualisieren */
  update: (id: number, data: Partial<CiviCreateContactPayload>, token: string) =>
    civiFetch<{ values: CiviContact[] }>(
      `/Contact/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ values: data }),
      },
      token
    ),
};

// ============================================================
// Memberships API
// ============================================================

export const civiMemberships = {
  /** Alle Mitgliedschaften eines Kontakts */
  listByContact: (contactId: number, token: string) =>
    civiFetch<{ values: CiviMembership[] }>(
      `/Membership?select=["*","membership_type_id.name","status_id.label"]&where=[["contact_id","=",${contactId}]]`,
      { method: 'GET' },
      token
    ),

  /** Alle aktiven Mitgliedschaften */
  listActive: (token: string, limit = 50, offset = 0) =>
    civiFetch<{ values: CiviMembership[]; count: number }>(
      `/Membership?select=["*","membership_type_id.name","status_id.label","contact_id.display_name"]&where=[["status_id.name","IN",["New","Current","Grace"]]]&limit=${limit}&offset=${offset}`,
      { method: 'GET' },
      token
    ),

  /** Neue Mitgliedschaft erstellen */
  create: (data: CiviCreateMembershipPayload, token?: string) =>
    civiFetch<{ values: CiviMembership[] }>(
      '/Membership',
      {
        method: 'POST',
        body: JSON.stringify({ values: data }),
      },
      token
    ),

  /** Mitgliedschaft verlängern */
  renew: (id: number, endDate: string, token: string) =>
    civiFetch<{ values: CiviMembership[] }>(
      `/Membership/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ values: { end_date: endDate } }),
      },
      token
    ),
};

// ============================================================
// Contributions (Spenden) API
// ============================================================

export const civiContributions = {
  /** Spenden eines Kontakts */
  listByContact: (contactId: number, token: string) =>
    civiFetch<{ values: CiviContribution[] }>(
      `/Contribution?select=["*","financial_type_id.name","contribution_status_id.label","payment_instrument_id.label"]&where=[["contact_id","=",${contactId}]]&orderBy={"receive_date":"DESC"}`,
      { method: 'GET' },
      token
    ),

  /** Spende erfassen */
  create: (
    data: {
      contact_id: number;
      total_amount: number;
      financial_type_id: number;
      payment_instrument_id: number;
      receive_date: string;
      source?: string;
    },
    token: string
  ) =>
    civiFetch<{ values: CiviContribution[] }>(
      '/Contribution',
      {
        method: 'POST',
        body: JSON.stringify({ values: data }),
      },
      token
    ),
};

// ============================================================
// Events API
// ============================================================

export const civiEvents = {
  /** Öffentliche Veranstaltungen */
  listPublic: (token?: string) =>
    civiFetch<{ values: CiviEvent[] }>(
      '/Event?select=["id","title","start_date","end_date","description","is_public","location"]&where=[["is_public","=",true],["is_active","=",true]]&orderBy={"start_date":"ASC"}',
      { method: 'GET' },
      token
    ),
};

// ============================================================
// Newsletter / Mailing API
// ============================================================

export const civiNewsletter = {
  /** Kontakt für Newsletter anmelden */
  subscribe: (email: string, firstName: string, lastName: string) =>
    civiFetch<{ values: unknown[] }>(
      '/Contact',
      {
        method: 'POST',
        body: JSON.stringify({
          values: {
            contact_type: 'Individual',
            first_name: firstName,
            last_name: lastName,
            email: email,
          },
        }),
      }
    ),

  /** Kontakt vom Newsletter abmelden */
  unsubscribe: (contactId: number, token: string) =>
    civiFetch<{ values: unknown[] }>(
      `/Contact/${contactId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ values: { do_not_email: true } }),
      },
      token
    ),
};

// ============================================================
// Aggregated CiviCRM Service Export
// ============================================================

export const civicrm = {
  contacts: civiContacts,
  memberships: civiMemberships,
  contributions: civiContributions,
  events: civiEvents,
  newsletter: civiNewsletter,
};

export default civicrm;
