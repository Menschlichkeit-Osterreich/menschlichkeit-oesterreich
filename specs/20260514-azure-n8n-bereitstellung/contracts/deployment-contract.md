# Contract: Azure n8n Deployment Gate

## Contract Purpose

Dieser Contract beschreibt den Betriebspfad fuer die Azure-Vorbereitung von `n8n.menschlichkeit-oesterreich.at` bis einschliesslich VM-Hardening und Runtime-Basis.

## Scope

### In Scope

- Grant- und Billing-Pruefung
- Single-Main Betriebsmodus
- Azure Resource Group, statische IP, VM und NSG
- Host-Hardening der VM
- Docker Engine und Docker Compose Basis
- EvidenceLog und Restrisiko-Log

### Out of Scope

- DNS-Umschaltung
- HTTPS-Abnahme
- Reverse Proxy
- Produktiver n8n-Container
- Queue-Mode
- Backup-Ausbau ueber die Pflichtplanung hinaus

## Invariants

- Keine produktive Freigabe ohne belastbaren Grant-/Billing-Nachweis.
- Keine Inbound-Ports ausser 22, 80 und 443.
- Kein Root- oder Passwort-Login auf der VM.
- Kein stiller Wechsel weg von Single-Main.
- Keine vertraulichen Secrets in Doku oder Tickets.

## Required Evidence

- Azure-Portal- oder Microsoft-Nachweis zum Grant/Billing-Status
- Dokumentierte Zuständigkeit fuer Kosten und Ressourcenerstellung
- Nachweis der statischen IP und der NSG-Regeln
- Nachweis des Hardening-Status
- Docker- und Compose-Verfuegbarkeit fuer den Deploy-User
- Dokumentiertes Folge-Gate DNS/HTTPS-Abnahme

## Acceptance Gate

Der Contract ist nur erfuellt, wenn alle Invariants eingehalten sind und der EvidenceLog das naechste Gate eindeutig als DNS/HTTPS-Abnahme benennt.
