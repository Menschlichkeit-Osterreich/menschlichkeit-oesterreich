---
title: "Mcpdsgvocomplianceaudit"
description: "DSGVO Compliance Audit"
lastUpdated: 2025-10-10
status: ACTIVE
category: compliance
tags: ['compliance', 'mcp', 'dsgvo']
version: "1.0.0"
language: de-AT
audience: ['Compliance Officers', 'Legal Team']
---

```prompt
---
description: DSGVO-Compliance-Audit mit PostgreSQL, Filesystem & GitHub MCP für Austrian NGO
priority: critical
category: compliance
---

# DSGVO Compliance Audit

## 🔒 Compliance-Prüfung starten

**Kontext:** Vollständiger DSGVO-Compliance-Audit für alle Services der Menschlichkeit Österreich Plattform mit systematischer Prüfung von Datenverarbeitung, Speicherung, Verschlüsselung und Betroffenenrechten.

---

## Phase 1: PII-Identifikation (PostgreSQL MCP)

```
Via PostgreSQL MCP:
"Identify all tables containing personal identifiable information (PII)"

Query:
SELECT 
  table_schema,
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE column_name ILIKE ANY(ARRAY[
  '%email%',
  '%name%',
  '%phone%',
  '%address%',
  '%birth%',
  '%ssn%',
  '%iban%',
  '%passport%'
])
ORDER BY table_schema, table_name;

OUTPUT PII INVENTORY:
| Schema | Table | Column | Data Type | Verschlüsselt? | Rechtsgrundlage |
|--------|-------|--------|-----------|----------------|-----------------|
| public | users | email | varchar | ❌ | Art. 6(1)(b) DSGVO |
| public | donations | donor_email | varchar | ❌ | Art. 6(1)(a) DSGVO |
| civicrm | contact | email | varchar | ❌ | Art. 6(1)(b) DSGVO |
```text

## Phase 2: Verschlüsselungs-Check (PostgreSQL MCP)

```
Via PostgreSQL MCP:
"Check for encryption of PII fields"

Query für unverschlüsselte PII:
SELECT 
  'users' as table_name,
  email as unencrypted_pii
FROM users
WHERE email NOT LIKE 'enc:%'  -- Verschlüsselte haben Präfix
LIMIT 5;

FINDINGS:
❌ CRITICAL: 1.234 unverschlüsselte Email-Adressen in users
❌ CRITICAL: 567 unverschlüsselte Telefonnummern in civicrm_contact
❌ HIGH: 89 IBAN-Nummern im Klartext in payment_methods

REMEDIATION REQUIRED:
1. Implementiere pgcrypto für Column-Level Encryption
2. Migriere bestehende Daten
3. Update Application Code für De/Encryption
```text

## Phase 3: Consent-Management (PostgreSQL MCP + Filesystem MCP)

```
Via PostgreSQL MCP:
"Check consent records for all users"

SELECT 
  u.id,
  u.email_encrypted,
  c.consent_type,
  c.granted_at,
  c.withdrawn_at,
  c.legal_basis
FROM users u
LEFT JOIN user_consents c ON u.id = c.user_id
WHERE c.consent_type IN ('newsletter', 'data_processing', 'marketing');

FINDINGS:
❌ CRITICAL: 45 Nutzer ohne consent_type='data_processing'
⚠️ HIGH: 123 Consents ohne legal_basis Dokumentation
✅ OK: 890 Nutzer mit vollständiger Consent-Historie

Via Filesystem MCP:
"Check consent form implementation"

FILE: frontend/src/components/ConsentForm.tsx

VALIDATE:
□ Double Opt-In implementiert?
□ Granulare Consent-Optionen (separate Checkboxen)?
□ Widerruf-Möglichkeit prominent?
□ Datenschutzerklärung verlinkt?
□ Log der Consent-Änderungen?
```text

## Phase 4: Datensparsamkeit (PostgreSQL MCP)

```
Via PostgreSQL MCP:
"Identify unnecessary data collection"

SELECT 
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name ILIKE ANY(ARRAY[
    '%gender%',
    '%race%',
    '%religion%',
    '%political%',
    '%health%'
  ]);

