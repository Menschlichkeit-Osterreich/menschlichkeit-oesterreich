# SYSTEM_OF_RECORD_MATRIX — Stand 2026-08-28

**Charakter dieses Dokuments.** Mit dem Auftrag vom 2026-08-28 ist die
Zielarchitektur entschieden (FastAPI+PostgreSQL Kern, CiviCRM = CRM,
ERPNext = Accounting, Make = Orchestrierung). Diese Matrix ist damit der
**verbindliche Ziel-Vertrag** für Datenhoheit. Live-Status der Systeme:
CiviCRM und ERPNext sind derzeit nicht in Betrieb (EV-0004/EV-0005) — bis zu
deren Inbetriebnahme ist FastAPI/PostgreSQL faktischer Halter aller lokal
anfallenden Daten; die Matrix regelt, wohin die Hoheit bei Inbetriebnahme
übergeht. Kein Objekt hat mehr als ein führendes System.

Statuslegende: SoR = System of Record (führend). Repliken sind lesende
Kopien mit dokumentierter Sync-Richtung.

| Datenklasse | SoR (Ziel) | Create | Update | Repliken | Sync-Richtung | Konfliktstrategie |
| ----------- | ---------- | ------ | ------ | -------- | ------------- | ----------------- |
| Person / Kontakt | **CiviCRM** | Make (aus `donation.recorded`) oder CiviCRM-UI | CiviCRM | FastAPI (`donations.donor_*` als Snapshot) | CiviCRM → FastAPI (IDs zurückschreiben) | CiviCRM gewinnt |
| Mitglied / Mitgliedschaft | **CiviCRM** | CiviCRM | CiviCRM | FastAPI `members` (Login/Portal) | CiviCRM → FastAPI | CiviCRM gewinnt |
| Consent | **FastAPI** (`consent_records`) | FastAPI | FastAPI | CiviCRM (Kommunikationsflags) | FastAPI → CiviCRM | FastAPI gewinnt (Audit-Pflicht) |
| Newsletter-Abo | **FastAPI** (`newsletter_subscriptions`) | FastAPI | FastAPI | Mailsystem | FastAPI → Mail | FastAPI gewinnt |
| Contribution / Donation (fachlich) | **CiviCRM** | Make (aus Outbox) | CiviCRM | FastAPI `donations` (transaktionale Quelle) | FastAPI → CiviCRM (Erzeugung), CiviCRM-ID zurück | Erzeugung: FastAPI-Referenz (`gateway_payment_id`) ist Dedup-Anker |
| Payment-Transaktion (technisch) | **FastAPI** (`donations`, `payment_intents`) | FastAPI (Webhook-Inbox) | FastAPI | — | — | DB-Unique `ux_donations_gateway_payment` |
| Stripe Customer/Payment/Subscription | **Stripe** | Stripe | Stripe | FastAPI (IDs), CiviCRM (Referenz) | Stripe → FastAPI (Webhooks) | Stripe gewinnt |
| SEPA-Mandat | **CiviCRM (CiviSEPA)** | CiviCRM | CiviCRM | FastAPI (Referenz) | CiviCRM → FastAPI | CiviCRM gewinnt |
| Rechnung (fachlich) / Debitor / Kreditor | **ERPNext** | Make (aus Outbox/Queue) | ERPNext | FastAPI `invoices` (operative Kopie) | FastAPI → ERPNext (Anstoß), ERPNext führt | ERPNext gewinnt; Dedup via `custom_external_reference` |
| Payment Entry / Journalbuchung | **ERPNext** | Make | ERPNext | — | — | ERPNext gewinnt |
| Projekt / Expense (operativ) | **FastAPI** (`projects`, `expenses`) | FastAPI | FastAPI | ERPNext (Buchhaltungssicht) | FastAPI → ERPNext | FastAPI operativ, ERPNext buchhalterisch |
| Webhook Event (Inbox) | **FastAPI** (`webhook_events`) | FastAPI | FastAPI | — | — | Unique (provider, provider_event_id) |
| Outbox Event / Integration Failure | **FastAPI** (`outbox_events`, `integration_failures`) | FastAPI | FastAPI + Make (Status-Ack über API) | Make (Verarbeitung) | FastAPI → Make | FastAPI führt Status |
| Audit Event | **FastAPI** (`audit_trail`) | FastAPI | append-only | — | — | unveränderlich |
| Reconciliation-Status | **FastAPI** | FastAPI/Make | FastAPI | Reporting | — | FastAPI führt |
| Offizielle Dokumente / Governance | **SharePoint** | SharePoint | SharePoint | — | — | SharePoint gewinnt |

## Harte Regeln

1. **FastAPI/PostgreSQL wird nicht zum zweiten CiviCRM oder ERPNext.** Es
   hält transaktionale Wahrheit (Zahlungen, Events, Audit) und Snapshots —
   keine fachliche Stammdatenpflege von Kontakten oder Buchhaltung.
1. **Make besitzt keine Daten.** Es orchestriert zwischen SoRs, dedupliziert
   über `idempotency_key`/externe Referenzen und schreibt Status nur über
   die dafür vorgesehenen APIs zurück — nie direkt in PostgreSQL.
1. **Genau ein Execution Owner je Schreiboperation.** Die
   [n8n→Make-Matrix](11-n8n-make-migration-matrix.md) setzt das um; die
   RETIRE-Entscheidungen dort beseitigen die bisherigen Doppel-Owner
   (FastAPI + n8n für denselben Stripe-Webhook).
1. **Cross-System-IDs:** `gateway_payment_id` (Stripe↔FastAPI),
   `civicrm_contribution_id` (FastAPI↔CiviCRM),
   `custom_external_reference = donation:<id>` (↔ERPNext),
   `correlation_id = webhook_events.id` (durchgängige Spur).
