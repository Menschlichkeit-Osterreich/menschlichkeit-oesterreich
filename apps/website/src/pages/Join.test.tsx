import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import JoinPage from './Join';

describe('JoinPage', () => {
  it('renders the progress indicator as a semantic ordered list', () => {
    const { container } = render(
      <MemoryRouter>
        <JoinPage />
      </MemoryRouter>
    );

    const stepList = container.querySelector('nav[aria-label="Antragsschritte"] ol');
    expect(stepList).not.toBeNull();
    expect(stepList?.children).toHaveLength(4);
    const children = Array.from(stepList?.children ?? []) as Element[];
    expect(children.every(child => child.tagName === 'LI')).toBe(true);
    expect(container.querySelector('nav[aria-label="Antragsschritte"] ol > div')).toBeNull();
  });

  it('marks required step-one fields accessibly', () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <JoinPage />
      </MemoryRouter>
    );

    expect(getByLabelText(/Vorname/i)).toBeRequired();
    expect(getByLabelText(/Nachname/i)).toBeRequired();
    expect(getByLabelText(/E-Mail-Adresse/i)).toBeRequired();
  });
});
