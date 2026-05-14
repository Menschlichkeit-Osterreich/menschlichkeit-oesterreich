# SLO/SLA Policy (Masterplan)

## Service Level Objectives (SLO)
- **Verfügbarkeit**: >= 99,9% pro Monat
- **Recovery Time Objective (RTO)**: <= 2 Stunden
- **Alert-Acknowledgement (Ack-SLA)**: <= 30 Minuten für kritische Alerts

## Definitionen
- **Verfügbarkeit**: Zeit, in der die Plattform für Endnutzer erreichbar ist (exkl. geplante Wartung)
- **RTO**: Maximale Zeit bis zur Wiederherstellung nach kritischem Ausfall
- **Ack-SLA**: Zeit bis zur Bestätigung eines kritischen Alerts durch das Betriebsteam

## Messung
- Monitoring- und Alerting-Systeme liefern Nachweis (Reports, Logs)
- Evidence-Log dokumentiert alle SLA-relevanten Ereignisse

## Eskalation
- SLA-Verletzungen werden im Evidence-Log dokumentiert und führen zu sofortiger Eskalation gemäß Escalation Policy
