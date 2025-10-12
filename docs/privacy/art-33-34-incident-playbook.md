# Art. 33 & 34 DSGVO – Incident Response Playbook (72-Stunden-Meldepflicht)

**Organisation**: Menschlichkeit Österreich  
**Incident Commander**: [DPO_NAME]  
**On-Call Eskalation**: [INCIDENT_PAGER]  
**Stand**: 2025-10-12  
**Timezone**: Europe/Vienna

---

## ⚠️ KRITISCH: 72-Stunden-Meldepflicht

Gemäß **Art. 33 DSGVO** muss eine Verletzung des Schutzes personenbezogener Daten **binnen 72 Stunden** nach Bekanntwerden an die Aufsichtsbehörde gemeldet werden, sofern die Verletzung voraussichtlich ein Risiko für die Rechte und Freiheiten natürlicher Personen zur Folge hat.

**Österreichische Datenschutzbehörde (DSB)**:
- **Website**: https://www.dsb.gv.at/
- **Meldung**: Online-Formular unter https://www.dsb.gv.at/datenpannen
- **Telefon**: +43 1 52 152-0 (für dringende Fälle)
- **E-Mail**: dsb@dsb.gv.at

---

## 🚨 Phase 1: Sofortmaßnahmen (Erste 30 Minuten)

### 1.1 Incident Discovery & Triage

**Wer kann einen Incident melden?**
- Security Team
- Entwickler:innen
- Monitoring-Alerts (automatisch)
- Externe Sicherheitsforscher (via SECURITY.md)

**Meldewege**:
- **Kritisch**: On-Call Pager → [INCIDENT_PAGER] (Matrix/Slack)
- **Hoch**: E-Mail an security@menschlichkeit-oesterreich.at
- **Mittel/Niedrig**: GitHub Security Advisory (Private)

### 1.2 Severity-Einstufung (CVSS 3.1 + DSGVO-Impact)

| Severity | CVSS | DSGVO-Relevanz | Meldepflicht | Response Time |
|----------|------|----------------|--------------|---------------|
| **CRITICAL** | 9.0-10.0 | PII-Exfiltration, Massenleak | ✅ Ja, sofort | < 15 Min |
| **HIGH** | 7.0-8.9 | Einzelne PII, Auth-Bypass | ✅ Wahrscheinlich | < 1 Std |
| **MEDIUM** | 4.0-6.9 | Keine PII, Config-Leak | ⚠️ Prüfen | < 4 Std |
| **LOW** | 0.1-3.9 | Kein PII-Risiko | ❌ Nein | < 24 Std |

### 1.3 Incident Commander bestimmen

**Rolle**: Koordiniert Response, trifft Entscheidungen, kommuniziert mit Stakeholdern

**Standard**: [DPO_NAME] (Datenschutzbeauftragte:r)  
**Backup**: Vorstand / CTO

**Erste Handlung**:
```bash
# Incident-Channel erstellen
./scripts/create-incident-channel.sh --severity CRITICAL --id INC-2025-001

# Team alarmieren
./scripts/notify-incident-team.sh --channel incident-001 --message "PII Breach detected"
```

---

## 🔬 Phase 2: Containment & Investigation (1-4 Stunden)

### 2.1 Eindämmung (Containment)

**Ziel**: Schaden begrenzen, weitere Exfiltration verhindern

**Sofortmaßnahmen** (je nach Incident-Typ):

#### Bei Unauthorized Access:
```bash
# 1. Betroffene Accounts sperren
./scripts/lock-compromised-accounts.sh --accounts "user1,user2"

# 2. Sessions invalidieren
./scripts/invalidate-sessions.sh --user-ids "123,456"

# 3. Credentials rotieren
./scripts/rotate-credentials.sh --service api,crm --emergency
```

#### Bei Data Leak:
```bash
# 1. Öffentliche Ressourcen entfernen
./scripts/takedown-leaked-data.sh --url "https://pastebin.com/xyz"

# 2. CDN/Cache purgen
./scripts/purge-cdn-cache.sh --all

# 3. Backup isolieren
./scripts/isolate-backup.sh --timestamp "2025-10-12T10:00:00Z"
```

