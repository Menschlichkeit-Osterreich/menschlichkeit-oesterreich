# Tasks: Speckit Multi-App Rollout

## Format

- [ID] [P?] [APP] Beschreibung mit Pfadbezug

## Phase 1: API

- [ ] A001 [P] [api] Endpunkt-Inventar und Ownership-Mapping fuer apps/api dokumentieren.
- [ ] A002 [api] Test-/Qualitaetsgates fuer apps/api auf Projektboard-Status mappen.
- [ ] A003 [api] Offene API-Issues nach Risiko in Welle A/B priorisieren.

## Phase 2: Website

- [ ] W001 [P] [website] Website-Taskcluster nach User-Flows strukturieren (Landing, Auth, Donation).
- [ ] W002 [website] Abhaengigkeiten zwischen Website und API-Issues explizit verknuepfen.
- [ ] W003 [website] Abarbeitungsreihenfolge fuer Welle A und C festlegen.

## Phase 3: CRM

- [ ] C001 [P] [crm] CRM-Integrationspakete (CiviCRM, Zahlungen, Regeln) in Arbeitspakete schneiden.
- [ ] C002 [crm] CRM-Issues auf Betriebskritikalitaet (P0/P1/P2) neu ordnen.
- [ ] C003 [crm] Schnittstellenkontrakte zu API/Website im Plan referenzieren.

## Phase 4: Forum

- [ ] F001 [P] [forum] Forum-Basisaufgaben und Sicherheitsaufgaben in getrennte Streams ordnen.
- [ ] F002 [forum] Forum-Issues mit DSGVO-/Governance-Issues verlinken.
- [ ] F003 [forum] Realistische Umsetzungsreihenfolge fuer Welle B definieren.

## Phase 5: Babylon Game

- [ ] G001 [P] [babylon-game] Game-Issues nach Core-Gameplay vs. Integration splitten.
- [ ] G002 [babylon-game] Abhaengigkeiten zu Website/Auth transparent machen.
- [ ] G003 [babylon-game] Welle C Priorisierung und Akzeptanzkriterien finalisieren.

## Phase 6: Cross-App Orchestrierung

- [ ] X001 [P] [cross] Einheitliches Labelset fuer Multi-App Speckit definieren.
- [ ] X002 [cross] Alle Multi-App Speckit-Issues in Project #2 einpflegen.
- [ ] X003 [cross] Regel fuer veraltete/duplizierte Issues als Repo-Standard dokumentieren.
- [ ] X004 [cross] Sprintreihenfolge fuer 4 Wellen im Board fixieren.
- [ ] X005 [cross] Abschluss-Review und Fortschrittsbaseline erfassen.
