# Tasks: Infrastruktur, Donation und Governance Masterplan

**Input**: Design documents from [specs/002-infrastruktur-donation-masterplan](specs/002-infrastruktur-donation-masterplan)

**Prerequisites**: [plan.md](specs/002-infrastruktur-donation-masterplan/plan.md) (required), [spec.md](specs/002-infrastruktur-donation-masterplan/spec.md) (required), [research.md](specs/002-infrastruktur-donation-masterplan/research.md), [data-model.md](specs/002-infrastruktur-donation-masterplan/data-model.md), [contracts/](specs/002-infrastruktur-donation-masterplan/contracts)

**Tests**: Diese Spezifikation verlangt nachweisbare Gates (Smokes, Restore, Monitoring-Simulation). Daher sind verifizierende Aufgaben explizit enthalten.

**Organization**: Tasks sind nach User Story gruppiert, damit jede Story eigenstaendig implementiert und validiert werden kann.

## Format: [ID] [P?] [Story] Description

- [P]: parallelisierbar (andere Dateien, keine harte Vorab-Abhaengigkeit)
- [Story]: Zuordnung zu einer User Story (US1..US6)
- Jede Task-Beschreibung enthaelt einen konkreten Dateipfad

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Projektweite Grundstruktur und Gate-Rahmen fuer die Umsetzung des Masterplans.

- [ ] T001 Erstelle die Masterplan-Ordnerstruktur fuer Betriebsartefakte in runbooks/operations-masterplan/
- [ ] T002 [P] Erstelle IaC-Basisordner fuer Terraform+AVM in deployment-scripts/infra/terraform/
- [ ] T003 [P] Erstelle Monitoring-Basisordner in monitoring/masterplan/
- [ ] T004 Erstelle zentrale Evidence-Log-Datei in reports/masterplan/evidence-log.md
- [ ] T005 [P] Erstelle Go-No-Go-Checkliste als Vorlage in runbooks/operations-masterplan/go-no-go-checklist.md
- [ ] T006 Aktualisiere Referenzen auf den Masterplan in README_GOVERNANCE_CONTEXT.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verbindliche Kernregeln, die alle User Stories blockieren, bis sie umgesetzt sind.

**CRITICAL**: Keine User-Story-Umsetzung vor Abschluss dieser Phase.

- [ ] T007 Definiere verbindliche Rollen und Ownership-Matrix in runbooks/operations-masterplan/role-ownership-matrix.md
- [ ] T008 [P] Definiere zentrale Gate-Kriterien und Nachweisformate in runbooks/operations-masterplan/gate-criteria-catalog.md
- [ ] T009 [P] Definiere SLO/RTO/Ack-SLA Policy (99.9%, <=2h, <=30min) in runbooks/operations-masterplan/slo-sla-policy.md
- [ ] T010 Definiere verbindliche Logging- und Secret-Redaction-Regeln in runbooks/operations-masterplan/logging-and-secrets-policy.md
- [ ] T011 [P] Definiere No-Go-Bedingungen als maschinenlesbare Rules in config-templates/masterplan-no-go-rules.json
- [ ] T012 Erstelle Pipeline-Skelett fuer zentrale Gates in .github/workflows/masterplan-gates.yml
- [ ] T013 [P] Erstelle Basisskript fuer Gate-Auswertung in scripts/masterplan/run-gate-checks.sh
- [ ] T014 Erstelle Basisdokument fuer Ausnahme-/Escalation-Handling in runbooks/operations-masterplan/escalation-policy.md

**Checkpoint**: Foundation fertig. User Stories koennen umgesetzt werden.

---

## Phase 3: User Story 1 - Produktionsplattform stabil betreiben (Priority: P1) 🎯 MVP

**Goal**: Belastbare Plattform mit reproduzierbarem Rollout und harter Expositionsregel.

**Independent Test**: Produktions-Readiness-Check ist erfolgreich, nur Proxy ist extern erreichbar, Rollbackpfad ist dokumentiert und testbar.

