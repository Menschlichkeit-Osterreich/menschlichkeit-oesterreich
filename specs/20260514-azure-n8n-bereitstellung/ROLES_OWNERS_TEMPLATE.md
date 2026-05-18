# Rollen & Ownership Matrix — Zum Ausfüllen

**Dokument-Typ**: Vorlage (ausfüllbar)
**Gültig ab**: Phase 0 (vor EPIC 1 Kickoff)
**Letzte Aktualisierung**: 2026-05-18

---

## 📋 Ownership Übersicht

Diese Matrix bestimmt, wer für jede kritische Komponente verantwortlich ist. **Sie MUSS vor EPIC 1 Kickoff vollständig ausgefüllt sein.**

---

## 🔑 Primary Owner Rollen

### 1️⃣ Grant & Billing Owner

**Verantwortung**: Grant-Status, Sponsorship, Billing-Profil, Budget Alerts, Renewal

| Feld              | Wert                                                  |
| ----------------- | ----------------------------------------------------- |
| **Name**          | [_____________________]                               |
| **E-Mail**        | [_____________________]                               |
| **Rolle**         | [ ] Finance [ ] Project Manager [ ] Founder [ ] Admin |
| **Verfügbarkeit** | [_____________________] (z.B. Mo–Fr 9–17)             |
| **Backup Owner**  | [_____________________]                               |
| **Backup E-Mail** | [_____________________]                               |

**Verifizierungspunkte** (vor T1.1):

- [ ] Nonprofit-Grant / Educational Subscription aktiv
- [ ] Billing-Profil vorhanden und zahlungsfähig
- [ ] Budget Alerts auf $100/mo und $500/mo gesetzt
- [ ] Renewal-Datum bekannt: [________________]
- [ ] Sponsor bestätigt (falls zutreffend): [________________]

**Eskalation**: Wenn blockiert, an [_____________________] melden

---

### 2️⃣ Azure Infrastructure Owner

**Verantwortung**: Azure Subscription, Resource Group, VM, Disk, Networking

| Feld                    | Wert                                                                           |
| ----------------------- | ------------------------------------------------------------------------------ |
| **Name**                | [_____________________]                                                        |
| **E-Mail**              | [_____________________]                                                        |
| **Rolle**               | [ ] Cloud Architect [ ] DevOps Engineer [ ] System Admin [ ] AWS/GCP migration |
| **Azure Zertifikation** | [ ] AZ-900 [ ] AZ-104 [ ] Other: [_______] [ ] None                            |
| **Verfügbarkeit**       | [_____________________]                                                        |
| **Backup Owner**        | [_____________________]                                                        |

**EPIC 1 Deliverables**:

- [ ] Azure Subscription konfiguriert (Gates 1.1–1.2)
- [ ] Resource Group angelegt (Gate 1.3)
- [ ] VM deployed (Gate 2.1)
- [ ] NSG rules gesetzt (Gate 1.5)
- [ ] SSH Key Management Plan dokumentiert

**Eskalation**: Wenn blockiert, an [_____________________] melden

---

### 3️⃣ Network & DNS Owner

**Verantwortung**: DNS-Konfiguration, Domain-Verwaltung, Plesk-Migration, HTTPS

| Feld              | Wert                                                                |
| ----------------- | ------------------------------------------------------------------- |
| **Name**          | [_____________________]                                             |
| **E-Mail**        | [_____________________]                                             |
| **Rolle**         | [ ] Network Admin [ ] DNS Manager [ ] DevOps [ ] Hosting Provider   |
| **DNS-System**    | [ ] AWS Route53 [ ] Cloudflare [ ] Plesk (alt) [ ] Other: [_______] |
| **Verfügbarkeit** | [_____________________]                                             |
| **Backup Owner**  | [_____________________]                                             |

**EPIC 3 Deliverables**:

- [ ] DNS-Konfiguration geplant (Gate 4.2)
- [ ] Let's Encrypt / Certificate provisioning Plan (Gate 4.2)
- [ ] HTTPS-Redirect konfiguriert
- [ ] Plesk-Ablösung dokumentiert (wenn zutreffend)

**Eskalation**: Wenn blockiert, an [_____________________] melden

---

### 4️⃣ n8n / Runtime Owner

