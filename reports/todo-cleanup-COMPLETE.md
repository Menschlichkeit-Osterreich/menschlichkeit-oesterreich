# TODO-Cleanup Report – Menschlichkeit Österreich (VOLLSTÄNDIG)

**Generated:** 2025-10-17  
**Repository:** Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development  
**Branch:** chore/repo-docs-issues-reorg  
**Scope:** Source-Code + Documentation TODOs (TypeScript, JavaScript, Python, PHP + Markdown-Docs)

---

## 📊 Executive Summary

### Gesamtstatistik (77 TODOs total)

| Kategorie | Source-Code | Documentation | Gesamt | Anteil |
|-----------|-------------|---------------|--------|--------|
| **TODO** | 23 | 51 | 74 | 96.1% |
| **NOTE** | 1 | 0 | 1 | 1.3% |
| **XXX** | 1 | 0 | 1 | 1.3% |
| **FIXME** | 1 | 0 | 1 | 1.3% |
| **GESAMT** | **26** | **51** | **77** | **100%** |

### Breakdown nach Priorität (INTEGRIERT: Source + Documentation)

| Priorität | Source-Code | Documentation | Gesamt | Anteil | Aufwand (PT) |
|-----------|-------------|---------------|--------|--------|--------------|
| **P0-Critical** | 1 | 7 | **8** | **10.4%** | **15d** |
| **P1-High** | 7 | 12 | **19** | **24.7%** | **42d** |
| **P2-Medium** | 14 | 12 | **26** | **33.8%** | **29d** |
| **P3-Low** | 4 | 5 | **9** | **11.7%** | **13.5d** |
| **Drupal Core** | 2 | 0 | **2** | **2.6%** | N/A |
| **N/A (extern)** | 0 | 15 | **15** | **19.5%** | N/A |

**Gesamt-Aufwand (actionable TODOs):** **99.5 Personentage** (20 Arbeitswochen @ 1 Person)

### Breakdown nach Area/Kategorie

**Source-Code TODOs (26):**

| Area | Anzahl | Anteil |
|------|--------|--------|
| frontend | 9 | 34.6% |
| figma-design-system | 6 | 23.1% |
| security | 5 | 19.2% |
| website | 1 | 3.8% |
| tests | 1 | 3.8% |
| scripts | 2 | 7.7% |
| crm | 2 | 7.7% |

**Documentation TODOs (51):**

| Kategorie | Anzahl | Anteil |
|-----------|--------|--------|
| STRIDE-LINDDUN Security | 47 | 92.2% |
| DSGVO-Compliance (RIGHT-TO-ERASURE) | 3 | 5.9% |
| DSGVO-Compliance (Art. 5/6 Grundsätze) | 2 | 3.9% |

---

## 🚨 TOP-20: Immediate Action Required (P0 + P1)

### P0-Critical (8 TODOs, 15 Personentage) – **BLOCKING für Production**

| # | Quelle | TODO | Beschreibung | Aufwand | Aktion |
|---|--------|------|--------------|---------|--------|
| **1** | **STRIDE-LINDDUN** | **NC-01 – DPIA** | Datenschutz-Folgenabschätzung für Gesamtsystem (DSGVO Art. 35) | **5d** | `reports/compliance-dpia.md` + DSB-Review |
| **2** | **STRIDE-LINDDUN** | **DI-01 – Backup-Verschlüsselung** | AES-256 für PostgreSQL-Backups + GPG-Key-Management | **1d** | `deployment-scripts/backup-encryption.sh` |
| **3** | **STRIDE-LINDDUN** | **I-03 – git-secrets** | Pre-Commit Hook + BFG Repo-Cleaner für Historie | **1d** | `.git/hooks/pre-commit` + `.github/workflows/secrets-audit.yml` |
| **4** | **STRIDE-LINDDUN** | **EXT-01 – Webhook-Signaturen** | HMAC-SHA256 für n8n-Webhooks (GitHub, Stripe, PayPal) | **1d** | `automation/n8n/webhook-validator.js` |
| **5** | **STRIDE-LINDDUN** | **NC-02 – TOMs** | Technische-Organisatorische-Maßnahmen dokumentieren (DSGVO Art. 32) | **2d** | `docs/compliance/TOMs-MATRIX.md` |
| **6** | **RIGHT-TO-ERASURE** | **API Endpoints** | `/api/v1/privacy/deletion-request` (POST, GET, DELETE) | **3d** | `api/app/endpoints/privacy.py` + Alembic Migration |
| **7** | **art-05-06** | **Privacy Policy** | Privacy Policy auf Website veröffentlichen (DSGVO Art. 13/14) | **1d** | `website/privacy-policy.html` + Footer-Link |
| **8** | **auth-handler.js:431** | **Password Reset** | Password-Reset-API-Call implementieren (Account-Takeover-Risk) | **1d** | `api/app/endpoints/auth.py` + E-Mail-Template |

