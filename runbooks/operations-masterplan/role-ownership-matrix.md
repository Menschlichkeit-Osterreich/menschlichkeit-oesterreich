# Rollen- und Ownership-Matrix (Masterplan)

Diese Matrix definiert alle relevanten Rollen und deren Verantwortlichkeiten für den Betrieb, die Governance und die Weiterentwicklung der Vereinsplattform.

| Rolle                | Verantwortungsbereich                | Vertretung           | Kritische Gates         |
|----------------------|--------------------------------------|----------------------|------------------------|
| Betriebsleitung      | Gesamtbetrieb, Rollout, Restore      | Stellv. Betriebsleitung | Go-/No-Go, Restore    |
| DevOps Engineer      | IaC, Deployment, Monitoring          | 2. DevOps Engineer   | Infra, Monitoring      |
| Security Officer     | DSGVO, Secrets, Logging              | Vorstand             | Compliance, Redaction  |
| Application Owner    | API, n8n, Donation-Flow              | 2. Application Owner | Donation, API          |
| Monitoring Lead      | Alerting, Signal-Matrix              | DevOps Engineer      | Monitoring, SLA        |
| Backup/Restore Lead  | Backup-Plan, Restore-Test            | DevOps Engineer      | Backup, Restore        |
| Vorstand             | Governance, Freigaben, Eskalation    | Stellv. Vorstand     | Governance, Escalation |

## Hinweise
- Jede Rolle muss im Vertretungsfall dokumentiert übergeben werden.
- Kritische Gates dürfen nur von den jeweils zuständigen Rollen freigegeben werden.
- Änderungen an der Matrix sind im Evidence Log zu dokumentieren.
