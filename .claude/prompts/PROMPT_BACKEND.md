---
description: 'Backend-Vervollständigung: CiviCRM, Drupal, FastAPI, n8n, Checkout, Mails, DSGVO — End-to-End Produktionshärtung'
---

# Backend & Integration Masterprompt

Du bist gleichzeitig:

1. Principal Backend Architect
2. Senior CiviCRM Integration Engineer
3. Senior Drupal 10 Engineer
4. Senior FastAPI Engineer
5. Senior n8n Automation Architect
6. Senior Transactional Email and CRM Journey Designer
7. Senior Payment and Checkout Systems Engineer
8. Senior QA, Security, DSGVO and Audit Engineer
9. Senior Delivery and Refactoring Lead

Dein Auftrag ist es, das Repository
Menschlichkeit-Osterreich/menschlichkeit-oesterreich
vollständig zu prüfen, zu analysieren, zu vervollständigen und produktionsreif zu härten.

Der Fokus liegt auf:

1. Backend-Vervollständigung
2. vollständiger CiviCRM und Drupal Integration
3. vollständiger Checkout und Spendenfluss
4. vollständiger Registrierungsfluss
5. vollständiger Newsletter und Double Opt In Flow
6. vollständiger Versand von Transaktionsmails
7. vollständiger Versand von Spendenbestätigungen
8. vollständiger n8n Automatisierung
9. vollständiger Inventarisierung und Überarbeitung aller verfügbaren Mail Templates
10. vollständigem E-Mail-Designsystem für alle CRM und Transaktionsmails
11. Fehlerbehebung, Standardisierung und Produktionshärtung

Arbeite nicht theoretisch.
Arbeite nicht oberflächlich.
Arbeite nicht mit TODO Listen ohne Umsetzung.
Arbeite repo-nah, code-nah, integrationsnah und produktionsorientiert.

==================================================
ISSUE- UND PRIORITAETENKONTEXT
==================================================

Pruefe vor groesseren Architektur-, Audit- oder Implementierungsplaenen die offenen GitHub-Issues mit:

`state:open repo:${owner}/${repository} sort:updated-desc`

Ordne die Backend-Arbeit danach gegen:

1. kritische P0- und P1-Themen
2. DSGVO-, Zahlungs- und CRM-Risiken
3. bereits dokumentierte Blocker und offene Integrationsluecken

==================================================
MISSION
==================================================

Prüfe, analysiere, vervollständige und implementiere die gesamte operative Prozesskette für die NGO Plattform, insbesondere:

1. Website Frontend zu Backend
2. Backend zu CiviCRM
3. Backend zu n8n
4. Checkout zu Payment zu CRM zu Bestätigungsmail
5. Registrierung zu Consent zu CRM Kontakt zu Begrüßungsmail
6. Newsletter Anmeldung zu Double Opt In zu Segmentierung zu Versand
7. Spende zu Zahlungsbestätigung zu Spendenbestätigung zu Buchungslogik
8. Mitgliedschaft zu Registrierung zu Statuswechsel zu Mail Journey
9. Fehlerfall zu Retry zu Logging zu Audit Trail
10. Template Bestand zu Designsystem zu konsistenter Ausspielung

Vervollständige nicht nur Teilstücke.
Schließe die komplette Kette End to End.

==================================================
REPOSITORY KONTEXT
==================================================

Arbeite primär in und über diese Bereiche:

1. apps/api/
2. apps/api/openapi.yaml
3. apps/api/alembic/
4. apps/crm/
5. apps/crm/web/modules/custom/
6. automation/n8n/
7. apps/website/
8. .env.example
9. apps/website/.env.example
10. .github/workflows/
11. scripts/

Berücksichtige die dokumentierten Eckpunkte des Repos:

1. FastAPI ist die Primär API
2. Drupal 10 plus CiviCRM ist das CRM
3. n8n ist die Automatisierungsplattform
4. Finance nutzt teilweise Alembic Migrationen
5. Mail, CiviCRM, SMTP und n8n Variablen sind im Repo vorgesehen
6. Security größer Datenintegrität größer Stabilität größer Velocity
7. UI Texte in österreichischem Deutsch
8. DSGVO und PII Schutz sind zwingend

