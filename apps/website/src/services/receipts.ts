import { http } from './http';
import type { ApiResponse } from './api';

export async function triggerReceipt(payload: {
  amount: number;
  currency: string;
  purpose?: string;
  provider?: string;
  trxn_id?: string;
}, token?: string) {
  return http.post<ApiResponse>('/receipts/trigger', payload, token ? { token } : {});
}

export async function downloadReceipt(payload: {
  amount: number;
  currency: string;
  purpose?: string;
  provider?: string;
  trxn_id?: string;
  email?: string;
}, token?: string): Promise<Blob> {
  const url = `${location.origin.replace(/:\d+$/, '')}${''}`; // not used; build absolute via config
  const { config } = await import('./config');
  const endpoint = `${config.apiBaseUrl}/receipts/generate`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/pdf',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.blob();
}
