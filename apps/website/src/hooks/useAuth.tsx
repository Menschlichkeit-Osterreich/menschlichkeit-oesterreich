import React, { useCallback, useContext, createContext, useState, useEffect } from 'react';
import { authService } from '../services/api/auth';
import type { User, LoginCredentials, RegisterData } from '../services/api/auth';
import { useApi, useMutation } from './useApi';

// Auth Context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const success = await authService.initializeFromToken();
        if (success) {
          setUser(authService.getCurrentUser());
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Login fehlgeschlagen');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      if (!response.success) {
        throw new Error(response.error || 'Registrierung fehlgeschlagen');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const success = await authService.refreshToken();
      if (success) {
        setUser(authService.getCurrentUser());
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('User refresh failed:', error);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Auth Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth muss innerhalb eines AuthProviders verwendet werden');
  }
  return context;
}

// Specific Auth Hooks
export function useLogin() {
  return useMutation(authService.login);
}

export function useRegister() {
  return useMutation(authService.register);
}

export function usePasswordReset() {
  return useMutation(authService.requestPasswordReset);
}

export function useChangePassword() {
  return useMutation(authService.changePassword);
}

export function useEmailVerification() {
  return useMutation(authService.verifyEmail);
}

export function useResendVerification() {
  return useMutation(authService.resendVerificationEmail);
}

// Two-Factor Authentication Hooks
export function useTwoFactorSetup() {
  return useApi(() => authService.setupTwoFactor());
}

export function useEnableTwoFactor() {
  return useMutation(authService.enableTwoFactor);
}

export function useDisableTwoFactor() {
  return useMutation(authService.disableTwoFactor);
}

export function useVerifyTwoFactor() {
  return useMutation(authService.verifyTwoFactor);
}

// Session Management Hooks
export function useSessions() {
  return useApi(() => authService.getSessions(), true);
}

export function useRevokeSession() {
  return useMutation(authService.revokeSession);
}

export function useRevokeAllSessions() {
  return useMutation(() => authService.revokeAllSessions());
}

// Profile Management Hooks
export function useUpdateProfile() {
  const { refreshUser } = useAuth();
  
  return useMutation(async (data: Parameters<typeof authService.updateProfile>[0]) => {
    const result = await authService.updateProfile(data);
    if (result.success) {
      await refreshUser();
    }
    return result;
  });
}

export function useDeleteAccount() {
  const { logout } = useAuth();
  
  return useMutation(async (password: string) => {
    const result = await authService.deleteAccount(password);
    if (result.success) {
      await logout();
    }
    return result;
  });
}

// Security Logs Hook
export function useSecurityLogs() {
  return useApi(() => authService.getSecurityLogs(), true);
}

// Role-based Hooks
export function usePermissions() {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'admin' || user?.role === 'moderator',
    isMember: !!user,
    hasRole: (role: User['role']) => user?.role === role,
    canAccess: (requiredRole: User['role']) => {
      if (!user) return false;
      if (requiredRole === 'member') return true;
      if (requiredRole === 'moderator') return user.role === 'admin' || user.role === 'moderator';
      if (requiredRole === 'admin') return user.role === 'admin';
      return false;
    },
  };
}

// Protected Route Hook
export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);
  
  return { isAuthenticated, isLoading };
}

// Auth Status Hook (for components that need to know auth state)
export function useAuthStatus() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    isEmailVerified: user?.isEmailVerified ?? false,
    isTwoFactorEnabled: user?.twoFactorEnabled ?? false,
    userRole: user?.role,
    lastLoginAt: user?.lastLoginAt,
  };
}