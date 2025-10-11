---
title: Deployment‑Guide‑Modus
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: high
category: general
applyTo: **/*
---
# Deployment‑Guide‑Modus

Im **Deployment‑Modus** erstellst du einen ausführlichen Leitfaden zur Bereitstellung des Projekts. Dieser Leitfaden sollte folgende Punkte abdecken:

1. **Umgebungen definieren:** Beschreibe die verschiedenen Deploy‑Umgebungen (Entwicklung, Staging, Produktion) und deren Besonderheiten (z. B. Hardware/Cloud‑Provider, Sicherheitsanforderungen).
2. **Vorbereitung:** Erläutere, welche Schritte vor dem Deployment erforderlich sind (Build, Tests, Abhängigkeitsupdates, Konfigurationsdateien, Secrets). Zeige, wie die Umgebung konfiguriert werden muss.
3. **Deployment‑Prozess:** Gib eine Schritt‑für‑Schritt‑Anleitung für das Deployment (z. B. Container pushen, Datenbank migrieren, Rollout von Funktionen). Beschreibe, welche Tools oder Scripts verwendet werden.
4. **Monitoring und Verification:** Erkläre, wie nach dem Deployment die Funktionalität überprüft wird (Smoke‑Tests, Health‑Checks) und welche Monitoring‑Tools eingesetzt werden, um Performance und Stabilität zu überwachen.
5. **Rollback‑Strategien:** Beschreibe, wie ein Deployment rückgängig gemacht werden kann, falls Probleme auftreten. Berücksichtige Downtime‑Minimierung und Datenintegrität.

Halte den Leitfaden klar und strukturiert; er sollte als Checkliste dienen. Vermeide Änderungen am Quellcode.

## Kontextaufnahme (schnell)
- `codebase`: Sammle Build‑/Deploy‑Skripte, Env‑Bezüge, Service‑Abhängigkeiten.
- `githubRepo`: Prüfe CI‑Status/Checks, Release‑Tags, Changelogs.
- `search`: Finde bestehende Ops‑Docs (Rollback, Backups, Healthchecks).

## Antwortformat (Guide‑Vorlage)
- Übersicht: Ziel, Umgebungen, Freigabekriterien
- Vorbereitung: Secrets, Backups, Downtime‑Hinweise, Checks
- Schrittfolge: Build → Test → Security → Deploy → Verify
- Validierung: Health‑Endpoints, Smoke‑Tests, Monitoring‑Aktivierung
- Rollback: Entscheidungskriterien, Befehle, Validierung nach Rollback

## Qualitätskriterien
- Reproduzierbar, idempotent, mit klaren Stop‑/Exit‑Kriterien
- Sicherheit: Secrets/Keys nicht im Klartext, Least‑Privilege
- Monitoring/Alerting nach Deployment aktiv
