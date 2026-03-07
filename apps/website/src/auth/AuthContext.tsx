import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { setUnauthorizedHandler } from '../services/http';

type AuthState = {
  token: string | null;
  userEmail: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = 'moe_auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem(STORAGE_KEY);
    if (t) setToken(t);
    // Install global 401 handler
    setUnauthorizedHandler(() => {
      sessionStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setUserEmail(null);
      try { window.location.assign('/Login'); } catch {}
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  function parseEmailFromJwt(t?: string | null): string | null {
    if (!t) return null;
    try {
      const parts = t.split('.');
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload?.sub === 'string' ? payload.sub : null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    setUserEmail(parseEmailFromJwt(token));
  }, [token]);

  const adminList = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((s: string) => s.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = !!(userEmail && adminList.includes(userEmail.toLowerCase()));

  const value = useMemo<AuthState>(() => ({
    token,
    userEmail,
    isAdmin,
    async login(email: string, password: string) {
      const res = await api.login(email, password);
      const t = res?.data?.token as string | undefined;
      if (!t) throw new Error('Kein Token erhalten');
      sessionStorage.setItem(STORAGE_KEY, t);
      setToken(t);
      setUserEmail(parseEmailFromJwt(t));
    },
    logout() {
      sessionStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setUserEmail(null);
    },
  }), [token, userEmail, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
