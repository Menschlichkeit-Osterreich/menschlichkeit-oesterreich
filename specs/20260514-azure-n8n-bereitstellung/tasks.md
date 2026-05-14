# Tasks: n8n Workflow Validitaets-Gate

**Input**: Design documents from `/specs/20260514-azure-n8n-bereitstellung/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Keine separaten Test-Tasks angefordert; Validierung erfolgt ueber den lokalen/CI-Gate-Check `npm run n8n:validate`.

**Organization**: Tasks sind nach User Story gruppiert, damit jede Story unabhaengig umsetzbar und pruefbar bleibt.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelisierbar (andere Dateien, keine offenen Abhaengigkeiten)
- **[Story]**: Zuordnung zur User Story (`US1`, `US2`, `US3`, `US4`)
- Jede Task enthaelt einen konkreten Dateipfad

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bestehenden n8n-Gate-Baustein fuer den P0-Block vorbereiten.

- [ ] T001 Validiere Ausgangslage und Dateiscope in `automation/n8n/workflows/` gegen den geplanten Scope aus `specs/20260514-azure-n8n-bereitstellung/spec.md`.
- [ ] T002 Lege eine explizite Inventar-Datei an in `automation/n8n/workflow-inventory.production.json`.
- [ ] T003 [P] Ergaenze die Scope- und Gate-Absicht in `automation/n8n/README.md` als kurze Einleitung fuer den neuen Inventar-basierten Check.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Gemeinsame Gate-Mechanik herstellen, die alle Stories blockierungsfrei aufsetzen koennen.

**⚠️ CRITICAL**: Keine Story-Implementierung startet vor Abschluss dieser Phase.

- [ ] T004 Refaktoriere den Validator-Grundpfad in `scripts/validate-n8n-workflows.mjs`, damit der Check das Inventar als Source of Truth einliest.
- [ ] T005 [P] Stelle in `scripts/validate-n8n-workflows.mjs` einen harten Fail sicher, wenn inventarisierte Dateien fehlen oder JSON-ungueltig sind.
- [ ] T006 [P] Halte den einheitlichen Ausfuehrungspfad in `package.json` ueber `n8n:validate` stabil und inventar-basiert.
- [ ] T007 Schalte den CI-Job in `.github/workflows/n8n-json-gate.yml` auf den finalen inventar-basierten Check (gleicher Befehl wie lokal).

**Checkpoint**: Einheitliches Gate laeuft lokal und in CI auf derselben Logik.

---

## Phase 3: User Story 1 - Relevante Workflows nachvollziehbar inventarisieren (Priority: P1) 🎯 MVP

**Goal**: Der produktionsnahe Workflow-Scope ist explizit, nachvollziehbar und auditierbar.

**Independent Test**: Die Inventar-Datei benennt alle relevanten Workflow-Dateien, und Scope-Abweichungen werden als Fehler sichtbar.

### Implementation for User Story 1

- [ ] T008 [US1] Trage alle produktionsnahen Workflows explizit in `automation/n8n/workflow-inventory.production.json` ein.
- [ ] T009 [P] [US1] Ergaenze Inventar-Metadaten (z. B. `version`, `scope_root`, `notes`) in `automation/n8n/workflow-inventory.production.json`.
- [ ] T010 [US1] Implementiere in `scripts/validate-n8n-workflows.mjs` die Scope-Abweichungspruefung fuer nicht inventarisierte/fehlende Dateien.
- [ ] T011 [US1] Dokumentiere den expliziten Scope und die Inventarpflege in `automation/n8n/README.md`.

**Checkpoint**: Scope ist explizit und ohne implizite Dateisuche nachvollziehbar.

---

## Phase 4: User Story 2 - Strikte JSON-Validierung lokal reproduzierbar ausfuehren (Priority: P1)

**Goal**: Lokaler Check ist reproduzierbar und liefert klare, dateibezogene Fehler.

**Independent Test**: `npm run n8n:validate` liefert bei identischem Stand reproduzierbar denselben Status.

### Implementation for User Story 2

- [ ] T012 [US2] Ergaenze in `scripts/validate-n8n-workflows.mjs` eine deterministische Validierungsreihenfolge fuer inventarisierte Dateien.
- [ ] T013 [P] [US2] Ergaenze in `scripts/validate-n8n-workflows.mjs` eindeutige Fehlermeldungen je Datei (inklusive Parse-Kontext).
- [ ] T014 [US2] Aktualisiere den lokalen Pruefablauf in `automation/n8n/README.md` mit erwarteten Erfolgs-/Fehlermustern.

**Checkpoint**: Lokaler Gate-Check ist stabil, strikt und nachvollziehbar.

---

## Phase 5: User Story 3 - CI blockiert ungueltige produktionsnahe Workflows (Priority: P1)

**Goal**: PRs/Pushes auf `main` scheitern bei ungueltigen inventarisierten Workflows.

**Independent Test**: Ein absichtlich defekter Workflow in einem PR setzt den Job `n8n JSON Gate` auf rot.

### Implementation for User Story 3

- [ ] T015 [US3] Schaerfe Job- und Step-Benennung in `.github/workflows/n8n-json-gate.yml` auf den inventar-basierten Validitaets-Gate.
- [ ] T016 [P] [US3] Halte Trigger und Laufbedingungen fuer den Merge-Blocker in `.github/workflows/n8n-json-gate.yml` konsistent.
- [ ] T017 [US3] Dokumentiere CI-Verhalten und Fail-Bedingungen in `automation/n8n/README.md`.

**Checkpoint**: CI-Gate blockiert ungültige inventarisierte Workflow-JSON reproduzierbar.

---

## Phase 6: User Story 4 - Donation-Sonderfall explizit sichtbar halten (Priority: P2)

**Goal**: `finance-donation-processing.json` bleibt als Known-Risk sichtbar, bis Nachweis vorliegt.

**Independent Test**: Jeder Lauf gibt den Sonderfallstatus explizit aus; Doku und Inventar spiegeln den offenen Nachweisstatus.

### Implementation for User Story 4

- [ ] T018 [US4] Hinterlege den Sonderfallstatus fuer `finance-donation-processing.json` in `automation/n8n/workflow-inventory.production.json`.
- [ ] T019 [US4] Implementiere in `scripts/validate-n8n-workflows.mjs` die explizite Sonderfallausgabe ohne stilles Greenwashing.
- [ ] T020 [US4] Dokumentiere den offenen Nachweisstatus und die Nicht-Ziele in `automation/n8n/README.md`.

**Checkpoint**: Donation-Sonderfall ist technisch und dokumentarisch explizit sichtbar.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finaler Qualitaetsabgleich ueber alle geaenderten Artefakte.

- [ ] T021 [P] Fuehre End-to-End-Validierung lokal aus via `package.json` (`npm run n8n:validate`) und pruefe konsistente Ausgabe.
- [ ] T022 [P] Stelle sicher, dass keine Legacy-/Mirror-Pfade im Scope landen in `scripts/validate-n8n-workflows.mjs` und `automation/n8n/workflow-inventory.production.json`.
- [ ] T023 Pruefe Konsistenz zwischen `automation/n8n/README.md`, `.github/workflows/n8n-json-gate.yml` und `scripts/validate-n8n-workflows.mjs`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Keine Abhaengigkeiten.
- **Foundational (Phase 2)**: Haengt von Setup ab und blockiert alle User Stories.
- **User Stories (Phase 3-6)**: Haengen von Phase 2 ab; danach koennen sie parallel oder nach Prioritaet umgesetzt werden.
- **Polish (Phase 7)**: Nach allen gewuenschten User Stories.

### User Story Dependencies

- **US1 (P1)**: Startet nach Phase 2; liefert den verbindlichen Scope.
- **US2 (P1)**: Startet nach Phase 2; nutzt den Scope aus US1, bleibt aber separat testbar.
- **US3 (P1)**: Startet nach Phase 2; kann parallel zu US1/US2 umgesetzt werden.
- **US4 (P2)**: Startet nach Phase 2; baut auf dem bestehenden Gate auf und erweitert um Sichtbarkeit.

### Within Each User Story

- Zuerst Scope/Vertrag der Story, dann Validator-Implementierung, dann Dokuabgleich.
- Story gilt als fertig, wenn ihr Independent Test ohne andere Story-Aenderungen durchfuehrbar ist.

### Parallel Opportunities

- T003 parallel zu T002
- T005 und T006 parallel zu T004
- US1: T009 parallel zu T010
- US2: T013 parallel zu T012
- US3: T016 parallel zu T015
- Polish: T021 und T022 parallel

---

## Parallel Example: User Story 1

```bash
# Parallelisierbare US1-Arbeiten:
Task: "T009 [P] [US1] Ergaenze Inventar-Metadaten in automation/n8n/workflow-inventory.production.json"
Task: "T010 [US1] Implementiere Scope-Abweichungspruefung in scripts/validate-n8n-workflows.mjs"
```

## Parallel Example: User Story 2

```bash
# Parallelisierbare US2-Arbeiten:
Task: "T012 [US2] Deterministische Validierungsreihenfolge in scripts/validate-n8n-workflows.mjs"
Task: "T013 [P] [US2] Dateibezogene Fehlermeldungen in scripts/validate-n8n-workflows.mjs"
```

## Parallel Example: User Story 3

```bash
# Parallelisierbare US3-Arbeiten:
Task: "T015 [US3] Job-/Step-Benennung in .github/workflows/n8n-json-gate.yml"
Task: "T016 [P] [US3] Trigger/Laufbedingungen in .github/workflows/n8n-json-gate.yml"
```

## Parallel Example: User Story 4

```bash
# Parallelisierbare US4-Arbeiten:
Task: "T018 [US4] Sonderfallstatus in automation/n8n/workflow-inventory.production.json"
Task: "T020 [US4] Known-Risk-Doku in automation/n8n/README.md"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 und Phase 2 abschliessen.
2. Nur US1 (Phase 3) umsetzen.
3. Scope und Inventar unabhaengig verifizieren.

### Incremental Delivery

1. US1: Explizites Inventar
2. US2: Reproduzierbarer lokaler Strict-Check
3. US3: Blockierendes CI-Gate
4. US4: Sonderfall-Sichtbarkeit

### Parallel Team Strategy

1. Team schliesst Phase 1-2 gemeinsam ab.
2. Danach parallele Story-Arbeit:
	- Dev A: US1
	- Dev B: US2
	- Dev C: US3
	- Dev D: US4

---

## Notes

- Alle Tasks folgen dem Pflichtformat `- [ ] T### [P] [US#] Beschreibung mit Dateipfad`.
- Keine unbeteiligten Legacy-/Mirror-Pfade.
- Nicht-Ziele (Azure, Deployment, Queue-Mode, DNS/HTTPS, Reverse Proxy, `apps/api`-Verlagerung) bleiben ausgeschlossen.
