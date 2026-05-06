import { http } from './http';

export interface KpisOverview {
  members_total: number;
  net_new_members_month: number;
  donations_ytd_cents: number;
  income_vs_expense_current_month_cents: number;
  as_of: string;
  since: string;
}

export interface Member {
  id: string;
  email: string;
  vorname: string;
  nachname: string;
  mitgliedschaft_typ: string;
  status: string;
  rolle: string;
  joined_at?: string;
  created_at?: string;
}

export interface FinanceOverview {
  einnahmen_monat_cents: number;
  ausgaben_monat_cents: number;
  saldo_monat_cents: number;
  einnahmen_jahr_cents: number;
  ausgaben_jahr_cents: number;
  saldo_jahr_cents: number;
  offene_rechnungen: number;
  ueberfaellige_rechnungen: number;
  source_system: string;
  erpnext_enabled: boolean;
}

export interface FinanceSyncFailure {
  id: string;
  source_entity_type: string;
  source_entity_id: string;
  operation: string;
  last_error?: string | null;
  attempts: number;
  updated_at?: string | null;
}

export interface FinanceSyncHealth {
  pending: number;
  processing: number;
  failed: number;
  success: number;
  latest_success_at?: string | null;
  erpnext_enabled: boolean;
  failures: FinanceSyncFailure[];
}

export interface FinanceReceivable {
  name: string;
  party?: string | null;
  display_name?: string | null;
  status?: string | null;
  due_date?: string | null;
  posting_date?: string | null;
  grand_total: number;
  outstanding_amount: number;
}

export interface FinancePayable {
  name: string;
  party?: string | null;
  display_name?: string | null;
  status?: string | null;
  due_date?: string | null;
  posting_date?: string | null;
  grand_total: number;
  outstanding_amount: number;
}

export interface FinanceBankAccount {
  name: string;
  bank?: string | null;
  bank_account_no?: string | null;
  is_company_account?: boolean | null;
  company?: string | null;
}

export interface FinancePayrollRun {
  name: string;
  company?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  posting_date?: string | null;
  status?: string | null;
}

export interface FinanceAsset {
  name: string;
  asset_name?: string | null;
  status?: string | null;
  gross_purchase_amount?: number | null;
  purchase_date?: string | null;
  available_for_use_date?: string | null;
}

export interface FinanceExpenseClaim {
  name: string;
  employee_name?: string | null;
  total_claimed_amount?: number | null;
  posting_date?: string | null;
  approval_status?: string | null;
}

export interface FinanceCockpit {
  overview: FinanceOverview;
  sync: FinanceSyncHealth;
  receivables: FinanceReceivable[];
  payables: FinancePayable[];
  bank_accounts: FinanceBankAccount[];
  payroll_runs: FinancePayrollRun[];
  assets: FinanceAsset[];
  expense_claims: FinanceExpenseClaim[];
  mapping: Record<string, string>;
}

export interface FinanceActionResult {
  success: boolean;
  sync_id: string;
  target_name: string;
}

export interface FinanceReportDescriptor {
  id: string;
  title: string;
  description: string;
  format: string;
  source: string;
}

function getToken(): string | null {
  return sessionStorage.getItem('moe_auth_token');
}

function authOpts(token?: string): { headers: Record<string, string> } {
  const resolved = token || getToken();
  return { headers: resolved ? { Authorization: `Bearer ${resolved}` } : {} };
}

