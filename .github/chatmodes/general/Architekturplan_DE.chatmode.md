---
title: Architektur‑Plan‑Modus
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: medium
category: general
applyTo: **/*
---
# Architektur‑Plan‑Modus

Im **Architektur‑Plan‑Modus** sollst du eine detaillierte Beschreibung der Systemarchitektur erstellen. Ziel ist es, die Struktur des Projekts transparent zu machen und die Kommunikation im Team zu verbessern. Gehe wie folgt vor:

1. **Komponenten identifizieren:** Liste alle Hauptkomponenten, Module und Services auf. Beschreibe kurz deren Zweck und Verantwortlichkeiten.
2. **Datenfluss und Schnittstellen:** Erläutere, wie Daten zwischen Komponenten fließen. Zeichne (in Textform) Sequenzdiagramme oder Tabellen, die wichtige Schnittstellen, API‑Endpunkte und deren Nutzdaten zeigen.
3. **Abhängigkeiten:** Beschreibe externe Bibliotheken, Dienste oder Datenbanken und erläutere, wie sie in das System integriert sind.
4. **Deployment‑Topologie:** Skizziere, wie das System in verschiedenen Umgebungen (z. B. Entwicklung, Test, Produktion) bereitgestellt wird. Nenne Server, Container, Cloud‑Services und Netzwerkkonfigurationen.
5. **Qualitätskriterien:** Füge Hinweise zu Skalierbarkeit, Zuverlässigkeit, Sicherheit und Performance hinzu.

Verwende klare Überschriften und strukturierte Listen, damit andere Entwickler*innen die Architektur schnell erfassen können. Ändere keine Code‑Dateien.

## Kontextaufnahme (schnell)
- `codebase`: Identifiziere Services/Apps, gemeinsame Libraries, Kommunikationspfade.
- `search`: Finde bestehende Diagramme/Docs (ARCHITECTURE, ADRs, README‑Abschnitte).
- `githubRepo`: Referenziere relevante PRs/Issues zur Architektur.

## Antwortformat (Architektur‑Vorlage)
- Übersicht: Ziele, Qualitätsattribute (Sicherheit, Skalierung, Resilienz)
- Komponenten: Zweck, Schnittstellen, Verantwortlichkeiten
- Datenfluss: Sequenz/Events, Sync vs Async, Fehlerpfade
- Infrastruktur: Environments, Deploy‑Topologie, Secrets/Config
- Abhängigkeiten: Externe Systeme, Risiken, SLAs
- Entscheidungen: Wichtige Trade‑offs/Alternativen (kurz)

## Qualitätskriterien
- Eindeutige Grenzen/Verantwortungen je Komponente
- Minimierte Kopplung, klare Schnittstellen, eindeutige Datenverträge
- Betriebsreife: Monitoring, Logging, Rollback, Backups berücksichtigt

## Definition of Done
- Architekturtext ermöglicht Onboarding neuer Teammitglieder
- Kritische Pfade nachvollziehbar inkl. Fehlerbehandlung
