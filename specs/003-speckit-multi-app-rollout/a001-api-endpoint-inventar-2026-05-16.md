# A001 API Endpunkt-Inventar (2026-05-16)

## Ziel

Erster Wave-A-Nachweis fuer A001: API-Endpunkte aus `apps/api/openapi.yaml`
mit Ownership und initialer Risiko-Einstufung.

## Ownership-Modell

- Primaerer Owner: API Team (`apps/api`)
- Verantwortungsrolle je Domain:
  - Auth und Membership: API Team + Security Review
  - Payments und Finance: API Team + Ops/Finance Domain Owner
  - Newsletter und Consent: API Team + Compliance Owner
  - Forum und Content APIs: API Team + Product Owner Website/Forum
  - Game APIs: API Team + Games Integration Owner

## Inventar (Wave-A-relevant Domains)

| Domain    | Methode | Pfad                                       | Primaerer Owner | Risiko |
| --------- | ------- | ------------------------------------------ | --------------- | ------ |
| Health    | GET     | /healthz                                   | API Team        | P2     |
| Health    | GET     | /readyz                                    | API Team        | P1     |
| Health    | GET     | /api/version                               | API Team        | P2     |
| Auth      | POST    | /api/auth/login                            | API Team        | P0     |
| Auth      | POST    | /api/auth/register                         | API Team        | P0     |
| Auth      | POST    | /api/auth/password-reset                   | API Team        | P1     |
| Auth      | POST    | /api/auth/password-reset/confirm           | API Team        | P1     |
| Members   | GET     | /api/members                               | API Team        | P1     |
| Members   | GET     | /api/members/{id}                          | API Team        | P1     |
| Members   | PUT     | /api/members/{id}                          | API Team        | P1     |
| Members   | DELETE  | /api/members/{id}                          | API Team        | P1     |
| Roles     | GET     | /api/roles                                 | API Team        | P2     |
| Roles     | POST    | /api/roles/assign                          | API Team        | P1     |
| Events    | GET     | /api/events                                | API Team        | P2     |
| Events    | POST    | /api/events                                | API Team        | P1     |
| Events    | GET     | /api/events/{event_id}                     | API Team        | P2     |
| Events    | PUT     | /api/events/{event_id}                     | API Team        | P1     |
| Events    | DELETE  | /api/events/{event_id}                     | API Team        | P1     |
| Events    | POST    | /api/events/{event_id}/rsvp                | API Team        | P1     |
| Forum     | GET     | /api/forum/categories                      | API Team        | P2     |
| Forum     | GET     | /api/forum/threads                         | API Team        | P2     |
| Forum     | POST    | /api/forum/threads                         | API Team        | P1     |
| Forum     | GET     | /api/forum/threads/{thread_id}             | API Team        | P2     |
| Forum     | PUT     | /api/forum/threads/{thread_id}             | API Team        | P1     |
| Forum     | DELETE  | /api/forum/threads/{thread_id}             | API Team        | P1     |
| Forum     | GET     | /api/forum/threads/{thread_id}/posts       | API Team        | P2     |
| Forum     | POST    | /api/forum/posts                           | API Team        | P1     |
| Finance   | GET     | /api/finance/overview                      | API Team        | P1     |
| Finance   | GET     | /api/finance/cockpit                       | API Team        | P1     |
| Finance   | GET     | /api/finance/sync/health                   | API Team        | P1     |
| Finance   | POST    | /api/finance/sync/process                  | API Team        | P0     |
| Finance   | POST    | /api/finance/sync/requeue/{sync_id}        | API Team        | P0     |
| Finance   | POST    | /api/finance/payables                      | API Team        | P0     |
| Finance   | POST    | /api/finance/manual-journal                | API Team        | P0     |
| Finance   | GET     | /api/finance/reports/catalog               | API Team        | P2     |
| Finance   | GET     | /api/finance/reports/{report_id}           | API Team        | P1     |
| Invoices  | GET     | /api/finance/invoices                      | API Team        | P1     |
| Invoices  | GET     | /api/invoices                              | API Team        | P1     |
| Invoices  | GET     | /api/invoices/{id}                         | API Team        | P1     |
| Invoices  | GET     | /api/invoices/{id}/download                | API Team        | P1     |
| Invoices  | POST    | /api/invoices/{id}/send                    | API Team        | P0     |
| Donations | GET     | /api/donations                             | API Team        | P1     |
| Donations | GET     | /api/donations/{id}                        | API Team        | P1     |
| SEPA      | GET     | /api/sepa/mandates                         | API Team        | P1     |
| SEPA      | GET     | /api/sepa/batches                          | API Team        | P1     |
| SEPA      | POST    | /api/sepa/batches                          | API Team        | P0     |
| Metrics   | GET     | /api/kpis/overview                         | API Team        | P2     |
| Metrics   | GET     | /api/members/timeseries                    | API Team        | P2     |
| Metrics   | GET     | /api/donations/summary                     | API Team        | P2     |
| Metrics   | GET     | /api/finance/income-vs-expense             | API Team        | P2     |
| Metrics   | GET     | /api/projects/burn                         | API Team        | P2     |
| SEO       | GET     | /sitemap.xml                               | API Team        | P2     |
| Game      | GET     | /api/game/bootstrap                        | API Team        | P1     |
| Game      | PUT     | /api/game/profile                          | API Team        | P1     |
| Game      | POST    | /api/game/scenarios/{scenario_id}/complete | API Team        | P1     |
| Game      | POST    | /api/game/events                           | API Team        | P1     |

## Offene Ownership-Luecken

1. Finance- und Invoice-Endpunkte brauchen benannten sekundaren
   Finance/Ops-Owner.
2. Newsletter- und Contact-Endpunkte sind in `openapi.yaml` aktuell nicht
   vollstaendig sichtbar und muessen im naechsten Lauf explizit nachgetragen
   werden.
3. Risiko-Review fuer P0-Endpunkte muss mit Security und Compliance gegengeprueft
   werden.

## Naechster Schritt (A001 Abschluss)

1. Sekundaere Owner pro Domain als GitHub-Handle nachtragen.
2. P0/P1-Risiken gegen reale Monitoring- und Alerting-Signale verifizieren.
3. Inventar mit Issue #380 verlinken und als Referenz fuer W001/W002 verwenden.
