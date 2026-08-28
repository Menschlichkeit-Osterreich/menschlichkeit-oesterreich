# SUPERSEDED: CRM Drupal + CiviCRM Auslagerung aus Plesk

Status: SUPERSEDED on 2026-08-28.

The former target "Drupal/CiviCRM leaves Plesk and moves to Azure" is no longer an active architecture decision.

Canonical runtime split:

- Plesk: Drupal/CiviCRM, Website, Forum
- Azure devmoe: API, Games, n8n

Do not execute VM provisioning, CRM cutover, DNS cutover away from Plesk, or Plesk CRM shutdown from this directory.

Replacement work is tracked in #535 and the rewritten CRM/Plesk issues #484, #486, #488, #489 and #493. Plesk read-only runtime verification is developed in PR #533.

Git history remains the source for the former migration design.
