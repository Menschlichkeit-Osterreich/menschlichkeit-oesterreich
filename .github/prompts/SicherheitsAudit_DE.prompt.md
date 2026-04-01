---
title: 'Sicherheitsaudit'
description: 'Prompt für Sicherheitsaudit im Menschlichkeit Österreich Projekt'
lastUpdated: 2026-03-31
status: DEPRECATED
deprecatedDate: 2025-10-08
migrationTarget: .github/chatmodes/general/SicherheitsAudit_DE.chatmode.md
category: security
tags: ['security']
version: '1.0.0'
language: de-AT
audience: ['Security Team', 'DevOps']
---

> **DEPRECATED** — Migriert nach `.github/chatmodes/general/SicherheitsAudit_DE.chatmode.md`. Diese Datei bleibt nur als Referenz erhalten.

---

description: 'Führt eine Sicherheitsüberprüfung des Projekts durch und erstellt einen Bericht auf Deutsch'
mode: 'agent'
tools: ['githubRepo', 'codebase']

---

Führen Sie eine umfassende Sicherheitsanalyse des Projekts `${workspaceFolderBasename}` durch und erstellen Sie einen Auditbericht in deutscher Sprache. Der Bericht sollte folgende Teile enthalten:

- **Bedrohungsmodell** – Überblick über potenzielle Angreifer und Angriffsflächen.
- **Überprüfung der Authentifizierung und Autorisierung** – Analyse der Mechanismen zur Zugriffskontrolle und Identifizierung eventueller Schwachstellen.
- **Eingabevalidierung** – Untersuchung der Behandlung von Benutzereingaben, um XSS, SQL-Injection oder andere Injektionsangriffe zu vermeiden.
- **Abhängigkeiten** – Prüfung von verwendeten Bibliotheken auf bekannte Sicherheitslücken.
- **Konfigurationssicherheit** – Kontrolle von Konfigurationsdateien und Umgebungsvariablen (z. B. Geheimnisse in Versionierung).
- **Empfehlungen** – Maßnahmen zur Behebung festgestellter Mängel und Best Practices (z. B. Nutzung von HTTPS, Rate Limiting).

Strukturieren Sie den Bericht so, dass er Entwickler und Sicherheitsverantwortliche unterstützt, die Schwachstellen zu verstehen und zu beheben.
