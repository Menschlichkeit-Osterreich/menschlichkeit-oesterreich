---
name: dsgvo-audit
description: Prüft Code auf DSGVO/GDPR-Compliance — PII-Leaks, Datenschutz-Verstöße, fehlende Sanitisierung
user-invocable: false
---

# DSGVO Compliance Audit

Dieses Skill wird automatisch aktiviert wenn Code bearbeitet wird, der personenbezogene Daten verarbeitet.

## Wann prüfen

Aktiviere diese Prüfung bei Änderungen an:

- `apps/api/app/routers/auth.py` (Login, Register, Session-Daten)
- `apps/api/app/routers/members.py` (Mitgliederdaten)
- `apps/api/app/routers/contact.py` (Kontaktformulare)
- `apps/api/app/routers/newsletter.py` (E-Mail-Adressen)
- `apps/api/app/routers/payments.py` (Zahlungsdaten)
- `apps/api/app/routers/finance*.py` (SEPA, Spenden, Rechnungen)
- `apps/api/app/middleware/pii_middleware.py`
- `apps/api/app/lib/pii_sanitizer.py`
- `apps/crm/` (CiviCRM Mitgliederverwaltung)
- Jeder Code der `email`, `iban`, `telefon`, `adresse`, `geburtsdatum` verarbeitet

## Prüfregeln

### 1. PII in Logs (KRITISCH)

- Kein `logger.info/debug/warning/error` mit personenbezogenen Daten
- Nutze immer `PiiSanitizer.scrub()` oder `PiiSanitizer.scrub_dict()` vor dem Loggen
- Bibliothek: `apps/api/app/lib/pii_sanitizer.py`

### 2. E-Mail-Maskierung

- Alle E-Mails in Logs als `t**@example.com` maskieren
- Pattern: `PiiSanitizer.scrub(email_string)`

### 3. IBAN-Redaktion

- IBANs als `AT61***` reduzieren (nur Länderkennzeichen + Prüfziffern)
- Pattern: `PiiSanitizer.scrub(iban_string)`

### 4. Kreditkartennummern

- Luhn-validierte Nummern automatisch erkennen und maskieren
- Nur letzte 4 Ziffern sichtbar: `****-****-****-1234`

### 5. Datensparsamkeit

- Nur notwendige Felder in API-Responses
- Keine vollständigen Mitgliederdaten in Listen-Endpunkten
- Paginierung bei großen Datensätzen

### 6. Löschrecht (Art. 17 DSGVO)

- Lösch-Endpunkte müssen alle verknüpften Daten entfernen
- n8n Workflow: `automation/n8n/workflows/right-to-erasure.json`
- Audit-Log der Löschung (ohne PII)

### 7. Einwilligung

- Newsletter-Anmeldung: Double-Opt-In erforderlich
- Kontaktformular: Datenschutzerklärung-Checkbox
- Cookie-Banner mit granularer Auswahl

## Ausgabeformat

```
[DSGVO] Artikel — Beschreibung
  Datei: pfad/zur/datei.py:zeile
  Verstoß: Konkrete Beschreibung
  Fix: Empfohlene Korrektur
  Referenz: Art. X DSGVO
```
