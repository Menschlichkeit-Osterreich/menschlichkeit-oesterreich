import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { setUnauthorizedHandler } from '../services/http';
import { secureSet, secureGet, secureRemove } from '../utils/secureStorage';

type UserRole = 'guest' | 'member' | 'moderator' | 'staff' | 'finance' | 'admin' | 'sysadmin';

type AuthState = {
  token: string | null;
  userEmail: string | null;
  userRole: UserRole;
  isAdmin: boolean;
  hasBackofficeAccess: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = 'moe_auth_token';

interface JwtPayload {
  sub?: string;
  role?: UserRole;
  exp?: number;
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

function isTokenExpired(t: string): boolean {
  const payload = parseJwtPayload(t);
  if (!payload?.exp) return false;
  return payload.exp * 1000 < Date.now();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('guest');

  useEffect(() => {
    let expiryTimer: ReturnType<typeof setTimeout> | null = null;

    const doLogout = () => {
      secureRemove(STORAGE_KEY, 'session');
      setToken(null);
      setUserEmail(null);
      setUserRole('guest');
    };

    const initToken = async () => {
      const t = await secureGet(STORAGE_KEY, 'session');

      if (t && !isTokenExpired(t)) {
        setToken(t);
        const payload = parseJwtPayload(t);
        setUserEmail(typeof payload?.sub === 'string' ? payload.sub : null);
        setUserRole((payload?.role as UserRole) || 'member');
        if (payload?.exp) {
          const msUntilExpiry = payload.exp * 1000 - Date.now();
          if (msUntilExpiry > 0) {
            expiryTimer = setTimeout(doLogout, msUntilExpiry);
          }
        }
      } else if (t) {
        // Token abgelaufen — aufräumen
        secureRemove(STORAGE_KEY, 'session');
      }
    };

    initToken();

    setUnauthorizedHandler(() => {
      doLogout();
      try { window.location.assign('/login'); } catch { /* navigation fallback */ }
    });
    return () => {
      setUnauthorizedHandler(null);
      if (expiryTimer) clearTimeout(expiryTimer);
    };
  }, []);

  useEffect(() => {
    const payload = parseJwtPayload(token);
    setUserEmail(typeof payload?.sub === 'string' ? payload.sub : null);
    setUserRole((payload?.role as UserRole) || (token ? 'member' : 'guest'));
  }, [token]);

  const isAdmin = userRole === 'admin' || userRole === 'sysadmin';
  const hasBackofficeAccess =
    userRole === 'staff' ||
    userRole === 'finance' ||
    userRole === 'admin' ||
    userRole === 'sysadmin';

  const value = useMemo<AuthState>(() => ({
    token,
    userEmail,
    userRole,
    isAdmin,
    hasBackofficeAccess,
    async login(email: string, password: string) {
      const res = await api.login(email, password);
      const t = res?.data?.token as string | undefined;
      if (!t) throw new Error('Kein Token erhalten');
      await secureSet(STORAGE_KEY, t, 'session');
      setToken(t);
      const payload = parseJwtPayload(t);
      setUserEmail(typeof payload?.sub === 'string' ? payload.sub : null);
      setUserRole((payload?.role as UserRole) || 'member');
    },
    logout() {
      secureRemove(STORAGE_KEY, 'session');
      setToken(null);
      setUserEmail(null);
      setUserRole('guest');
    },
  }), [token, userEmail, userRole, isAdmin, hasBackofficeAccess]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
