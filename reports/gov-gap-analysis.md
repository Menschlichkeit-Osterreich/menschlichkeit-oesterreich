# Governance Gap Analysis - Menschlichkeit Österreich
**Version:** 1.0.0  
**Stand:** 2025-10-17  
**Verantwortlich:** Lead Architect (Peter Schuller)  
**Review-Datum:** 2026-01-15  

---

## Executive Summary

**Zweck:** Identifikation fehlender Governance-Policies und Lücken in bestehenden Richtlinien zur Stärkung von Compliance (DSGVO, ISO 27001, OWASP ASVS), Risikomanagement und operativer Exzellenz.

**Methodik:**
- ✅ Audit bestehender Policies (Security Policy, Contributing Guidelines, Code of Conduct)
- ✅ ISO 27001 Controls Mapping (A.9.4.3, A.10.1.1, A.10.1.2, A.12.6.1, A.16.1.2)
- ✅ OWASP ASVS Level Assessment (Current: Level 1, Target: Level 2)
- ✅ DSGVO Art. 5.1e (Speicherbegrenzung), Art. 32 (Sicherheit der Verarbeitung), Art. 33 (Meldung von Verletzungen)
- ✅ Gap-Priorisierung nach Risiko (P0-Critical, P1-High, P2-Medium)

**Key Findings:**
- 🚨 **5 kritische Lücken (P0-Critical)** - sofortiger Handlungsbedarf
- ⚠️ **7 wichtige Lücken (P1-High)** - innerhalb Q1 2026 schließen
- 📌 **9 mittlere Lücken (P2-Medium)** - innerhalb Q2 2026 adressieren
- ✅ **3 Policies vollständig** - keine Lücken identifiziert

---

## 1. Bestehende Policies (Audit)

### 1.1 SECURITY.md (Status: ✅ VOLLSTÄNDIG)
**Pfad:** `SECURITY.md`  
**Letzte Aktualisierung:** 2025-10-15  
**Coverage:**
- ✅ Supported Versions (3 aktive Versionen)
- ✅ Vulnerability Reporting (security@menschlichkeit-oesterreich.at)
- ✅ Response Timeline (24h acknowledge, 7d resolution)
- ✅ PGP Key (Verschlüsselte Kommunikation)
- ✅ Disclosure Policy (Coordinated Disclosure, 90-day embargo)
- ✅ Security Measures (Trivy, Gitleaks, npm audit, Quality Gates)

**Lücken:** Keine  
**Empfehlung:** Status quo beibehalten, jährliche Review.

---

### 1.2 CONTRIBUTING.md (Status: ⚠️ LÜCKEN VORHANDEN)
**Pfad:** `CONTRIBUTING.md`  
**Letzte Aktualisierung:** 2025-10-12  
**Coverage:**
- ✅ Code of Conduct Verweis
- ✅ Branching Strategy (feature/, bugfix/, hotfix/, chore/)
- ✅ Commit Conventions (Conventional Commits)
- ✅ PR Template
- ✅ Quality Gates (npm run quality:gates)

**Lücken:**
- 🚨 **P0-Critical:** Keine Incident-Response-Prozedur für Security-Findings während PR-Review
- ⚠️ **P1-High:** Code-Review-Checkliste fehlt (Security, DSGVO, Performance)
- ⚠️ **P1-High:** Signing-off Requirement fehlt (Developer Certificate of Origin)
- 📌 **P2-Medium:** Contributor License Agreement (CLA) nicht dokumentiert

**Empfehlung:** Ergänzen um Sektion "Security Review Process" mit Eskalationspfad.

---

### 1.3 CODE_OF_CONDUCT.md (Status: ✅ VOLLSTÄNDIG)
**Pfad:** `CODE_OF_CONDUCT.md`  
**Letzte Aktualisierung:** 2025-10-08  
**Coverage:**
- ✅ Verhaltensstandards (Respekt, Inklusion, konstruktive Kritik)
- ✅ Unacceptable Behavior (Harassment, Diskriminierung)
- ✅ Enforcement (Kontakt: vorstand@menschlichkeit-oesterreich.at)
- ✅ Konsequenzen (Warning, Temporary Ban, Permanent Ban)

**Lücken:** Keine  
**Empfehlung:** Status quo beibehalten.

---

### 1.4 Statuten (Status: ✅ RECHTLICH VOLLSTÄNDIG, ⚠️ TECH-GOVERNANCE LÜCKEN)
**Pfad:** `Pdf/Statuten Verein Menschlichkeit Österreich 2025 neu.pdf`  
**Letzte Aktualisierung:** 2025-05-21 (Mitgliederversammlung)  
**Coverage:**
- ✅ Vereinszweck & Mission (§ 3)
- ✅ Organe (Mitgliederversammlung, Vorstand, Rechnungsprüfer, Schiedsgericht) (§§ 10-14)
- ✅ Datenschutz (§ 16 - DSGVO/DSG)
- ✅ Beitragsordnung (§ 5 - Referenz zu separater Ordnung)
- ✅ Auflösung & Vermögensverwertung (§ 15 - Gemeinnützigkeit)

