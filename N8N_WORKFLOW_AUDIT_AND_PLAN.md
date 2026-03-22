# n8n Workflow Audit & Plan
**Projekt:** Menschlichkeit Osterreich
**Datum:** 2026-03-22
**Verzeichnis:** automation/n8n/

---

## 1. Ubersicht

Das Verzeichnis `automation/n8n/` enthalt **25 Workflow-JSON-Dateien**, die samtliche Automatisierungsprozesse der NGO-Plattform abbilden. Die Workflows sind in folgende Kategorien unterteilt:

| Kategorie | Anzahl | Beschreibung |
|-----------|--------|-------------|
| Finance | 7 | Spenden, Rechnungen, Mahnwesen, SEPA, Stripe-Integration |
| CRM | 3 | Mitgliederverwaltung, Synchronisation, Onboarding |
| GDPR | 3 | Recht auf Loschung (3 Varianten), Consent-Audit |
| Social Media | 2 | Cross-Posting, Forum-zu-Social-Pipeline |
| Infrastructure | 4 | Build-Pipeline, Deployment, OpenClaw-Bridge, Mail-Archiv |
| Moderation | 2 | Forum-Moderation, Queue-Monitor |
| Events | 2 | Erinnerungen, Dashboard-ETL |

---

## 2. Workflow-Inventar

| # | Datei | Workflow-Name | Kategorie | Trigger | Status | Error-Handling |
|---|-------|--------------|-----------|---------|--------|---------------|
| 1 | donation-processing.json | Donation Processing | Finance | Webhook | Aktiv | Slack-Alert |
| 2 | finance-dunning.json | Finance Dunning | Finance | Cron | Aktiv | Email-Alert |
| 3 | finance-invoicing.json | Finance Invoicing | Finance | Cron | Aktiv | Slack-Alert |
| 4 | membership-invoicing.json | Membership Invoicing | Finance | Cron | Aktiv | Slack-Alert |
| 5 | payment-confirmation.json | Payment Confirmation | Finance | Webhook | Aktiv | Email-Alert |
| 6 | sepa-export.json | SEPA Export | Finance | Cron (monatlich) | Aktiv | Slack-Alert |
| 7 | Stripe_Webhook_to_CiviCRM_Contribution.json | Stripe zu CiviCRM | Finance | Webhook | Aktiv | 3x Retry + Slack |
| 8 | crm-member-management.json | CRM Member Mgmt | CRM | Webhook | Aktiv | Slack-Alert |
| 9 | crm-sync-members.json | CRM Sync Members | CRM | Cron (taeglich) | Aktiv | Slack-Alert |
| 10 | onboarding-welcome-series.json | Onboarding | CRM | Webhook | Aktiv | Slack-Alert |
| 11 | right-to-erasure.json | GDPR Loschung | GDPR | Webhook | WARNUNG: active:false | HMAC-SHA256 |
| 12 | right-to-erasure-fixed.json | GDPR Loschung (fixed) | GDPR | Webhook | Aktiv | Crypto + Fallback |
| 13 | right-to-erasure-minimal.json | GDPR Loschung (minimal) | GDPR | Webhook | Aktiv | KEINE Signatur |
| 14 | social-media-crosspost.json | Social Crosspost | Social | Webhook | Aktiv | Plattform-spezifisch |
| 15 | forum-viral.json | Forum zu Social | Social | Cron (stuendlich) | Aktiv | Slack-Alert |
| 16 | build-pipeline-automation.json | Build Pipeline | Infra | Webhook | Aktiv | GitHub Issue |
| 17 | plesk-deployment-notifications.json | Plesk Deploy | Infra | Webhook | Aktiv | Email-Alert |
| 18 | openclaw-bridge.json | OpenClaw Bridge | Infra | Webhook | Aktiv | Bearer-Auth |
| 19 | mail-archiver-logging.json | Mail Archive | Infra | Cron | Aktiv | Slack-Alert |
| 20 | forum-moderation.json | Forum Moderation | Moderation | Cron | Aktiv | AI-basiert |
| 21 | queue-monitor.json | Queue Monitor | Monitoring | Cron (minutlich) | Aktiv | DLQ-Routing |
| 22 | WebhookQueue_Processor.json | Webhook Queue | Monitoring | Webhook+Cron | Aktiv | DLQ-Routing |
| 23 | dashboard-etl-stripe-civicrm.json | Dashboard ETL | ETL | Cron (taeglich) | Aktiv | Error-Log |
| 24 | events-reminder.json | Event Reminders | Events | Cron | Aktiv | Email-Alert |
| 25 | gdpr-consent-audit.json | GDPR Consent Audit | GDPR | Cron | Aktiv | Slack-Alert |

---

## 3. Defekte & Probleme

### 3.1 right-to-erasure: Dreifache Variante (KRITISCH)

Es existieren drei Varianten des GDPR-Losch-Workflows:

| Variante | Status | Problem |
|----------|--------|---------|
| right-to-erasure.json (Original) | `active: false` | Deaktiviert, vermutlich wegen Fehler |
| right-to-erasure-fixed.json | Aktiv | Korrekte Crypto-Signatur, aber Dev-Fallback vorhanden |
| right-to-erasure-minimal.json | Aktiv | **Keine Webhook-Signaturpruefung -- Sicherheitsrisiko** |

