# Frontend – React + TypeScript

> **React-basierte Frontend-Anwendung mit Design Token Integration**

**URL (Production)**: `https://menschlichkeit-oesterreich.at`  
**URL (Development)**: `http://localhost:3000`

---

## 🎯 Übersicht

Das Frontend ist eine moderne **React + TypeScript**-Anwendung mit:

- **Design System Integration** (committed Design Tokens → CSS Variables)
- **Rot-Weiß-Rot Corporate Identity** (Österreich NGO Branding)
- **WCAG AA Accessibility** (Barrierefreiheit)
- **API Integration** (FastAPI Backend)
- **Responsive Design** (Mobile-First)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (empfohlen: v20 LTS)
- **npm** 9+

### Installation

```bash
# In Frontend-Verzeichnis wechseln
cd frontend

# Dependencies installieren
npm install

# Environment konfigurieren
cp ../.config-templates/.env.frontend.development .env
# .env anpassen: VITE_API_BASE_URL, etc.

# Development Server starten
npm run dev
```

**Frontend verfügbar unter**: <http://localhost:3000>

---

## 📁 Projektstruktur

```
frontend/
├── src/
│   ├── components/             # React Components
│   │   ├── common/             # Shared Components (Button, Input, etc.)
│   │   ├── layout/             # Layout Components (Header, Footer, Sidebar)
│   │   └── features/           # Feature-specific Components
│   ├── pages/                  # Route Components (Home, About, Contact)
│   ├── services/               # API Client & HTTP Wrapper
│   │   ├── api.ts              # Axios Instance
│   │   ├── auth.service.ts     # Authentication API Calls
│   │   └── user.service.ts     # User API Calls
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.ts          # Authentication Hook
│   │   └── useFetch.ts         # Data Fetching Hook
│   ├── store/                  # State Management (Zustand/Redux)
│   │   ├── authStore.ts        # Auth State
│   │   └── userStore.ts        # User State
│   ├── styles/                 # Global Styles & Design Tokens
│   │   ├── global.css          # Global CSS
│   │   ├── tokens.css          # Design Tokens (auto-generated from Figma)
│   │   └── tailwind.css        # Tailwind Imports
│   ├── utils/                  # Utility Functions
│   │   ├── validators.ts       # Form Validation
│   │   └── formatters.ts       # Data Formatting
│   ├── types/                  # TypeScript Types
│   │   ├── api.types.ts        # API Response Types
│   │   └── user.types.ts       # User Types
│   ├── App.tsx                 # Main App Component
│   ├── main.tsx                # Entry Point
│   └── router.tsx              # React Router Setup
├── public/                     # Static Assets
│   ├── favicon.ico
│   └── assets/                 # Images, Fonts
├── tests/                      # Unit & Integration Tests
│   └── components/
│       └── Button.test.tsx
├── playwright-tests/           # E2E Tests (Playwright)
├── vite.config.ts              # Vite Configuration
├── tsconfig.json               # TypeScript Config
├── tailwind.config.js          # Tailwind CSS Config (with Design Tokens)
├── package.json
└── README.md                   # This file
```

---

## 🎨 Design System Integration

Das Frontend verwendet **committed Design Tokens** aus `figma-design-system/00_design-tokens.json`.
Ein Live-Figma-Zugang ist für Build, CI und Deploy nicht erforderlich.

### Design Token Workflow

```bash
# 1. CSS Variables werden aus committed Tokens generiert:
# figma-design-system/00_design-tokens.json → src/styles/tokens.css

# 2. Tailwind Config konsumiert Design Tokens
# tailwind.config.js verwendet tokens.css für Farben/Schriften
```

### Verwendung in Components

```tsx
// Tailwind Classes (konsumieren Design Tokens)
<Button className="bg-primary-red text-white hover:bg-primary-red-dark">
  Klicken
</Button>

// CSS Variables (direkt)
<div style={{ color: 'var(--color-primary-red)' }}>
  Rot-Weiß-Rot
</div>
```

**Design Tokens Dokumentation**: [../figma-design-system/FIGMA-SYNC-GUIDE.md](../figma-design-system/FIGMA-SYNC-GUIDE.md)
Die Pflege des Token-JSON ist ein optionaler Redaktion-/Design-Prozess außerhalb des Pflichtpfads.

---

