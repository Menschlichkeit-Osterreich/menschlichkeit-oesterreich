---
title: Menschlichkeit Österreich - Development Instructions
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: medium
category: core
applyTo: **/*
---

# Menschlichkeit Österreich - Development Instructions

## Projekt-Übersicht

**Multi-Service Austrian NGO Platform** mit strikter Service-Trennung:

### Service-Architektur

```text
├── Website (apps/website/)                             → React 19 + Vite
├── API Backend (apps/api/)                             → FastAPI/Python
├── CRM System (apps/crm/)                              → Drupal 10 + CiviCRM
├── Gaming Platform (apps/babylon-game/)                → Next.js + Babylon.js
├── Forum (apps/forum/)                                 → phpBB
└── Automation (automation/n8n/)                        → Docker/n8n
```

## Mandatory Quality Gates

**PR-Blocking (KEINE Ausnahmen):**

- ✅ Security: 0 open issues (Codacy, Trivy, Gitleaks)
- ✅ Maintainability: ≥85% | Duplication: ≤2%
- ✅ Performance: Lighthouse P≥90, A11y≥90, BP≥95, SEO≥90
- ✅ UX/UI: 0 Broken Links, WCAG AA compliance
- ✅ GDPR: 0 PII in logs, dokumentierte Consent/Retention
- ✅ License: SPDX + Third-Party Notices komplett
- ✅ Supply Chain: SBOM + SLSA-Attestation

## Development Workflow

### 1. Feature-Entwicklung starten

```bash
# Via GitHub MCP:
"Show me issue #<number> and create a new branch"

# Oder manuell:
git checkout -b feature/<issue-number>-<description>

# Quality Check aktivieren:
npm run quality:gates
```

### 2. Code-Änderungen (automatische Checks)

```markdown
Nach JEDEM File-Edit:

1. Codacy MCP analysiert automatisch (via Copilot Instructions)
2. Filesystem MCP prüft auf sensible Daten
3. Bei Security-Findings: SOFORT STOP → FIX → REANALYSE

IMMER beachten:

- Austrian German für UI-Texte
- DSGVO-Compliance bei Datenverarbeitung
- Design Tokens aus Figma verwenden
- Barrierefreiheit (WCAG AA)
```

### 3. Testing

```bash
# E2E-Tests (Playwright MCP):
npm run test:e2e

# Unit Tests:
npm run test:unit

# Integration Tests:
npm run test:integration

# Performance Audit:
npm run performance:lighthouse
```

### 4. Pre-Commit Validation

```bash
# Automatisch via pre-commit hook:
npm run lint:all
npm run format:all
npm run quality:codacy
npm run security:scan

# DSGVO-Check:
npm run compliance:dsgvo
```

### 5. Pull Request erstellen

```bash
# Via GitHub MCP (empfohlen):
"Create PR for current branch linking issue #<number>"

# Oder manuell:
git push origin feature/<name>
gh pr create --title "feat: <description>" --body "Closes #<issue>"
```

## Service-Spezifische Guidelines

### CRM Service (Drupal + CiviCRM)

```markdown
Technologie: PHP 8.1+, Drupal 10, CiviCRM
Development: localhost:8000 (npm run dev:crm)

IMMER verwenden:

- PostgreSQL MCP für CiviCRM-Queries
- Microsoft Docs MCP für Drupal/PHP Dokumentation
- phpstan.neon für Static Analysis

DSGVO-Critical:

- Consent-Management via CiviCRM
- Data Retention Policies dokumentieren
- PII niemals in Logs
```

### API Backend (FastAPI)

```markdown
Technologie: Python 3.12+, FastAPI, Pydantic
Development: localhost:8001 (npm run dev:api)

IMMER verwenden:

- PostgreSQL MCP für DB-Zugriff
- Microsoft Docs MCP für FastAPI/Azure
- OpenAPI Spec aktuell halten (`apps/api/openapi.yaml`)

Security:

- Input Validation via Pydantic
- PII Sanitization (verify_privacy_api.py)
- Rate Limiting implementieren
```

### Frontend (React/TypeScript)

```markdown
Technologie: React 19+, TypeScript 5+, Vite, Tailwind CSS
Development: localhost:5173 (npm run dev:frontend)

IMMER verwenden:

- Figma MCP für Design Tokens
- Upstash Context7 MCP für React Docs
- Playwright MCP für E2E-Tests

Design System:

- Tokens aus figma-design-system/00_design-tokens.json
- Austrian Corporate Identity (Rot-Weiß-Rot)
- Barrierefreiheit: aria-labels, semantic HTML
```

### Gaming Platform (Educational Games)

```markdown
Technologie: Next.js 16, Babylon.js 8, TypeScript
Development: localhost:3001 (npm run dev:games)

Database Schema (schema.prisma):

- User (email, displayName, xp, level)
- Achievement (title, description, xpReward, type: BADGE|TITLE|XP_BOOST)
- GameSession (gameType: VOTING_PUZZLE|CONSTITUTION_QUEST|etc.)

IMMER:

- Filesystem, Playwright und Content-Checks für Progressions- und Gameplay-Logik
- Gamification Best Practices nur nach Abgleich mit der realen Game-Implementierung recherchieren
```

### Automation (n8n Workflows)

```markdown
Technologie: n8n (Docker), Webhooks
Development: localhost:5678 (npm run n8n:start)

Workflows:

- Build Pipeline Notifications
- Design Token Sync
- Quality Report Distribution

IMMER:

- Webhook-Integrität validieren
- DSGVO bei externen Calls beachten
- Error Handling implementieren
```

## Design System Integration

### Figma → Code Workflow

```bash
# 1. Designer aktualisiert Figma
# 2. Automatischer Sync (täglich 2:00 UTC) ODER:
npm run figma:sync

# 3. Token-Drift-Check:
git diff figma-design-system/00_design-tokens.json

# 4. Frontend neu bauen:
npm run design:tokens

# 5. Visual Regression Tests:
npm run test:visual

# 6. PR erstellen (via GitHub MCP):
"Create PR for design token update v<version>"
```

### Corporate Identity Rules

```markdown
Farben (aus Figma):

- Primary: Austrian Red (#FF0000 oder aus Token)
- Secondary: White (#FFFFFF)
- Accent: variabel aus Design System

Typografie:

- Barrierefreie Schriftarten
- Min. 16px Fließtext
- Kontrast-Ratio ≥4.5:1 (WCAG AA)

Komponenten:

- Immer Figma MCP für Component Code
- Storybook für Dokumentation
```

## Database Management

### Schema-Änderungen (Prisma)

```bash
# 1. schema.prisma anpassen
# 2. Migration generieren:
npx prisma migrate dev --name <description>

# 3. PostgreSQL MCP: Schema validieren:
"Explain new database schema and relationships"

# 4. Types generieren:
npx prisma generate

# 5. Tests aktualisieren
```

### Datenbank-Synchronisation

```bash
# Remote → Local (DRY-RUN ERST!):
./scripts/plesk-sync.sh pull

# Apply nach Prüfung:
./scripts/plesk-sync.sh pull --apply

# Local → Remote (GEFÄHRLICH!):
./scripts/plesk-sync.sh push --dry-run
# NUR nach Genehmigung:
./scripts/plesk-sync.sh push --apply
```

## Security & Compliance

### DSGVO-Compliance-Checklist

```markdown
Bei jeder Datenverarbeitung:
□ Rechtsgrundlage dokumentiert (Art. 6 DSGVO)
□ Zweckbindung eingehalten
□ Datensparsamkeit gewährleistet
□ Speicherdauer definiert
□ Löschroutinen implementiert
□ Betroffenenrechte ermöglicht (Auskunft, Löschung, etc.)
□ Consent-Management via CiviCRM
□ Privacy Policy aktualisiert

Tools:

- PostgreSQL MCP: PII-Felder identifizieren
- Filesystem MCP: Log-Files auf PII prüfen
- Brave Search MCP: Aktuelle DSGVO-Anforderungen
```

### Security Scanning

```bash
# Vor jedem Deployment:
npm run security:scan

# Einzelne Scans:
npm run security:trivy      # Container/Dependencies
gitleaks detect              # Secret Scanning
npm run quality:codacy       # Code Quality + Security

# Via GitHub MCP:
"List all Dependabot and code scanning alerts"
```

### Credential Management

```markdown
NIEMALS:

- Tokens/Secrets in Code
- Production-Credentials in .env (nur .env.example Template)
- PII in Git History

IMMER:

- GitHub Secrets für CI/CD
- .env in .gitignore
- Secrets-Rotation alle 90 Tage
- PowerShell Decrypt: scripts/secrets-decrypt.ps1
```

### Git Token & Push Protection Lösung

```markdown
PROBLEM: Git Push wird blockiert durch Branch Protection

LÖSUNG 1: GitHub Token ist bereits konfiguriert:

- ~/.git-credentials: Automatische Git-Authentifizierung
- ~/.bashrc: GITHUB_TOKEN Environment Variable
- .env: Lokale Entwicklung (nicht in Git)

LÖSUNG 2: GPG-ID ist auch in Secrets verfügbar:

# GPG Setup mit Secret:

export GPG_KEY_ID="${GPG_KEY_ID}"  # Aus GitHub Secrets
git config --global user.signingkey "${GPG_KEY_ID}"
git config --global commit.gpgsign true
git commit --amend --no-edit -S
git push origin chore/figma-mcp-make

LÖSUNG 3: Bei "Signed Commits" Fehler (Workaround):

# Temporäre Lösung ohne GPG:

git config --global commit.gpgsign false
git push origin chore/figma-mcp-make

# Oder Branch Protection deaktivieren:

# GitHub Repository → Settings → Branches → "Require signed commits" OFF

LÖSUNG 4: Vollständige GPG Setup:
./scripts/setup-git-signing.sh # Automatisches GPG Setup

VALIDIERUNG:
echo "Token aktiv: ${GITHUB_TOKEN:0:20}..."
echo "GPG Key: ${GPG_KEY_ID}"
curl -H "Authorization: Bearer ${GITHUB_TOKEN}" https://api.github.com/user
```

## Deployment Pipeline

### Staging Deployment

```bash
# Build Pipeline:
./build-pipeline.sh staging --skip-tests

# Via n8n Webhook (automatisch):
# → Build Notification
# → Quality Reports
# → Deployment zu Staging-Server
```

### Production Deployment

```bash
# 1. Vollständiger Quality Check:
npm run quality:gates

# 2. Build Pipeline (mit allen Tests):
./build-pipeline.sh production

# 3. Deployment Simulation (DRY-RUN):
./scripts/safe-deploy.sh --dry-run

# 4. Deployment zu Plesk:
./deployment-scripts/deploy-crm-plesk.sh
./deployment-scripts/deploy-api-plesk.sh

# 5. Post-Deployment Validation:
npm run test:e2e --env=production
```

## Testing Strategy

### Test-Pyramide

```text
E2E (Playwright)        ← Top (wenige, kritische Flows)
  ↑
Integration Tests       ← Mitte (Service-Boundaries)
  ↑
Unit Tests             ← Basis (viele, schnelle Tests)
```

### Test-Generierung mit MCP

```bash
# Via Playwright MCP:
"Generate E2E test for:
1. User Registration
2. Email Verification
3. Profile Completion
4. First Achievement"

# Ausführen:
npm run test:e2e

# Reports:
playwright-results/index.html
```

### Performance Testing

```bash
# Lighthouse Audit:
npm run performance:lighthouse

# Load Testing (k6):
k6 run tests/load/api-endpoints.js

# Via Brave Search MCP:
"Search for PostgreSQL query optimization techniques"
```

## Multi-Language Support

### Content-Strategie

```markdown
UI-Texte:

- Primär: Deutsch (Österreich) 🇦🇹
- Fallback: English
- i18n: `apps/website/src/`

Technische Docs:

- Englisch (internationale Zusammenarbeit)
- README.md, API Docs, Code-Kommentare

Legal/DSGVO:

- NUR Deutsch (rechtssicher)
- Datenschutzerklärung, AGB, Consent-Texte
```

### Lokalisierung-Workflow

```bash
# Neue Übersetzungen:
npm run i18n:extract

# Via Brave Search MCP:
"Search for Austrian German localization best practices"

# Validation:
npm run i18n:validate
```

## Automation & CI/CD

### GitHub Actions Workflows

```markdown
.github/workflows/:

- quality-gates.yml → Bei jedem Push
- security-scan.yml → Täglich 3:00 UTC
- sync-figma-tokens.yml → Täglich 2:00 UTC
- deploy-staging.yml → Bei PR-Merge zu main
- deploy-production.yml → Bei Release-Tag
```

### n8n Automation

```markdown
automation/n8n/workflows/:

- build-notifications.json → Slack/Email bei Build
- token-sync.json → Figma→GitHub Sync
- quality-reports.json → Report-Distribution
- backup-automation.json → DB Backup-Monitoring
```

## MCP Server Best Practices

### Context-Building

```bash
# Session-Start:
1. Memory MCP: "Load context for feature #123"
2. GitHub MCP: "Show current milestone and related issues"
3. PostgreSQL MCP: "Explain database schema for user module"
```

### Cross-Service Operations

```bash
# Beispiel: Payment-Integration
1. GitHub MCP: "Analyze issue #456 payment requirements"
2. Brave Search MCP: "Search Stripe SEPA integration Austria"
3. PostgreSQL MCP: "Show payment-related tables"
4. Figma MCP: "Get payment form component code"
5. Playwright MCP: "Generate payment flow E2E tests"
6. GitHub MCP: "Create PR with implementation and tests"
```

## Troubleshooting

### MCP Server Issues

```bash
# Health Check:
npm run mcp:check

# Logs prüfen:
cat ~/.cache/github-copilot/logs/language-server.log | grep -i error

# VS Code neustarten:
Cmd/Ctrl + Shift + P → "Developer: Reload Window"
```

### Build Failures

```bash
# Clean & Rebuild:
npm run clean
npm run setup:dev
npm run build:all

# Service-spezifisch debuggen:
npm run dev:crm --verbose
npm run dev:api --reload
```

### Database Connection

```bash
# Connection String prüfen:
echo $POSTGRES_CONNECTION_STRING

# Via PostgreSQL MCP:
"Test database connection and show schema"

# Prisma Studio (GUI):
npx prisma studio
```

## Code Review Checklist

### Vor PR-Submission

```markdown
□ Alle Quality Gates grün
□ Tests geschrieben und passed
□ DSGVO-Impact dokumentiert (bei Datenverarbeitung)
□ Design Tokens verwendet (keine hardcoded Colors/Spacing)
□ Barrierefreiheit geprüft (WCAG AA)
□ Austrian German UI-Texte
□ API-Dokumentation aktualisiert (falls Backend-Änderung)
□ Changelog-Entry erstellt
□ Screenshots/Demos (bei UI-Änderungen)
```

### Review-Prozess

```markdown
1. Automatische Checks (GitHub Actions)
2. Codacy MCP: Code Quality Report
3. Security Scan: Trivy + Gitleaks
4. Manual Review: Mind. 1 Approval
5. Merge nur bei allen Checks grün
```

## Emergency Procedures

### Production Incident

```bash
# 1. Rollback (sofort):
./scripts/rollback-plesk.sh <previous-version>

# 2. Incident Analysis:
# Via GitHub MCP:
"Create incident issue with template"

# 3. Fix in Hotfix-Branch:
git checkout -b hotfix/<issue-number>

# 4. Fast-Track Deployment:
./build-pipeline.sh production --force
```

### Data Breach Response

```bash
# 1. SOFORT: Betroffene Services isolieren
# 2. PostgreSQL MCP: Betroffene Daten identifizieren
# 3. DSGVO-Meldepflicht prüfen (72h-Frist!)
# 4. Forensic Analysis starten
# 5. Datenschutzbeauftragten informieren
```

## Performance Optimization

### Frontend

```markdown
- Code-Splitting (React.lazy)
- Image Optimization (WebP, responsive)
- Bundle-Size: Max 200KB (initial)
- Lighthouse Score: P≥90

Via Upstash Context7 MCP:
"Get React 19 performance optimization docs"
```

### Backend

```markdown
- DB Connection Pooling
- Query Optimization (PostgreSQL MCP analysieren)
- Caching (Redis)
- Rate Limiting

Via Microsoft Docs MCP:
"Get FastAPI async best practices"
```

### Database

```markdown
- Indexing Strategy (PostgreSQL MCP)
- Query Analysis (EXPLAIN ANALYZE)
- Partitioning bei großen Tabellen
- Regular VACUUM

Via Brave Search MCP:
"Search PostgreSQL 16 performance tuning"
```

## Documentation Standards

### Code-Kommentare

```typescript
// ✅ GOOD (Deutsch für Business-Logic):
/**
 * Berechnet XP-Belohnung basierend auf Schwierigkeitsgrad
 * @param difficulty - Schwierigkeit (1-5)
 * @returns XP-Punkte gemäß Forumla: difficulty * 100 * multiplier
 */

// ✅ GOOD (Englisch für Technical Details):
/**
 * Implements OAuth2 token refresh flow
 * @see https://oauth.net/2/refresh-tokens/
 */
```

### API-Dokumentation

```markdown
IMMER aktualisieren:

- OpenAPI Spec: `apps/api/openapi.yaml`
- Endpoint-Beschreibungen auf Englisch
- Error-Codes dokumentieren
- Rate-Limits spezifizieren
```

---

**Diese Instructions sind bindend für alle Entwicklungsaktivitäten.**
**Bei Unklarheiten: GitHub Issue erstellen oder Team konsultieren.**
**Updates: Bei Architekturänderungen diese Datei ZUERST aktualisieren.**