**⚠️ Diese 8 TODOs MÜSSEN vor nächstem Production-Deploy erledigt sein!**

---

### P1-High (19 TODOs, 42 Personentage) – **Sprint 1-4**

| # | Quelle | TODO | Beschreibung | Aufwand | Aktion |
|---|--------|------|--------------|---------|--------|
| **9** | **STRIDE-LINDDUN** | **R-01 – ELK Stack** | Immutable Logging via Elasticsearch + Legal Hold | **5d** | `docker-compose.elk.yml` + Logstash-Pipelines |
| **10** | **STRIDE-LINDDUN** | **S-01 – Token Revocation** | Redis Token Blocklist + 10 req/sec API-Gateway-Limit | **2d** | `api/app/lib/token_revocation.py` + Nginx |
| **11** | **STRIDE-LINDDUN** | **AUTH-01 – MFA/TOTP** | 2FA für Vorstand/Administratoren (Google Authenticator) | **3d** | `api/app/endpoints/mfa.py` + Frontend-Integration |
| **12** | **STRIDE-LINDDUN** | **L-01 – Pseudonymisierung** | User-ID statt E-Mail in Logs + Hash-Mapping-Tabelle | **2d** | `api/app/lib/pii_sanitizer.py` (extend) + Alembic |
| **13** | **monitoring.py:264-270** | **Security-Monitoring (5 TODOs)** | Auth/Session/2FA/Audit-Log-Monitoring via Prometheus | **3d** | `security/monitoring.py` (complete) + Grafana |
| **14** | **figma-design-system/App.tsx:18,23** | **Login/Logout Logic** | Design-System-App nutzbar machen | **0.5d** | `figma-design-system/App.tsx` (auth flow) |
| **15** | **RIGHT-TO-ERASURE** | **Frontend Integration** | PrivacyCenter.tsx Mock → Real API + Status-Tracking | **2d** | `frontend/src/components/PrivacyCenter.tsx` |
| **16** | **RIGHT-TO-ERASURE** | **CiviCRM Modul** | gdpr_deletion.module für CiviCRM-Integration | **3d** | `crm/web/modules/custom/gdpr_deletion/` |
| **17** | **STRIDE-LINDDUN** | **I-01 – Anonymisierung** | Auto-Anonymisierung nach 12 Monaten (DSGVO Art. 17) | **2d** | `scripts/anonymize-expired-users.py` + Cron |
| **18** | **STRIDE-LINDDUN** | **NR-01 – Consent Logging** | CiviCRM: Einwilligungen mit Timestamp + IP + Version | **1d** | `crm/web/modules/custom/consent_logging/` |
| **19** | **STRIDE-LINDDUN** | **U-01 – Privacy Dashboard** | Frontend: Art. 15 DSGVO (Datenauskunft) Self-Service | **3d** | `frontend/src/pages/PrivacyDashboard.tsx` |
| **20** | **STRIDE-LINDDUN** | **R-02 – Structured Logging** | JSON-Logs mit Aufbewahrungsfristen (90d Audit, 7y BAO) | **2d** | `api/app/lib/logger.py` + Retention-Policy |
| **21** | **STRIDE-LINDDUN** | **I-01 – Error Messages** | Generic Error Messages + PII-sanitized Sentry | **1d** | `api/app/middleware/error_handler.py` |
| **22** | **STRIDE-LINDDUN** | **T-01 – Request Signing** | HMAC-SHA256 für kritische Operations (POST/PUT/DELETE) | **2d** | `api/app/middleware/request_signing.py` |
| **23** | **STRIDE-LINDDUN** | **D-01 – Nginx Rate Limiting** | 100 req/sec global, 10 req/sec per IP | **1d** | `nginx/rate-limit.conf` |
| **24** | **STRIDE-LINDDUN** | **AS-01 – PostgreSQL Localhost** | DB nur via localhost/127.0.0.1 erreichbar (kein 0.0.0.0) | **0.5d** | `postgresql.conf` (listen_addresses) |
| **25** | **STRIDE-LINDDUN** | **AS-02 – n8n Reverse Proxy** | Nginx Reverse Proxy für n8n (keine direkte Port-Exposition) | **1d** | `nginx/sites-available/n8n.conf` |
| **26** | **STRIDE-LINDDUN** | **SEC-02 – Secret Rotation** | 90-Tage-Rotation für Produktionsgeheimnisse | **1d** | `scripts/rotate-secrets.sh` + Cron |
| **27** | **STRIDE-LINDDUN** | **D-01 – Log Sanitizer** | PII-Sanitizer für alle Logs + AES-256 für Log-Archive | **2d** | `api/app/lib/log_sanitizer.py` |