## 🔌 API Integration

### HTTP Client Konfiguration

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (JWT Token)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Beispiel: Authentication Hook

```typescript
// src/hooks/useAuth.ts
import { useState } from 'react';
import { login, logout } from '@/services/auth.service';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { token, user } = await login(email, password);
      localStorage.setItem('access_token', token);
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, handleLogin };
};
```

---

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Unit Tests ausführen
npm run test

# Mit Coverage
npm run test:coverage

# Watch Mode
npm run test:watch
```

### E2E Tests (Playwright)

```bash
# E2E Tests ausführen (von Root-Verzeichnis)
npm run test:e2e

# Playwright UI Mode
npx playwright test --ui

# Spezifische Tests
npx playwright test tests/login.spec.ts
```

**Coverage Ziel**: ≥70%

---

## 🏗️ Build & Deployment

### Production Build

```bash
# Build erstellen
npm run build

# Preview (lokal testen)
npm run preview
```

### Plesk Deployment

```bash
# Von Root-Verzeichnis
./scripts/safe-deploy.sh --service frontend

# Build-Output wird nach Plesk kopiert:
# frontend/dist/ → /var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs/
```

### Environment Variables (Production)

```bash
# .env.production (auf Build-Server)
VITE_API_BASE_URL=https://api.menschlichkeit-oesterreich.at
VITE_ENVIRONMENT=production
```

**Deployment-Dokumentation**: [DEPLOYMENT-READY.md](DEPLOYMENT-READY.md)

---

## ♿ Accessibility (WCAG AA)

Das Frontend erfüllt **WCAG 2.1 Level AA**:

- ✅ **Keyboard Navigation** (alle Interaktionen mit Tab/Enter)
- ✅ **Screen Reader Support** (ARIA Labels)
- ✅ **Color Contrast** (mindestens 4.5:1 für Text)
- ✅ **Focus Indicators** (sichtbare Focus-States)
- ✅ **Semantic HTML** (korrekte HTML5-Tags)

### Accessibility Testing

```bash
# Lighthouse Audit (A11y Score)
npm run lighthouse  # Von Root-Verzeichnis

# axe-core (Browser Extension)
# Install: https://www.deque.com/axe/browser-extensions/
```

**Accessibility Blueprint**: [../docs/legal/WCAG-AA-COMPLIANCE-BLUEPRINT.md](../docs/legal/WCAG-AA-COMPLIANCE-BLUEPRINT.md)

---

## 📊 Performance

### Performance Ziele

- **Lighthouse Performance**: ≥90
- **First Contentful Paint (FCP)**: <3s (Mobile)
- **Largest Contentful Paint (LCP)**: <2.5s
- **Time to Interactive (TTI)**: <5s

### Performance Optimierungen

✅ **Code Splitting** (React.lazy + Suspense)  
✅ **Image Optimization** (WebP, Lazy Loading)  
✅ **Bundle Size Reduction** (Tree Shaking, Minification)  
✅ **Caching Strategy** (Service Worker, Cache-Control Headers)

```bash
# Bundle Size analysieren
npm run build
npx vite-bundle-analyzer
```

---

## 🔒 Security

### CSP (Content Security Policy)

```html
<!-- index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
/>
```

### XSS Prevention

- ✅ **React Default Escaping** (automatisch)
- ✅ **DOMPurify** für `dangerouslySetInnerHTML` (falls nötig)
- ✅ **Input Validation** (Frontend + Backend)

---

## 🤝 Contributing

Siehe [../.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md)

**Code Style**: ESLint + Prettier (automatisch formatiert)

```bash
# Linting
npm run lint

# Linting + Auto-Fix
npm run lint:fix

# Formatting
npm run format
```

---

## 📖 Weitere Dokumentation

- **Design System**: [../figma-design-system/FIGMA-README.md](../figma-design-system/FIGMA-README.md)
- **API Integration**: [../api.menschlichkeit-oesterreich.at/README.md](../api.menschlichkeit-oesterreich.at/README.md)
- **Deployment**: [DEPLOYMENT-READY.md](DEPLOYMENT-READY.md)
- **DOCS-INDEX**: [../DOCS-INDEX.md](../DOCS-INDEX.md)

---

## 📜 Lizenz

MIT License – Siehe [../LICENSE](../LICENSE)
