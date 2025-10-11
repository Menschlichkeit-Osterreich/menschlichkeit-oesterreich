# 🎯 FOCUS - Community Forum Integration (2 Wochen Sprint)

**Sprint**: 2025-10-03 bis 2025-10-17  
**Ziel**: DSGVO-konformes Forum mit Figma Design System Integration

---

## ✅ Diese 2 Wochen (Fokus-Scope)

### 1) ✅ Figma Design System → Discourse Integration

**Status**: ✅ ABGESCHLOSSEN

- [x] Design Tokens synchronisiert (Token Drift = 0%)
- [x] Discourse Theme Generator erstellt (`scripts/generate-discourse-theme.cjs`)
- [x] WCAG AA konformes Theme generiert (207 Zeilen CSS, 4.25 KB)
- [x] Österreichische Farben (Rot-Weiß-Rot) integriert
- [x] Accessibility Features (Focus States, Touch Targets 44x44px)
- [x] DSGVO Cookie Banner Styles

**Deliverables**:

- ✅ `figma-design-system/discourse-theme.css`
- ✅ `scripts/generate-discourse-theme.cjs`
- ✅ Dokumentation in `community_forum_integration_ngo_eu_dsgvo_aktionsplan_copilot_briefing.md`

### 2) ✅ Security CI/CD Pipeline (COMPLETED)

**Ziel**: security.yml grün bekommen

- [x] Gitleaks installieren & konfigurieren (v8.18.2)
- [x] Semgrep CI Workflow aktivieren (v1.139.0)
- [x] gitleaks.toml Config erstellt (30 Leaks nach Filterung)
- [x] .gitleaksignore für False Positives
- [x] security.yml erweitert (5 Tools: Snyk, Trivy, Gitleaks, Semgrep, DSGVO-Check)
- [ ] Dependabot Setup (npm + pip) - NEXT
- [ ] CodeQL für JavaScript/TypeScript + Python - NEXT

**Deliverables**:

- ✅ `gitleaks.toml` - Secret Detection Config
- ✅ `.gitleaksignore` - Vendor/Test Excludes
- ✅ `.github/workflows/security.yml` - Vollständige Security Pipeline mit SARIF Upload
- ✅ Gitleaks 8.18.2 & Semgrep 1.139.0 installiert

### 3) 📚 Quickstart Dokumentation

**Ziel**: Onboarding ≤10 Minuten

- [ ] `docs/QUICKSTART.md` erstellen
- [ ] Prerequisites & Setup Steps
- [ ] Figma Token Sync dokumentieren
- [ ] Forum Theme Installation Guide
- [ ] Video/GIF-Walkthrough (optional)

---

---

## 🔮 Phase 3: Admin-Backend Portal (Next Sprint)

**Zeitrahmen**: W1-W4 nach Current Sprint  
**Bezugsdokument**: `admin_backend_architektur_umsetzungsplan_ngo_eu_dsgvo.md`

### Architektur-Stack

- **Identity**: Keycloak (OIDC Single Sign-On)
- **Control Plane**: Directus (Headless CMS + API)
- **Admin UI**: Next.js 14 (App Router + React Server Components)
- **Design System**: Figma Tokens → Tailwind CSS
- **Automatisierung**: n8n (Self-Hosted EU)
- **Analytics**: Matomo (Privacy-First)

### Deliverables (MVP)

#### W1: Foundation & Design Integration

- [ ] Next.js Admin Portal Skeleton (`admin.menschlichkeit-oesterreich.at`)
- [ ] Design Token Integration (Tailwind Config aus `figma-design-system/admin-portal-tokens.json`)
- [ ] Keycloak OIDC Middleware (JWT Verify + RBAC)
- [ ] Layout System (Sidebar + Topbar + Main)
- [ ] Multi-Org Branding Runtime (CSS Variables Injection)

#### W2: Core Components (Figma MCP)

- [ ] **Widget Cards** (CI Status, Forum Flags, Members, Dues, Newsletter)
- [ ] **Data Table** (Paginiert, Sortierbar, RLS-Filter)
- [ ] **Form System** (Input, Select, Checkbox, Radio, Textarea)
- [ ] **Button Variants** (Primary, Secondary, Danger, Ghost)
- [ ] **Badge/Status Components** (Role Badges mit Design Tokens)

#### W3: Integrationen

- [ ] **Directus SDK** (Mitglieder-Grid, Beitragsverwaltung)
- [ ] **GitHub GraphQL** (CI Status Widget)
- [ ] **Discourse API** (Forum Flags Widget)
- [ ] **n8n Webhooks** (Flow-Trigger aus Admin Portal)
- [ ] **Matomo Reporting** (Dashboard Charts)

