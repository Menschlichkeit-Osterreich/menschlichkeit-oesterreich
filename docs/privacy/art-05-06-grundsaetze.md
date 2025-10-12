# Art. 5 & 6 DSGVO – Grundsätze und Rechtsgrundlagen

**Organisation**: Menschlichkeit Österreich (ZVR: 1182213083)  
**Verantwortlicher**: [Vorstand gemäß Statuten]  
**Datenschutzbeauftragte:r**: [DPO_NAME] - [DPO_EMAIL]  
**Stand**: 2025-10-12  
**Timezone**: Europe/Vienna

---

## Art. 5 DSGVO – Grundsätze der Verarbeitung personenbezogener Daten

### 1. Rechtmäßigkeit, Verarbeitung nach Treu und Glauben, Transparenz

**Prinzip**: Personenbezogene Daten müssen auf rechtmäßige Weise, nach Treu und Glauben und in einer für die betroffene Person nachvollziehbaren Weise verarbeitet werden.

**Umsetzung**:
- ✅ Vollständige Datenschutzerklärung unter `/docs/PRIVACY.md` und auf Website
- ✅ Klare Information über Datenverarbeitung bei Erhebung
- ✅ Einwilligungen dokumentiert (Timestamp, IP-Hash, Zweck)
- ✅ Privacy-by-Design in allen Services implementiert

**Technische Maßnahmen**:
```yaml
Services:
  - CRM (CiviCRM): Consent Management integriert
  - API (FastAPI): PII Middleware aktiv
  - Frontend (React): Cookie Consent Banner
  - Gaming Platform: Opt-in für Datenverarbeitung
```

### 2. Zweckbindung

**Prinzip**: Daten dürfen nur für festgelegte, eindeutige und legitime Zwecke erhoben werden.

**Verarbeitungszwecke** (dokumentiert):

| Zweck | Rechtsgrundlage | Datenkategorien | Retention |
|-------|-----------------|-----------------|-----------|
| Mitgliederverwaltung | Art. 6(1)(b) - Vertrag | Name, Adresse, E-Mail, Geburtsdatum | Mitgliedschaft + 1 Jahr |
| Beitragseinhebung | Art. 6(1)(b) - Vertrag | Bankverbindung, SEPA-Mandat | 7 Jahre (BAO) |
| Newsletter/Marketing | Art. 6(1)(a) - Einwilligung | E-Mail, Präferenzen | Bis Widerruf |
| Spendenquittungen | Art. 6(1)(c) - Rechtl. Verpflichtung | Name, Adresse, Betrag | 7 Jahre (BAO) |
| CRM-Kontakthistorie | Art. 6(1)(f) - Berechtigtes Interesse | Interaktionen, Notizen | 3 Jahre |
| Gaming/XP System | Art. 6(1)(b) - Vertrag | User-ID, XP, Achievements | Account-Löschung |

**Verboten**: Weiterverarbeitung für unvereinbare Zwecke ohne neue Rechtsgrundlage.

### 3. Datenminimierung

**Prinzip**: Daten müssen dem Zweck angemessen, erheblich und auf das notwendige Maß beschränkt sein.

**Implementierung**:
- ✅ Opt-in statt Opt-out für nicht-essenzielle Daten
- ✅ Keine Vorratsdatenspeicherung
- ✅ Regelmäßige Datenbereinigung (Cron-Jobs)
- ✅ Anonymisierung wo möglich (Analytics)

**Beispiel** (Gaming Platform):
```typescript
// ❌ FALSCH: Übermäßige Datenerfassung
interface User {
  email: string;
  name: string;
  address: string;      // Nicht benötigt für Gaming
  phone: string;        // Nicht benötigt
  ipAddress: string;    // Zu granular
}

// ✅ RICHTIG: Datenminimierung
interface User {
  id: string;
  displayName: string;  // Pseudonym
  email: string;        // Für Account-Recovery
  consent: {
    timestamp: Date;
    version: string;
  }
}
```

