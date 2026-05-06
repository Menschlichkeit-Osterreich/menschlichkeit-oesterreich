import { act, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CrossHostRedirect from './CrossHostRedirect';

class MockImage {
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;

  set src(value: string) {
    window.setTimeout(() => {
      if (value.includes('healthy')) {
        this.onload?.();
        return;
      }

      this.onerror?.();
    }, 0);
  }
}

describe('CrossHostRedirect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('Image', MockImage);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows a fallback instead of a blind redirect when the portal probe fails', async () => {
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <CrossHostRedirect
          to="https://crm.menschlichkeit-oesterreich.at/login"
          probeUrl="https://crm.menschlichkeit-oesterreich.at/down"
          failureTitle="CRM-Portal derzeit nicht erreichbar"
          failureDescription="Bitte versuchen Sie es spaeter erneut."
          fallbackActions={[{ href: '/kontakt', label: 'Kontakt aufnehmen' }]}
        />
      </MemoryRouter>
    );

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    expect(getByText('CRM-Portal derzeit nicht erreichbar')).toBeInTheDocument();
    expect(getByRole('link', { name: 'Portal erneut öffnen' })).toHaveAttribute(
      'href',
      'https://crm.menschlichkeit-oesterreich.at/login'
    );
    expect(getByRole('link', { name: 'Kontakt aufnehmen' })).toHaveAttribute('href', '/kontakt');
  });
});
