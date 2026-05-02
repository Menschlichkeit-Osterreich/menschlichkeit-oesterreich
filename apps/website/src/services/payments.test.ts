import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('payments service', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('cached das Stripe-Objekt und lädt Stripe nur einmal', async () => {
    const stripeInstance = { elements: vi.fn() };
    const loadStripe = vi.fn().mockResolvedValue(stripeInstance);

    vi.doMock('@stripe/stripe-js', () => ({
      loadStripe,
    }));
    vi.doMock('./config', () => ({
      config: {
        stripePublishableKey: 'pk_test_123',
      },
    }));
    vi.doMock('./http', () => ({
      http: {
        post: vi.fn(),
      },
    }));

    const { getStripe } = await import('./payments');

    const first = getStripe();
    const second = getStripe();

    expect(first).toBe(second);
    await expect(first).resolves.toBe(stripeInstance);
    expect(loadStripe).toHaveBeenCalledTimes(1);
    expect(loadStripe).toHaveBeenCalledWith('pk_test_123');
  });

  it('leitet Payload und Token korrekt an den Payments-Endpunkt weiter', async () => {
    const post = vi.fn().mockResolvedValue({ success: true, data: { client_secret: 'secret' } });

    vi.doMock('@stripe/stripe-js', () => ({
      loadStripe: vi.fn(),
    }));
    vi.doMock('./config', () => ({
      config: {
        stripePublishableKey: 'pk_test_123',
      },
    }));
    vi.doMock('./http', () => ({
      http: {
        post,
      },
    }));

    const { createStripeIntent } = await import('./payments');

    const payload = {
      amount: 25,
      currency: 'eur',
      purpose: 'Spende',
      method: 'card' as const,
      interval: 'monthly' as const,
    };

    await createStripeIntent(payload, 'jwt-token');

    expect(post).toHaveBeenCalledWith(
      '/api/payments/stripe/intent',
      payload,
      { token: 'jwt-token' }
    );
  });
});