- [ ] T015 [P] [US1] Definiere Terraform-Root-Konfiguration fuer Azure-Plattform in deployment-scripts/infra/terraform/main.tf
- [ ] T016 [P] [US1] Definiere AVM-basierte Netzwerk- und Security-Gruppen in deployment-scripts/infra/terraform/network.tf
- [ ] T017 [P] [US1] Definiere AVM-basierte Compute-Ressourcen (VM, Disk, IP) in deployment-scripts/infra/terraform/compute.tf
- [ ] T018 [US1] Definiere Expositionsregeln (nur Proxy oeffentlich) in deployment-scripts/infra/terraform/security.tf
- [ ] T019 [US1] Erstelle Infrastruktur-Variablen und Validierungen in deployment-scripts/infra/terraform/variables.tf
- [ ] T020 [US1] Erstelle reproduzierbares Deploy-Skript fuer Infra-Rollout in deployment-scripts/deploy-infra-azure.sh
- [ ] T021 [US1] Erstelle Readiness-Check-Skript fuer externe Erreichbarkeit und Ports in scripts/masterplan/check-platform-readiness.sh
- [ ] T022 [US1] Dokumentiere Plattform-Rollback-Runbook in runbooks/operations-masterplan/platform-rollback-runbook.md

**Checkpoint**: US1 eigenstaendig validierbar.

---

## Phase 4: User Story 2 - End-to-End-Spendenfluss absichern (Priority: P1)

**Goal**: Stabiler, evidenzbasierter Donation-Flow mit klaren technischen und fachlichen Gates.

**Independent Test**: End-to-End-Smoke liefert Exit-Code 0, Receipt-Evidenzen und archivierte Webhook-Responses.

- [ ] T023 [P] [US2] Definiere Donation-Gate-Konfiguration in config-templates/donation-gate-config.json
- [ ] T024 [P] [US2] Erstelle Stripe-Webhook-Validierungsworkflow in .github/workflows/donation-webhook-validation.yml
- [ ] T025 [US2] Erstelle End-to-End-Donation-Smoke-Skript in scripts/masterplan/run-donation-smoke.sh
- [ ] T026 [US2] Erweitere API-Flow-Matrix fuer verbindlichen End-to-End-Pfad in BACKEND_FLOW_MATRIX.md
- [ ] T027 [US2] Definiere Retry- und Fehlervertragsregeln fuer Donation-Verarbeitung in runbooks/operations-masterplan/donation-retry-policy.md
- [ ] T028 [P] [US2] Erstelle Receipt-Evidence-Sammelskript in scripts/masterplan/collect-receipt-evidence.sh
- [ ] T029 [US2] Erstelle Webhook-Archivierungsprozess in automation/n8n/workflows/donation-webhook-archive.json
- [ ] T030 [US2] Dokumentiere Donation-Go-Live-Runbook in runbooks/operations-masterplan/donation-go-live-runbook.md
- [ ] T031 [US2] Erstelle CI-Job fuer Donation-Gate-Ausfuehrung in .github/workflows/donation-gate.yml

**Checkpoint**: US2 eigenstaendig validierbar.

---

## Phase 5: User Story 3 - Datenschutz und Governance verankern (Priority: P1)

**Goal**: DSGVO-konforme Betriebs- und Entscheidungsstruktur mit klaren Verantwortlichkeiten.

**Independent Test**: Rollen-, Secret- und Datenschutzkontrollen sind dokumentiert, pruefbar und als Gate umsetzbar.

- [ ] T032 [P] [US3] Definiere Datenklassifizierung fuer Betriebsdaten in runbooks/operations-masterplan/data-classification-policy.md
- [ ] T033 [US3] Definiere Right-to-Erasure-Prozess fuer Betriebskontext in runbooks/operations-masterplan/right-to-erasure-procedure.md
- [ ] T034 [P] [US3] Definiere Secret-Ownership-Map in runbooks/operations-masterplan/secret-ownership-map.md
- [ ] T035 [US3] Definiere DSGVO-Log-Redaction-Checkliste in runbooks/operations-masterplan/dsgvo-log-redaction-checklist.md
- [ ] T036 [P] [US3] Erstelle Compliance-Validierungsjob in .github/workflows/compliance-gate.yml
- [ ] T037 [US3] Erstelle Governance-Review-Template fuer quartalsweise Reviews in templates/governance-review-template.md
- [ ] T038 [US3] Verankere Governance-Rollen in AGENTS.md
- [ ] T039 [US3] Dokumentiere Freigabeprozess fuer produktive Governance-Changes in runbooks/operations-masterplan/governance-change-runbook.md

