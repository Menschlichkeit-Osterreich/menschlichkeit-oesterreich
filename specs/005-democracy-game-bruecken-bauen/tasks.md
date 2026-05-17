# Tasks: Democracy Game Bruecken bauen

**Input**: Design documents from `/specs/005-democracy-game-bruecken-bauen/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md,
contracts/democracy-game-api-v1.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- Game Client: `apps/babylon-game/src/game/`
- API Backend: `apps/api/app/`
- CRM Module: `apps/crm/httpdocs/web/modules/custom/`
- Game Tests: `apps/babylon-game/tests/`
- API Tests: `apps/api/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency configuration

- [ ] T001 Add democracy-game TypeScript type barrel file at
      apps/babylon-game/src/game/democracy/index.ts
- [ ] T002 [P] Add democracy-game Python package directory at
      apps/api/app/democracy/**init**.py
- [ ] T003 [P] Add democracy-game API router mount in
      apps/api/app/main.py (register /api/v1 prefix)

**Checkpoint**: Basic project scaffolding in place across all three services.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data types, schemas and shared utilities that ALL user stories
depend on. No user story work can begin until this phase is complete.

### Shared Data Types (Game Client)

- [ ] T004 [P] Define World, Scenario, Scene, Choice, Role, Character
      interfaces in apps/babylon-game/src/game/democracy/types.ts
- [ ] T005 [P] Define WorkshopSession, WorkshopVote, ConsentRecord,
      TelemetryEvent interfaces in
      apps/babylon-game/src/game/democracy/types.ts

### Shared Schemas (API)

- [ ] T006 [P] Create Pydantic models for World, Scenario, Scene, Choice,
      Role, Character in apps/api/app/democracy/schemas.py
- [ ] T007 [P] Create Pydantic models for WorkshopSession, WorkshopVote,
      ConsentRecord, TelemetryEvent in
      apps/api/app/democracy/schemas.py

### Database Models (API)

- [ ] T008 Create SQLAlchemy models for World, Scenario, Scene, Choice,
      Role, Character in apps/api/app/democracy/models.py
- [ ] T009 Create SQLAlchemy models for WorkshopSession, WorkshopVote,
      ConsentRecord, TelemetryEvent in
      apps/api/app/democracy/models.py

### Standard Error Handling

- [ ] T010 Implement Standard Error Object (code, message, correlationId,
      details) middleware in apps/api/app/democracy/errors.py

### API Router Shell

- [ ] T011 Create v1 router with route stubs for all 5 contract endpoints in
      apps/api/app/democracy/router.py

### Authentication

- [ ] T067 Implement SSO authentication guard for game endpoints and
      workshop guest-token middleware (2h TTL enforcement, FR-021) in
      apps/api/app/democracy/auth.py

**Checkpoint**: Foundation ready. All shared types, schemas, models, error
handling and authentication are in place. User story implementation can now
begin in parallel.

---

## Phase 3: User Story 1 - Szenario mit Konsequenzen spielen (Priority: P1)

**Goal**: Spielende erleben ein vollstaendiges Konfliktszenario mit Dialogen,
Rollenwahl, Entscheidungen und sichtbaren Konsequenzen.

**Independent Test**: Ein komplettes Szenario vom Einstieg bis zur Aufloesung
durchspielen. Unterschiedliche Wahlpfade fuehren zu unterschiedlichen
Ergebnissen.

**Covers**: FR-001, FR-002, FR-003, FR-004, FR-007, FR-011, FR-012, FR-013

### i18n Infrastructure (FR-007 MUSS)

- [ ] T070 [P] [US1] Add i18n infrastructure with language context provider,
      translation resource loading and locale detection in
      apps/babylon-game/src/game/democracy/i18n/index.ts
- [ ] T071 [P] [US1] Implement graceful runtime language switch handler
      (reload translations without full page reload, fallback to default
      locale on missing key) in
      apps/babylon-game/src/game/democracy/i18n/switcher.ts

### API Implementation (US1)

- [ ] T012 [P] [US1] Implement POST /api/v1/game/active-role endpoint in
      apps/api/app/democracy/router.py
- [ ] T013 [P] [US1] Implement POST /api/v1/game/active-scenario endpoint in
      apps/api/app/democracy/router.py
- [ ] T014 [P] [US1] Implement POST /api/v1/game/scenario-progress endpoint
      in apps/api/app/democracy/router.py
- [ ] T015 [US1] Implement scenario service with branching logic, stat
      tracking and progress persistence in
      apps/api/app/democracy/scenario_service.py
- [ ] T016 [US1] Implement role service with active-role management in
      apps/api/app/democracy/role_service.py
- [ ] T017 [US1] Add CMS snapshot loader that imports only released,
      versioned content in apps/api/app/democracy/cms_loader.py

### Game Client Implementation (US1)

- [ ] T018 [P] [US1] Create ScenarioRunner state machine (load, play,
      branch, finish) in
      apps/babylon-game/src/game/democracy/scenario-runner.ts
- [ ] T019 [P] [US1] Create DialoguePanel UI component for scene text,
      character portrait and choice buttons in
      apps/babylon-game/src/game/democracy/ui/DialoguePanel.tsx
- [ ] T020 [P] [US1] Create RoleSelector UI component for pre-scenario
      role selection in
      apps/babylon-game/src/game/democracy/ui/RoleSelector.tsx
- [ ] T021 [US1] Create ConsequenceDisplay UI component for showing
      stat changes and decision feedback in
      apps/babylon-game/src/game/democracy/ui/ConsequenceDisplay.tsx
- [ ] T022 [US1] Create DemocracyGameDataAdapter for fetching scenario
      data from API v1 endpoints in
      apps/babylon-game/src/game/democracy/data/api-adapter.ts
- [ ] T023 [US1] Integrate ScenarioRunner with GameStore (extend
      GameHudState with democracy fields) in
      apps/babylon-game/src/game/state/game-store.ts
- [ ] T024 [US1] Create ScenarioResultScreen showing outcome summary and
      reflection content in
      apps/babylon-game/src/game/democracy/ui/ScenarioResultScreen.tsx
- [ ] T025 [US1] Wire DialoguePanel, RoleSelector, ConsequenceDisplay and
      ScenarioResultScreen into GameOverlay in
      apps/babylon-game/src/game/ui/GameOverlay.tsx

**Checkpoint**: User Story 1 is fully functional. A scenario can be played from
start to finish with branching choices and visible consequences.

---

## Phase 4: User Story 2 - Barrierefrei teilnehmen (Priority: P1)

**Goal**: Alle Interaktionselemente sind per Tastatur bedienbar. Kontrast,
Schriftgroesse und Untertitel sind anpassbar.

**Independent Test**: Ein Szenario wird komplett ohne Maus bedient und alle
UI-Elemente bleiben erreichbar und lesbar.

**Covers**: FR-005, FR-006, FR-007, FR-020

### Accessibility Implementation (US2)

- [ ] T026 [P] [US2] Add keyboard focus management and tab-order to
      DialoguePanel in
      apps/babylon-game/src/game/democracy/ui/DialoguePanel.tsx
- [ ] T027 [P] [US2] Add keyboard navigation and ARIA roles to
      RoleSelector in
      apps/babylon-game/src/game/democracy/ui/RoleSelector.tsx
- [ ] T028 [P] [US2] Add keyboard navigation and ARIA roles to
      ConsequenceDisplay in
      apps/babylon-game/src/game/democracy/ui/ConsequenceDisplay.tsx
- [ ] T029 [US2] Create AccessibilitySettings component (contrast mode,
      font size, subtitles toggle) in
      apps/babylon-game/src/game/democracy/ui/AccessibilitySettings.tsx
- [ ] T030 [US2] Create accessibility store (persisted user preferences for
      contrast, font-size, subtitles, reduced-motion) in
      apps/babylon-game/src/game/democracy/state/accessibility-store.ts
- [ ] T031 [US2] Integrate AccessibilitySettings into GameOverlay and apply
      CSS variables for contrast/font-size in
      apps/babylon-game/src/game/ui/GameOverlay.tsx
- [ ] T032 [US2] Add subtitle rendering layer for dialogue audio in
      apps/babylon-game/src/game/democracy/ui/SubtitleOverlay.tsx
- [ ] T033 [US2] Add WCAG 2.1 AA contrast validation to all democracy UI
      components (CSS custom properties) in
      apps/babylon-game/src/game/democracy/ui/styles/a11y.css

**Checkpoint**: User Story 2 is complete. The game is fully keyboard-navigable
with adjustable contrast, font size and subtitle support.

---

## Phase 5: User Story 3 - Inhalte ohne Codepflege erweitern (Priority: P2)

**Goal**: Das Content-Team kann Welten, Szenarien, Szenen, Entscheidungen,
Rollen und Charaktere strukturiert pflegen und veroeffentlichen.

**Independent Test**: Ein neues Szenario mit mehreren Szenen wird erstellt,
veroeffentlicht und im Spiel konsumiert.

**Covers**: FR-008, FR-009, FR-010, FR-024

### CRM Module (US3)

- [ ] T034 [P] [US3] Create Drupal content types for World, Scenario, Scene,
      Choice, Role, Character in
      apps/crm/httpdocs/web/modules/custom/democracy_content/democracy_content.info.yml
- [ ] T035 [P] [US3] Implement editorial workflow (draft/review/released
      status transitions) in
      apps/crm/httpdocs/web/modules/custom/democracy_content/src/Workflow/
- [ ] T036 [US3] Implement CMS snapshot export (versioned JSON bundle for
      released content) in
      apps/crm/httpdocs/web/modules/custom/democracy_content/src/Export/SnapshotExporter.php
- [ ] T037 [US3] Add validation rules blocking release of incomplete content
      structures (including localization completeness checks for all
      configured languages) in
      apps/crm/httpdocs/web/modules/custom/democracy_content/src/Validation/ContentValidator.php

### API Import (US3)

- [ ] T038 [US3] Extend CMS snapshot loader with version comparison and
      rollback support in apps/api/app/democracy/cms_loader.py
- [ ] T039 [US3] Add content version endpoint GET /api/v1/game/content-version
      in apps/api/app/democracy/router.py
- [ ] T072 [US3] Add API-side scene reference integrity validator
      (reject CMS-Snapshot if follow-up scene IDs reference non-existent
      scenes) in apps/api/app/democracy/cms_loader.py

### Game Client (US3)

- [ ] T040 [US3] Add content version check to DemocracyGameDataAdapter
      (compare local cache vs API version) in
      apps/babylon-game/src/game/democracy/data/api-adapter.ts

**Checkpoint**: User Story 3 is complete. New scenarios can be authored in the
CMS, released through the editorial workflow, exported as snapshots and consumed
by the game client.

---

## Phase 6: User Story 4 - Workshop moderieren (Priority: P2)

**Goal**: Moderatoren starten gemeinsame Sessions, Teilnehmende treten bei und
Abstimmungen werden in Echtzeit aggregiert.

**Independent Test**: Eine Session mit mehreren Teilnehmenden erstellen und
mindestens eine Abstimmungsrunde erfolgreich abschliessen.

**Covers**: FR-014, FR-015, FR-016, FR-021, FR-022, FR-025

### API Implementation (US4)

- [ ] T041 [P] [US4] Implement workshop session service (create, join,
      leave, status, guest token with 2h TTL) in
      apps/api/app/democracy/workshop_service.py
- [ ] T042 [P] [US4] Implement vote service (submit, deadline enforcement,
      latest-valid-per-participant aggregation) in
      apps/api/app/democracy/vote_service.py
- [ ] T043 [US4] Implement POST /api/v1/workshop/vote endpoint in
      apps/api/app/democracy/router.py
- [ ] T044 [US4] Add workshop session management endpoints (POST create,
      POST join, GET status) in apps/api/app/democracy/router.py
- [ ] T045 [US4] Add reconnect logic with session state recovery for
      interrupted participants in
      apps/api/app/democracy/workshop_service.py

### Game Client (US4)

- [ ] T046 [P] [US4] Create WorkshopLobby UI component (session creation,
      join code, participant list) in
      apps/babylon-game/src/game/democracy/ui/WorkshopLobby.tsx
- [ ] T047 [P] [US4] Create VotePanel UI component (choice selection,
      countdown timer, result display) in
      apps/babylon-game/src/game/democracy/ui/VotePanel.tsx
- [ ] T048 [US4] Create workshop state manager (session sync, participant
      tracking, vote polling) in
      apps/babylon-game/src/game/democracy/state/workshop-store.ts
- [ ] T049 [US4] Integrate WorkshopLobby and VotePanel into GameOverlay in
      apps/babylon-game/src/game/ui/GameOverlay.tsx
- [ ] T050 [US4] Add reconnect handler with automatic session state
      restoration in
      apps/babylon-game/src/game/democracy/state/workshop-store.ts

**Checkpoint**: User Story 4 is complete. Workshop sessions can be created,
joined and used for real-time group voting with reconnect support.

---

## Phase 7: User Story 5 - Lernwirkung datenschutzkonform auswerten (P3)

**Goal**: Aggregierte, anonymisierte Nutzungs- und Entscheidungsdaten werden
nur bei aktiver Einwilligung erfasst und nach 90 Tagen bereinigt.

**Independent Test**: Bei erteilter Einwilligung werden Ereignisse erfasst und
aggregiert auswertbar. Ohne Einwilligung werden keine personenbezogenen Daten
gespeichert.

**Covers**: FR-017, FR-018, FR-019, FR-023

### API Implementation (US5)

- [ ] T051 [P] [US5] Implement consent service (grant, revoke, status
      check) in apps/api/app/democracy/consent_service.py
- [ ] T052 [P] [US5] Implement telemetry service (event ingestion with
      consent gate, 90-day retention enforcement) in
      apps/api/app/democracy/telemetry_service.py
- [ ] T053 [US5] Implement POST /api/v1/game/events endpoint with 403 on
      missing/revoked consent in apps/api/app/democracy/router.py
- [ ] T054 [US5] Add aggregation query service for anonymized analytics
      (no PII in output) in
      apps/api/app/democracy/analytics_service.py
- [ ] T055 [US5] Add scheduled cleanup job for telemetry data older than
      90 days in apps/api/app/democracy/telemetry_cleanup.py

### Game Client (US5)

- [ ] T056 [P] [US5] Create ConsentBanner UI component (opt-in/opt-out
      with clear scope description) in
      apps/babylon-game/src/game/democracy/ui/ConsentBanner.tsx
- [ ] T057 [US5] Create telemetry client (event dispatch with local consent
      check, immediate stop on revocation) in
      apps/babylon-game/src/game/democracy/data/telemetry-client.ts
- [ ] T058 [US5] Integrate ConsentBanner into game startup flow in
      apps/babylon-game/src/game/democracy/ui/GameEntryFlow.tsx

**Checkpoint**: User Story 5 is complete. Telemetry is captured only with active
consent, respects revocation immediately and auto-purges after 90 days.

---

## Phase 8: Polish and Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T059 [P] Add structured logging with correlationId to all API
      endpoints in apps/api/app/democracy/middleware.py
- [ ] T060 [P] Add performance timing middleware (p50/p95 metrics) for
      democracy endpoints in apps/api/app/democracy/middleware.py
- [ ] T061 [P] Add observability dashboard configuration (latency,
      error rate, session abort rate) in
      apps/api/app/democracy/observability.py
- [ ] T062 Run quickstart.md 6-step verification flow and validate all
      acceptance criteria for Performance (including PG-001 dialog render
      ≤150 ms), Reliability, Observability
- [ ] T063 [P] Extend i18n infrastructure (T070) with runtime language
      switching, missing-key fallbacks and locale persistence in
      apps/babylon-game/src/game/democracy/i18n/index.ts
- [ ] T064 [P] Add error boundary and fallback UI for broken scene
      references in
      apps/babylon-game/src/game/democracy/ui/ErrorBoundary.tsx
- [ ] T065 Security hardening review for all democracy endpoints
      (input validation, rate limiting, auth checks)
- [ ] T066 Documentation updates for democracy game in
      docs/democracy-game/
- [ ] T068 Generate quality, accessibility and governance evidence
      artifacts (test report, a11y audit log, governance checklist) per
      FR-020 in docs/democracy-game/evidence/
- [ ] T069 Add load test for workshop vote endpoint validating SC-005
      (>= 30 concurrent participants, stable) in
      apps/api/tests/test_workshop_load.py

---

## Dependencies and Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. BLOCKS all user
  stories.
- **US1 (Phase 3)**: Depends on Foundational (Phase 2). No dependency on
  other user stories.
- **US2 (Phase 4)**: Depends on US1 (Phase 3) UI components existing to
  add accessibility features.
- **US3 (Phase 5)**: Depends on Foundational (Phase 2). CRM work
  (T034-T037) can start parallel to US1. API import (T038-T040) depends
  on T017 (CMS loader) from Phase 3.
- **US4 (Phase 6)**: Depends on Foundational (Phase 2). Independent of
  US1/US2/US3.
- **US5 (Phase 7)**: Depends on Foundational (Phase 2). Independent of
  US1/US2/US3/US4.
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Gateway story. Must complete first for US2.
- **US2 (P1)**: Depends on US1 UI components. Can start after T019-T025.
- **US3 (P2)**: CRM work (T034-T037) can start parallel to US1. API/Client
  tasks (T038-T040) depend on T017.
- **US4 (P2)**: Fully independent. Can start after Phase 2.
- **US5 (P3)**: Fully independent. Can start after Phase 2.

### Within Each User Story

- Models and schemas before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 2 (Foundational)**:

- T004 + T005 (client types) parallel to T006 + T007 (API schemas)
- T008 + T009 (DB models) after schemas, parallel to T010 (errors)

**Phase 3 (US1)**:

- T012 + T013 + T014 (API endpoints) in parallel
- T018 + T019 + T020 (client components) in parallel
- API and Client tracks can run in parallel

**Phase 4 (US2)**:

- T026 + T027 + T028 (keyboard navigation) in parallel

**Phase 5 (US3)**:

- T034 + T035 (CRM module) in parallel
- CRM track independent of API track

**Phase 6 (US4)**:

- T041 + T042 (API services) in parallel
- T046 + T047 (client components) in parallel
- API and Client tracks can run in parallel

**Phase 7 (US5)**:

- T051 + T052 (API services) in parallel
- API and Client tracks can run in parallel

---

## Implementation Strategy

### MVP Scope (Recommended)

**Phase 1 + Phase 2 + Phase 3 (US1)** = Minimum Viable Product

Ein spielbares Szenario mit Rollenwahl, Entscheidungszweigen und sichtbaren
Konsequenzen. Dies deckt den Kernnutzen ab und liefert den fruehesten
Validierungspunkt.

### Incremental Delivery

1. **MVP**: Setup + Foundation + US1 (25 Tasks: T001-T025)
2. **+Accessibility**: US2 (8 Tasks: T026-T033)
3. **+CMS**: US3 (7 Tasks: T034-T040)
4. **+Workshop**: US4 (10 Tasks: T041-T050)
5. **+Telemetry**: US5 (8 Tasks: T051-T058)
6. **+Polish**: Cross-cutting (8 Tasks: T059-T066)

### Task Summary

| Phase        | Story            | Task Count | Parallel Tasks |
| ------------ | ---------------- | ---------- | -------------- |
| 1 Setup      | -                | 3          | 2              |
| 2 Foundation | -                | 9          | 5              |
| 3 US1        | Szenario spielen | 16         | 8              |
| 4 US2        | Barrierefreiheit | 8          | 3              |
| 5 US3        | CMS-Inhalte      | 8          | 2              |
| 6 US4        | Workshop         | 10         | 4              |
| 7 US5        | Telemetrie       | 8          | 3              |
| 8 Polish     | -                | 10         | 5              |
| **Total**    |                  | **72**     | **32**         |

### Suggested Execution Timeline

- **Wave 1**: Phase 1 + Phase 2 (11 Tasks, Foundation)
- **Wave 2**: Phase 3 US1 (14 Tasks, MVP Core)
- **Wave 3**: Phase 4 US2 + Phase 5 US3 CRM-Track (parallel, 15 Tasks)
- **Wave 4**: Phase 5 US3 API/Client + Phase 6 US4 (parallel, 13 Tasks)
- **Wave 5**: Phase 7 US5 (8 Tasks)
- **Wave 6**: Phase 8 Polish (8 Tasks, hardening)
