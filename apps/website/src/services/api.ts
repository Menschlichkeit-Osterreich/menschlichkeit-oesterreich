import { http } from './http';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

const baseApi = {
  health: () => http.get<HealthResponse>('/health'),
  login: (email: string, password: string) =>
    http.post<LoginResponse>('/auth/login', { email, password }),
};

// Generic API response shape from backend
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface LoginResponse extends ApiResponse<{ token: string; expires_in: number }> {}

// Auth
export interface AuthTokens {
  token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export interface RegisterResponse extends ApiResponse<{ tokens: AuthTokens; contact: unknown }> {}

export interface CreateContactRequest {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
}

export interface CreateMembershipRequest {
  contact_id: number;
  membership_type_id?: number;
  start_date?: string | null;
  end_date?: string | null;
}

// Privacy / GDPR
export type DeletionScope = 'full' | 'partial';

export interface DataDeletionCreateRequest {
  reason: string;
  scope?: DeletionScope;
}

export interface DeletionRequestItem {
  id: number;
  user_id: number;
  email: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_at: string;
  completed_at?: string | null;
}

export const apiPaths = {
  contacts: {
    create: '/contacts/create',
    search: '/contacts/search',
  },
  memberships: {
    create: '/memberships/create',
  },
  auth: {
    register: '/auth/register',
  },
  contributions: {
    create: '/contributions/create',
    recur: '/contributions/recur',
  },
  queue: {
    stats: '/queue/stats',
    dlqList: '/queue/dlq/list',
    dlqRequeue: '/queue/dlq/requeue',
    dlqPurge: '/queue/dlq/purge',
  },
} as const;

export const api = {
  ...baseApi,
  contacts: {
    create: (payload: CreateContactRequest, token: string) =>
      http.post<ApiResponse>(apiPaths.contacts.create, payload, { token }),
    search: (email: string | undefined, token: string) =>
      http.get<ApiResponse>(
        `${apiPaths.contacts.search}${email ? `?email=${encodeURIComponent(email)}` : ''}`,
        { token }
      ),
  },
  auth: {
    register: (payload: RegisterRequest) =>
      http.post<RegisterResponse>(apiPaths.auth.register, payload),
  },
  memberships: {
    create: (payload: CreateMembershipRequest, token: string) =>
      http.post<ApiResponse>(apiPaths.memberships.create, payload, { token }),
  },
  contributions: {
    create: (
      payload: {
        email?: string;
        contact_id?: number;
        amount: number;
        currency?: string;
        financial_type?: 'donation' | 'membership_fee';
        purpose?: string | null;
        anonymous?: boolean;
        tribute_name?: string | null;
        payment_instrument: 'bank_transfer' | 'sepa' | 'visa' | 'mastercard' | 'amex' | 'paypal' | 'apple_pay' | 'google_pay' | 'eps' | 'sofort' | 'revolut' | 'wise' | 'pos' | 'cash';
      },
      token: string
    ) => http.post<ApiResponse>(apiPaths.contributions.create, payload, { token }),
    recur: (
      payload: {
        email?: string;
        contact_id?: number;
        amount: number;
        currency?: string;
        interval: 'monthly' | 'quarterly' | 'yearly';
        financial_type?: 'donation' | 'membership_fee';
        purpose?: string | null;
        payment_instrument: 'sepa' | 'visa' | 'mastercard' | 'amex' | 'paypal';
      },
      token: string
    ) => http.post<ApiResponse>(apiPaths.contributions.recur, payload, { token }),
  },
  queue: {
    stats: (token: string) => http.get<ApiResponse>(apiPaths.queue.stats, { token }),
    dlqList: (token: string, limit = 50, offset = 0) =>
      http.get<ApiResponse>(`${apiPaths.queue.dlqList}?limit=${limit}&offset=${offset}`, { token }),
    dlqRequeue: (id: string, token: string, delay_seconds = 60) =>
      http.post<ApiResponse>(apiPaths.queue.dlqRequeue, { id, delay_seconds }, { token }),
    dlqPurge: (token: string, id?: string) =>
      http.post<ApiResponse>(apiPaths.queue.dlqPurge, id ? { id } : {}, { token }),
  },
  privacy: {
    requestDeletion: (payload: DataDeletionCreateRequest, token: string) =>
      http.post<ApiResponse>(`/privacy/data-deletion`, payload, { token }),
    listDeletions: (token: string) =>
      http.get<ApiResponse<{ requests: DeletionRequestItem[] }>>(`/privacy/data-deletion`, { token }),
  },

  // ── FastAPI v2 endpoints (/api/*) ─────────────────────────────────────────

  /** FastAPI Auth-Router – neue Endpunkte */
  authV2: {
    login: (email: string, password: string) =>
      http.post<{ access_token: string; refresh_token: string; token_type: string; expires_in: number }>(
        '/api/auth/login', { email, password }
      ),
    register: (payload: RegisterRequest) =>
      http.post<{ access_token: string; refresh_token: string; token_type: string; expires_in: number }>(
        '/api/auth/register', payload
      ),
    me: (token: string) =>
      http.get<{ id: number; email: string; first_name: string; last_name: string; role: string }>(
        '/api/auth/me', { token }
      ),
  },

  /** Mitgliederprofil & DSGVO-Rechte */
  members: {
    getProfile: (token: string) =>
      http.get<{ id: number; email: string; first_name: string; last_name: string; role: string; civicrm_id?: number }>(
        '/api/members/me/profile', { token }
      ),
    updateProfile: (payload: { first_name?: string; last_name?: string; phone?: string }, token: string) =>
      http.put<ApiResponse>('/api/members/me/profile', payload, { token }),
    getInvoices: (token: string) =>
      http.get<Array<{ id: number; invoice_number: string; total_amount: number; currency: string; issue_date: string; due_date: string; status: string; invoice_type: string; pdf_path: string | null }>>(
        '/api/members/me/invoices', { token }
      ),
    getDonations: (token: string) =>
      http.get<Array<{ id: number; amount: number; currency: string; donation_type: string; status: string; donation_date: string; receipt_eligible: boolean }>>(
        '/api/members/me/donations', { token }
      ),
    requestDataExport: (reason: string | null, token: string) =>
      http.post<ApiResponse>('/api/members/me/data-export', { reason }, { token }),
    requestDeletion: (reason: string, token: string) =>
      http.post<ApiResponse>('/api/members/me/delete-request', { reason, confirm: true }, { token }),
  },

  /** Rechnungen (Admin + Mitglied) */
  invoices: {
    list: (token: string, params?: { status?: string; page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.page) qs.set('page', String(params.page));
      return http.get<{ invoices: unknown[]; page: number }>(`/api/invoices${qs.toString() ? `?${qs}` : ''}`, { token });
    },
    get: (id: number, token: string) =>
      http.get<Record<string, unknown>>(`/api/invoices/${id}`, { token }),
    downloadUrl: (id: number, token: string) =>
      http.get<{ url: string; expires_in: number }>(`/api/invoices/${id}/download`, { token }),
    send: (id: number, email: string | null, token: string) =>
      http.post<ApiResponse>(`/api/invoices/${id}/send`, { email }, { token }),
  },

  /** Spenden (Admin) */
  donations: {
    list: (token: string, page = 1) =>
      http.get<{ donations: unknown[]; page: number }>(`/api/donations?page=${page}`, { token }),
    get: (id: number, token: string) =>
      http.get<Record<string, unknown>>(`/api/donations/${id}`, { token }),
  },

  /** SEPA-Mandate & Batches */
  sepa: {
    listMandates: (token: string, activeOnly = true) =>
      http.get<{ mandates: unknown[] }>(`/api/sepa/mandates?active_only=${activeOnly}`, { token }),
    listBatches: (token: string) =>
      http.get<{ batches: unknown[] }>('/api/sepa/batches', { token }),
    createBatch: (payload: { collection_date: string; batch_type?: string; mandate_ids: number[] }, token: string) =>
      http.post<{ id: number; batch_reference: string; message: string }>('/api/sepa/batches', payload, { token }),
  },
};