**Empfehlung:** Sofortige Konsolidierung auf `-fixed` Variante. Original und `-minimal` muessen geloescht werden. Die minimale Variante stellt ein aktives Sicherheitsrisiko dar, da GDPR-Loesch-Requests ohne Authentifizierung angenommen werden.

### 3.2 forum-viral.json: Spam-Risiko

- Stuendliches automatisches Cross-Posting von Forum-Inhalten auf Social-Media-Kanaele
- Kein Rate-Limiting oder Content-Qualitaetspruefung erkennbar
- **Risiko:** Spam-artige Postingfrequenz kann Social-Media-Accounts schaedigen
- **Empfehlung:** Taeglich statt stuendlich ausfuehren, Content-Filter einbauen

### 3.3 forum-moderation.json: AI-Validierung ausstehend

- AI-basierte Spam- und Toxizitaetserkennung im Einsatz
- Genauigkeit (Precision/Recall) nicht validiert
- **Risiko:** False Positives loeschen legitime Beitraege, False Negatives lassen schaedliche Inhalte durch
- **Empfehlung:** Manuelles Review-Sample von 100 Entscheidungen durchfuehren, Schwellwerte dokumentieren

### 3.4 Weitere Probleme

- **dashboard-etl-stripe-civicrm.json:** Nur Error-Log, kein aktives Alerting bei Fehlern
- **WebhookQueue_Processor.json:** DLQ-Routing vorhanden, aber kein Monitoring der Dead-Letter-Queue
- **queue-monitor.json:** Minutliche Ausfuehrung erzeugt hohe Last -- 5-Minuten-Intervall empfohlen

---

## 4. Security-Bewertung

### 4.1 Authentifizierungsmethoden

| Workflow | Auth-Methode | Bewertung |
|----------|-------------|-----------|
| Stripe Webhook | HMAC-SHA256 + Replay-Schutz | GUT -- Best Practice |
| right-to-erasure-fixed | Crypto HMAC + Dev-Fallback | WARNUNG -- Dev-Fallback in Production entfernen |
| right-to-erasure-minimal | Keine | UNSICHER -- Sofort deaktivieren |
| openclaw-bridge | Bearer Token | OK -- Token-Rotation empfohlen |
| build-pipeline-automation | GitHub Webhook Secret | OK |
| Alle anderen Webhooks | $env.N8N_WEBHOOK_SECRET | OK -- Zentrales Secret-Management |

### 4.2 Kritische Findings

1. **right-to-erasure-minimal ohne Signatur:** Jeder kann GDPR-Loeschanfragen ausloesen. Dies ist ein DSGVO-Verstoss, da unbefugte Datenloeschung moeglich ist.
2. **right-to-erasure-fixed Dev-Fallback:** In der Production-Umgebung darf kein Fallback existieren, der die Signaturpruefung umgeht. Der Fallback muss ueber eine Environment-Variable gesteuert und in Production deaktiviert werden.
3. **Bearer Token (openclaw-bridge):** Token-Rotation sollte quartalsweise erfolgen. Aktuell kein Rotations-Mechanismus erkennbar.

### 4.3 Empfehlungen

- Alle Webhook-Workflows muessen `$env.N8N_WEBHOOK_SECRET` verwenden
- HMAC-SHA256 fuer alle externen Webhooks (Stripe, GitHub bereits korrekt)
- IP-Whitelisting fuer interne Webhooks (OpenClaw, Plesk) pruefen
- Secrets-Audit: Alle hartcodierten Secrets in Environment-Variablen migrieren

---

## 5. Fehlende Workflows

Die folgenden Workflows werden fuer einen vollstaendigen Betrieb benoetigt, existieren aber noch nicht:

| Workflow | Zweck | Prioritaet | Abhaengigkeit |
|----------|-------|-----------|---------------|
| payment-failed-notification | Benachrichtigung bei Zahlungsfehlschlag an Spender/Mitglied | P1 | Stripe Webhook, Email-Template `donation_failed.html` |
| membership-renewal-reminder | Erinnerung 30/14/7 Tage vor Mitgliedschaftsablauf | P2 | CiviCRM API, Email-Template (neu) |
| annual-donation-receipt | Jaehrliche Spendenquittung gemaess oesterreichischem Steuerrecht | P2 | Finance DB, PDF-Template `receipt.html` |
| crm-cleanup-duplicates | Automatische Duplikat-Erkennung und -Bereinigung in CiviCRM | P3 | CiviCRM API, Fuzzy-Matching |
| gdpr-retention-cleanup | Automatische Loeschung abgelaufener Daten nach Aufbewahrungsfrist | P2 | PostgreSQL, DSGVO-Loeschfristen |
| backup-verification | Pruefung der Backup-Integritaet (DB-Dumps, File-Backups) | P3 | PostgreSQL, Plesk |

---

## 6. Empfohlene Konsolidierung

### 6.1 GDPR-Workflows (sofort)