**Verantwortung**: n8n Konfiguration, Container Management, PostgreSQL, Docker Compose

| Feld                 | Wert                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| **Name**             | [_____________________]                                                |
| **E-Mail**           | [_____________________]                                                |
| **Rolle**            | [ ] DevOps Engineer [ ] Backend Engineer [ ] Platform Engineer [ ] SRE |
| **Docker Erfahrung** | [ ] Production [ ] Development [ ] Learning [ ] None                   |
| **n8n Erfahrung**    | [ ] Advanced [ ] Intermediate [ ] Beginner [ ] None                    |
| **Verfügbarkeit**    | [_____________________]                                                |
| **Backup Owner**     | [_____________________]                                                |

**EPIC 2–3 Deliverables**:

- [ ] Docker & Docker Compose installiert (Gates 2.2–2.3)
- [ ] n8n Container konfiguriert (Gate 3.1)
- [ ] PostgreSQL läuft (Gate 3.2)
- [ ] Reverse Proxy (nginx) konfiguriert
- [ ] .env mit Pflicht-Variablen erstellt

**Eskalation**: Wenn blockiert, an [_____________________] melden

---

### 5️⃣ Security & Hardening Owner

**Verantwortung**: SSH-Hardening, UFW, Secret Management, Backup-Encryption, Audit

| Feld                            | Wert                                                                        |
| ------------------------------- | --------------------------------------------------------------------------- |
| **Name**                        | [_____________________]                                                     |
| **E-Mail**                      | [_____________________]                                                     |
| **Rolle**                       | [ ] Security Engineer [ ] CISO [ ] DevOps (Security) [ ] Compliance Officer |
| **Sicherheits-Audit-Erfahrung** | [ ] Häufig [ ] Gelegentlich [ ] Neu [ ] None                                |
| **Verfügbarkeit**               | [_____________________]                                                     |
| **Backup Owner**                | [_____________________]                                                     |

**EPIC 2 & 4 Deliverables**:

- [ ] SSH-Hardening Plan umgesetzt (Gate 2.4)
- [ ] UFW Firewall aktiv (Gate 2.3)
- [ ] Secret Rotation Policy dokumentiert
- [ ] Backup-Encryption aktiviert
- [ ] Audit-Logging konfiguriert

**Eskalation**: Bei Sicherheits-Issues, an [_____________________] melden

---

### 6️⃣ Backup & Disaster Recovery Owner

**Verantwortung**: Backup-Strategie, Testing, Retention, Restore-Prozedur

| Feld                            | Wert                                                           |
| ------------------------------- | -------------------------------------------------------------- |
| **Name**                        | [_____________________]                                        |
| **E-Mail**                      | [_____________________]                                        |
| **Rolle**                       | [ ] DevOps Engineer [ ] Database Admin [ ] Ops Manager [ ] SRE |
| **Disaster Recovery Erfahrung** | [ ] Advanced [ ] Intermediate [ ] Beginner [ ] None            |
| **Verfügbarkeit**               | [_____________________]                                        |
| **Backup Owner (2nd)**          | [_____________________]                                        |

**EPIC 4 Deliverables**:

- [ ] Backup-Script geschrieben und getestet (T4.1)
- [ ] Tägliche Backups konfiguriert
- [ ] Restore-Test erfolgreich durchgeführt (T4.3)
- [ ] Snapshot-Strategie für VM dokumentiert
- [ ] Retention Policy definiert (7d local, 90d app, 1y audit)

**Eskalation**: Bei Backup-Fehlern, an [_____________________] melden

---

### 7️⃣ Operations & Monitoring Owner

**Verantwortung**: Monitoring, Alerting, Incident Response, Runbooks, SLA

| Feld                 | Wert                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| **Name**             | [_____________________]                                                      |
| **E-Mail**           | [_____________________]                                                      |
| **Rolle**            | [ ] SRE [ ] DevOps Engineer [ ] Ops Manager [ ] On-Call                      |
| **Monitoring-Tools** | [ ] DataDog [ ] Prometheus [ ] New Relic [ ] CloudWatch [ ] Other: [_______] |
| **24/7 On-Call**     | [ ] Yes [ ] No (Geschäftszeiten: [__________])                               |
| **Verfügbarkeit**    | [_____________________]                                                      |

**Laufende Deliverables**:

