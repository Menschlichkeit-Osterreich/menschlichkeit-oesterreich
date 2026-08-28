# N8N_TO_MAKE_MIGRATION_MATRIX — Stand 2026-08-28

**Entscheidungsgrundlage.** Zielarchitektur laut Auftrag vom 2026-08-28:
FastAPI + PostgreSQL als Owner kritischer Transaktionslogik, **Make** als
zentrale Automationsplattform, **n8n = Migrationsquelle → RETIRED**.

**Live-Evidenz (EV-0007):** Unter `n8n.menschlichkeit-oesterreich.at` läuft
**keine** n8n-Instanz (Plesk-Standardseite seit 2025-10-05). *Production
Evidence ist damit für alle 27 Workflows: keine.* Die Matrix migriert also
Repository-Verträge, keinen laufenden Betrieb — das senkt das Cutover-Risiko
auf nahe null, verlangt aber, dass vor Aktivierung eines Make-Szenarios die
fachliche Funktion erstmalig verifiziert wird.

**FastAPI-Overlap-Referenz:** PR #538 verlagert den Stripe-Webhook-Kern
(Inbox, Idempotency, Donation-Verbuchung, Outbox) verbindlich nach FastAPI.
Make konsumiert `donation.recorded` / `payment.failed` gemäß
[docs/integration/fastapi-make-event-contract.md](../../integration/fastapi-make-event-contract.md).

Entscheidungswerte: `MIGRATE_TO_MAKE` · `MOVE_TO_FASTAPI` · `RETIRE` ·
`TEMPORARY_KEEP` · `UNKNOWN`.

## Matrix

