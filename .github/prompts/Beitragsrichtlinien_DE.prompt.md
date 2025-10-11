---
title: "Beitragsrichtlinien"
description: "Prompt für Beitragsrichtlinien im Menschlichkeit Österreich Projekt"
lastUpdated: 2025-10-10
status: ACTIVE
category: governance
tags: ['governance']
version: "1.0.0"
language: de-AT
audience: ['Vereinsvorstand', 'Compliance']
---

---
description: 'Erstellt verbindliche Beitragsrichtlinien (CONTRIBUTING) auf Deutsch'
mode: 'agent'
tools: ['runCommands', 'runTasks', 'edit', 'runNotebooks', 'search', 'new', 'extensions', 'runTests', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'pylance mcp server', 'copilotCodingAgent', 'activePullRequest', 'openPullRequest', 'getPythonEnvironmentInfo', 'getPythonExecutableCommand', 'installPythonPackage', 'configurePythonEnvironment']
---

Generieren Sie ein Dokument `CONTRIBUTING.md` in deutscher Sprache, das die Beitragsrichtlinien für das Projekt `${workspaceFolderBasename}` definiert. Es sollte folgende Punkte umfassen:

* **Verhaltenskodex** – Kurzer Hinweis auf den Verhaltenskodex (Code of Conduct) des Projekts.
* **Wie man mitwirkt** – Erläuterung, wie man Fehler meldet, Feature-Vorschläge einreicht und Pull-Requests erstellt.
* **Branch-Naming-Konventionen** – Regeln für die Benennung von Branches (z. B. `feature/…`, `fix/…`).
* **Commit-Richtlinien** – Format für Commit-Nachrichten (z. B. imperativ, Kurzbeschreibung, Body, Footer) und Verwendung von Tags wie `feat`, `fix`, `docs`.
* **Code-Stil** – Verweis auf bestehende Styleguides oder Linter-Konfigurationen; Hinweise zu Testabdeckung und Dokumentation.
* **Prüfprozesse** – Beschreibung des Review-Prozesses: Anforderungen an Pull-Requests, Ablauf der Code-Reviews, und wie Feedback eingearbeitet wird.
* **Lokale Entwicklung** – Kurze Anleitung zum Einrichten und Ausführen lokaler Tests.

Formulieren Sie alle Anweisungen klar und verständlich auf Deutsch, sodass neue Mitwirkende den Prozess leicht nachvollziehen können.
