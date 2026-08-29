# FastAPI → Make Event-Vertrag (v1)

Stand: 2026-08-29 · Status: `VERIFIED_REPO` (Produzentenseite separat zu
validieren), Make-Konsument: noch nicht gebaut und nicht aktiviert.

## Grundsatz

FastAPI + PostgreSQL bleiben Owner der kritischen Transaktionslogik
(Signaturprüfung, Webhook-Inbox, Idempotency, Payment-Kernstatus,
Donation-Kernverbuchung, Outbox-Erzeugung). Make übernimmt die Orchestrierung
**nach** einem erfolgreichen lokalen Commit und erhält **keinen direkten
Schreibzugriff** auf produktive PostgreSQL-Tabellen.

```text
Stripe ──▶ FastAPI ──▶ PostgreSQL-Transaktion ──▶ COMMIT
                          ├── donations
                          ├── payment_intents
                          └── outbox_events  ◀── einzige Grenze zu Make
                                   │
                                   ▼
                                  Make ──▶ CiviCRM / ERPNext / Mail / Slack / SharePoint
```

## Transportgrenze

Make konsumiert `outbox_events` ausschließlich über den signierten
Pull-/Lease-/Ack-Vertrag. Ein Webhook-Push und eine direkte
Datenbankverbindung sind nicht Teil von v1. Bis der Konsument existiert,
sammeln sich Events mit `status='pending'` an — das ist beabsichtigt und
verlustfrei.

| Route                                  | Wirkung                                                                     | Erforderliche Antwort                                              |
| -------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `POST /internal/outbox/claim`          | Liefert eine begrenzte Menge fälliger Events und setzt je Event eine Lease. | Event-ID, Lease-ID, Lease-Ablauf, Typ, Payload und Idempotency-Key |
| `POST /internal/outbox/{event_id}/ack` | Bestätigt für dieselbe Lease Erfolg oder einen klassifizierten Fehler.      | `processed`, wieder fällig oder `failed`                           |

Beide Routen verlangen eine BSM-provisionierte Maschinenauthentisierung. Die
Signatur umfasst Methode, Pfad, Zeitstempel und Body. Eine abgelaufene oder
falsche Lease verändert keinen Event-Zustand. Wiederholte Zustellung ist
erwartet; der Empfänger muss den `idempotency_key` vor jedem externen Write
verwenden.

## Envelope (alle Events)

Jedes Outbox-Event trägt im `payload` mindestens:

| Feld              | Typ    | Bedeutung                                                                                                            |
| ----------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| `schema_version`  | int    | Version dieses Vertrags (aktuell `1`)                                                                                |
| `correlation_id`  | uuid   | `webhook_events.id` des auslösenden Stripe-Events — durchgängige Nachverfolgbarkeit Stripe → Inbox → Business → Make |
| `idempotency_key` | string | Eindeutig je Geschäftsvorfall; Make MUSS darauf deduplizieren                                                        |

Tabellenseitig (Spalten von `outbox_events`): `id` (uuid, zugleich
Event-Identität), `event_type`, `aggregate_type`, `aggregate_id`, `status`
(`pending`→`processed`/`failed`), `attempts`, `next_retry_at`, `last_error`,
`created_at`, `processed_at`.

## Event: `donation.recorded`

Erzeugt genau einmal pro verbuchter Spende (DB-garantiert über den partiellen
Unique-Index `ux_donations_gateway_payment`).

| Payload-Feld                             | Inhalt                                                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `donation_id`                            | lokale Donation-ID (aggregate_id)                                                                          |
| `amount`, `currency`                     | Betrag als String `"50.00"`, ISO-Währung                                                                   |
| `donation_type`                          | immer `one_time` in v1                                                                                     |
| `interval`                               | immer `once` in v1                                                                                         |
| `purpose`                                | Spendenzweck (fachlich) — getrennt von `source`                                                            |
| `source`                                 | technischer Ursprung (z. B. `website`)                                                                     |
| `financial_type`                         | Finanzkategorie aus Stripe-Metadata, ggf. `null`                                                           |
| `donor_email`, `donor_name`              | für CRM-Zuordnung und Folgekommunikation                                                                   |
| `gateway_provider`, `gateway_payment_id` | Stripe-Referenz für Reconciliation                                                                         |
| `receipt_email_sent_by_api`              | `true` = FastAPI hat die Dankesmail bereits versendet (Übergangsphase) — Make darf **keine** zweite senden |

