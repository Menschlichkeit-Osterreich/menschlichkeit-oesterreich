# Frontend-Verbesserungen für Menschlichkeit Österreich

## 1. State Management Refactoring

### Ziel
Einführung eines modernen State Management Systems (Zustand) zur Verbesserung der Wartbarkeit und des Datenflusses.

### Implementierung

#### 1.1 Zustand Store für Authentifizierung
```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(email, password);
          set({
            user: response.data?.user || null,
            token: response.data?.token || null,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },
      logout: () => set({ user: null, token: null, error: null }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
```

#### 1.2 Zustand Store für Mitglieder-Metriken
```typescript
// src/stores/metricsStore.ts
import { create } from 'zustand';

interface MetricsState {
  members: {
    total: number;
    active: number;
    pending: number;
    expired: number;
    new_30d: number;
    new_90d: number;
    churn_30d: number;
  } | null;
  finance: {
    donations_mtd: number;
    donations_ytd: number;
    avg_donation: number;
    recurring_count: number;
    open_invoices: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  fetchMetrics: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  members: null,
  finance: null,
  isLoading: false,
  error: null,
  fetchMetrics: async () => {
    set({ isLoading: true, error: null });
    try {
      const [membersRes, financeRes] = await Promise.all([
        apiClient.get('/metrics/members'),
        apiClient.get('/metrics/finance'),
      ]);
      set({
        members: membersRes.data,
        finance: financeRes.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch metrics',
        isLoading: false,
      });
    }
  },
  setError: (error) => set({ error }),
}));
```

## 2. Fehlerbehandlung und UX-Verbesserungen

### 2.1 Globale Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-800 mb-4">
              Ein Fehler ist aufgetreten
            </h1>
            <p className="text-red-600 mb-6">
              {this.state.error?.message || 'Unbekannter Fehler'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Seite neu laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2.2 Verbesserte Toast-Benachrichtigungen
```typescript
// src/components/Toast.tsx
import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[type];

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded shadow-lg animate-slide-in-right`}
      role="alert"
    >
      {message}
    </div>
  );
};
```

## 3. Barrierefreiheit (Accessibility) Verbesserungen

### 3.1 Verbesserter Button mit ARIA-Attributen
```typescript
// src/components/ui/AccessibleButton.tsx
import React from 'react';

interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  ariaLabel?: string;
}

export const AccessibleButton = React.forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      ariaLabel,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-400',
      secondary:
        'border border-secondary-300 bg-white text-secondary-800 hover:bg-secondary-100 focus:ring-secondary-300',
      danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-400',
    };
    const sizeClasses = {
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-busy={loading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
          (disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        {...props}
      >
        {loading && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';
```

### 3.2 Verbessertes Form Input mit Label und Fehlerbehandlung
```typescript
// src/components/ui/FormInput.tsx
import React from 'react';

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, required, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random()}`;

    return (
      <div className="mb-4">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-secondary-900 mb-1"
        >
          {label}
          {required && <span className="text-error-600 ml-1">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            error
              ? 'border-error-500 bg-error-50'
              : 'border-secondary-300 bg-white'
          }`}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-error-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-secondary-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
```

## 4. Performance-Optimierungen

### 4.1 Code-Splitting für Lazy Loading
```typescript
// src/pages/index.ts
import { lazy } from 'react';

export const Home = lazy(() => import('./Home'));
export const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
export const MemberDashboard = lazy(() => import('./MemberDashboard'));
export const BoardTreasurerDashboard = lazy(() =>
  import('./BoardTreasurerDashboard')
);
```

### 4.2 Memoization für Performance
```typescript
// src/components/KpiCard.tsx
import React, { memo } from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  loading?: boolean;
  variant?: 'default' | 'warning' | 'error' | 'success';
}

export const KpiCard = memo<KpiCardProps>(
  ({ title, value, loading = false, variant = 'default' }) => {
    const variantClasses = {
      default: 'bg-white border-secondary-200',
      warning: 'bg-yellow-50 border-yellow-200',
      error: 'bg-red-50 border-red-200',
      success: 'bg-green-50 border-green-200',
    };

    return (
      <div className={`rounded-lg border p-6 ${variantClasses[variant]}`}>
        <h3 className="text-sm font-medium text-secondary-600">{title}</h3>
        {loading ? (
          <div className="mt-2 h-8 w-20 animate-pulse rounded bg-secondary-200" />
        ) : (
          <p className="mt-2 text-3xl font-bold text-secondary-900">{value}</p>
        )}
      </div>
    );
  }
);

KpiCard.displayName = 'KpiCard';
```

## 5. Testing-Infrastruktur

### 5.1 Setup für React Testing Library
```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 5.2 Beispiel-Unit-Test
```typescript
// src/components/__tests__/AccessibleButton.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibleButton } from '../ui/AccessibleButton';

describe('AccessibleButton', () => {
  it('renders with correct label', () => {
    render(<AccessibleButton>Click me</AccessibleButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<AccessibleButton onClick={handleClick}>Click me</AccessibleButton>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when loading', () => {
    render(<AccessibleButton loading>Loading</AccessibleButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('has correct aria attributes', () => {
    render(<AccessibleButton ariaLabel="Custom label">Button</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom label');
  });
});
```

## 6. Implementierungs-Checkliste

- [ ] Zustand installieren: `npm install zustand`
- [ ] Auth Store implementieren
- [ ] Metrics Store implementieren
- [ ] Error Boundary komponente erstellen
- [ ] Toast-System implementieren
- [ ] Accessible Button komponente erstellen
- [ ] FormInput komponente erstellen
- [ ] Code-Splitting in App.tsx implementieren
- [ ] Memoization für Performance-kritische Komponenten hinzufügen
- [ ] React Testing Library und Jest konfigurieren
- [ ] Unit-Tests für Komponenten schreiben
- [ ] E2E-Tests mit Cypress/Playwright einrichten
- [ ] Lighthouse-Audit durchführen
- [ ] WCAG-Konformität überprüfen
