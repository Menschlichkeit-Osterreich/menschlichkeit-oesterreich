---
title: CiviCRM + n8n + Plesk – Automationsleitfaden
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: high
category: core
applyTo: crm.menschlichkeit-oesterreich.at/**,automation/n8n/**,deployment-scripts/**,scripts/**
---
# CiviCRM + n8n + Plesk – Automationsleitfaden

Dieses Dokument beschreibt verbindliche Automatisierungsabläufe für Vereinsbuchhaltung & Spenden. Es ergänzt `civicrm-vereinsbuchhaltung.instructions.md` um konkrete n8n-Flows, Cronjobs, Monitoring und Exporte.

---

## 🔐 Voraussetzungen & Secrets
- **Secrets:** Siehe `docs/SECRETS.template.md` → insbesondere `CRM_DB_*`, `CIVICRM_SITE_KEY`, `N8N_*`, `SLACK_WEBHOOK`, `EMAIL_RECIPIENTS`, `LEXOFFICE_TOKEN` (falls genutzt).
- `.env.deployment` mit CRM-, SMTP-, n8n- und Monitoring-Werten befüllen (`npm run deploy:setup-env`).
- `./scripts/setup-civicrm.sh` erfolgreich ausführen, Erweiterungen installiert (CiviSEPA, CiviInvoice, CiviBank, CiviRules, optional CiviAccounts).

---

## 🧠 1. Intelligente Beitragslogik
1. **Custom Modul**: `crm.menschlichkeit-oesterreich.at/web/modules/custom/mo_membership_rules/`.
   - Service `MembershipTypeSwitcher.php` prüft Alter & Status.
   - Altersgrenze via Einstellungen (`config:mo_membership.settings`).
2. **CiviRules**:
   - Regel „Mitgliedschaft aktualisiert“ → PHP Action (`CRM_MoMembership_Action_TypeSwitch`).
   - ACL: nur Rollen mit Buchhaltungsrechten dürfen Switch auslösen.
3. **Tests**: Drupal Kernel-Test `MoMembershipTypeSwitcherTest`.

---

## 📤 2. SEPA-Export & Versand
1. **Plesk Cron** (`deployment-scripts/setup-cron-jobs.sh` erweitern):
   ```bash
   0 2 * * 1 php /var/www/vhosts/.../vendor/bin/drush -l crm.menschlichkeit-oesterreich.at sepa-file-create --creditor=1 --output=/var/backups/sepa/moe_sepa_$(date +\%F).xml
   ```
2. **n8n Workflow „SEPA Export“** (`automation/n8n/flows/sepa-export.json`):
   - Node `HTTP Request` (WebDAV/Nextcloud Upload) → `/Nextcloud/Finance/SEPA/`.
   - Node `Send Email` → Buchhaltung mit Dateianhang.
   - Node `Execute Command` (optional) → `php scripts/validate-sepa.php`.
3. **Validierungen**:
   - CiviRules Condition `SepaMandate.is_valid`.
   - PHP-Script `scripts/validate-sepa.php` (IBAN/Luhn + Mandatsstatus).

---

## 📥 3. Bankabgleich (CiviBank + n8n)
1. **n8n Workflow „Bankimport“**:
   - Trigger Cron (z. B. 04:00).
   - Node `SFTP Download` → Kontoauszug `bank.csv`.
   - Node `Execute Command`:
     ```bash
     php /var/www/vhosts/.../vendor/bin/drush -l crm.menschlichkeit-oesterreich.at banking-import --file=/tmp/bank.csv --config=banking/configs/sparkasse.json --nolog
     ```
   - Node `HTTP Request` → `Contribution.get` (Status=Pending) zum Matching.
   - Node `Email`/`Slack` → Matching-Report an Buchhaltung.
2. **CiviBank Konfiguration** (`civicrm/admin/banking/configurations`):
   - Mapping für Verwendungszweck, Betrag, IBAN.

---

## 📧 4. Rechnungsversand & Mahnwesen
1. **Beitragserstellung**: CiviRules Trigger „Contribution Added“ → Actions:
   - `Generate Invoice PDF` (CiviInvoice).
   - `Send Email` mit Rechnung.
2. **Mahnung**:
   - CiviRules Zeitgesteuert: Condition `Contribution Status != Completed` & `days past due > X`.
   - Action: `Send Reminder Email` + `Update Contribution` (Status „First Reminder“).
   - Zweite Mahnung → Eskalation `Email → Vorstand`.
3. **PDF-Ablage**: `sites/default/files/civicrm/invoice/` (ggf. n8n Upload nach Nextcloud).

---

## 📊 5. Monitoring & Alerts
1. **n8n Workflow „CRM Monitoring“**:
   - Cron täglich 07:00.
   - Nodes:
     - `Contribution.get` (Pending > 30 Tage).
     - `SepaMandate.get` (Enddatum < 30 Tage).
     - `Campaign.get` (Progress < 10%).
   - Node `Slack`/`Email` → Alert an Buchhaltung.
2. **Deployment Monitoring**: `deployment-scripts/deployment-monitoring.sh` → NDJSON & Markdown Report (`quality-reports/deployment-metrics/`).
3. **Grafana/Prometheus** (optional) → Kombination mit n8n Alerts.

---

## 🔐 6. API-gestützte Buchhaltung
1. **Export-Script** `scripts/export-bookkeeping.php`:
   ```php
   civicrm_api4('Contribution','get', [
     'select' => ['receive_date','total_amount','financial_type_id','trxn_id','contact_id','custom_costcenter'],
     'where'  => [['receive_date','BETWEEN',['{{start}}','{{end}}']]]
   ]);
   ```
2. **n8n Workflow „Lexoffice Export“**:
   - Parameter `start/end` (Monatsanfang/ende).
   - Node `Execute Command` (PHP Script) → JSON.
   - Node `HTTP Request` → Lexoffice/sevDesk API.
   - Node `Slack`/`Email` → Abschlussbericht.

---

## 🧾 7. Zuwendungsbestätigungen
1. **Spende > 200 €**:
   - CiviRules Trigger `Contribution Added` + Condition `total_amount > 200`.
   - Action `Generate PDF Letter` + `Email Send`.
2. **Jahreszusammenfassung**:
   - Cron (01. Januar): `vendor/bin/drush civicrm-api Contribution.get` gruppiert nach Contact.
   - PHP Script `scripts/generate-annual-donation.php` → PDF + Mail + Archiv in Nextcloud.

---

## 🔂 Betriebsprozesse
1. **Cron Übersicht**:
   - `drush core:cron` (Stündlich).
   - `sepa-file-create` (Wöchentlich).
   - `banking-import` (Täglich).
   - `civicrm-rules` Scheduler (Verschiedene Intervall).
2. **Backups**:
   - `backup_migrate` (02:00) + DB Dumps (MariaDB/PostgreSQL).
3. **Logs**:
   - `sites/default/files/civicrm/ConfigAndLog/CiviCRM.log`.
   - n8n Execution Logs (`n8n-app` UI).

---

## ✅ Checkliste nach Implementierung
- [ ] Secrets gesetzt & `.env.deployment` vollständig.
- [ ] `setup-civicrm.sh` erfolgreich, Erweiterungen aktiv.
- [ ] n8n Workflows importiert/erstellt, Anmeldedaten getestet.
- [ ] Plesk Cronjobs eingetragen und Testlauf bestätigt.
- [ ] Testmandat, Testspende, Probebeitrag verarbeitet.
- [ ] Export nach Lexoffice/DATEV validiert.
- [ ] Monitoring-Alerts in Slack/Email angekommen.
- [ ] Dokumentation (`INSTRUCTIONS-UPDATE-SUMMARY.md`) aktualisiert.
