import React from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, createStripeIntent } from '../../services/payments';
import { Button } from '../../components/ui/Button';

interface Props {
  clientSecret: string;
  disabled?: boolean;
  payer?: {
    name?: string;
    email?: string;
    iban?: string;
  };
  onDone: (msg: string) => void;
  onError: (msg: string) => void;
}

function InnerCheckout({ disabled, onDone, onError }: { disabled?: boolean; onDone: (m: string) => void; onError: (m: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();

  async function handlePay() {
    if (!stripe || !elements) return;
    try {
      const res = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
      });
      if ((res as any)?.error) throw (res as any).error;
      onDone('Zahlung gestartet/bestätigt. Vielen Dank!');
    } catch (e: any) {
      onError(e?.message || 'Zahlung fehlgeschlagen.');
    }
  }

  return (
    <div className="space-y-2">
      <div className="rounded border p-2 bg-white">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      <Button type="button" onClick={handlePay} disabled={!!disabled || !stripe}>
        Zahlung bestätigen
      </Button>
    </div>
  );
}

export default function StripeCheckout({ clientSecret, disabled, payer, onDone, onError }: Props) {
  return (
    <Elements stripe={getStripe()} options={{ clientSecret }}>
      <InnerCheckout disabled={disabled} onDone={onDone} onError={onError} />
    </Elements>
  );
}
