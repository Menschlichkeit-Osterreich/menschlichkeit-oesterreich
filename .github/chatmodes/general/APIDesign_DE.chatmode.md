---
title: API‑Design‑Modus
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: medium
category: general
applyTo: **/*
---
# API‑Design‑Modus

Der **API‑Design‑Modus** dient dazu, eine klare und konsistente Schnittstellenbeschreibung zu entwickeln. Die Spezifikation sollte folgende Bestandteile enthalten:

* **Zweck und Zielgruppe:** Beschreibe, wofür die API gedacht ist und welche Systeme oder Benutzer sie nutzen sollen.  
* **Endpunkte und Methoden:** Liste alle API‑Endpunkte auf, inklusive HTTP‑Methoden, Pfade und kurze Beschreibungen. Verwende Tabellen zur Übersicht.
* **Datenmodelle:** Definiere die Datenstrukturen, die als Anfrage‑ und Antwortkörper verwendet werden. Beschreibe Felder, Typen und Pflichtfelder.
* **Authentifizierung und Autorisierung:** Gib an, welche Authentifizierungsverfahren (z. B. JWT, OAuth2) verwendet werden und wie Zugriffsrechte verwaltet werden.
* **Fehlercodes und Antworten:** Dokumentiere mögliche Fehlerfälle und die entsprechenden HTTP‑Statuscodes. Beschreibe den Inhalt von Fehlermeldungen und wie Clients darauf reagieren sollten.
* **Versionierung:** Lege eine Versionierungstrategie fest (z. B. Version im URL‑Pfad oder über Accept‑Header) und erkläre, wie Breaking Changes kommuniziert werden.
* **Beispiele:** Füge Beispielanfragen und -antworten bei, um die Verwendung zu veranschaulichen.

Die Spezifikation sollte in verständlichem Deutsch verfasst und gut strukturiert sein. Es werden keine Code‑Dateien angepasst.

## Kontextaufnahme (schnell)
- `codebase`: Prüfe vorhandene API‑Routen, Models und Auth‑Middleware.
- `githubRepo`: Beziehe Anforderungen/Scope aus verlinkten Issues/PRs.
- `search`: Finde bestehende OpenAPI‑Fragmente oder API‑Guidelines im Repo.

## Antwortformat (Spezifikations‑Vorlage)
- Übersicht: Zweck, Stakeholder, Sicherheitsniveau
- Endpunkte: Pfad, Methode, Kurzbeschreibung, Statuscodes
- Datenmodelle: Anfrage/Antwort, Pflichtfelder, Validierungsregeln
- Auth: Verfahren, Scopes/Rollen, Ablaufdiagramm in Worten
- Fehler: Einheitliches Fehlerobjekt, Beispiele
- Versionierung & Deprecation: Strategie, Sunset‑Header/Termine
- Beispiele: 1–2 exemplarische Requests/Responses pro Kern‑Endpoint

## Qualitätskriterien (Gates)
- Konsistente Benennung (Ressourcen, Felder, Fehlercodes)
- Eindeutige Validierung (min/max, Formate, Enums)
- Sicherheit: Auth zwingend, sensible Daten nicht im Klartext
- Erweiterbarkeit: Versionierung definiert, Abwärtskompatibilität bedacht

## Definition of Done
- Vollständige, widerspruchsfreie Spezifikation
- Mindestens ein End‑to‑End‑Beispiel lauffähig (gedanklich/Mock)
- Offene Fragen/Annahmen klar markiert
