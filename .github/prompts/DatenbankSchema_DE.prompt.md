---
title: "Datenbankschema"
description: "Prompt für Datenbankschema im Menschlichkeit Österreich Projekt"
lastUpdated: 2025-10-10
status: ACTIVE
category: database
tags: ['database']
version: "1.0.0"
language: de-AT
audience: ['Backend Team', 'Database Administrators']
---

---
description: 'Erstellt ein Datenbankschema und -modellierung auf Deutsch'
mode: 'ask'
tools: ['githubRepo']
---

Entwickeln Sie ein Datenbankschema für das Projekt `${workspaceFolderBasename}`. Analysieren Sie die Anforderungen anhand des vorhandenen Codes (#githubRepo) und formulieren Sie auf Deutsch:

* **Domänenmodell** – Beschreibung der wichtigsten Entitäten und deren Beziehungen.
* **Tabellenstruktur** – Angabe der Tabellen mit Spalten, Datentypen, Primär- und Fremdschlüsseln.
* **Normalisierung** – Hinweise zur Normalform, um Redundanz zu vermeiden und Konsistenz zu gewährleisten.
* **Indizes und Performance** – Empfehlungen zu Indizes und anderen Performance-Optimierungen.
* **Migrationen** – Hinweise zur Erstellung von Datenbankmigrationen für zukünftige Änderungen.

Stellen Sie das Schema in Tabellenform dar und erläutern Sie designrelevante Entscheidungen in deutscher Sprache.
