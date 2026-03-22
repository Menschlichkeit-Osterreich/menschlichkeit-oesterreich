# 📚 Dokumentations-Index

> **Zentrale Navigation für alle Dokumentationen des Menschlichkeit Österreich Development Repository**

Letzte Aktualisierung: 2025-10-10

---

## 📖 Inhaltsverzeichnis

- [🚀 Getting Started](#-getting-started)
- [🏗️ Architecture](#-architecture)
- [🔒 Security & Compliance](#-security--compliance)
- [💻 Development](#-development)
- [🚀 Operations & Deployment](#-operations--deployment)
- [🎨 Design System](#-design-system)
- [🧪 Testing](#-testing)
- [📊 Quality & Reports](#-quality--reports)
- [📜 Legal & Governance](#-legal--governance)
- [📦 Archive](#-archive)

---

## 🚀 Getting Started

**Für neue Entwickler:innen und Setup**

| Dokument                                              | Beschreibung                            | Zielgruppe      |
| ----------------------------------------------------- | --------------------------------------- | --------------- |
| [README.md](../README.md)                             | Projekt-Übersicht, Quick Start          | Alle            |
| [docs/QUICKSTART.md](QUICKSTART.md)                   | Detaillierte Setup-Anleitung (≤10 Min.) | Neue Entwickler |
| [docs/COPILOT-SETUP-GUIDE.md](COPILOT-SETUP-GUIDE.md) | GitHub Copilot + MCP Integration        | Entwickler      |
| [.devcontainer/README.md](../.devcontainer/README.md) | VS Code Dev Container Setup             | Entwickler      |
| [TODO.md](../TODO.md)                                 | Aktuelle Aufgaben & Roadmap             | Alle            |

---

## 🏗️ Architecture

**System-Design, Service-Integration, Datenflüsse**

### Service-Dokumentation

| Service         | README                                                                                        | Haupttechnologie       |
| --------------- | --------------------------------------------------------------------------------------------- | ---------------------- |
| **API**         | [api.menschlichkeit-oesterreich.at/README.md](../api.menschlichkeit-oesterreich.at/README.md) | FastAPI + Python 3.12  |
| **Frontend**    | [frontend/README.md](../frontend/README.md)                                                   | React + TypeScript     |
| **CRM**         | [crm.menschlichkeit-oesterreich.at/README.md](../crm.menschlichkeit-oesterreich.at/README.md) | Drupal 10 + CiviCRM    |
| **Gaming**      | [web/README.md](../web/README.md)                                                             | Prisma + PostgreSQL    |
| **Automation**  | [automation/README.md](../automation/README.md)                                               | n8n Workflows          |
| **MCP Servers** | [mcp-servers/README.md](../mcp-servers/README.md)                                             | Model Context Protocol |

### Integration Patterns

| Dokument                                                                                                                        | Beschreibung                        |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [docs/ADMIN-FIGMA-INTEGRATION.md](ADMIN-FIGMA-INTEGRATION.md)                                                                   | Figma ↔ Frontend Design Token Sync |
| [api.menschlichkeit-oesterreich.at/PII-SANITIZATION-README.md](../api.menschlichkeit-oesterreich.at/PII-SANITIZATION-README.md) | PII Sanitizer für DSGVO-Compliance  |
| [automation/n8n/N8N-WORKFLOW-IMPORT-GUIDE.md](../automation/n8n/N8N-WORKFLOW-IMPORT-GUIDE.md)                                   | n8n Workflow Import & Custom Nodes  |

### Infrastruktur

| Dokument                                                                                        | Beschreibung                             |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [docs/infrastructure/SUBDOMAIN-REGISTRY.md](infrastructure/SUBDOMAIN-REGISTRY.md)               | Subdomain-Architektur (api., crm., web.) |
| [docs/infrastructure/SUBDOMAIN-DNS-CHECK-GUIDE.md](infrastructure/SUBDOMAIN-DNS-CHECK-GUIDE.md) | DNS-Konfiguration Plesk                  |
| [docs/infrastructure/GIT-LFS-MIGRATION.md](infrastructure/GIT-LFS-MIGRATION.md)                 | Git LFS für große Binaries               |
| [docs/infrastructure/LOG-RETENTION-OPERATIONS.md](infrastructure/LOG-RETENTION-OPERATIONS.md)   | Log-Management & Retention               |
| [docs/infrastructure/WORKSPACE-HYGIENE.md](infrastructure/WORKSPACE-HYGIENE.md)                 | Workspace Cleanup Best Practices         |

---

## 🔒 Security & Compliance

**Security Policies, DSGVO, Threat Models**

### Security

| Dokument                                                                                                                | Beschreibung                    |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| [docs/security/SUPPLY-CHAIN-SECURITY-BLUEPRINT.md](security/SUPPLY-CHAIN-SECURITY-BLUEPRINT.md)                         | SBOM, SLSA, Dependency-Scanning |
| [docs/security/AUTHENTICATION-FLOWS.md](security/AUTHENTICATION-FLOWS.md)                                               | JWT, OAuth2, Session-Handling   |
| [docs/security/GPG-COMMIT-SIGNING-SETUP.md](security/GPG-COMMIT-SIGNING-SETUP.md)                                       | Commit Signierung               |
| [docs/security/PHASE-0-DEEP-ANALYSIS.md](security/PHASE-0-DEEP-ANALYSIS.md)                                             | Security Audit Phase 0          |
| [analysis/phase-0/threat-model/STRIDE-LINDDUN-ANALYSIS.md](../analysis/phase-0/threat-model/STRIDE-LINDDUN-ANALYSIS.md) | Threat Model (STRIDE + LINDDUN) |

### DSGVO / GDPR Compliance

| Dokument                                                                                                                        | Beschreibung                           |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| [docs/compliance/RIGHT-TO-ERASURE-PROCEDURES.md](compliance/RIGHT-TO-ERASURE-PROCEDURES.md)                                     | DSGVO Löschverfahren (Art. 17)         |
| [docs/legal/DSGVO-COMPLIANCE-BLUEPRINT.md](legal/DSGVO-COMPLIANCE-BLUEPRINT.md)                                                 | DSGVO Compliance Gesamtstrategie       |
| [docs/legal/RIGHT-TO-ERASURE-WORKFLOW.md](legal/RIGHT-TO-ERASURE-WORKFLOW.md)                                                   | Technischer Workflow für Datenlöschung |
| [api.menschlichkeit-oesterreich.at/PII-SANITIZATION-README.md](../api.menschlichkeit-oesterreich.at/PII-SANITIZATION-README.md) | PII Filter für Logging                 |
| [scripts/dsgvo-check.sh](../scripts/dsgvo-check.sh)                                                                             | Automated DSGVO Compliance Check       |

### Accessibility

| Dokument                                                                            | Beschreibung                     |
| ----------------------------------------------------------------------------------- | -------------------------------- |
| [docs/legal/WCAG-AA-COMPLIANCE-BLUEPRINT.md](legal/WCAG-AA-COMPLIANCE-BLUEPRINT.md) | WCAG 2.1 AA Compliance Strategie |

---

## 💻 Development

**Development Workflows, Tools, Best Practices**

### GitHub Copilot & MCP

| Dokument                                                                                | Beschreibung                   |
| --------------------------------------------------------------------------------------- | ------------------------------ |
| [.github/copilot-instructions.md](../.github/copilot-instructions.md)                   | Copilot-Direktiven (MANDATORY) |
| [docs/COPILOT-SETUP-GUIDE.md](COPILOT-SETUP-GUIDE.md)                                   | Copilot + MCP Server Setup     |
| [docs/COPILOT-QUICK-CHECK.md](COPILOT-QUICK-CHECK.md)                                   | Quick Health Check             |
| [mcp-servers/README.md](../mcp-servers/README.md)                                       | MCP Server Policies            |
| [.devcontainer/VS-CODE-MCP-CACHE-ISSUE.md](../.devcontainer/VS-CODE-MCP-CACHE-ISSUE.md) | MCP Cache Troubleshooting      |

### Git Workflows

| Dokument                                                                        | Beschreibung                                  |
| ------------------------------------------------------------------------------- | --------------------------------------------- |
| [docs/governance/GIT-GOVERNANCE-POLICY.md](governance/GIT-GOVERNANCE-POLICY.md) | Branch Protection, Commit Signing, CODEOWNERS |
| [.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md)                           | Contribution Guidelines                       |
| [.github/CODE_OF_CONDUCT.md](../.github/CODE_OF_CONDUCT.md)                     | Code of Conduct                               |
| [.github/pull_request_template.md](../.github/pull_request_template.md)         | PR Template                                   |

### Figma Integration

| Dokument                                                                              | Beschreibung            |
| ------------------------------------------------------------------------------------- | ----------------------- |
| [figma-design-system/FIGMA-README.md](../figma-design-system/FIGMA-README.md)         | Design System Übersicht |
| [figma-design-system/FIGMA-SYNC-GUIDE.md](../figma-design-system/FIGMA-SYNC-GUIDE.md) | Token Sync Workflow     |
| [figma-design-system/COMPONENT-USAGE.md](../figma-design-system/COMPONENT-USAGE.md)   | Component Library       |
| [figma-design-system/BRAND-GUIDELINES.md](../figma-design-system/BRAND-GUIDELINES.md) | Rot-Weiß-Rot Branding   |
| [docs/ADMIN-FIGMA-INTEGRATION.md](ADMIN-FIGMA-INTEGRATION.md)                         | Admin-Integration       |

---

## 🚀 Operations & Deployment

**Deployment, Monitoring, Troubleshooting**

### Deployment

| Dokument                                                                            | Beschreibung                        |
| ----------------------------------------------------------------------------------- | ----------------------------------- |
| [deployment-scripts/README.md](../deployment-scripts/README.md)                     | Ansible + Plesk Deployment          |
| [deployment-scripts/deploy-api-plesk.sh](../deployment-scripts/deploy-api-plesk.sh) | API Deployment Script               |
| [deployment-scripts/deploy-crm-plesk.sh](../deployment-scripts/deploy-crm-plesk.sh) | CRM Deployment Script               |
| [scripts/safe-deploy.sh](../scripts/safe-deploy.sh)                                 | Multi-Service Safe Deployment       |
| [build-pipeline.sh](../build-pipeline.sh)                                           | Build Pipeline (Staging/Production) |

### Database Operations

| Dokument                                          | Beschreibung                       |
| ------------------------------------------------- | ---------------------------------- |
| [scripts/db-pull.sh](../scripts/db-pull.sh)       | Production DB → Local              |
| [scripts/db-push.sh](../scripts/db-push.sh)       | Local DB → Production (dangerous!) |
| [scripts/plesk-sync.sh](../scripts/plesk-sync.sh) | Plesk File Synchronization         |

### Troubleshooting

| Dokument                                                                                | Beschreibung      |
| --------------------------------------------------------------------------------------- | ----------------- |
| [automation/n8n/TROUBLESHOOTING.md](../automation/n8n/TROUBLESHOOTING.md)               | n8n Common Issues |
| [.devcontainer/VS-CODE-MCP-CACHE-ISSUE.md](../.devcontainer/VS-CODE-MCP-CACHE-ISSUE.md) | MCP Cache Issues  |

---

## 🎨 Design System

**Figma Design Tokens, Components, Branding**

| Dokument                                                                                                  | Beschreibung                       |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| [figma-design-system/FIGMA-README.md](../figma-design-system/FIGMA-README.md)                             | Design System Übersicht            |
| [figma-design-system/00_design-tokens.json](../figma-design-system/00_design-tokens.json)                 | Design Tokens (JSON)               |
| [figma-design-system/BRAND-GUIDELINES.md](../figma-design-system/BRAND-GUIDELINES.md)                     | Österreichische Corporate Identity |
| [figma-design-system/COMPONENT-USAGE.md](../figma-design-system/COMPONENT-USAGE.md)                       | Component Library                  |
| [figma-design-system/FIGMA-SYNC-GUIDE.md](../figma-design-system/FIGMA-SYNC-GUIDE.md)                     | Token Sync Workflow                |
| [figma-design-system/FIGMA-INTEGRATION-COMPLETE.md](../figma-design-system/FIGMA-INTEGRATION-COMPLETE.md) | Integration Success Report         |

---

## 🧪 Testing

**Unit Tests, E2E Tests, Coverage**

| Dokument                                        | Beschreibung                 |
| ----------------------------------------------- | ---------------------------- |
| [tests/README.md](../tests/README.md)           | Testing Strategy Overview    |
| [playwright.config.js](../playwright.config.js) | Playwright E2E Configuration |
| [vitest.config.js](../vitest.config.js)         | Vitest Unit Test Config      |
| [jest.config.cjs](../jest.config.cjs)           | Jest Config (Legacy)         |

---

## 📊 Quality & Reports

**Quality Reports, Security Scans, Status Updates**

### Quality Reports

| Dokument                                                                                            | Beschreibung        | Datum      |
| --------------------------------------------------------------------------------------------------- | ------------------- | ---------- |
| [quality-reports/CODACY-INTEGRATION-COMPLETE.md](../quality-reports/CODACY-INTEGRATION-COMPLETE.md) | Codacy Setup Report | 2025-10-03 |
| [quality-reports/QUALITY-STATUS-20251003.md](../quality-reports/QUALITY-STATUS-20251003.md)         | Quality Gate Status | 2025-10-03 |
| [quality-reports/GIT-LFS-MIGRATION-REPORT.md](../quality-reports/GIT-LFS-MIGRATION-REPORT.md)       | Git LFS Migration   | 2025-10-03 |
| [quality-reports/PHASE-0-COMPLETION-REPORT.md](../quality-reports/PHASE-0-COMPLETION-REPORT.md)     | Security Phase 0    | 2025-10-03 |

### Security Completion Reports

| Dokument                                                                                                                        | Beschreibung         |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| [docs/security/F-01-COMPLETION-REPORT.md](security/F-01-COMPLETION-REPORT.md)                                                   | Security Phase F-01  |
| [docs/security/F-02-COMPLETION-REPORT.md](security/F-02-COMPLETION-REPORT.md)                                                   | Security Phase F-02  |
| [docs/security/F-03-COMPLETION-REPORT.md](security/F-03-COMPLETION-REPORT.md)                                                   | Security Phase F-03  |
| [analysis/phase-0/verification/phase-0-verification-report.md](../analysis/phase-0/verification/phase-0-verification-report.md) | Phase 0 Verification |

---

## 📜 Legal & Governance

**Lizenzen, Third-Party Notices, Governance**

| Dokument                                                                            | Beschreibung                                |
| ----------------------------------------------------------------------------------- | ------------------------------------------- |
| [LICENSE](../LICENSE)                                                               | MIT License                                 |
| [docs/governance/GIT-GOVERNANCE-POLICY.md](governance/GIT-GOVERNANCE-POLICY.md)     | Git Governance (Branch Protection, Signing) |
| [docs/legal/DSGVO-COMPLIANCE-BLUEPRINT.md](legal/DSGVO-COMPLIANCE-BLUEPRINT.md)     | DSGVO Compliance Strategy                   |
| [docs/legal/WCAG-AA-COMPLIANCE-BLUEPRINT.md](legal/WCAG-AA-COMPLIANCE-BLUEPRINT.md) | WCAG AA Compliance                          |

---

## 📦 Archive

**Abgeschlossene Projekte, alte Reports, migrierte Dokumentation**

### Branch Management (Historisch)

| Dokument                                                            | Beschreibung                              | Status                  |
| ------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| [BRANCH-RENAME-TO-MAIN.md](../BRANCH-RENAME-TO-MAIN.md)             | Branch Rename chore/figma-mcp-make → main | ✅ Completed 2025-10-10 |
| [BRANCH-CLEANUP-REPORT.md](../BRANCH-CLEANUP-REPORT.md)             | Branch Cleanup Report                     | ✅ Completed 2025-10-10 |
| [QUICK-BRANCH-CHANGE.md](../QUICK-BRANCH-CHANGE.md)                 | Quick Fix Guide                           | ✅ Completed 2025-10-10 |
| [BRANCH-UMSTELLUNG-ANLEITUNG.md](../BRANCH-UMSTELLUNG-ANLEITUNG.md) | Branch Migration Guide                    | ✅ Completed 2025-10-09 |
| [BRANCH-PROTECTION-SETUP.md](../BRANCH-PROTECTION-SETUP.md)         | Branch Protection Setup                   | ✅ Completed 2025-10-09 |

### Setup Completion Reports (Historisch)

| Dokument                                                                    | Beschreibung            | Status                  |
| --------------------------------------------------------------------------- | ----------------------- | ----------------------- |
| [ENTERPRISE-SETUP-SUCCESS-REPORT.md](../ENTERPRISE-SETUP-SUCCESS-REPORT.md) | Enterprise Setup Report | ✅ Completed 2025-10-09 |
| [GITHUB-SECRETS-COMPLETE-SETUP.md](../GITHUB-SECRETS-COMPLETE-SETUP.md)     | GitHub Secrets Setup    | ✅ Completed 2025-10-09 |
| [GITHUB-SECRETS-SETUP.md](../GITHUB-SECRETS-SETUP.md)                       | GitHub Secrets Guide    | ✅ Completed 2025-10-09 |
| [GITHUB-TOKEN-SETUP.md](../GITHUB-TOKEN-SETUP.md)                           | GitHub Token Setup      | ✅ Completed 2025-10-09 |
| [PR62-SECURITY-FIXES.md](../PR62-SECURITY-FIXES.md)                         | Security Fixes PR #62   | ✅ Completed 2025-10-10 |

### Migration & Integration (Historisch)

| Dokument                                                                                                      | Beschreibung                 | Status                  |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------- |
| [figma-design-system/FIGMA-INTEGRATION-COMPLETE.md](../figma-design-system/FIGMA-INTEGRATION-COMPLETE.md)     | Figma Integration Complete   | ✅ Completed 2025-10-03 |
| [figma-design-system/FIGMA-IMPLEMENTATION-SUMMARY.md](../figma-design-system/FIGMA-IMPLEMENTATION-SUMMARY.md) | Figma Implementation Summary | ✅ Completed 2025-10-03 |
| [quality-reports/GIT-LFS-MIGRATION-REPORT.md](../quality-reports/GIT-LFS-MIGRATION-REPORT.md)                 | Git LFS Migration            | ✅ Completed 2025-10-03 |

### Troubleshooting Guides (Referenz)

| Dokument                                                        | Beschreibung                      |
| --------------------------------------------------------------- | --------------------------------- |
| [CODESPACE-TROUBLESHOOTING.md](../CODESPACE-TROUBLESHOOTING.md) | GitHub Codespaces Troubleshooting |
| [ZUGANGSDATEN-CHECKLISTE.md](../ZUGANGSDATEN-CHECKLISTE.md)     | Credentials Checklist             |

---

## 🔍 Suche & Navigation

### Nach Thema suchen

- **Security**: `docs/security/`, `analysis/phase-0/threat-model/`
- **DSGVO**: `docs/compliance/`, `docs/legal/DSGVO-*`
- **Deployment**: `deployment-scripts/`, `scripts/safe-deploy.sh`
- **Design**: `figma-design-system/`
- **Testing**: `tests/`, `playwright.config.js`
- **API**: `api.menschlichkeit-oesterreich.at/`
- **Frontend**: `frontend/`
- **CRM**: `crm.menschlichkeit-oesterreich.at/`

### Nach Rolle suchen

- **Neue Entwickler**: [Getting Started](#-getting-started)
- **Frontend Developer**: [Architecture → Frontend](../frontend/README.md), [Design System](#-design-system)
- **Backend Developer**: [Architecture → API](../api.menschlichkeit-oesterreich.at/README.md)
- **DevOps**: [Operations & Deployment](#-operations--deployment)
- **Security Engineer**: [Security & Compliance](#-security--compliance)
- **QA Engineer**: [Testing](#-testing), [Quality & Reports](#-quality--reports)

---

## 📞 Hilfe & Support

- **Bugs**: [GitHub Issues](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues/new?template=bug_report.md)
- **Feature Requests**: [Feature Request](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues/new?template=feature_request.md)
- **Security**: [Security Vulnerability](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues/new?template=security_vulnerability.md)
- **Documentation Issues**: [Documentation Request](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues/new?template=documentation.md)

---

<div align="center">
  <strong>Dokumentation zuletzt aktualisiert: 2025-10-10</strong>
  <br>
  <sub>Bei Fragen: <a href="../.github/CONTRIBUTING.md">Contributing Guide</a> lesen</sub>
</div>
