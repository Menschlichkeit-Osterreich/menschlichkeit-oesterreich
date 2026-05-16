# Tasks: Speckit Multi-App Rollout

## Format

- ID (P?) (APP) Beschreibung mit Pfadbezug

## Phase 1: API

- A001 (P) (api) Endpunkt-Inventar und Ownership-Mapping fuer apps/api
  dokumentieren.
- A002 (api) Test-/Qualitaetsgates fuer apps/api auf Projektboard-Status
  mappen.
- A003 (api) Offene API-Issues nach Risiko in Welle A/B priorisieren.

## Phase 2: Website

- W001 (P) (website) Website-Taskcluster nach User-Flows strukturieren
  (Landing, Auth, Donation).
- W002 (website) Abhaengigkeiten zwischen Website und API-Issues explizit
  verknuepfen.
- W003 (website) Abarbeitungsreihenfolge fuer Welle A und C festlegen.

## Phase 3: CRM

- C001 (P) (crm) CRM-Integrationspakete (CiviCRM, Zahlungen, Regeln) in
  Arbeitspakete schneiden.
- C002 (crm) CRM-Issues auf Betriebskritikalitaet (P0/P1/P2) neu ordnen.
- C003 (crm) Schnittstellenkontrakte zu API/Website im Plan referenzieren.

## Phase 4: Forum

- F001 (P) (forum) Forum-Basisaufgaben und Sicherheitsaufgaben in getrennte
  Streams ordnen.
- F002 (forum) Forum-Issues mit DSGVO-/Governance-Issues verlinken.
- F003 (forum) Realistische Umsetzungsreihenfolge fuer Welle B definieren.

## Phase 5: Babylon Game

- G001 (P) (babylon-game) Game-Issues nach Core-Gameplay vs. Integration
  splitten.
- G002 (babylon-game) Abhaengigkeiten zu Website/Auth transparent machen.
- G003 (babylon-game) Welle C Priorisierung und Akzeptanzkriterien
  finalisieren.

## Phase 6: Cross-App Orchestrierung

- X001 (P) (cross) Einheitliches Labelset fuer Multi-App Speckit definieren.
- X002 (cross) Alle Multi-App Speckit-Issues in Project #2 einpflegen.
- X003 (cross) Regel fuer veraltete/duplizierte Issues als Repo-Standard
  dokumentieren.
- X004 (cross) Sprintreihenfolge fuer 4 Wellen im Board fixieren.
- X005 (cross) Abschluss-Review und Fortschrittsbaseline erfassen.

## Implementierungsstand (2026-05-16)

Diese Spezifikation wurde operativ gestartet. Die folgenden Artefakte liegen vor:

1. `labelset.json` fuer X001.
2. `project2-wave-governance.md` fuer X004.
3. `issue-lifecycle-policy.md` fuer X003.
4. `baseline-2026-05-16.md` fuer X005.

Die Anwendung der Regeln in GitHub Project #2 inklusive Label-Migration ist
durchgefuehrt.

Status 2026-05-16 (Cross-App Orchestrierung):

- X001 erledigt.
- X002 erledigt.
- X003 erledigt.
- X004 erledigt.
- X005 erledigt.

X003 Nachweis:

- Lifecycle-Review dokumentiert in `x003-lifecycle-review-2026-05-16.md`.
- Ergebnis: keine harten Kandidaten fuer duplicate, superseded, deprecated.

Wave-A-Umsetzungsstart:

- Startpaket dokumentiert in `wave-a-startpaket-2026-05-16.md`.
- Enthaltene Arbeitspakete: A001, W001, W002 inkl. Deliverables und DoD.
- A001 Erstnachweis dokumentiert in `a001-api-endpoint-inventar-2026-05-16.md`.
- A002 Gate-Mapping dokumentiert in
  `a002-api-quality-gates-mapping-2026-05-16.md`.
- A003 Risiko-Priorisierung dokumentiert in
  `a003-api-risk-priorisierung-wave-ab-2026-05-16.md`.
- W001 Cluster-Nachweis dokumentiert in `w001-website-taskcluster-2026-05-16.md`.
- W002 Dependency-Nachweis dokumentiert in
  `w002-api-website-dependency-matrix-2026-05-16.md`.

Update 2026-05-16 (Ausfuehrung):

- X002 wurde umgesetzt: Issues #380-#399 sind in Project #2 eingepflegt.
- Service- und Wave-Labels wurden gemappt:
  - #380-#382 -> service/api + wave/A-foundation
  - #383-#385 -> service/website + wave/A-foundation
  - #386-#388 -> service/crm + wave/B-feature-core
  - #389-#391 -> service/forum + wave/B-feature-core
  - #392-#394 -> service/babylon-game + wave/C-stabilization
  - #395-#399 -> service/cross + wave/A-foundation
