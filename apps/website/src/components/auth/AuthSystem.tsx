// Authentication & Security System - Sprint 1 Critical Component
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// TypeScript Interfaces
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'moderator' | 'member' | 'guest';
  avatar?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToNewsletter?: boolean;
}

// Mock users for demonstration (Sprint 1 - replace with API)
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@menschlichkeit-oesterreich.at',
    firstName: 'System',
    lastName: 'Admin',
    role: 'admin',
    emailVerified: true,
    twoFactorEnabled: true,
    lastLogin: new Date(),
    createdAt: new Date('2025-01-01'),
  },
  {
    id: '2',
    email: 'moderator@menschlichkeit-oesterreich.at',
    firstName: 'Maria',
    lastName: 'Moderatorin',
    role: 'moderator',
    emailVerified: true,
    twoFactorEnabled: false,
    lastLogin: new Date(),
    createdAt: new Date('2025-02-15'),
  },
  {
    id: '3',
    email: 'member@menschlichkeit-oesterreich.at',
    firstName: 'Max',
    lastName: 'Mustermann',
    role: 'member',
    emailVerified: true,
    twoFactorEnabled: false,
    lastLogin: new Date(),
    createdAt: new Date('2025-03-01'),
  },
];

// Password strength validation
const validatePassword = (password: string) => {
  const requirements = [
    { test: /.{8,}/, message: 'Mindestens 8 Zeichen' },
    { test: /[A-Z]/, message: 'Mindestens ein Großbuchstabe' },
    { test: /[a-z]/, message: 'Mindestens ein Kleinbuchstabe' },
    { test: /\d/, message: 'Mindestens eine Zahl' },
    { test: /[^A-Za-z0-9]/, message: 'Mindestens ein Sonderzeichen' },
  ];

  return requirements.map(req => ({
    ...req,
    passed: req.test.test(password),
  }));
};