#### Bei Ransomware/Malware:
```bash
# 1. Betroffene Systeme vom Netz trennen
./scripts/network-isolate.sh --hosts "api-server,db-primary"

# 2. Forensik-Snapshot erstellen (BEVOR Bereinigung)
./scripts/create-forensic-snapshot.sh --preserve-evidence

# 3. Incident-Backup erstellen
./scripts/emergency-backup.sh --all --encrypted
```

### 2.2 Impact Assessment

**Betroffene Daten ermitteln**:

```sql
-- Beispiel: Welche User sind betroffen?
SELECT 
  u.id,
  u.email,
  u.created_at,
  COUNT(DISTINCT s.id) AS compromised_sessions
FROM users u
JOIN sessions s ON u.id = s.user_id
WHERE s.created_at BETWEEN '2025-10-01' AND '2025-10-12'
  AND s.ip_address IN (SELECT ip FROM suspicious_ips)
GROUP BY u.id;

-- Beispiel: Welche PII-Felder sind betroffen?
SELECT 
  table_name,
  column_name,
  COUNT(*) AS affected_records
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('email', 'name', 'address', 'phone', 'iban')
GROUP BY table_name, column_name;
```

**DSGVO-Kategorien prüfen**:
- [ ] Stammdaten (Name, Adresse)
- [ ] Kontaktdaten (E-Mail, Telefon)
- [ ] Finanzdaten (IBAN, SEPA-Mandate)
- [ ] Besondere Kategorien (Art. 9 - Gesundheit, politische Meinung etc.)
- [ ] Strafrechtliche Daten (Art. 10)

### 2.3 Root Cause Analysis

**5-Why-Methode**:
1. Was ist passiert? (Symptom)
2. Warum ist es passiert? (Ursache 1)
3. Warum ist das passiert? (Ursache 2)
4. ... (bis zur Root Cause)
5. Wie verhindern wir Wiederholung?

**Dokumentation**:
```markdown
## Incident INC-2025-001: Unauthorized DB Access

**Timeline**:
- 2025-10-12 09:30 UTC: Ungewöhnliche DB-Queries erkannt (Monitoring)
- 2025-10-12 09:45 UTC: Incident Team alarmiert
- 2025-10-12 10:00 UTC: Zugriff blockiert, Forensik gestartet

**Root Cause**: 
- Schwaches Admin-Passwort (Dictionary-Attacke)
- Fehlende MFA für DB-Admin-Account
- Rate-Limiting nicht aktiv

**Impact**:
- 1.234 User-Datensätze (E-Mail, Name, Adresse)
- Keine Finanzdaten betroffen
- Keine Exfiltration nachweisbar (nur Zugriff)

**Risiko-Einstufung**: HOCH (PII, aber keine Exfiltration)
```

---

## 📢 Phase 3: Meldepflichten (4-72 Stunden)

### 3.1 Meldung an Datenschutzbehörde (Art. 33)

**Pflicht, wenn**:
- ✅ PII betroffen UND
- ✅ Risiko für Rechte/Freiheiten der Betroffenen

**Ausnahme (keine Meldepflicht)**:
- ❌ Daten verschlüsselt (und Schlüssel nicht kompromittiert)
- ❌ Nachträgliche Maßnahmen beseitigen Risiko
- ❌ Unverhältnismäßiger Aufwand (dokumentieren!)

**Meldung binnen 72 Stunden**:

```yaml
Meldung an DSB (https://www.dsb.gv.at/datenpannen):

1. Beschreibung der Verletzung:
   - Art der Verletzung (Unauthorized Access, Data Leak, etc.)
   - Zeitpunkt (wann bekanntgeworden?)
   - Betroffene Kategorien personenbezogener Daten

2. Name und Kontaktdaten:
   - Datenschutzbeauftragte:r: [DPO_NAME] - [DPO_EMAIL]
   - Verantwortlicher: Vorstand Menschlichkeit Österreich

3. Beschreibung der wahrscheinlichen Folgen:
   - Risiko für Betroffene (Identitätsdiebstahl, Spam, etc.)
   - Betroffene Personen-Anzahl: [X]

4. Beschreibung der Maßnahmen:
   - Ergriffene Maßnahmen (Containment, Passwort-Reset)
   - Vorgeschlagene Maßnahmen (MFA, Monitoring, Schulung)

5. Ggf. Begründung für verspätete Meldung (>72h):
   - Investigation-Dauer
   - Komplexität der Analyse
```

