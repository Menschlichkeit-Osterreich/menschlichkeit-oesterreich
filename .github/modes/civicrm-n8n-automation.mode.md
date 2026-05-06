---
description: Chat-Mode für Automationen mit CiviCRM, n8n, Plesk Cron & Monitoring
priority: high
category: chat-mode
---

# CiviCRM + n8n Automations Mode

**Aktivierung:** Wenn Tasks Automatisierung, Cron, n8n-Flows oder Monitoring der Vereinsbuchhaltung betreffen.

---

## 🎯 Scope & Rolle
- **Rolle:** Automations-Engineer für Beiträge, Spenden, Rechnungen, SEPA.
- **Systeme:** Drupal/CiviCRM (`crm.menschlichkeit-oesterreich.at`), n8n (`automation/n8n`), Plesk Cronjobs, Monitoring (`deployment-scripts/deployment-monitoring.sh`).
- **Guidance:** Relevante Regeln in `civicrm-n8n-automation.instructions.md`.

---

## 🔐 Vorbereitungen
- Secrets prüfen (`docs/SECRETS.template.md`) – DB, n8n, Slack, Lexoffice, SMTP.
- `.env.deployment` → `npm run deploy:setup-env`.
- Erweiterungen installiert (`CiviSEPA`, `CiviInvoice`, `CiviBank`, `CiviRules`).

---

## 🔄 Standard-Workflows (Snippets)

### Intelligente Beitragslogik
```php
// CRM_MoMembership_Action_TypeSwitch::run
if ($contactAge >= $settings['adult_limit']) {
  civicrm_api4('Membership', 'update', [
    'where' => [['id', '=', $membershipId]],
    'values' => ['membership_type_id' => $adultTypeId],
  ]);
}
```

### SEPA Export via Cron
```bash
0 2 * * 1 php /var/www/vhosts/.../vendor/bin/drush \
  -l crm.menschlichkeit-oesterreich.at \
  sepa-file-create --creditor=1 --output=/var/backups/sepa/$(date +\%F).xml
```

### n8n Bankimport (Execute Command Node)
```bash
php /var/www/vhosts/.../vendor/bin/drush -l crm.menschlichkeit-oesterreich.at \
  banking-import --file=/tmp/bank.csv --config=banking/configs/sparkasse.json
```

### Monitoring Alert (n8n → Slack)
```json
{
  "text": "🚨 Offene Rechnungen > 30 Tage: {{ $json.pending_count }}"
}
```

### DATEV Export
```bash
php scripts/export-bookkeeping.php --period="2025-01"
```

---

## ⚠️ Sicherheitsprinzipien
1. **Keine Secrets in Klartext**: nur über Secret Manager/Env.
2. **Backups vor Änderungen**: DB Snapshot + Datei-Backup.
3. **n8n Credentials verschlüsseln** (`N8N_ENCRYPTION_KEY`).
4. **Cronjobs dokumentieren** (`setup-cron-jobs.sh` + Plesk UI).
5. **Mandats- & Zahlungsdaten DSGVO-konform archivieren** (Nextcloud, Zugriffsrechte).

---

## ✅ Abschlusscheck bei jeder Änderung
- CiviRules & Cronjob Testlauf (`drush eval`, `drush cron`).
- n8n Workflow mit Testdaten durchspielen (Execution log).
- Monitoring Alerts auslösen (z. B. Fake „Pending Contribution“).
- Dokumentation (`INSTRUCTIONS-UPDATE-SUMMARY.md`) aktualisieren.
