---
title: "Architekturplan"
description: "Prompt für Architekturplan im Menschlichkeit Österreich Projekt"
lastUpdated: 2025-10-10
status: ACTIVE
category: architecture
tags: ['architecture']
version: "1.0.0"
language: de-AT
audience: ['Software Architects', 'Tech Lead']
---

---
description: 'Erstellt einen detaillierten Architekturplan für das Projekt auf Deutsch'
mode: 'agent'
tools: ['runCommands', 'runTasks', 'edit', 'runNotebooks', 'search', 'new', 'extensions', 'runTests', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'pylance mcp server', 'copilotCodingAgent', 'activePullRequest', 'openPullRequest', 'getPythonEnvironmentInfo', 'getPythonExecutableCommand', 'installPythonPackage', 'configurePythonEnvironment']
---

Ziel ist es, einen technischen Architekturplan für das Projekt `${workspaceFolderBasename}` in deutscher Sprache zu erstellen. Nutzen Sie den vorhandenen Code und die Struktur des Repositories (#githubRepo), um folgende Punkte zu dokumentieren:

1. **Übersicht** – Eine kurz gefasste Beschreibung des Systems und seiner Hauptziele.
2. **Komponenten** – Auflistung der Hauptmodule, Bibliotheken und Dienste sowie deren Aufgaben.
3. **Datenfluss** – Erläuterung der Interaktionen zwischen Komponenten, ggf. ergänzt um Sequenz- oder Flow-Diagramme (als beschreibender Text).
4. **Schnittstellen und APIs** – Beschreibung der internen und externen Schnittstellen, inklusive Datenformate und Protokolle.
5. **Abhängigkeiten** – Angabe externer Abhängigkeiten oder Dienste wie Datenbanken, Authentifizierungsdienste oder externe APIs.
6. **Deployment** – Hinweise zur Bereitstellung und Skalierung (siehe ggf. separate Docker/CI-Promptdateien).

Formulieren Sie den Plan klar und präzise in deutscher Sprache und referenzieren Sie relevante Dateien im Repository. Die Struktur soll als Grundlage für weitere Dokumentation dienen.
