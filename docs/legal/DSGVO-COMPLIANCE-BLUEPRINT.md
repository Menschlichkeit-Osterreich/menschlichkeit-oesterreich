# DSGVO Compliance Blueprint

**Version:** 1.0.0  
**Datum:** 2025-10-03  
**Verantwortlich:** Data Protection Officer (DPO)  
**Status:** 🟡 IN ARBEIT

---

## Übersicht

Dieser Blueprint definiert checkbare DSGVO-Compliance-Anforderungen für das Projekt `menschlichkeit-oesterreich-development`. Alle Checkboxen müssen für Production-Release erfüllt sein.

---

## 1. Rechtmäßigkeit der Verarbeitung (Art. 6 DSGVO)

### 1.1 Rechtsgrundlagen dokumentiert

- [ ] Verzeichnis von Verarbeitungstätigkeiten (VVT) erstellt
- [ ] Für jede Datenverarbeitung Rechtsgrundlage dokumentiert
- [ ] Einwilligungen (Art. 6 Abs. 1 lit. a) sind eindeutig und freiwillig
- [ ] Vertragliche Verarbeitungen (Art. 6 Abs. 1 lit. b) klar definiert
- [ ] Berechtigte Interessen (Art. 6 Abs. 1 lit. f) abgewogen und dokumentiert

### 1.2 Spezielle Kategorien (Art. 9 DSGVO)

- [x] Keine Verarbeitung besonderer Kategorien identifiziert
- [ ] Falls doch: Zusätzliche Rechtsgrundlage (Art. 9 Abs. 2) dokumentiert

---

## 2. Transparenz (Art. 12-14 DSGVO)

### 2.1 Datenschutzerklärung

- [ ] Datenschutzerklärung vorhanden und aktuell
- [ ] Enthält alle Pflichtangaben (Art. 13 DSGVO):
  - [ ] Name und Kontaktdaten des Verantwortlichen
  - [ ] DPO-Kontakt (falls vorhanden)
  - [ ] Zwecke und Rechtsgrundlagen
  - [ ] Empfänger/Kategorien von Empfängern
  - [ ] Speicherdauer oder Kriterien
  - [ ] Betroffenenrechte (Auskunft, Löschung, etc.)
  - [ ] Beschwerderecht bei Aufsichtsbehörde
  - [ ] Hinweis auf automatisierte Entscheidungsfindung (falls zutreffend)
- [ ] Datenschutzerklärung leicht zugänglich (z.B. Footer jeder Seite)
- [ ] In allen unterstützten Sprachen verfügbar

### 2.2 Cookie-Hinweis / Consent-Management

- [ ] Cookie-Banner implementiert (falls Cookies gesetzt werden)
- [ ] Opt-In für nicht-essentielle Cookies (ePrivacy-Richtlinie)
- [ ] Granulare Einstellungen (Analytics, Marketing, etc.)
- [ ] Widerrufsmöglichkeit jederzeit gegeben

---

## 3. Betroffenenrechte (Art. 15-22 DSGVO)

### 3.1 Technische Implementierung

| Recht | Artikel | Implementiert | Endpoint/Prozess | Status |
|-------|---------|---------------|------------------|--------|
| **Auskunft** | Art. 15 | ❌ | - | ⏳ TODO |
| **Berichtigung** | Art. 16 | ⚠️ | CRM-UI (manuell) | 🟡 TEILWEISE |
| **Löschung** | Art. 17 | ❌ | - | ⏳ TODO |
| **Einschränkung** | Art. 18 | ❌ | - | ⏳ TODO |
| **Datenportabilität** | Art. 20 | ❌ | - | ⏳ TODO |
| **Widerspruch** | Art. 21 | ❌ | - | ⏳ TODO |

### 3.2 Workflow-Anforderungen

- [ ] Betroffenenanfragen werden innerhalb 1 Monat beantwortet
- [ ] Identitätsprüfung implementiert (z.B. E-Mail-Verifikation)
- [ ] Lösch-Workflows berücksichtigen gesetzliche Aufbewahrungsfristen
- [ ] Dokumentation aller Betroffenenanfragen (Audit-Trail)

---

## 4. Datenschutz durch Technikgestaltung (Art. 25 DSGVO)

### 4.1 Privacy by Design

