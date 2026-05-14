# Secret Ownership Map (Masterplan)

| Secret-Bereich | Owner | Vertretung | Speicherort |
| --- | --- | --- | --- |
| Azure / Infra | DevOps Engineer | Betriebsleitung | GitHub Secrets |
| Donation / Stripe | Application Owner | Vorstand | GitHub Secrets |
| Monitoring / Alerts | Monitoring Lead | DevOps Engineer | GitHub Secrets |
| Governance / DSGVO | Security Officer | Vorstand | GitHub Secrets |

## Regeln
- Jeder Secret-Bereich hat genau einen verantwortlichen Owner.
- Kein Secret wird im Klartext in Repo-Dateien oder Logs abgelegt.

## Nachweis
- Owner-Wechsel wird im Evidence-Log dokumentiert