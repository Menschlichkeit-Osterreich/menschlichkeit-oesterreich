# Implementation Plan: Azure n8n Bereitstellungspfad

**Branch**: `20260514-azure-n8n-bereitstellung` | **Date**: 2026-05-14 | **Spec**: [specs/20260514-azure-n8n-bereitstellung/spec.md](specs/20260514-azure-n8n-bereitstellung/spec.md)

**Input**: Feature specification from `/specs/20260514-azure-n8n-bereitstellung/spec.md`

**Note**: This plan is the phase-gated planning artifact for the Azure pre-deployment path. It keeps the current scope strictly before DNS/HTTPS cutover, reverse proxy, production n8n rollout, queue mode, and backup expansion.

## Summary

Prepare a governed Azure pre-deployment path for `n8n.menschlichkeit-oesterreich.at` with explicit Grant/Billing validation, a documented Single-Main operating contract, a hardened Ubuntu 24.04 VM baseline, a static public IP and minimal NSG surface, plus Docker Compose readiness. The plan intentionally stops before DNS cutover, HTTPS acceptance, reverse proxy, and productiv n8n deployment.

## Technical Context

**Language/Version**: Markdown planning artefacts; Azure VM target is Ubuntu 24.04 LTS; shell hardening and validation via Bash/Azure CLI if later executed

**Primary Dependencies**: Azure subscription governance, Azure VM, static Public IP, NSG, SSH, UFW, Docker Engine, Docker Compose plugin, Microsoft nonprofit/grant and billing evidence

**Storage**: Azure managed disk for the VM; Docker volumes for future runtime state; documentation files under `specs/20260514-azure-n8n-bereitstellung/`

**Testing**: Manual governance checks, Azure portal/CLI evidence, SSH hardening checks, UFW validation, Docker/Compose health checks

**Target Platform**: Azure Linux VM deployment path for a single host

**Project Type**: infrastructure/runbook planning

**Performance Goals**: Minimal attack surface and deterministic gate transitions; no exposure of ports beyond 22/80/443 during this block

**Constraints**: No DNS cutover, no HTTPS acceptance, no reverse proxy, no production n8n container deployment, no queue mode, no public 5678/5432/6379 ports, no secret material in docs

**Scale/Scope**: One Azure Resource Group, one Ubuntu 24.04 VM, one static Public IP, one NSG, one deploy user, one Docker Compose base path

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Security first: PASS, because the plan keeps the surface minimal and explicitly blocks public service ports and password/root login.
- Data integrity: PASS, because there is no implicit production status without live evidence for Grant/Billing and the next gate is explicit.
- Stability: PASS, because Single-Main is the only allowed operating mode in this block.
- Governance clarity: PASS, because each Azure step must name target object, purpose, risk, and success criterion.
- Repo hygiene: PASS, because the active plan reference is centralized under `specs/20260514-azure-n8n-bereitstellung/`.

## Project Structure

### Documentation (this feature)

```text
specs/20260514-azure-n8n-bereitstellung/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/
└── tasks.md             # Phase 2 output (/speckit.tasks command - not created here)
```

### Source Code (repository root)

```text
automation/n8n/
├── docker-compose.yml
├── docker-compose.https.yml
├── deploy-https.sh
└── README.md

deployment-scripts/
├── deploy-crm-plesk.sh
└── deploy-api-plesk.sh

docs/
├── architecture/
│   └── azure-database-setup.md
└── backend-audit/
    └── N8N_WORKFLOW_AUDIT_AND_PLAN.md
```

**Structure Decision**: This block is documentation-first and operationally anchored to the existing `automation/n8n/` and `deployment-scripts/` paths. No new runtime code tree is introduced in this planning pass.

## Complexity Tracking

> No constitution violations require justification for this planning block.
