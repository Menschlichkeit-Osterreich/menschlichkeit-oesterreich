# Pre-EPIC-1 Checklist — Was ist zu tun, bevor wir starten?

**Gültig ab**: 2026-05-18  
**Phase**: 0 (Pre-Kickoff)  
**Dauer**: ~1 Woche  
**Ziel**: EPIC 1 ist ready-to-go

---

## 🚦 Blockierer-Check (Wenn 🔴, stopp hier!)

### 🔴 BLOCKER: Grant/Billing nicht aktiv?

**Check**: Ist ein Azure Grant oder Educational Subscription aktiv?

```bash
# Frage dem Grant Owner
"Ist unsere Nonprofit/Grant aktiv und können wir Azure nutzen?"
```

**Wenn NEIN**:

- ❌ STOPP — Nicht zu EPIC 1 fortfahren
- 📞 Eskaliere zu Finance/Sponsorship Owner
- ⏳ Warten auf Grant-Aktivierung (kann Wochen dauern!)

**Wenn JA**:

- ✅ Fortfahren zu nächstem Punkt

---

### 🔴 BLOCKER: Azure Account nicht vorhanden?

**Check**: Existiert ein Azure Account (Microsoft Account)?

```bash
az account show
# Sollte eine aktive Subscription zeigen
```

**Wenn NEIN**:

