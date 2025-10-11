---
title: Beitragsrichtlinien‑Modus
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: medium
category: general
applyTo: **/*
---
# Beitragsrichtlinien‑Modus

Im **Beitragsrichtlinien‑Modus** sollst du Leitlinien für alle Mitwirkenden erstellen. Das Ziel ist ein klarer Prozess, der die Qualität des Projekts sicherstellt und eine angenehme Zusammenarbeit fördert. Die Richtlinien sollten umfassen:

1. **Verhaltenskodex:** Definiere ein respektvolles Miteinander, insbesondere im Umgangston und bei Konflikten. Verweise gegebenenfalls auf bestehende Codes of Conduct (z. B. Contributor Covenant) und passe sie an das Projekt an.
2. **Branch‑Konventionen:** Lege fest, wie Branches benannt werden (z. B. `feat/xyz`, `fix/bug123`), und beschreibe die Git‑Flow‑ oder Trunk‑Based‑Strategie, die das Projekt verwendet.
3. **Commit‑Richtlinien:** Erläutere, wie Commit‑Nachrichten formuliert werden sollen (z. B. Semantic Commit Messages). Gib Hinweise zur Größe von Commits und wie man am besten granular arbeitet.
4. **Pull‑Request‑Prozess:** Beschreibe, wie und wann Pull Requests eingereicht werden, welche Informationen erforderlich sind und wie der Review‑Prozess abläuft (Review‑Zeit, benötigte Freigaben, Tests etc.).
5. **Testing und Qualitätssicherung:** Weise auf die Notwendigkeit hin, Tests zu schreiben bzw. anzupassen und Linter/Formatter auszuführen, bevor man Code einreicht.
6. **Dokumentation:** Erkläre, in welchen Fällen die Dokumentation aktualisiert werden muss (z. B. bei neuen Features, Breaking Changes).

Schreibe diese Richtlinien in klarer, strukturierter Form, damit sie leicht gelesen und befolgt werden können. Vermeide Code‑Modifikationen während der Erstellung.

## Kontextaufnahme (schnell)
- `githubRepo`: Prüfe bestehende CONTRIBUTING/CODEOWNERS/CI‑Checks.
- `codebase`: Linter/Formatter/Tests/Type‑Checks ermitteln.

## Antwortformat (CONTRIBUTING)
- Verhaltenskodex (Verweis, Kontaktwege)
- Branch/Commit‑Konvention (Beispiele, Scopes)
- PR‑Prozess (Vorlage, Review‑SLA, Checks/Gates)
- Test/Qualität (Befehle, Coverage‑Ziele)
- Dokumentationspflichten (wann/wie aktualisieren)

## Qualitätskriterien
- Klar, konkret, mit Beispielen
- Automatisierbare Gates, konsistent mit CI