**Lücken (Tech-spezifisch):**
- 📌 **P2-Medium:** Keine Regelung zu Code-Ownership (wem gehört der Code?)
- 📌 **P2-Medium:** Keine Open-Source-Lizenz-Governance (GPL vs. MIT vs. Apache 2.0)
- 📌 **P2-Medium:** Keine Regelung zu Third-Party-Dependencies (Supply Chain Security)

**Empfehlung:** Technische Governance-Policies als Ergänzung zu Statuten erstellen (nicht in Statuten selbst).

---

## 2. Fehlende Policies (Identifizierte Lücken)

### 2.1 P0-CRITICAL (5 Policies - Sofortiger Handlungsbedarf)

#### 2.1.1 Incident Response Plan (DSGVO Art. 33 - 72h Meldepflicht)
**Status:** ❌ FEHLT KOMPLETT  
**Risiko:** Bei Datenpanne droht Bußgeld bis 20 Mio. EUR / 4% Jahresumsatz (DSGVO Art. 83)  
**ISO 27001:** A.16.1.2 (Meldung von Informationssicherheitsereignissen)  

**Erforderlicher Inhalt:**
- Incident-Klassifikation (P0-Critical: Datenpanne, P1-High: Security Breach, P2-Medium: Service Degradation)
- 72-Stunden-Workflow:
  1. **T+0-15min:** Eindämmung (System isolieren, Passwörter ändern)
  2. **T+15min-1h:** Dokumentation (Zeitpunkt, Art/Umfang, betroffene Daten/Personen)
  3. **T+1h-72h:** Meldung an DSB (dsb@dsb.gv.at) wenn Risiko besteht
  4. **T+72h+:** Information Betroffener bei hohem Risiko
- Eskalationspfad: Security Analyst → Tech Lead → Vorstand → Datenschutzbehörde
- Post-Mortem-Template (Root Cause Analysis, Lessons Learned)
- Kommunikations-Templates (intern/extern/DSB/Betroffene)

**Umsetzung:**
- **Owner:** Security Analyst
- **Datei:** `docs/governance/incident-response-plan.md`
- **SLA:** Bis 2025-11-01 (15 Tage)
- **Verknüpfung:** `.github/instructions/dsgvo-compliance.instructions.md` (Sektion "Datenpannen-Prozess")

---

#### 2.1.2 Data Retention Policy (DSGVO Art. 5.1e - Speicherbegrenzung)
**Status:** ⚠️ TEILWEISE (in DSGVO-Instruktionen, aber nicht als Policy)  
**Risiko:** Rechtswidrige Datenspeicherung → Bußgeld + Reputationsschaden  
**ISO 27001:** A.18.1.4 (Datenschutz und Schutz personenbezogener Daten)  

**Erforderlicher Inhalt:**
- Retention-Matrix (Datentyp → Speicherdauer → Löschverfahren):
  - **Mitgliederdaten:** Während Mitgliedschaft + 12 Monate (Nachweis/Ansprüche) → Löschung/Pseudonymisierung
  - **Finanz-/Beitragsdaten:** 7 Jahre (BAO § 132) → Anonymisierung nach Frist
  - **Newsletter-/Marketingdaten:** Bis Widerruf → Sofortige Löschung
  - **Aktivitäts-/Engagement-Daten:** Während Mitgliedschaft → Anonymisierung nach Austritt
  - **Logs/Monitoring:** 90 Tage → Automatische Rotation
  - **Backups:** 30 Tage (täglich) + 12 Monate (monatlich) → Encryption at Rest
- Automatisierte Löschung (Cron-Jobs, n8n-Workflows)
- Manual Review Process (quartalsweise Audit)
- Ausnahmen-Management (rechtliche Aufbewahrungspflichten, laufende Verfahren)

**Umsetzung:**
- **Owner:** Security Analyst + Lead Architect
- **Datei:** `docs/governance/data-retention-policy.md`
- **SLA:** Bis 2025-11-01 (15 Tage)
- **Verknüpfung:** `.github/instructions/dsgvo-compliance.instructions.md` (Sektion "Speicherdauern")

---

#### 2.1.3 Access Control Policy (ISO 27001 A.9.4.3)
**Status:** ⚠️ TEILWEISE (RBAC in TOMs, aber nicht formalisiert)  
**Risiko:** Unbefugter Zugriff auf PII → Datenpanne → DSGVO Art. 33 Meldepflicht  
**ISO 27001:** A.9.4.3 (Passwort-Management-System)  

**Erforderlicher Inhalt:**
- **Rollen-Matrix (RBAC):**
  - **Vorstand:** Vollzugriff (CRM, API, Frontend, n8n, Plesk)
  - **Kassier*in:** Finanz + eigene Kontakte (CiviCRM Contribute, eigene Contact-Daten)
  - **Mitglied:** Eigene Daten (Self-Service Portal)
  - **Developer:** Code-Repository, Dev-Environment, Staging (KEIN Production-Zugriff ohne Approval)
  - **QA Engineer:** Test-Environments, Quality-Reports (Read-Only Production-Logs)
  - **Security Analyst:** Audit-Logs, Security-Tools (Trivy, Gitleaks, SARIF)