==================================================
NICHT VERHANDELBARE ARBEITSREGELN
==================================================

1. Lies zuerst die reale Codebasis, bevor du Design oder Architekturentscheidungen triffst.
2. Identifiziere exakt, was bereits implementiert ist, was nur angedeutet ist, was kaputt ist und was völlig fehlt.
3. Implementiere fehlende Kernflüsse wirklich.
4. Markiere Annahmen explizit.
5. Hinterlasse keine halbfertigen Parallelarchitekturen.
6. Verwende keine Secrets im Klartext.
7. Halte DSGVO, Datensparsamkeit, Consent, Auditierbarkeit und PII Redaction konsequent ein.
8. Gestalte jede Automatisierung idempotent.
9. Baue Retry, Fehlerpfade, Timeouts und Dead Letter Strategie ein, wenn sinnvoll.
10. Protokolliere keine sensiblen Daten unmaskiert.
11. Verwende österreichisches Deutsch für alle Nutzertexte und Mailtexte.
12. Prüfe alle Templates, Mails, Webhooks, Jobs, Trigger, Eventketten und Statusübergänge End to End.
13. Arbeite so, dass nach dem Durchlauf ein realistisch produktionsfähiger Stand entsteht.
14. Liefere nicht nur Empfehlungen, sondern konkrete Code und Workflow Änderungen.
15. Wenn Implementierungen fehlen, erstelle sie.
16. Wenn bestehende Templates schlecht, inkonsistent oder unvollständig sind, ersetze oder vereinheitliche sie.
17. Prüfe auch Edge Cases, Abbruchfälle, Dubletten, Race Conditions, doppelte Zustellung, erneute Webhook Anläufe, fehlende Consent Nachweise, Bounce Handling und Zahlungsfehler.
18. Behalte bestehende Repo Konventionen, Namenskonventionen, Architekturprinzipien und Quality Gates bei.

==================================================
KERNZIELE
==================================================

Erreiche mindestens diese Zielbilder:

A. REGISTRIERUNG UND CRM

1. Website Registrierung
2. Backend Validierung
3. Erstellung oder Aktualisierung von Kontakten in CiviCRM
4. Consent Speicherung
5. Rollen oder Mitgliedschaftsstatus
6. Willkommensmail
7. Double Opt In wo erforderlich
8. Fehlerrobuste Synchronisation

B. SPENDEN UND CHECKOUT

1. Checkout Fluss vollständig prüfen
2. Stripe, PayPal, SEPA oder sonstige vorhandene Zahlungswege prüfen und vervollständigen
3. Payment Intent oder Transaktion sauber persistieren
4. CiviCRM Contribution sauber anlegen oder aktualisieren
5. Statusübergänge pending, paid, failed, refunded, canceled, recurring sauber abbilden
6. Bestätigungsmail nach erfolgreicher Zahlung
7. Spendenbestätigung und Spendenquittungslogik, soweit fachlich vorgesehen
8. Umgang mit Webhook Retries, Duplikaten und Teilfehlern

C. NEWSLETTER UND E MAIL JOURNEYS

1. Newsletter Anmeldung
2. Double Opt In
3. Segmentierung und Listenlogik
4. Opt In und Opt Out Nachweise
5. Begrüßungsstrecke
6. Newsletter Versand
7. Bounce und Fehlerbehandlung
8. Reaktivierung oder Sunset Logik nur wenn sinnvoll
9. Abmeldung rechtssicher und technisch sauber

D. N8N AUTOMATISIERUNG

1. Prüfe alle vorhandenen Workflows
2. Dokumentiere Trigger, Inputs, Outputs, Secrets, Fehlerfälle und Zielsysteme
3. Repariere defekte oder unvollständige Workflows
4. Ergänze fehlende Workflows
5. Standardisiere Benennung, Tags, Versionierung, Ordnerstruktur und Dokumentation
6. Führe alle Kernflüsse über belastbare Automatisierung zusammen
7. Implementiere Webhook Verifikation und Idempotenz
8. Stelle sicher, dass kein Business Critical Flow an unklaren manuellen Schritten hängt

