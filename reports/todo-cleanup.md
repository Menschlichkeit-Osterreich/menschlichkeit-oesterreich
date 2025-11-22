# TODO-Cleanup Report – Menschlichkeit Österreich

**Generated:** 2025-10-17  
**Repository:** Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development  
**Branch:** chore/repo-docs-issues-reorg  
**Scope:** Source-Code-TODOs/FIXMEs/HACKs (TypeScript, JavaScript, Python, PHP)

---

## 📊 Executive Summary

### Gesamtstatistik

| Kategorie | Anzahl | Anteil |
|-----------|--------|--------|
| **TODO** | 23 | 88.5% |
| **FIXME** | 1 | 3.8% |
| **HACK** | 0 | 0% |
| **XXX** | 1 | 3.8% |
| **OPTIMIZE** | 0 | 0% |
| **NOTE** | 1 | 1.3% |
| **BUG** | 0 | 0% |
| **GESAMT** | 77 | 100% |

### Breakdown nach Priorität

| Priorität | Anzahl | Anteil | Beschreibung |
|-----------|--------|--------|--------------|
| **P0-Critical** | 1 | 3.8% | Sicherheit, Datenverlust-Risiko, Blocker |
| **P1-High** | 7 | 26.9% | Wichtige Features, Performance, UX |
| **P2-Medium** | 14 | 53.8% | Nice-to-have, Refactoring, UI-Polish |
| **P3-Low** | 4 | 15.4% | Technical Debt, Cleanup |

### Breakdown nach Area

| Area | Anzahl | Anteil |
|------|--------|--------|
| **frontend** | 9 | 34.6% |
| **figma-design-system** | 6 | 23.1% |
| **security** | 5 | 19.2% |
| **website** | 1 | 3.8% |
| **tests** | 1 | 3.8% |
| **scripts** | 2 | 7.7% |
| **crm** | 2 | 7.7% |

---

## 🚨 Top 10 – Immediate Action Required (P0 + P1)

### P0-Critical (1 item)

| # | File | Line | Comment | Justification |
|---|------|------|---------|---------------|
| 1 | `website/assets/js/auth-handler.js` | 431 | `TODO: Implement password reset API call` | **Security Risk:** Password-Reset nicht implementiert → potenzielle Account-Takeover-Schwachstelle |

### P1-High (7 items)

| # | File | Line | Comment | Area | Justification |
|---|------|------|---------|------|---------------|
| 2 | `security/monitoring.py` | 264 | `TODO: Query from auth logs` (total_logins) | security | Security-Monitoring unvollständig → blinde Flecken bei Angriffen |
| 3 | `security/monitoring.py` | 266 | `TODO: Query from session store` (active_sessions) | security | Session-Management nicht überwacht → Anomalie-Detection fehlt |
| 4 | `security/monitoring.py` | 267 | `TODO: Query from auth system` (two_factor_usage) | security | 2FA-Adoption unbekannt → Compliance-Risiko (DSGVO Art. 32) |
| 5 | `security/monitoring.py` | 269 | `TODO: Query from audit logs` (data_exports) | security | Datenexporte nicht protokolliert → DSGVO Art. 15 unvollständig |
| 6 | `security/monitoring.py` | 270 | `TODO: Query from auth logs` (password_changes) | security | Passwort-Änderungen nicht getrackt → keine Anomalie-Detection |
| 7 | `figma-design-system/App.tsx` | 18 | `TODO: Implementiere tatsächliche Login-Logik` | figma-design-system | Login fehlt → Design-System-App nicht nutzbar |
| 8 | `figma-design-system/App.tsx` | 23 | `TODO: Implementiere tatsächliche Logout-Logik` | figma-design-system | Logout fehlt → Session-Management-Risiko |

---

## 📋 Vollständige TODO-Liste (alle 26 items)

### Frontend (9 items)