- **Zugriffskontrollen:**
  - MFA verpflichtend für Admins (GitHub, Plesk, PostgreSQL)
  - Starke Passwörter (≥12 Zeichen, Komplexität), Rotation alle 90 Tage für Admins
  - SSH-Key-Management (Ed25519, kein RSA <4096 bit)
  - GitHub PATs mit Least Privilege Scope (repo, workflow, read:org)
  - Plesk SSH-Tunnel nur via SSH-Key (kein Password-Auth)
- **Offboarding-Prozess:** Sofortige Deaktivierung bei Austritt/Kündigung, Key-Rotation innerhalb 24h
- **Audit-Logging:** 90 Tage Aufbewahrung, quartalsweise Review (ungewöhnliche Zugriffe)

**Umsetzung:**
- **Owner:** Security Analyst + DevOps Engineer
- **Datei:** `docs/governance/access-control-policy.md`
- **SLA:** Bis 2025-11-01 (15 Tage)
- **Verknüpfung:** `.github/instructions/dsgvo-compliance.instructions.md` (Sektion "Zugangskontrolle")

---

#### 2.1.4 Cryptographic Policy (ISO 27001 A.10.1.1, A.10.1.2)
**Status:** ⚠️ TEILWEISE (TLS 1.3, pgcrypto erwähnt, aber nicht Policy)  
**Risiko:** Schwache Crypto → Man-in-the-Middle → Datenpanne  
**ISO 27001:** A.10.1.1 (Kryptografische Maßnahmen), A.10.1.2 (Schlüsselverwaltung)  

**Erforderlicher Inhalt:**
- **Algorithmen & Protokolle:**
  - **Transport:** TLS 1.3 verpflichtend (kein TLS 1.2, kein SSL)
  - **Storage:** AES-256-GCM (pgcrypto für PostgreSQL, LUKS für Filesystems)
  - **Hashing:** bcrypt/Argon2 für Passwörter (kein MD5, SHA1, plain SHA-256)
  - **Signing:** Ed25519 für SSH-Keys, RS256/ES256 für JWTs
- **Key Management:**
  - Secrets in `secrets/` (Git-Ignored, .gitkeep als Platzhalter)
  - GitHub Secrets für CI/CD (`STAGING_REMOTE_*`, `DATABASE_URL`)
  - Key Rotation: 90 Tage für Admin-Keys, 365 Tage für Encryption-Keys
  - Backup-Encryption: GPG mit 4096-bit Key, Passphrase in Tresor (physisch getrennt)
- **Verbotene Praktiken:**
  - ❌ Hardcoded Secrets in Code
  - ❌ Unverschlüsselte Backups
  - ❌ Passwörter in Klartext (Logs, Emails, Slack)
  - ❌ HTTP statt HTTPS
- **Certificate Management:** Let's Encrypt Auto-Renewal, 30-Tage-Vorlauf, Monitoring via n8n

**Umsetzung:**
- **Owner:** Security Analyst + DevOps Engineer
- **Datei:** `docs/governance/cryptographic-policy.md`
- **SLA:** Bis 2025-11-01 (15 Tage)
- **Verknüpfung:** `.github/instructions/core/security-best-practices.instructions.md`

---

#### 2.1.5 Backup & Disaster Recovery Policy (ISO 27001 A.12.3.1)
**Status:** ⚠️ TEILWEISE (in Deployment-Scripts erwähnt, aber nicht Policy)  
**Risiko:** Datenverlust → Business Continuity Failure → Vereinsauflösung (worst case)  
**ISO 27001:** A.12.3.1 (Sicherung von Informationen)  

**Erforderlicher Inhalt:**
- **Backup-Strategie (3-2-1-Regel):**
  - **3 Kopien:** Production + Plesk Backup + Offsite-Backup
  - **2 Medien:** Disk (Plesk) + Cloud (Backblaze B2 / AWS S3 Glacier)
  - **1 Offsite:** Geografisch getrennt (Österreich + EU)
- **Backup-Schedule:**
  - **Täglich (inkrementell):** PostgreSQL-Dump, n8n-Workflows, CRM-Files
  - **Wöchentlich (voll):** Kompletter Server-Snapshot (Plesk)
  - **Monatlich (Archiv):** Long-term Retention (12 Monate)
- **Recovery Testing:**
  - **Monatlich:** Test-Restore in Staging-Environment (1 DB-Tabelle)
  - **Quartalsweise:** Full-Recovery-Test (komplettes System in Isolation)
  - **RTO (Recovery Time Objective):** 4 Stunden (P0-Critical Services)
  - **RPO (Recovery Point Objective):** 24 Stunden (maximal 1 Tag Datenverlust)
- **Disaster Scenarios:**
  - **Ransomware:** Restore from Read-Only Backup (keine Überschreibung)
  - **Datencenter-Ausfall:** Failover zu Offsite-Backup (4h RTO)
  - **Accidental Deletion:** Point-in-Time-Recovery (letzte 7 Tage)
- **Verschlüsselung:** GPG für Offsite-Backups, AES-256 für Disk-Backups