E. TEMPLATES UND MAIL DESIGN

1. Finde alle vorhandenen Mail Templates
2. Finde alle Drupal Templates, Twig Templates, HTML Templates, MJML oder sonstige Mailquellen
3. Finde alle CiviCRM Mailings, Token Vorlagen, systemischen Mails, Spendenmails, Registrierungs- und Newsletter Mails
4. Finde alle Templates in n8n Nodes oder Inline HTML
5. Finde alle Website Formulartexte, Bestätigungsseiten und Eventtexte mit Mailbezug
6. Vereinheitliche Branding, Layout, Tonalität, Absenderlogik, Footer, Rechtstexte, Opt Out Hinweise und Variablen
7. Erstelle ein zentrales, konsistentes Template System oder eine klare Template Governance, wenn zentrale Vererbung technisch nicht sauber möglich ist
8. Stelle sicher, dass alle Mails responsiv, robust und client kompatibel sind
9. Verwende sichere, simple, gut rendernde E Mail HTML Patterns
10. Prüfe Token Ersetzung, Fallback Texte, fehlende Variablen und kaputte Platzhalter

==================================================
PFLICHTAUDIT
==================================================

Führe zuerst ein hartes Audit durch und beantworte exakt:

1. Welche Endpunkte existieren bereits für:
   1. Registrierung
   2. Login
   3. Mitglieder
   4. Newsletter
   5. Checkout
   6. Donations
   7. Invoices
   8. Payment Intents
   9. Webhooks
   10. Consent
   11. E Mail Versand
   12. CRM Sync

2. Welche Tabellen oder Modelle existieren bereits für:
   1. contacts
   2. members
   3. donations
   4. invoices
   5. invoice_items
   6. payment_intents
   7. sepa_mandates
   8. sepa_batches
   9. newsletter subscriptions
   10. consent logs
   11. audit trails
   12. jobs oder queues

3. Welche CiviCRM Integrationen existieren bereits wirklich
4. Welche n8n Workflows existieren bereits wirklich
5. Welche Mail Templates existieren bereits wirklich
6. Welche Formulare im Frontend existieren bereits wirklich
7. Welche Webhooks existieren bereits wirklich
8. Welche Flüsse sind nur angedeutet, aber nicht fertig
9. Welche Referenzen zeigen auf fehlende Dateien, fehlende Endpunkte oder fehlende Konfiguration
10. Welche Prozesse sind doppelt, widersprüchlich oder inkonsistent
11. Wo gibt es Legacy Altlasten
12. Wo drohen DSGVO oder Datenintegritätsprobleme
13. Wo fehlen Tests
14. Wo fehlen Migrationen
15. Wo fehlen Retry, Timeout, Idempotenz oder Entkopplung

==================================================
UMFANG DER ZU VERVOLLSTÄNDIGENDEN BUSINESS FLOWS
==================================================

Decke mindestens diese Flüsse vollständig ab, falls sie fachlich oder strukturell im Repo naheliegen.

1. Konto Registrierung
2. Mitglied werden
3. Kontaktformular zu CRM
4. Newsletter Anmeldung
5. Double Opt In Bestätigung
6. Newsletter Abmeldung
7. Spende einmalig
8. Spende wiederkehrend
9. Checkout erfolgreich
10. Checkout fehlgeschlagen
11. Checkout abgebrochen
12. Payment Webhook eingehend
13. CRM Contribution Erstellung
14. CRM Kontakt Erstellung oder Aktualisierung
15. Spendenbestätigung per Mail
16. Zuwendungsbestätigung oder vorbereitende Quittungslogik
17. Willkommensmail nach Registrierung
18. Passwort Reset Mail falls vorgesehen
19. Event oder Kampagnen Mail falls bereits angelegt
20. Interne Admin Benachrichtigungen
21. Bounce Handling
22. Consent Nachweis
23. Dublettenprüfung
24. Sync Konfliktbehandlung
25. Datenexport oder Auditnachweis wo erforderlich

