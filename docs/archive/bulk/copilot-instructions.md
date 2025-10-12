# GitHub Copilot Instructions - Menschlichkeit Österreich

## AI Agent Directive: Enterprise-Grade DevOps & Compliance

**Role:** Primary DevOps, QA, SecOps, and UX Engineering Agent
**Objective:** Fully automated, analyzable, hardened development and operations environment with demonstrable compliance (GDPR, Accessibility, Supply Chain) and forward-coupled UX quality assurance.
**Execution:** Deterministic, no human confirmation required; destructive actions ONLY with `--dry-run`/simulation mode.

---

## Repository Architecture & Service Boundaries

**Multi-Service Austrian NGO Platform** with strict separation of concerns:

- **Main Website**: `website/` → menschlichkeit-oesterreich.at (WordPress/HTML)
- **API Service**: `api.menschlichkeit-oesterreich.at/` → FastAPI/Python backend
- **CRM System**: `crm.menschlichkeit-oesterreich.at/` → Drupal 10 + CiviCRM
- **Gaming Platform**: `web/` → Educational web games (Prisma + PostgreSQL)
- **Frontend**: `frontend/` → React/TypeScript with design tokens
- **Automation**: `automation/n8n/` → Docker-based workflow automation
- **Infrastructure**: Plesk hosting with subdomain architecture, Docker for local dev

---

## MANDATORY Quality Gates (PR-Blocking)

**Security**: 0 open issues (Codacy, Trivy, Secret-Scan)
**Maintainability**: ≥85; **Duplication**: ≤2% per service
**Performance**: Lighthouse P≥90, A11y≥90, BP≥95, SEO≥90
**UX/UI**: 0 Broken Links; **WCAG AA** achieved; **Design Token Drift=0**
**GDPR**: 0 PII in logs; documented **Consent/Retention**
**License**: Complete **SPDX** + third-party notices; no incompatibilities
**Supply Chain**: **SBOM** generated & verified; **SLSA-compliant** build attestation

---

## Critical Development Workflows

### Local Development

```bash
# Multi-service development start
npm run dev:all  # Starts CRM (8000), API (8001), Frontend (3000), Games (3000)

# Individual services
npm run dev:crm     # PHP local server for CRM
npm run dev:api     # FastAPI uvicorn server
npm run dev:frontend # React dev server
npm run dev:games   # Python HTTP server for games

# Automation & Infrastructure
npm run n8n:start    # Start n8n automation (Docker)
npm run dev:essential # Essential MCP stack
npm run dev:web      # Web MCP stack
```

### Build & Deploy Pipeline

```bash
# Quality checks (required before deploy)
npm run lint:all && npm run format:all
./build-pipeline.sh production

# Plesk deployment (production-ready scripts)
./scripts/safe-deploy.sh              # Safe deployment with pre-checks
./deployment-scripts/deploy-crm-plesk.sh   # CRM-specific deployment
./deployment-scripts/deploy-api-plesk.sh   # API-specific deployment

# Automated builds with n8n integration (sends webhook notifications)
./build-pipeline.sh staging --skip-tests   # Fast staging build
./build-pipeline.sh production --force     # Override lint/test failures
```

### Database & Sync Operations

```bash
# Plesk server synchronization (dry-run first!)
./scripts/plesk-sync.sh pull          # Preview remote→local
./scripts/plesk-sync.sh pull --apply  # Execute remote→local
./scripts/plesk-sync.sh push --apply  # Execute local→remote (dangerous!)

# Database operations
./scripts/db-pull.sh    # Pull production DB to local
./scripts/db-push.sh --apply  # Push local DB (dangerous!)
```

---

## Codacy MCP Integration (MANDATORY)

**After every file change**: Execute `codacy_cli_analyze(rootPath, file=changed_file)`
**After package events** (npm/composer/pip): Execute `codacy_cli_analyze tool="trivy"`; if CVE hits **STOP → FIX → RE-SCAN**
**CLI missing**: Installation only after explicit approval; then continue analysis
**Nightly**: Archive trend reports (Maintainability, Duplication, Security)

---

## Tech Stack Specifics