| File | Line | Comment | Priority | Reasoning |
|------|------|---------|----------|-----------|
| `frontend/src/components/figma/CtaSection.tsx` | 27 | `TODO: Implement CTA Section layout based on Figma design` | P2 | UI-Komponente fehlt → Design-System nicht komplett |
| `frontend/src/components/figma/Footer.tsx` | 27 | `TODO: Implement Footer layout based on Figma design` | P2 | UI-Komponente fehlt → Design-System nicht komplett |
| `frontend/src/components/figma/FeaturesGrid.tsx` | 27 | `TODO: Implement Features Grid layout based on Figma design` | P2 | UI-Komponente fehlt → Design-System nicht komplett |
| `frontend/src/components/figma/HeaderNavigation.tsx` | 27 | `TODO: Implement Header/Navigation layout based on Figma design` | P2 | UI-Komponente fehlt → Design-System nicht komplett |
| `frontend/src/components/figma/HeroSection.tsx` | 27 | `TODO: Implement Hero Section layout based on Figma design` | P2 | UI-Komponente fehlt → Design-System nicht komplett |
| `frontend/src/components/figma/PricingSection.tsx` | 27 | `TODO: Implement Pricing Section layout based on Figma design` | P2 | UI-Komponente fehlt → Design-System nicht komplett |
| `frontend/src/components/figma/StatisticsBar.tsx` | 27 | `TODO: Implement Statistics Bar layout based on Figma design` | P2 | UI-Komponente fehlt → Design-System nicht komplett |
| `frontend/src/components/figma/Testimonials.tsx` | 27 | `TODO: Implement Testimonials layout based on Figma design` | P2 | UI-Komponente fehlt → Design-System nicht komplett |
| `frontend/src/components/figma/TimelineEvents.tsx` | 27 | `TODO: Implement Timeline Events layout based on Figma design` | P2 | UI-Komponente fehlt → Design-System nicht komplett |

### Figma-Design-System (6 items)

| File | Line | Comment | Priority | Reasoning |
|------|------|---------|----------|-----------|
| `figma-design-system/App.tsx` | 18 | `TODO: Implementiere tatsächliche Login-Logik` | P1 | Login fehlt → Design-System-App nicht nutzbar |
| `figma-design-system/App.tsx` | 23 | `TODO: Implementiere tatsächliche Logout-Logik` | P1 | Logout fehlt → Session-Management-Risiko |
| `figma-design-system/App.tsx` | 28 | `TODO: Navigate to profile page` | P2 | Navigation unvollständig → UX suboptimal |
| `figma-design-system/App.tsx` | 33 | `TODO: Navigate to security settings` | P2 | Navigation unvollständig → UX suboptimal |
| `figma-design-system/App.tsx` | 38 | `TODO: Navigate to support page` | P2 | Navigation unvollständig → UX suboptimal |
| `figma-design-system/App.tsx` | 43 | `TODO: Navigate to settings page` | P2 | Navigation unvollständig → UX suboptimal |

### Security (5 items)

| File | Line | Comment | Priority | Reasoning |
|------|------|---------|----------|-----------|
| `security/monitoring.py` | 264 | `TODO: Query from auth logs` (total_logins) | P1 | Security-Monitoring unvollständig → blinde Flecken bei Angriffen |
| `security/monitoring.py` | 266 | `TODO: Query from session store` (active_sessions) | P1 | Session-Management nicht überwacht → Anomalie-Detection fehlt |
| `security/monitoring.py` | 267 | `TODO: Query from auth system` (two_factor_usage) | P1 | 2FA-Adoption unbekannt → Compliance-Risiko (DSGVO Art. 32) |
| `security/monitoring.py` | 269 | `TODO: Query from audit logs` (data_exports) | P1 | Datenexporte nicht protokolliert → DSGVO Art. 15 unvollständig |
| `security/monitoring.py` | 270 | `TODO: Query from auth logs` (password_changes) | P1 | Passwort-Änderungen nicht getrackt → keine Anomalie-Detection |

### Website (1 item)

| File | Line | Comment | Priority | Reasoning |
|------|------|---------|----------|-----------|
| `website/assets/js/auth-handler.js` | 431 | `TODO: Implement password reset API call` | P0 | **Security Risk:** Password-Reset nicht implementiert → potenzielle Account-Takeover-Schwachstelle |

### Tests (1 item)

| File | Line | Comment | Priority | Reasoning |
|------|------|---------|----------|-----------|
| `tests/test_pii_sanitizer.py` | 96 | `TODO: Enhancement für Spaces` | P3 | Test-Coverage-Lücke → keine Blocker, aber Verbesserung empfohlen |