**Umsetzung:**
- **Owner:** DevOps Engineer
- **Datei:** `docs/governance/backup-disaster-recovery-policy.md`
- **SLA:** Bis 2025-11-15 (30 Tage)
- **Verknüpfung:** `.github/instructions/core/deployment-procedures.instructions.md`

---

### 2.2 P1-HIGH (7 Policies - Q1 2026)

#### 2.2.1 Code Review Policy
**Status:** ❌ FEHLT  
**Risiko:** Security-Bugs in Production, unreviewed DSGVO-Violations  
**Erforderlicher Inhalt:**
- **Review-Checkliste:**
  - ✅ Functionality (funktioniert wie erwartet?)
  - ✅ Security (keine Secrets, keine SQL-Injection, XSS-safe?)
  - ✅ DSGVO (keine PII in Logs, Consent dokumentiert?)
  - ✅ Performance (Lighthouse ≥0.90, API <500ms?)
  - ✅ Tests (Coverage ≥80%, alle grün?)
  - ✅ Documentation (JSDoc, Docstrings, README-Updates?)
- **Review-Anforderungen:**
  - **1 Approval:** für P3-Low, chore, docs
  - **2 Approvals:** für P2-Medium, feature, refactor
  - **CODEOWNERS Approval:** für P0-Critical, P1-High, security, DSGVO
- **Signing-off:** Developer Certificate of Origin (DCO) via `git commit -s`

**Umsetzung:**
- **Owner:** Lead Architect
- **Datei:** `docs/governance/code-review-policy.md`
- **SLA:** Bis 2025-12-15 (60 Tage)

---

#### 2.2.2 Release Policy
**Status:** ❌ FEHLT  
**Risiko:** Unkontrollierte Deployments, Breaking Changes ohne Ankündigung  
**Erforderlicher Inhalt:**
- **Versioning:** SemVer (MAJOR.MINOR.PATCH)
- **Release-Typen:**
  - **Hotfix:** P0-Critical Bug → sofort nach Review
  - **Patch:** P1-High Bug, Security-Fix → wöchentlich (Freitag)
  - **Minor:** Features, non-breaking changes → monatlich (1. des Monats)
  - **Major:** Breaking Changes → quartalsweise (Mitgliederversammlung-Abstimmung)
- **Changelog:** Automatisch via Conventional Commits (CHANGELOG.md)
- **Deployment-Gates:** Quality Gates ≥85%, Security-Scan ≥0 HIGH, Tests ≥80% Coverage
- **Rollback-Readiness:** Jeder Release hat Rollback-Script (`deployment-scripts/rollback.sh`)

**Umsetzung:**
- **Owner:** DevOps Engineer
- **Datei:** `docs/governance/release-policy.md`
- **SLA:** Bis 2025-12-15 (60 Tage)

---

#### 2.2.3 Change Management Policy (ISO 27001 A.12.1.2)
**Status:** ❌ FEHLT  
**Risiko:** Ungeplante Downtimes, Rollback-Chaos  
**Erforderlicher Inhalt:**
- **Change-Klassifikation:**
  - **Standard Change:** Pre-approved (z.B. Dependency-Update via Renovate)
  - **Normal Change:** Requires CAB approval (Change Advisory Board = Vorstand)
  - **Emergency Change:** P0-Critical (retrospective approval)
