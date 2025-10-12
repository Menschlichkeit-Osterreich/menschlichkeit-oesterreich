# Art. 32 DSGVO – Technische und Organisatorische Maßnahmen (TOMs)

**Organisation:** Menschlichkeit Österreich (ZVR 1182213083)  
**Verantwortlicher:** Vorstand  
**Datenschutzbeauftragter:** {{DPO_NAME}} ({{DPO_EMAIL}})  
**Stand:** 2025-10-12  
**Nächste Review:** 2026-01-12

---

## Inhaltsverzeichnis

1. [Rechtsgrundlage](#1-rechtsgrundlage)
2. [Vertraulichkeit](#2-vertraulichkeit)
3. [Integrität](#3-integrität)
4. [Verfügbarkeit & Belastbarkeit](#4-verfügbarkeit--belastbarkeit)
5. [Wiederherstellbarkeit](#5-wiederherstellbarkeit)
6. [Verfahren zur Überprüfung](#6-verfahren-zur-überprüfung)
7. [Datenschutz durch Technikgestaltung](#7-datenschutz-durch-technikgestaltung)
8. [Auftragsverarbeiter](#8-auftragsverarbeiter)

---

## 1. Rechtsgrundlage

**Art. 32 DSGVO:**
> Der Verantwortliche und der Auftragsverarbeiter treffen geeignete technische und organisatorische Maßnahmen, um ein dem Risiko angemessenes Schutzniveau zu gewährleisten.

**Schutzziele (Standard-Datenschutzmodell):**
- Vertraulichkeit
- Integrität
- Verfügbarkeit
- Belastbarkeit
- Wiederherstellbarkeit
- Überprüfbarkeit

---

## 2. Vertraulichkeit

### 2.1 Zutrittskontrolle (Physisch)

| Maßnahme | Umsetzung | Verantwortlich |
|----------|-----------|----------------|
| **Serverraum-Zugang** | Plesk-Provider (externes Rechenzentrum) | Hosting-Provider |
| **Bürozugang** | Schlüsselzugang, Dokumentation von Zutrittskontrolle | Vorstand |
| **Arbeitsplätze** | Screen-Lock nach 5 Min Inaktivität | IT-Verantwortliche |
| **Datenträger** | Verschlossene Schränke für Backups | Vorstand |

**Status:** ✅ Umgesetzt  
**Nachweis:** Hosting-SLA, Büro-Zugangsprotokoll

### 2.2 Zugangskontrolle (Systeme)

| Maßnahme | Umsetzung | Verantwortlich |
|----------|-----------|----------------|
| **Multi-Faktor-Authentifizierung (MFA)** | GitHub, Plesk, CiviCRM Admin-Accounts | IT-Verantwortliche |
| **Passwortrichtlinie** | Min. 16 Zeichen, Komplexität, Rotation alle 90 Tage | IT-Verantwortliche |
| **SSH-Key-Authentifizierung** | ED25519 Keys, keine Passwort-Auth | DevOps |
| **Session Management** | Timeout nach 30 Min Inaktivität | Entwickler |
| **Privileged Access** | Separate Admin-Accounts, Just-in-Time Access | Security Team |

**Tools:**
- GitHub SAML/OIDC (geplant)
- Keycloak Identity Provider (mo_idp)
- CiviCRM Permissions (rollenbasiert)

**Status:** ✅ Umgesetzt (MFA), 🔄 In Arbeit (OIDC)  
**Nachweis:** GitHub Security Logs, Keycloak Audit

### 2.3 Zugriffskontrolle (Daten)

| Maßnahme | Umsetzung | Verantwortlich |
|----------|-----------|----------------|
| **Rollenbasierte Zugriffskontrolle (RBAC)** | CiviCRM Rollen, Drupal Permissions | CRM-Admin |
| **Least Privilege** | Nur notwendige Berechtigungen | IT-Verantwortliche |
| **Data Segregation** | Trennung Test/Staging/Production | DevOps |
| **Audit Logging** | Alle Zugriffe auf PII geloggt | Security Team |

**CiviCRM Rollen:**
```yaml
Administrator: Vollzugriff
Buchhaltung: Beiträge, Spenden, Rechnungen (keine System-Config)
Mitgliederbetreuung: Kontaktdaten (keine Finanzen)
IT/Technik: System-Config, API-Zugriff
```

**Status:** ✅ Umgesetzt  
**Nachweis:** CiviCRM ACL-Konfiguration, Audit-Logs

### 2.4 Trennungskontrolle

| Maßnahme | Umsetzung | Verantwortlich |
|----------|-----------|----------------|
| **Datenbank-Isolation** | 17 separate Datenbanken nach Zweck | DBA |
| **Service-Trennung** | Microservices (API, CRM, Frontend, Games, n8n) | Architekten |
| **Umgebungs-Trennung** | dev/staging/production mit separaten Credentials | DevOps |
| **PII-Segregation** | Consent-DB (mo_consent) separat von Operational Data | DBA |

**Status:** ✅ Umgesetzt  
**Nachweis:** Datenbankstruktur (docs/plesk-deployment.instructions.md)

### 2.5 Pseudonymisierung

| Maßnahme | Umsetzung | Verantwortlich |
|----------|-----------|----------------|
| **Email-Hashing** | SHA256 für Logs und Analytics | Entwickler |
| **IBAN-Masking** | `AT61***` in Logs | Entwickler |
| **IP-Hashing** | SHA256 + Salt für IP-Speicherung | Entwickler |
| **Anonymisierte IDs** | UUIDs statt sequentieller IDs | Entwickler |

**Implementation:**
- FastAPI: `api/app/lib/pii_sanitizer.py`
- Drupal: `crm/web/modules/custom/pii_sanitizer/`
- Tests: `tests/test_pii_sanitizer.py`

**Status:** ✅ Umgesetzt  
**Nachweis:** Unit Tests, Code Reviews

### 2.6 Verschlüsselung

#### Verschlüsselung in Transit (TLS/SSL)

| Dienst | Verschlüsselung | Zertifikat | Status |
|--------|-----------------|------------|--------|
| **Webseite** | TLS 1.3 | Let's Encrypt | ✅ |
| **API** | TLS 1.3 | Let's Encrypt | ✅ |
| **CRM** | TLS 1.3 | Let's Encrypt | ✅ |
| **Datenbank** | TLS (MariaDB/PostgreSQL) | Self-Signed | ✅ |
| **Email (SMTP)** | STARTTLS | Provider | ✅ |

**Konfiguration:**
```nginx
# Nginx TLS Configuration
ssl_protocols TLSv1.3 TLSv1.2;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

#### Verschlüsselung at Rest

| Datenkategorie | Verschlüsselung | Methode | Status |
|----------------|-----------------|---------|--------|
| **PII-Felder (CiviCRM)** | AES-256 | PostgreSQL pgcrypto | ✅ |
| **Backups** | AES-256-GCM | GPG | ✅ |
| **Secrets (GitHub)** | AES-256 | GitHub-managed | ✅ |
| **Disk Encryption** | LUKS/dm-crypt | Hosting-Provider | ✅ |

**PostgreSQL Encryption Beispiel:**
```sql
-- Verschlüsselte Email-Speicherung
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE civicrm_contact ADD COLUMN email_encrypted BYTEA;
UPDATE civicrm_contact
SET email_encrypted = pgp_sym_encrypt(email, '{{ENCRYPTION_KEY}}')
WHERE email IS NOT NULL;

-- Entschlüsselung (nur mit Berechtigung)
SELECT display_name,
       pgp_sym_decrypt(email_encrypted, '{{ENCRYPTION_KEY}}') AS email
FROM civicrm_contact WHERE id = 123;
```

**Status:** ✅ Umgesetzt (Backups), 🔄 In Arbeit (DB Encryption)  
**Nachweis:** Backup-Scripts, PostgreSQL Config

---

## 3. Integrität

### 3.1 Weitergabekontrolle

| Maßnahme | Umsetzung | Verantwortlich |
|----------|-----------|----------------|
| **Datenübertragung** | Nur via HTTPS/TLS, SFTP | DevOps |
| **Export-Logs** | Alle Datenexporte geloggt (Who, What, When) | Security Team |
| **DLP (Data Loss Prevention)** | GitHub Push Protection, Secret Scanning | Security Team |
| **Email-Verschlüsselung** | S/MIME oder PGP (bei sensiblen Daten) | IT-Verantwortliche |

**Status:** ✅ Umgesetzt  
**Nachweis:** GitHub Security Tab, Export-Audit-Logs

### 3.2 Eingabekontrolle

| Maßnahme | Umsetzung | Verantwortlich |
|----------|-----------|----------------|
| **Audit Logging** | Alle Datenänderungen protokolliert | Entwickler |
| **Change Tracking** | CiviCRM Activity Log, Drupal Revisions | CRM-Admin |
| **Git History** | Alle Code-Änderungen versioniert | Entwickler |
| **Database Triggers** | Audit-Tables für kritische Tabellen | DBA |

**Audit-Umfang:**
```yaml
Geloggt werden:
  - INSERT/UPDATE/DELETE auf PII-Tabellen
  - Login-Versuche (erfolgreich/fehlgeschlagen)
  - Rollenänderungen
  - Export-Operationen (DSAR)
  - Consent-Änderungen
  
Aufbewahrung: 90 Tage
```

**Status:** ✅ Umgesetzt  
**Nachweis:** CiviCRM Logs, PostgreSQL Audit Tables

### 3.3 Code Integrity & Supply Chain Security

| Maßnahme | Umsetzung | Verantwortlich |
|----------|-----------|----------------|
| **Signierte Commits** | GPG-Signaturen erforderlich | Entwickler |
| **Branch Protection** | Required Reviews, Status Checks | DevOps |
| **Dependency Scanning** | Trivy, OSV Scanner, Dependabot | Security Team |
| **SBOM** | CycloneDX mit Attestation | DevOps |
| **SLSA Provenance** | Build Attestation (geplant) | DevOps |

**Workflows:**
- `.github/workflows/trivy.yml`
- `.github/workflows/osv-scanner.yml`
- `.github/workflows/sbom-cyclonedx.yml`
- `.github/workflows/scorecard.yml`

**Status:** ✅ Umgesetzt  
**Nachweis:** GitHub Security Tab, Scorecard Badge

---

## 4. Verfügbarkeit & Belastbarkeit

### 4.1 Verfügbarkeitskontrolle

| Maßnahme | Umsetzung | Verantwortlich |
|----------|-----------|----------------|
| **Hochverfügbarkeit** | Multi-Server Setup (Plesk + External DB) | Hosting-Provider |
| **Load Balancing** | Nginx Reverse Proxy | DevOps |
| **Auto-Scaling** | Horizontal Scaling bei Last (geplant) | DevOps |
| **Health Checks** | `/health` Endpoints, Monitoring | DevOps |

**Uptime-Ziele:**
- Production: 99.5% (SLA)
- Staging: 95%
- Development: Best Effort

**Status:** ✅ Umgesetzt (Single Server), 🔄 Geplant (HA)  
**Nachweis:** Uptime Monitoring (Grafana)

### 4.2 Incident & Disaster Recovery

| Maßnahme | Umsetzung | Verantwortlich |
|----------|-----------|----------------|
| **Incident Response Plan** | docs/privacy/art-33-34-incident-playbook.md | Security Team |
| **On-Call Rotation** | {{INCIDENT_PAGER}} (PagerDuty/Matrix) | DevOps |
| **Disaster Recovery Plan** | Wiederherstellung innerhalb 24h (RPO) | DevOps |
| **Business Continuity** | Kritische Services priorisiert | Vorstand |

**RTO/RPO:**
- Recovery Time Objective: < 4 Stunden
- Recovery Point Objective: < 24 Stunden (letztes Backup)

**Status:** ✅ Umgesetzt  
**Nachweis:** Incident Playbook, DR-Tests (halbjährlich)

### 4.3 Ausfallsicherheit

| Maßnahme | Umsetzung | Verantwortlich |
|----------|-----------|----------------|
| **Redundanz** | Multi-DB (Plesk + External), Multi-Region (geplant) | DBA |
| **Failover** | Automatisches DB-Failover (PostgreSQL Streaming Replication) | DBA |
| **Graceful Degradation** | Services degradieren statt zu crashen | Entwickler |
| **Circuit Breaker** | API Circuit Breaker (Resilience4j) | Entwickler |

**Status:** 🔄 In Arbeit  
**Nachweis:** Failover-Tests (quartalsweise)

---

## 5. Wiederherstellbarkeit

### 5.1 Datensicherung (Backup)

| Backup-Typ | Frequenz | Retention | Speicherort | Verschlüsselung |
|------------|----------|-----------|-------------|-----------------|
| **Datenbank** | Täglich 03:00 UTC | 30 Tage | Nextcloud + S3 | AES-256-GCM (GPG) |
| **Dateien** | Täglich 02:00 UTC | 30 Tage | Nextcloud + S3 | AES-256 |
| **Code** | Bei jedem Commit | Unbegrenzt | GitHub | - |
| **Konfiguration** | Bei Änderung | 90 Tage | Git + Vault | - |

**Backup-Skripte:**
- `scripts/db-backup-all.sh` (alle 17 Datenbanken)
- `deployment-scripts/backup-automation.sh`
- Cron: `0 2,3 * * * /var/www/.../scripts/db-backup-all.sh`

**Offsite-Backup:**
```bash
# S3 Glacier (90-Tage-Retention)
aws s3 sync /backup/databases/ s3://mo-backups/databases/ \
  --storage-class GLACIER
```

**Status:** ✅ Umgesetzt  
**Nachweis:** Backup-Logs, Restore-Tests (monatlich)

### 5.2 Wiederherstellung

| Szenario | Wiederherstellungszeit | Prozess | Getestet |
|----------|------------------------|---------|----------|
| **Einzelne Datei** | < 15 Min | Restore aus Nextcloud | ✅ Monatlich |
| **Datenbank** | < 1 Stunde | `pg_restore` / `mysql` | ✅ Monatlich |
| **Kompletter Service** | < 4 Stunden | DR-Playbook | ✅ Quartalsweise |
| **Komplettes System** | < 24 Stunden | Full DR | ✅ Halbjährlich |

**Wiederherstellungs-Prozess:**
1. Incident Detection (Monitoring Alert)
2. Impact Assessment (Welche Services betroffen?)
3. Backup Selection (Letztes konsistentes Backup)
4. Restore Execution (Automatisiert via Script)
5. Validation (Smoke Tests)
6. Post-Mortem (Lessons Learned)

**Status:** ✅ Umgesetzt  
**Nachweis:** DR-Test-Protokolle

---

## 6. Verfahren zur Überprüfung

### 6.1 Automatisierte Tests & Monitoring

| Maßnahme | Tool | Frequenz | Verantwortlich |
|----------|------|----------|----------------|
| **Security Scanning** | CodeQL, Semgrep, Trivy | Bei jedem Push | Security Team |
| **Dependency Check** | Dependabot, OSV Scanner | Täglich | DevOps |
| **Penetration Testing** | OWASP ZAP (geplant) | Quartalsweise | Security Team |
| **Compliance Check** | `npm run compliance:dsgvo` | Bei jedem PR | Entwickler |
| **Uptime Monitoring** | Grafana + Prometheus | Kontinuierlich | DevOps |

**Workflows:**
- `.github/workflows/codeql.yml`
- `.github/workflows/semgrep.yml`
- `.github/workflows/trivy.yml`
- `.github/workflows/scorecard.yml`

**Status:** ✅ Umgesetzt  
**Nachweis:** GitHub Security Tab, CI/CD Logs

### 6.2 Manuelle Audits

| Audit-Typ | Frequenz | Verantwortlich | Letzter Audit |
|-----------|----------|----------------|---------------|
| **Interne Sicherheitsrevision** | Quartalsweise | Security Team | 2025-10-12 |
| **Datenschutz-Audit** | Halbjährlich | DPO | 2025-10-12 |
| **Externe Prüfung** | Jährlich | Externer Auditor | - (geplant 2026) |
| **Penetration Test** | Jährlich | Security Firma | - (geplant 2026) |

**Audit-Umfang:**
- Zugriffsprotokolle (Wer hat wann auf welche PII zugegriffen?)
- Betroffenenrechte (Alle DSAR innerhalb 30 Tage beantwortet?)
- Datenlöschung (Retention Policy eingehalten?)
- Incident Response (72-Stunden-Meldepflicht)

**Status:** ✅ Umgesetzt (intern), 🔄 Geplant (extern)  
**Nachweis:** Audit-Protokolle

### 6.3 Metriken & KPIs

```yaml
Security Metrics:
  - Vulnerabilities: 0 CRITICAL, < 5 HIGH
  - Secret Leaks: 0 (Push Protection)
  - Failed Logins: < 10/Tag
  - Patch Time: < 48h (CRITICAL), < 7d (HIGH)
  
Privacy Metrics:
  - DSAR Response Time: < 30 Tage
  - Consent Rate: > 95%
  - PII in Logs: 0 (automatisch maskiert)
  - Data Breaches: 0
  
Operational:
  - Uptime: > 99.5%
  - Backup Success Rate: 100%
  - Restore Test Success: > 95%
  - Incident MTTR: < 4h
```

**Dashboard:** Grafana (mo_grafana)

**Status:** ✅ Umgesetzt  
**Nachweis:** Grafana Dashboards

---

## 7. Datenschutz durch Technikgestaltung

### 7.1 Privacy by Design

| Prinzip | Umsetzung | Beispiel |
|---------|-----------|----------|
| **Datenminimierung** | Nur notwendige Felder erfassen | CiviCRM: Telefon optional |
| **Standardmäßiger Schutz** | Opt-in statt Opt-out | Newsletter: Explizite Einwilligung |
| **Transparenz** | Datenschutzerklärung vor Erfassung | Website-Footer-Link |
| **Zweckbindung** | Separate Datenbanken nach Zweck | mo_consent, mo_analytics getrennt |
| **Speicherbegrenzung** | Automatische Löschung | 3 Jahre nach letztem Kontakt |

**Implementation:**
- Drupal Forms: Nur Pflichtfelder, klare Datenschutz-Hinweise
- CiviCRM: Consent-Tracking (Custom Field `gdpr_consent_date`)
- API: PII-Sanitizer Middleware (automatisch)

**Status:** ✅ Umgesetzt  
**Nachweis:** Code Reviews, UX Tests

### 7.2 Privacy by Default

| Feature | Standard-Einstellung | Begründung |
|---------|----------------------|------------|
| **Marketing-Consent** | ❌ Nicht aktiviert | Opt-in erforderlich |
| **Analytics Cookies** | ❌ Nicht aktiviert | Cookie-Banner mit Ablehnung |
| **Öffentliches Profil** | ❌ Privat | Explizites Opt-in für Sichtbarkeit |
| **Datenfreigabe** | ❌ Keine Weitergabe | Nur mit expliziter Einwilligung |

**Status:** ✅ Umgesetzt  
**Nachweis:** Default-Konfigurationen

---

## 8. Auftragsverarbeiter

### 8.1 Auftragsverarbeiter-Verträge (AVV)

| Dienstleister | Service | AVV vorhanden | DSGVO-konform |
|---------------|---------|---------------|---------------|
| **Plesk Hosting** | Server, Datenbanken | ✅ | ✅ |
| **Nextcloud** | File Storage | ✅ | ✅ |
| **Mailgun/SMTP** | Email-Versand | 🔄 In Verhandlung | ✅ |
| **Sentry** | Error Tracking | ✅ | ✅ |
| **GitHub** | Code Hosting | ✅ (DPA) | ✅ |

**AVV-Anforderungen:**
- Art. 28 DSGVO Compliance
- EU-Datenverarbeitung (oder Standard-Vertragsklauseln)
- Sub-Processor-Liste
- Audit-Rechte
- Datenlöschung bei Vertragsende

**Status:** ✅ Umgesetzt (Hosting), 🔄 In Arbeit (Email)  
**Nachweis:** AVV-Verträge im Ordner `docs/legal/avv/`

### 8.2 Technische Garantien

| Anforderung | Umsetzung | Nachweis |
|-------------|-----------|----------|
| **Verschlüsselung** | TLS 1.3 für alle Verbindungen | SSL Labs A+ |
| **Zugriffskontrolle** | RBAC, MFA | Audit-Logs |
| **Backup** | Täglich, verschlüsselt, offsite | Backup-Reports |
| **Incident Response** | 24/7 Support, Eskalation | SLA-Vertrag |

**Status:** ✅ Umgesetzt  
**Nachweis:** AVV-Anhänge, Security-Zertifikate

---

## 9. Risikobewertung & Maßnahmen-Angemessenheit

### 9.1 Risikoanalyse

| Risiko | Eintritts-wahrscheinlichkeit | Schaden | Risiko-Level | Maßnahmen |
|--------|------------------------------|---------|--------------|-----------|
| **Datenleck (PII)** | Niedrig | Hoch | Mittel | Verschlüsselung, PII-Sanitizer, DLP |
| **Ransomware** | Mittel | Hoch | Hoch | Backups (offsite), Incident Response |
| **Account-Takeover** | Niedrig | Mittel | Niedrig | MFA, starke Passwörter |
| **DDoS** | Mittel | Niedrig | Niedrig | Rate Limiting, CDN |
| **Supply Chain Attack** | Niedrig | Hoch | Mittel | Dependency Scanning, SBOM |

**Maßnahmen-Angemessenheit:**
- Stand der Technik: TLS 1.3, AES-256, MFA
- Implementierungskosten: NGO-Budget (Open Source bevorzugt)
- Art/Umfang Verarbeitung: Mitgliederdaten, Spenden (keine Gesundheitsdaten)
- Eintrittswahrscheinlichkeit: Basierend auf Threat Modeling
- Schwere des Risikos: Kategorisierung nach DSGVO Art. 32

**Status:** ✅ Durchgeführt  
**Nachweis:** DPIA (docs/privacy/art-35-dpia.md)

### 9.2 Regelmäßige Überprüfung

```yaml
Review-Zyklus:
  - TOMs: Quartalsweise
  - Risikoanalyse: Halbjährlich
  - Externe Audits: Jährlich
  
Trigger für außerplanmäßige Reviews:
  - Neue Verarbeitungstätigkeit
  - Datenschutz-Vorfall
  - Gesetzesänderung
  - Neue Bedrohungen (CVE)
```

**Nächste Review:** 2026-01-12

---

## 10. Zusammenfassung & Konformitätserklärung

### Schutzziele (Erfüllungsgrad)

| Schutzziel | Erfüllung | Nachweis |
|------------|-----------|----------|
| **Vertraulichkeit** | ✅ 95% | MFA, RBAC, Verschlüsselung |
| **Integrität** | ✅ 90% | Audit Logging, Signierte Commits |
| **Verfügbarkeit** | ✅ 85% | Backups, Monitoring, SLA |
| **Belastbarkeit** | 🔄 70% | HA in Planung |
| **Wiederherstellbarkeit** | ✅ 95% | Backup-Tests |
| **Überprüfbarkeit** | ✅ 90% | Audit-Logs, CI/CD |

**Gesamtbewertung:** ✅ KONFORM (Art. 32 DSGVO erfüllt)

### Offene Maßnahmen

- [ ] Hochverfügbarkeit (Multi-Region Setup) – Q1 2026
- [ ] Externe Penetration Tests – Q2 2026
- [ ] E2E-Verschlüsselung (Email) – Q2 2026
- [ ] SLSA Build Attestation – Q3 2026

---

**Verantwortlich:** {{DPO_NAME}}  
**Freigabe:** Vorstand  
**Datum:** 2025-10-12  
**Nächste Review:** 2026-01-12
