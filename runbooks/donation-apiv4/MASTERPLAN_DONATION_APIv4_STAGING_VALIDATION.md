# VOLLSTÄNDIGER MASTERPLAN

# Menschlichkeit Österreich - Donation APIv4 / n8n / CiviCRM / Staging Validation

## Technischer, operativer und strategischer Gesamtplan mit vollständigem Projektstand

**Version:** Master Consolidated Plan v1.0
**Datum:** 12.05.2026
**Status:** VERBINDLICH
**Projektzustand:** `PRE-VALIDATION / STAGING PENDING`

---

# 0. META-STATUS

## Offizieller Gesamtstatus

```text
DONATION APIv4 REFACTOR:
FROZEN

CURRENT PHASE:
PRE-VALIDATION

CURRENT BLOCKER:
STAGING ACCESS + SECRET MAPPING

LOCAL ENVIRONMENT:
NON-AUTHORITATIVE

NEXT ALLOWED ACTION:
STAGING ACCESS VALIDATION

GOAL:
VALIDATED END-TO-END DONATION PIPELINE
```

---

# 1. GESAMTVISION

Das Ziel des Projekts ist der Aufbau einer vollständig validierten, sicheren, reproduzierbaren und wartbaren Donation-Infrastruktur für Menschlichkeit Österreich.

Die Plattform soll:

* Donations entgegennehmen
* validieren
* orchestrieren
* verarbeiten
* an CiviCRM weiterleiten
* Receipt-Entscheidungen treffen
* revisionssicher dokumentieren
* staging-validiert sein
* später produktionsfähig werden

---

# 2. STRATEGISCHE ZIELE

# 2.1 Hauptziel

Errichtung einer autoritativ validierten Donation-Pipeline.

---

# 2.2 Nebenziele

## Technisch

* stabile API-Struktur
* sichere Secrets
* reproduzierbare Tests
* deterministische Workflows
* isolierte Infrastruktur
* nachvollziehbare Fehler

## Organisatorisch

* auditierbare Prozesse
* reproduzierbare Deployments
* kein Wildwuchs
* kein lokales Shadow-Debugging
* klare Verantwortlichkeiten

---

# 3. SYSTEMLANDSCHAFT

# 3.1 Komponentenübersicht

```text
[DONOR / FRONTEND]
        |
        v
[DONATION APIv4]
        |
        v
[n8n STAGING]
        |
        |-- Validation Layer
        |-- Receipt Logic
        |-- Workflow Routing
        |-- Error Handling
        |
        v
[CiviCRM STAGING]
        |
        v
[Donation Persistence]
```

---

# 4. ARCHITEKTURDETAILS

# 4.1 Donation APIv4

## Rolle

* zentraler Request Entry Point
* Input Validation
* Payload Normalisierung
* Security Layer
* Übergabe an n8n

---

## Verantwortlichkeiten

### Pflicht

* Request Parsing
* JSON Validation
* Auth Headers
* Error Codes
* Logging
* HTTP Response Handling

### Nicht erlaubt

* Business Logic
* Receipt Decisioning
* CRM Logic
* State Persistence

---

## Status

```text
CODE COMPLETE
REFROZEN
NO FURTHER REFACTOR ALLOWED
```

---

# 4.2 n8n Layer

## Rolle

Workflow-Orchestrator.

---

## Verantwortlichkeiten

* Business Rules
* Receipt Eligibility
* Routing
* Retry Logic
* Transformation
* CRM Calls
* Workflow Execution
* Error Routing

---

## Status

```text
STAGING ACCESS UNVERIFIED
UI ACCESS UNCLEAR
API KEY STATUS UNKNOWN
```

---

# 4.3 CiviCRM

## Rolle

System of Record.

---

## Verantwortlichkeiten

* Donation Persistence
* Contact Storage
* Receipt Metadata
* Reporting Base
* Donor Tracking

---

## Status

```text
AUTH STATUS UNVERIFIED
STAGING CONNECTIVITY UNKNOWN
```

---

# 4.4 Auth Layer

## Rolle

* API Authentication
* Secret Validation
* Internal Security

---

## Komponenten

```text
N8N_API_KEY
CIVICRM_STAGING_KEY
N8N_WEBHOOK_SECRET
API_INTERNAL_SECRET
```

---

# 5. AKTUELLER ENTWICKLUNGSSTAND

# 5.1 Was abgeschlossen ist

## Donation APIv4

### Wahrscheinlich vorhanden

* API Endpoints
* Request Handling
* JSON Parsing
* Workflow Triggering
* Basic Validation
* Integration Hooks

---

## Lokale Infrastruktur

### Vorhanden

* lokaler n8n Container
* lokale Tests
* Debugging
* Smoke-Test-Struktur

---

# 5.2 Was NICHT abgeschlossen ist

## Kritisch offen

* autoritative Staging-Validierung
* echte End-to-End-Ausführung
* echte Secret-Validierung
* echte CiviCRM-Kommunikation
* dokumentierte Response-Kette

---

# 6. WICHTIGSTE ARCHITEKTURREGEL

