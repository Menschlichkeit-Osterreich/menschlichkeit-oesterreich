---
title: "Civicrm N8N Automation"
description: "Prompt für Civicrm N8N Automation im Menschlichkeit Österreich Projekt"
lastUpdated: 2025-10-10
status: ACTIVE
category: automation
tags: ['automation', 'n8n']
version: "1.0.0"
language: de-AT
audience: ['DevOps Team', 'Automation Engineers']
---

---
description: 'Konzipiert einen vollständigen Automationsplan (CiviCRM + n8n + Plesk + Monitoring) für Beiträge & Spenden'
mode: 'agent'
tools: ['githubRepo', 'codebase']
---

Analyse den aktuellen Stand der Vereinsbuchhaltung (CiviCRM) und entwirf einen Automationsplan, der folgende Bereiche abdeckt:

1. **Mitgliedschaften & Beiträge** – Regelwerke für Beitragstypwechsel, Altersgrenzen, Statusänderungen (CiviRules + Custom PHP). Nenne Dateien/Module (`#file:`) und Tests.
2. **SEPA-Export & Versand** – Cronjobs (Plesk), SEPA-Datei, Mail an Buchhaltung, Archiv (Nextcloud), Validierungen.
3. **Bankabgleich** – n8n Workflow (SFTP Download, CiviBank Import, Matching Report).
4. **Rechnungsversand & Mahnwesen** – automatische Rechnungen, Mahnstufen, Eskalation (CiviRules, CiviInvoice).
5. **Monitoring & Alerts** – n8n Monitoring Flow, Slack/Mail Alerts (offene Rechnungen, Mandatsablauf, Kampagnenfortschritt). Optional Deployment Monitoring.
6. **Buchhaltungs-Export** – JSON/CSV Export, Push an Lexoffice/sevDesk/DATEV, Monatsabschluss.
7. **Zuwendungsbestätigungen** – Schwellenwerte, Jahreszusammenfassung, PDF-Archivierung.

**Output-Anforderungen:**
- Detaillierter Aktionsplan (Abschnitte + nummerierte Schritte)
- Verweise auf relevante Dateien/Skripte (`#file:` Syntax)
- Konkrete Befehle/Workflows in Code- oder JSON-Blöcken
- Hinweise auf benötigte Secrets (aus `docs/SECRETS.template.md`)
- Abschließende Test-/Monitoring-Checkliste