- [ ] Monitoring Dashboard konfiguriert
- [ ] Alert Thresholds definiert
- [ ] Runbook: "n8n läuft nicht" erstellt
- [ ] Runbook: "Disk voll" erstellt
- [ ] Runbook: "PostgreSQL down" erstellt

**Eskalation**: Bei Incidents, an [_____________________] melden

---

## 📞 Kommunikations-Matrix

### Status-Meetings

| Meeting                | Cadence            | Moderator               | Attendees             |
| ---------------------- | ------------------ | ----------------------- | --------------------- |
| **Daily Standup**      | Mo–Fr 9 AM         | [_____________________] | Runtime + Infra Owner |
| **Weekly Gate Review** | Every Friday 3 PM  | [_____________________] | All Owners            |
| **Phase Kickoff**      | Start of each EPIC | [_____________________] | All Owners + PM       |
| **Go/No-Go Decision**  | End of EPIC 5      | [_____________________] | All Owners + Exec     |

### Escalation Path

**Level 1** (Technical Lead):
Name: [_____________________]
E-Mail: [_____________________]
Response Time: [_____________________] hours

**Level 2** (Architecture Owner):
Name: [_____________________]
E-Mail: [_____________________]
Response Time: [_____________________] hours

**Level 3** (Executive Sponsor):
Name: [_____________________]
E-Mail: [_____________________]
Response Time: [_____________________] hours

---

## 🔄 Handoff & Transition Plan

### Phase 0 → Phase 1 (Pre-Kickoff)

- [ ] Alle Rollen besetzt
- [ ] Backup Owner für jede Rolle bestätigt
- [ ] Slack/Teams Channel erstellt: [_____________________]
- [ ] First meeting scheduled: [_____________________]

### EPIC 1 → EPIC 2

- [ ] EPIC 1 Gates alle pass
- [ ] Infra Owner gibt Approval
- [ ] Runtime Owner ready (Docker/n8n Umgebung vorbereitet)

### EPIC 4 → EPIC 5 (Pre-Acceptance)

- [ ] Backup & Restore Tests erfolgreich
- [ ] Security Hardening Review passed
- [ ] Operations Runbooks documented & tested

### EPIC 5 → Production (Go/No-Go)

- [ ] All 14 Gates = pass
- [ ] Go/No-Go Committee reviews ACCEPTANCE_GATE_MATRIX.md
- [ ] Signoff von Security, Ops, Finance

---

## ✍️ Unterschriften & Bestätigung

**Hiermit bestätige ich, dass**:

1. ✓ Alle Rollen besetzt sind
2. ✓ Backup Owner für jede Rolle benannt
3. ✓ Kommunikations-Plan verstanden
4. ✓ Ich bin verantwortlich für meine Rollen

**Grant & Billing Owner**:
Signature: ****\*\*\*\*****\_\_****\*\*\*\***** Date: **\*\***\_\_**\*\***

**Azure Infrastructure Owner**:
Signature: ****\*\*\*\*****\_\_****\*\*\*\***** Date: **\*\***\_\_**\*\***

**Network & DNS Owner**:
Signature: ****\*\*\*\*****\_\_****\*\*\*\***** Date: **\*\***\_\_**\*\***

**n8n / Runtime Owner**:
Signature: ****\*\*\*\*****\_\_****\*\*\*\***** Date: **\*\***\_\_**\*\***

**Security & Hardening Owner**:
Signature: ****\*\*\*\*****\_\_****\*\*\*\***** Date: **\*\***\_\_**\*\***

**Backup & DR Owner**:
Signature: ****\*\*\*\*****\_\_****\*\*\*\***** Date: **\*\***\_\_**\*\***

**Operations & Monitoring Owner**:
Signature: ****\*\*\*\*****\_\_****\*\*\*\***** Date: **\*\***\_\_**\*\***

**Project Manager / Sponsor**:
Signature: ****\*\*\*\*****\_\_****\*\*\*\***** Date: **\*\***\_\_**\*\***

---

**Dokument-Version**: 1.0
**Template-Datum**: 2026-05-18
**Fertig zum Ausfüllen**: [ ] JA [ ] NEIN
**Letzte Verifizierung**: ****\*\*\*\*****\_\_****\*\*\*\***** von [______________]
