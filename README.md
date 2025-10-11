# Menschlichkeit Österreich – Multi-Service NGO Platform

> Eine umfassende digitale Plattform für demokratische Teilhabe, Bildung und Community-Engagement in Österreich

[![Quality Gate](https://img.shields.io/badge/Quality%20Gate-Passing-brightgreen)](https://app.codacy.com/gh/peschull/menschlichkeit-oesterreich-development)
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
git clone https://github.com/peschull/menschlichkeit-oesterreich-development.git
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

Wichtige Kommandos

```bash
# Development
npm run dev:all
npm run dev:frontend
npm run dev:api
npm run dev:crm

# Quality & Testing
npm run lint:all
npm run test:unit
npm run test:e2e
npm run quality:gates

# Security
npm run security:scan
npm run security:trivy
npm run security:gitleaks

# Build & Deploy
./build-pipeline.sh staging
./build-pipeline.sh production
./scripts/safe-deploy.sh --dry-run
```

Quality Gates (PR-Blocking)

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
- Testing: tests/README.md

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

- **Bugs**: [GitHub Issues](https://github.com/peschull/menschlichkeit-oesterreich-development/issues/new?template=bug_report.md)
- **Features**: [Feature Request](https://github.com/peschull/menschlichkeit-oesterreich-development/issues/new?template=feature_request.md)
- **Security**: [Security Vulnerability Report](https://github.com/peschull/menschlichkeit-oesterreich-development/issues/new?template=security_vulnerability.md)
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
