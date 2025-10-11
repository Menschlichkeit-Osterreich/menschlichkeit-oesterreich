---
title: "Cipipeline"
description: "Prompt für Cipipeline im Menschlichkeit Österreich Projekt"
lastUpdated: 2025-10-10
status: ACTIVE
category: devops
tags: ['devops']
version: "1.0.0"
language: de-AT
audience: ['DevOps Team']
---

---
description: 'Definiert eine Continuous-Integration-Pipeline in deutscher Sprache'
mode: 'agent'
tools: ['githubRepo', 'codebase']
---

Entwerfen Sie eine CI-Pipeline für das Projekt `${workspaceFolderBasename}`. Die Pipeline sollte in einem gängigen CI-System umgesetzt werden können (z. B. GitHub Actions, GitLab CI, Jenkins). Beschreiben Sie auf Deutsch:

1. **Trigger** – Wann die Pipeline ausgeführt wird (bei Pull-Requests, Push auf bestimmte Branches, Nightly Builds).
2. **Build** – Schritte zum Bauen der Software und Installieren der Abhängigkeiten.
3. **Tests** – Ausführen der automatisierten Tests und Umgang mit dem Ergebnis.
4. **Linting/Analyse** – Ausführen von Linter, statischer Codeanalyse oder Security-Scans.
5. **Artefakte** – Erstellen und Speichern von Build-Artefakten (z. B. Binärdateien, Docker-Images).
6. **Benachrichtigungen** – Wie Entwickler über Fehler oder Erfolge informiert werden (z. B. via E-Mail, Chat-Integrationen).
7. **Beispielkonfiguration** – Geben Sie eine Beispiel-Pipeline in YAML-Form an, etwa für GitHub Actions (`.github/workflows/ci.yml`), die die oben genannten Schritte implementiert.

Verweisen Sie auf vorhandene Projektdateien und passen Sie die Pipeline an die Projektstruktur an.