**Make-Pflichten:**

1. Idempotent: `idempotency_key` (`donation.recorded:<donation_id>`) vor jeder
   Schreiboperation prüfen. Wiederholte Zustellung darf keine zweite CiviCRM-
   Contribution, keine zweite ERPNext-Rechnung, keine zweite Mail erzeugen.
1. CiviCRM: Kontakt auflösen/anlegen, Contribution mit externer Referenz
   `gateway_payment_id` anlegen; Contribution-ID zurückschreiben über die
   dafür vorgesehene FastAPI-Route (nicht direkt in die DB).
1. ERPNext: gemäß Accounting-Mapping; externe Referenz
   `donation:<donation_id>` verwenden (Duplikatsperre in ERPNext).
1. Fehler: begrenzte Retries mit Backoff, danach Fehlerstatus zurückmelden;
   `correlation_id` in jeder Fehlermeldung mitführen. Keine stillen Fehler.

## Event: `payment.failed`

Erzeugt je fehlgeschlagenem/abgebrochenem Payment-Intent-Event.

| Payload-Feld         | Inhalt                                                               |
| -------------------- | -------------------------------------------------------------------- |
| `status`             | `failed` \| `canceled`                                               |
| `amount`, `currency` | wie oben                                                             |
| `donor_email`        | für Follow-up-Kommunikation (nur interne Systeme/Mail an Betroffene) |
| `failure_reason`     | Stripe-Fehlermeldung, ggf. `null`                                    |
| `gateway_intent_id`  | Stripe-Referenz                                                      |

**Make-Pflichten:** Slack-Alerts aus diesem Event MÜSSEN datensparsam sein —
keine `donor_email`, keine Stripe-IDs; nur Betrag, Status, `correlation_id`
(identisch zur Regel im FastAPI-Alert, Finding P1-002).

## PII-Klassifikation

`donor_email`/`donor_name` im Outbox-Payload sind personenbezogene Daten in
einem internen System (zulässige Verarbeitung). Sie dürfen Make nur zu den
definierten Zwecken (CRM-Sync, Betroffenen-Mail) verlassen — niemals in
Slack-Alerts, Logs oder Monitoring-Artefakte.

## Übergangsregeln

- Dankesmail: sendet derzeit FastAPI (post-commit, best effort);
  Kennzeichnung via `receipt_email_sent_by_api`. Bei Übernahme durch Make wird
  das Flag auf Produzentenseite abgeschaltet — Vertragsänderung = neue
  `schema_version`.
- ERPNext: Die bestehende lokale Queue `finance_external_sync` bleibt bis zur
  Make-Übernahme unangetastet; der Webhook-Pfad befüllt sie nicht mehr
  (Entkopplung gemäß Zielarchitektur). Übernahmeplan: siehe
  n8n→Make-Migrationsmatrix.
- Subscription- und Belegfunktion sind ausdrücklich nicht Bestandteil von
  v1. UI, API und Dokumentation dürfen sie nicht als verfügbare Funktion
  darstellen, bis ihr vollständiger fachlicher und technischer Lifecycle
  freigegeben ist.

## Operations-Budget (Make)

Erwartung Spendenvolumen: niedrig zweistellig/Monat → `donation.recorded` +
`payment.failed` zusammen deutlich < 100 Events/Monat; selbst mit ~10
Modulen/Szenariolauf « 1 % des Budgets von ~40.000 Operations/Monat.
Der Claim-Lauf darf höchstens im 15-Minuten-Raster pollen und nur fällige
Events anfordern. Dauerpolling oder zweite Zustellpfade sind verboten.
