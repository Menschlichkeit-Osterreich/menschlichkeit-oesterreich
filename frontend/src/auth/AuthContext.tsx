import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { setUnauthorizedHandler } from '../services/http';

type AuthState = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = 'moe_auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem(STORAGE_KEY);
    if (t) setToken(t);
    // Install global 401 handler
    setUnauthorizedHandler(() => {
      sessionStorage.removeItem(STORAGE_KEY);
      setToken(null);
      try { window.location.assign('/Login'); } catch {}
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo<AuthState>(() => ({
    token,
    async login(email: string, password: string) {
      const res = await api.login(email, password);
      const t = res?.data?.token as string | undefined;
      if (!t) throw new Error('Kein Token erhalten');
      sessionStorage.setItem(STORAGE_KEY, t);
      setToken(t);
    },
    logout() {
      sessionStorage.removeItem(STORAGE_KEY);
      setToken(null);
    },
  }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
