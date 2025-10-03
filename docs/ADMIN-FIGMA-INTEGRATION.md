# Admin-Backend ↔ Figma Design System Integration

**Ziel**: Vollständige Design-Token-Integration für das Next.js Admin-Portal mit Multi-Org Branding

**Stand**: 2025-10-03  
**Bezugsdokumente**:

- `admin_backend_architektur_umsetzungsplan_ngo_eu_dsgvo.md` (Admin-Backend Architektur)
- `figma-design-system/00_design-tokens.json` (Design Tokens, 228 Zeilen)
- `figma-design-system/BRAND-GUIDELINES.md` (Österreichische Farben)

---

## 🎨 Design System Übersicht

### Verfügbare Design Tokens

✅ **Bereits vorhanden** (`00_design-tokens.json`):

- **Farben**: Primary (Blau), Secondary (Grau), Accent (Pink), Success, Warning, Error
- **Semantic Colors**: Background, Surface, Overlay, Text (Primary/Secondary/Inverse), Border
- **Typography**: Inter (Primary), Merriweather (Secondary), JetBrains Mono
- **Font Sizes**: xs (0.75rem) → 4xl (2.25rem)
- **Spacing**: 1 (0.25rem) → 32 (8rem)
- **Border Radius**: sm (0.125rem) → full (9999px)
- **Shadows**: sm, md, lg, xl, 2xl
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)

### Österreichische Farben (Brand)

Aus `BRAND-GUIDELINES.md`:

```css
--brand-red: #ed1c24; /* Rot-Weiß-Rot Primär */
--brand-white: #ffffff; /* Österreich Weiß */
--brand-black: #000000; /* Text/Kontrast */
--accent-gold: #c5a572; /* Akzent (optional) */
```

---

## 🏗️ Admin Portal Architektur (aus Backend-Dokument)

### UI-Struktur (Next.js)

```
┌─────────────────────────────────────────────┐
│  Topbar: Suche | Org-Switcher | User Menu  │
├──────────┬──────────────────────────────────┤
│          │  Dashboard Widgets               │
│ Sidebar  │  ┌──────────┬──────────┐        │
│          │  │ CI Status│ Flags    │        │
│ - Home   │  └──────────┴──────────┘        │
│ - Mitgl. │  ┌──────────┬──────────┐        │
│ - Beitr. │  │ Members  │ Dues     │        │
│ - Forum  │  └──────────┴──────────┘        │
│ - CI     │                                  │
│ - Conten │  Hauptbereich (Data Grid/Forms) │
│ - News   │                                  │
│ - Auto   │                                  │
│ - Logs   │                                  │
│ - Abst.  │                                  │
└──────────┴──────────────────────────────────┘
```

### Komponenten-Mapping

| Admin-Komponente    | Design Token Kategorie             | Figma MCP Einsatz          |
| ------------------- | ---------------------------------- | -------------------------- |
| **Topbar**          | `semantic.surface`, `spacing.4`    | get_code(nodeId="topbar")  |
| **Sidebar**         | `colors.secondary`, `shadows.md`   | get_code(nodeId="sidebar") |
| **Widget Cards**    | `borderRadius.lg`, `spacing.6`     | get_code(nodeId="card")    |
| **Data Grid**       | `typography`, `colors.border`      | Table Komponente           |
| **Forms/Inputs**    | `colors.border-focus`, `spacing.3` | Form System                |
| **Buttons**         | `colors.primary`, `shadows.sm`     | Button Variants            |
| **Badges (Status)** | `colors.success/warning/error`     | Badge Komponente           |
| **Modals**          | `colors.overlay`, `shadows.2xl`    | Modal/Dialog               |

---

## 🎭 Multi-Org Branding (Mandantenfähigkeit)

### Datenmodell-Erweiterung

**Directus Collection: `theme`**

```typescript
interface OrgTheme {
  id: UUID;
  org_id: UUID;
  name: string; // "Menschlichkeit Österreich", "AG Bildung Wien"

  // Design Tokens Override
  colors: {
    primary: string; // Hex, z.B. "#ED1C24"
    secondary: string;
    accent: string;
  };
  logo_url: string; // CDN URL
  favicon_url: string;

  // DSGVO/Legal
  privacy_policy_url: string;
  imprint_url: string;
  consent_banner_text: string;

  // Feature Toggles (pro Org)
  features: {
    voting_enabled: boolean;
    forum_enabled: boolean;
    newsletter_enabled: boolean;
  };

  created_at: DateTime;
  updated_at: DateTime;
}
```

