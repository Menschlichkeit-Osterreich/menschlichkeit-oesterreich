import { loadStripe, Stripe } from '@stripe/stripe-js';
import type { ApiResponse } from './api';
import { config } from './config';
import { http } from './http';

let stripePromise: Promise<Stripe | null> | null = null;
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(config.stripePublishableKey);
  }
  return stripePromise;
}

export async function createStripeIntent(
  payload: {
    amount: number;
    currency?: string;
    email?: string;
    purpose?: string;
    method?: 'card' | 'sepa' | 'eps' | 'sofort';
    financial_type?: 'donation' | 'membership_fee';
    interval?: 'once' | 'monthly' | 'quarterly' | 'yearly';
  },
  token?: string
) {
  const res = await http.post<ApiResponse>(
    '/api/payments/stripe/intent',
    payload,
    token ? { token } : {}
  );
  return res;
}
