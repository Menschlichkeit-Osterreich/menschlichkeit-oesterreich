# Implementation Plan: Azure-n8n-Produktionspfad Phase 1-2-3 bis Abnahmevorbereitung

**Branch**: `20260518-azure-n8n-produktionspfad-phase-1-2-3` | **Date**: 2026-05-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/20260514-azure-n8n-bereitstellung/spec.md`

## Summary

Dieses Vorhaben ersetzt unscharfe Infrastrukturannahmen durch einen expliziten, abnahmefaehigen Azure-n8n-Bereitstellungspfad. Fokus ist die Vorbereitungsstrecke bis zur Abnahme: Grant/Billing-Klaerung, Ressourcen-Sollbild, Netzwerkhaertung, DNS-/HTTPS-Zielbild, Backup-/Restore-Pflicht und evidenzbasierte Go/No-Go-Logik. Produktiver Rollout ist explizit ausserhalb dieses Blocks.

## Technical Context

**Domain**: Azure Infrastrukturdesign und Betriebsvertrag fuer `n8n.menschlichkeit-oesterreich.at`

**Primary Dependencies**: Azure Subscription/Billing, DNS-Verwaltung fuer `menschlichkeit-oesterreich.at`, n8n Runtime via Docker Compose

**Storage**: Spezifikationsartefakte im Repository (`spec.md`, `plan.md`, `data-model.md`, `quickstart.md`, `contracts/*`)

**Testing/Validation**: Evidenzmatrix je Gate-Punkt (Primaerquelle, Live-Nachweis, offener Pruefpunkt) statt lokaler Simulationsbelege

**Target Platform**: Azure VM-basierter Erstbetrieb (Single-Main zulaessig bei expliziter Dokumentation)

**Constraints**:

- Kein produktiver Claim ohne Primaernachweis
- Azure ist Zielarchitektur, Plesk ist Altzustand
- Oeffentlich nur `22`, `80`, `443`; keine Oeffnung von `5678`, `5432`, `6379`
- Pflicht-Secrets und Backup-Pfad vor spaeterem Go

## Constitution Check

- Governance-Konsistenz: PASS (in Einklang mit `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`)
- Scope-Grenzen: PASS (kein KI-Ausbau, kein n8n-Workflow-Fachausbau, kein produktiver Rollout)
- Freeze-Konformitaet Donation-Pilot: PASS (kein neuer Workflow-Refactor in Donation APIv4/n8n-Pilot)

## Phase Plan

### Phase 1 - Wahrheitssystem und Gate-Definition

- Zustandsklaerung fuer Grant/Billing inklusive Ownership und Renewal-Verantwortung
- Definition von Evidenztypen und Blockerklassen
- Klare Trennung von Sollzustand und unbestaetigtem Live-Zustand

### Phase 2 - Zielarchitektur und Haertungsvertrag

- Sollbild fuer Resource Group, VM, Public IP, NSG, Disk, Monitoring
- Netzwerk-/SSH-Haertungsvertrag inkl. Expositionsgrenzen
- Runtime-Vertrag fuer n8n, PostgreSQL, Reverse Proxy, Volumes und Pflicht-Env

### Phase 3 - Abnahmevorbereitung

- DNS-Zielbild und Plesk-Abloesepfad mit Go/No-Go-Regeln
- HTTPS-Abnahmebedingungen inkl. URL-Konsistenz und Rueckfallpfad
- Backup-/Restore-Gate als verpflichtendes Kriterium

## Project Structure

```text
specs/20260514-azure-n8n-bereitstellung/
├── spec.md
├── plan.md
├── data-model.md
├── quickstart.md
├── tasks.md
└── contracts/
    ├── deployment-contract.md
    ├── runtime-contract.md
    └── workflow-validation-contract.md
```

## Deliverables

- Konsistenter Sollzustand fuer Azure-n8n-Kernbetrieb
- Gate-/Evidenzmodell pro Abnahmeobjekt
- Operatives Uebergabepaket fuer spaetere Ausfuehrung ohne Architektur-Raten
- Explizite Blockerlisten fuer fehlende Primaernachweise

## Complexity Tracking

Keine Architekturverzweigung vorgesehen. Das Vorhaben bleibt bei genau einem Zielbild fuer den n8n-Erstbetrieb auf Azure.
