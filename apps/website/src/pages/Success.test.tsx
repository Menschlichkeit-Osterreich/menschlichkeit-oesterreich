import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import SuccessPage from './Success';

// Track A / #564 — Ein Browser-Return-URL ist kein Zahlungsnachweis.
describe('SuccessPage (fail-closed)', () => {
  function renderAt(path: string) {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <SuccessPage />
      </MemoryRouter>
    );
  }

  it('shows a neutral "status wird geprüft" state and never claims payment received', () => {
    const { container } = renderAt(
      '/erfolg?amount=999&currency=EUR&purpose=Hack&method=card'
    );
    const text = container.textContent || '';
    expect(text).toContain('Zahlungsstatus wird geprüft');
    expect(text).not.toContain('Ihre Zahlung wurde entgegengenommen');
  });

  it('does not render URL-supplied payment details as proof', () => {
    const { container } = renderAt(
      '/erfolg?amount=999&currency=EUR&purpose=SpoofedPurpose&method=spoofed'
    );
    const text = container.textContent || '';
    expect(text).not.toContain('999');
    expect(text).not.toContain('SpoofedPurpose');
    expect(text).not.toContain('spoofed');
  });

  it('exposes no receipt/PDF actions', () => {
    const { queryByText } = renderAt('/erfolg');
    expect(queryByText(/PDF/i)).toBeNull();
    expect(queryByText(/Beleg/i)).toBeNull();
  });
});