# DER LOKALE CONTAINER IST NICHT AUTORITATIV

Das ist die wichtigste Regel des gesamten Projekts.

---

## Bedeutet konkret

Lokale Erfolge zählen NICHT als:

* Validierung
* Nachweis
* Produktionsfähigkeit
* Integrationserfolg

---

## Lokale Tests sind nur:

* Vorbereitung
* Syntaxprüfung
* Vorvalidierung
* Entwicklerhilfe

---

# 7. AKTUELLER BLOCKER-STACK

# BLOCKER 1 — STAGING URL

## Problem

Die echte n8n Staging URL ist nicht belastbar dokumentiert.

---

## Auswirkungen

* keine echte Verbindung
* kein echter Smoke-Test
* keine Webhook-Ziele
* keine API-Validierung

---

## Benötigt

```text
N8N_BASE_URL
```

---

# BLOCKER 2 — n8n UI ACCESS

## Problem

Kein bestätigter Zugriff auf:

* Dashboard
* Workflows
* Executions
* API Settings
* Logs

---

## Auswirkungen

* keine Diagnose
* keine Key-Erstellung
* keine Validierung

---

## Benötigt

* Login
* Rolle
* Rechte
* Zugriff

---

# BLOCKER 3 — API KEY

## Problem

N8N_API_KEY nicht bestätigt.

---

## Benötigt

In n8n:

```text
Settings
→ API
→ Create API Key
```

---

# BLOCKER 4 — SECRET MAPPING

## Pflicht

```text
N8N_API_KEY
CIVICRM_STAGING_KEY
```

---

## Optional

```text
N8N_WEBHOOK_SECRET
API_INTERNAL_SECRET
```

---

# BLOCKER 5 — AUTORITATIVE TESTKETTE FEHLT

## Problem

Keine bestätigte vollständige Pipeline:

```text
Donation APIv4
→ n8n
→ CiviCRM
→ Response
```

---

# 8. VERBOTENE AKTIVITÄTEN

# BIS ZUR STAGING VALIDIERUNG VERBOTEN

## Architektur

* neue Komponenten
* neue Services
* neue APIs

---

## Workflow

* Node Refactors
* Strukturänderungen
* neue Routinglogik

---

## Sicherheit

* neue Secret-Systeme
* lokale Bypasses
* Hardcoded Keys

---

## Entwicklung

* Scope Expansion
* neue Features
* Optimierungsrefactors

---

# 9. SMOKE-TEST MASTERPLAN

# 9.1 Ziel

Nachweis einer echten funktionierenden End-to-End-Kette.

---

# 9.2 Datei

```text
automation/n8n/smoke-test-donation.py
```

---

# 9.3 Erwartete Funktionen

## Der Test MUSS prüfen:

### Connectivity

* n8n erreichbar
* TLS funktioniert
* API erreichbar

---

### Auth

* API Key akzeptiert
* Secrets korrekt geladen

---

### Workflow

* Workflow startet
* Workflow endet erfolgreich

---

### CRM

* CiviCRM erreichbar
* Daten akzeptiert

---

### Receipt Eligibility

## Fall A

```json
{
  "receipt_eligible": true
}
```

## Fall B

```json
{
  "receipt_eligible": false
}
```

---

# 9.4 Pflichtoutputs

## Dokumentiert werden MUSS:

* Request Headers
* Request Body
* Response Body
* Statuscodes
* Workflow-ID
* Execution-ID
* Fehlerfälle
* Timing
* Logs

---

# 10. GO-KRITERIEN

# ABSOLUT VERBINDLICH

## Pflicht 1

```text
Exit Code 0
```

---

## Pflicht 2

Beide Receipt-Fälle erfolgreich.

---

## Pflicht 3

Echte Staging-Kommunikation.

---

## Pflicht 4

Secrets validiert.

---

## Pflicht 5

Keine lokalen Mock-Bypasses.

---

## Pflicht 6

Dokumentierte Responses.

---

# 11. FEHLERKLASSIFIKATION

# Klasse A — Infrastruktur

## Beispiele

* DNS Fehler
* TLS Fehler
* URL falsch
* Server nicht erreichbar

---

# Klasse B — Auth

## Beispiele

* API Key invalid
* Secret fehlt
* 401
* 403

---

# Klasse C — Workflow

## Beispiele

* Node Failure
* Missing Mapping
* Invalid Transform
* Runtime Errors

---

# Klasse D — CRM

## Beispiele

* CiviCRM auth fail
* invalid contact
* invalid payload

---

# Klasse E — Business Logic

## Beispiele

* receipt falsch
* routing falsch
* donation type invalid

---

# 12. VERBINDLICHE NÄCHSTE PHASEN

# PHASE 1 — STAGING DISCOVERY

## Ziel

Autoritative Infrastruktur identifizieren.

---

## Aufgaben

### Pflicht

* N8N_BASE_URL beschaffen
* UI Zugang validieren
* API Zugang prüfen

---

# PHASE 2 — SECRET VALIDATION

## Ziel

Alle Pflicht-Secrets validieren.

---

## Reihenfolge

### 1

N8N_API_KEY

### 2

