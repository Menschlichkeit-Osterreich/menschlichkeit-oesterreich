---
title: Changelog
description: Alle relevanten Änderungen an diesem Repository werden in diesem Dokument festgehalten.
lastUpdated: 2026-03-15
status: ACTIVE
category: project
tags:
  - changelog
  - version-history
  - releases
version: 2.0.0
language: de-AT
audience:
  - Developers
  - Contributors
  - Users
---

# Changelog

Alle relevanten Änderungen an diesem Repository werden in diesem Dokument festgehalten.

## [Unreleased] — 2026-03-16

### Security

- fix(nginx): Host-Header-Injection in HTTP→HTTPS-Redirect behoben — `api.menschlichkeit-oesterreich.at.conf` und `crm.menschlichkeit-oesterreich.at.conf` verwenden nun hardcodierte Hostnamen statt `$host`; `nosemgrep`-Kommentare ergänzt
- fix(nginx): `/metrics`-Endpunkt in `api.menschlichkeit-oesterreich.at.conf` auf `allow 127.0.0.1; deny all;` beschränkt — verhindert öffentlichen Zugriff auf Prometheus-Metriken
- fix(dsgvo): `auth.py` — fünf `logger.info()`-Aufrufe mit ungemaskten E-Mail-Adressen verwenden nun `scrub()` aus `pii_sanitizer`
- fix(dsgvo): `invoices.py` — `target_email` in Log-Ausgabe wird nun via `scrub()` maskiert
- fix(dsgvo): `PiiLoggingMiddleware` in `app/main.py` registriert — war implementiert aber nie aktiviert
- fix(infra): `secrets/development/*.yaml` und `secrets/production/*.yaml` aus Git-Tracking entfernt und in `.gitignore` eingetragen

### Architecture

- fix(routing): Doppelte Route `/Login` (case-variant) aus `App.tsx` entfernt
- fix(routing): Redundante Route `/home` aus `App.tsx` und `AppRoutes.tsx` entfernt — Index-Route (`/`) ist kanonisch
- fix(cron): PHP-Pfad in `setup-cron-jobs.sh` auf auto-detect geändert — bevorzugt `/opt/plesk/php/8.3/bin/php` oder `/opt/plesk/php/8.4/bin/php`, fallback auf `/usr/bin/php`; behebt "No such file or directory" Fehler für Cron-Jobs

### Configuration

- docs(php): PHP-Versionen in `plesk-deployment.instructions.md` aktualisiert — 8.4.11 als empfohlen markiert, Cron-Job-Pfad-Probleme dokumentiert
- config(env): `PHP_VERSION=8.4.11` zu `.env.production.template` hinzugefügt

## [Unreleased] — 2026-03-15

### Security