### CSS Custom Properties Runtime Injection

**Next.js Layout (Dynamic Theming):**

```tsx
// app/layout.tsx
import { getOrgTheme } from '@/lib/directus';

export default async function RootLayout({ children }) {
  const orgId = await getCurrentOrgId(); // From JWT/Session
  const theme = await getOrgTheme(orgId);

  return (
    <html lang="de">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            :root {
              --brand-primary: ${theme.colors.primary};
              --brand-secondary: ${theme.colors.secondary};
              --brand-accent: ${theme.colors.accent};
              --logo-url: url(${theme.logo_url});
            }
          `,
          }}
        />
      </head>
      <body className="font-primary">
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

**Tailwind Config Extension:**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Statische Tokens (Fallback)
        'brand-primary': 'var(--brand-primary, #ED1C24)',
        'brand-secondary': 'var(--brand-secondary, #FFFFFF)',
        'brand-accent': 'var(--brand-accent, #C5A572)',

        // Design System Tokens (aus JSON)
        ...require('./figma-design-system/00_design-tokens.json').designTokens
          .colors,
      },
      spacing: require('./figma-design-system/00_design-tokens.json')
        .designTokens.spacing,
      borderRadius: require('./figma-design-system/00_design-tokens.json')
        .designTokens.borderRadius,
      fontFamily: require('./figma-design-system/00_design-tokens.json')
        .designTokens.typography.fontFamily,
    },
  },
};
```

---

## 📦 Admin Portal Component Library

### Widget Card (Basis-Komponente)

**Figma MCP Workflow:**

1. Designer erstellt Widget-Card in Figma
2. Agent nutzt `mcp_figma_get_code(nodeId="widget-card", fileKey="...")`
3. Code wird generiert mit Design Tokens
4. Agent passt für Multi-Org Branding an

**Generierter Code (Beispiel):**

```tsx
// components/widgets/WidgetCard.tsx
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WidgetCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function WidgetCard({
  title,
  value,
  icon,
  trend,
  variant = 'default',
}: WidgetCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-success-500 bg-success-50',
    warning: 'border-warning-500 bg-warning-50',
    error: 'border-error-500 bg-error-50',
  };

  return (
    <Card
      className={cn(
        'p-6 border-2 rounded-lg shadow-md',
        variantStyles[variant]
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        {icon}
      </div>
      <div className="text-3xl font-bold text-text-primary">{value}</div>
      {trend && (
        <div className="mt-2 text-sm">
          <span
            className={trend.value > 0 ? 'text-success-600' : 'text-error-600'}
          >
            {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-text-secondary ml-2">{trend.label}</span>
        </div>
      )}
    </Card>
  );
}
```

**Usage:**

```tsx
<WidgetCard
  title="Offene Flags"
  value={12}
  icon={<FlagIcon className="w-6 h-6 text-warning-500" />}
  trend={{ value: -25, label: 'vs. letzte Woche' }}
  variant="warning"
/>
```

---

## 🔄 Figma MCP Integration Workflow

### 1. Design in Figma → Code Generation

**GitHub Copilot Prompt:**

```typescript
// Aufgabe: Generiere Dashboard Widget aus Figma
// - Nutze mcp_figma_get_code für nodeId="dashboard-widget"
// - Wende Design Tokens aus 00_design-tokens.json an
// - Implementiere Multi-Org Branding (CSS Variables)
// - TypeScript + Tailwind CSS
// - Accessibility: WCAG AA, Keyboard Navigation
```

**Agent-Ausführung:**

```typescript
// 1. Figma Code holen
const figmaCode = await mcp_figma_get_code({
  nodeId: '123:456',
  fileKey: 'abc123xyz',
  clientLanguages: 'typescript',
  clientFrameworks: 'react',
});

// 2. Design Tokens anwenden
const tokens = require('./figma-design-system/00_design-tokens.json');

// 3. Code generieren mit Token-Integration
// 4. Multi-Org CSS Variables einbauen
// 5. A11y Attribute hinzufügen
```

### 2. Automatisches Token Sync

**GitHub Actions Workflow:**

```yaml
# .github/workflows/figma-sync.yml
name: Figma Design Token Sync

on:
  schedule:
    - cron: '0 2 * * 1' # Montags 2 Uhr
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Sync Figma Tokens
        run: |
          npm run figma:sync
          npm run figma:validate

      - name: Generate Admin Portal CSS
        run: |
          node scripts/generate-admin-theme.js

      - name: Commit Changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add figma-design-system/
          git commit -m "chore(design): Sync Figma tokens [skip ci]" || true
          git push
```

---

## 🎯 Komponenten-Roadmap

### Phase 1: Core Components (W1-W2)

- [x] Design Tokens JSON (bereits vorhanden)
- [x] Discourse Theme CSS (bereits vorhanden)
- [ ] **Admin Portal Base Layout** (Sidebar + Topbar + Main)
- [ ] **Widget Card** (mit Variants)
- [ ] **Data Table** (Pagination, Sorting, Filtering)
- [ ] **Form System** (Input, Select, Checkbox, Radio)
- [ ] **Button Variants** (Primary, Secondary, Danger, Ghost)

### Phase 2: Dashboard Widgets (W3-W4)

- [ ] **CI Status Widget** (GitHub GraphQL Integration)
- [ ] **Forum Flags Widget** (Discourse API)
- [ ] **Members Overview** (Directus SDK)
- [ ] **Dues Status** (Pending Payments)
- [ ] **Newsletter Stats** (Listmonk API)

### Phase 3: Advanced Components (W5-W6)

- [ ] **Org Switcher** (Dropdown mit Logo)
- [ ] **Theme Editor** (Live Preview)
- [ ] **Permission Matrix** (RBAC Visualisierung)
- [ ] **Audit Log Viewer** (Timeline)
- [ ] **n8n Flow Trigger** (Webhooks)

---

## 🔐 OIDC + RBAC Integration

### Keycloak Theme (Figma Tokens)

**Login Page Custom CSS:**

```css
/* keycloak-theme/login/resources/css/custom.css */
@import url('/figma-design-tokens.css');

:root {
  --kc-primary: var(--brand-primary, #ed1c24);
  --kc-background: var(--semantic-background);
  --kc-text: var(--semantic-text-primary);
}

.login-pf-page {
  background: var(--kc-background);
  font-family: var(--font-family-primary);
}

.btn-primary {
  background-color: var(--kc-primary);
  border-color: var(--kc-primary);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-semibold);
}
```

### RBAC UI Komponenten

**Role Badge:**

```tsx
// components/rbac/RoleBadge.tsx
const roleColors = {
  admin: 'error',
  moderator: 'warning',
  community_manager: 'primary',
  finance: 'success',
  content_editor: 'secondary',
  ops: 'accent',
  viewer: 'secondary',
} as const;

export function RoleBadge({ role }: { role: keyof typeof roleColors }) {
  return (
    <span
      className={`
      inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
      bg-${roleColors[role]}-100 text-${roleColors[role]}-800
      border border-${roleColors[role]}-200
    `}
    >
      {role}
    </span>
  );
}
```

---

## 📊 Dashboard Widgets Spezifikation

### Widget 1: CI Status (GitHub)

**Design:**

- **Farbe**: Success (grün) | Warning (gelb) | Error (rot)
- **Icon**: CheckCircle | AlertTriangle | XCircle
- **Metriken**: Last 10 Runs, Success Rate (%), Median Duration

**Daten-Quelle:**

```graphql
query GetWorkflowRuns($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    defaultBranchRef {
      target {
        ... on Commit {
          checkSuites(last: 10) {
            nodes {
              conclusion
              workflowRun {
                createdAt
                updatedAt
                event
              }
            }
          }
        }
      }
    }
  }
}
```

### Widget 2: Forum Flags (Discourse)

**Design:**

- **Farbe**: Error (ungelöst) | Warning (in Bearbeitung) | Success (gelöst)
- **Liste**: Letzte 5 offene Flags
- **Aktion**: "Moderieren" Button → Deep-Link zu Discourse

**Daten-Quelle:**

```typescript
// Discourse API
GET /admin/flags.json?filter=active
Response:
{
  "flags": [
    { "id": 123, "post_id": 456, "flagged_by": "user@example.com", "reason": "spam" }
  ]
}
```

### Widget 3: Mitglieder-Trichter

**Design:**

- **Farbe**: Gradient (Primary → Accent)
- **Metriken**: Neue Anträge (7d), Genehmigt, Ausstehend, Abgelehnt
- **Visualisierung**: Funnel Chart (SVG)

**Daten-Quelle:**

```typescript
// Directus SDK
const stats = await directus.items('member').readByQuery({
  aggregate: {
    count: ['id'],
    avg: ['*'],
  },
  groupBy: ['status'],
  filter: {
    created_at: {
      _gte: '$NOW(-7 days)',
    },
  },
});
```

---

## 🧪 Testing & Accessibility

### Playwright A11y Tests

```typescript
// tests/admin-portal-a11y.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Admin Portal Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard');
    await injectAxe(page);
  });

  test('Dashboard widgets are WCAG AA compliant', async ({ page }) => {
    await checkA11y(page, '.widget-card', {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('Keyboard navigation works', async ({ page }) => {
    await page.keyboard.press('Tab'); // Focus Topbar
    await page.keyboard.press('Tab'); // Focus Sidebar
    await page.keyboard.press('Enter'); // Navigate

    // Assert: Fokus ist sichtbar
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveCSS('outline-width', '2px');
  });
});
```

### Visuelles Regression Testing

```bash
# Percy.io Integration
npx percy snapshot snapshots/ --widths "1280,768,375"
```

---

## 📦 Deliverables Checkliste

### Design System

- [x] Design Tokens JSON (228 Zeilen)
- [x] Discourse Theme CSS (207 Zeilen, WCAG AA)
- [ ] Admin Portal Theme CSS (generiert aus Tokens)
- [ ] Keycloak Theme (Login Page)
- [ ] Storybook mit allen Komponenten

### Komponenten

- [ ] Layout System (Sidebar, Topbar, Main)
- [ ] 10 Dashboard Widgets
- [ ] Form System (8 Input-Typen)
- [ ] Data Table (mit RLS Filter)
- [ ] Modal/Dialog System
- [ ] Toast/Notification System

### Integration

- [ ] Figma MCP Automation (GitHub Actions)
- [ ] Multi-Org Branding Runtime
- [ ] OIDC Theme Sync
- [ ] Design Token Validation (CI)

### Dokumentation

- [x] ADMIN-FIGMA-INTEGRATION.md (dieses Dokument)
- [ ] Storybook Docs (auto-generiert)
- [ ] Component API Reference
- [ ] Theming Guide (für Org Admins)

---

## 🚀 Nächste Schritte (konkret)

1. **Admin Portal Skeleton erstellen** (Next.js 14 + App Router)

   ```bash
   npx create-next-app@latest admin-portal --typescript --tailwind --app
   cd admin-portal
   npm install @directus/sdk @tanstack/react-query jose
   ```

2. **Design Tokens integrieren**

   ```bash
   cp ../figma-design-system/00_design-tokens.json ./tokens/
   node scripts/generate-tailwind-config.js
   ```

3. **Erste 3 Komponenten bauen** (mit Figma MCP)
   - Layout (Sidebar + Topbar)
   - Widget Card
   - Data Table

4. **Multi-Org Branding testen**
   - Directus `theme` Collection erstellen
   - Runtime CSS Injection
   - Org-Switcher UI

5. **FOCUS.md erweitern** (Phase 3: Admin Portal MVP)

---

**Fragen/Entscheidungen:**

- **Figma File Key**: Wo ist das Admin Portal Design? (benötigt für MCP Integration)
- **Directus Instance**: Lokal oder gehostet? (für Theme-Collection)
- **Storybook**: Sofort starten oder nach 5 Komponenten?
- **Percy/Chromatic**: Welches Tool für Visual Regression?

---

**Last Updated**: 2025-10-03  
**Maintainer**: GitHub Copilot + peschull  
**Status**: 🔄 IN PROGRESS (Phase 1)
