import { API_BASE_URL } from '@/constants/api';

export const config = {
  apiBaseUrl: API_BASE_URL,
  requestTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000),
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
};