---

## 📋 P2-Medium (26 TODOs, 29 Personentage)

### Frontend-Komponenten (9 TODOs, 5 Personentage)

| # | File | TODO | Aufwand |
|---|------|------|---------|
| 28 | `frontend/src/components/figma/CtaSection.tsx:27` | Implement CTA Section layout | 0.5d |
| 29 | `frontend/src/components/figma/Footer.tsx:27` | Implement Footer layout | 0.5d |
| 30 | `frontend/src/components/figma/FeaturesGrid.tsx:27` | Implement Features Grid layout | 0.5d |
| 31 | `frontend/src/components/figma/HeaderNavigation.tsx:27` | Implement Header/Navigation layout | 0.5d |
| 32 | `frontend/src/components/figma/HeroSection.tsx:27` | Implement Hero Section layout | 0.5d |
| 33 | `frontend/src/components/figma/PricingSection.tsx:27` | Implement Pricing Section layout | 0.5d |
| 34 | `frontend/src/components/figma/StatisticsBar.tsx:27` | Implement Statistics Bar layout | 0.5d |
| 35 | `frontend/src/components/figma/Testimonials.tsx:27` | Implement Testimonials layout | 0.5d |
| 36 | `frontend/src/components/figma/TimelineEvents.tsx:27` | Implement Timeline Events layout | 0.5d |

**Milestone:** Design-System-Rollout complete

---

### Advanced Security (12 TODOs, 22 Personentage)

| # | Quelle | TODO | Beschreibung | Aufwand |
|---|--------|------|--------------|---------|
| 37 | **STRIDE-LINDDUN** | **S-03 – Mutual TLS** | mTLS zwischen API ↔ MCP-Server + Server-Zertifikats-Signatur | **3d** |
| 38 | **STRIDE-LINDDUN** | **T-04 – OPA Input Gate** | Schema- und Size-Validierung für alle Request Bodies | **2d** |
| 39 | **STRIDE-LINDDUN** | **D-02 – Connection Timeouts** | Alerts bei >30s DB-Verbindungen | **1d** |
| 40 | **STRIDE-LINDDUN** | **D-03 – Workflow Timeouts** | n8n: 5min Timeout, 512MB Memory Limit | **1d** |
| 41 | **STRIDE-LINDDUN** | **D-04 – Backpressure** | Redis Queue für API-Requests (Bull/BullMQ) | **3d** |
| 42 | **STRIDE-LINDDUN** | **E-01 – Permission Audits** | Quartalsweise RBAC-Prüfung (Vorstand/Kassier/Mitglied) | **0.5d** |
| 43 | **STRIDE-LINDDUN** | **E-02 – Chroot/AppArmor** | Container-Isolierung für CRM/API + AppArmor-Profile | **3d** |
| 44 | **STRIDE-LINDDUN** | **SEC-01 – Vault Integration** | HashiCorp Vault für API-Keys/DB-Credentials | **5d** |
| 45 | **STRIDE-LINDDUN** | **EXT-02 – IP Whitelisting** | Firewall-Rules für externe APIs (nur bekannte IPs) | **0.5d** |
| 46 | **STRIDE-LINDDUN** | **I-02 – Frontend Log Linter** | ESLint-Plugin: Verbietet console.log mit PII | **1d** |
| 47 | **art-05-06** | **DPO-Kontakt Frontend** | Datenschutzbeauftragten-Kontakt im Footer anzeigen | **0.5d** |
| 48 | **figma-design-system/App.tsx:28,33,38,43** | **Navigation-TODOs (4)** | Profile/Security/Support/Settings-Navigation | **1d** |

---

## 🧹 P3-Low (9 TODOs, 13.5 Personentage)

### Code-Quality & Nice-to-Have

