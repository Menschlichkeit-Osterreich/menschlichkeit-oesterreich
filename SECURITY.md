# Security Policy

Wir nehmen Sicherheit ernst und danken Ihnen für Ihr Engagement, unsere Plattform sicher zu halten.

## 🔒 Unterstützte Versionen

Wir bieten Sicherheitsupdates für folgende Versionen:

| Version | Unterstützt | Status |
|---------|------------|--------|
| main (latest) | ✅ | Aktive Entwicklung |
| v2.x | ✅ | Security Patches |
| v1.x | ⚠️ | Kritische Patches nur |
| < 1.0 | ❌ | Nicht unterstützt |

## 🛡️ Private Vulnerability Reporting (Empfohlen)

GitHub bietet **Private Vulnerability Reporting** für vertrauliche Sicherheitsmeldungen an:

1. **Navigieren Sie zu**: [Security → Advisories → New draft security advisory](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/security/advisories/new)
2. **Beschreiben Sie** die Schwachstelle mit ausreichend Details zur Reproduktion
3. **Vermeiden Sie** die Preisgabe sensibler Daten (Credentials, PII)
4. **Wir bestätigen** den Eingang innerhalb von **72 Stunden**
5. **Gemeinsam** entwickeln wir einen Fix in einer privaten Fork
6. **Koordinierte Veröffentlichung** nach Behebung (CVE-ID wird zugewiesen)

### Vorteile von Private Vulnerability Reporting:
- ✅ Vertrauliche Diskussionen vor der Veröffentlichung
- ✅ Automatische CVE-Zuweisung durch GitHub
- ✅ Sicherer Patch-Entwicklungsprozess
- ✅ Koordinierte Disclosure mit Credit für Reporter

## 📧 Alternative Kontaktmöglichkeiten

Falls Private Vulnerability Reporting nicht verfügbar ist:

- **E-Mail**: security@menschlichkeit-oesterreich.at (PGP-Key verfügbar)
- **On-Call**: Für kritische Vorfälle: [Matrix/Slack Channel - siehe INCIDENT_PAGER in README]

## 🎯 Scope & In-Scope Systeme

### ✅ In Scope

| System | Komponenten | Kritikalität |
|--------|-------------|--------------|
| **API Backend** | FastAPI, Auth-Flows, OAuth/JWT | HOCH |
| **CRM System** | Drupal 10, CiviCRM, PII-Verarbeitung | KRITISCH |
| **Frontend** | React, XSS, CSRF, Clickjacking | MITTEL |
| **Gaming Platform** | User XP, Achievements, Sessions | NIEDRIG |
| **Automation** | n8n Workflows, Webhook Handling | MITTEL |
| **CI/CD Pipeline** | GitHub Actions, Secrets, Deploy-Skripte | HOCH |

### ❌ Nicht im Scope

- Social Engineering und Phishing-Angriffe
- Physischer Zugriff zu Servern/Infrastruktur
- Denial-of-Service (DoS) Angriffe
- Abhängigkeiten mit bekannten CVEs ohne exploitierbaren Pfad
- Schwachstellen, die auf veralteten/nicht unterstützten Versionen basieren

## 🔬 Vulnerability Assessment Kriterien

Wir verwenden **CVSS 3.1** zur Bewertung:

| Severity | CVSS Score | Response Time | Patch Timeline |
|----------|-----------|--------------|----------------|
| **CRITICAL** | 9.0 - 10.0 | < 24h | < 48h |
| **HIGH** | 7.0 - 8.9 | < 72h | < 7 Tage |
| **MEDIUM** | 4.0 - 6.9 | < 7 Tage | < 30 Tage |
| **LOW** | 0.1 - 3.9 | < 30 Tage | Nächstes Release |

## 🏆 Responsible Disclosure Prozess

1. **Report** → Einreichen via Private Vulnerability Reporting oder E-Mail
2. **Triage** → Bestätigung & Severity-Einstufung (CVSS)
3. **Investigation** → Reproduktion & Impact-Analyse
4. **Fix Development** → Private Fork & Patch-Entwicklung
5. **Testing** → QA & Security-Validierung
6. **Disclosure** → Koordinierte Veröffentlichung mit Advisory
7. **Credit** → Reporter werden im Security Advisory erwähnt (optional)

## 🛡️ Safe Harbor

Wir verpflichten uns zu **keinen rechtlichen Schritten** gegen Sicherheitsforscher, die:

- ✅ Im guten Glauben handeln
- ✅ Unseren Disclosure-Prozess befolgen
- ✅ Keine PII oder sensitive Daten exfiltrieren
- ✅ Keine DoS-Angriffe durchführen
- ✅ Findings vertraulich behandeln bis zur koordinierten Veröffentlichung

## 🔐 Datenschutz & DSGVO-Compliance

Dieses Projekt befolgt **Privacy-by-Design** Prinzipien:

- **PII-Sanitization**: Automatische Maskierung von E-Mails/IBANs in Logs
- **DSGVO-First**: Keine personenbezogenen Daten in Logs ohne Rechtsgrundlage
- **Data Minimization**: Nur notwendige Daten werden verarbeitet
- **Encryption**: Sensible Daten werden verschlüsselt (at rest & in transit)

**Dokumentation**:
- Vollständige DSGVO-Dokumentation: `docs/privacy/`
- PII-Sanitizer Tests: `tests/test_pii_sanitizer.py`
- Privacy Policy: `docs/PRIVACY.md`
- Data Protection Impact Assessment: `docs/privacy/art-35-dpia.md`

## 🚨 Security Incident Response

Im Falle eines Sicherheitsvorfalls:

1. **Sofort-Maßnahmen**: Siehe `docs/privacy/art-33-34-incident-playbook.md`
2. **72-Stunden DSGVO-Meldepflicht**: Automatische Benachrichtigung an Datenschutzbehörde
3. **Betroffenen-Benachrichtigung**: Gemäß Art. 34 DSGVO bei hohem Risiko
4. **Post-Incident Analysis**: Root Cause Analysis & Präventionsmaßnahmen

## 📊 Security Monitoring & Scanning

Automatische Sicherheitschecks:

| Tool | Zweck | Frequenz | SARIF Upload |
|------|-------|----------|--------------|
| **CodeQL** | SAST für JavaScript/Python | Bei jedem Push | ✅ |
| **Semgrep** | Pattern-basierte Analyse | Bei jedem Push | ✅ |
| **Trivy** | Container & Dependency Scan | Täglich | ✅ |
| **OSV Scanner** | Vulnerability Database | Bei jedem Push | ✅ |
| **Gitleaks** | Secret Scanning | Bei jedem Push | ❌ |
| **Dependabot** | Dependency Updates | Täglich | ✅ |
| **OpenSSF Scorecard** | Best Practices | Wöchentlich | ✅ |

## 🔑 Secret Management

- **Push Protection**: Aktiviert (blockiert Secret-Commits)
- **Secret Scanning**: Aktiviert für alle Repositories
- **OIDC**: Bevorzugt für Cloud-Authentifizierung (kurzlebige Tokens)
- **Rotation**: 90-Tage Zyklus für Langzeit-Secrets
- **Katalog**: Vollständige Liste in `docs/security/secrets-catalog.md`

## 📞 Kontakt & Verantwortliche

### Security Team
- **E-Mail**: security@menschlichkeit-oesterreich.at
- **PGP Key**: [Download](https://menschlichkeit-oesterreich.at/.well-known/pgp-key.asc)
- **Response Time**: < 72 Stunden Erstantwort garantiert

### Datenschutzbeauftragte:r (DPO)
- **Name**: [DPO_NAME - wird in README konfiguriert]
- **E-Mail**: [DPO_EMAIL - wird in README konfiguriert]
- **Scope**: DSGVO-Compliance, Datenschutzvorfälle

### On-Call Eskalation
- **Pager**: [INCIDENT_PAGER - Matrix/Slack Channel]
- **Nur für**: CRITICAL Severity Incidents

## 🌐 Weiterführende Ressourcen

### Security Documentation (Internal)
- [Security Status Report](docs/SECURITY-STATUS-REPORT.md) - Current security posture and issues
- [Security Implementation Guide](docs/SECURITY-IMPLEMENTATION-GUIDE.md) - Step-by-step remediation instructions
- [Security Check Summary](docs/SECURITY-CHECK-SUMMARY.md) - Visual overview and roadmap
- [Security Vulnerabilities Remediation](docs/SECURITY-VULNERABILITIES-REMEDIATION.md) - Vulnerability tracking
- [Security Monitoring Module](security/monitoring.py) - Real-time alert detection
- [Security API Endpoints](api.menschlichkeit-oesterreich.at/app/routers/security.py) - Dashboard integration

### External Resources
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [CVSS Calculator](https://www.first.org/cvss/calculator/3.1)
- [Austrian Data Protection Authority](https://www.dsb.gv.at/)

---

**Letzte Aktualisierung**: 2025-10-12  
**Version**: 2.0  
**Review-Zyklus**: Quartalsweise