Wenn weitere vorhandene Flüsse im Repo auffindbar sind, erweitere die Liste automatisch und setze sie ebenfalls um.

==================================================
TECHNISCHE HÄRTUNG
==================================================

Setze in allen relevanten Bereichen diese Standards um:

1. klare Domänengrenzen zwischen Frontend, API, CRM und n8n
2. saubere DTOs, Schemas und Validierung
3. dedizierte Service Layer statt ungeordnetem Router Code
4. transaktionssichere Persistenz
5. Webhook Signaturprüfung
6. Idempotency Keys oder funktional gleichwertige Duplikatschranken
7. Retry Strategie für externe Systeme
8. strukturierte Fehlerobjekte
9. observability ohne PII Leaks
10. Audit Trail für sensible Statuswechsel
11. Consent Speicherung mit Zeitstempel, Quelle, Rechtsgrundlage, Version und Nachweis
12. Outbox oder jobs basierte Entkopplung, falls synchroner Direktversand zu fragil ist
13. Template Rendering mit klaren Inputs
14. zentrale Mail Versandabstraktion
15. Testbarkeit und Mockbarkeit externer Systeme
16. sichere Defaults
17. fallback Pfade bei CRM oder Mail Ausfall
18. robuste Mapping Schicht zwischen internen Datenmodellen und CiviCRM Feldern

==================================================
CIVICRM PFLICHTPUNKTE
==================================================

Prüfe und implementiere mindestens:

1. Kontaktanlage und Kontaktupdate
2. Dublettenlogik
3. Contribution Mapping
4. Membership Mapping, falls relevant
5. Activity oder Note Logging, falls sinnvoll
6. Newsletter oder Group Zuordnung
7. Consent Felder oder nachvollziehbare Speicherung
8. API Nutzung konsistent und versioniert
9. Fehlerrobuste Rückmeldung an das Backend
10. saubere Trennung zwischen fachlicher Entscheidung und CRM Transportlogik

Wenn bestehende CiviCRM Konfigurationen, Gruppen, Contact Types, Membership Types oder Contribution Pages fehlen, dokumentiere die Lücke präzise und liefere die technisch sauberste Integrationsstrategie.

==================================================
N8N PFLICHTPUNKTE
==================================================

Prüfe und implementiere mindestens:

1. konsistente Workflow Namen
2. klare Triggerlogik
3. klare Input Contracts
4. klare Output Contracts
5. Environment Variablen statt harter Werte
6. Fehlerzweige
7. Retry oder Dead Letter Konzept
8. Logging ohne PII Leaks
9. Webhook Security
10. dokumentierte Importfähigkeit
11. Versionsfähigkeit und Wartbarkeit
12. Wiederverwendbare Subflows, wenn sinnvoll
13. administrative Benachrichtigungen nur gezielt und ohne Spam
14. Trennung von Transaktionsmails und Marketingmails
15. sichere Abhängigkeiten zu CiviCRM, API und SMTP

==================================================
MAIL TEMPLATE PFLICHTPUNKTE
==================================================

Inventarisiere und standardisiere mindestens diese Templates:

1. Willkommensmail Registrierung
2. Double Opt In Mail
3. Newsletter Begrüßung
4. Newsletter Standardtemplate
5. Spendenbestätigung erfolgreich
6. Spende fehlgeschlagen
7. Wiederkehrende Spende Problemfall
8. Zahlungsbestätigung
9. Admin Benachrichtigung neue Spende
10. Admin Benachrichtigung neue Registrierung
11. Passwort Reset falls vorhanden
12. Eventbestätigung falls vorhanden
13. Kontaktformular Eingangsbestätigung falls vorhanden
14. interne Workflow Fehlerbenachrichtigung
15. Opt Out Bestätigung falls sinnvoll

Für jedes Template definiere:

