# Tasks: Forum Eigenbau mit Moderation und Barrierefreiheit

**Input**: Design documents from `/specs/006-forum-eigenbau-moderation/`

**Prerequisites**: spec.md, plan.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelisierbar (verschiedene Dateien, keine Abhaengigkeiten)
- **[Story]**: US1..US6

## Path Conventions

- API: `apps/api/app/forum/`
- API-Tests: `apps/api/tests/forum/`
- Frontend: `apps/website/src/features/forum/`
- Migrationen: `apps/api/migrations/versions/`

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Verzeichnis `apps/api/app/forum/` mit `__init__.py` anlegen und Router-Mount in `apps/api/app/main.py` registrieren (Prefix `/api/v1/forum`).
- [ ] T002 [P] Frontend-Modul `apps/website/src/features/forum/` mit Index-Barrel und Route-Registrierung anlegen.
- [ ] T003 [P] Doku-Geruest unter `docs/forum/` (README, operations.md, community-rules.md, api.md) anlegen.

**Checkpoint**: Scaffolding fuer API, Website und Doku steht.

---

## Phase 2: Foundational (Blocking Prerequisites)

### Datenmodell und Migrationen

- [ ] T010 SQLAlchemy-Modelle `Category`, `Thread`, `Post`, `Tag` in `apps/api/app/forum/models.py`.
- [ ] T011 SQLAlchemy-Modelle `Report`, `AuditLog`, `Subscription`, `Notification` in `apps/api/app/forum/models.py`.
- [ ] T012 Alembic-Migration `forum_baseline` (Kategorien, Threads, Posts, Tags, Indizes) in `apps/api/migrations/versions/`.
- [ ] T013 Alembic-Migration `forum_audit_reports` (Reports, AuditLog) in `apps/api/migrations/versions/`.
- [ ] T014 Alembic-Migration `forum_subscriptions_notifications` (Subscriptions, Notifications) in `apps/api/migrations/versions/`.

### Sicherheit und Querschnitt

- [ ] T020 Markdown-Sanitizer in `apps/api/app/forum/sanitization.py` (markdown-it-py + bleach mit Whitelist).
- [ ] T021 [P] Rate-Limit-Middleware fuer Forum-Endpunkte in `apps/api/app/forum/rate_limit.py`.
- [ ] T022 [P] CSRF-/Auth-Integration ueber bestehendes `apps/api/app/rbac.py` pruefen und erweitern.
- [ ] T023 Pydantic-DTOs in `apps/api/app/forum/schemas.py` fuer alle Entitaeten (Read/Write/Update).

**Checkpoint**: Persistente Basis, Sanitization und Rate-Limit verfuegbar.

---

## Phase 3: US1 - Beitragen und Diskutieren (P1)

- [ ] T030 [US1] Service `apps/api/app/forum/service.py` mit Create/Read/Update/SoftDelete fuer Threads und Posts.
- [ ] T031 [US1] Router-Endpunkte `GET/POST /categories`, `GET/POST/PATCH/DELETE /threads`, `GET/POST/PATCH/DELETE /posts` in `apps/api/app/forum/router.py`.
- [ ] T032 [US1] Paginierung mit `limit/offset` und stabiler Sortierung; Tests fuer Edge Cases.
- [ ] T033 [US1] Pytest-Tests fuer Service und Router in `apps/api/tests/forum/test_threads_posts.py`.
- [ ] T034 [P] [US1] Frontend `ForumOverviewPage.tsx` und `ForumCategoryPage.tsx` mit Datenholung via react-query.
- [ ] T035 [P] [US1] Frontend `ForumThreadPage.tsx` mit Post-Liste, Antwortformular, Markdown-Rendering (sanitiziert).
- [ ] T036 [US1] Frontend `MarkdownEditor.tsx` mit Vorschau, Tastenkuerzel, Tastaturbedienbarkeit.
- [ ] T037 [US1] Vitest-Tests fuer Komponenten und Hooks in `apps/website/src/features/forum/tests/`.

**Checkpoint**: Vollstaendiger Lese-/Schreib-Flow fuer Mitglieder.

---

## Phase 4: US2 - Moderieren und Melden (P1)

- [ ] T040 [US2] Endpunkte `POST /reports`, `GET /reports`, `PATCH /reports/{id}` (Annehmen/Ablehnen) in `apps/api/app/forum/router.py`.
- [ ] T041 [US2] Endpunkte `POST /threads/{id}/lock`, `pin`, `move`; `DELETE /threads/{id}` (Soft) und `DELETE /posts/{id}` (Soft) mit Audit.
- [ ] T042 [US2] Audit-Logger in `apps/api/app/forum/moderation.py` (jede Aktion -> AuditLog).
- [ ] T043 [US2] Pytest-Tests Moderationsflows und Audit-Log in `apps/api/tests/forum/test_moderation.py`.
- [ ] T044 [P] [US2] Frontend `ReportDialog.tsx` (Grund, Kommentar, Bestaetigung).
- [ ] T045 [P] [US2] Frontend `ModerationQueue.tsx` und `ForumModerationPage.tsx` (Filter, Bulk-Aktionen, Audit-View).
- [ ] T046 [US2] RBAC-Gate im Frontend: Moderations-UI nur fuer Moderator/Admin.

