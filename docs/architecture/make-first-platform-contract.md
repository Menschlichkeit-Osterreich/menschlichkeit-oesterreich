# Make-first-Plattformvertrag

Stand: 29.08.2026 · Architekturanker: GitHub Issue #539

## Verbindliche Grenzen

1. FastAPI und PostgreSQL entscheiden über Stripe-Signatur, Payment-Zustand,
   Donation, Inbox, Outbox und finanzrelevante Constraints.
2. Make orchestriert erst nach dem lokalen Commit. Es erhält keinen direkten
   Datenbankzugriff und wird weder Ledger noch zweiter Payment-Owner.
3. CiviCRM ist CRM-System, ERPNext Buchhaltungs-System. Beide erhalten
   stabile externe Referenzen, nicht die alleinige Wahrheit über Stripe.
4. n8n ist ausschließlich Migrationsquelle und forensische Referenz. Azure
   ist historische Architektur. Beides darf keine neue Produktfunktion
   erhalten.
5. GitHub ist Source of Truth für Code und technische, versionierte Verträge;
   SharePoint erhält nur freigegebene langlebige Betriebsdokumentation.

## Outbox-Transport v1

Der einzige technische Übergang von FastAPI zu Make ist ein signierter
Pull-/Lease-/Ack-Vertrag. Der Konsument authentifiziert sich mit einem
BSM-provisionierten Maschinengeheimnis; Signaturen umfassen Methode, Pfad,
Zeitstempel und Body. Make sendet niemals Datenbank-Credentials.

| Operation                              | Semantik                                                                 | Ergebnis                                                            |
| -------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `POST /internal/outbox/claim`          | fordert eine begrenzte Menge fälliger Ereignisse an und setzt eine Lease | Event-ID, Lease-ID, Ablaufzeit, Event-Typ, Payload, Idempotency-Key |
| `POST /internal/outbox/{event_id}/ack` | bestätigt Erfolg oder einen klassifizierten Fehler für dieselbe Lease    | `processed`, erneuter Versuch oder `failed`                         |

Eine abgelaufene Lease wird wieder fällig. Wiederholte Claims sind erlaubt;
externe Effekte müssen deshalb die mitgelieferte `idempotency_key` verwenden.
Eine Ack-Antwort ohne gültige Lease verändert keinen Zustand. Die API erzeugt
keine direkte CiviCRM-, ERPNext-, Mail-, Slack- oder SharePoint-Aktion.

## Ereignis- und Datenschutzregeln

- Unterstützte Payment-Ereignisse der Recovery sind `donation.recorded` und
  `payment.failed`; sie stehen für Einmalzahlungen. Eine Subscription wird
  erst nach vollständigem Stripe-Subscription-Lifecycle freigegeben.
- Slack erhält nur Severity, Service, Event-Klasse, Korrelations-ID,
  Zeitstempel, Status und Runbook-Link. Keine Namen, E-Mail-Adressen,
  Provider-IDs, Rohpayloads oder Geheimnisse.
- PII im Event darf nur an den für CRM-/Mail-Zwecke autorisierten
  Konsumenten gehen; in Logs und Reconciliation-Ausgaben wird sie nicht
  ausgegeben.
- Fehler werden als `TRANSIENT`, `PERMANENT`, `BUSINESS_REJECTED`,
  `AUTH_FAILURE`, `RATE_LIMIT` oder `SCHEMA_ERROR` klassifiziert. Nach dem
  begrenzten Retry-Budget entsteht ein nachvollziehbarer Dead-Letter-Zustand.

## Cutover und Reconciliation

Ein Make-Szenario bleibt zunächst inaktiv. Aktivierung verlangt: bestätigtes
MOE-Team, Connection-Allowlist, Testevent, Idempotenznachweis,
Reconciliation-Plan, Rückrollfenster und fachliche Freigabe. n8n wird erst
nach Export, funktionalem Ersatz und belegter Reconciliation stillgelegt.