**Monorepo**: npm workspaces (`frontend`, `website`, `mcp-servers/*`, `servers`, `automation/n8n`)
**Database**: PostgreSQL with Prisma ORM (`schema.prisma` defines educational gaming models)
**Quality**: Codacy integration, ESLint SARIF reports, PHPStan for PHP code
**Testing**: Playwright E2E with results in `playwright-results/`
**Automation**: n8n workflows with webhook integration for build notifications

### Configuration Management

- Use `config-templates/` for reusable configuration patterns### Build & Deploy Pipeline

- Environment-specific configs in respective service directories

- Plesk deployment configs follow documented subdomain architecture```bash

# Quality checks (required before deploy)

### Testing Strategynpm run lint:all && npm run format:all

- Playwright for E2E testing across all domains./build-pipeline.sh production

- PHP unit tests for backend services

- Test results stored in `test-results/` with timestamped reports# Plesk deployment (production-ready scripts)

./scripts/safe-deploy.sh # Safe deployment with pre-checks

### Deployment Patterns./deployment-scripts/deploy-crm-plesk.sh # CRM-specific deployment

- Ansible-based deployment via `deployment-scripts/ansible/`./deployment-scripts/deploy-api-plesk.sh # API-specific deployment

- Nginx reverse proxy configuration

- Multi-subdomain Plesk hosting setup documented in root analysis files# Automated builds with n8n integration (sends webhook notifications)

./build-pipeline.sh staging --skip-tests # Fast staging build

## Integration Points./build-pipeline.sh production --force # Override lint/test failures

````

### External Dependencies

- **Figma**: Design system sync documented in `FIGMA-TO-CODE-SYNC-ANALYSIS.md`### Database & Sync Operations

- **WordPress**: Migration and integration patterns in `WORDPRESS-MIGRATION-SUCCESS.md`

- **Plesk**: Hosting configuration in `PLESK-*.md` files```bash

# Plesk server synchronization (dry-run first!)

### Cross-Component Communication./scripts/plesk-sync.sh pull          # Preview remote→local

- OpenAPI specifications define service contracts./scripts/plesk-sync.sh pull --apply  # Execute remote→local

- Shared design tokens from `figma-design-system/`./scripts/plesk-sync.sh push --apply  # Execute local→remote

- Common build and deployment pipeline via shell scripts

# Database operations

## Development Notes./scripts/db-pull.sh    # Pull production DB to local

./scripts/db-push.sh --apply  # Push local DB (dangerous!)