### 4. Richtigkeit

**Prinzip**: Daten müssen sachlich richtig und erforderlichenfalls auf dem neuesten Stand sein.

**Maßnahmen**:
- ✅ Berichtigungsrecht technisch umgesetzt (Self-Service Portal)
- ✅ Regelmäßige Validierung (E-Mail-Verifizierung)
- ✅ Audit-Log bei Datenänderungen
- ✅ Automatische Benachrichtigung bei veralteten Daten

### 5. Speicherbegrenzung

**Prinzip**: Daten dürfen nicht länger gespeichert werden als notwendig.

**Retention Policies**:

```yaml
Automatische Löschung:
  - Newsletter-Abmeldungen: Sofort (nur Hash für Blacklist)
  - Inaktive Accounts: 2 Jahre ohne Login
  - Event-Logs: 90 Tage
  - Debug-Logs: 30 Tage
  - Application-Logs: 180 Tage (PII-sanitized)

Gesetzliche Aufbewahrung:
  - Buchhaltungsbelege: 7 Jahre (BAO § 132)
  - Spendenquittungen: 7 Jahre (Finanzamt)
  - Verträge/Mitgliedschaften: 3 Jahre nach Ende

Langfristig (mit Rechtsgrundlage):
  - Historische Vereinsdaten: Archivzwecke (Art. 89 DSGVO)
```

### 6. Integrität und Vertraulichkeit

**Prinzip**: Daten müssen durch geeignete technische und organisatorische Maßnahmen geschützt werden.

**Siehe**: `docs/privacy/art-32-toms.md` für vollständige TOMs

**Quick Reference**:
- ✅ Verschlüsselung at rest (pgcrypto, LUKS)
- ✅ Verschlüsselung in transit (TLS 1.3)
- ✅ Zugriffskontrolle (RBAC, MFA)
- ✅ Audit-Logging
- ✅ Backup & Disaster Recovery

### 7. Rechenschaftspflicht

**Prinzip**: Der Verantwortliche muss die Einhaltung nachweisen können.

**Nachweise**:
- ✅ Dieses Dokument (Art. 5/6 Compliance)
- ✅ Verzeichnis der Verarbeitungstätigkeiten (`art-30-ropa.md`)
- ✅ TOMs-Dokumentation (`art-32-toms.md`)
- ✅ DPIA bei Risiko-Verarbeitungen (`art-35-dpia.md`)
- ✅ Incident Response Playbook (`art-33-34-incident-playbook.md`)
- ✅ Automatisierte Tests (`tests/test_pii_sanitizer.py`)

---

## Art. 6 DSGVO – Rechtmäßigkeit der Verarbeitung

### Rechtsgrundlagen-Matrix

| Art. 6(1) | Bezeichnung | Anwendungsfälle | Widerruf möglich? |
|-----------|-------------|-----------------|-------------------|
| **(a)** | **Einwilligung** | Newsletter, Marketing, Cookies | ✅ Jederzeit |
| **(b)** | **Vertragserfüllung** | Mitgliedschaft, Beiträge, Services | ❌ Nicht bei aktiver Mitgliedschaft |
| **(c)** | **Rechtliche Verpflichtung** | Steuerrecht (BAO), Meldepflichten | ❌ |
| **(d)** | **Lebenswichtige Interessen** | [Nicht anwendbar] | - |
| **(e)** | **Öffentliches Interesse** | [Nicht anwendbar] | - |
| **(f)** | **Berechtigtes Interesse** | CRM-Historie, Analytics (anonymisiert) | ✅ Mit Widerspruchsrecht |

### 1. Einwilligung (Art. 6(1)(a))

**Anforderungen**:
- ✅ Freiwillig, informiert, eindeutig
- ✅ Aktive Handlung (kein Pre-Check)
- ✅ Granular (separate Einwilligungen)
- ✅ Nachweisbar (Timestamp, IP-Hash, Version)
- ✅ Widerrufbar (Opt-out-Link)

