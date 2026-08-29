# Plattform-Recovery – Runbook-Katalog

Alle Meldungen verwenden das datensparsame Schema `Severity`, `Service`,
`Event class`, `Correlation ID`, `Timestamp`, `Status`, `Runbook`. Keine
Rohpayloads, personenbezogenen Zahlungsdaten, Tokens oder Stack-Traces.

| Störung                              | Sofortmaßnahme                                                                          | Nachweis vor Wiederaufnahme                                                   |
| ------------------------------------ | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| BSM-Zugriff fehlgeschlagen           | Deploy stoppen; Secret-Werte weder ausgeben noch ersetzen.                              | Read-only-Metadatenabgleich und erfolgreicher Secret-Contract-Test.           |
| Plesk-Deploy fehlgeschlagen          | Release markieren, keine Folge-Deploys starten, Read-only-Audit durchführen.            | SSH-, Health- und Release-Marker-Evidenz; Rollback-Entscheidung dokumentiert. |
| Stripe-Webhook-Ausfall               | Provider-Zustand nicht raten; Inbox-/Outbox-Backlog und Signaturfehler ohne PII prüfen. | Event-Reconciliation und idempotenter Retry-Nachweis.                         |
| DB-Migration fehlgeschlagen          | Migration anhalten; keine manuelle Schemaänderung.                                      | Backup-/Restore-Vertrag, `alembic current`, Staging-Upgrade und ein Head.     |
| Make-Ausfall                         | Outbox pending belassen, keine direkte Datenbank- oder Mehrfachausführung.              | Lease-/Ack-Backlog, Reconciliation und erlaubter Retry.                       |
| CiviCRM-/ERPNext-Sync fehlgeschlagen | Event in Dead Letter klassifizieren; keine manuelle Duplikaterstellung.                 | externe Referenz, fachliche Korrektur und Reconciliation.                     |
| Verdacht auf Secret Exposure         | Zugriff eindämmen, keine Werte in Ticket/Chat kopieren, Owner alarmieren.               | Incident-Triage, zulässige Rotation/Freigabe und erneute Zugriffskontrolle.   |

RTO/RPO werden erst nach belegtem Backup-, Restore- und Provider-Vertrag je
System festgelegt; es werden keine unbelegten Zielwerte behauptet.
