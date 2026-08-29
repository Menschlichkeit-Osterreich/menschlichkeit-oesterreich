# Make Outbox Consumer Contract

Stand: 2026-08-29 · Status: `INACTIVE_UNTIL_OWNER_GATE`

Make ist ausschliesslich ein signierter Konsument der FastAPI-Outbox. Es erhält
keine PostgreSQL-Zugangsdaten und darf weder Donation-, Inbox- noch
PaymentIntent-Zustände direkt verändern.

## Endpunkte

| Endpunkt                                   | Zweck                                          | Ergebnis                                            |
| ------------------------------------------ | ---------------------------------------------- | --------------------------------------------------- |
| `POST /api/internal/outbox/claim`          | bis zu 100 erlaubte Ereignisse exklusiv leasen | Ereignisse mit Lease-Token und Ablaufzeit           |
| `POST /api/internal/outbox/{event_id}/ack` | ein Lease-Ergebnis idempotent quittieren       | `processed`, `retrying` oder `dead_letter`          |
| `GET /api/internal/outbox/reconciliation`  | aggregierte Status-/DLQ-Sicht                  | keine personenbezogenen oder Provider-Payload-Daten |

Jeder Request trägt `X-MOE-Timestamp` und `X-MOE-Outbox-Signature`. Die
Signatur ist `HMAC-SHA256(MOE_API_TOKEN, "<timestamp>.<raw-body>")`; sie ist
fünf Minuten gültig. Generische Bearer-Tokens werden für diese Schnittstelle
nicht akzeptiert.

## Lease und Ack

`claim` verlangt `consumer_id`, `limit` und `lease_seconds` (30 bis 900). Ein
Event wird atomar mit `FOR UPDATE SKIP LOCKED` gelockt. Nach Ablauf kann ein
verwaistes Lease erneut vergeben werden.

`ack` enthält den Lease-Token, einen consumerseitigen Idempotency-Key, eine
erlaubte Result-Klasse und optional eine nicht-personenbezogene
Reconciliation-Referenz. Die Klassen haben diese Wirkung:

| Result-Klasse                                                             | Folgezustand                                  |
| ------------------------------------------------------------------------- | --------------------------------------------- |
| `succeeded`                                                               | `processed`                                   |
| `transient_failure`, `rate_limited`                                       | `retrying` mit begrenzter Wartezeit           |
| `permanent_failure`, `business_failure`, `auth_failure`, `schema_failure` | `dead_letter` plus datensparsamer DLQ-Eintrag |

## Datenschutz und Aktivierungsgate

FastAPI liefert nur die in der Event-Allowlist dokumentierten Felder. Name,
E-Mail-Adresse, Anschrift, vollständige Stripe-Payloads und Fehlermeldungen
werden aus jedem Make-Delivery-Payload entfernt. CiviCRM-/ERPNext-Referenzen
dürfen erst übertragen werden, wenn sie für den konkreten Ereignistyp
fachlich belegt sind.

Vor Aktivierung sind ein isoliertes Menschlichkeit-Österreich-Team, eine
positive Connection-Allowlist, ein Ersatztest, Reconciliation-Evidenz und ein
Rollback-Fenster erforderlich. Dieses Repository erstellt oder aktiviert kein
Make-Szenario und stellt keinen Webhook um.
