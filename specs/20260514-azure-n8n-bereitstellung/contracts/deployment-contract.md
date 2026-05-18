# Contract: Azure n8n Deployment Gate

## Contract Purpose

Dieser Contract beschreibt den verbindlichen Deploy-Pfad fuer `n8n.menschlichkeit-oesterreich.at` auf Azure bis zur Abnahmevorbereitung. Er ist ein Vorbereitungsgate, keine produktive Go-Freigabe.

## Scope

### In Scope

- Grant-/Billing-Gate inklusive Ownership und Renewal-Verantwortung
- Azure Resource Group, VM, statische Public IP, NSG, Disk
- SSH-Haertung und Expositionsregeln
- DNS-Zielzustand und Plesk-Abloesepfad als pruefbare Abnahmebedingungen
- Blockerklassifikation und Evidenztypen je Gate

### Out of Scope

- Produktiver Rollout ohne Primaernachweis
- KI-/Workflow-Fachausbau in n8n
- Queue-Mode-Ausbau ueber den Erstbetriebsvertrag hinaus

## Invariants

- Azure ist Zielarchitektur fuer n8n, Plesk nicht.
- Produktionsbehauptung nur mit Live-Nachweis.
- Oeffentlich offen bleiben nur `22`, `80`, `443`.
- `5678`, `5432`, `6379` duerfen nicht oeffentlich exponiert sein.
- Kein Root-Login und kein SSH-Passwort-Login.
- `N8N_ENCRYPTION_KEY`, DB-Credentials und Backup-Pfad sind vor spaeterem Go Pflicht.

## Grant-/Billing Gate Checklist

| Gate                | Sollzustand                     | Evidenztyp    | Blockerklasse        | Status |
| ------------------- | ------------------------------- | ------------- | -------------------- | ------ |
| Nonprofit/Grant     | Foerderstatus aktiv und nutzbar | Primaerquelle | Provisioning-Blocker | Open   |
| Sponsorship Mapping | Subscription korrekt zugeordnet | Primaerquelle | Provisioning-Blocker | Open   |
| Billing-Profil      | Abrechnung technisch nutzbar    | Primaerquelle | Provisioning-Blocker | Open   |
| Budget Alerts       | Alerts und Schwellwerte gesetzt | Primaerquelle | Go-Live-Blocker      | Open   |
| Renewal Ownership   | Rollen fuer Verlaengerung klar  | Primaerquelle | Go-Live-Blocker      | Open   |

## Required Evidence

- Primaernachweis fuer Grant-/Billing-Zustand
- Nachweis von Resource Group, VM, statischer IP und NSG-Regeln
- Nachweis SSH-Haertung (Konfiguration + erfolgreicher Zugriff im Zielmodus)
- Dokumentierter DNS-Umschaltplan inkl. Plesk-Ablaufad
- Verweis auf HTTPS- und Backup/Restore-Gates

## Blocker Classification

- **Provisioning-Blocker**: stoppt Ressourcenerstellung oder -fortschritt
  - Beispiele: ungeklaerter Billing-Status, unklare Subscription-Zuordnung
- **Go-Live-Blocker**: stoppt spaeteres produktives Go
  - Beispiele: falsche Port-Exposition, fehlender Backup-/Restore-Nachweis, fehlende Renewal-Ownership

## DNS Ablösepfad (Abnahmebedingung)

- Ist-Zustand dokumentieren (Plesk-Ziel)
- Soll-Zustand dokumentieren (Azure-Ziel)
- Umschaltfenster und Rollback definieren
- Go/No-Go-Checkliste vor Umschaltung festlegen

## Acceptance Gate

Der Contract gilt als erfuellt, wenn:

1. Grant-/Billing-Gates mit Primaernachweisen bewertet sind,
2. Provisioning- und Go-Live-Blocker explizit klassifiziert sind,
3. DNS-Zielzustand und Plesk-Abloesepfad als pruefbare Bedingungen dokumentiert sind.
