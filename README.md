---
title: Menschlichkeit Österreich – Multi-Service NGO Platform
description: Eine umfassende digitale Plattform für demokratische Teilhabe, Bildung und Community-Engagement in Österreich
lastUpdated: 2025-10-13
status: ACTIVE
category: project
tags:
  - ngo
  - platform
  - austria
  - dsgvo
  - multi-service
version: 2.0.0
language: de-AT
audience:
  - Developers
  - End Users
  - Contributors
priority: critical
---

# Menschlichkeit Österreich – Multi-Service NGO Platform

> Eine umfassende digitale Plattform für demokratische Teilhabe, Bildung und Community-Engagement in Österreich

[![Quality Gate](https://img.shields.io/badge/Quality%20Gate-Passing-brightgreen)](https://app.codacy.com/gh/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development)
[![Security Scan](https://img.shields.io/badge/Security-DSGVO%20Compliant-blue)](docs/PRIVACY.md)
[![WCAG AA](https://img.shields.io/badge/Accessibility-WCAG%20AA-success)](docs/legal/WCAG-AA-COMPLIANCE-BLUEPRINT.md)

---

## Inhaltsverzeichnis

- [Projektübersicht](#-projektübersicht)
- [Quick Start](#-quick-start)
- [Architektur & Tech Stack](#️-architektur--tech-stack)
- [Entwicklung](#️-entwicklung)
- [Konfiguration](#-konfiguration)
- [Projektstruktur](#-projektstruktur)
- [Dokumentation](#-dokumentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Lizenz](#-lizenz)
- [Support](#-support)
- [Über Menschlichkeit Österreich](#-über-menschlichkeit-österreich)

---

## 🎯 Projektübersicht

Diese Plattform vereint mehrere spezialisierte Dienste für eine österreichische NGO:

- 🌐 Website – Öffentliche Präsenz mit WordPress/HTML
- 🔌 API Service – FastAPI-Backend für Datenintegration
- 👥 CRM System – Drupal 10 + CiviCRM für Mitgliederverwaltung
- 🎮 Gaming Platform – Educational Web Games (Demokratie-Simulator, Verfassungs-Quest)
- 🎨 Frontend – React/TypeScript mit Design Tokens (Rot-Weiß-Rot Corporate Identity)
- 🤖 Automation – n8n Workflows für Build-Notifications, Datenintegration

Architektur: Monorepo mit npm workspaces, Multi-Subdomain Plesk Hosting, Docker für lokale Entwicklung

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ (empfohlen: v20 LTS)
- npm v9+
- Docker Desktop v24+ (für CRM/n8n)
- Python v3.12+ (für API Service)
- Git v2.40+

### Installation (< 5 Minuten)

```bash
# 1) Repository klonen
git clone https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git
cd menschlichkeit-oesterreich-development

# 2) Dev-Setup (Workspaces, Composer, Environments)
npm run setup:dev

# 3) Alle Services starten (lokal)
npm run dev:all
```

Services erreichbar (Standard-Ports):

- Frontend: http://localhost:5173
- API: http://localhost:8001
- CRM: http://localhost:8000
- Games: http://localhost:3000 (statisch)
- n8n: http://localhost:5678

📚 Detaillierte Anleitung: docs/QUICKSTART.md

---

## 🏗️ Architektur & Tech Stack

### Service-Übersicht

| Service    | Technologie               | Port | Dokumentation                               |
| ---------- | ------------------------- | ---- | ------------------------------------------- |
| Website    | WordPress/HTML            | -    | website/README.md                           |
| API        | FastAPI + Python 3.12     | 8001 | api.menschlichkeit-oesterreich.at/README.md |
| CRM        | Drupal 10 + CiviCRM       | 8000 | crm.menschlichkeit-oesterreich.at/README.md |
| Frontend   | React + TypeScript + Vite | 5173 | frontend/README.md                          |
| Gaming     | Prisma + PostgreSQL       | 3000 | web/README.md                               |
| Automation | n8n (Docker)              | 5678 | automation/README.md                        |

### Datenbank-Strategie

- PostgreSQL: Gaming Platform (Prisma ORM), CiviCRM
- MariaDB: Drupal CRM (separate Instanz)
- Migrations: Alembic (API), Prisma (Games), Drupal (CRM)

### Security & Compliance

- DSGVO: PII Sanitization, Consent Management, Right to Erasure
- WCAG AA: Barrierefreiheit für alle Frontends
- Security: Codacy, Trivy, Gitleaks, GitGuardian, Secret-Scan
- Supply Chain: SBOM, SLSA attestation, signed commits

Weitere Details: DOCS-INDEX.md → Architecture

---

## 🛠️ Entwicklung

### Wichtige Kommandos

```bash
# Development
npm run dev:all              # Alle Services starten
npm run dev:frontend         # Nur Frontend
npm run dev:api             # Nur API
npm run dev:crm             # Nur CRM

# Status & Diagnose (NEU!)
npm run status:check        # Schneller Status-Check aller Services & PRs
npm run status:verbose      # Detaillierte System-Informationen
npm run status:json         # Export als JSON für Analyse

# Quality & Testing
npm run lint:all            # Alle Linter
npm run test:unit           # Unit Tests
npm run test:e2e            # E2E Tests (Playwright)
npm run quality:gates       # Vollständige Quality Gates

# Security
npm run security:scan       # Vollständiger Security-Scan
npm run security:trivy      # Container/Dependencies-Scan
npm run security:gitleaks   # Secret-Scanning

# Build & Deploy
./build-pipeline.sh staging
./build-pipeline.sh production
./scripts/safe-deploy.sh --dry-run
```

### Codespace Troubleshooting

Wenn Services nicht starten oder Sie den Codespace-Status prüfen möchten:

```bash
npm run status:check        # Zeigt: Services, PRs, Workflow-Status
```

📚 Ausführliche Diagnose: [Codespace Status Checker](..dokum/CODESPACE-STATUS-CHECKER.md)  
🔧 Troubleshooting Guide: [CODESPACE-TROUBLESHOOTING.md](..dokum/CODESPACE-TROUBLESHOOTING.md)

### Quality Gates (PR-Blocking)

- Security: 0 offene Issues (Codacy, Trivy, Secret-Scan)
- Maintainability: ≥85%, Duplication: ≤2%
- Performance: Lighthouse P≥90, A11y≥90, SEO≥90
- GDPR: 0 PII in Logs, dokumentierte Consent/Retention
- License: Vollständiges SPDX, keine Inkompatibilitäten

---

## ⚙️ Konfiguration

Environment Variablen (Auszug – ohne Secrets):

- DATABASE_URL: PostgreSQL-Verbindungsstring (15+)
- SAFE_DEPLOY_AUTO_CONFIRM: Automatische Bestätigung für Safe-Deploy-Skripte (true/false)
- STAGING*REMOTE*_ / PRODUCTION*REMOTE*_: Plesk/SFTP Deploy-Ziele (siehe deployment-scripts/)
- FIGMA_TOKEN: Optional für Design-Token-Sync (figma-design-system)
- NODE_ENV: development | production

Hinweise:

- Beispiel-Templates liegen unter `config-templates/` (z. B. `laravel-env-production.env`).
- n8n benötigt eine `.env` in `automation/n8n/` (via `npm run n8n:setup`).

---

## 📁 Projektstruktur

```
menschlichkeit-oesterreich-development/
├── api.menschlichkeit-oesterreich.at/  # FastAPI Backend
├── crm.menschlichkeit-oesterreich.at/  # Drupal 10 + CiviCRM
├── frontend/                           # React Frontend
├── web/                                # Static Website + Games
├── website/                            # WordPress Migration
├── automation/                         # n8n Workflows
├── mcp-servers/                        # Model Context Protocol Servers
├── docs/                               # Zentrale Dokumentation
│   ├── getting-started/
│   ├── architecture/
│   ├── security/
│   ├── compliance/
│   ├── development/
│   └── operations/
├── config-templates/
├── deployment-scripts/
├── scripts/
├── quality-reports/
├── tests/
└── figma-design-system/
```

---

## 📖 Dokumentation

Zentrale Navigation: DOCS-INDEX.md

- Getting Started: docs/QUICKSTART.md
- Architektur: DOCS-INDEX.md#architecture
- Security: docs/security/
- DSGVO: docs/compliance/
- Design System: figma-design-system/FIGMA-README.md
- Copilot: .github/copilot-instructions.md
- Deployment: docs/operations/

---

## 👥 Member Management (Admin)

**Zentrale Mitgliederverwaltung mit CiviCRM-Integration**

- **Route:** `/admin/members` (Protected - nur Vorstand/Kassier)
- **Features:**
  - 🔍 Echtzeit-Suche (Name, E-Mail)
  - 🏷️ Status-Filter (aktiv, pending, expired, cancelled)
  - 📊 Mitgliedstyp-Filter (Standard, Ermäßigt, Härtefall)
  - ✏️ Vollständiger Edit-Modus (Modal) mit DSGVO-konformen Feldern
  - 📋 Membership-Historie mit Status-Badges
  - 🔄 Responsive Card-Layout mit Loading/Error-States
- **Backend:**
  - `GET /contacts/search` – Mitgliedersuche mit Membership-Enrichment (Pagination)
  - `PUT /contacts/{id}` – Update mit erweiterten Feldern (phone, birth_date, address)
- **DSGVO-Compliance:** Art. 15-21 DSGVO-konform, PII-Sanitization, Audit-Logging
- **Dokumentation:** [`docs/features/MEMBER-MANAGEMENT.md`](docs/features/MEMBER-MANAGEMENT.md)

---

## 🧪 Testing

Struktur (Beispiel):

```
tests/
├── unit/          # Vitest Unit-Tests
├── integration/   # Integrations-Tests
├── e2e/           # Playwright E2E
└── fixtures/      # Testdaten & Mocks
```

Wichtige Kommandos:

```bash
npm run test:unit
npm run test:e2e
# Coverage (falls konfiguriert)
npm run test:unit -- --coverage
```

Zielwerte: ≥80% Coverage in produktivem Code. Artefakte: `playwright-results/`, `coverage/`.

---

## 🚢 Deployment

Standard-Pipeline (Staging/Production):

```bash
./build-pipeline.sh staging
./build-pipeline.sh production
```

Weitere Werkzeuge:

- Dry-Run: `./scripts/safe-deploy.sh --dry-run`
- Multi-Service Deploy: `deployment-scripts/` (Plesk)
- Health-Check: `npm run deploy:health-check`

Environments (Beispiel):

| Environment | URL                       | Branch     | CI/CD          |
| ----------- | ------------------------- | ---------- | -------------- |
| Development | lokal (siehe Ports unten) | feature/\* | Manuell        |
| Staging     | staging.menschlichkeit-…  | main       | Auto + Gates   |
| Production  | menschlichkeit-…          | release/\* | Approval nötig |

---

## 🤝 Contributing

## 🧩 MCP Server & Automatisierung

Die Datei `mcp.json` konfiguriert automatisierte Entwicklungs- und Compliance-Flüsse. Aktueller Stand (2025-10-14):

| Server | Zweck | Status | Anmerkung |
|--------|-------|--------|-----------|
| filesystem (Wrapper) | Dateizugriff Basis | OK (Wrapper) | `scripts/mcp/wrapper-filesystem.sh` |
| docker | Container Mgmt | OK | Docker CLI verfügbar |
| codacy-cli | Code Analyse | TEILWEISE (Analyse fehlerhaft) | Docker Wrapper vorhanden, Parsing `.codacyrc` schlägt fehl |
| prisma | DB Schema/Client | OK | Installiert (prisma & @prisma/client) |
| lighthouse | Performance Audit | TEILWEISE | CLI installiert, Chrome fehlt (Headless Browser nachinstallieren) |
| trivy-security | Security Scan | OK | Trivy Binary installiert |
| n8n-webhook | Webhook Client | OK | `automation/n8n/webhook-client.js` |
| build-pipeline | Build Dry-Run | OK | `./build-pipeline.sh` |
| plesk-deploy | Deploy Dry-Run | OK | `./scripts/safe-deploy.sh` |
| quality-reporter | Reports Aggregation | OK | `scripts/generate-quality-report.js` |
| figma | Design Tokens Sync | OK | `scripts/figma-token-sync.cjs` |
| github-cli | Repo Validierung | OK | `scripts/validate-github-files.py` |
| memory (Wrapper) | Session Speicher | OK | Platzhalter `scripts/mcp/wrapper-memory.sh` |
| sequential-thinking (Wrapper) | Schrittplanung | OK | Platzhalter `scripts/mcp/wrapper-sequential-thinking.sh` |
| context7 (Wrapper) | Code-Suche | OK | Platzhalter `scripts/mcp/wrapper-context7.sh` |
| gitleaks | Secret Scan | OK | Binary installiert (v8.x) |
| pii-sanitizer-test | DSGVO Test | OK | `pytest tests/test_pii_sanitizer.py` |
| design-tokens-validate | Token Qualität | OK | `scripts/validate-design-tokens.js` |

### Installation fehlender Komponenten
```bash
# Node Tooling
npm install -D prisma @prisma/client @lhci/cli

# Trivy (Security Scan)
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Gitleaks (Secret Scan)
curl -sSL https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_linux_x64.tar.gz | tar -xz -C /usr/local/bin gitleaks

# Optional: Chrome für Lighthouse (Performance)
apt-get update && apt-get install -y chromium-browser || echo "Chromium Installation optional fehlgeschlagen"

# Codacy: kein funktionierendes npm Paket, Wrapper verwendet Docker Image automatisch beim ersten Lauf
docker pull codacy/codacy-analysis-cli:latest
```

### Validierung
```bash
npx prisma --version || echo 'Prisma fehlt'
npx lhci healthcheck || echo 'Lighthouse CI benötigt ggf. Chrome'
trivy --version || echo 'Trivy fehlt'
gitleaks version || echo 'Gitleaks fehlt'
./scripts/codacy/codacy-cli.sh version || echo 'Codacy Wrapper Problem'
```

### Pflege & Sicherheit
- Tabelle bei Änderungen aktualisieren
- Nach Installation: Security- und Secret-Scan ausführen
- Wrapper durch echte MCP Server ersetzen, falls verfügbar
- Codacy Analyse aktuell via Docker Wrapper (keine npm Distribution verfügbar)
- Lighthouse: für vollständige Audits Headless Chrome installieren


Wir verwenden Conventional Commits und Branch Protection:

1. Fork das Repository
2. Branch: git checkout -b feature/amazing-feature
3. Commit: git commit -m "feat: add amazing feature"
4. Quality Gates prüfen: npm run quality:gates
5. Push & Pull Request erstellen

Guidelines: .github/CONTRIBUTING.md

---

## 📜 Lizenz

MIT License – siehe LICENSE

Third-Party Notices: docs/legal/THIRD-PARTY-NOTICES.md

---

## 🆘 Support

- **Bugs**: [GitHub Issues](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues/new?template=bug_report.md)
- **Features**: [Feature Request](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues/new?template=feature_request.md)
- **Security**: [Security Vulnerability Report](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues/new?template=security_vulnerability.md)
- **Dokumentation**: [DOCS-INDEX.md](DOCS-INDEX.md)

---

## 🔐 Security & DSGVO

- Keine PII in Logs: E-Mail-Masking, IBAN-Redaction. Validiert via Tests/Quality Gates.
- Responsible Disclosure: Siehe SECURITY.md (Vorgehen und Kontaktwege).
- Datenschutz: Siehe [docs/PRIVACY.md](docs/PRIVACY.md).

---

## 🏢 Über Menschlichkeit Österreich

Menschlichkeit Österreich ist eine NGO, die sich für demokratische Teilhabe, Bildung und Community-Engagement in Österreich einsetzt. Diese Plattform unterstützt unsere Mission durch digitale Tools für Mitgliederverwaltung, Bildungsspiele und Community-Interaktion.

**Website**: [menschlichkeit-oesterreich.at](https://menschlichkeit-oesterreich.at)

---

<div align="center">
  <strong>Made with ❤️ in Austria 🇦🇹</strong>
  <br />
  <sub>Powered by FastAPI · React · Drupal · n8n · PostgreSQL</sub>
</div>
