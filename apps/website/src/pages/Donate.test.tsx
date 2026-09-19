import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import DonatePage from './Donate';

// Track A / #564 — Keine öffentlichen Dauerspenden-Versprechen, solange kein
// echter Stripe-Subscription-Lebenszyklus existiert (kein PaymentIntent-Fake).
describe('DonatePage (no recurring promises)', () => {
  function renderPage(path = '/spenden') {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <DonatePage />
      </MemoryRouter>
    );
  }

  it('does not expose a recurring/interval selector', () => {
    const { container } = renderPage();
    expect(container.querySelector('#donation-interval')).toBeNull();
    expect(container.querySelector('select[name="interval"]')).toBeNull();
  });

  it('offers no monthly/quarterly/yearly cadence options', () => {
    const { queryByRole } = renderPage();
    expect(queryByRole('option', { name: 'Monatlich' })).toBeNull();
    expect(queryByRole('option', { name: 'Vierteljährlich' })).toBeNull();
    expect(queryByRole('option', { name: 'Jährlich' })).toBeNull();
  });

  it('ignores an interval query parameter (no recurring pre-selection)', () => {
    const { container } = renderPage('/spenden?interval=monthly');
    expect(container.querySelector('#donation-interval')).toBeNull();
  });
});
