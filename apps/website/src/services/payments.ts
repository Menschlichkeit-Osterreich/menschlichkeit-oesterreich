import { loadStripe, Stripe } from '@stripe/stripe-js';
import { http } from './http';
import { config } from './config';
import type { ApiResponse } from './api';

let stripePromise: Promise<Stripe | null> | null = null;
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(config.stripePublishableKey);
  }
  return stripePromise;
}

export async function createStripeIntent(payload: {
  amount: number;
  currency?: string;
  email?: string;
  purpose?: string;
  method?: 'card' | 'sepa' | 'eps' | 'sofort';
  financial_type?: 'donation' | 'membership_fee';
}, token?: string) {
  const res = await http.post<ApiResponse>('/payments/stripe/intent', payload, token ? { token } : {});
  return res;
}

export async function createPayPalOrder(payload: { amount: number; currency?: string; email?: string; purpose?: string }, token?: string) {
  const res = await http.post<ApiResponse>('/payments/paypal/order', payload, token ? { token } : {});
  return res;
}

export async function capturePayPalOrder(payload: { order_id: string; email?: string; contact_id?: number; purpose?: string }, token?: string) {
  const res = await http.post<ApiResponse>('/payments/paypal/capture', payload, token ? { token } : {});
  return res;
}
