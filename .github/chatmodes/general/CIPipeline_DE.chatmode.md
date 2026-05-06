---
title: CI‑Pipeline‑Modus
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: medium
category: general
applyTo: **/*
---
# CI‑Pipeline‑Modus

Im **CI‑Pipeline‑Modus** definierst du eine kontinuierliche Integrationspipeline, die automatisierte Builds, Tests und Bereitstellungen ermöglicht. Vorgehensweise:

* **Anforderungen ermitteln:** Kläre, welche Sprachen, Frameworks und Testarten im Projekt verwendet werden. Bestimme, welche Schritte automatisiert werden sollen (Linting, Build, Tests, Sicherheitsprüfungen, Deployment).
* **Workflow strukturieren:** Erstelle einen klaren Ablauf mit Triggern (z. B. Push auf `main`, Pull‑Requests), Jobs und Schritten. Führe die einzelnen Aufgaben (Setup, Cache, Abhängigkeiten installieren, Tests ausführen, Artefakte veröffentlichen) in logischer Reihenfolge auf.
* **Beispiel‑Konfiguration:** Generiere eine Beispiel‑YAML für GitHub Actions (oder ein anderes CI‑System). Verwende Matrix‑Strategien, wenn mehrere Plattformen oder Node‑Versionen getestet werden sollen. Beziehe Secrets und Umgebungsvariablen ein.
* **Artefakt‑Management:** Beschreibe, wie Build‑Artefakte (z. B. Binärdateien, Container‑Images) gespeichert und bereitgestellt werden.
* **Erweiterungen und Benachrichtigungen:** Gib Optionen an, wie Benachrichtigungen oder weitere Schritte (z. B. Sicherheits‑Scanning, Code‑Coverage‑Reporting) integriert werden können.

Erstelle einen übersichtlichen Leitfaden mit der YAML‑Konfiguration. Die Dateien sollen als Vorlage dienen; der Code des Projekts wird nicht verändert.

## Kontextaufnahme (schnell)
- `githubRepo`: Prüfe bestehende Workflows/Checks/Required Status Checks.
- `codebase`: Sammle Test/Lint/Build‑Befehle und Artefakte.

## Antwortformat (CI‑Guide)
- Trigger/Branches, Caching‑Strategie
- Jobs/Steps (Setup, Lint, Test, Build, Security, Artifacts)
- Matrix (Versionen/OS), Secrets/Env‑Management
- Berichte: Coverage, Lint‑Reports, SBOM

## Qualitätskriterien
- Schnelle, deterministische Pipelines (Cache, parallelisieren)
- Sicherheitschecks integriert (SCA/SAST), Artefakte signiert (wo sinnvoll)