**Template verwenden**:
```bash
# Meldung generieren
./scripts/generate-dsb-report.sh \
  --incident INC-2025-001 \
  --affected-users 1234 \
  --data-categories "email,name,address" \
  --output docs/incidents/INC-2025-001-dsb-meldung.pdf
```

### 3.2 Benachrichtigung der Betroffenen (Art. 34)

**Pflicht, wenn**:
- ✅ Verletzung birgt **hohes Risiko** für Rechte/Freiheiten UND
- ✅ Keine Verschlüsselung der betroffenen Daten

**Ausnahmen** (keine Benachrichtigung):
- ❌ Unverhältnismäßiger Aufwand → Öffentliche Bekanntmachung
- ❌ Nachträgliche Maßnahmen beseitigen hohes Risiko
- ❌ Verschlüsselung (Schlüssel nicht kompromittiert)

**Benachrichtigung enthält**:
1. Art der Verletzung (in klarer Sprache)
2. Kontakt des DPO ([DPO_EMAIL])
3. Wahrscheinliche Folgen
4. Ergriffene/vorgeschlagene Maßnahmen
5. Empfehlungen für Betroffene (z.B. Passwort ändern)

**E-Mail-Template**:
```markdown
Betreff: Wichtige Sicherheitsinformation – Datenschutzvorfall

Sehr geehrte/r [Name],

am [Datum] haben wir einen Sicherheitsvorfall festgestellt, bei dem 
möglicherweise Ihre personenbezogenen Daten betroffen sind.

**Was ist passiert?**
[Klare Beschreibung ohne technischen Jargon]

**Welche Daten sind betroffen?**
- E-Mail-Adresse
- Name
- [Weitere Kategorien]

**Was haben wir unternommen?**
- Sofortige Sperrung des betroffenen Zugangs
- Sicherheitsmaßnahmen verstärkt (MFA aktiviert)
- Datenschutzbehörde informiert

**Was sollten Sie tun?**
1. Passwort ändern (falls gleiches Passwort anderswo verwendet)
2. Achten Sie auf verdächtige E-Mails (Phishing)
3. Bei Fragen: [DPO_EMAIL]

Wir entschuldigen uns für die Unannehmlichkeiten.

Mit freundlichen Grüßen,
[Vorstand]
[DPO_NAME] (Datenschutzbeauftragte:r)
```

**Versand automatisieren**:
```bash
# Betroffene User identifizieren & benachrichtigen
./scripts/notify-affected-users.sh \
  --incident INC-2025-001 \
  --template templates/incident-notification-de.md \
  --dry-run  # Erst Preview!
```

---

## 🔧 Phase 4: Remediation & Prevention (1-4 Wochen)

### 4.1 Immediate Fixes

**Kurzfristige Maßnahmen** (< 48h):
- [ ] Schwachstelle gepatcht
- [ ] Credentials rotiert (alle betroffenen Services)
- [ ] Monitoring erweitert (neue Detektions-Regeln)
- [ ] Betroffene User benachrichtigt

### 4.2 Long-Term Prevention

**Mittelfristig** (< 4 Wochen):
- [ ] Security Audit durchgeführt
- [ ] Penetration Test beauftragt
- [ ] MFA für alle Admin-Accounts erzwungen
- [ ] Rate-Limiting implementiert
- [ ] Schulung für Team (Incident Learnings)

**Langfristig** (< 3 Monate):
- [ ] Security-by-Design Review aller Services
- [ ] DPIA für risikoreiche Verarbeitungen
- [ ] Incident Response Plan aktualisiert
- [ ] Disaster Recovery getestet

### 4.3 Post-Incident Review

**Dokumentation**:
```markdown
## Post-Incident Review: INC-2025-001

**Datum**: 2025-10-15 (3 Tage nach Incident)
**Teilnehmer**: DPO, CTO, DevOps, Security Team

**Was lief gut?**
- ✅ Schnelle Erkennung (Monitoring)
- ✅ Klare Kommunikation (Incident Channel)
- ✅ DSB-Meldung innerhalb 48h

**Was lief schlecht?**
- ❌ Fehlende MFA für Admin
- ❌ Schwaches Passwort-Policy
- ❌ Keine Incident-Runbooks

**Action Items**:
- [ ] MFA für alle Admin-Accounts (Owner: CTO, Due: 2025-10-20)
- [ ] Passwort-Policy verschärfen (Owner: DevOps, Due: 2025-10-18)
- [ ] Incident-Runbooks erstellen (Owner: Security, Due: 2025-11-01)
```

