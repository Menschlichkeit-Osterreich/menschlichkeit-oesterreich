---
title: "Codereview"
description: "Prompt für Codereview im Menschlichkeit Österreich Projekt"
lastUpdated: 2025-10-10
status: ACTIVE
category: quality-assurance
tags: ['quality-assurance']
version: "1.0.0"
language: de-AT
audience: ['QA Team', 'Developers']
---

---
description: 'Führt eine gründliche Code-Überprüfung auf Deutsch durch und identifiziert Qualitäts-, Sicherheits- und Performanceprobleme'
mode: 'agent'
tools: ['githubRepo', 'codebase']
---

Überprüfen Sie den gesamten Quellcode des Projekts (#githubRepo) und erstellen Sie einen Bericht auf Deutsch. Identifizieren Sie Probleme in Bezug auf Codequalität, Wartbarkeit, Performance und Sicherheit. Der Bericht sollte folgende Abschnitte enthalten:

1. **Überblick** – Eine Zusammenfassung der Projektstruktur, verwendeten Sprachen und Frameworks.
2. **Kritische Probleme** – Schwere Fehler oder Schwachstellen, die dringend behoben werden müssen, inklusive konkreter Lösungsvorschläge und Verweise auf betroffene Dateien mittels `#file:`-Syntax.
3. **Empfohlene Verbesserungen** – Mittlere Priorität: Möglichkeiten zur Optimierung, Refaktorisierung und Verbesserung des Codes. Fügen Sie Beispielcode bei.
4. **Kleinere Hinweise** – Niedrige Priorität: Stil- und Dokumentationshinweise oder kleinere Optimierungen.
5. **Zusammenfassung** – Gesamteinschätzung der Codebasis und Empfehlungen für die nächsten Schritte.

Nutzen Sie Listen oder Tabellen für eine klare Darstellung und halten Sie die Kommentare präzise. Befolgen Sie bewährte Praktiken der verwendeten Programmiersprachen.
