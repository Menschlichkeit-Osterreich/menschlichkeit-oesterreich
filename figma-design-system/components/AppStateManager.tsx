import React, { useState, createContext, useContext } from 'react';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'member' | 'moderator' | 'admin';
  membershipType: string;
  memberSince: string;
  verified: boolean;
  twoFactorEnabled: boolean;
}

export interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  currentModal: 'auth' | 'profile' | 'security' | 'privacy' | 'sepa' | null;
  authMode: 'login' | 'register' | 'reset' | '2fa';
  loading: boolean;
  error: string | null;
}

interface AppContextType {
  state: AppState;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  openModal: (modal: AppState['currentModal'], authMode?: AppState['authMode']) => void;
  closeModal: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}

interface AppStateProviderProps {
  children: React.ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, setState] = useState<AppState>({
    isAuthenticated: false,
    user: null,
    currentModal: null,
    authMode: 'login',
    loading: false,
    error: null
  });

  // Mock users for demonstration
  const mockUsers: Record<string, User> = {
    'admin@menschlichkeit-oesterreich.at': {
      id: '1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@menschlichkeit-oesterreich.at',
      role: 'admin',
      membershipType: 'Gründer',
      memberSince: '2024-01-01',
      verified: true,
      twoFactorEnabled: true
    },
    'moderator@menschlichkeit-oesterreich.at': {
      id: '2',
      firstName: 'Moderator',
      lastName: 'User',
      email: 'moderator@menschlichkeit-oesterreich.at',
      role: 'moderator',
      membershipType: 'Premium',
      memberSince: '2024-02-01',
      verified: true,
      twoFactorEnabled: false
    },
    'member@menschlichkeit-oesterreich.at': {
      id: '3',
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'member@menschlichkeit-oesterreich.at',
      role: 'member',
      membershipType: 'Standard',
      memberSince: '2024-03-01',
      verified: true,
      twoFactorEnabled: false
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const user = mockUsers[credentials.email];
      if (user && credentials.password === 'demo123') {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user,
          currentModal: null,
          loading: false
        }));
        
        // Save to localStorage for persistence
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        throw new Error('Ungültige Anmeldedaten');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen'
      }));
    }
  };

  const logout = () => {
    setState({
      isAuthenticated: false,
      user: null,
      currentModal: null,
      authMode: 'login',
      loading: false,
      error: null
    });
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  };

  const openModal = (modal: AppState['currentModal'], authMode: AppState['authMode'] = 'login') => {
    setState(prev => ({
      ...prev,
      currentModal: modal,
      authMode,
      error: null
    }));
  };

  const closeModal = () => {
    setState(prev => ({
      ...prev,
      currentModal: null,
      error: null
    }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  // Initialize from localStorage on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedAuth = localStorage.getItem('isAuthenticated');
    
    if (savedUser && savedAuth === 'true') {
      try {
        const user = JSON.parse(savedUser);
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user
        }));
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
    }
  }, []);

  const contextValue: AppContextType = {
    state,
    login,
    logout,
    openModal,
    closeModal,
    setError,
    setLoading
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}