# Menschlichkeit Österreich – Copilot Leitfaden

Austrian NGO multi-service platform with strict GDPR compliance, automated quality gates, and MCP-enhanced development workflow.

## Code Style

- **Language:** Österreichisches Deutsch (de-AT) für alle UI-Texte und Kommentare
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS; PascalCase Komponenten, named exports + hooks
- **API:** FastAPI + Python 3.12+; Pydantic v2 Schemas, RBAC decorators (`require_auth`, `require_role`)
- **Database:** German snake_case Spalten (`vorname`, `mitgliedschaft_typ`); Alembic für komplexe Schemas, CREATE TABLE für einfache
- **Linting:** ESLint (auto-fix), PHPStan, Markdownlint; ignoriert: `vendor/`, `dist/`, `.venv/`, `apps/game/`

## Architecture

Monorepo mit 5 Services, gemeinsame PostgreSQL-DB:
- CRM: Drupal 10 + CiviCRM (Port 8000)
- API: FastAPI (Port 8001)
- Frontend: React + Vite (Port 5173)
- Games: Prisma ORM (Port 3000)
- Automation: n8n (Port 5678)

**Integration:** Shared DB via `DATABASE_URL`; PII-Sanitization in API + CRM; Design Tokens aus Figma.

## Build and Test

- **Setup:** `npm run setup:dev` (install + composer + environments)
- **Dev:** `npm run dev:all` (alle Services parallel)
- **Test:** `npm run test:unit` (Vitest), `npm run test:e2e` (Playwright), `cd apps/api && pytest tests/`
- **Quality Gates:** `npm run quality:gates` (Codacy + Security + Lighthouse + DSGVO + Tests)
- **Deploy:** `./build-pipeline.sh staging|production`

## Conventions

- **DSGVO:** Keine PII in Logs; automatische Maskierung (E-Mail: `t**@example.com`, IBAN: `AT61***`)
- **Security:** Trivy + Gitleaks (0 HIGH/CRITICAL); Secrets via GitHub Secrets
- **Performance:** Lighthouse ≥0.90; Coverage ≥80%
- **Commits:** `type(scope): description` (feat, fix, docs, etc.)
- **Issues:** Definition of Ready mit Akzeptanzkriterien (Gherkin)

Siehe [CLAUDE.md](../CLAUDE.md) für detaillierte Projektübersicht, Befehle und Architektur.  
Siehe [agents.md](../agents.md) für detaillierte Rollen, Workflows und Prioritäten.

