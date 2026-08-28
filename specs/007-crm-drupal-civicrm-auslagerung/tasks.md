# SUPERSEDED Tasks: CRM Drupal + CiviCRM Auslagerung aus Plesk

**Status**: HISTORICAL / NON-EXECUTABLE since 2026-08-28.

The former unchecked task list for Azure CRM foundation, migration staging, data transfer, cutover and Plesk shutdown is intentionally removed from the active task surface.

Do not execute CRM-to-Azure work from this directory.

## Current task routing

- #484: CRM/Plesk governance, owner, privacy, secrets and DNS
- #486: CRM/Plesk product inventory
- #488: CRM/Plesk data integrity, API/AuthX and regression smoke
- #489: CRM/Plesk backup, restore, monitoring and hardening
- #493: CRM/Plesk governance and gate hygiene
- #436: Plesk read-only connectivity and SSH trust contract
- #437: Plesk product inventory against the read-only audit contract
- #438: Plesk deployment contract and rollback consolidation
- #439: Plesk BSM secret contract and health monitoring
- #535: architecture drift and canonical Plesk/Azure service ownership
- PR #533: Plesk read-only audit pre-validation

## Explicitly superseded work

The following work is not planned under the current architecture:

- CRM Azure foundation specifically for Drupal/CiviCRM
- CRM migration staging VM outside Plesk
- production CRM cutover away from Plesk
- DNS migration of CRM to an Azure target
- Plesk CRM vHost shutdown intended to remove Plesk as a CRM dependency

Azure remains the separate platform track for API, Games and n8n.

See [SUPERSEDED.md](SUPERSEDED.md). Historical task details remain available in Git history.
