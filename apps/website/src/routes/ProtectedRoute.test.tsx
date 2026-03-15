import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock useAuth before importing ProtectedRoute
vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../auth/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const mockUseAuth = vi.mocked(useAuth);

function Protected() {
  return <div>Geschützter Inhalt</div>;
}

function renderWithRouter(token: string | null) {
  mockUseAuth.mockReturnValue({
    token,
    userRole: token ? 'member' : 'guest',
    userEmail: token ? 'user@example.com' : null,
    isAdmin: false,
    login: vi.fn(),
    logout: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={<ProtectedRoute><Protected /></ProtectedRoute>}
        />
        <Route path="/login" element={<div>Login-Seite</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user has a token', () => {
    renderWithRouter('valid.token.here');
    expect(screen.getByText('Geschützter Inhalt')).toBeInTheDocument();
  });

  it('redirects to /Login when token is null', () => {
    renderWithRouter(null);
    expect(screen.queryByText('Geschützter Inhalt')).not.toBeInTheDocument();
    expect(screen.getByText('Login-Seite')).toBeInTheDocument();
  });
});
