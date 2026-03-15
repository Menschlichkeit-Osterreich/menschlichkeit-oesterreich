import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { setUnauthorizedHandler } from '../services/http';

type UserRole = 'guest' | 'member' | 'moderator' | 'admin' | 'sysadmin';

type AuthState = {
  token: string | null;
  userEmail: string | null;
  userRole: UserRole;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = 'moe_auth_token';

interface JwtPayload {
  sub?: string;
  role?: UserRole;
  [key: string]: unknown;
}

function parseJwtPayload(t?: string | null): JwtPayload | null {
  if (!t) return null;
  try {
    const parts = t.split('.');
    if (parts.length < 2) return null;
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('guest');

  useEffect(() => {
    const t = sessionStorage.getItem(STORAGE_KEY);
    if (t) {
      setToken(t);
      const payload = parseJwtPayload(t);
      setUserEmail(typeof payload?.sub === 'string' ? payload.sub : null);
      setUserRole((payload?.role as UserRole) || 'member');
    }
    setUnauthorizedHandler(() => {
      sessionStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setUserEmail(null);
      setUserRole('guest');
      try { window.location.assign('/login'); } catch { /* navigation fallback */ }
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    const payload = parseJwtPayload(token);
    setUserEmail(typeof payload?.sub === 'string' ? payload.sub : null);
    setUserRole((payload?.role as UserRole) || (token ? 'member' : 'guest'));
  }, [token]);

  const isAdmin = userRole === 'admin' || userRole === 'sysadmin';

  const value = useMemo<AuthState>(() => ({
    token,
    userEmail,
    userRole,
    isAdmin,
    async login(email: string, password: string) {
      const res = await api.login(email, password);
      const t = res?.data?.token as string | undefined;
      if (!t) throw new Error('Kein Token erhalten');
      sessionStorage.setItem(STORAGE_KEY, t);
      setToken(t);
      const payload = parseJwtPayload(t);
      setUserEmail(typeof payload?.sub === 'string' ? payload.sub : null);
      setUserRole((payload?.role as UserRole) || 'member');
    },
    logout() {
      sessionStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setUserEmail(null);
      setUserRole('guest');
    },
  }), [token, userEmail, userRole, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
