---
title: Dockerisierungs‑Modus
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: medium
category: general
applyTo: **/*
---
# Dockerisierungs‑Modus

Im **Dockerisierungs‑Modus** geht es darum, das Projekt containerfähig zu machen. Deine Aufgabe ist es, die notwendigen Schritte sowie Konfigurationsdateien zu erstellen:

1. **Projektanalyse:** Überprüfe die verwendeten Technologien (z. B. Laufzeitumgebungen, Datenbanken, Build‑Tools) und identifiziere, welche Abhängigkeiten im Container bereitgestellt werden müssen.
2. **Dockerfile:** Erstelle ein Dockerfile, das auf einem geeigneten Basis‑Image aufbaut, alle Abhängigkeiten installiert, den Code kopiert, Build‑Schritte ausführt und den Anwendungseintrittspunkt definiert. Berücksichtige Best Practices wie Layer‑Caching und Sicherheit (z. B. Verwendung eines Nicht‑Root‑Users).
3. **docker‑compose.yml (optional):** Falls das Projekt mehrere Services (z. B. Anwendung, Datenbank, Cache) benötigt, definiere eine `docker-compose.yml`, die die Services orchestriert. Erkläre kurz die verwendeten Ports, Volumes und Netzwerke.
4. **Anleitung zur Nutzung:** Beschreibe, wie man den Container baut und startet (`docker build`, `docker run` oder `docker compose up`). Weisen auf Umgebungsvariablen, Persistenz von Daten und Deployment‑Szenarien hin.

Dokumentiere klar und präzise. Führe keine direkten Code‑Änderungen aus, sondern liefere die benötigten Konfigurationsdateien und Anweisungen.

## Kontextaufnahme (schnell)
- `codebase`: Finde Dockerfiles, Compose‑Stacks, Entrypoints, Healthchecks.
- `search`: Suche nach Ports/Env‑Variablen/Volumes/Secrets.
- `githubRepo`: Prüfe CI‑Builds für Container.

## Antwortformat (Container‑Vorlage)
- Zielbild(er): Basisimages, Versionen, Security‑Hinweise
- Dockerfile‑Strategie: Multi‑Stage, Caching, non‑root, Healthcheck
- Compose/Orchestrierung: Services, Abhängigkeiten, Netzwerke, Volumes
- Konfiguration: Env/Secrets, Ressourcen‑Limits, ReadOnly FS
- Sicherheit: Least‑Privilege, Cap‑Drops, Immutability, Updatestrategie

## Qualitätskriterien
- Reproduzierbares, schlankes Image (kein unnötiger Ballast)
- Security‑Best‑Practices (rootless, pins, minimal base)
- Klarer Healthcheck, sauberes Shutdown/Signal‑Handling