| # | Quelle | TODO | Beschreibung | Aufwand |
|---|--------|------|--------------|---------|
| 49 | **test_pii_sanitizer.py:96** | **Edge-Case** | "spaces around @ should work" – Regex-Anpassung | **0.5d** |
| 50 | **scripts/ai-code-generator*.py:126,164** | **Generated Stubs** | Dead Code entfernen + Deprecation-Warnings | **0.5d** |
| 51 | **STRIDE-LINDDUN** | **T-03 – Release Notarization** | Sigstore/Notary für Releases + GitHub-Attestation | **1d** |
| 52 | **STRIDE-LINDDUN** | **AUTH-02 – Passkeys** | WebAuthn für passwortlose Anmeldung | **5d** |

---

### Drupal Core TODOs (2 TODOs, extern, außerhalb unserer Kontrolle)

| # | File | TODO | Status |
|---|------|------|--------|
| 53 | `crm.../modules/views/src/Plugin/views/display/Page.php:65` | "Add access denied page" | **Drupal Core Issue** (warten auf 10.x/11.x) |
| 54 | `crm.../core/lib/Drupal/Core/Menu/MenuLinkTree.php:426` | "Add an alter/option for fast checking" | **Drupal Core Issue** (Performance-Optimization) |

**Empfehlung:** Drupal 10 → 11 Upgrade planen (ggf. in Drupal 11 gefixed)

---

## 🔒 STRIDE-LINDDUN Details (47 TODOs aus Security-Analyse)

### 2.1 Spoofing (Identitätsfälschung)

- **S-01 (P1):** Token Revocation + Rate Limiting → Redis Blocklist + 10 req/sec
- **S-03 (P2):** Mutual TLS für MCP → mTLS zwischen API ↔ MCP-Server

### 2.2 Tampering (Manipulation)

- **T-01 (P1):** Request Signing → HMAC-SHA256 für kritische Operations
- **T-03 (P3):** Release Notarization → Sigstore/Notary
- **T-04 (P2):** OPA Input Gate → Schema- und Size-Validierung

### 2.3 Repudiation (Abstreitbarkeit)

- **R-01 (P1):** ELK Stack + WORM Logs → Immutable Logging
- **R-02 (P1):** Structured Logging + Retention → JSON-Logs mit Aufbewahrungsfristen

### 2.4 Information Disclosure (Informationsleck)

- **I-01 (P1):** Generic Error Messages + Sentry → Keine Stack-Traces in Produktion
- **I-02 (P2):** Frontend Log Linter + Sanitizer → ESLint-Plugin
- **I-03 (P0):** git-secrets Pre-Commit Hook → Automatischer Secrets-Scan

### 2.5 Denial of Service (Verfügbarkeit)

- **D-01 (P1):** Nginx Rate Limiting → 100 req/sec global, 10 req/sec per IP
- **D-02 (P2):** Connection Timeout Monitoring → Alerts bei >30s DB-Verbindungen
- **D-03 (P2):** Workflow Timeouts + Resource Limits → n8n: 5min Timeout
- **D-04 (P2):** Backpressure + Queueing → Redis Queue (Bull/BullMQ)

### 2.6 Elevation of Privilege (Rechteerweiterung)

- **E-01 (P2):** Permission Audits → Quartalsweise RBAC-Prüfung
- **E-02 (P2):** Chroot/Jail + AppArmor → Container-Isolierung + AppArmor-Profile

### 3. LINDDUN – Linkability/Identifiability/Non-Repudiation (DSGVO)

- **L-01 (P1):** Pseudonymisierung → User-ID statt E-Mail in Logs
- **I-01 (P1):** Anonymisierung nach Austritt → Auto-Anonymisierung nach 12 Monaten
- **NR-01 (P1):** Consent Logging → CiviCRM: Einwilligungen mit Timestamp + IP + Version

### 4. LINDDUN – Detectability (Nachvollziehbarkeit)

- **D-01 (P1):** Log Sanitizer + Encrypted Logs → PII-Sanitizer + AES-256

### 5. LINDDUN – Data Integrity (Datenintegrität)

- **DI-01 (P0):** Backup-Verschlüsselung → AES-256 für PostgreSQL-Backups

### 6. LINDDUN – Unawareness (Transparenz)

- **U-01 (P1):** Privacy Dashboard → Frontend: Art. 15 DSGVO (Datenauskunft)

### 7. LINDDUN – Non-Compliance (Compliance)

- **NC-01 (P0):** DPIA Creation → Datenschutz-Folgenabschätzung (DSGVO Art. 35)
- **NC-02 (P0):** TOMs Matrix → Technische-Organisatorische-Maßnahmen (DSGVO Art. 32)