// Login Form Component
const LoginForm: React.FC<{
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}> = ({ onLogin, onSwitchToRegister, onForgotPassword }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onLogin(credentials);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'TWO_FACTOR_REQUIRED') {
        setNeedsTwoFactor(true);
      } else {
        setError(error.message || 'Anmeldung fehlgeschlagen');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="card-modern p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
            <i className="bi bi-person-lock text-white text-xl" aria-hidden="true"></i>
          </div>
          <h1 className="text-2xl font-bold text-text">Anmelden</h1>
          <p className="text-muted mt-2">Willkommen zurück! Melden Sie sich in Ihr Konto an.</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2">
              <i className="bi bi-exclamation-triangle text-destructive" aria-hidden="true"></i>
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-text mb-2">
              E-Mail-Adresse *
            </label>
            <input
              type="email"
              id="email"
              className="input w-full"
              placeholder="ihre.email@beispiel.at"
              value={credentials.email}
              onChange={e => setCredentials({ ...credentials, email: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-text mb-2">
              Passwort *
            </label>
            <input
              type="password"
              id="password"
              className="input w-full"
              placeholder="Ihr Passwort"
              value={credentials.password}
              onChange={e => setCredentials({ ...credentials, password: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <AnimatePresence>
            {needsTwoFactor && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label
                  htmlFor="twoFactorCode"
                  className="block text-sm font-semibold text-text mb-2"
                >
                  2FA-Code aus Ihrer Authenticator-App *
                </label>
                <input
                  type="text"
                  id="twoFactorCode"
                  className="input w-full text-center font-mono text-lg"
                  placeholder="000000"
                  maxLength={6}
                  value={credentials.twoFactorCode || ''}
                  onChange={e => setCredentials({ ...credentials, twoFactorCode: e.target.value })}
                  disabled={isLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={credentials.rememberMe}
                onChange={e => setCredentials({ ...credentials, rememberMe: e.target.checked })}
                className="w-4 h-4 text-primary-500 border-border rounded"
                disabled={isLoading}
              />
              <span className="text-sm text-muted">Angemeldet bleiben</span>
            </label>

            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
              disabled={isLoading}
            >
              Passwort vergessen?
            </button>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Anmelden...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right" aria-hidden="true"></i>
                Anmelden
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded-lg">
          <h3 className="text-sm font-semibold text-info mb-2">Demo-Zugangsdaten</h3>
          <div className="text-xs text-muted space-y-1">
            <p>
              <strong>Admin:</strong> admin@menschlichkeit-oesterreich.at / demo123
            </p>
            <p>
              <strong>Moderator:</strong> moderator@menschlichkeit-oesterreich.at / demo123
            </p>
            <p>
              <strong>Mitglied:</strong> member@menschlichkeit-oesterreich.at / demo123
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted">
            Noch kein Konto?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-primary-500 hover:text-primary-600 font-semibold transition-colors"
            >
              Jetzt registrieren
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Registration Form Component
const RegisterForm: React.FC<{
  onRegister: (data: RegisterData) => Promise<void>;
  onSwitchToLogin: () => void;
}> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToNewsletter: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(validatePassword(''));

  useEffect(() => {
    setPasswordStrength(validatePassword(formData.password));
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      setIsLoading(false);
      return;
    }

    if (!passwordStrength.every(req => req.passed)) {
      setError('Passwort erfüllt nicht alle Anforderungen');
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      setError('Sie müssen den AGB und Datenschutzerklärung zustimmen');
      setIsLoading(false);
      return;
    }

    try {
      await onRegister(formData);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Registrierung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="card-modern p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
            <i className="bi bi-person-plus text-white text-xl" aria-hidden="true"></i>
          </div>
          <h1 className="text-2xl font-bold text-text">Registrieren</h1>
          <p className="text-muted mt-2">
            Erstellen Sie Ihr Konto und werden Sie Teil der Bewegung.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2">
              <i className="bi bi-exclamation-triangle text-destructive" aria-hidden="true"></i>
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-text mb-2">
                Vorname *
              </label>
              <input
                type="text"
                id="firstName"
                className="input w-full"
                placeholder="Max"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-text mb-2">
                Nachname *
              </label>
              <input
                type="text"
                id="lastName"
                className="input w-full"
                placeholder="Mustermann"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="registerEmail" className="block text-sm font-semibold text-text mb-2">
              E-Mail-Adresse *
            </label>
            <input
              type="email"
              id="registerEmail"
              className="input w-full"
              placeholder="max.mustermann@beispiel.at"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="registerPassword"
              className="block text-sm font-semibold text-text mb-2"
            >
              Passwort *
            </label>
            <input
              type="password"
              id="registerPassword"
              className="input w-full"
              placeholder="Sicheres Passwort wählen"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
            />

            {formData.password && (
              <div className="mt-2 space-y-1">
                {passwordStrength.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <i
                      className={`bi ${req.passed ? 'bi-check-circle text-success' : 'bi-x-circle text-muted'}`}
                    ></i>
                    <span className={req.passed ? 'text-success' : 'text-muted'}>
                      {req.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text mb-2">
              Passwort bestätigen *
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="input w-full"
              placeholder="Passwort wiederholen"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={isLoading}
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-destructive mt-1">Passwörter stimmen nicht überein</p>
            )}
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={e => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="w-4 h-4 text-primary-500 border-border rounded mt-0.5"
                disabled={isLoading}
                required
              />
              <span className="text-sm text-text">
                Ich stimme den{' '}
                <a href="/agb" target="_blank" className="text-primary-500 hover:underline">
                  Allgemeinen Geschäftsbedingungen
                </a>{' '}
                zu. *
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.agreeToPrivacy}
                onChange={e => setFormData({ ...formData, agreeToPrivacy: e.target.checked })}
                className="w-4 h-4 text-primary-500 border-border rounded mt-0.5"
                disabled={isLoading}
                required
              />
              <span className="text-sm text-text">
                Ich habe die{' '}
                <a href="/datenschutz" target="_blank" className="text-primary-500 hover:underline">
                  Datenschutzerklärung
                </a>{' '}
                gelesen und stimme der Verarbeitung meiner Daten zu. *
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.agreeToNewsletter}
                onChange={e => setFormData({ ...formData, agreeToNewsletter: e.target.checked })}
                className="w-4 h-4 text-primary-500 border-border rounded mt-0.5"
                disabled={isLoading}
              />
              <span className="text-sm text-text">
                Ich möchte den Newsletter mit Informationen über Vereinsaktivitäten erhalten.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading || !formData.agreeToTerms || !formData.agreeToPrivacy}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Registrierung...
              </>
            ) : (
              <>
                <i className="bi bi-person-check" aria-hidden="true"></i>
                Konto erstellen
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted">
            Bereits ein Konto?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-primary-500 hover:text-primary-600 font-semibold transition-colors"
            >
              Anmelden
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Main Authentication System Component
export const AuthSystem: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password' | 'verify-email'>(
    initialMode
  );
  // Auth state management - ready for production implementation
  // const [authState, setAuthState] = useState<AuthState>({ ... }); - Will be used in Sprint 2

  // Mock authentication functions (replace with API calls in Sprint 2)
  const mockLogin = async (credentials: LoginCredentials): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

    const user = MOCK_USERS.find(u => u.email === credentials.email);
    if (!user || credentials.password !== 'demo123') {
      throw new Error('Ungültige Anmeldedaten');
    }

    if (user.twoFactorEnabled && !credentials.twoFactorCode) {
      throw new Error('TWO_FACTOR_REQUIRED');
    }

    if (user.twoFactorEnabled && credentials.twoFactorCode !== '123456') {
      throw new Error('Ungültiger 2FA-Code');
    }

    // In production, update global auth state here
    console.log('User authenticated:', user.email);

    onClose();
  };

  const mockRegister = async (data: RegisterData): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

    // Check if email already exists
    if (MOCK_USERS.find(u => u.email === data.email)) {
      throw new Error('E-Mail-Adresse bereits registriert');
    }

    // Create new user (will be handled by API in production)
    console.log('Creating user:', {
      id: Date.now().toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'member',
      emailVerified: false,
      twoFactorEnabled: false,
      createdAt: new Date(),
    });

    setMode('verify-email');
  };

  const handleForgotPassword = () => {
    setMode('forgot-password');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Schließen"
          >
            <i className="bi bi-x text-lg"></i>
          </button>

          {mode === 'login' && (
            <LoginForm
              onLogin={mockLogin}
              onSwitchToRegister={() => setMode('register')}
              onForgotPassword={handleForgotPassword}
            />
          )}

          {mode === 'register' && (
            <RegisterForm onRegister={mockRegister} onSwitchToLogin={() => setMode('login')} />
          )}

          {mode === 'verify-email' && (
            <div className="card-modern p-8 text-center">
              <div className="w-12 h-12 bg-success rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="bi bi-envelope-check text-white text-xl"></i>
              </div>
              <h2 className="text-xl font-bold text-text mb-4">E-Mail bestätigen</h2>
              <p className="text-muted mb-6">
                Wir haben Ihnen eine E-Mail mit einem Bestätigungslink gesendet. Klicken Sie auf den
                Link, um Ihr Konto zu aktivieren.
              </p>
              <button onClick={() => setMode('login')} className="btn btn-primary">
                Zur Anmeldung
              </button>
            </div>
          )}

          {mode === 'forgot-password' && (
            <div className="card-modern p-8 text-center">
              <div className="w-12 h-12 bg-warning rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="bi bi-key text-white text-xl"></i>
              </div>
              <h2 className="text-xl font-bold text-text mb-4">Passwort zurücksetzen</h2>
              <p className="text-muted mb-6">
                Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen
                Ihres Passworts.
              </p>

              <div className="space-y-4">
                <input type="email" className="input w-full" placeholder="Ihre E-Mail-Adresse" />
                <button className="btn btn-primary w-full">Reset-Link senden</button>
                <button onClick={() => setMode('login')} className="btn btn-ghost w-full">
                  Zurück zur Anmeldung
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Export auth state and functions for use in other components
export const useAuth = () => {
  // This would be implemented with Context API or state management in Sprint 2
  return {
    user: null,
    isAuthenticated: false,
    login: (_credentials: LoginCredentials) => Promise.resolve(),
    logout: () => Promise.resolve(),
    register: (_data: RegisterData) => Promise.resolve(),
  };
};
