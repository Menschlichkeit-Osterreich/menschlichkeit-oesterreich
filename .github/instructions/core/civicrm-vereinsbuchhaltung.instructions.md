---
title: CiviCRM Vereinsbuchhaltung – Betriebsanleitung
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: high
category: core
applyTo: crm.menschlichkeit-oesterreich.at/**,automation/**,scripts/**
---
# CiviCRM Vereinsbuchhaltung – Betriebsanleitung

## 🔧 Grundinstallation
1. **Secrets setzen** (siehe `docs/SECRETS.template.md`): `CRM_DB_*`, `CIVICRM_SITE_KEY`, `CRM_SMTP_*`, `CIVICRM_API_KEY`, `JWT_SECRET`, Deploy-SSH.
2. `.env.deployment` via `npm run deploy:setup-env` ausfüllen.
3. `./scripts/setup-civicrm.sh` ausführen → Composer, `drush site:install`, CiviCRM-Install, Cache clear.
4. Verifizieren:
   ```bash
   vendor/bin/drush status
   vendor/bin/drush civicrm:ping
   vendor/bin/drush sql:query "SHOW TABLES LIKE 'civicrm_contact';"
   ```
5. Staging/Prod-Deployment über Workflow `deploy-staging` bzw. `safe-deploy.sh`.

## 🧩 Pflicht-Erweiterungen
| Erweiterung | Zweck | Installation |
| --- | --- | --- |
| **CiviSEPA** | SEPA-Lastschrift, Mandate | `vendor/bin/drush civicrm-ext-install org.project60.sepa` |
| **CiviInvoice** | Rechnungen/PDF | Extension aus GitHub in `sites/default/files/civicrm/ext/`, danach `drush civicrm-ext-install org.civicrm.invoice` |
| **CiviBank** | Kontoauszug-Import | `vendor/bin/drush civicrm-ext-install org.project60.banking` |
| **CiviRules** | Automatisierte Workflows | `vendor/bin/drush civicrm-ext-install org.civicoop.civirules` |
| **CiviAccounts** | Buchungskonten (optional) | Extension-Manager |

Nach Installation: `vendor/bin/drush civicrm-ext-enable <name>` (falls notwendig) & `vendor/bin/drush cr`.

## 🧾 Mitgliedschaften & Beiträge
1. Beitragstypen: Standard, Förder, Ehrenmitglied (CiviCRM → Mitgliedschaftstypen).
2. Wiederkehrende Zahlungen: CiviSEPA Mandatsformulare + Scheduler (`sepa-file-create`).
3. Rechnungsstellung: CiviInvoice aktivieren; CiviRules-Regel „Mitgliedsanmeldung → Rechnung generieren → Mail“.
4. Export Steuerberater: Custom Report (Betrag, Datum, Mitgliedsnummer) als CSV – optional via n8n automatisieren.

## 💝 Spendenverwaltung
1. Kampagnen (z. B. „Winterhilfe 2025“) anlegen.
2. Zuwendungsbestätigungen: CiviRules Trigger „Contribution Completed“ → PDF + Mail.
3. Spendenquellen (Website/Event/Direktüberweisung) via Custom Field oder Kampagne tracken.
4. Bankabgleich: CiviBank CSV-Imports konfigurieren.
5. Export Lexoffice/DATEV: Bericht mit Spendername, Betrag, Zweck, Datum; optional JSON-API für Dritttools.

## 🔐 Rollen & ACLs
| Rolle | Rechte |
| --- | --- |
| **Admin** | Vollzugriff (Konfiguration, Finanzen, SEPA) |
| **Buchhaltung** | Beiträge, Spenden, Rechnungen, Bankabgleich; keine Systemkonfiguration |
| **Mitgliederbetreuung** | Mitgliedsdaten, keine Finanzdaten |
| **IT/Technik** | Extensions, API-Zugriff, Systemkonfiguration |

Umsetzung: Drupal-Rollen + CiviCRM ACLs (Kontakt-, Mitgliedschafts- und Contribution-Berechtigungen).

## 📤 Exportformate
- **DATEV CSV**: Spalten `Datum, Betrag, Zweck, Kontakt-ID, Belegnummer`.
- **JSON API**: `civicrm/api4/Contribution/get` für Lexoffice/sevDesk (`output=json`).
- **PDF-Rechnungen**: Automatisch via CiviInvoice (Speicherort & Mailversand konfigurieren).

## 🔄 Automatisierung
| Prozess | Umsetzung |
| --- | --- |
| Neue Spende → Dankschreiben → Export | n8n Workflow (`CIVICRM_WEBHOOK_URL`) |
| Monatlicher Beitragseinzug | Cron: `drush sepa:mandates --generate` + Rechnung + SEPA-Datei |
| Mitgliedsanmeldung → Rechnung → Mail | CiviRules + CiviInvoice + Mail-Action |

## 🛡️ Betrieb & Wartung
- Cronjobs: `vendor/bin/drush core:cron`, SEPA-spezifische Schedulers → über Plesk oder System-Cron.
- Backups: `backup_migrate` Zeitplan 02:00 (Dateien + DB), zusätzlich DB Dumps.
- Logs: `sites/default/files/civicrm/ConfigAndLog/CiviCRM.log`.
- Security: Secrets rotieren, Rollen regelmäßig prüfen, `CIVICRM_SITE_KEY` geheim halten.

> Bei Änderungen an Erweiterungen oder Workflows: Anpassungen in `INSTRUCTIONS-UPDATE-SUMMARY.md` dokumentieren und Tests (`npm run deploy:readiness`, `setup-civicrm.sh --dry-run`) wiederholen.