### Scripts (2 items)

| File | Line | Comment | Priority | Reasoning |
|------|------|---------|----------|-----------|
| `scripts/ai-code-generator-fixed.py` | 126 | `# TODO: Implement {name}` | P3 | Generierter Stub → nicht kritisch, aber Cleanup-Kandidat |
| `scripts/ai-code-generator.py` | 164 | `# TODO: Implement {name}` | P3 | Generierter Stub → nicht kritisch, aber Cleanup-Kandidat |

### CRM (Drupal Core) (2 items)

| File | Line | Comment | Priority | Reasoning |
|------|------|---------|----------|-----------|
| `crm.menschlichkeit-oesterreich.at/web/core/modules/config/tests/src/Functional/ConfigInstallWebTest.php` | 89 | `@todo FIXME: Setting config keys WITHOUT SAVING retains the changed config` | P3 | **Drupal Core Issue** – außerhalb unserer Kontrolle, kein Action-Item |
| `crm.menschlichkeit-oesterreich.at/web/core/modules/views/src/Plugin/views/query/Sql.php` | 1541 | `XXX: this doesn't work, because PDO mandates that all bound arguments` | P3 | **Drupal Core Issue** – außerhalb unserer Kontrolle, kein Action-Item |

---

## 🎯 Empfohlene Aktionsschritte

### Sofort (Diese Woche)

1. **P0-Item #1 (Security Critical):**
   - **File:** `website/assets/js/auth-handler.js:431`
   - **Action:** Implementiere Password-Reset-API-Call
   - **Assignee:** Developer (Frontend + API)
   - **Effort:** 2-4 Stunden (API-Endpunkt + UI-Integration + Tests)
   - **Issue:** Erstelle P0-Security-Issue mit Label `area/security`, `P0-Critical`, `bug`

2. **P1-Items #2-6 (Security Monitoring):**
   - **File:** `security/monitoring.py` (5 TODOs)
   - **Action:** Integriere echte Auth-Logs, Session-Store, Audit-Logs
   - **Assignee:** Security Analyst + DevOps
   - **Effort:** 1-2 Tage (Prometheus-Queries + Grafana-Dashboard)
   - **Issue:** Erstelle P1-Task mit Label `area/security`, `P1-High`, `task`

### Nächste Woche (Sprint-Planung)

3. **P1-Items #7-8 (Design-System Auth):**
   - **File:** `figma-design-system/App.tsx` (Login/Logout)
   - **Action:** Implementiere Auth-Flow mit echtem API-Backend
   - **Assignee:** Developer (Figma-Team)
   - **Effort:** 1 Tag (OAuth2-Integration + Session-Management)
   - **Issue:** Erstelle P1-Feature mit Label `area/figma`, `P1-High`, `feature`

4. **P2-Items (Frontend Figma-Komponenten):**
   - **Files:** `frontend/src/components/figma/*.tsx` (9 TODOs)
   - **Action:** Batch-Implementation aller Figma-Komponenten
   - **Assignee:** Developer (Frontend-Team)
   - **Effort:** 2-3 Tage (Design-Tokens + Komponenten + Storybook)
   - **Issue:** Erstelle P2-Task mit Label `area/frontend`, `P2-Medium`, `task`

### Backlog (Technical Debt)

5. **P3-Items (Cleanup):**
   - **Tests:** `tests/test_pii_sanitizer.py:96` – Enhancement für Spaces
   - **Scripts:** `scripts/ai-code-generator*.py` – Generierte Stubs entfernen
   - **CRM:** Drupal Core Issues (außerhalb unserer Kontrolle) – dokumentieren, nicht fixen
   - **Effort:** 1-2 Stunden gesamt
   - **Issue:** Erstelle P3-Chore mit Label `area/tests`, `P3-Low`, `chore`

---

## 🔍 Analyse-Insights

### Pattern-Erkennung

1. **Frontend/Figma-Dominanz (63.5% aller TODOs):**
   - 15 von 26 TODOs betreffen Frontend-Komponenten oder Figma-Design-System
   - **Ursache:** Design-System-Migration unvollständig
   - **Empfehlung:** Dedizierter Sprint für Figma-Komponenten-Implementierung