---

## 🛠️ Tools & Automation

### Incident Management Scripts

```bash
# scripts/incident-toolkit.sh

# 1. Create Incident
./incident-toolkit.sh create \
  --severity CRITICAL \
  --title "Unauthorized DB Access" \
  --affected-services "api,crm"

# 2. Lock Accounts
./incident-toolkit.sh lock-accounts \
  --user-ids "123,456,789"

# 3. Generate DSB Report
./incident-toolkit.sh generate-dsb-report \
  --incident INC-2025-001 \
  --output reports/

# 4. Notify Users
./incident-toolkit.sh notify-users \
  --incident INC-2025-001 \
  --template de \
  --send  # Ohne --send nur Preview

# 5. Close Incident
./incident-toolkit.sh close \
  --incident INC-2025-001 \
  --root-cause "Weak password" \
  --lessons-learned "Enforce MFA"
```

### Monitoring & Alerting

**Automatische Incident-Erkennung**:
- 🔴 **CRITICAL**: PII-Zugriff außerhalb Geschäftszeiten → Sofort-Alert
- 🟠 **HIGH**: Mehrfache Login-Failures → Alarm nach 5 Attempts
- 🟡 **MEDIUM**: Ungewöhnliche DB-Query-Patterns → Daily Digest

**Integration mit n8n**:
```yaml
Workflow: Incident Detection
Trigger: Webhook von Monitoring
Actions:
  1. Severity-Einstufung (KI-basiert)
  2. Incident-Channel erstellen (Matrix/Slack)
  3. DPO alarmieren (wenn CRITICAL)
  4. Forensik-Snapshot triggern
  5. DSB-Meldung vorbereiten (wenn >72h)
```

---

## 📋 Checkliste: 72-Stunden-Countdown

**Stunde 0** (Bekanntwerden):
- [ ] Incident erkannt & dokumentiert
- [ ] Severity eingestuft
- [ ] Incident Commander bestimmt
- [ ] Team alarmiert

**Stunde 1-4** (Containment):
- [ ] Sofortmaßnahmen ergriffen (Zugriff blockiert)
- [ ] Betroffene Daten ermittelt
- [ ] Impact Assessment abgeschlossen
- [ ] Root Cause identifiziert

**Stunde 4-24** (Investigation):
- [ ] Forensische Analyse durchgeführt
- [ ] Anzahl betroffener Personen bekannt
- [ ] Risiko-Einstufung finalisiert
- [ ] Meldepflicht geprüft

**Stunde 24-72** (Meldung):
- [ ] DSB-Meldung vorbereitet
- [ ] Vorstand informiert & Genehmigung eingeholt
- [ ] **Meldung an DSB abgesendet** (spätestens Stunde 72!)
- [ ] Betroffene benachrichtigt (falls hohes Risiko)

**Nach 72 Stunden** (Remediation):
- [ ] Schwachstelle behoben
- [ ] Monitoring erweitert
- [ ] Post-Incident Review geplant
- [ ] Lessons Learned dokumentiert

---

## 🚨 Notfall-Kontakte

| Rolle | Name | E-Mail | Telefon | Verfügbarkeit |
|-------|------|--------|---------|---------------|
| **Incident Commander** | [DPO_NAME] | [DPO_EMAIL] | [DPO_PHONE] | 24/7 |
| **Backup IC** | Vorstand | vorstand@... | [...] | Werktags |
| **Security Team** | - | security@... | - | On-Call |
| **Datenschutzbehörde** | DSB | dsb@dsb.gv.at | +43 1 52 152-0 | Mo-Fr 9-16 |
| **Hosting-Provider** | Plesk Support | [...] | [...] | 24/7 |

---

## 📚 Referenzen

- Art. 33 DSGVO: https://dsgvo-gesetz.de/art-33-dsgvo/
- Art. 34 DSGVO: https://dsgvo-gesetz.de/art-34-dsgvo/
- DSB Österreich: https://www.dsb.gv.at/
- NIST Incident Response: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf

---

**Version**: 1.0  
**Nächste Review**: 2026-01-12 (Quartalsweise)  
**Genehmigt durch**: [Vorstand, DPO]