- [ ] Datenminimierung: Nur notwendige Daten erfassen
- [ ] Pseudonymisierung wo möglich
- [ ] Verschlüsselung:
  - [ ] In Transit (TLS 1.3)
  - [ ] At Rest (Datenbank-Encryption)
- [ ] Zugriffskontrolle:
  - [ ] Role-Based Access Control (RBAC) implementiert
  - [ ] Principle of Least Privilege
  - [ ] Logging aller Zugriffe auf personenbezogene Daten

### 4.2 Privacy by Default

- [ ] Standard-Einstellungen sind datenschutzfreundlichst
- [ ] Opt-In statt Opt-Out für nicht-essentielle Verarbeitung
- [ ] Daten werden automatisch gelöscht nach Ablauf der Zweckbindung

---

## 5. Datensicherheit (Art. 32 DSGVO)

### 5.1 Technische Maßnahmen

- [ ] Pseudonymisierung und Verschlüsselung
- [ ] Vertraulichkeit:
  - [ ] Zugriffskontrolle (siehe Art. 25)
  - [ ] Netzwerksegmentierung
  - [ ] Firewall-Regeln
- [ ] Integrität:
  - [ ] Checksummen für kritische Daten
  - [ ] Immutable Audit-Logs
- [ ] Verfügbarkeit:
  - [ ] Backup-Strategie (RPO ≤ 24h)
  - [ ] Disaster Recovery Plan (RTO ≤ 4h)
- [ ] Belastbarkeit:
  - [ ] Redundanz kritischer Systeme
  - [ ] Load-Balancing
  - [ ] DDoS-Schutz

### 5.2 Organisatorische Maßnahmen

- [ ] Sicherheitsrichtlinie dokumentiert
- [ ] Incident Response Plan vorhanden
- [ ] Regelmäßige Sicherheitstests (Pentests, Vulnerability Scans)
- [ ] Mitarbeiter-Schulungen (Datenschutz-Awareness)
- [ ] Vertraulichkeitsvereinbarungen mit Mitarbeitern

---

## 6. Meldepflichten (Art. 33-34 DSGVO)

### 6.1 Verletzungen des Schutzes personenbezogener Daten

- [ ] Prozess zur Erkennung von Data Breaches definiert
- [ ] Meldung an Aufsichtsbehörde innerhalb 72h (Art. 33)
- [ ] Benachrichtigung betroffener Personen bei hohem Risiko (Art. 34)
- [ ] Dokumentation aller Data Breaches (auch nicht-meldepflichtige)

### 6.2 Vorlage Data Breach Response

```yaml
incident:
  id: "BREACH-2025-XXX"
  detected_at: "YYYY-MM-DD HH:MM:SS UTC"
  reported_at: "YYYY-MM-DD HH:MM:SS UTC"
  severity: "LOW | MEDIUM | HIGH | CRITICAL"
  
affected_data:
  categories: ["Kontaktdaten", "Spendendaten", ...]
  data_subjects_count: 0
  data_fields: ["name", "email", ...]
  
root_cause: "SQL-Injection / Misconfiguration / ..."
  
mitigation:
  actions_taken: ["Patch deployed", "Accounts notified", ...]
  residual_risk: "LOW"
  
notification:
  authority_notified: true/false
  authority_name: "Österreichische Datenschutzbehörde"
  data_subjects_notified: true/false
```

---

## 7. Datenschutz-Folgenabschätzung (Art. 35 DSGVO)

### 7.1 DPIA-Pflicht prüfen

**Auslöser (mindestens 1 Kriterium):**
- [ ] Systematische umfangreiche Verarbeitung besonderer Kategorien (Art. 9)
- [ ] Systematische umfangreiche Überwachung öffentlich zugänglicher Bereiche
- [ ] Innovative Technologien mit hohem Risiko

**Ergebnis:** 
- [ ] DPIA erforderlich → DPIA durchführen
- [x] DPIA nicht erforderlich → Dokumentieren warum nicht

### 7.2 DPIA-Inhalte (falls erforderlich)

- [ ] Beschreibung der Verarbeitungsvorgänge
- [ ] Zwecke der Verarbeitung
- [ ] Bewertung der Notwendigkeit und Verhältnismäßigkeit
- [ ] Bewertung der Risiken für Betroffene
- [ ] Geplante Abhilfemaßnahmen

---

## 8. Auftragsverarbeitung (Art. 28 DSGVO)

