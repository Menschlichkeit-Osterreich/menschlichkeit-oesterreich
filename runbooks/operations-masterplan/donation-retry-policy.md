# Donation Retry- und Fehlervertragsregeln (Masterplan)

## Ziel

Verbindliche Regeln fuer den Umgang mit transienten Fehlern, permanenten Fehlern
und Dead-Letter-Faellen im Donation-Verarbeitungsfluss (Stripe → n8n → CiviCRM).

## Geltungsbereich

- Stripe-Webhook-Eingang (API-Endpunkt `/webhook/stripe`)
- n8n-Automationsworkflows (`automation/n8n/workflows/`)
- CiviCRM-APIv4-Aufrufe aus dem Donation-Flow

---

## Fehlerkategorien

| Kategorie             | Beispiele                                                           | Verhalten                            |
| --------------------- | ------------------------------------------------------------------- | ------------------------------------ |
| **Transient**         | Netzwerk-Timeout, HTTP 502/503, CiviCRM kurz nicht erreichbar       | Retry mit Backoff                    |
| **Permanent**         | Ungueltige Stripe-Signatur, Schema-Validierungsfehler, HTTP 400/422 | Kein Retry, sofort Dead-Letter       |
| **Idempotenz-Schutz** | Doppelt empfangener Webhook (gleiche `event.id`)                    | Deduplizierung, kein zweiter Eintrag |

---

## Retry-Regeln

### Stripe-Webhook-Empfang (apps/api)

- **Signaturvalidierung schlaegt fehl** → HTTP 400 zurueckgeben, kein Retry.
- **Downstream-Fehler (n8n/CiviCRM nicht erreichbar)** → HTTP 500 zurueckgeben.
  Stripe wiederholt automatisch bis zu **87 Stunden** nach exponentiellem Backoff.
- **Idempotenz-Key**: `event.id` muss vor Verarbeitung gegen den letzten 24h-Cache
  geprueft werden (Redis oder In-Memory). Bei Duplikat → HTTP 200, kein Processing.

### n8n-Workflow-Retries

| Parameter               | Wert                     |
| ----------------------- | ------------------------ |
| Max. Retry-Versuche     | 3                        |
| Initiales Intervall     | 30 s                     |
| Backoff-Faktor          | 2× (30 s → 60 s → 120 s) |
| Max. Intervall          | 300 s                    |
| Timeout pro Ausfuehrung | 60 s                     |

Konfigurationsort: n8n-Workflow-Settings → "Retry on Fail" aktivieren.

### CiviCRM-APIv4-Aufrufe

- Fehlerklasse `DBERROR` / HTTP 500 → 1× sofortiger Retry, dann Dead-Letter.
- Fehlerklasse `NOT_FOUND` (Kontakt nicht vorhanden) → kein Retry,
  Fallback-Pfad "Neuen Kontakt anlegen" triggern.
- Fehlerklasse `DUPLICATE` → kein Retry, bestehenden Datensatz aktualisieren.

---

## Dead-Letter-Verhalten

Wenn alle Retry-Versuche erschoepft sind oder ein permanenter Fehler vorliegt:

1. **Ereignis archivieren**: vollstaendiger Webhook-Payload in
   `automation/n8n/workflows/donation-webhook-archive.json`-Schema ablegen.
2. **Alert ausloesen**: n8n-Fehler-Benachrichtigung (E-Mail / Slack-Kanal
   `#donation-alerts`) mit `event.id`, Fehlertyp und Zeitstempel.
3. **Manuelle Bearbeitung**: on-call-Operator prueft innerhalb von 4 h
   gemaess `runbooks/operations-masterplan/incident-alert-runbook.md`.

---

## Alarmierungsschwellen

| Metrik                              | Warnschwelle | Kritisch |
| ----------------------------------- | ------------ | -------- |
| Fehlgeschlagene Webhooks in 1 h     | ≥ 3          | ≥ 10     |
| Durchschnittliche Verarbeitungszeit | > 5 s        | > 15 s   |
| Dead-Letter-Queue-Tiefe             | ≥ 1          | ≥ 5      |

---

## Verantwortlichkeiten

| Rolle            | Aufgabe                                                                       |
| ---------------- | ----------------------------------------------------------------------------- |
| On-Call-Operator | Dead-Letter-Queue innerhalb 4 h pruef en und eskalieren                       |
| Entwickler       | Retry-Logik im API-Code (`apps/api/`) und n8n-Workflows korrekt konfigurieren |
| DevOps           | Alert-Kanal und Monitoring-Dashboards aktiv halten                            |

Eskalationspfad: → `runbooks/operations-masterplan/escalation-policy.md`

---

## Verwandte Dokumente

- `runbooks/operations-masterplan/donation-go-live-runbook.md`
- `runbooks/operations-masterplan/incident-alert-runbook.md`
- `runbooks/operations-masterplan/escalation-policy.md`
- `.github/workflows/donation-webhook-validation.yml`
- `.github/workflows/donation-gate.yml`
