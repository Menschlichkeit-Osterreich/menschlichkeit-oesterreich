# Contract: Platform Operations Gate

## Contract Purpose

Dieser Contract definiert den verbindlichen Betriebs- und Infrastrukturvertrag fuer die produktive Plattform von Menschlichkeit Oesterreich.

## Scope

### In Scope

- Azure-Infrastruktursteuerung ueber Terraform + AVM
- Netzgrenzen und Expositionsregeln (nur Reverse-Proxy oeffentlich)
- Verfuegbarkeits- und Wiederherstellungsziele
- Monitoring- und Alerting-Vertrag inkl. Ack-SLA
- Backup/Restore-Nachweise und Go-/No-Go-Pruefungen

### Out of Scope

- Detailimplementierung einzelner App-Features
- Fachliche Donation-Entscheidungslogik innerhalb von API-Endpunkten
- KI/RAG-Ausbau vor stabiler Produktionsreife

## Invariants

- Keine produktive Infra-Aenderung ausserhalb Terraform + AVM.
- API und n8n sind nicht direkt oeffentlich erreichbar.
- Produktive Freigabe nur bei erfuellten Pflicht-Gates.
- Kritische Alerts muessen ueber Slack und E-Mail zugestellt werden.
- Kritische Alerts muessen innerhalb von 30 Minuten bestaetigt werden.
- Keine Freigabe ohne dokumentierten Restore-Test.

## Required Evidence

- IaC-Delta und Review-Nachweis in Versionshistorie
- Netzscan- oder Reachability-Nachweis zur Expositionsregel
- Verfuegbarkeits- und RTO-Nachweis
- Alert-Simulation mit Zeitstempeln fuer Ack-SLA
- Backup- und Restore-Testprotokoll

## Acceptance Gate

Der Contract gilt als erfuellt, wenn alle Invariants eingehalten sind und jeder Pflichtnachweis fuer die aktuelle Freigabephase vorliegt.