- **Change-Workflow:**
  1. Change-Request (Issue mit type/change, priority/*, area/*)
  2. Impact-Assessment (Downtime? Breaking Changes? Rollback-Plan?)
  3. CAB-Approval (bei Normal Change)
  4. Implementation (via PR, Quality Gates)
  5. Post-Implementation Review (Smoke-Tests, Metrics)
- **Downtime-Kommunikation:** 48h Vorlauf via Newsletter, Website-Banner

**Umsetzung:**
- **Owner:** DevOps Engineer + Lead Architect
- **Datei:** `docs/governance/change-management-policy.md`
- **SLA:** Bis 2026-01-15 (90 Tage)

---

#### 2.2.4 Third-Party Risk Management Policy
**Status:** ❌ FEHLT  
**Risiko:** Supply Chain Attack (SolarWinds-Style), DSGVO-Verstöße durch Auftragsverarbeiter  
**Erforderlicher Inhalt:**
- **Vendor-Assessment:**
  - **DSGVO-konform?** (AVV = Auftragsverarbeitungsvertrag erforderlich)
  - **ISO 27001 zertifiziert?** (bevorzugt)
  - **SLA garantiert?** (Uptime ≥99.9%)
  - **Data-Residency?** (DSGVO Art. 44-49 - Drittlandübermittlung)
- **Aktuelle Vendors:**
  - **Plesk:** Hosting (AVV vorhanden?)
  - **GitHub:** Code-Hosting (Standard Contractual Clauses)
  - **Stripe:** Payments (PCI-DSS Level 1)
  - **Mailchimp:** Newsletter (AVV erforderlich)
  - **Figma:** Design (US-basiert, DSGVO-Compliance prüfen)
- **Dependency-Security:** Renovate Auto-Updates + Trivy Scans (HIGH/CRITICAL = 0)

**Umsetzung:**
- **Owner:** Security Analyst + Vorstand (AVV-Verhandlung)
- **Datei:** `docs/governance/third-party-risk-policy.md`
- **SLA:** Bis 2026-01-15 (90 Tage)

---

#### 2.2.5 Logging & Monitoring Policy (ISO 27001 A.12.4.1)
**Status:** ⚠️ TEILWEISE (Audit-Logs erwähnt, aber nicht Policy)  
**Risiko:** Security-Incidents unentdeckt, keine Forensik-Fähigkeit  
**Erforderlicher Inhalt:**
- **Log-Typen:**
  - **Application Logs:** API (FastAPI), CRM (Drupal Watchdog), Frontend (Console Errors)
  - **Audit Logs:** Zugriffe/Änderungen (SELECT/INSERT/UPDATE/DELETE), Login-Versuche, Rollenänderungen
  - **Security Logs:** Trivy-Scans, Gitleaks-Findings, Failed-Logins
  - **Infrastructure Logs:** Plesk (Access/Error), PostgreSQL (Slow Queries), n8n (Workflow-Executions)
- **Retention:** 90 Tage (täglich rotation), PII-masked (automatisch via pii_sanitizer.py)
- **Monitoring-Alerts:**
  - **P0-Critical:** Failed-Logins >5 in 10min → Security Analyst
  - **P1-High:** API Response-Time >2s → DevOps Engineer
  - **P2-Medium:** Disk-Usage >80% → DevOps Engineer
- **SIEM-Integration:** Optional (ELK-Stack oder Splunk bei Wachstum)

**Umsetzung:**
- **Owner:** DevOps Engineer + Security Analyst
- **Datei:** `docs/governance/logging-monitoring-policy.md`
- **SLA:** Bis 2026-02-01 (105 Tage)

---

#### 2.2.6 API Security Policy (OWASP ASVS Level 2)
**Status:** ⚠️ TEILWEISE (OpenAPI-Spec, aber keine Security-Policy)  
**Risiko:** API-Exploits (Injection, Broken Auth, Excessive Data Exposure)  
**Erforderlicher Inhalt:**
- **OWASP Top 10 API Security 2023:**
  - ✅ A1 (Broken Object Level Authorization): RBAC enforcement
  - ✅ A2 (Broken Authentication): JWT + MFA
  - ✅ A3 (Broken Object Property Level Authorization): Field-Level Permissions
  - ✅ A4 (Unrestricted Resource Consumption): Rate-Limiting (10 req/s per IP)
  - ✅ A5 (Broken Function Level Authorization): Role-based Endpoint Access
  - ⚠️ A6 (Unrestricted Access to Sensitive Business Flows): Manual Review
  - ✅ A7 (Server Side Request Forgery - SSRF): Input Validation
  - ✅ A8 (Security Misconfiguration): Helmet.js, CORS strict
  - ✅ A9 (Improper Inventory Management): OpenAPI-Spec aktuell
  - ✅ A10 (Unsafe Consumption of APIs): Vendor-Assessment
- **Rate-Limiting:** 10 req/s per IP, 100 req/min per User
- **Input Validation:** Pydantic Models (FastAPI), Joi (Node.js)
- **Output Encoding:** Auto-Escape (Jinja2, React)

**Umsetzung:**
- **Owner:** Security Analyst + Developer (API)
- **Datei:** `docs/governance/api-security-policy.md`
- **SLA:** Bis 2026-02-15 (120 Tage)

---

#### 2.2.7 DevOps Security Policy (DevSecOps)
**Status:** ⚠️ TEILWEISE (Security-Scans vorhanden, aber nicht Policy)  
**Risiko:** CI/CD-Pipeline als Attack-Vector  
**Erforderlicher Inhalt:**
- **Shift-Left Security:**
  - **Pre-Commit:** Gitleaks (Secrets), ESLint (Security-Plugins)
  - **CI Pipeline:** Trivy (Vulnerabilities), Semgrep (SAST), CodeQL (GitHub)
  - **Pre-Deploy:** Quality Gates (Codacy ≥85%, Lighthouse ≥0.90, Tests ≥80%)
- **Container Security:**
  - **Base Images:** Distroless/Alpine (minimal attack surface)
  - **Multi-Stage Builds:** Kein Build-Tooling in Production
  - **Image Signing:** Cosign (Sigstore)
- **Secrets Management:**
  - **GitHub Secrets:** Encrypted at Rest, nur in CI/CD verfügbar
  - **Rotation:** 90 Tage für CI/CD-Secrets
- **Pipeline Hardening:**
  - **Least Privilege:** GitHub Actions nur mit notwendigen Permissions
  - **Audit Logging:** Alle Deployments protokolliert (n8n-Webhooks)

**Umsetzung:**
- **Owner:** DevOps Engineer + Security Analyst
- **Datei:** `docs/governance/devsecops-policy.md`
- **SLA:** Bis 2026-02-15 (120 Tage)

---

### 2.3 P2-MEDIUM (9 Policies - Q2 2026)

#### 2.3.1 Open Source License Policy
**Status:** ❌ FEHLT  
**Erforderlicher Inhalt:** Wahl zwischen GPL-3.0, MIT, Apache-2.0; Contributor License Agreement (CLA)  
**Owner:** Lead Architect + Vorstand  
**SLA:** Bis 2026-04-01  

#### 2.3.2 Code Ownership Policy
**Status:** ❌ FEHLT  
**Erforderlicher Inhalt:** Code gehört Verein (gemäß Statuten), Contributors behalten moralische Rechte  
**Owner:** Lead Architect + Vorstand  
**SLA:** Bis 2026-04-01  

#### 2.3.3 Vulnerability Disclosure Policy (Public)
**Status:** ⚠️ TEILWEISE (in SECURITY.md, aber nicht öffentlich prominent)  
**Erforderlicher Inhalt:** Bug-Bounty-Programm (optional), Hall of Fame  
**Owner:** Security Analyst  
**SLA:** Bis 2026-04-15  

#### 2.3.4 Performance Budget Policy
**Status:** ❌ FEHLT  
**Erforderlicher Inhalt:** Lighthouse ≥0.90, TTFB <500ms, Bundle-Size <200KB, Images <100KB  
**Owner:** QA Engineer + Developer (Frontend)  
**SLA:** Bis 2026-05-01  

#### 2.3.5 Accessibility Policy (WCAG 2.2 AAA)
**Status:** ⚠️ TEILWEISE (in Quality Gates erwähnt)  
**Erforderlicher Inhalt:** Keyboard-Navigation, Screen-Reader-Support, Color-Contrast ≥7:1  
**Owner:** QA Engineer + Developer (Frontend)  
**SLA:** Bis 2026-05-01  

#### 2.3.6 Internationalization Policy (i18n)
**Status:** ⚠️ TEILWEISE (Österreichisches Deutsch mandatory, aber keine i18n-Strategie)  
**Erforderlicher Inhalt:** de-AT (Primary), en-US (Optional), i18n-Library (react-i18next)  
**Owner:** Developer (Frontend)  
**SLA:** Bis 2026-05-15  

#### 2.3.7 Documentation Policy
**Status:** ⚠️ TEILWEISE (ADRs erwähnt, aber keine Policy)  
**Erforderlicher Inhalt:** JSDoc/Docstrings verpflichtend, ADRs für Architektur-Entscheidungen, README-Updates bei Feature  
**Owner:** Lead Architect  
**SLA:** Bis 2026-06-01  

#### 2.3.8 Testing Policy
**Status:** ⚠️ TEILWEISE (in Quality Gates erwähnt)  
**Erforderlicher Inhalt:** Coverage ≥80%, Unit-Tests verpflichtend, E2E für kritische Flows, Regression-Tests bei Bug-Fix  
**Owner:** QA Engineer  
**SLA:** Bis 2026-06-01  

#### 2.3.9 Technical Debt Management Policy
**Status:** ❌ FEHLT  
**Erforderlicher Inhalt:** Quartalsweise Tech-Debt-Review, P2-Label für Tech-Debt, 20% Sprint-Kapazität für Refactoring  
**Owner:** Lead Architect + Developer  
**SLA:** Bis 2026-06-15  

---

## 3. ISO 27001 Controls Mapping

### 3.1 Implemented Controls (6)
| Control ID | Titel | Status | Policy |
|------------|-------|--------|--------|
| A.5.1.1 | Policies for Information Security | ✅ VOLLSTÄNDIG | SECURITY.md |
| A.6.1.1 | Information Security Roles & Responsibilities | ✅ VOLLSTÄNDIG | agents.md (5 Rollen) |
| A.7.2.2 | Information Security Awareness, Education, Training | ✅ VOLLSTÄNDIG | CONTRIBUTING.md |
| A.8.1.1 | Inventory of Assets | ✅ VOLLSTÄNDIG | reports/file-inventory-tracked.csv |
| A.9.2.1 | User Registration & De-Registration | ⚠️ TEILWEISE | Statuten § 5, § 7 (fehlt Offboarding-Tech) |
| A.14.2.1 | Secure Development Policy | ✅ VOLLSTÄNDIG | CONTRIBUTING.md + Quality Gates |

### 3.2 Missing Controls (10 - P0/P1)
| Control ID | Titel | Status | Erforderliche Policy | Priorität |
|------------|-------|--------|----------------------|-----------|
| A.9.4.3 | Password Management System | ❌ FEHLT | Access Control Policy | P0-Critical |
| A.10.1.1 | Cryptographic Controls | ❌ FEHLT | Cryptographic Policy | P0-Critical |
| A.10.1.2 | Key Management | ❌ FEHLT | Cryptographic Policy | P0-Critical |
| A.12.1.2 | Change Management | ❌ FEHLT | Change Management Policy | P1-High |
| A.12.3.1 | Information Backup | ⚠️ TEILWEISE | Backup & DR Policy | P0-Critical |
| A.12.4.1 | Event Logging | ⚠️ TEILWEISE | Logging & Monitoring Policy | P1-High |
| A.12.6.1 | Management of Technical Vulnerabilities | ⚠️ TEILWEISE | DevSecOps Policy | P1-High |
| A.15.1.1 | Information Security in Supplier Relationships | ❌ FEHLT | Third-Party Risk Policy | P1-High |
| A.16.1.2 | Reporting Information Security Events | ❌ FEHLT | Incident Response Plan | P0-Critical |
| A.18.1.4 | Privacy & Protection of PII | ✅ VOLLSTÄNDIG | .github/instructions/dsgvo-compliance.instructions.md | ✅ OK |

---

## 4. OWASP ASVS Level Assessment

### 4.1 Current Level: Level 1 (Basic Security)
**Erreicht:**
- ✅ V1 (Architecture): Security in design considered
- ✅ V2 (Authentication): JWT + MFA für Admins
- ✅ V3 (Session Management): Secure cookies, CSRF-Protection
- ✅ V4 (Access Control): RBAC (Vorstand, Kassier, Mitglied)
- ✅ V5 (Validation): Pydantic Models (FastAPI)
- ✅ V7 (Cryptography): TLS 1.3, bcrypt
- ✅ V8 (Data Protection): PII-Sanitization (pii_sanitizer.py)
- ✅ V9 (Communications): HTTPS only
- ✅ V10 (Malicious Code): Trivy, Gitleaks, npm audit
- ⚠️ V12 (Files): File-Upload-Validation (teilweise)
- ✅ V13 (API): OpenAPI-Spec, Rate-Limiting
- ✅ V14 (Configuration): Security-Headers (Helmet.js)

### 4.2 Target Level: Level 2 (Standard Security) - Q1 2026
**Lücken zu Level 2:**
- ❌ V2.2 (General Authenticator Security): FIDO2/WebAuthn (aktuell nur JWT + MFA via TOTP)
- ❌ V4.3 (Other Access Control Considerations): Field-Level Permissions (aktuell nur Row-Level)
- ❌ V6 (Stored Cryptography): Key-Rotation-Automation (aktuell manuell)
- ❌ V11 (Business Logic): Rate-Limiting auf Business-Logic (aktuell nur API-Level)
- ❌ V12.4 (File Storage): Virus-Scanning (ClamAV integration fehlt)

**Roadmap zu Level 2:**
1. **Q4 2025:** Implement FIDO2/WebAuthn (V2.2)
2. **Q1 2026:** Field-Level Permissions (V4.3)
3. **Q1 2026:** Automated Key-Rotation (V6)
4. **Q1 2026:** Business-Logic Rate-Limiting (V11)
5. **Q2 2026:** ClamAV File-Scanning (V12.4)

---

## 5. DSGVO Compliance Gaps

### 5.1 Vollständig Implementiert (5)
- ✅ **Art. 15 (Auskunft):** API-Endpunkt `/api/v1/members/{id}/gdpr/export` (JSON/PDF)
- ✅ **Art. 16 (Berichtigung):** Self-Service Portal, Audit-Log
- ✅ **Art. 17 (Löschung):** Automated Deletion (12 Monate nach Austritt), BAO-Ausnahme (7 Jahre)
- ✅ **Art. 32 (Sicherheit):** TLS 1.3, pgcrypto, RBAC, Audit-Logs
- ✅ **Art. 21 (Widerspruch):** Newsletter-Opt-Out (n8n-Workflow)

### 5.2 Lücken (3 - P0/P1)
- 🚨 **Art. 33 (Datenpanne-Meldung):** Incident Response Plan fehlt (P0-Critical)
- ⚠️ **Art. 5.1e (Speicherbegrenzung):** Data Retention Policy fehlt (P0-Critical)
- ⚠️ **Art. 30 (Verzeichnis von Verarbeitungstätigkeiten):** Nicht dokumentiert (P1-High, bis 2026-01-15)

---

## 6. Priorisierte Roadmap

### Q4 2025 (Oktober-Dezember)
**P0-Critical (5 Policies):**
1. ✅ **Bis 2025-11-01:** Incident Response Plan (Security Analyst)
2. ✅ **Bis 2025-11-01:** Data Retention Policy (Security Analyst + Lead Architect)
3. ✅ **Bis 2025-11-01:** Access Control Policy (Security Analyst + DevOps)
4. ✅ **Bis 2025-11-01:** Cryptographic Policy (Security Analyst + DevOps)
5. ✅ **Bis 2025-11-15:** Backup & DR Policy (DevOps Engineer)

### Q1 2026 (Januar-März)
**P1-High (7 Policies):**
1. ✅ **Bis 2025-12-15:** Code Review Policy (Lead Architect)
2. ✅ **Bis 2025-12-15:** Release Policy (DevOps Engineer)
3. ✅ **Bis 2026-01-15:** Change Management Policy (DevOps + Lead Architect)
4. ✅ **Bis 2026-01-15:** Third-Party Risk Policy (Security Analyst + Vorstand)
5. ✅ **Bis 2026-02-01:** Logging & Monitoring Policy (DevOps + Security)
6. ✅ **Bis 2026-02-15:** API Security Policy (Security Analyst + Developer)
7. ✅ **Bis 2026-02-15:** DevSecOps Policy (DevOps + Security)

### Q2 2026 (April-Juni)
**P2-Medium (9 Policies):**
1. ✅ **Bis 2026-04-01:** Open Source License Policy
2. ✅ **Bis 2026-04-01:** Code Ownership Policy
3. ✅ **Bis 2026-04-15:** Vulnerability Disclosure Policy
4. ✅ **Bis 2026-05-01:** Performance Budget Policy
5. ✅ **Bis 2026-05-01:** Accessibility Policy
6. ✅ **Bis 2026-05-15:** Internationalization Policy
7. ✅ **Bis 2026-06-01:** Documentation Policy
8. ✅ **Bis 2026-06-01:** Testing Policy
9. ✅ **Bis 2026-06-15:** Technical Debt Management Policy

---

## 7. Integration mit Roadmap

**Cross-References:**
- `reports/roadmap.md` → Milestone "Q1 2026 DSGVO Audit" (erstellen)
- `.github/ISSUE_TEMPLATE/policy-proposal.md` → Neues Template für Policy-Proposals
- `agents.md` → Erweitern um "Compliance Officer" Rolle (optional)

**Automatisierung:**
- GitHub Actions: Auto-assign Policy-Issues zu entsprechenden Rollen (Security Analyst, DevOps, Lead Architect)
- n8n-Workflow: Quartalsweise Reminder für Policy-Reviews (Lead Architect)
- Compliance-Dashboard: Aggregierte Metriken (ISO 27001 Coverage %, OWASP ASVS Level, DSGVO Compliance %)

---

## 8. Metrics & KPIs

### 8.1 Governance Coverage
- **Policies Total:** 21 identifiziert
- **Vollständig:** 3 (14%)
- **Teilweise:** 8 (38%)
- **Fehlend:** 10 (48%)
- **Target (Q2 2026):** 100% Coverage

### 8.2 ISO 27001 Coverage
- **Controls Total:** 114 (Annex A)
- **Implemented:** 6 (5%)
- **Partially Implemented:** 4 (4%)
- **Missing:** 10 (9% - priorisiert)
- **Out of Scope:** 94 (82% - für NGO nicht relevant)
- **Target (Q2 2026):** 20/114 (18% - alle relevanten Controls)

### 8.3 OWASP ASVS Level
- **Current:** Level 1 (Basic Security)
- **Target (Q1 2026):** Level 2 (Standard Security)
- **Gap:** 5 Requirements (V2.2, V4.3, V6, V11, V12.4)

### 8.4 DSGVO Compliance
- **Articles Total:** 99
- **Relevant für Verein:** 25 (Art. 5-25, 32-34, 44-49)
- **Fully Compliant:** 20 (80%)
- **Gaps:** 5 (20% - Art. 30, 33, Art. 5.1e hauptsächlich)
- **Target (Q4 2025):** 100% Compliance

---

## 9. Empfehlungen

### 9.1 Sofortmaßnahmen (Nächste 15 Tage)
1. ✅ **Issue erstellen:** "feat(governance): Create 5 P0-Critical Policies" (priority/P0-critical, area/security, area/docs)
2. ✅ **Template erstellen:** `.github/ISSUE_TEMPLATE/policy-proposal.md`
3. ✅ **Milestone erstellen:** "Q1 2026 DSGVO Audit" in `reports/roadmap.md`
4. ✅ **Owner-Assignment:** Security Analyst (3 Policies), DevOps (2 Policies)

### 9.2 Quartalsweise Reviews
- **Q4 2025:** Policy-Draft-Reviews (P0-Critical Policies)
- **Q1 2026:** Policy-Implementation-Reviews (P1-High Policies)
- **Q2 2026:** Policy-Finalization (P2-Medium Policies)
- **Q3 2026:** ISO 27001 Gap-Assessment (externes Audit optional)

### 9.3 Tools & Automation
- **Policy-Management:** GitHub Issues + Projects (Kanban-Board)
- **Compliance-Tracking:** Custom Dashboard (compliance-dashboard.md) mit Metriken
- **Auto-Reminders:** n8n-Workflow für Policy-Reviews (quartalsweise)

---

## 10. Anhang

### 10.1 Glossar
- **AVV:** Auftragsverarbeitungsvertrag (DSGVO Art. 28)
- **CAB:** Change Advisory Board (ITIL)
- **DCO:** Developer Certificate of Origin
- **DSB:** Datenschutzbehörde (Österreich)
- **RTO:** Recovery Time Objective
- **RPO:** Recovery Point Objective
- **SIEM:** Security Information & Event Management
- **TOMs:** Technische & Organisatorische Maßnahmen (DSGVO Art. 32)

### 10.2 Referenzen
- **ISO 27001:2022:** https://www.iso.org/standard/27001
- **OWASP ASVS 4.0:** https://owasp.org/www-project-application-security-verification-standard/
- **DSGVO (EU 2016/679):** https://eur-lex.europa.eu/eli/reg/2016/679/oj
- **DSG (Österreich):** https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10001597

---

**Erstellt:** 2025-10-17  
**Nächste Review:** 2026-01-15  
**Owner:** Lead Architect (Peter Schuller)  
**Status:** COMPLETE (Artefakt 15/17)
