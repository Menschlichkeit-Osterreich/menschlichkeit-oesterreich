# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Menschlichkeit Österreich is a multi-service NGO platform for democratic participation and community engagement in Austria. **Security > Datenintegrität > Stabilität > Velocity.** All UI text must be in Österreichisches Deutsch (Austrian German).

## Services & Ports

| Service | Location | Tech | Port |
|---------|----------|------|------|
| Frontend | `apps/website/` or `frontend/` | React 18 + TS + Vite | 5173 |
| API | `apps/api/` or `api.menschlichkeit-oesterreich.at/` | FastAPI (Python 3.12+) | 8001 |
| CRM | `apps/crm/` or `crm.menschlichkeit-oesterreich.at/` | Drupal 10 + CiviCRM (PHP 8.1) | 8000 |
| Games | `apps/game/` or `web/` | Static + Prisma schema | 3000 |
| n8n Automation | `automation/n8n/` | Docker | 5678 |
| OpenClaw Tool-Gateway | `openclaw-system/api/fastapi_gateway/` | FastAPI | 9101 |
| OpenClaw Agent-Runtime | `openclaw-system/api/agent_runtime/` | Python asyncio | 9100 |
| Windows-Bridge | `openclaw-system/windows-bridge/` | PowerShell/Node | 18790 |

## Key Commands

### Setup & Dev

```bash
npm run setup:dev          # Full setup (install + composer + environments)
npm run dev:all            # Start all services concurrently
npm run dev:frontend       # Frontend only (Vite)
npm run dev:api            # API only
npm run dev:crm            # CRM only (php -S localhost:8000)
npm run dev:games          # Games only (python http.server)
npm run docker:up          # Start PostgreSQL + Redis + n8n
```

### Testing

```bash
npm run test:unit          # Vitest (unit tests)
npm run test:e2e           # Playwright (e2e tests)
# Python tests (in api directory):
pytest tests/test_pii_sanitizer.py
```

### Linting & Formatting

```bash
npm run lint               # ESLint
npm run lint:all           # JS + PHP + Markdown
npm run format             # Prettier
npm run lint:php           # PHPStan
npm run format:php         # php-cs-fixer
```

### Quality Gates (PR-blocking)

```bash
npm run quality:gates      # All gates: Codacy + Security + Lighthouse + DSGVO + Reports
npm run security:scan      # Trivy + Bandit + Gitleaks
npm run performance:lighthouse
npm run compliance:dsgvo
```

### Database

```bash
npm run docker:up          # Start PostgreSQL/Redis
npx prisma migrate dev     # Prisma migrations (Games)
npx prisma generate        # Regenerate Prisma client
npx prisma studio          # Prisma Studio UI
# API migrations (Alembic, in api directory):
alembic upgrade head
```

### OpenClaw Multi-Agent System

```bash
bash openclaw-system/scripts/boot.sh    # Start OpenClaw stack
bash openclaw-system/scripts/smoke.sh   # Smoke tests
# Windows Bridge (PowerShell as Admin):
# C:\openclawd-win-bridge\installer\Install-OpenClawBridge.ps1
```

### Build & Deploy

```bash
npm run build:frontend
./build-pipeline.sh staging|production [--skip-tests|--force]
```

## Architecture

### Monorepo Structure

npm workspaces root. Services exist in both `apps/<name>/` and legacy `<name>.menschlichkeit-oesterreich.at/` directories. The `packages/` directory contains shared `design-system` and `ui` packages.

### Shared PostgreSQL Database

All services share one PostgreSQL ≥15 instance via `DATABASE_URL`. Two migration systems coexist — **Alembic** (API/FastAPI) and **Prisma** (Games) — coordinate schema changes across both.

### Design Tokens

Design tokens live in `figma-design-system/00_design-tokens.json`. **Never hardcode colors or spacing** — always use tokens. They are consumed via `frontend/tailwind.config.cjs` and regenerated with `frontend/scripts/generate-design-tokens.mjs`. Sync with Figma: `npm run figma:sync`.

### DSGVO/PII Compliance (Critical)

- **FastAPI**: `app/middleware/pii_middleware.py` + `app/lib/pii_sanitizer.py`
- **Drupal**: custom module `web/modules/custom/pii_sanitizer/`
- Rules: No PII in logs. E-mail masking (`t**@example.com`), IBAN redaction (`AT61***`).
- Test: `pytest tests/test_pii_sanitizer.py`

### OpenClaw Multi-Agent System (`openclaw-system/`)

Six specialized AI agents (Orchestrator, Research, Code, Write, QA, Memory) communicate via NATS JetStream (port 4222). All agent tool calls route through the Tool-Gateway (policy engine + audit log). Agents connect to PostgreSQL, Redis, and Qdrant (port 6333) for persistence. See `openclaw-system/ARCHITECTURE.md` for full details.

### Windows-Bridge

Enables communication between Windows apps and OpenClaw running in WSL2/Docker:
`Windows-App → Bridge (port 18790) → WSL2 → Docker → Services`

## Branch & Commit Conventions

**Git Flow**: branch from `develop`, PR back to `develop`, then merge to `main` (protected).

Branch naming: `feature/<issue>-<description>`, `fix/<issue>-<description>`, `docs/<issue>-<description>`

**Conventional Commits** (enforced via commitlint):

```text
feat(scope): description    → minor version bump
fix(scope): description     → patch version bump
docs/test/chore/refactor    → no version bump
```

## OpenAPI & API Contract

Keep `api.menschlichkeit-oesterreich.at/openapi.yaml` in sync with endpoints at all times.

## MCP Servers

Project ships its own MCP servers in `mcp-servers/` (figma-mcp-server, file-server). Configuration in `mcp.json`.