**Checkpoint**: US3 eigenstaendig validierbar.

---

## Phase 6: User Story 4 - Betriebsresilienz durch Backups und Restore schaffen (Priority: P2)

**Goal**: Tatsaechlich wiederherstellbare Plattform statt nur nomineller Backups.

**Independent Test**: Vollstaendiger Restore-Test ist dokumentiert und erfolgreich.

- [ ] T040 [P] [US4] Definiere Backup-Plan fuer VM/DB/Volumes in runbooks/operations-masterplan/backup-plan.md
- [ ] T041 [US4] Erstelle taegliches Backup-Ausfuehrungsskript in scripts/masterplan/run-daily-backups.sh
- [ ] T042 [US4] Erstelle Restore-Test-Skript fuer isolierte Wiederherstellung in scripts/masterplan/run-restore-test.sh
- [ ] T043 [P] [US4] Erstelle Restore-Test-CI-Workflow (manuell triggerbar) in .github/workflows/restore-test.yml
- [ ] T044 [US4] Dokumentiere Restore-Runbook inkl. Abnahmekriterien in runbooks/operations-masterplan/restore-runbook.md
- [ ] T045 [US4] Definiere Backup/Restore-Evidence-Protokoll in reports/masterplan/backup-restore-evidence.md

**Checkpoint**: US4 eigenstaendig validierbar.

---

## Phase 7: User Story 5 - Monitoring und Alerts fuer kritische Signale bereitstellen (Priority: P2)

**Goal**: Kritische Ausfaelle aktiv erkennen und verbindlich innerhalb SLA bestaetigen.

**Independent Test**: Simulierte kritische Vorfaelle loesen Slack+E-Mail aus, Ack erfolgt <= 30 Minuten.

- [ ] T046 [P] [US5] Definiere Monitoring-Signalmatrix (CPU, RAM, Disk, HTTPS, Queue, Webhooks) in monitoring/masterplan/signal-matrix.yaml
- [ ] T047 [US5] Erstelle Alert-Routing-Konfiguration fuer Slack und E-Mail in monitoring/masterplan/alert-routing.yaml
- [ ] T048 [US5] Erstelle Alert-Simulation-Skript fuer kritische Vorfaelle in scripts/masterplan/simulate-critical-alerts.sh
- [ ] T049 [P] [US5] Erstelle Ack-SLA-Pruefskript (<= 30 Minuten) in scripts/masterplan/verify-alert-ack-sla.sh
- [ ] T050 [US5] Erstelle Monitoring- und Alert-Gate-Workflow in .github/workflows/monitoring-gate.yml
- [ ] T051 [US5] Dokumentiere Alert- und Incident-Runbook in runbooks/operations-masterplan/incident-alert-runbook.md

**Checkpoint**: US5 eigenstaendig validierbar.

---

## Phase 8: User Story 6 - Teamfaehige Betriebsuebergabe sicherstellen (Priority: P3)

**Goal**: Betriebsfaehigkeit ohne Einzelpersonenabhaengigkeit.

**Independent Test**: Zweite Person kann kritische Betriebsablaeufe nur mit Doku erfolgreich ausfuehren.

- [ ] T052 [P] [US6] Erstelle Service-Map fuer alle produktiven Betriebskomponenten in runbooks/operations-masterplan/service-map.md
- [ ] T053 [P] [US6] Erstelle Architekturdiagramm mit Betriebsgrenzen in runbooks/operations-masterplan/architecture-diagram.md
- [ ] T054 [US6] Erstelle Uebergabe-Checkliste fuer Vertretungsbetrieb in runbooks/operations-masterplan/handover-checklist.md
- [ ] T055 [US6] Erstelle Betriebs-Onboarding-Runbook in runbooks/operations-masterplan/operations-onboarding.md
- [ ] T056 [US6] Dokumentiere Endabnahme und DoD-Nachweis fuer den Masterplan in reports/masterplan/final-readiness-report.md

**Checkpoint**: US6 eigenstaendig validierbar.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Abschlussarbeiten ueber mehrere Stories hinweg.