FINDINGS (Art. 9 DSGVO - Besondere Kategorien):
⚠️ HIGH: Spalte "health_status" in volunteers Tabelle
  → Rechtsgrundlage prüfen! (Art. 9(2) DSGVO erforderlich)

RECOMMENDATION:
- health_status entfernen ODER
- Explizite Einwilligung (Art. 9(2)(a)) ODER
- Pseudonymisierung + Trennung von Identität
```text

## Phase 5: Speicherdauer & Löschroutinen (PostgreSQL MCP)

```
Via PostgreSQL MCP:
"Check data retention compliance"

-- Finde alte, zu löschende Datensätze
SELECT 
  'users' as table_name,
  COUNT(*) as records_to_delete
FROM users
WHERE last_login < NOW() - INTERVAL '3 years'
  AND deletion_scheduled IS NULL;

FINDINGS:
❌ CRITICAL: 234 inaktive Accounts älter als 3 Jahre (noch nicht gelöscht)
⚠️ HIGH: Keine automatische Löschroutine für alte donations
✅ OK: game_sessions haben TTL von 90 Tagen

Via Filesystem MCP:
"Check for automated deletion scripts"

FILE: automation/privacy/auto-delete-inactive-users.py

VALIDATE:
□ Cron-Job aktiv?
□ Logs der Löschungen?
□ Benachrichtigung vor Löschung (30 Tage)?
□ Wiederherstellungsfrist eingehalten?
□ Backup-Aufbewahrung konform?

IMPLEMENT:
CREATE OR REPLACE FUNCTION auto_delete_old_users()
RETURNS void AS $$
BEGIN
  -- Mark for deletion (30 days notice)
  UPDATE users
  SET deletion_scheduled = NOW() + INTERVAL '30 days'
  WHERE last_login < NOW() - INTERVAL '3 years'
    AND deletion_scheduled IS NULL;
  
  -- Actual deletion after notice period
  DELETE FROM users
  WHERE deletion_scheduled < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron
SELECT cron.schedule('delete-inactive-users', '0 2 * * *', 'SELECT auto_delete_old_users()');
```text

## Phase 6: Betroffenenrechte (Filesystem MCP)

```
Via Filesystem MCP:
"Check implementation of GDPR subject rights"

REQUIRED ENDPOINTS:
□ GET /api/v1/gdpr/data-export (Art. 15 - Auskunftsrecht)
□ PATCH /api/v1/gdpr/data-rectification (Art. 16 - Berichtigung)
□ DELETE /api/v1/gdpr/data-deletion (Art. 17 - Löschung)
□ POST /api/v1/gdpr/data-portability (Art. 20 - Datenübertragbarkeit)
□ POST /api/v1/gdpr/object-processing (Art. 21 - Widerspruch)

Via Filesystem MCP:
"Read api.menschlichkeit-oesterreich.at/app/routers/gdpr.py"

VALIDATE IMPLEMENTATION:
✅ Data Export generiert JSON mit allen Nutzerdaten
✅ Deletion löscht cascading (users → donations → sessions)
❌ MISSING: Datenübertragbarkeit in maschinenlesbarem Format
❌ MISSING: Widerspruchsrecht gegen Profiling

IMPLEMENT MISSING:
@router.post("/gdpr/data-portability")
async def export_data_portable(
    user_id: int = Depends(get_current_user),
    format: str = Query("json", regex="^(json|csv|xml)$")
):
    # Exportiere ALLE Nutzerdaten
    user_data = {
        "personal_info": get_user_profile(user_id),
        "donations": get_user_donations(user_id),
        "game_progress": get_game_sessions(user_id),
        "consents": get_user_consents(user_id)
    }
    
    if format == "json":
        return JSONResponse(user_data)
    elif format == "csv":
        return StreamingResponse(to_csv(user_data), media_type="text/csv")
```text

## Phase 7: Drittlandtransfer (Brave Search MCP + Filesystem MCP)

```
Via Filesystem MCP:
"Check for third-party integrations"

