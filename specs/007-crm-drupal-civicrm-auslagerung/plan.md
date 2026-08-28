# SUPERSEDED Implementation Plan: CRM Drupal + CiviCRM Auslagerung aus Plesk

**Original date**: 2026-05-19  
**Superseded**: 2026-08-28  
**Status**: HISTORICAL / NON-EXECUTABLE

The former implementation plan to move Drupal/CiviCRM from Plesk to an Azure Linux VM is cancelled.

Do not use this file to provision Azure CRM infrastructure, create a CRM staging VM for migration, copy production CRM data to a new target, perform a CRM cutover, change CRM DNS away from Plesk, or reduce/shut down the Plesk CRM runtime.

## Canonical runtime split

| Runtime | Services |
| --- | --- |
| Plesk | Drupal/CiviCRM, Website, Forum |
| Azure devmoe | API, Games, n8n |

## Replacement plan

Use #535 as the architecture-remediation tracker and the following current work items:

- #484 CRM/Plesk governance, privacy, secret mapping and DNS
- #486 CRM/Plesk product inventory
- #488 CRM/Plesk data integrity and API/AuthX regression smoke
- #489 CRM/Plesk backup, restore, monitoring and hardening
- #493 CRM/Plesk governance and gate hygiene
- #436-#439 Plesk connectivity, inventory, deployment and BSM/monitoring contracts
- PR #533 Plesk read-only audit pre-validation

See [SUPERSEDED.md](SUPERSEDED.md). The original migration plan remains available in Git history for audit purposes.

No live infrastructure change is authorized by this file.
