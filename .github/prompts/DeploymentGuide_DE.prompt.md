---
title: 'Deploymentguide'
description: 'Prompt für Deploymentguide im Menschlichkeit Österreich Projekt'
lastUpdated: 2026-03-31
status: DEPRECATED
deprecatedDate: 2025-10-08
migrationTarget: .github/chatmodes/general/DeploymentGuide_DE.chatmode.md
category: deployment
tags: ['deployment']
version: '1.0.0'
language: de-AT
audience: ['DevOps Team', 'Release Managers']
---

> **DEPRECATED** — Migriert nach `.github/chatmodes/general/DeploymentGuide_DE.chatmode.md`. Diese Datei bleibt nur als Referenz erhalten.

Schreiben Sie einen umfassenden Bereitstellungs-Leitfaden (Deployment Guide) für das Projekt `${workspaceFolderBasename}` in deutscher Sprache. Der Leitfaden soll erklären:

- **Umgebungen** – Beschreibung der verschiedenen Bereitstellungsumgebungen (Entwicklung, Test, Staging, Produktion) und deren Unterschiede.
- **Vorbereitung** – Schritte zur Vorbereitung eines Releases: Versionsnummern, Changelog, Abhängigkeiten und Migrationen.
- **Deployment-Prozess** – Schritt-für-Schritt-Anleitung zum Ausrollen der Anwendung (z. B. Build erstellen, Datenbank migrieren, Dienste neu starten). Beschreiben Sie auch Rollback-Möglichkeiten.
- **Monitoring** – Empfehlungen für das Überwachen der Anwendung nach dem Release (Metriken, Logs, Alerts).
- **Dokumentation** – Verweise auf weitere technische Dokumente und Scripts, die den Bereitstellungsprozess unterstützen (z. B. in `scripts/deploy.sh`).

Formulieren Sie den Leitfaden so, dass er für DevOps-Teams leicht nachvollziehbar ist und sowohl manuelle als auch automatisierte Deployment-Szenarien abdeckt.