FILES:
- frontend/package.json → Analytics, Tracking?
- api.menschlichkeit-oesterreich.at/requirements.txt → Cloud Services?
- automation/n8n/workflows/*.json → External APIs?

FINDINGS:
⚠️ HIGH: Google Analytics in frontend (USA Transfer ohne SCCs)
⚠️ HIGH: Stripe Payment (USA, aber adequacy decision + DPA vorhanden)
✅ OK: n8n läuft lokal (kein Drittlandtransfer)

Via Brave Search MCP:
"Search for EU-GDPR adequacy decisions 2025"
"Find EU standard contractual clauses template"

REMEDIATION:
1. Google Analytics → Matomo (self-hosted) ODER
2. Google Analytics mit Server-Side Tagging (EU-Server)
3. Update Privacy Policy mit Drittlandtransfer-Hinweis
4. SCCs mit allen US-Providern abschließen
```text

## Phase 8: Logging & Audit Trail (Filesystem MCP)

```
Via Filesystem MCP:
"Search for PII in log files"

grep -r "email\|phone\|address" \
  api.menschlichkeit-oesterreich.at/logs/ \
  crm.menschlichkeit-oesterreich.at/logs/

FINDINGS:
❌ CRITICAL: Email-Adressen im Klartext in api.log
❌ CRITICAL: Full request bodies (inkl. Passwörter!) in debug.log
✅ OK: CiviCRM logs keine PII

Via Filesystem MCP:
"Update logging configuration"

FILE: api.menschlichkeit-oesterreich.at/app/logging_config.py

FIX:
from api.menschlichkeit-oesterreich.at.verify_privacy_api import sanitize_pii

class PIISafeFormatter(logging.Formatter):
    def format(self, record):
        # Sanitize message
        record.msg = sanitize_pii(record.msg)
        
        # Remove sensitive fields from extra data
        if hasattr(record, 'request_body'):
            record.request_body = sanitize_pii(record.request_body)
        
        return super().format(record)

VERIFY:
python api.menschlichkeit-oesterreich.at/verify_privacy_api.py
```text

## Phase 9: Verzeichnis von Verarbeitungstätigkeiten (VVT)

```
Via GitHub MCP:
"Create issue for VVT documentation"

TITLE: "DSGVO: Verzeichnis von Verarbeitungstätigkeiten erstellen (Art. 30)"

REQUIRED DOCUMENTATION:
1. Zweck der Verarbeitung
2. Kategorien betroffener Personen
3. Kategorien personenbezogener Daten
4. Kategorien von Empfängern
5. Drittlandtransfers
6. Löschfristen
7. Technische & organisatorische Maßnahmen (TOMs)

TEMPLATE:

# Verarbeitungstätigkeit: Spendenverwaltung

**Zweck:** Verwaltung von Spenden und Ausstellung von Spendenbestätigungen

**Rechtsgrundlage:** Art. 6(1)(b) DSGVO (Vertragserfüllung)

**Betroffene Personen:** Spender:innen

**Verarbeitete Daten:**
- Name, Vorname
- E-Mail-Adresse
- Spendenbetrag
- IBAN (optional für SEPA)

**Empfänger:** 
- CiviCRM (intern)
- Stripe (Zahlungsabwicklung, USA, adequacy + DPA)

**Speicherdauer:** 
- 7 Jahre (steuerliche Aufbewahrungspflicht)
- Danach Löschung innerhalb 30 Tage

**TOMs:**
- TLS-Verschlüsselung (Transport)
- AES-256 Verschlüsselung (at rest)
- Access Control (Role-Based)
- Audit Logging
- Regular Backups (verschlüsselt)

Via Filesystem MCP:
"Create docs/DSGVO-VVT.md with all processing activities"
```text

## Phase 10: Datenschutz-Folgenabschätzung (DSFA)

```
Via Brave Search MCP:
"Search for GDPR DPIA threshold criteria"
"Find DPIA template Austria"

EVALUATE DPIA NECESSITY:
□ Systematische Überwachung? → NEIN
□ Besondere Kategorien (Art. 9)? → NEIN (außer health_status!)
□ Profiling mit Rechtswirkung? → NEIN
□ Neue Technologien? → NEIN
□ Umfangreiche Verarbeitung? → JA (> 10.000 Betroffene)

RESULT: DSFA EMPFOHLEN (nicht verpflichtend, aber Best Practice)

Via GitHub MCP:
"Create issue for DPIA implementation"

DSFA Template:
1. Beschreibung der Verarbeitung
2. Beurteilung der Notwendigkeit & Verhältnismäßigkeit
3. Risikobewertung für Betroffene
4. Abhilfemaßnahmen
5. Konsultation Datenschutzbeauftragter

RISKS IDENTIFIED:
- Health_status Verarbeitung ohne explizite Einwilligung → HIGH RISK
- Drittlandtransfer (USA) → MEDIUM RISK
- Keine regelmäßige Löschung inaktiver Accounts → MEDIUM RISK
```text

## Phase 11: Auftragsverarbeiter-Verträge (AVV)

```
Via Filesystem MCP:
"List all external service providers"

PROVIDERS:
1. Plesk Hosting → AVV vorhanden? ❓
2. Stripe Payment → DPA vorhanden ✅
3. n8n Cloud (falls extern) → AVV erforderlich ❌
4. Google Analytics → AVV erforderlich ❌
5. Email Service (falls extern) → AVV erforderlich ❓

Via Brave Search MCP:
"Search for standard DPA template Austria"
"Find Stripe GDPR data processing agreement"

ACTION ITEMS:
□ Stripe DPA unterzeichnen (https://stripe.com/dpa)
□ Plesk AVV anfordern von Hosting-Provider
□ n8n: Prüfen ob self-hosted (dann kein AVV nötig)
□ Google Analytics: DPA abschließen ODER Service wechseln

Via GitHub MCP:
"Create issue to track DPA completion for all processors"
```text

## Phase 12: Mitarbeiter-Schulung & Zugriffsrechte

```
Via Filesystem MCP:
"Check access control configuration"

FILE: api.menschlichkeit-oesterreich.at/app/auth.py

VALIDATE ROLE-BASED ACCESS:
□ Admin → Full access
□ Staff → Read/Write (no deletion)
□ Volunteer → Read-only
□ API → Specific endpoints only

Via PostgreSQL MCP:
"Audit database user permissions"

SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema IN ('public', 'civicrm')
ORDER BY grantee, table_name;

FINDINGS:
❌ CRITICAL: "volunteer" role hat DELETE auf users Tabelle
⚠️ HIGH: "api_user" hat GRANT OPTION (kann Rechte weitergeben)
✅ OK: Separation of duties zwischen Admins

REMEDIATION:
REVOKE DELETE ON users FROM volunteer;
REVOKE GRANT OPTION FOR ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM api_user;
```text

## Phase 13: Datenpannen-Verfahren

```
Via Filesystem MCP:
"Check data breach response procedures"

FILE: docs/SECURITY-INCIDENT-RESPONSE.md

VALIDATE PROCEDURE:
□ Detection & Containment (sofort)
□ Impact Assessment (binnen 24h)
□ Meldung an Datenschutzbehörde (binnen 72h) - Art. 33 DSGVO
□ Benachrichtigung Betroffener (falls hohes Risiko) - Art. 34 DSGVO
□ Post-Incident Review

Via GitHub MCP:
"Create issue template for data breach reporting"

TEMPLATE: .github/ISSUE_TEMPLATE/data-breach.md
---
name: Datenpanne (Data Breach)
about: Meldung einer Datenschutzverletzung (Art. 33 DSGVO)
labels: security, dsgvo, critical
---

## Vorfall-Details
- **Datum/Uhrzeit:** 
- **Entdeckt durch:** 
- **Betroffene Systeme:** 

## Betroffene Daten
- **Art der Daten:** (email, name, payment info, etc.)
- **Anzahl Betroffene:** 
- **Sensibilität:** (niedrig/mittel/hoch)

## Maßnahmen
- [ ] Sicherheitslücke geschlossen
- [ ] Datenschutzbeauftragten informiert
- [ ] Aufsichtsbehörde benachrichtigt (binnen 72h!)
- [ ] Betroffene benachrichtigt (falls erforderlich)

## Ursachenanalyse
<!-- Root Cause Analysis -->
```text

## Phase 14: Privacy by Design & Default

```
Via Filesystem MCP:
"Evaluate Privacy by Design implementation"

PRINCIPLES CHECK:
□ Proaktiv (nicht reaktiv) → ❌ Viele Findings erst bei Audit
□ Privacy as Default → ❌ Consent nicht pre-checked, aber Newsletter opt-out fehlt
□ Privacy embedded in Design → ✅ Verschlüsselung in DB-Schema
□ Full Functionality (positive-sum) → ✅ Features nicht eingeschränkt
□ End-to-End Security → ⚠️ TLS ja, aber E2E-Encryption fehlt
□ Visibility & Transparency → ✅ Privacy Policy vorhanden
□ User-Centric → ✅ Einfacher Consent-Widerruf

RECOMMENDATIONS:
1. Implement Privacy Dashboard (user-facing)
   - Aktuelle Consents anzeigen
   - Datenexport mit 1 Klick
   - Löschantrag stellen
   
2. Privacy-First Feature Development
   - DSGVO-Impact bei jedem Feature-Request
   - Privacy Review in PR-Template
   
3. Datensparsamkeit by Default
   - Keine optionale Datensammlung pre-checked
   - Minimale Pflichtfelder
```text

## Phase 15: Compliance Report & Roadmap

```
Via Memory MCP:
"Generate comprehensive DSGVO compliance report"

# DSGVO Compliance Audit Report
**Stand:** {{DATE}}
**Auditor:** GitHub Copilot + MCP Tools

## Executive Summary
- **Compliance Level:** 68% (MEDIUM RISK)
- **Critical Findings:** 7
- **High Priority:** 12
- **Medium Priority:** 8

## Critical Findings (SOFORT beheben):
1. ❌ Unverschlüsselte PII in Datenbank (1.234 Records)
2. ❌ PII in Logfiles (api.log, debug.log)
3. ❌ Fehlende Consent-Records (45 Nutzer)
4. ❌ Keine automatische Löschung inaktiver Accounts
5. ❌ Health_status ohne Rechtsgrundlage Art. 9 DSGVO
6. ❌ Google Analytics ohne DPA
7. ❌ Volunteer-Role mit DELETE-Rechten

## Remediation Roadmap:

### Sprint 1 (Woche 1-2) - CRITICAL
- [ ] Implementiere pgcrypto Verschlüsselung
- [ ] Migriere PII zu encrypted columns
- [ ] Fix Logging (sanitize_pii)
- [ ] Entziehe DELETE-Rechte von Volunteer-Role

### Sprint 2 (Woche 3-4) - HIGH
- [ ] Auto-Delete-Routine für inaktive User
- [ ] Fehlende Consent-Records nacherfassen
- [ ] Health_status entfernen ODER Rechtsgrundlage schaffen
- [ ] Google Analytics durch Matomo ersetzen

### Sprint 3 (Woche 5-6) - MEDIUM
- [ ] DPIA durchführen
- [ ] VVT vervollständigen
- [ ] AVVs mit allen Auftragsverarbeitern
- [ ] Privacy Dashboard implementieren

### Ongoing:
- [ ] Quarterly DSGVO Audits
- [ ] Annual Privacy Review
- [ ] Staff Training (halbjährlich)

Via GitHub MCP:
"Create epic issue for DSGVO remediation with all subtasks"

Via Filesystem MCP:
"Save report to quality-reports/dsgvo-audit-{{DATE}}.md"
```text

---

**Erwartetes Ergebnis:**
1. Vollständiger DSGVO-Audit-Report mit allen Findings
2. Priorisierte Remediation Roadmap
3. GitHub Issues für alle Critical/High-Priority Items
4. Dokumentation aller Verarbeitungstätigkeiten
5. Implementierungsplan für fehlende Betroffenenrechte

**Next Steps:**
- Datenschutzbeauftragten konsultieren
- Management-Approval für Remediation Budget
- Schrittweise Umsetzung nach Roadmap
- Follow-up Audit in 3 Monaten
