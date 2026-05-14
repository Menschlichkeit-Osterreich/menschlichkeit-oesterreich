# Implementation Plan: n8n Workflow Validitaets-Gate

**Branch**: `20260516-spec-request-hook` | **Date**: 2026-05-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/20260514-azure-n8n-bereitstellung/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Dieser Block etabliert ein belastbares Validitaets-Gate fuer produktionsnahe n8n-Workflows mit repositoryweitem Scope (inklusive expliziter Legacy-/Mirror-Excludes), strikter JSON-Syntaxpruefung fuer inventarisierte Dateien und expliziter Sonderfall-Sichtbarkeit fuer `finance-donation-processing.json`. Scope-Abweichungen werden sichtbar als Warnung reportet, ohne Merge-Blockade; Syntaxfehler und fehlende inventarisierte Dateien bleiben harte Fail-Kriterien.

## Technical Context

**Language/Version**: JavaScript (Node.js >=22.19.0), YAML (GitHub Actions)

**Primary Dependencies**: Node.js Built-ins (`fs/promises`, `path`), npm Script-Runner, GitHub Actions (`actions/checkout`, `actions/setup-node`)

**Storage**: Repository-Dateien (Inventar, Workflow-JSON, Validator-Reportausgabe), keine Datenbank

**Testing**: Lokaler Check via `npm run n8n:validate`, identischer CI-Check in `.github/workflows/n8n-json-gate.yml`

**Target Platform**: Linux-Entwicklungsumgebung und GitHub Actions (`ubuntu-latest`)

**Project Type**: Monorepo-Automation (Script + CI-Gate + Doku)

**Performance Goals**: Vollstaendige Scope-Auswertung mit deterministischer Ausgabe in wenigen Sekunden fuer den aktuellen Workflow-Bestand

**Constraints**: Harte Fehler nur fuer ungeltige/missing inventarisierte Workflows; Scope-Abweichungen als Warnung; keine Ausweitung auf Deployment/Infra-Themen

**Scale/Scope**: Repositoryweiter Workflow-Scope mit expliziter Ausschlussliste fuer Legacy-/Mirror-Pfade; initiale produktionsnahe Inventarliste bleibt die normative Pruefmenge

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Verfassungsstatus: `.specify/memory/constitution.md` ist ein Platzhalter ohne ratifizierte Prinzipien.
- Gate C1 (Governance-Konsistenz): PASS mit Hinweis - repo-weite Regeln aus `AGENTS.md`, `CLAUDE.md` und `.github/copilot-instructions.md` gelten als operative Leitplanken.
- Gate C2 (Scope-Grenzen): PASS - Nicht-Ziele bleiben unveraendert (kein Azure-Provisioning, kein DNS/HTTPS, kein Queue-Mode, keine API-Logikmigration).
- Gate C3 (Qualitaets-Gate): PASS - einheitlicher lokaler/CI-Pruefpfad mit reproduzierbarer Ergebnislogik.

**Post-Design Re-Check**: PASS. Phase-1-Artefakte bilden den geklaerten Warnmodus fuer Scope-Abweichungen konsistent ab, ohne den harten JSON-Gate-Kern zu verwässern.

## Project Structure

### Documentation (this feature)

```text
specs/20260514-azure-n8n-bereitstellung/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── workflow-validation-contract.md
│   └── deployment-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
automation/
└── n8n/
    ├── workflows/
    ├── README.md
    └── workflow-inventory.production.json

scripts/
└── validate-n8n-workflows.mjs

.github/
└── workflows/
    └── n8n-json-gate.yml
```

**Structure Decision**: Dieser Block ist ein Validator-/CI-/Dokumentationsvorhaben im bestehenden Monorepo. Die Implementierung bleibt auf `automation/n8n`, `scripts` und `.github/workflows` begrenzt; kein App-Service-Code wird erweitert.

## Complexity Tracking

Keine Verfassungsverletzungen identifiziert; kein zusaetzliches Tracking erforderlich.