1. `right-to-erasure-minimal.json` deaktivieren und aus dem Deployment entfernen
2. `right-to-erasure.json` (Original) archivieren
3. `right-to-erasure-fixed.json` umbenennen zu `right-to-erasure.json`
4. Dev-Fallback aus der Production-Konfiguration entfernen

### 6.2 Error-Handling vereinheitlichen

Alle Workflows sollen ein einheitliches Error-Handling-Pattern verwenden:

| Schritt | Aktion |
|---------|--------|
| 1 | Try-Catch um den gesamten Workflow |
| 2 | Bei Fehler: Slack-Alert an `#n8n-errors` |
| 3 | Bei Fehler: Email an `technik@menschlichkeit-oesterreich.at` |
| 4 | Fehler-Details in PostgreSQL-Tabelle `automation_errors` loggen |
| 5 | Bei wiederholtem Fehler (3x): Workflow pausieren, Admin benachrichtigen |

### 6.3 Webhook-Security vereinheitlichen

- Zentrales Secret aus `$env.N8N_WEBHOOK_SECRET` fuer alle internen Webhooks
- HMAC-SHA256 fuer alle externen Webhooks (Stripe, GitHub, etc.)
- Keine Fallback-Mechanismen in Production

### 6.4 Cron-Intervalle optimieren

| Workflow | Aktuell | Empfohlen | Begruendung |
|----------|---------|-----------|-------------|
| queue-monitor | Minutlich | Alle 5 Minuten | Lastreduzierung |
| forum-viral | Stuendlich | Taeglich 10:00 | Spam-Vermeidung |
| crm-sync-members | Taeglich | Taeglich 03:00 | Ausfuehrung in Schwachlastzeit |

---

## 7. Integrationsmatrix

Die folgende Matrix zeigt, welcher Workflow welches externe System nutzt:

| Workflow | CiviCRM | Stripe | PostgreSQL | Slack | Email | Social APIs | GitHub | Plesk | OpenClaw |
|----------|---------|--------|-----------|-------|-------|-------------|--------|-------|----------|
| donation-processing | X | X | X | X | | | | | |
| finance-dunning | X | | X | | X | | | | |
| finance-invoicing | X | | X | X | X | | | | |
| membership-invoicing | X | | X | X | X | | | | |
| payment-confirmation | | X | X | | X | | | | |
| sepa-export | X | | X | X | | | | | |
| Stripe zu CiviCRM | X | X | | X | | | | | |
| crm-member-management | X | | X | X | | | | | |
| crm-sync-members | X | | X | X | | | | | |
| onboarding-welcome-series | X | | | X | X | | | | |
| right-to-erasure-fixed | X | | X | | X | | | | |
| social-media-crosspost | | | | X | | X | | | |
| forum-viral | | | X | X | | X | | | |
| build-pipeline-automation | | | | | | | X | | |
| plesk-deployment-notifications | | | | | X | | | X | |
| openclaw-bridge | | | | | | | | | X |
| mail-archiver-logging | | | X | X | X | | | | |
| forum-moderation | | | X | X | | | | | |
| queue-monitor | | | X | X | | | | | |
| WebhookQueue_Processor | | | X | X | | | | | |
| dashboard-etl-stripe-civicrm | X | X | X | | | | | | |
| events-reminder | X | | | | X | | | | |
| gdpr-consent-audit | X | | X | X | | | | | |

### Systemabhaengigkeiten (Zusammenfassung)

| System | Anzahl Workflows | Kritikalitaet |
|--------|-----------------|---------------|
| PostgreSQL | 17 | HOCH -- Ausfall betrifft fast alle Workflows |
| Slack | 16 | MITTEL -- Nur Alerting, keine Kernfunktion |
| CiviCRM | 12 | HOCH -- CRM ist zentrale Datenquelle |
| Email (SMTP) | 8 | HOCH -- Mitglieder-Kommunikation |
| Stripe | 4 | HOCH -- Zahlungsverarbeitung |
| Social APIs | 3 | NIEDRIG -- Marketing-Funktion |
| GitHub | 1 | NIEDRIG -- Nur Build-Pipeline |
| Plesk | 1 | NIEDRIG -- Nur Deployment-Benachrichtigungen |
| OpenClaw | 1 | MITTEL -- Agent-System-Bridge |

---

## 8. Naechste Schritte

| Prioritaet | Aktion | Verantwortlich | Deadline |
|-----------|--------|---------------|----------|
| P0 | right-to-erasure-minimal deaktivieren | DevOps | Sofort |
| P0 | Dev-Fallback aus right-to-erasure-fixed entfernen | DevOps | Sofort |
| P1 | GDPR-Workflows konsolidieren | DevOps | KW 13 |
| P1 | payment-failed-notification Workflow erstellen | Backend | KW 14 |
| P2 | Error-Handling vereinheitlichen | Backend | KW 15 |
| P2 | Cron-Intervalle optimieren | DevOps | KW 14 |
| P3 | crm-cleanup-duplicates Workflow erstellen | Backend | KW 16 |
| P3 | Forum-Moderation AI-Genauigkeit validieren | QA | KW 15 |
