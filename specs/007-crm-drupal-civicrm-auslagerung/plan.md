# Implementation Plan: CRM Drupal + CiviCRM Auslagerung aus Plesk

**Branch**: `007-crm-drupal-civicrm-auslagerung` | **Date**: 2026-05-19 | **Spec**: [spec.md](spec.md)

## Summary

Drupal + CiviCRM verlassen Plesk und ziehen auf eine dedizierte Azure Linux VM. Migration in Schienen Foundation -> Inventar -> Staging-PoC -> Datenpruefung -> Cutover -> Betrieb. n8n bleibt unabhaengig gegated.

## Technical Context

- **Language/Runtime**: PHP 8.x (gemaess Drupal/CiviCRM-Anforderung), Composer 2, Drush 12.
- **Stack Zielumgebung**: Ubuntu LTS, Nginx, PHP-FPM, Cron, optional Redis fuer CiviCRM-Caching.
- **Datenbank**: MySQL 8 / MariaDB-kompatibel; managed bevorzugt.
- **Storage**: VM-lokal mit Backup + Offsite (Blob Storage). Optional spaeter Azure Files.
- **Testing**: drush status, CiviCRM Status Page, fachliche Stichproben, Restore-Test, Mail-Sink-Test.
- **Target Platform**: Azure Linux VM (Region nach Datenschutz/Latency).
- **Project Type**: Infrastruktur + Datenmigration (kein Anwendungsfeature im engeren Sinn).
- **Constraints**: DSGVO konform, kein Klartext-Secret im Repo, keine Mails aus Staging.

## Constitution Check

- **Sicherheit zuerst**: gehaertete Zugaenge, Secrets nur referenziert, TLS Pflicht.
- **Datenintegritaet**: Migration mit nachweisbarer Konsistenz und Rollback.
- **Stabilitaet**: Cutover nur mit getestetem Restore und Rollback-Plan.
- **Repo first**: Inventar, Runbooks, Manifeste werden im Repo gepflegt; keine ad-hoc Aenderungen ohne Dokumentation.
- **Plesk Sicherheits-Posture**: Plesk wird reduziert, Restdienste dokumentiert.

## Project Structure

```text
specs/007-crm-drupal-civicrm-auslagerung/
  spec.md
  plan.md
  tasks.md
  contracts/            (DNS-Matrix, Backup-Policy, Cutover-Gate)
  quickstart.md

docs/crm/
  inventory.md          # Vollstaendiges CRM-Inventar
  staging-poc.md        # PoC-Beschreibung, Konfiguration, Verifikation
  data-consistency.md   # Stichproben-Definition und Ergebnisse
  cutover-runbook.md    # Schritt-fuer-Schritt + Rollback
  backup-restore.md     # Strategie, RTO/RPO, Restore-Test
  monitoring-alerts.md  # Health, Logs, Alerts
  dsgvo-avv.md          # Subprozessoren, Datenkategorien, Vertraege
  dns-matrix.md         # Subdomains, TTL, Ziel
  plesk-reduction.md    # Was bleibt, was wird stillgelegt, wann

deployment-scripts/crm/
  provision-vm.sh
  install-php-extensions.sh
  install-composer-drush.sh
  configure-nginx.sh
  import-db.sh
  rsync-files.sh
  enable-mailsink.sh
  cutover-freeze.sh
  cutover-finalize.sh
  rollback-dns.sh
```

## Phasen und Wave-Mapping

| Phase   | Inhalt                                                                  | Wave            |
| ------- | ----------------------------------------------------------------------- | --------------- |
| Phase 0 | Owner, Budget, Datenschutz, Secret-Strategie, DNS-Matrix                | A-foundation    |
| Phase 1 | Azure Foundation (RG, Key Vault, Log Analytics, Blob, Netzwerk)         | A-foundation    |
| Phase 2 | Inventar Drupal/CiviCRM/Cron/DB/Files/SMTP/Rollen/API                   | A-foundation    |
| Phase 3 | Staging-VM bauen, PHP-Extensions, Composer, Drush, DB-Import, File-Sync | B-feature-core  |
| Phase 4 | Mail-Sink, Cron kontrolliert, CiviCRM Status sauber                     | B-feature-core  |
| Phase 5 | Datenkonsistenz-Stichproben, API/AuthX Tests                            | B-feature-core  |
| Phase 6 | Backup-Job + Restore-Test, Monitoring + Alerts, Hardening               | C-stabilization |
| Phase 7 | Cutover-Plan, Dry-Run, finaler Cutover, Verifikation                    | C-stabilization |
| Phase 8 | Plesk-Reduktion, Stilllegung, Doku-Abschluss, AVV abschliessen          | C-stabilization |

## Risiken und Gegenmassnahmen

- **R1 Fehlende PHP-Extensions** -> Extension-Liste aus Inventar, Provisioning-Skript reproduzierbar.
- **R2 Private Files oeffentlich** -> Webserver-Regeln testen, negativer Zugriffstest in Verifikation.
- **R3 CiviCRM Cron sendet echte Mails aus Staging** -> Mail-Sink Pflicht, Smtp-Konfig fixiert in Staging.
- **R4 DB-Encoding-Drift** -> Encoding/Collation aus Plesk dokumentieren, Import-Skript erzwingt Zielparameter.
- **R5 DNS-Propagation** -> TTL vorher reduzieren, Healthcheck nach Umstellung.
- **R6 Datenverlust zwischen Freeze und finalem Sync** -> Webform-/CiviContrib-Schreibvorgaenge waehrend Freeze deaktivieren, Lueckenfenster minimal halten.
- **R7 Rollback nicht moeglich** -> Plesk-vHost bleibt lesend, Snapshots vor Cutover, dokumentierter DNS-Rueckschaltpfad.
- **R8 Mischblockade mit n8n** -> Diese Schiene ist explizit unabhaengig; n8n-Donation-Cutover bleibt eigenes Gate.

## Abhaengigkeiten

- Azure-Foundation (RG/Key Vault/Log Analytics/Blob).
- DNS-Hoheit fuer CRM-Subdomains.
- Vorhandene SMTP- oder DSGVO-konformer Transaktionsmail-Anbieter.
- BSM-/Key-Vault-Mapping fuer CRM-Secrets gemaess `secret-mapping-verification.instructions.md`.

## Definition of Done

- Alle FRs aus `spec.md` erfuellt, Akzeptanzkriterien dokumentiert.
- Inventar, Runbooks und AVV-Register im Repo gepflegt.
- Backup-Job + Restore-Test bestanden; Monitoring/Alerts produktiv.
- Cutover erfolgreich, Stichproben gruen, Stabilitaetsfenster ueberstanden.
- Plesk-CRM stillgelegt oder reduziert; DNS-Matrix aktualisiert.
- Security-Review und DSGVO-Review (Owner gegengezeichnet).
- `npm run workspace:config:check` und `npm run governance:check` gruen.
- n8n-Donation-Gates unveraendert respektiert.