**Implementierung** (CiviCRM):
```sql
-- Consent Tracking Table
CREATE TABLE consent_records (
  id SERIAL PRIMARY KEY,
  contact_id INT REFERENCES contacts(id),
  consent_type VARCHAR(50), -- 'newsletter', 'analytics', 'marketing'
  consent_given BOOLEAN,
  timestamp TIMESTAMPTZ,
  ip_hash VARCHAR(64), -- SHA256(IP) - nicht Plain-IP!
  policy_version VARCHAR(20),
  method VARCHAR(50), -- 'web_form', 'email_click', 'api'
  withdrawn_at TIMESTAMPTZ NULL
);
```

### 2. Vertragserfüllung (Art. 6(1)(b))

**Anwendung**: Daten, die zur Erfüllung des Mitgliedschaftsvertrags erforderlich sind.

**Beispiele**:
- Name, Adresse für Mitgliedskarte
- E-Mail für Veranstaltungseinladungen
- Bankverbindung für Beitragseinzug (SEPA)

**Nicht zulässig unter (b)**: Marketing, Newsletter (→ benötigt Einwilligung (a))

### 3. Rechtliche Verpflichtung (Art. 6(1)(c))

**Anwendung**: Gesetzliche Aufbewahrungspflichten

**Österreichische Gesetze**:
- **BAO § 132**: 7 Jahre Buchhaltungsunterlagen
- **Vereinsgesetz 2002**: Mitgliederverzeichnis
- **FinStrG**: Geldwäsche-Prävention (bei Spenden > €15.000)

### 4. Berechtigtes Interesse (Art. 6(1)(f))

**Anwendung**: Nach Interessenabwägung (Unser Interesse vs. Rechte der Betroffenen)

**Legitime Interessen**:
- ✅ CRM-Kontakthistorie (Vereinsarbeit)
- ✅ Betrugsbekämpfung (Security Logs)
- ✅ Anonymisierte Analytics (Website-Optimierung)

**Interessenabwägung dokumentiert**:
```yaml
Beispiel: CRM-Kontakthistorie
Unser Interesse:
  - Effektive Vereinsarbeit
  - Vermeidung redundanter Anfragen
  - Historische Transparenz

Betroffenenrechte:
  - Datensparsamkeit
  - Informationelle Selbstbestimmung

Abwägung:
  - Speicherdauer: 3 Jahre (angemessen)
  - Zugriff: Nur berechtigte Mitarbeiter:innen
  - Widerspruchsrecht: Gewährt
  - Löschung: Auf Anfrage (außer gesetzl. Aufbewahrung)

Ergebnis: ✅ Berechtigt unter Art. 6(1)(f)
```

---

## Compliance-Checkliste

### Implementierung validieren:

- [x] Alle Verarbeitungszwecke dokumentiert
- [x] Rechtsgrundlagen zugeordnet
- [x] Retention Policies implementiert
- [x] Einwilligungen nachweisbar
- [x] Widerrufsrecht technisch umgesetzt
- [ ] **TODO**: DPO-Kontakt im Frontend anzeigen
- [ ] **TODO**: Privacy Policy auf Website veröffentlichen

### Tests & Automatisierung:

```bash
# PII-Sanitization Tests
pytest tests/test_pii_sanitizer.py

# DSGVO Compliance Check
npm run compliance:dsgvo

# Retention Policy Simulation
./scripts/simulate-data-retention.sh --dry-run
```

---

**Nächste Schritte**:
1. Review durch Datenschutzbeauftragte:n
2. Integration in Datenschutzerklärung
3. Schulung für Funktionsträger:innen
4. Quartalsweise Compliance-Audits

**Verantwortlich**: [DPO_NAME]  
**Review-Zyklus**: Quartalsweise oder bei wesentlichen Änderungen