- fix(seo): JsonLdScript.tsx — Semgrep-Suppression und ESLint-Disable mit vollständiger Sicherheitsbegründung für `dangerouslySetInnerHTML`; `serializeJsonLd()` escapet alle XSS-Vektoren (`<`, `>`, `&`, U+2028, U+2029), kein User-Input erreichbar
- fix(nginx): HTTP→HTTPS- und bare-domain→www-Redirects in separate `server`-Blöcke aufgeteilt; `nosemgrep`-Kommentare mit Begründung — explizite Hostnamen, kein `$host`/`$http_host` in Redirect-Location-Headers
- fix(quality): Ungenutzten `import hmac` aus `scripts/seed-test-users.py` entfernt (Bandit/Semgrep-Fund F401)
- fix(security): Hardcodierte CI-Secrets aus Workflows entfernt (#228)
- fix(security): Gitleaks-Gate erzwungen, Security-Alerts bereinigt (#227)

### Added

- feat(api): PiiSanitizer-Library mit Phone-Spaces-Erweiterung (`apps/api/app/lib/pii_sanitizer.py`, `app/middleware/pii_middleware.py`); identische Kopie in `api.menschlichkeit-oesterreich.at/` synchron gehalten (#242)
- feat(seo): Vollständige SSG-Migration — react-helmet-async, JSON-LD-Komponenten (Article, Breadcrumb, Event, FAQ, Organization, Person, Home), dynamische Sitemap-API (`GET /sitemap.xml`), statische `robots.txt` (#247)
- feat(seo): Prerender-Script `apps/website/scripts/prerender.mjs` für 21 statische Routen; Pfadnormalisierung via `route.replace(/^\//, '')` gehärtet
- feat(website): Neue Seiten: Team, Presse, Transparenz, Themen-Index, Demokratie, Menschenrechte, Soziale Gerechtigkeit, SpendenCTA-Komponente (#247)
- feat(api): Finance-Router `apps/api/app/routers/invoices.py` — Endpunkte: `GET/POST /api/invoices`, `/api/invoices/{id}`, `/api/invoices/{id}/download`, `/api/invoices/{id}/send`, `/api/donations`, `/api/donations/{id}`, `/api/sepa/mandates`, `/api/sepa/batches` (#248)
- feat(api): Alembic-Migrations für Finance-Schema (`apps/api/alembic/versions/001_initial_schema.py`, `002_missing_tables.py`) — users, invoices, invoice_items, payment_intents, donations, sepa_mandates, sepa_batches, dunning_runs, audit_log (#248)
- feat(api): Dockerfile für `apps/api/` (#248)
- feat(ci): OpenAPI-Drift-Erkennung Workflow `.github/workflows/openapi-drift.yml` (#248)
- feat(api): Sitemap-Router `apps/api/app/routers/sitemap.py` mit dynamischen Blog- und Event-URLs, XML-Escaping, 1h-Cache-Header (#247)
- feat(api): Testbenutzer-Seed-Script `apps/api/scripts/seed_test_users.py` für alle 7 Testrollen (#247)
- feat(crm): CiviRules für Spendenprozess und Mitgliedschafts-Ablauf; 4 SearchKit-Views (Kontakte 360°, Donor Dashboard, Event-Teilnehmer, Mitglieder-Status); 3 Webformulare (Event-Anmeldung, Mitglied-SEPA, Spenden-Stripe) (#248)
- feat(metrics): RBAC für Dashboard-Endpunkte (#229, #236); Audit-Logging, Rate-Limiting
- feat(monitoring): `security/monitoring.py` — 5 audit_trail-basierte Metriken implementiert: erfolgreiche Logins, aktive Sitzungen (Distinct-Actor-Proxy), 2FA-Events, DSGVO-Datenexporte, Passwortänderungen; psycopg2-Integration mit graceful fallback
- feat(deploy): Nginx-Konfiguration `deployment-scripts/nginx/menschlichkeit-oesterreich.at.conf` — TLS 1.2+, HSTS (1y preload), Security Headers, SPA-Fallback, Sitemap-Proxy mit Timeout-Absicherung
- feat(docs): SEO-Audit-Runner `tools/audit/seo_audit.py` und generierter Report (`reports/audit/SEO-AUDIT-REPORT.md`) (#246)
- feat(api): OpenAPI-Spezifikation `apps/api/openapi.yaml` — neue Endpunkte dokumentiert: `/sitemap.xml`, `/api/invoices/*`, `/api/donations/*`, `/api/sepa/*`

### Changed

- docs(db): CLAUDE.md — Alembic als approved Exception für Finance-Schema dokumentiert; CREATE TABLE IF NOT EXISTS bleibt Standard für alle anderen Router
- docs(architecture): Vollständiger Infrastruktur-Audit und Zielarchitektur (#234, #239)
- chore(deps): Prisma, Vite, FastAPI, uvicorn, pyjwt, python-multipart, reportlab, redis, trivy-action, setup-node, codeql-action aktualisiert
- fix(ci): AJV-CLI Version, ESLint max-warnings, CodeQL-Pfade (#245); blockierte Workflows verhindert (#238)

## [1.0.0] — 2025-10-13

### Added

- docs(readme): Modernisiertes README mit TOC, Configuration, Testing, Deployment, Security & DSGVO
- docs: Added docs/PRIVACY.md (DSGVO-Übersicht)
- docs: Added docs/legal/WCAG-AA-COMPLIANCE-BLUEPRINT.md
- docs: Added docs/legal/THIRD-PARTY-NOTICES.md
- docs: Added figma-design-system/FIGMA-README.md
- security: Added SECURITY.md (Responsible Disclosure Policy)

### Changed

- Updated badges and fixed links to avoid dead references

### Notes

- Lint-Fehler in kompilierten dist-Assets sind erwartet und vom Lint-Lauf ausgeschlossen.
- Alembic-Migrations nach DB-Neuanlage ausführen: `cd apps/api && alembic upgrade head`
- SSG-Build-Reihenfolge: `npm run build` → `npm run build:ssr` → `node apps/website/scripts/prerender.mjs`
