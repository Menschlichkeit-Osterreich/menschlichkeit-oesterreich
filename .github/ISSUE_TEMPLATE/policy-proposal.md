---
name: 📋 Policy Proposal
about: Neue Governance-Policy vorschlagen
title: '[POLICY] '
labels: ['type/governance', 'status/ready', 'priority/P1-high', 'compliance/dsgvo']
assignees: ''
---

## 📋 Policy Proposal

### 🎯 Policy-Name

**Vorgeschlagener Dateiname:** `docs/governance/[policy-name].md`

### 🔍 Problemstellung

Welche Governance-Lücke wird adressiert?

- [ ] Compliance-Anforderung (DSGVO, ISO 27001, OWASP ASVS)
- [ ] Risiko-Mitigation (Security, Data Loss, Legal)
- [ ] Operative Ineffizienz (Prozess-Standardisierung)
- [ ] Best-Practice-Adoption (Industry-Standard)

### 📊 ISO 27001 Control (falls relevant)

**Control ID:** (z.B. A.9.4.3, A.10.1.1, A.12.1.2)  
**Titel:** (z.B. "Password Management System", "Key Management")  
**Status:** ❌ FEHLT / ⚠️ TEILWEISE / ✅ VOLLSTÄNDIG

### 🔐 OWASP ASVS Requirement (falls relevant)

**Requirement:** (z.B. V2.2, V4.3, V12.4)  
**Level:** Level 1 / Level 2 / Level 3  
**Current Gap:** 

### ⚖️ DSGVO-Artikel (falls relevant)

**Artikel:** (z.B. Art. 5.1e, Art. 32, Art. 33)  
**Anforderung:** (z.B. Speicherbegrenzung, Sicherheit der Verarbeitung)  
**Aktueller Status:** 

### 📝 Policy-Inhalt (Draft)

**Erforderliche Sektionen:**

1. **Zweck & Scope**
   - Worum geht es?
   - Wer ist betroffen? (Rollen: Vorstand, Developer, Security Analyst, etc.)
   
2. **Richtlinien & Standards**
   - Konkrete Anforderungen (MUST / SHOULD / MAY)
   - Messbare Kriterien
   
3. **Prozesse & Workflows**
   - Schritt-für-Schritt-Anleitungen
   - Eskalationspfade
   - SLA-Zeiten
   
4. **Verantwortlichkeiten**
   - Owner (z.B. Security Analyst, DevOps Engineer)
   - Reviewer (z.B. Lead Architect, Vorstand)
   - Approver (z.B. Mitgliederversammlung bei Statuten-Änderung)
   
5. **Compliance-Referenzen**
   - ISO 27001 Controls
   - OWASP ASVS Requirements
   - DSGVO-Artikel
   - Österreichische Gesetze (BAO, DSG, TKG)
   
6. **Ausnahmen & Waivers**
   - Wann sind Ausnahmen erlaubt?
   - Genehmigungsprozess
   
7. **Review-Zyklus**
   - Frequenz (monatlich / quartalsweise / jährlich)
   - Trigger für außerplanmäßige Reviews (Incidents, Gesetzesänderungen)

### 🎯 Priorität (nach Gap-Analysis)

- [ ] **P0-Critical:** Sofortiger Handlungsbedarf (Security-Risiko, DSGVO-Verletzung, Business-Critical)
- [ ] **P1-High:** Innerhalb Q1 2026 (Compliance-Deadline, ISO 27001 Audit-Vorbereitung)
- [ ] **P2-Medium:** Innerhalb Q2 2026 (Best-Practice, Prozess-Optimierung)

### ⏰ Timeline & Milestones

**Draft-Fertigstellung:** [Datum]  
**Review-Phase:** [Datum - Datum]  
**Approval:** [Datum]  
**Implementation:** [Datum]  
**Kommunikation:** [Datum] (Team-Info, agents.md Update)

### 🔗 Verknüpfungen

**Abhängig von:**
- Issue #XXX (andere Policy)
- Milestone: [Q1 2026 DSGVO Audit]

**Blockiert:**
- Issue #YYY (Feature-Implementation)

**Referenzen:**
- [Gov Gap Analysis](../../reports/gov-gap-analysis.md) - Sektion X.Y.Z
- [Triage Rules](../../reports/triage-rules.md)
- [Roadmap](../../reports/roadmap.md)

### ✅ Definition of Done

- [ ] Policy-Dokument erstellt (`docs/governance/[name].md`)
- [ ] Reviewed von Owner + Lead Architect
- [ ] Approved von Vorstand (bei rechtlichen/finanziellen Auswirkungen)
- [ ] Cross-References aktualisiert:
  - [ ] `agents.md` (Quellen-Matrix erweitert)
  - [ ] `reports/gov-gap-analysis.md` (Status auf ✅ VOLLSTÄNDIG)
  - [ ] Relevante Instructions (`.github/instructions/*.instructions.md`)
- [ ] Team-Kommunikation (Newsletter, Slack, Mitgliederversammlung bei Major-Policies)
- [ ] Erste Review-Termin geplant (Kalender-Eintrag)

### 📚 Ressourcen & Templates

**Bestehende Policies als Vorlage:**
- [SECURITY.md](../../SECURITY.md) - Security Reporting
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Development Process
- [CODE_OF_CONDUCT.md](../../CODE_OF_CONDUCT.md) - Behavioral Standards

**Externe Standards:**
- ISO 27001:2022 Annex A: https://www.iso.org/standard/27001
- OWASP ASVS 4.0: https://owasp.org/www-project-application-security-verification-standard/
- DSGVO (EU 2016/679): https://eur-lex.europa.eu/eli/reg/2016/679/oj

---

**Owner Assignment:**
- Security Analyst: Security-Policies (Incident Response, Crypto, Access Control)
- DevOps Engineer: Operational-Policies (Backup, Change Management, Release)
- Lead Architect: Strategic-Policies (Code Ownership, Documentation, Tech Debt)
- Vorstand: Rechtliche-Policies (Third-Party Risk, AVV-Verträge)