**Checkpoint**: Moderation produktionsfaehig, Audit-Log vollstaendig.

---

## Phase 5: US3 - Barrierefrei nutzen (P1)

- [ ] T050 [US3] A11y-Pass aller Forum-Komponenten (semantisches HTML, ARIA-Labels nur ergaenzend, Fokus-Markierung).
- [ ] T051 [US3] Tastatur-Bedienung fuer Editor, Dialoge, Modale; Skip-Links pro Seite.
- [ ] T052 [US3] Kontrast-Pruefung gegen Brand-Tokens, Anpassung wo noetig.
- [ ] T053 [US3] axe-Tests in Vitest und Playwright a11y-Tests fuer Schluesselseiten.
- [ ] T054 [US3] Lighthouse-CI-Konfiguration fuer Forum-URLs in `lighthouse.config.cjs`.

**Checkpoint**: WCAG 2.1 AA erreicht, Lighthouse a11y >= 95.

---

## Phase 6: US4 - Suchen und Navigieren (P2)

- [ ] T060 [US4] Migration `forum_tsvector_search` mit GIN-Index auf `posts.content_tsv` und `threads.title_tsv`.
- [ ] T061 [US4] Trigger/Listener fuer `tsvector` Aktualisierung bei Insert/Update.
- [ ] T062 [US4] Endpunkt `GET /forum/search?q=&category=&tag=&from=&to=&sort=` mit Ranking via `ts_rank_cd`.
- [ ] T063 [P] [US4] Frontend `ForumSearchPage.tsx` mit Filter-UI und Result-List.
- [ ] T064 [US4] Tag-CRUD-Endpunkte und M:N-Verknuepfung Thread<->Tag.
- [ ] T065 [US4] Performance-Tests: Suche < 500 ms p95 bei 50k Posts (Seed-Skript).

**Checkpoint**: Volltextsuche und Filter live.

---

## Phase 7: US5 - Benachrichtigt werden (P2)

- [ ] T070 [US5] Endpunkte `POST/DELETE /subscriptions` (Thread/Category Abos, Opt-in fuer E-Mail).
- [ ] T071 [US5] Notification-Dispatcher in `apps/api/app/forum/notifications.py` (In-App-Erzeugung bei neuen Posts).
- [ ] T072 [US5] E-Mail-Versand ueber bestehende Mail-Infrastruktur; Frequenz instant/digest/off.
- [ ] T073 [US5] Unsubscribe-Token-Endpunkt fuer One-Click-Abmeldung aus E-Mails.
- [ ] T074 [P] [US5] Frontend `NotificationBell.tsx` mit Liste, Read/Unread, Mark-all-read.
- [ ] T075 [US5] Tests fuer Dispatcher, Frequenz und Unsubscribe.

**Checkpoint**: Notifications und Abos in Betrieb.

---

## Phase 8: US6 - DSGVO Export und Loeschen (P2)

- [ ] T080 [US6] Endpunkt `POST /forum/dsgvo/export` -> Job, das JSON/CSV mit allen Beitraegen erzeugt.
- [ ] T081 [US6] Endpunkt `POST /forum/dsgvo/delete` -> Anonymisierungs-Workflow (Autor entfernen, Inhalt optional ersetzen).
- [ ] T082 [US6] Audit-Eintrag pro DSGVO-Aktion, Retention dokumentiert.
- [ ] T083 [US6] Frontend-Seite `ForumProfilePage.tsx` mit Buttons "Export anfordern" und "Loeschanforderung".
- [ ] T084 [US6] Tests fuer Export-Inhalt und Anonymisierungs-Effekt.

**Checkpoint**: DSGVO-Rechte abbildbar.

---

## Phase 9: Hardening, Deployment, Doku

- [ ] T090 OWASP-ASVS L1 Mini-Audit der Forum-Endpunkte; Findings fixen.
- [ ] T091 Monitoring/Logging-Hooks (Prometheus-Counter fuer Posts/Reports/Notifications).
- [ ] T092 [P] Community-Regeln in `docs/forum/community-rules.md` finalisieren und im Frontend einbinden (Accept-Flow).
- [ ] T093 [P] Runbook `docs/forum/operations.md` (Backup, Restore, Migrationen, Incident).
- [ ] T094 CI-Erweiterung: Forum-Module in `npm run quality:gates`, Coverage-Ziele erzwingen.
- [ ] T095 Security-Review durch `security-reviewer.agent` und Freigabe-Vermerk.

**Checkpoint**: Forum produktionsreif, Governance erfuellt.
