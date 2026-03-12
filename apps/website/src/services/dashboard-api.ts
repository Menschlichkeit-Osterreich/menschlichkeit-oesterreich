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
}

function getToken(): string | null {
  return sessionStorage.getItem('moe_auth_token');
}

function authOpts(): { headers: Record<string, string> } {
  const t = getToken();
  return { headers: t ? { Authorization: `Bearer ${t}` } : {} };
}

export const dashboardApi = {
  getKpis: () =>
    http.get<KpisOverview>('/api/kpis/overview', authOpts()),

  getMembers: (params?: { page?: number; search?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status_filter', params.status);
    return http.get<{ data: Member[]; total: number }>(`/api/members?${q}`, authOpts());
  },

  getMember: (id: string) =>
    http.get<Member>(`/api/members/${id}`, authOpts()),

  updateMember: (id: string, data: Partial<Member>) =>
    http.put<Member>(`/api/members/${id}`, data, authOpts()),

  deleteMember: (id: string) =>
    http.delete(`/api/members/${id}`, authOpts()),

  getFinanceOverview: () =>
    http.get<{ data: FinanceOverview }>('/api/finance/overview', authOpts()),

  getInvoices: (params?: { page?: number; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.status) q.set('status_filter', params.status);
    return http.get<{ data: any[]; total: number }>(`/api/finance/invoices?${q}`, authOpts());
  },

  getRoles: () =>
    http.get<{ data: any[] }>('/api/roles', authOpts()),

  assignRole: (userId: string, roleName: string) =>
    http.post('/api/roles/assign', { user_id: userId, role_name: roleName }, authOpts()),

  getEvents: (params?: { status?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    return http.get<{ data: any[]; total: number }>(`/api/events?${q}`, authOpts());
  },

  getEvent: (id: string) =>
    http.get<any>(`/api/events/${id}`, authOpts()),

  createEvent: (data: Record<string, any>) =>
    http.post<any>('/api/events', data, authOpts()),

  updateEvent: (id: string, data: Record<string, any>) =>
    http.put<any>(`/api/events/${id}`, data, authOpts()),

  deleteEvent: (id: string) =>
    http.delete(`/api/events/${id}`, authOpts()),

  rsvpEvent: (id: string) =>
    http.post<any>(`/api/events/${id}/rsvp`, {}, authOpts()),

  getProfile: () =>
    http.get<any>('/api/members/me/profile', authOpts()),

  getForumCategories: () =>
    http.get<{ data: any[] }>('/api/forum/categories', authOpts()),

  getForumThreads: (params?: { category?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.page) q.set('page', String(params.page));
    return http.get<{ data: any[]; total: number }>(`/api/forum/threads?${q}`, authOpts());
  },

  getBlogArticles: (params?: { category?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.page) q.set('page', String(params.page));
    return http.get<{ data: any[]; total: number }>(`/api/blog/articles?${q}`, authOpts());
  },
};