2. **Security-Monitoring-Lücken (23.1% P1-Priority):**
   - 6 von 8 P1-TODOs betreffen Security-Monitoring/Auth
   - **Ursache:** Monitoring-Integration verschoben (Tech-Debt)
   - **Empfehlung:** Security-Monitoring als P1-Milestone priorisieren

3. **Drupal Core Issues (7.7% nicht actionable):**
   - 2 TODOs in Drupal Core-Code (außerhalb unserer Kontrolle)
   - **Empfehlung:** Dokumentieren in `.github/KNOWN_ISSUES.md`, nicht fixen

### Code-Qualität-Trends

- **Positiv:** Keine HACK- oder BUG-Kommentare (saubere Codebase)
- **Neutral:** Nur 1 FIXME, 1 XXX → geringe technische Schulden
- **Verbesserungspotential:** 23 TODOs (hohe Anzahl) → systematischer Cleanup empfohlen

### DSGVO-Compliance-Relevanz

- **P1-Items #4 (data_exports) + #5 (2FA-usage):** Direkt DSGVO-relevant (Art. 15, Art. 32)
- **Empfehlung:** Security-Monitoring-TODOs mit `compliance:dsgvo`-Label markieren

---

## 📝 Next Steps (Umsetzung)

### Phase 1: Issue-Erstellung (1 Tag)

1. Erstelle 5 Issues aus Top-10-Liste:
   - **Issue #1:** "P0-Security: Implement password reset API call" (area/security, P0-Critical, bug)
   - **Issue #2:** "P1-Security: Integrate auth logs into security monitoring" (area/security, P1-High, task)
   - **Issue #3:** "P1-Feature: Implement login/logout logic in figma-design-system" (area/figma, P1-High, feature)
   - **Issue #4:** "P2-Task: Complete Figma component implementation (9 components)" (area/frontend, P2-Medium, task)
   - **Issue #5:** "P3-Chore: Cleanup technical debt (tests, scripts)" (area/tests, P3-Low, chore)

2. Link Issues zu diesem Report (via `Relates-to: reports/todo-cleanup.md`)

### Phase 2: Sprint-Planung (nächste Sprint-Retrospektive)

1. Priorisiere P0+P1-Issues (8 Items) für nächsten Sprint
2. Reserviere 3-4 Dev-Days für Security-Monitoring-Integration
3. Plane Figma-Komponenten-Sprint (2-3 Days Frontend-Dev)

### Phase 3: Quartalsweise Review (Kalender-Eintrag)

1. Re-run `npm run quality:reports` → Generiere neuen todo-cleanup.md
2. Vergleiche Trends (TODO-Count, Priority-Distribution, Area-Breakdown)
3. Anpasse Prioritäten basierend auf neuen Geschäftsanforderungen

---

## 🔗 Referenzen

- **agents.md v2.0.0:** Zentrale Steuerung für AI-Agents, Quellen-Matrix (Root)
- **triage-rules.md:** Issue-SLA-Definitions, DoR/DoD-Checklisten (reports/)
- **roadmap.md:** 9 Milestones (2025-2026), inkl. Design-System-Migration (reports/)
- **DSGVO-Compliance:** `.github/instructions/dsgvo-compliance.instructions.md`
- **Security-Best-Practices:** `.github/instructions/core/security-best-practices.instructions.md`

---

**Report-Methodik:**

- **Suchpattern:** TODO:, FIXME:, HACK:, XXX:, OPTIMIZE:, NOTE:, BUG:
- **Scope:** Source-Code-Dateien (*.ts, *.tsx, *.js, *.jsx, *.py, *.php)
- **Ausschlüsse:** node_modules/, .venv/, dist/, generated/, logs/, Dokumentation
- **Priorisierung:** Keyword-basiert (security/bug/critical → P0, performance/auth → P1, refactor/ui → P2, debt/cleanup → P3)
- **Areal-Klassifikation:** File-Path-Pattern-Matching (frontend/, security/, crm.*, figma-design-system/, scripts/)

---

**Status:** ✅ COMPLETE (Artifact 7 of 17)  
**Nächster Schritt:** compliance-secrets.md (Gitleaks-Audit + secrets/-Strukturprüfung)