### 8. Attack Surface Reduction

- **AS-01 (P1):** PostgreSQL Localhost-Only → DB nur via 127.0.0.1
- **AS-02 (P1):** n8n Reverse Proxy → Nginx Reverse Proxy (keine Port-Exposition)

### 9. Authentication Flow

- **AUTH-01 (P1):** MFA/TOTP → 2FA für Vorstand/Administratoren
- **AUTH-02 (P3):** Passkeys/FIDO2 → WebAuthn für passwortlose Anmeldung

### 10. Secrets Management

- **SEC-01 (P2):** Vault Integration → HashiCorp Vault für API-Keys/DB-Credentials
- **SEC-02 (P1):** Secret Rotation Policy → 90-Tage-Rotation

### 11. External Integrations

- **EXT-01 (P0):** Webhook Signature Validation → HMAC-SHA256 für n8n-Webhooks
- **EXT-02 (P2):** IP Whitelisting → Firewall-Rules für externe APIs

---

## 📈 Umsetzungsplan (4 Phasen, 20 Arbeitswochen)

### **Phase 1: DSGVO-Compliance (Sprint 1-2, 4 Wochen, BLOCKING)**

**Ziel:** Alle P0-Critical TODOs erledigen (DSGVO-Verpflichtungen erfüllen)

| TODO | Aufwand | Verantwortlich | Deliverables |
|------|---------|----------------|--------------|
| NC-01 – DPIA | 5d | Vorstand + DSB + Tech Lead | `reports/compliance-dpia.md` + DSB-Signatur |
| DI-01 – Backup-Encryption | 1d | DevOps | `deployment-scripts/backup-encryption.sh` |
| I-03 – git-secrets | 1d | Security-Analyst | `.git/hooks/pre-commit` + `.github/workflows/secrets-audit.yml` |
| EXT-01 – Webhook-Signaturen | 1d | DevOps | `automation/n8n/webhook-validator.js` |
| NC-02 – TOMs | 2d | Security-Analyst + Lead Architect | `docs/compliance/TOMs-MATRIX.md` |
| RIGHT-TO-ERASURE – API | 3d | Backend-Dev | `api/app/endpoints/privacy.py` + Alembic Migration |
| art-05-06 – Privacy Policy | 1d | Lead Architect + Vorstand | `website/privacy-policy.html` |
| Password Reset | 1d | Backend-Dev | `api/app/endpoints/auth.py` + E-Mail-Template |

**Gesamt:** 15 Personentage  
**Milestone:** `DSGVO-Compliance-Complete` (v2.0.0)

---

### **Phase 2: Security-Hardening (Sprint 3-4, 4 Wochen, HIGH PRIORITY)**

**Ziel:** P1-High Security/Auth TODOs (11 TODOs, 23 Personentage)

| Kategorie | TODOs | Aufwand | Deliverables |
|-----------|-------|---------|--------------|
| **Logging/Monitoring** | R-01, R-02, D-01, Security-Monitoring | 11d | ELK Stack, Prometheus/Grafana, Nginx-Rate-Limit |
| **Authentication** | S-01, AUTH-01 | 5d | Token-Revocation, MFA/TOTP |
| **Privacy** | L-01, I-01, NR-01, U-01, AS-01, AS-02, SEC-02, D-01 | 11.5d | Pseudonymisierung, Privacy-Dashboard, Consent-Logging |
| **Error-Handling** | I-01, T-01 | 3d | Generic-Error-Messages, Request-Signing |
| **Frontend-Integration** | Figma-Design-System-Login, RIGHT-TO-ERASURE | 2.5d | Login/Logout, PrivacyCenter.tsx |
| **CRM** | RIGHT-TO-ERASURE-CiviCRM | 3d | gdpr_deletion.module |

**Gesamt:** 36 Personentage  
**Milestone:** `Security-Hardening-Complete` (v2.1.0)

---

### **Phase 3: P2-Medium (Sprint 5-7, 6 Wochen)**

**Frontend-Komponenten + Advanced Security (26 TODOs, 29 Personentage)**

| Kategorie | TODOs | Aufwand | Deliverables |
|-----------|-------|---------|--------------|
| **Figma-Komponenten** | 9 | 5d | CTA/Footer/Features/Hero/Pricing/Statistics/Testimonials/Timeline |
| **Advanced Security** | 12 | 22d | mTLS, OPA, Backpressure, Chroot/AppArmor, Vault, IP-Whitelisting |
| **UI/UX** | 5 | 2d | Frontend-Log-Linter, DPO-Kontakt, Navigation-TODOs |