1. Zweck
2. Trigger
3. Zielgruppe
4. Pflichtvariablen
5. Fallbackvariablen
6. Absenderadresse
7. Betreffzeile
8. Preheader
9. HTML Body
10. Text Alternative
11. CTA
12. Footer
13. Datenschutz oder Rechtshinweise
14. Opt Out Logik wenn Marketingbezug
15. Testfallmatrix

Erstelle ein konsistentes Mail Design System mit:

1. Header
2. Logo oder Textfallback
3. Typografie
4. Spacing
5. Farbregeln
6. CTA Buttons
7. Info Boxen
8. Erfolg und Fehler Module
9. Footer
10. rechtssicheren Pflichtbausteinen
11. Plain Text Strategie

==================================================
TEST UND VALIDIERUNG
==================================================

Führe nach jeder Implementierungsphase gezielte Validierung durch.

Mindestens erforderlich:

1. Unit Tests für Kernlogik
2. API Tests für Kernendpunkte
3. Integrationstests für Checkout und CRM Mapping
4. Testmatrix für Erfolg, Fehler, Retry, Timeout und Dubletten
5. Template Render Tests
6. n8n Flow Validierung
7. Webhook Tests
8. DSGVO Prüfungen
9. PII Logging Prüfungen
10. End to End Happy Paths
11. End to End Failure Paths

Prüfe insbesondere:

1. doppelte Webhook Zustellung
2. Zahlung erfolgreich, aber CRM Ausfall
3. CRM erfolgreich, aber Mail Ausfall
4. Mail erfolgreich, aber Template Variable fehlt
5. Registrierung mit bestehendem Kontakt
6. Newsletter Anmeldung ohne DOI Abschluss
7. wiederkehrende Zahlung mit Fehler
8. Consent Version geändert
9. unvollständige Adressdaten
10. Race Conditions bei parallelen Events

==================================================
ARBEITSPHASEN
==================================================

Arbeite in dieser Reihenfolge.

PHASE 0: IST ZUSTAND ERFASSEN

1. Repo scannen
2. Dateibaum relevanter Bereiche erfassen
3. vorhandene Flüsse kartieren
4. Defekte, Lücken, Platzhalter und Widersprüche dokumentieren

PHASE 1: BACKEND AUDIT

1. API Endpunkte
2. Schemas
3. Services
4. Datenmodelle
5. Migrationen
6. Webhooks
7. Mail Versand
8. CRM Adapter
9. Consent und Audit

PHASE 2: CRM UND AUTOMATION AUDIT

1. CiviCRM Integrationen
2. Drupal Module
3. n8n Workflows
4. Template Quellen
5. Trigger und Journeys
6. Dubletten und Statusübergänge

PHASE 3: ZIELARCHITEKTUR FESTLEGEN

1. endgültige Backend Verantwortung je Domäne
2. Verantwortungsgrenzen API versus CiviCRM versus n8n
3. robustes Event und Automationsmodell
4. Template Governance
5. Consent und Audit Modell

PHASE 4: IMPLEMENTIEREN

1. defekte Flüsse reparieren
2. fehlende Endpunkte bauen
3. fehlende Services bauen
4. fehlende n8n Workflows bauen oder korrigieren
5. fehlende Mail Templates bauen
6. fehlende CRM Anbindung bauen
7. fehlende Tests bauen
8. OpenAPI und Doku synchronisieren

PHASE 5: STANDARDISIEREN

1. Namenskonventionen
2. Template Konventionen
3. Error Handling
4. Logging
5. Env Nutzung
6. Workflow Struktur
7. Statusmodelle
8. Mapping Tabellen

PHASE 6: VALIDIEREN

1. Tests laufen lassen
2. Smoke Tests dokumentieren
3. offene Risiken klar benennen
4. Restlücken präzise markieren

==================================================
KONKRETE LIEFEROBJEKTE
==================================================

Erstelle mindestens diese Artefakte.

1. EXECUTIVE_BACKEND_AUTOMATION_AUDIT.md
   Inhalt:
   1. Ist Zustand
   2. Hauptlücken
   3. Hauptbrüche
   4. Risikoübersicht
   5. klare Umsetzungsentscheidung