When working with this codebase:```

1. Check relevant `.md` analysis files for context on architectural decisions

2. Use existing test scripts before deploying changes## Project-Specific Patterns

3. Follow the established subdomain patterns for new services

4. Leverage the comprehensive quality reporting system for code health### Multi-Environment Configuration

- **Config Templates**: `config-templates/` contains environment-specific templates
- **Secrets Management**: Encrypted secrets in `secrets/` directory with PowerShell decrypt scripts
- **Environment Detection**: Scripts auto-detect development vs staging vs production

### Design System Integration

- **Figma Tokens**: `figma-design-system/00_design-tokens.json` → auto-generates CSS variables
- **Sync Command**: `npm run figma:sync` updates design tokens from Figma API
- **Tailwind Integration**: `tailwind.config.js` consumes design tokens for Austrian red-white-red branding

### CiviCRM + API Integration Pattern

- **CRM Database**: Separate MariaDB for CiviCRM in `crm.menschlichkeit-oesterreich.at/`
- **API Bridge**: FastAPI service bridges CRM data for frontend consumption
- **Authentication Flow**: JWT tokens from API service, validated in CRM system

### Educational Gaming Platform

- **Database Models**: Prisma schema defines `User`, `Achievement`, `GameSession` with XP/leveling system
- **Game Types**: Enum includes `VOTING_PUZZLE`, `CONSTITUTION_QUEST`, `DEMOCRACY_SIMULATOR`
- **Integration**: Games connect to PostgreSQL via Prisma client for progress tracking

## Quality & Compliance

### Code Quality Enforcement

- **Codacy Integration**: Auto-runs after file edits via MCP server
- **Multi-Language**: PHPStan for PHP, ESLint for JS/TS, Python linting for FastAPI
- **SARIF Reports**: `npm run lint:sarif` generates security scanning reports
- **Build Pipeline**: `./build-pipeline.sh` with environment-specific validation and n8n webhook notifications

### DSGVO/Privacy Patterns

- **Data Minimization**: Prisma models use minimal required fields
- **Consent Management**: CiviCRM handles newsletter subscriptions with explicit consent
- **Right to Deletion**: Cascade delete patterns in Prisma schema

### Austrian NGO Compliance

- **Language Strategy**: German UI text, English technical docs
- **Corporate Identity**: Rot-Weiß-Rot color scheme enforced via design tokens
- **Legal Requirements**: SEPA payment integration for membership fees

## Integration Points

### Frontend ↔ API Communication

- **Configuration**: `frontend/src/services/config.ts` reads `VITE_API_BASE_URL`
- **HTTP Wrapper**: Centralized in `frontend/src/services/http.ts`
- **Authentication**: JWT tokens stored in localStorage, auto-refresh pattern

### CRM ↔ API Data Flow

- **Contact Sync**: API endpoints read/write CiviCRM contact data
- **Membership Management**: API handles membership status changes, syncs to CRM
- **Payment Processing**: SEPA integration through CiviCRM, status updates via API

## MCP Integration & Tooling

### Model Context Protocol Setup

- **MCP Configuration**: `mcp.json` defines filesystem, git, and docker servers
- **Server Management**: `scripts/start-mcp-servers.ps1` manages MCP server lifecycle
- **VS Code Integration**: `.vscode/` contains optimized profiles for web, PHP, and cloud development

### VS Code Workspace Optimization

- **Multi-Profile Setup**: Use `web.code-profile`, `php.code-profile`, or `cloud.code-profile` for focused development
- **Task Runner**: `.vscode/tasks.json` provides shortcuts for build/test/deploy across all languages
- **Debug Configuration**: Multi-service debugging with compound launch configs for parallel debugging

### Secrets & Environment Management

- **Config Templates**: `config-templates/` contains environment-specific templates with placeholders
- **Secret Management**: PowerShell scripts in `secrets/` for encryption/decryption (use `scripts/secrets-decrypt.ps1`)
- **Environment Detection**: Scripts auto-detect development vs staging vs production via environment variables

---

## Enterprise Pipeline Execution (Strict Sequencing)

### 1. Workspace Sanity → 2. Build & Lint → 3. Security Layer → 4. GDPR/Compliance → 5. Testing & Performance → 5a. CiviCRM & n8n Integration Suite → 6. UX/UI Audits → 7. Observability & Monitoring → 8. Backup/Recovery/Failover → 9. Developer Experience → 10. Deployment Simulation → 11. Data & DB Synchronization → 12. Production Readiness → 13. Extended Checks → 14. Codacy MAX Finalization → 15. Complete Report

### Critical Success Criteria
- **Security**: CVE = 0 (Trivy/Codacy/Secret-Scan)
- **Business Continuity**: RPO ≤ 24h, RTO ≤ 4h in drill
- **Supply Chain**: SBOM + SLSA attestation + signed container images
- **Repository Governance**: Branch protection + signed commits + CODEOWNERS
- **Integrations Health**: CiviCRM↔n8n↔API success rate ≥99%, median latency <60s

### Mandatory Compliance Reports
Generate all reports under `quality-reports/` with timestamps and RACI matrices:
- `security-findings.md`, `threat-model.md`, `dsgvo-check.md`, `license-audit.md`
- `civicrm-integration.md`, `n8n-flows.md`, `n8n-dpia.md`
- `sbom.md`, `vault-check.md`, `chaos-report.md`, `complete-analysis.md`

---

## Development Guidelines

When working with this codebase:
1. **ALWAYS** run Codacy analysis after file changes
2. Check existing scripts in `scripts/` and `deployment-scripts/` before creating new automation
3. Follow established subdomain patterns for new services
4. Use `--dry-run` simulation for all destructive operations
5. Verify all quality gates before deployment
6. Document integration patterns in `contracts/` directory
7. **Stop immediately** on Security/GDPR/License/Integration gate violations
8. Generate timestamped reports with risk assessments and action plans
````