export const dashboardApi = {
  getKpis: (token?: string) =>
    http.get<KpisOverview>('/api/kpis/overview', authOpts(token)),

  getMembers: (params?: { page?: number; search?: string; status?: string }, token?: string) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status_filter', params.status);
    return http.get<{ data: Member[]; total: number }>(`/api/members?${q}`, authOpts(token));
  },

  getMember: (id: string, token?: string) =>
    http.get<Member>(`/api/members/${id}`, authOpts(token)),

  updateMember: (id: string, data: Partial<Member>, token?: string) =>
    http.put<Member>(`/api/members/${id}`, data, authOpts(token)),

  deleteMember: (id: string, token?: string) =>
    http.delete(`/api/members/${id}`, authOpts(token)),

  getFinanceOverview: (token?: string) =>
    http.get<{ data: FinanceOverview }>('/api/finance/overview', authOpts(token)),

  getFinanceCockpit: (token: string) =>
    http.get<{ data: FinanceCockpit }>('/api/finance/cockpit', authOpts(token)),

  processFinanceSync: (token: string, limit = 20) =>
    http.post<{ count: number; processed: Array<Record<string, unknown>> }>(
      `/api/finance/sync/process?limit=${limit}`,
      {},
      authOpts(token)
    ),

  requeueFinanceSync: (syncId: string, token: string) =>
    http.post<{ data: Record<string, unknown> }>(`/api/finance/sync/requeue/${syncId}`, {}, authOpts(token)),

  createFinancePayable: (
    payload: {
      supplier_name: string;
      supplier_email?: string;
      description: string;
      amount: number;
      currency?: string;
      due_date?: string;
      bill_date?: string;
      posting_date?: string;
      expense_account?: string;
      cost_center?: string;
      item_code?: string;
      external_reference?: string;
    },
    token: string
  ) => http.post<FinanceActionResult>('/api/finance/payables', payload, authOpts(token)),

  createManualJournal: (
    payload: {
      posting_date: string;
      memo: string;
      external_reference?: string;
      lines: Array<{
        account: string;
        debit?: number;
        credit?: number;
        cost_center?: string;
        remark?: string;
      }>;
    },
    token: string
  ) => http.post<FinanceActionResult>('/api/finance/manual-journal', payload, authOpts(token)),

  getFinanceReportCatalog: (token: string) =>
    http.get<{ data: FinanceReportDescriptor[] }>('/api/finance/reports/catalog', authOpts(token)),

  getFinanceReport: (reportId: string, token: string, format: 'json' | 'csv' = 'json') =>
    http.get<{ data: { report_id: string; format: string; generated_at: string; content?: string; rows?: Array<Record<string, unknown>> } }>(
      `/api/finance/reports/${reportId}?format=${format}`,
      authOpts(token)
    ),

  getInvoices: (params?: { page?: number; status?: string }, token?: string) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.status) q.set('status_filter', params.status);
    return http.get<{ data: Array<Record<string, unknown>>; total: number }>(`/api/finance/invoices?${q}`, authOpts(token));
  },

  getRoles: (token?: string) =>
    http.get<{ data: Array<Record<string, unknown>> }>('/api/roles', authOpts(token)),

  assignRole: (userId: string, roleName: string, token?: string) =>
    http.post('/api/roles/assign', { user_id: userId, role_name: roleName }, authOpts(token)),

  getEvents: (params?: { status?: string }, token?: string) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    return http.get<{ data: Array<Record<string, unknown>>; total: number }>(`/api/events?${q}`, authOpts(token));
  },

  getEvent: (id: string, token?: string) =>
    http.get<Record<string, unknown>>(`/api/events/${id}`, authOpts(token)),

  createEvent: (data: Record<string, unknown>, token?: string) =>
    http.post<Record<string, unknown>>('/api/events', data, authOpts(token)),

  updateEvent: (id: string, data: Record<string, unknown>, token?: string) =>
    http.put<Record<string, unknown>>(`/api/events/${id}`, data, authOpts(token)),

  deleteEvent: (id: string, token?: string) =>
    http.delete(`/api/events/${id}`, authOpts(token)),

  rsvpEvent: (id: string, token?: string) =>
    http.post<Record<string, unknown>>(`/api/events/${id}/rsvp`, {}, authOpts(token)),

  getProfile: (token?: string) =>
    http.get<Record<string, unknown>>('/api/members/me/profile', authOpts(token)),

  getForumCategories: (token?: string) =>
    http.get<{ data: Array<Record<string, unknown>> }>('/api/forum/categories', authOpts(token)),

  getForumThreads: (params?: { category?: string; page?: number }, token?: string) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.page) q.set('page', String(params.page));
    return http.get<{ data: Array<Record<string, unknown>>; total: number }>(`/api/forum/threads?${q}`, authOpts(token));
  },

  getBlogArticles: (params?: { category?: string; page?: number }, token?: string) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.page) q.set('page', String(params.page));
    return http.get<{ data: Array<Record<string, unknown>>; total: number }>(`/api/blog/articles?${q}`, authOpts(token));
  },
};