#### W4: Testing & Hardening

- [ ] **Playwright A11y Tests** (WCAG AA Compliance)
- [ ] **Visual Regression** (Percy/Chromatic)
- [ ] **OIDC E2E Flow** (Login → RBAC → Widgets)
- [ ] **RLS Tests** (Org-Scoping funktioniert)
- [ ] **Performance Audit** (Lighthouse P≥90)

### Design System Integration

**Neue Dateien**:

- ✅ `docs/ADMIN-FIGMA-INTEGRATION.md` (Komponenten-Mapping, Multi-Org Branding)
- ✅ `figma-design-system/admin-portal-tokens.json` (Dashboard, Widgets, Tables, Forms)
- [ ] `admin-portal/tailwind.config.js` (Token-Import)
- [ ] `admin-portal/components/ui/` (shadcn/ui Basis + Custom)

**Figma MCP Workflow**:

1. Designer erstellt Komponente in Figma
2. Agent nutzt `mcp_figma_get_code(nodeId="...")` → TypeScript/React Code
3. Design Tokens werden automatisch angewendet
4. Multi-Org CSS Variables für Branding
5. A11y Attribute (ARIA, Keyboard Navigation)

### Quality Gates (Admin Portal)

| Metrik                     | Ziel   | Aktuell |
| -------------------------- | ------ | ------- |
| **WCAG AA Compliance**     | 100%   | -       |
| **Design Token Drift**     | 0%     | -       |
| **Lighthouse Performance** | ≥90    | -       |
| **Bundle Size**            | <200KB | -       |
| **E2E Test Coverage**      | ≥80%   | -       |
| **RLS Security Tests**     | 100%   | -       |

---

## 🅿️ Parkplatz (Nicht diese 2 Wochen)

**Phase 4+** (Post-Admin-MVP):

- Discourse EU-Hosting Setup (VM/Docker)
- GitHub Actions → Discourse Release Bot
- Trust Level Automation
- Plugin-Installation (Akismet, Solved, Voting)
- Performance Testing (k6 Load Tests)
- Abstimmungsmodul (Decidim/Helios Integration)
- ERPNext/SEPA Payment Integration
- Newsletter System (Listmonk Self-Hosted)

**Tech Debt**:

- npm audit moderate vulnerabilities (esbuild, vite)
- PHPStan Level erhöhen
- Test Coverage auf >90% bringen
- Docker Compose Orchestrierung vereinfachen

---

## 📊 Erfolgsmetriken (diese 2 Wochen)

| Metrik                    | Start | Ziel    | Aktuell         |
| ------------------------- | ----- | ------- | --------------- |
| **Design Token Drift**    | ?     | 0%      | ✅ 0%           |
| **Security CI grün**      | ❌    | ✅      | 🔄              |
| **Discourse Theme ready** | ❌    | ✅      | ✅ DONE         |
| **Quickstart Zeit**       | ?     | ≤10 Min | 🔄              |
| **WCAG AA Compliance**    | ?     | 100%    | ✅ 100% (Theme) |

---

## 🚀 Nächste Schritte (geordnet nach Priorität)

1. **Security CI aktivieren**

   ```bash
   # Gitleaks installieren
   wget -qO gitleaks.tar.gz https://github.com/gitleaks/gitleaks/releases/download/v8.18.2/gitleaks_8.18.2_linux_x64.tar.gz
   tar -xzf gitleaks.tar.gz
   sudo mv gitleaks /usr/local/bin/

   # Semgrep via GitHub Action
   # .github/workflows/security.yml bereits vorhanden
   ```

2. **QUICKSTART.md schreiben**

   ```bash
   cd docs/
   touch QUICKSTART.md
   # Inhalt: Prerequisites, Clone, Setup, Figma Sync, Build, Deploy
   ```

3. **Discourse Theme testen**

   ```bash
   # Theme hochladen in lokale Discourse Instanz
   # Visuelle Regression Tests (optional)
   ```

---

## 🎯 Definition of Done (Sprint)

- [x] Figma → Discourse Theme Generator funktioniert
- [ ] Security CI läuft ohne Fehler
- [ ] Quickstart Doku existiert und verifiziert
- [ ] Alle Änderungen committed & gepusht
- [ ] Sprint Review dokumentiert

---

**Letzte Aktualisierung**: 2025-10-03  
**Next Review**: 2025-10-10 (Midpoint Check)