CIVICRM_STAGING_KEY

### 3

Webhook Secret optional

### 4

Internal Secret optional

---

# PHASE 3 — CONNECTIVITY TEST

## Ziel

API Erreichbarkeit.

---

## Prüfungen

* DNS
* TLS
* HTTP
* Auth

---

# PHASE 4 — END-TO-END TEST

## Ziel

Komplette Donation-Verarbeitung.

---

# PHASE 5 — DOCUMENTATION

## Ziel

Revisionssichere Nachvollziehbarkeit.

---

# PHASE 6 — VALIDATION DECISION

## Nur erlaubt wenn:

* Smoke-Test erfolgreich
* alle Kriterien erfüllt
* keine offenen Blocker

---

# 13. STATUSMODELL

# Zulässige Statuswerte

---

## BLOCKED_MISSING_STAGING_ACCESS

Bedeutung:

```text
URL/UI/API fehlt
```

---

## BLOCKED_MISSING_SECRET_MAPPING

Bedeutung:

```text
Secrets fehlen
```

---

## READY_FOR_STAGING_SMOKE_TEST

Bedeutung:

```text
Alles vorbereitet
```

---

## STAGING_VALIDATED

Bedeutung:

```text
Smoke-Test erfolgreich
```

---

## READY_FOR_PRODUCTION_PREP

Bedeutung:

```text
Produktionsvorbereitung erlaubt
```

---

# 14. PRODUKTIONSKRITERIEN (NOCH NICHT ERREICHT)

# Für spätere Phase

## Pflicht

* stabile Staging-Läufe
* reproduzierbare Ergebnisse
* dokumentierte Deployments
* Secret Rotation
* Monitoring
* Logging
* Error Recovery

---

# 15. RISIKOANALYSE

| Risiko                 | Severity | Auswirkung          |
| ---------------------- | -------- | ------------------- |
| fehlende Staging URL   | KRITISCH | Projektstillstand   |
| fehlende Secrets       | KRITISCH | keine Auth          |
| weitere Refactors      | KRITISCH | Instabilität        |
| lokale Bypasses        | KRITISCH | falsche Validierung |
| fehlende Dokumentation | HOCH     | nicht auditierbar   |
| fehlende Logs          | HOCH     | keine Diagnose      |
| falsche Receipt Logic  | HOCH     | Compliance Risiko   |

---

# 16. TECHNISCHE SCHULDEN

# Bereits sichtbar

## Wahrscheinlich vorhanden

* lokale Debug-Patches
* inkonsistente Configs
* unklare Secret-Herkunft
* nicht zentralisierte Dokumentation

---

# Risiko

Diese Schulden dürfen NICHT jetzt refactored werden.

Erst:

```text
STAGING VALIDATION
DANN
CONTROLLED CLEANUP
```

---

# 17. DEPLOYMENT-POLITIK

# Aktuell VERBOTEN

## Kein Production Deployment

Bis:

* Staging validiert
* Smoke-Test bestanden
* Dokumentation abgeschlossen

---

# 18. GOVERNANCE-REGELN

# Jede Änderung MUSS:

* dokumentiert sein
* reproduzierbar sein
* nachvollziehbar sein
* staging-validiert sein

---

# Keine Shadow-Änderungen

Nicht erlaubt:

* ad hoc patches
* lokale Speziallösungen
* undocumented fixes

---

# 19. OPERATIVE REALITÄT

# Wichtigste Erkenntnis

Das Projektproblem ist derzeit NICHT primär:

```text
CODE
```

sondern:

```text
INFRASTRUKTUR + AUTORITÄT + ZUGRIFF
```

---

# 20. MANAGEMENT-FAZIT

# Der tatsächliche Projektzustand lautet:

## Entwicklung:

```text
WEITGEHEND ABGESCHLOSSEN
```

---

## Validierung:

```text
NICHT ABGESCHLOSSEN
```

---

## Infrastruktur:

```text
UNVOLLSTÄNDIG
```

---

## Kritischer Engpass:

```text
STAGING ACCESS + SECRET MAPPING
```

---

# 21. ABSOLUT VERBINDLICHE PROJEKTREGEL

# KEIN WEITERER REFACTOR

# BIS

# EIN ECHTER STAGING SMOKE-TEST

# MIT EXIT CODE 0

# DOKUMENTIERT ERFOLGREICH WAR

---

# 22. FINALER OFFIZIELLER STATUS

```text
PROJECT:
DONATION APIv4 / n8n Donation Pilot

STATE:
PRE-VALIDATION / STAGING PENDING

LOCAL ENVIRONMENT:
NON-AUTHORITATIVE

BLOCKERS:
- MISSING N8N_BASE_URL
- MISSING/UNCLEAR N8N UI ACCESS
- MISSING/UNCLEAR N8N_API_KEY
- INCOMPLETE SECRET MAPPING
- NO AUTHORITATIVE E2E VALIDATION

NEXT REQUIRED ACTION:
STAGING ACCESS + SECRET VALIDATION

NEXT ALLOWED STATE:
READY_FOR_STAGING_SMOKE_TEST
```