- [ ] T057 [P] Konsolidiere Querreferenzen zwischen Runbooks und Reports in runbooks/operations-masterplan/index.md
- [ ] T058 Aktualisiere zentrale Projektdokumentation mit Masterplan-Ergebnissen in README.md
- [ ] T059 [P] Fuehre End-to-End-Quickstart-Validierung aus und dokumentiere Ergebnis in specs/002-infrastruktur-donation-masterplan/quickstart.md
- [ ] T060 Erstelle Abschluss-Check gegen Go-/No-Go-Regeln in reports/masterplan/go-no-go-final-check.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): Startet sofort.
- Foundational (Phase 2): Abhaengig von Setup; blockiert alle User Stories.
- User Story Phasen (3 bis 8): Starten erst nach Foundational.
- Polish (Phase 9): Nach allen gewuenschten User Stories.

### User Story Dependencies

- US1 (P1): Startet zuerst nach Foundation, liefert Infrastrukturbasis.
- US2 (P1): Nach US1 empfohlen, da Donation-Gates auf Plattformbasis aufsetzen.
- US3 (P1): Kann parallel zu US2 laufen, sobald Foundation steht.
- US4 (P2): Nach US1 und teilweise US3 empfohlen (Governance- und Plattformrahmen).
- US5 (P2): Nach US1, parallel zu US4 moeglich.
- US6 (P3): Nach US1 bis US5, da Uebergabe auf finalen Prozessen basiert.

### Empfohlene Reihenfolge fuer Abschluss

1. US1
2. US2 und US3 (parallel moeglich)
3. US4 und US5 (parallel moeglich)
4. US6

### Within Each User Story

- Policy/Vertrag vor Automationsskript.
- Skript vor CI-Gate.
- CI-Gate vor Runbook-Abschluss.
- Story gilt erst als fertig mit dokumentiertem Evidenznachweis.

### Parallel Opportunities

- Alle [P]-Tasks in Setup und Foundational parallel.
- US2/US3 koennen parallel laufen.
- US4/US5 koennen parallel laufen.
- Dokumentationsaufgaben mit [P] koennen parallel zu nicht-blockierenden Implementationen laufen.

---

## Parallel Example: User Story 1

```bash
# Parallel in US1 starten:
T015 deployment-scripts/infra/terraform/main.tf
T016 deployment-scripts/infra/terraform/network.tf
T017 deployment-scripts/infra/terraform/compute.tf

# Danach sequentiell:
T018 -> T019 -> T020 -> T021 -> T022
```

## Parallel Example: User Story 2

```bash
# Parallel in US2 starten:
T023 config-templates/donation-gate-config.json
T024 .github/workflows/donation-webhook-validation.yml
T028 scripts/masterplan/collect-receipt-evidence.sh

# Danach sequentiell:
T025 -> T027 -> T029 -> T031 -> T030
```

## Parallel Example: User Story 5

```bash
# Parallel in US5 starten:
T046 monitoring/masterplan/signal-matrix.yaml
T049 scripts/masterplan/verify-alert-ack-sla.sh

# Danach sequentiell:
T047 -> T048 -> T050 -> T051
```

---

## Implementation Strategy

### MVP First (US1 als erste lauffaehige Inkrement-Stufe)

1. Phase 1 und 2 abschliessen.
2. US1 vollstaendig umsetzen.
3. Plattform-Readiness + Expositionsregel validieren.
4. Erst danach US2/US3 freigeben.

### Incremental Delivery

1. Infrastrukturstabilitaet (US1)
2. Donation + Governance (US2 + US3)
3. Resilienz + Observability (US4 + US5)
4. Teamuebergabe und finale Betriebsreife (US6)

### Parallel Team Strategy

Mit mehreren Rollen:

1. Gemeinsamer Abschluss von Phase 1 und 2.
2. Platform/Infra-Team auf US1.
3. Donation-Team auf US2 parallel zu Security/Governance-Team auf US3.
4. Ops-Team auf US4 parallel zu Monitoring-Team auf US5.
5. Abschliessend gemeinsames Handover auf US6.

---

## Notes

- [P]-Tasks sind dateiseitig entkoppelt geplant.
- Jede User Story bleibt eigenstaendig testbar.
- Keine Freigabe ohne evidenzbasierte Gate-Erfuellung.
- Commit nach logischen Task-Gruppen empfohlen.