- ❌ STOPP — Nicht zu EPIC 1 fortfahren
- 🆕 Account erstellen: [https://signup.azure.com/](https://signup.azure.com/)
- ⏳ Warten auf Aktivierung (~15 Min)

**Wenn JA**:

- ✅ Fortfahren

---

## ✅ Phase 0 Checklist (Pre-Kickoff, Woche 1)

### Rollen & Ownership

- [ ] **ROLES_OWNERS_TEMPLATE.md ausfüllen** (alle 7 Rollen)
- [ ] **Backup Owner für jede Rolle benannt**
- [ ] **Slack/Teams Channel erstellt** für Koordination
- [ ] **Erstes Standup-Meeting scheduled**
  - Teilnehmer: Alle Owners
  - Agenda: Übersicht, EPIC 1 Kickoff, Q&A
  - Zeit: [_____________________]

### Grant & Billing Verification (Gate 1.1)

- [ ] **Grant-Status bestätigt**
  - [ ] Nonprofit-Grant: [Ja/Nein] (Aktivierungsdatum: \***\*\_\*\***)
  - [ ] Educational Subscription: [Ja/Nein] (Ablaufdatum: \***\*\_\*\***)
  - [ ] Sponsorship: [Ja/Nein] (Sponsor: \***\*\_\*\***)
- [ ] **Billing-Profil konfiguriert**
  - [ ] Zahlungsmethode hinterlegt (Credit Card / Bank Account)
  - [ ] Rechnungsadresse eingetragen
  - [ ] Budget Alerts gesetzt ($100/mo, $500/mo)
- [ ] **Renewal-Prozess dokumentiert**
  - [ ] Grant Renewal-Datum: [_____________________]
  - [ ] Renewal Owner benannt: [_____________________]
  - [ ] Renewal Reminder-Process: [automated / manual]

**Nachweis**: Screenshot von Azure Cost Management → Save to Gate 1.1 in ACCEPTANCE_GATE_MATRIX.md

---

### Azure Subscription Verification (Gate 1.2)

- [ ] **Subscription aktiv und erreichbar**

  ```bash
  az login
  az account show --query "{Name: name, ID: id, State: state}"
  ```

  Expected output:

  ```
  Name: [Subscription Name]
  ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  State: Enabled
  ```

- [ ] **Quotas prüfen** (mindestens für EPIC 1):

  ```bash
  az vm list-usage --location [eastus/westus/eu-central] \
    --query "[?name.value=='Virtual Machines'].{Name: name.value, CurrentValue: currentValue, Limit: limit}"
  ```

  ✓ VM quota ≥ 4 (für 1 VM + Buffer)
  ✓ vCPU quota ≥ 4 (für Standard_B2s)

- [ ] **Region bestimmt** (z.B. `eastus`, `eu-central`, `westus`)
  - [ ] Gewählte Region: [_____________________]
  - [ ] Begründung: [_____________________]

**Nachweis**: `az account show` output → Gate 1.2 in ACCEPTANCE_GATE_MATRIX.md

---

### Azure Infrastructure Owner Readiness

- [ ] **CLI Tools installiert & authenticated**

  ```bash
  az --version        # ≥ 2.50.0
  az account show     # Should return active subscription
  ssh -V              # ≥ 7.x
  ```

- [ ] **Zugriff bestätigt**
  - [ ] Azure Portal konfigurierbar (nicht read-only)
  - [ ] CLI `az` kann Ressourcen erstellen
  - [ ] SSH Key Pair Erstellung möglich

- [ ] **Azure Resource Naming Convention** dokumentiert
  - [ ] RG name: `[_____________________]` (z.B. `menschlichkeit-n8n-prod`)
  - [ ] VM name: `[_____________________]` (z.B. `n8n-vm-1`)
  - [ ] IP name: `[_____________________]` (z.B. `n8n-public-ip`)
  - [ ] NSG name: `[_____________________]` (z.B. `n8n-nsg`)
  - [ ] Tags: `Project`, `Service`, `Environment`, `Billing-Owner`

---

### Network & DNS Owner Readiness

- [ ] **Domain ownership verified**
  - [ ] Domain: `n8n.menschlichkeit-oesterreich.at`
  - [ ] Current DNS provider: [_____________________] (Plesk / Cloudflare / Route53 / Other)
  - [ ] Domain registrar: [_____________________]
  - [ ] Expiration date: [_____________________]

- [ ] **DNS Migration Plan drafted**
  - [ ] Current state documented (Plesk record, IP, CNAME, etc.)
  - [ ] Target state documented (Azure IP, A record)
  - [ ] Migration window scheduled: [_____________________]
  - [ ] Rollback plan documented

- [ ] **HTTPS Certificate Plan**
  - [ ] Certificate provider: [Let's Encrypt / Paid / Other: _______]
  - [ ] Certificate renewal process: [automated / manual]
  - [ ] Alert 30 days before expiration: [Yes / No]

---

### n8n Runtime Owner Readiness

- [ ] **Local Docker Setup (für Testings)**

  ```bash
  docker --version       # ≥ 20.x
  docker-compose --version  # ≥ 1.29.x or docker compose v2
  docker ps              # Should connect without errors
  ```

- [ ] **Docker Compose Template vorbereitet**
  - [ ] `docker-compose.yml` heruntergeladen aus IMPLEMENTATION_MASTER_SPEC.md
  - [ ] `.env` template erstellt mit Placeholder
  - [ ] Verzeichnisstruktur geplant:
    ```
    /opt/n8n/
    ├── docker-compose.yml
    ├── .env
    ├── scripts/
    │   ├── backup.sh
    │   └── restore.sh
    └── volumes/
        ├── n8n-data/
        └── postgres-data/
    ```

- [ ] **n8n Konfiguration vorbereitet**
  - [ ] `N8N_HOST`: [_____________________]
  - [ ] `N8N_PROTOCOL`: [http / https]
  - [ ] `N8N_EDITOR_BASE_URL`: [_____________________]
  - [ ] `WEBHOOK_URL`: [_____________________]
  - [ ] `N8N_ENCRYPTION_KEY`: [🔐 Will be generated]
  - [ ] Database credentials: [🔐 Will be generated]

---

### Security & Hardening Owner Readiness

- [ ] **SSH Key Pair Strategy**
  - [ ] Algorithm: [ed25519 (preferred) / rsa-4096]
  - [ ] Key storage plan: [secured vault / local backup]
  - [ ] Passphrase policy: [Yes (recommended) / No]
  - [ ] Key rotation schedule: [every X months]

- [ ] **Security Hardening Checklist ready**
  - [ ] Sshd hardening config available (PermitRootLogin, PasswordAuth, etc.)
  - [ ] UFW firewall plan documented
  - [ ] Fail2Ban installation plan ready
  - [ ] Secret rotation policy drafted

---

### Backup & DR Owner Readiness

- [ ] **Backup Strategy documented**
  - [ ] Backup frequency: [Daily / Hourly / Other: _______]
  - [ ] Backup target: [Azure Storage Account / Local / External NAS]
  - [ ] Retention policy: [7d local, 90d app, 1y audit]
  - [ ] Encryption: [AES-256 / Other: _______]

- [ ] **Restore Test Plan**
  - [ ] Restore test frequency: [Weekly / Monthly]
  - [ ] Restore test procedure: [Documented / To be documented]
  - [ ] Success criteria: [All data consistent, n8n starts, DB connected]

---

### Operations & Monitoring Owner Readiness

- [ ] **Monitoring Plan drafted**
  - [ ] Tool: [Datadog / Prometheus / CloudWatch / Other: _______]
  - [ ] Metrics: VM CPU, Memory, Disk, Container Status, n8n Health
  - [ ] Alerting: Email, Slack, Pagerduty, Other: **\_**
  - [ ] Dashboard: [Yes / No]

- [ ] **Incident Response ready**
  - [ ] On-call schedule: [24/7 / Business hours: _______]
  - [ ] Escalation path: L1 → L2 → L3
  - [ ] Response SLA: [_____________________] hours

---

## 📋 Documentation & Alignment

### Specification Review

- [ ] **spec.md** gelesen & verstanden
  - [ ] User Stories klar
  - [ ] Akzeptanzkriterien verständlich
  - [ ] Constraints dokumentiert
- [ ] **IMPLEMENTATION_MASTER_SPEC.md** durchgearbeitet
  - [ ] EPIC 1 Schritte verstanden
  - [ ] Definition of Done für jede Task klar
  - [ ] Blocker-Bedingungen bekannt

- [ ] **ACCEPTANCE_GATE_MATRIX.md** reviewed
  - [ ] Gate 1.1–1.5 Nachweise-Anforderungen klar
  - [ ] Evidence Template-Format verstanden
  - [ ] Go/No-Go Decision Template reviewed

---

### Communication & Signoff

- [ ] **Kickoff-Meeting durchgeführt**
  - [ ] Alle Owners anwesend
  - [ ] Rollen und Responsibilities confirmed
  - [ ] Schedule aligned (Daily standup, Weekly gate review, etc.)
  - [ ] Q&A resolved

- [ ] **Risk Register initialized**
  - [ ] Known risks documented
  - [ ] Mitigation plan drafted
  - [ ] Owner für jeden Risk benannt

- [ ] **Handover Checklist gegengezeichnet**
  ```
  ✓ Grant Owner: _________________ [Date: _______]
  ✓ Azure Infrastructure Owner: _________________ [Date: _______]
  ✓ Network & DNS Owner: _________________ [Date: _______]
  ✓ Runtime Owner: _________________ [Date: _______]
  ✓ Security Owner: _________________ [Date: _______]
  ✓ Backup & DR Owner: _________________ [Date: _______]
  ✓ Ops & Monitoring Owner: _________________ [Date: _______]
  ✓ Project Manager / Sponsor: _________________ [Date: _______]
  ```

---

## 🎯 Phase 0 Definition of Done

**Phase 0 ist COMPLETE wenn**:

1. ✅ Alle Rollen besetzt + signed
2. ✅ Gates 1.1 & 1.2 sind `pass` (Grant & Subscription verified)
3. ✅ ROLES_OWNERS_TEMPLATE.md vollständig ausgefüllt
4. ✅ Kickoff-Meeting durchgeführt
5. ✅ Alle Owners haben IMPLEMENTATION_MASTER_SPEC.md gelesen
6. ✅ First EPIC 1 Task (T1.1) kann Monday morning starten

---

## ⏰ Timeline Phase 0

| Task                     | Owner       | Duration    | Start  | End        |
| ------------------------ | ----------- | ----------- | ------ | ---------- |
| Rollen bestimmen         | PM          | 2 days      | [Date] | [Date]     |
| ROLES_OWNERS ausfüllen   | Each Owner  | 1 day       | [Date] | [Date]     |
| Grant/Billing verify     | Grant Owner | 2–5 days    | [Date] | [Date]     |
| Azure Subscription setup | Azure Owner | 1 day       | [Date] | [Date]     |
| Kickoff-Meeting          | PM          | 2 hours     | [Date] | [Date]     |
| **Phase 0 DONE**         | —           | **~1 week** | [Date] | **[Date]** |

---

## 🚀 Ready to EPIC 1?

**Wenn alle Punkte oben ✅ sind, antworte**:

```
✅ READY FOR EPIC 1 KICKOFF

Date: [_____________________]
Approved by: [_____________________]
Signature: _____________________
```

---

**Checklisten-Version**: 1.0  
**Gültig ab**: 2026-05-18  
**Nächste Review**: Nach EPIC 1 Kickoff