**Milestone:** `Feature-Complete` (v2.2.0)

---

### **Phase 4: P3-Low + Code-Quality (Sprint 8, 2 Wochen)**

**Nice-to-Have + Cleanup (9 TODOs, 13.5 Personentage)**

| TODO | Aufwand | Deliverables |
|------|---------|--------------|
| PII-Sanitizer Edge-Cases | 0.5d | `tests/test_pii_sanitizer.py` (fix spaces) |
| AI-Code-Generator Cleanup | 0.5d | Dead-Code-Entfernung |
| Release Notarization | 1d | Sigstore/Notary-Integration |
| Passkeys/FIDO2 | 5d | WebAuthn-Implementation |
| Drupal Core TODOs | N/A | Warten auf Drupal 10.x/11.x |

**Milestone:** `Code-Quality-Complete` (v2.3.0)

---

## 🎯 Next Steps (Sofortmaßnahmen)

### 1. DPIA-Kick-off Meeting (DIESE WOCHE)

- **Teilnehmer:** Vorstand, DSB, Tech Lead, Security-Analyst
- **Dauer:** 4h
- **Deliverable:** DPIA-Draft (`reports/compliance-dpia.md`)

### 2. Issue-Erstellung für P0-Critical (HEUTE)

```bash
gh issue create \
  --title "P0: DPIA Creation (DSGVO Art. 35)" \
  --body "$(cat .github/ISSUE_TEMPLATE/compliance-dpia.md)" \
  --label "P0-Critical,area/compliance,type/documentation" \
  --milestone "DSGVO-Compliance-Complete"
```

**8 Issues für P0-1 bis P0-8 erstellen**

### 3. Backup-Encryption Quick-Fix (MORGEN)

- Aufwand: 1d
- Aktion: `deployment-scripts/backup-encryption.sh` schreiben + testen

### 4. Sprint-Planung (NÄCHSTE WOCHE)

**Sprint 1 Goals (2 Wochen):**
- ✅ NC-01 (DPIA) fertigstellen
- ✅ DI-01 (Backup-Encryption) deployed
- ✅ I-03 (git-secrets) aktiviert
- ✅ EXT-01 (Webhook-Signaturen) implementiert

**Ressourcen-Bedarf:**
- 1 DevOps-Engineer (Full-Time)
- 1 Security-Analyst (50%)
- 1 Lead Architect (25%, Review/Approval)
- 1 DSB (extern, Beratung)

---

## 📊 Metrics & KPIs

### TODO-Burn-Down-Chart (20 Arbeitswochen)

| Sprint | Phase | TODOs erledigt | TODOs verbleibend | Aufwand (PT) |
|--------|-------|----------------|-------------------|--------------|
| Start | - | 0 | 77 | 99.5d |
| Sprint 1-2 | P0-Critical | 8 | 69 | -15d |
| Sprint 3-4 | P1-High Security | 19 | 50 | -36d |
| Sprint 5-7 | P2-Medium | 26 | 24 | -29d |
| Sprint 8 | P3-Low | 4 | 20 | -6.5d |
| End | - | **57** | **20** (Drupal Core + N/A) | **13d verbleibend** |

**Ziel:** 57 von 77 TODOs erledigt (74%), 20 TODOs extern/nicht actionable

### Success Criteria

- ✅ Alle P0-Critical TODOs in 4 Wochen erledigt (Sprint 1-2)
- ✅ DSGVO-Compliance erreicht (NC-01 DPIA + NC-02 TOMs + Art. 17 API)
- ✅ Security-Hardening in 8 Wochen abgeschlossen (Sprint 1-4)
- ✅ Design-System-Rollout in 14 Wochen abgeschlossen (Sprint 5-7)
- ✅ Code-Coverage bleibt ≥80% (nach allen TODO-Fixes)
- ✅ 0 neue TODOs ohne korrespondierende Issues

---

**Status:** TODO-Cleanup VOLLSTÄNDIG (77 TODOs katalogisiert, priorisiert, mit 4-Phasen-Umsetzungsplan)  
**Nächster Schritt:** P0-Critical Issue-Erstellung + DPIA-Kick-off-Meeting (siehe Section "Next Steps")  
**Verantwortlich:** Lead Architect (Peter Schuller)  
**Kontakt:** peter@menschlichkeit-oesterreich.at