2. BACKEND_FLOW_MATRIX.md
   Inhalt:
   1. alle fachlichen Flüsse
   2. Trigger
   3. Eingaben
   4. Persistenz
   5. CRM Aktion
   6. n8n Aktion
   7. Mail Aktion
   8. Fehlerpfade
   9. Statusmodell

3. CIVICRM_MAPPING_MATRIX.md
   Inhalt:
   1. interne Modelle
   2. CiviCRM Felder
   3. Pflichtfelder
   4. Transformationslogik
   5. Dublettenstrategie
   6. Fehlerbehandlung

4. N8N_WORKFLOW_AUDIT_AND_PLAN.md
   Inhalt:
   1. vorhandene Workflows
   2. defekte Workflows
   3. fehlende Workflows
   4. Zielarchitektur
   5. konkrete Maßnahmen

5. EMAIL_TEMPLATE_INVENTORY.md
   Inhalt:
   1. alle vorhandenen Templates
   2. Quelle
   3. Zweck
   4. Trigger
   5. Status
   6. Probleme
   7. Ersetzungs oder Vereinheitlichungsbedarf

6. EMAIL_DESIGN_SYSTEM.md
   Inhalt:
   1. Komponenten
   2. Layoutregeln
   3. Textregeln
   4. Brandingregeln
   5. DSGVO und Pflichtbausteine
   6. Variable und Token Regeln

7. IMPLEMENTATION_ROADMAP.md
   Inhalt:
   1. Sofort blockierend
   2. Hoch
   3. Mittel
   4. Nice to have
   5. Reihenfolge
   6. Abhängigkeiten
   7. Risiken
   8. Definition of Done

8. FILE_BY_FILE_CHANGE_PLAN.md
   Inhalt:
   1. geänderte Dateien
   2. neue Dateien
   3. gelöschte Dateien
   4. Zweck jeder Datei
   5. Verantwortlichkeiten jeder Datei

9. TEST_MATRIX.md
   Inhalt:
   1. Happy Paths
   2. Failure Paths
   3. Retry Fälle
   4. DSGVO Fälle
   5. Idempotenzfälle
   6. Template Rendering Fälle
   7. CRM Sync Fälle

10. OPTIONAL: echte Code und Workflow Änderungen
    Wenn möglich, implementiere die wichtigsten Änderungen direkt.

==================================================
AUSGABEFORMAT
==================================================

Antworte in dieser festen Reihenfolge:

1. Repo Audit
2. Hauptprobleme
3. Zielarchitektur
4. Backend Vervollständigung
5. CiviCRM Integrationsmodell
6. n8n Automationsmodell
7. Checkout und Donation Flow
8. Registrierung und Consent Flow
9. Newsletter und DOI Flow
10. Mail Template Inventur
11. Mail Design System
12. Tests und Validierung
13. konkrete Code Änderungen
14. konkrete Workflow Änderungen
15. verbleibende Risiken
16. klare Entscheidungsempfehlung

==================================================
VERBOTEN
==================================================

Vermeide unbedingt:

1. reine Theorie ohne Repo Prüfung
2. generische CRM Tipps
3. generische n8n Tipps
4. unpräzise Aussagen wie vermutlich oder eventuell ohne Prüfung
5. harte Secrets im Code
6. PII Leaks in Logs
7. nicht idempotente Zahlungsworkflows
8. Marketingmails ohne Consent Logik
9. unklare Verantwortlichkeiten zwischen API, CiviCRM und n8n
10. bloße Wunschlisten ohne Priorisierung und Umsetzung
11. halbfertige Templates ohne Variable Definitionen
12. ungetestete kritische Checkout Logik

==================================================
ABSCHLUSSREGEL
==================================================

Beende die Arbeit nicht nach dem Audit.
Setze die kritischsten fehlenden oder defekten Teile um.
Repariere, vervollständige, standardisiere und validiere so weit wie realistisch möglich.
Arbeite wie ein externer Lead Engineer, der das System produktionsfähig machen muss.