| # | Workflow | Business Function | Trigger | Systeme | Crit. | FastAPI-Overlap | Decision | Begründung |
| - | -------- | ----------------- | ------- | ------- | ----- | --------------- | -------- | ---------- |
| 1 | `Stripe_Webhook_to_CiviCRM_Contribution` | Stripe-Zahlung → CiviCRM-Contribution | webhook | Stripe, CiviCRM, FastAPI, Mail | P0 | **total** (PR #538) | **RETIRE** | Kernpfad gehört FastAPI (Inbox/Outbox); CiviCRM-Sync wird Make-Konsument von `donation.recorded`. Zwei parallele Webhook-Empfänger für Zahlungen sind genau die Doppel-Owner-Situation, die der Auftrag verbietet. |
| 2 | `WebhookQueue_Processor` | Nachverarbeitung gequeueter Webhooks | webhook+cron | FastAPI, CiviCRM | P1 | total | **RETIRE** | Funktion ist im Inbox-Statusmodell (received/failed/retry) aufgegangen; Retry macht Stripe + Claim-Logik. |
| 3 | `build-pipeline-automation` | CI-Ereignisse → Slack | webhook | Slack | P3 | — | **RETIRE** | GitHub Actions kann Slack-Benachrichtigung nativ; kein Orchestrator nötig. |
| 4 | `crm-member-management` | Mitglieder-Lifecycle (Anlage, SEPA, Mail) | webhook | FastAPI, Mail, SEPA, Slack | P1 | teilweise (member_service) | **MIGRATE_TO_MAKE** | Folgeprozesse nach Mitglieder-Events; Stammdaten-Writes bleiben FastAPI/CiviCRM, Make orchestriert Mail/Slack/Folgen. |
| 5 | `crm-sync-members` | Mitglieder-Sync Richtung CiviCRM | webhook | CiviCRM, Mail, Slack | P1 | teilweise | **MIGRATE_TO_MAKE** | Klassischer Sync-Fall der Zielarchitektur (Outbox → Make → CiviCRM). |
| 6 | `dashboard-etl-stripe-civicrm` | Reporting-ETL Stripe/CiviCRM | schedule | Stripe, CiviCRM, Postgres, Slack | P2 | — | **MIGRATE_TO_MAKE** | Batch/Reporting = Make-Domäne. Achtung Operations-Budget: gebündelte Läufe (1×/Tag), keine Einzelsatz-Reads. |
| 7 | `dlq-admin` | manuelle DLQ-Eingriffe | manuell | FastAPI | P1 | total | **MOVE_TO_FASTAPI** | DLQ ist jetzt `webhook_events.status='failed'` + `outbox_events.status='failed'`; Admin-Route mit RBAC/Audit gehört in die API, nicht in ein Automationstool. |
| 8 | `donation-webhook-archive` | — (Datei enthält **0 Nodes**) | — | — | — | — | **RETIRE** | Leeres Artefakt, `DEPRECATED_CONFIRMED`. |
| 9 | `events-reminder` | Veranstaltungs-Erinnerungen | schedule | FastAPI, Mail | P2 | — | **MIGRATE_TO_MAKE** | Scheduler + Mail-Folgeprozess, unkritisch. |
| 10 | `finance-donation-processing` | Spendenverbuchung + Dankesmail | webhook | CiviCRM, Mail | P0 | **total** (PR #538) | **RETIRE** | Verbuchung = FastAPI (transaktional); Dankesmail übergangsweise FastAPI, danach Make via `donation.recorded` (`receipt_email_sent_by_api`-Flag beachten). |
| 11 | `finance-dunning` | Mahnwesen | schedule | Mail | P1 | — | **MIGRATE_TO_MAKE** | Vor Aktivierung fachliche Mahnregeln bestätigen; Rechnungsstatus bleibt System of Record (ERPNext/FastAPI), Make orchestriert nur. |
| 12 | `finance-erpnext-payment-entry` | Payment Entry in ERPNext anlegen | webhook | ERPNext | P1 | teilweise (`finance_external_sync`) | **MIGRATE_TO_MAKE** | Wird Make-Konsument von `donation.recorded`; Duplikatsperre über `custom_external_reference`. Vorbedingung: ERPNext existiert live (derzeit NXDOMAIN, EV-0004). |
| 13 | `finance-erpnext-reconciliation-report` | Abstimmbericht | cron | ERPNext, Mail | P2 | — | **MIGRATE_TO_MAKE** | Reporting/Reconciliation = Make-Domäne. |
| 14 | `finance-erpnext-sync-processor` | Abarbeitung ERPNext-Sync-Queue | cron | ERPNext | P1 | total (`finance_external_sync`) | **MIGRATE_TO_MAKE** | Zielbild: Make konsumiert Outbox direkt; die lokale Queue `finance_external_sync` wird dabei abgelöst (Übergangsregel im Event-Vertrag). |
| 15 | `finance-invoicing` | Rechnungserstellung | schedule | CiviCRM, Mail | P1 | teilweise (invoice_service) | **MIGRATE_TO_MAKE** | Erstellung fachlich in ERPNext/CiviCRM; Make orchestriert Anstoß + Versand. Fachliche Regeln vor Aktivierung bestätigen. |
| 16 | `finance-membership-invoicing` | Mitgliedsbeitrags-Rechnungen | schedule | CiviCRM, Mail | P1 | teilweise | **MIGRATE_TO_MAKE** | Wie #15; Beitragsordnung als fachliche Quelle. |
| 17 | `finance-payment-confirmation` | Zahlungsbestätigung an Spender | webhook | CiviCRM, Mail | P1 | total | **RETIRE** | Bestätigungsmail sendet FastAPI post-commit (Übergang), danach Make via Outbox — dieser Workflow wäre ein zweiter Sender (Doppelmail-Risiko). |
| 18 | `finance-sepa-export` | SEPA-Batch-Export | schedule | SEPA, Mail | P0 | **total** (`sepa_service.export_sepa_batch`) | **MOVE_TO_FASTAPI** | Zahlungsdatei-Erzeugung ist Finanzkernlogik mit Audit-Pflicht; existiert bereits als FastAPI-Service. Make übernimmt nur Verteilung/Erinnerung. |
| 19 | `forum-moderation` | Forum-Moderationsalerts | webhook | Forum, Slack | P3 | — | **UNKNOWN** | Forum läuft nicht (EV-0006) und seine Zukunft ist eine offene Zielbild-Entscheidung. Keine Migration vor dieser Entscheidung. |
| 20 | `forum-viral` | Forum-Content-Auswertung | cron | Forum | P3 | — | **UNKNOWN** | Wie #19. |
| 21 | `mail-archiver-logging` | Mailversand-Archivierung | schedule | Mail | P3 | teilweise (`mail_service` loggt) | **MIGRATE_TO_MAKE** | Unkritisch; prüfen, ob FastAPI-Maillog bereits genügt (dann RETIRE). |
| 22 | `onboarding-welcome-series` | Willkommensstrecke neue Mitglieder | webhook | Mail | P2 | — | **MIGRATE_TO_MAKE** | Klassische Make-Follow-up-Strecke. |
| 23 | `plesk-deployment-notifications` | Deploy-Ereignisse → Slack | webhook | Plesk, Slack | P3 | — | **RETIRE** | GitHub Actions ist Deployment-Owner und kann Slack direkt benachrichtigen. |
| 24 | `plesk-mail-provisioning` | Mailbox-Anlage über Plesk-API | webhook | Plesk, Mail | P2 | teilweise (`services/plesk-mail-api`) | **MIGRATE_TO_MAKE** | REST-basierte, fest definierte Admin-Aktion (kein freies SSH, §38-konform). Overlap mit `services/plesk-mail-api` vor Umsetzung auflösen — nur EIN Owner. |
| 25 | `queue-monitor` | Queue-/Fehler-Monitoring → Slack | cron | FastAPI, Mail, Slack | P2 | teilweise | **MIGRATE_TO_MAKE** | Monitoring der Inbox/Outbox-Status per API-Read; Slack-Alerts datensparsam (P1-002-Regel gilt auch für Make). |
| 26 | `right-to-erasure-fixed` | DSGVO-Löschbegehren | webhook | GDPR, Mail | P0 | **total** (privacy routes, `data_deletion_requests`) | **MOVE_TO_FASTAPI** | Löschungen brauchen Autorisierung, Audit-Trail und Transaktionssicherheit — existiert bereits in der API. Ein Automationstool darf hier nie zweiter Ausführungsweg sein. |
| 27 | `social-media-crosspost` | Social-Media-Verteilung | webhook | Social | P3 | — | **MIGRATE_TO_MAKE** | Nicht kritische Orchestrierung, typischer Make-Fall. |

## Zusammenfassung

| Decision | Anzahl | Workflows |
| -------- | ------ | --------- |
| MIGRATE_TO_MAKE | 15 | #4, #5, #6, #9, #11, #12, #13, #14, #15, #16, #21, #22, #24, #25, #27 |
| RETIRE | 7 | #1, #2, #3, #8, #10, #17, #23 |
| MOVE_TO_FASTAPI | 3 | #7, #18, #26 |
| UNKNOWN (blockiert durch Forum-Entscheidung) | 2 | #19, #20 |
| TEMPORARY_KEEP | 0 | — (nichts läuft; es gibt keinen Betrieb, der Übergangsschonung bräuchte) |

## Migrationsreihenfolge (kein Big Bang)

1. **Welle 0 (sofort möglich):** RETIRE-Kandidaten als Legacy markieren
   (`.github/ai-registry.json` synchronisieren). Kein Löschen der JSONs vor
   Abschluss der Migration — sie sind die fachliche Referenz.
1. **Welle 1 (nach Merge PR #538 + Make-Zugang):** Outbox-Konsument in Make
   (`donation.recorded` → CiviCRM; `payment.failed` → Slack datensparsam).
   Das ersetzt #1, #2, #10, #17 funktional.
1. **Welle 2:** ERPNext-Kette (#12, #13, #14) — **Vorbedingung: ERPNext
   existiert live** (derzeit `erp.` = NXDOMAIN). Vorher ist jede Umsetzung
   Automatisierung gegen ein nicht existierendes System.
1. **Welle 3:** Mitglieder-/Mail-Strecken (#4, #5, #9, #22, #25), dann
   Finance-Scheduler (#11, #15, #16) nach fachlicher Regelbestätigung.
1. **Welle 4:** P3-Komfort (#6, #21, #24, #27).
1. **Abschluss:** n8n-Stilllegung gemäß Masterprompt §63 — erst wenn alle
   Entscheidungen umgesetzt bzw. dokumentiert sind; Subdomain `n8n.` ist
   bereits heute nur eine Plesk-Standardseite.

## Operations-Budget-Schätzung (Make, ~40.000 Ops/Monat)

Bei niedrigem zweistelligem Spendenvolumen/Monat und täglichen Batches:
Welle 1 < 500 Ops/Monat; Welle 2–3 zusammen konservativ < 3.000 Ops/Monat
(tägliche Scheduler à ~10 Module ≈ 300 Ops/Monat je Szenario). Das Budget
ist kein limitierender Faktor; Verbot von Dauerpolling bleibt bestehen
(Event-Push bevorzugt, Scheduler ≥ 15-Minuten-Raster).
