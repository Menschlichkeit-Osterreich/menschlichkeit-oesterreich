# SUPERSEDED: CRM Drupal + CiviCRM Auslagerung aus Plesk

**Created**: 2026-05-19  
**Superseded**: 2026-08-28  
**Status**: SUPERSEDED

## Decision

This specification is retained only as historical evidence. It is not an active implementation specification and must not be used to provision a CRM Azure VM, migrate Drupal/CiviCRM away from Plesk, perform a CRM DNS cutover, or shut down the Plesk CRM vHost.

The active runtime split is:

- Plesk: Drupal/CiviCRM, Website, Forum
- Azure devmoe: API, Games, n8n

CiviCRM remains on Plesk. Azure remains valid for the separate API/Games/n8n container track and is not removed by this decision.

## Replacement work

Current architecture remediation and operations are tracked in:

- #535 architecture drift and canonical runtime decision
- #484 CRM/Plesk governance, privacy, secrets and DNS
- #486 CRM/Plesk product inventory
- #488 CRM/Plesk data integrity and API/AuthX regression smoke
- #489 CRM/Plesk backup, restore, monitoring and hardening
- #493 CRM/Plesk governance and gate hygiene
- #436-#439 Plesk connectivity, inventory, deployment and BSM/monitoring contracts
- PR #533 Plesk read-only audit pre-validation

See [SUPERSEDED.md](SUPERSEDED.md) for the tombstone contract.

## Historical material

The former migration requirements, assumptions and cutover design remain available in Git history. They are intentionally not repeated here because agentic workers must not mistake them for current instructions.

No live infrastructure change is authorized by this file.
