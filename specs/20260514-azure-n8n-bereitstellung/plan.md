# Implementation Plan: n8n Workflow Validitaets-Gate

**Branch**: `20260515-before-specify-hook` | **Date**: 2026-05-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/20260514-azure-n8n-bereitstellung/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Dieser Block fuehrt ein belastbares Validitaets-Gate fuer produktionsnahe n8n-Workflows unter `automation/n8n` ein. Kern ist eine explizite Inventarisierung der relevanten Workflow-Dateien, ein reproduzierbarer lokaler JSON-Validierungscheck und ein CI-Gate, das bei Syntaxfehlern fehlschlaegt. Der bekannte Sonderfall `finance-donation-processing.json` bleibt bis zu einem spaeteren Import- oder Dry-Run-Nachweis explizit sichtbar markiert.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: JavaScript (Node.js >=22.19.0), YAML (GitHub Actions)

**Primary Dependencies**: Node.js Built-ins (`fs/promises`, `path`), npm Script-Runner, GitHub Actions (`actions/checkout`, `actions/setup-node`)

**Storage**: Repository-Dateien (Workflow-JSON und Inventar-Datei), keine Datenbank

**Testing**: `npm run n8n:validate` lokal und identischer Check in `.github/workflows/n8n-json-gate.yml`

**Target Platform**: Linux-Entwicklungsumgebung und GitHub Actions (`ubuntu-latest`)

**Project Type**: Monorepo-Automation (Script + CI-Gate + Doku)

**Performance Goals**: Validierungslauf fuer aktuellen Scope (26 Dateien) in wenigen Sekunden; klare Fehlerausgabe pro Datei

**Constraints**: Strikte JSON-Syntaxpruefung, expliziter Scope unter `automation/n8n`, keine Legacy-/Mirror-Pfade, keine Erweiterung auf Azure/Deployment-Themen

**Scale/Scope**: Start mit 26 produktionsnahen Workflows; erwartete moderate Erweiterung ueber Inventarpflege

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Verfassungsstatus: `.specify/memory/constitution.md` ist ein Platzhalter ohne verbindliche Prinzipien.
- Gate C1 (Governance): PASS mit Hinweis - verbindliche Repo-Governance kommt aus `AGENTS.md`, `CLAUDE.md` und Core-Instructions.
- Gate C2 (Scope-Disziplin): PASS - Nicht-Ziele (Azure, DNS/HTTPS, Reverse Proxy, Queue-Mode, Fachlogikverschiebung) bleiben explizit ausgeschlossen.
- Gate C3 (Qualitaets-Gate): PASS - lokaler und CI-validierter, reproduzierbarer Check wird als Merge-Blocker definiert.

**Post-Design Re-Check**: PASS. Design-Artefakte bleiben im Scope des P0-Gates und enthalten keine verbotenen Infrastruktur-/Runtime-Erweiterungen.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

automation/
└── n8n/
├── README.md
├── workflows/
└── workflow-inventory.production.json

scripts/
└── validate-n8n-workflows.mjs

.github/
└── workflows/
└── n8n-json-gate.yml

**Structure Decision**: Diese Umsetzung ist ein Automation/CI-Doku-Change ohne App-Code-Aenderung. Die fachliche Struktur konzentriert sich auf `automation/n8n`, `scripts` und `.github/workflows`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
