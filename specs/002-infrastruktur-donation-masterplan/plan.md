# Implementation Plan: Infrastruktur, Donation und Governance Masterplan

**Branch**: `20260518-setup-azure-n8n` | **Date**: 2026-05-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-infrastruktur-donation-masterplan/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Der Plan etabliert eine belastbare Betriebsplattform fuer Menschlichkeit Oesterreich mit verbindlichen Go-/No-Go-Gates ueber Infrastruktur, Donation-End-to-End, DSGVO/Governance, Backup/Restore und Monitoring. Die Umsetzung erfolgt phasenweise mit Terraform+AVM als IaC-Standard, strikt interner Exposition fuer API/n8n hinter einem oeffentlichen Reverse-Proxy sowie klaren Nachweisartefakten pro Gate.

## Technical Context

**Language/Version**: Terraform 1.8+ (IaC), YAML (GitHub Actions), Bash/PowerShell (Ops-Skripte), Python 3.12+ (API-bezogene Smokes), Node.js 22+ (Tooling)

**Primary Dependencies**: Azure Resource Manager, Azure Verified Modules (AVM), Docker Engine + Compose, Reverse Proxy (Nginx oder Caddy), Stripe Webhooks, Slack Alerting, E-Mail Alerting

**Storage**: PostgreSQL (operativ), persistente Docker-Volumes, Backup-Artefakte (VM-Snapshot, DB-Dump, Volume-Sicherung)

**Testing**: Gate-Smokes via bestehende Skripte/Tasks, Deployment-Checks, Donation-Smokes, Restore-Tests, externe Erreichbarkeits- und Portpruefungen

**Target Platform**: Azure Linux VM (Ubuntu LTS) mit oeffentlichem Reverse-Proxy und internen Backend-Diensten

**Project Type**: Monorepo-Betriebs- und Infrastrukturvorhaben mit Multi-Service-Integration

**Performance Goals**: >= 99,9% monatliche Verfuegbarkeit, RTO <= 2h, kritische Alert-Bestaetigung <= 30 Minuten

**Constraints**: Nur Reverse-Proxy oeffentlich exponiert; API/n8n intern, keine Secrets in Doku/Logs, keine Plesk-Zielarchitektur, API-first fuer Business-Logik

**Scale/Scope**: Vereinsplattform mit Website, API, CRM-Integration, Donation-Pipeline, Monitoring/DR und teamfaehiger Betriebsuebergabe

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Verfassungsstatus: `.specify/memory/constitution.md` ist ein Platzhalter ohne ratifizierte Prinzipien.
- Gate C1 (Governance-Konsistenz): PASS mit Hinweis - operative Leitplanken aus `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md` und Core-Instructions gelten bindend.
- Gate C2 (Scope-Schutz): PASS - keine Verlagerung von Business-Logik nach n8n, kein manueller Drift ausserhalb IaC, keine unkontrollierte oeffentliche Exposition.
- Gate C3 (Nachweisbarkeit): PASS - jede Phase hat messbare Exit-Kriterien und evidenzbasierte Freigaben.

**Post-Design Re-Check**: PASS. Design-Artefakte bleiben konsistent mit API-first, DSGVO-Guardrails, IaC-Standardisierung und reproduzierbaren Rollout-Gates.

## Project Structure

### Documentation (this feature)

```text
specs/002-infrastruktur-donation-masterplan/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── platform-operations-contract.md
│   └── donation-governance-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── website/
├── api/
└── crm/

automation/
└── n8n/

deployment-scripts/
scripts/
monitoring/
.github/workflows/
runbooks/
```

**Structure Decision**: Der Plan bleibt repo-nativ und governance-orientiert. Es wird kein neuer Service eingefuehrt; stattdessen werden bestehende Pfade fuer IaC-nahe Deployments, Betriebsrunbooks, Monitoring und Donation-Gates standardisiert verknuepft.

## Complexity Tracking

Keine Verfassungsverletzungen identifiziert; kein zusaetzliches Tracking erforderlich.