### 8.1 Externe Dienstleister

| Dienstleister | Service | AV-Vertrag | DSGVO-konform | Status |
|---------------|---------|------------|---------------|--------|
| GitHub | Repository-Hosting | [ ] | [ ] | ⏳ TODO |
| Plesk | Webhosting | [ ] | [ ] | ⏳ TODO |
| Figma | Design-Tool | [ ] | [ ] | ⏳ TODO |
| n8n.io | Automation (Self-Hosted) | N/A | ✅ | ✅ OK |

### 8.2 AV-Vertrag Checkliste

- [ ] Schriftlicher Vertrag vorhanden
- [ ] Weisungsbefugnis des Verantwortlichen geregelt
- [ ] Vertraulichkeitspflichten
- [ ] Technische und organisatorische Maßnahmen (TOMs) dokumentiert
- [ ] Unterauftragsverarbeitung nur mit Genehmigung
- [ ] Unterstützung bei Betroffenenrechten
- [ ] Löschung/Rückgabe der Daten nach Auftragsende
- [ ] Auditrechte des Verantwortlichen

---

## 9. Internationale Datenübermittlung (Art. 44-50 DSGVO)

### 9.1 Drittstaatenübermittlungen

| Empfänger | Land | Rechtsgrundlage | Status |
|-----------|------|-----------------|--------|
| GitHub (Microsoft) | USA | EU-US Data Privacy Framework | ⚠️ Prüfen |
| Figma (Adobe) | USA | Standardvertragsklauseln (SCCs) | ⚠️ Prüfen |

### 9.2 Angemessenheitsbeschluss oder Garantien

- [ ] Angemessenheitsbeschluss der EU-Kommission (Art. 45)
- [ ] Standardvertragsklauseln (SCCs) abgeschlossen (Art. 46 Abs. 2 lit. c)
- [ ] Zusätzliche Schutzmaßnahmen (Schrems-II-konform)

---

## 10. Automatisierte Checks (CI/CD)

### 10.1 Automatisierte Tests

```yaml
# .github/workflows/dsgvo-compliance.yml
name: DSGVO Compliance Check

on: [push, pull_request]

jobs:
  privacy-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check for PII in Logs
        run: |
          # Scan code for patterns like email, phone, etc.
          grep -r -E "\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b" src/ || true
          
      - name: Validate Consent Mechanisms
        run: |
          # Check if consent is implemented
          test -f "src/components/CookieConsent.tsx"
          
      - name: SBOM Licensing Check
        run: |
          # Ensure no GPL-licensed dependencies (if applicable)
          npx license-checker --summary
```

### 10.2 Manuelle Quartals-Reviews

- [ ] Q1: Review aller Datenverarbeitungen
- [ ] Q2: Update Datenschutzerklärung
- [ ] Q3: Security-Audit
- [ ] Q4: DPIA-Review (falls vorhanden)

---

## 11. Dokumentations-Repository

### 11.1 Erforderliche Dokumente

- [ ] `docs/legal/datenschutzerklaerung.md`
- [ ] `docs/legal/impressum.md`
- [ ] `docs/legal/verzeichnis-verarbeitungstatigkeiten.md`
- [ ] `docs/legal/auftragsverarbeitung/` (Verträge)
- [ ] `docs/legal/dpia/` (falls erforderlich)
- [ ] `security/incident-response-plan.md`

---

## 12. Compliance-Status

### Gesamt-Score

**Erfüllt:** 2 / 87 Checkboxen (2.3%)  
**Status:** 🔴 NICHT COMPLIANT

### Kritische Lücken

1. 🔴 Keine Datenschutzerklärung
2. 🔴 Keine Betroffenenrechte-Workflows
3. 🔴 Keine Verschlüsselung at Rest
4. 🔴 Keine AV-Verträge
5. 🔴 PII in Logs nicht gesichert

---

## Nächste Schritte

1. **SOFORT:** Datenschutzerklärung erstellen
2. **Diese Woche:** VVT anlegen
3. **Diese Woche:** Lösch-Workflows implementieren
4. **Nächste Woche:** AV-Verträge einholen
5. **Monat 1:** Encryption-at-Rest aktivieren

---

**Review-Zyklus:** Quartalsweise  
**Nächste Review:** 2025-12-31  
**Verantwortlich:** DPO / Legal Team
