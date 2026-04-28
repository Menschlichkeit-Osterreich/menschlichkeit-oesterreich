# System-Übersicht – Menschlichkeit Österreich

**Stand**: 2026-03-08 | Version: 3.0

## Überblick

Menschlichkeit Österreich betreibt eine Multi-Service-Plattform als npm-Workspace-Monorepo. Alle Services teilen sich eine PostgreSQL-Instanz und werden über Plesk-Subdomains bereitgestellt.

```text
menschlichkeit-oesterreich.at      → Website (HTML/WordPress)
api.menschlichkeit-oesterreich.at  → FastAPI Backend
crm.menschlichkeit-oesterreich.at  → Drupal 10 + CiviCRM
forum.menschlichkeit-oesterreich.at → phpBB
n8n.menschlichkeit-oesterreich.at  → n8n Automation
```

## Service-Architektur

```text
┌─────────────────────────────────────────────┐
│              Plesk (5.183.217.146)           │
│                                             │
│  ┌──────────┐  ┌─────────┐  ┌───────────┐  │
│  │ Website  │  │   API   │  │    CRM    │  │
│  │ HTML/WP  │  │ FastAPI │  │ Drupal 10 │  │
│  │  :443    │  │  :8001  │  │  + CiviCRM│  │
│  └──────────┘  └────┬────┘  └─────┬─────┘  │
│                     │             │         │
│  ┌──────────┐  ┌────▼─────────────▼──────┐  │
│  │  Games   │  │    PostgreSQL ≥15        │  │
│  │ (Prisma) │  │    (gemeinsame DB)       │  │
│  │  :3000   │  └─────────────────────────┘  │
│  └──────────┘                               │
│  ┌──────────┐  ┌─────────────────────────┐  │
│  │   n8n    │  │         Redis           │  │
│  │ Docker   │  │    (Sessions, Cache)    │  │
│  │  :5678   │  └─────────────────────────┘  │
│  └──────────┘                               │
└─────────────────────────────────────────────┘
```

## Technologie-Stack

| Schicht         | Technologie               | Version            |
| --------------- | ------------------------- | ------------------ |
| Frontend        | React + TypeScript + Vite | React 18           |
| API             | FastAPI + Python          | 3.12+              |
| CRM             | Drupal + CiviCRM          | Drupal 10, PHP 8.1 |
| Games           | Statisch + Prisma ORM     | PostgreSQL         |
| Automation      | n8n (Docker)              | 1.72.1             |
| DB              | PostgreSQL                | ≥15                |
| Cache           | Redis                     | 7                  |
| ORM (API)       | SQLAlchemy + Alembic      | —                  |
| ORM (Games)     | Prisma                    | —                  |
| Package Manager | npm Workspaces            | npm 10+            |

## Datenflüsse

### Authentifizierung

```text
Browser → Frontend → API (/auth/login) → JWT → Frontend (localStorage/Cookie)
                                            ↓
                                    PostgreSQL (users)
```

### CRM-Integration

```text
Frontend → API → CiviCRM API → Drupal DB (MariaDB)
```

### Design-Token-Sync

```text
Figma → figma-mcp-server → figma-design-system/00_design-tokens.json
     → frontend/tailwind.config.cjs → CSS Custom Properties
```

### Automation

```text
GitHub Actions → n8n Webhook → Workflow → E-Mail / Slack / DB
```

## Migrationsverantwortlichkeiten

| Service | ORM     | Befehl                   | Koordination                     |
| ------- | ------- | ------------------------ | -------------------------------- |
| API     | Alembic | `alembic upgrade head`   | Muss mit Games abgestimmt werden |
| Games   | Prisma  | `npx prisma migrate dev` | Muss mit API abgestimmt werden   |
| CRM     | Drupal  | `drush updb`             | Unabhängig (eigene MariaDB)      |

**Wichtig:** API und Games teilen sich PostgreSQL. Schema-Änderungen müssen koordiniert werden.

## Repository-Struktur (wesentliche Verzeichnisse)

```text
/
├── api.menschlichkeit-oesterreich.at/  # FastAPI Backend
├── apps/                               # Workspace-Aliases (api, crm, game, website)
├── automation/n8n/                     # n8n Docker + Workflows
├── crm.menschlichkeit-oesterreich.at/ # Drupal + CiviCRM
├── docs/                              # Dokumentation (dieser Index: docs/index.md)
├── figma-design-system/               # Design Tokens
├── frontend/                          # React Frontend (Vite)
├── mcp-servers/                       # MCP Server (Figma, File-Server)
├── packages/design-system/            # Shared Design-System-Package
├── packages/ui/                       # Shared UI-Components
├── runbooks/                          # Betriebshandbücher
├── scripts/                           # Build, Deploy, CI/CD Skripte
├── web/                               # Educational Games
└── website/                           # Öffentliche Website
```

## CI/CD-Pipeline

49 GitHub Actions Workflows. Wichtigste:

| Workflow             | Trigger        | Funktion                     |
| -------------------- | -------------- | ---------------------------- |
| `ci.yml`             | Push/PR        | Haupt-CI (Lint, Test, Build) |
| `quality.yml`        | Push/PR        | ESLint, Qualitätschecks      |
| `security.yml`       | Täglich + Push | Snyk + Trivy                 |
| `codeql.yml`         | Push/PR        | SAST JavaScript/Python       |
| `gitleaks.yml`       | Push           | Secret Scanning              |
| `deploy-plesk.yml`   | main Push      | Produktions-Deployment       |
| `deploy-staging.yml` | main Push      | Staging-Deployment           |
| `sbom-cyclonedx.yml` | Release        | SBOM-Generierung             |
