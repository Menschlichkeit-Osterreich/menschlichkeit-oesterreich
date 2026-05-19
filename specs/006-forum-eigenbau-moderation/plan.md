# Implementation Plan: Forum Eigenbau mit Moderation und Barrierefreiheit

**Branch**: `006-forum-eigenbau-moderation` | **Date**: 2026-05-19 | **Spec**: [spec.md](spec.md)

## Summary

Ausbau des bestehenden Forum-Stacks (FastAPI + React) zu einem persistenten, moderierten und barrierefreien Forum mit Volltextsuche, Meldewesen, Audit-Log, Notifications und DSGVO-Funktionen. phpBB nur als Benchmark.

## Technical Context

- **Language/Version**: Python 3.12 (FastAPI), TypeScript 5 (React 19, Vite)
- **Primary Dependencies**: FastAPI, SQLAlchemy 2.x, Alembic, Pydantic v2, bleach, markdown-it-py; React, Tailwind, react-query, react-markdown
- **Storage**: PostgreSQL 15+ mit `tsvector` Volltextsuche, optional `pg_trgm`
- **Testing**: pytest + httpx (API), vitest + Testing Library (Frontend), Playwright (E2E), axe-core (a11y)
- **Target Platform**: Linux Container; API auf Port 8001, Website auf Port 5173
- **Project Type**: Multi-app monorepo (`apps/api`, `apps/website`, `apps/forum` als Theme/Assets)
- **Performance Goals**: List/Detail < 200 ms p95, Suche < 500 ms p95 bis 50k Posts
- **Constraints**: WCAG 2.1 AA, DSGVO konform, Rate-Limit, kein roher HTML-Input
- **Scale/Scope**: Anfangs <5k Mitglieder, <50k Posts; horizontal skalierbar via PG-Replikation

## Constitution Check

- **Sicherheit zuerst**: XSS-/CSRF-/Rate-Limit-Schutz Pflicht.
- **DSGVO**: Datenexport, Loeschanforderung, Audit-Log, Datensparsamkeit.
- **Accessibility**: WCAG 2.1 AA Mindeststandard, Lighthouse a11y >= 95.
- **Repo first**: Erweiterung bestehender Module unter `apps/api/app/routers/forum.py`, `apps/website/src/pages/ForumPage.tsx`, `apps/forum/`.

## Project Structure

```text
specs/006-forum-eigenbau-moderation/
  spec.md
  plan.md
  tasks.md
  data-model.md         (folgt in Phase 1 ueber speckit.plan)
  contracts/            (REST-Kontrakte v1)
  quickstart.md

apps/api/app/forum/
  __init__.py
  models.py             # SQLAlchemy: Category, Thread, Post, Report, Audit, Subscription, Notification, Tag
  schemas.py            # Pydantic v2 DTOs
  service.py            # Business Logic (Soft-Delete, Audit, Rate-Limit)
  search.py             # tsvector Helpers
  moderation.py         # Moderationsaktionen
  notifications.py      # In-App + E-Mail
  dsgvo.py              # Export/Loeschen
  router.py             # /api/v1/forum/* Endpunkte
  rate_limit.py
  tests/

apps/api/migrations/versions/
  XXXX_forum_baseline.py
  XXXX_forum_audit_reports.py
  XXXX_forum_tsvector_search.py
  XXXX_forum_subscriptions_notifications.py

apps/website/src/features/forum/
  pages/
    ForumOverviewPage.tsx
    ForumCategoryPage.tsx
    ForumThreadPage.tsx
    ForumNewThreadPage.tsx
    ForumModerationPage.tsx
    ForumSearchPage.tsx
  components/
    ThreadList, ThreadCard, PostCard, MarkdownEditor, ReportDialog,
    ModerationQueue, NotificationBell, AccessibilityToolbar
  hooks/
    useForumQuery, useThreadSubscription, useMarkdown
  api/forumApi.ts
  types/forum.ts
  tests/

apps/forum/
  README.md             # Theme- und Asset-Referenz beibehalten
```

## Phasen und Wave-Mapping

| Phase   | Inhalt                                                                                     | Wave            |
| ------- | ------------------------------------------------------------------------------------------ | --------------- |
| Phase 0 | DB-Migrationen, Schema, RBAC-Anbindung, Markdown-Sanitization                              | A-foundation    |
| Phase 1 | Kategorien/Threads/Posts CRUD persistent, Paginierung, Markdown-Editor, Theme-Konformitaet | A-foundation    |
| Phase 2 | Moderation: Meldewesen, Queue, Audit-Log, Soft-Delete, Lock/Pin/Move                       | B-feature-core  |
| Phase 3 | Suche (tsvector), Filter, Tags, Sortierung, Performance-Tuning                             | B-feature-core  |
| Phase 4 | Notifications (In-App + E-Mail Opt-in), Abonnements, Frequenz-Settings                     | B-feature-core  |
| Phase 5 | Accessibility-Hardening, WCAG 2.1 AA Audit, Lighthouse/axe Tests                           | C-stabilization |
| Phase 6 | DSGVO-Export/Loeschen, Rate-Limit, Security-Hardening, OWASP-ASVS L1                       | C-stabilization |
| Phase 7 | Monitoring, Deployment, Doku, Runbooks, Community-Regeln                                   | C-stabilization |

## Risiken und Gegenmassnahmen

- **R1 Sanitization-Luecken (XSS)** -> bleach mit strikter Whitelist, Snapshot-Tests fuer Renderer, Audit per OWASP-Checkliste.
- **R2 Performance Volltextsuche bei Wachstum** -> tsvector Index + GIN, Monitoring; Backlog: ElasticSearch.
- **R3 Notification-Spam / Mail-Floods** -> Frequenz-Einstellungen (instant/digest/off), Rate-Limit, Unsubscribe-Token.
- **R4 Moderationsmissbrauch** -> Audit-Log, Vier-Augen-Option fuer Hard-Delete (Sysadmin).
- **R5 DSGVO-Konflikte mit Soft-Delete** -> Anonymisierungs-Pfad zusaetzlich zu Soft-Delete, dokumentierte Aufbewahrungsfrist.
- **R6 A11y-Regressionen** -> axe-CI in PR-Pipeline, Tastatur-Tests in Playwright.

## Abhaengigkeiten

- PostgreSQL Verfuegbarkeit fuer `tsvector` (bestaetigen in `apps/api/`).
- Mailversand-Pfad in API (vorhandene Konfiguration nutzen).
- Brand-Tokens und bestehende UI-Komponenten in `apps/website/`.

## Definition of Done

- Alle FRs aus `spec.md` implementiert, getestet, dokumentiert.
- Tests gruen (pytest, vitest, Playwright a11y), Coverage-Ziele erreicht.
- `npm run quality:gates` und `npm run governance:check` gruen.
- Migrationen reversibel, Seed-Skript fuer Default-Kategorien.
- Runbook `docs/forum/operations.md` und Community-Regeln verfuegbar.
- Security-Review (security-reviewer.agent) bestanden.
