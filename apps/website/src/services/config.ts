export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  requestTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000),
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  paypalClientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
};
