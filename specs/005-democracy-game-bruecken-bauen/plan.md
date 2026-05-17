# Implementation Plan: Democracy Game Bruecken bauen

**Branch**: `main` | **Date**: 2026-05-17 | **Spec**:
[spec.md](./spec.md)

**Input**: Feature specification from
`/specs/005-democracy-game-bruecken-bauen/spec.md`

## Summary

Das Feature liefert einen spielbaren Vertical Slice fuer das Democracy Game mit
verzweigten Dialogen, Rollenwahl, barrierearmem HUD, CMS-gestuetzter
Inhaltspflege, Workshop-Abstimmungen und DSGVO-konformer Telemetrie.

Technisch wird die Umsetzung als monorepo-uebergreifende Erweiterung in
`apps/babylon-game`, `apps/api` und `apps/crm` geplant. Die Umsetzung wird
durch harte, messbare Qualitaetsziele fuer Performance, Reliability und
Observability abgesichert.

## Technical Context

**Language/Version**:

- TypeScript (Next.js 16 + React 19) fuer `apps/babylon-game`
- Python 3.12+ (FastAPI) fuer `apps/api`
- PHP/Drupal 10 + CiviCRM fuer `apps/crm`

**Primary Dependencies**:

- Babylon.js 8 (3D Runtime und HUD-Integration)
- FastAPI + Pydantic + SQLAlchemy (API und Datenvertraege)
- Drupal JSON:API oder aequivalente CMS-Snapshot-Ausleitung

**Storage**:

- API-seitige persistente Speicherung fuer Fortschritt, Session und Telemetrie
- Versionierte CMS-Snapshots als freigegebene Inhaltsquelle

**Testing**:

- Frontend: Vitest (Unit), Playwright (E2E)
- Backend: Pytest (Unit/Integration)
- Contract-Checks gegen spezifizierte API-Schnittstellen

**Target Platform**:

- Browser-basierte Ausfuehrung des Spiels
- Linux-basierte API- und CMS-Laufzeit in bestehenden Deploy-Umgebungen

**Project Type**:

- Multi-App Webplattform mit 3D-Client, API-Service und CMS-Backoffice

**Performance Goals**:

- PG-001: Dialogauswahl bis UI-Reaktion <= 150 ms p95
- PG-002: API-Antwort fuer Dialog-/Szenario-Endpunkte <= 300 ms p95
- PG-003: Workshop-Abstimmungsaggregation <= 2 s p95 bei 30 Teilnehmenden

**Reliability Goals**:

- RG-001: Erfolgreiche Szenariofortsetzung nach Refresh in >= 99% der Tests
- RG-002: Keine Session-Korruption bei kurzfristigem Client-Reconnect
- RG-003: Fehlerquote kritischer API-Endpunkte < 1% pro 24h im Staging-Smoke

**Observability Goals**:

- OG-001: 100% aller API-Fehler erzeugen strukturierte Logs mit Korrelation-ID
- OG-002: 100% aller Workshop-Sessions besitzen Session-ID und Event-Trace
- OG-003: Dashboards zeigen Latenz p50/p95, Fehlerquote und Session-Abbrueche

**Constraints**:

- Nur freigegebene und versionierte CMS-Snapshots in Produktion
- Workshop-Gastzugang ist auf 2h begrenzt, danach Re-Join
- Rohtelemetrie max. 90 Tage, danach Loeschung oder irreversible Anonymisierung

**Scale/Scope**:

- Initialer Vertical Slice mit einem Premium-Szenario
- Workshop-Betrieb fuer mindestens 30 gleichzeitige Teilnehmende
- Erweiterbar auf weitere Szenarien ohne erneute Codepfad-Migration

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Aktueller Zustand von `.specify/memory/constitution.md` ist ein Platzhalter ohne
normative, ratifizierte Projektprinzipien. Daher gelten folgende Gate-Regeln:

1. **Gate A (Repo-Governance)**: PASS
   - AGENTS/CLAUDE/Copilot-Instructions wurden als verbindliche Quellen genutzt.

2. **Gate B (Security/DSGVO)**: PASS WITH CONSTRAINTS
   - Consent, Retention und Zugriffsgrenzen sind als harte Anforderungen erfasst.

3. **Gate C (Quality)**: PASS
   - Messbare NFR-Ziele fuer Performance, Reliability, Observability definiert.

4. **Gate D (Constitution Completeness)**: PASS
   - Constitution v1.0.0 ratifiziert am 2026-05-17 mit 7 Core Principles,
     Security Constraints und Development Workflow.

## Project Structure

### Documentation (this feature)

```text
specs/005-democracy-game-bruecken-bauen/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── democracy-game-api-v1.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── babylon-game/
│   ├── src/game/
│   │   ├── data/
│   │   ├── scenarios/
│   │   ├── state/
│   │   └── ui/
│   └── tests/
├── api/
│   ├── app/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   └── tests/
└── crm/
    └── httpdocs/web/modules/custom/
```

**Structure Decision**:
Umsetzung erfolgt als koordinierter Multi-App-Track in bestehenden aktiven
Servicepfaden (`apps/babylon-game`, `apps/api`, `apps/crm`) ohne neue
Parallelstruktur.

## Phase 0: Research Plan

1. Verbindliche Entscheidung fuer Content-Exportpfad (CMS-Snapshot-Strategie)
2. Workshop-Reconnect- und Abstimmungsabschlussregeln operationalisieren
3. Observability-Minimum fuer API + Workshop-Events festlegen

**Output**: [research.md](./research.md)

## Phase 1: Design Plan

1. Datenmodell fuer Szenario, Session, Consent und Telemetrie finalisieren
2. API-Vertragsdokument fuer v1-Endpunkte und Fehlermodelle erstellen
3. Quickstart fuer Vertical Slice inkl. messbarer NFR-Pruefung erstellen

**Outputs**:

- [data-model.md](./data-model.md)
- [contracts/democracy-game-api-v1.md](./contracts/democracy-game-api-v1.md)
- [quickstart.md](./quickstart.md)

## Complexity Tracking

- Violation: Keine (Constitution v1.0.0 ratifiziert)
- Status: Alle vier Gates bestanden.
