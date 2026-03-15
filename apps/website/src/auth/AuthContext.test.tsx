import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600, ...payload }));
  return `${header}.${body}.fakesig`;
}

function TestConsumer() {
  const { token, userRole, userEmail, isAdmin } = useAuth();
  return (
    <div>
      <span data-testid="token">{token ?? 'null'}</span>
      <span data-testid="role">{userRole}</span>
      <span data-testid="email">{userEmail ?? 'null'}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
    </div>
  );
}

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../services/api', () => ({
  api: {
    login: vi.fn(),
  },
}));

import { api } from '../services/api';
const mockLogin = vi.mocked(api.login);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuthContext', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('starts as guest with no token when sessionStorage is empty', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('token').textContent).toBe('null');
    expect(screen.getByTestId('role').textContent).toBe('guest');
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
  });

  it('hydrates from sessionStorage on mount', () => {
    const token = buildJwt({ sub: 'user@example.com', role: 'member' });
    sessionStorage.setItem('moe_auth_token', token);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('token').textContent).toBe(token);
    expect(screen.getByTestId('role').textContent).toBe('member');
    expect(screen.getByTestId('email').textContent).toBe('user@example.com');
  });

  it('marks admin users as isAdmin=true', () => {
    const token = buildJwt({ sub: 'admin@example.com', role: 'admin' });
    sessionStorage.setItem('moe_auth_token', token);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('isAdmin').textContent).toBe('true');
  });

  it('marks sysadmin users as isAdmin=true', () => {
    const token = buildJwt({ sub: 'sys@example.com', role: 'sysadmin' });
    sessionStorage.setItem('moe_auth_token', token);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('isAdmin').textContent).toBe('true');
  });

  it('login stores token in sessionStorage under moe_auth_token', async () => {
    const token = buildJwt({ sub: 'user@example.com', role: 'member' });
    mockLogin.mockResolvedValueOnce({ data: { token } } as never);

    function LoginButton() {
      const { login } = useAuth();
      return <button onClick={() => login('user@example.com', 'pw')}>Login</button>;
    }

    render(
      <AuthProvider>
        <LoginButton />
        <TestConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByRole('button').click();
    });

    await waitFor(() => {
      expect(sessionStorage.getItem('moe_auth_token')).toBe(token);
      expect(screen.getByTestId('token').textContent).toBe(token);
    });
  });

  it('logout clears token from sessionStorage', async () => {
    const token = buildJwt({ sub: 'user@example.com', role: 'member' });
    sessionStorage.setItem('moe_auth_token', token);

    function LogoutButton() {
      const { logout } = useAuth();
      return <button onClick={logout}>Logout</button>;
    }

    render(
      <AuthProvider>
        <LogoutButton />
        <TestConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByRole('button').click();
    });

    expect(sessionStorage.getItem('moe_auth_token')).toBeNull();
    expect(screen.getByTestId('token').textContent).toBe('null');
    expect(screen.getByTestId('role').textContent).toBe('guest');
  });
});
