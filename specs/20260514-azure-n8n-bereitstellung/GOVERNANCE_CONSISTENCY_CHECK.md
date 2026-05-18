# Governance Consistency Check — Validierung der Spezifikation

**Zweck**: Überprüfe, dass alle Specification-Layer konsistent zueinander sind
**Frequenz**: Nach jeder Major-Update
**Gültig ab**: 2026-05-18

---

## 🔍 Konsistenz-Prüfungen

### ✅ Layer A ↔ Layer B (Governance ↔ Technical)

#### Gate 1.1: Grant-/Billing-Status

| Ebene          | Dokumentation                 | Status                                       |
| -------------- | ----------------------------- | -------------------------------------------- |
| **A**          | spec.md, plan.md              | "Grant-Status = Provisioning-Blocker"        |
| **B**          | IMPLEMENTATION_MASTER_SPEC.md | "EPIC 1 — Azure Foundation" startet mit T1.1 |
| **Konsistenz** | A → B müssen übereinstimmen   | ✅                                           |

**Check**:

- [ ] spec.md sagt "Grant = Blocker"
- [ ] IMPLEMENTATION_MASTER_SPEC.md T1.1 behandelt Grant
- [ ] Beide nennen dieselbe Evidence-Anforderung

---

#### Gate 1.5: NSG Rules (`22/80/443` offen, `5678/5432/6379` zu)

| Ebene          | Dokumentation                                   | Status                          |
| -------------- | ----------------------------------------------- | ------------------------------- |
| **A**          | data-model.md, contracts/deployment-contract.md | Blockerklasse `go_live_blocker` |
| **B**          | IMPLEMENTATION_MASTER_SPEC.md EPIC 1            | Konkrete NSG-Regel-Syntax       |
| **Konsistenz** | Beide nennen selbe Ports                        | ✅                              |

**Check**:

- [ ] data-model.md sagt: Port 22, 80, 443 Allow; Rest Deny
- [ ] IMPLEMENTATION_MASTER_SPEC.md EPIC 1 zeigt: `az network nsg rule create --priority 100 --source-address-prefixes '*' --destination-port-ranges '22'`
- [ ] ACCEPTANCE_GATE_MATRIX.md Gate 1.5 zeigt: Exakte `az nsg rule list` Verifizierung

---

#### n8n Encryption Key (`N8N_ENCRYPTION_KEY`)

| Ebene          | Dokumentation                                                    | Statement                                                        |
| -------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| **A**          | contracts/runtime-contract.md                                    | "N8N_ENCRYPTION_KEY Pflicht, nicht in plaintext"                 |
| **B**          | IMPLEMENTATION_MASTER_SPEC.md EPIC 3 T3.2                        | `.env` template mit `N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)` |
| **C**          | quickstart.md                                                    | "Step 3: Generate and secure N8N_ENCRYPTION_KEY"                 |
| **Konsistenz** | Alle drei Layer mennen "Pflicht + nicht plaintext + Generierung" | ✅                                                               |

**Check**:

- [ ] contracts/runtime-contract.md: N8N_ENCRYPTION_KEY = Pflicht ✓
- [ ] IMPLEMENTATION_MASTER_SPEC.md: Generierungs-Befehl present ✓
- [ ] quickstart.md: Operative Schritt vorhanden ✓

---

#### Exposure Rules (22/80/443 public, 5678/5432/6379 nicht public)

| Ebene | Spezifikation                                                                    |
| ----- | -------------------------------------------------------------------------------- |
| **A** | spec.md: "Invarianten: 22/80/443 offen, 5678/5432/6379 nicht"                    |
| **B** | contracts/deployment-contract.md: NSG rules definiert                            |
| **C** | IMPLEMENTATION_MASTER_SPEC.md EPIC 2: UFW config, EPIC 5: Port-scan verification |

**Check**:

- [ ] spec.md enthält Invariante
- [ ] contracts/deployment-contract.md zeigt NSG-Syntax
- [ ] IMPLEMENTATION_MASTER_SPEC.md EPIC 5 T5.1 testet mit `nmap`
- [ ] ACCEPTANCE_GATE_MATRIX.md Gate 4.1 zeigt nmap result template

---

#### Backup & Restore (Pflicht, mit Test)

| Ebene        | Dokumentation                        | Aussage                                   |
| ------------ | ------------------------------------ | ----------------------------------------- |
| **A**        | contracts/runtime-contract.md        | "Backup/Restore-Pflicht vor Go"           |
| **B**        | IMPLEMENTATION_MASTER_SPEC.md EPIC 4 | 4 Tasks: Script, Test, Restore, Snapshots |
| **C**        | quickstart.md                        | Step 8: Backup-Strategie                  |
| **Operativ** | ACCEPTANCE_GATE_MATRIX.md Gate 4.3   | Backup script + restore test evidence     |

**Check**:

- [ ] contracts/runtime-contract.md: "Blocker-Regel: Backup-Plan = No-Go-Blocker"
- [ ] IMPLEMENTATION_MASTER_SPEC.md EPIC 4: Alle 4 Tasks sind present
- [ ] quickstart.md: Operative Schritt aufrn Backups
- [ ] ACCEPTANCE_GATE_MATRIX.md Gate 4.3: Nachweisform definiert

---

### ✅ Layer B ↔ Layer C (Technical ↔ Operational Evidence)

#### EPIC 1 → Gate 1.1–1.5

| EPIC   | Tasks     | Gates        | Konsistenz              |
| ------ | --------- | ------------ | ----------------------- |
| EPIC 1 | T1.1–T1.6 | Gate 1.1–1.5 | Each T1.x → Gate 1.x ✅ |

**Check**:

- [ ] T1.1 (Subscription) → Gate 1.2 (Subscription) ✓
- [ ] T1.2 (Billing) → Gate 1.1 (Grant/Billing) ✓
- [ ] T1.3 (RG) → Gate 1.3 (RG) ✓
- [ ] T1.4 (IP) → Gate 1.4 (IP) ✓
- [ ] T1.5 (NSG) → Gate 1.5 (NSG) ✓

---

#### EPIC 2 → Gate 2.1–2.4

| EPIC        | Tasks                  | Gates                       |
| ----------- | ---------------------- | --------------------------- |
| EPIC 2 T2.1 | VM deploy              | Gate 2.1 (VM running)       |
| EPIC 2 T2.2 | Docker install         | Gate 2.2 (Docker installed) |
| EPIC 2 T2.3 | Docker Compose install | (part of T2.2–2.3)          |
| EPIC 2 T2.4 | UFW configure          | Gate 2.3 (UFW enabled)      |
| EPIC 2 T2.5 | SSH harden             | Gate 2.4 (SSH hardened)     |

**Check**:

- [ ] T2.x Tasks sind in Task-Sequenz
- [ ] Gates 2.1–2.4 sind in ACCEPTANCE_GATE_MATRIX.md
- [ ] Evidenz-Templates match Task output

---

#### EPIC 3 → Gate 3.1–3.2

| Task     | Output                   | Gate                          |
| -------- | ------------------------ | ----------------------------- |
| T3.1–3.2 | .env, docker-compose.yml | Gate 3.1 (n8n running)        |
| T3.3–3.4 | PostgreSQL + n8n config  | Gate 3.2 (PostgreSQL running) |
| T3.5–3.6 | Reverse proxy + HTTPS    | Gate 4.2 (HTTPS valid)        |

**Check**:

- [ ] T3.1–3.6 outputs sind dokumentiert
- [ ] Gates 3.1–3.2 templates vorhanden
- [ ] HTTPS gate definition klar

---

#### EPIC 4 → Gate 4.3

| Task | Output              | Gate        |
| ---- | ------------------- | ----------- |
| T4.1 | backup.sh script    | Gate 4.3    |
| T4.2 | DB dump test log    | Gate 4.3    |
| T4.3 | Restore test result | Gate 4.3 ✓  |
| T4.4 | Snapshot plan doc   | (reference) |

**Check**:

- [ ] Gate 4.3 template includes all 4 artifacts
- [ ] Evidence form captures all outputs

---

#### EPIC 5 → All Gates (Final Acceptance)

| Task | Verifies                         |
| ---- | -------------------------------- |
| T5.1 | Gate 4.1 (Port exposure)         |
| T5.2 | Webhook testing (custom)         |
| T5.3 | Gate 3.2 re-verify (persistence) |
| T5.4 | Restart test (new)               |
| T5.5 | Gate 4.2 re-verify (HTTPS)       |
| T5.6 | Final checklist → Go/No-Go       |

**Check**:

- [ ] T5.1–5.6 re-verify existing gates
- [ ] T5.6 final checklist references all 14 gates
- [ ] GO_LIVE_SIGNOFF_TEMPLATE.md aligned with T5.6 output

---

### ✅ Cross-Layer Evidence Type Consistency

#### Primary Source Evidence (Grant, Subscription, RG, IP, NSG)

| Gate | Evidence Type  | Source                  | Verification                       |
| ---- | -------------- | ----------------------- | ---------------------------------- |
| 1.1  | Primary Source | Azure portal, Grant doc | `az cost management` screenshot    |
| 1.2  | Primary Source | Azure CLI               | `az account show` output           |
| 1.3  | Primary Source | Azure CLI               | `az group show` output             |
| 1.4  | Primary Source | Azure CLI               | `az network public-ip show` output |
| 1.5  | Primary Source | Azure CLI               | `az network nsg rule list` output  |

**Check**:

- [ ] All Primary Source gates use same evidence type
- [ ] Commands are executable and produce expected output
- [ ] Evidence templates capture correct fields

---

#### Live Proof Evidence (Running services, SSH, Port scans)

| Gate | Evidence Type | Test                  | Verification                         |
| ---- | ------------- | --------------------- | ------------------------------------ |
| 2.1  | Live Proof    | SSH connect           | `ssh ... "echo OK"`                  |
| 2.2  | Live Proof    | Docker ps             | `docker ps` output                   |
| 2.3  | Live Proof    | UFW status            | `sudo ufw status` output             |
| 2.4  | Live Proof    | SSH config + neg test | `sudo sshd -T`, password login fails |
| 3.1  | Live Proof    | HTTP 200              | `curl -I http://localhost:5678`      |
| 3.2  | Live Proof    | DB query              | `docker-compose exec postgres psql`  |
| 4.1  | Live Proof    | nmap scan             | `nmap -p ...` output                 |
| 4.2  | Live Proof    | SSL cert check        | `openssl s_client` output            |
| 4.3  | Live Proof    | Restore test          | DB data verification                 |

**Check**:

- [ ] All Live Proof gates use same test methodology
- [ ] Commands are runnable from gate executor context
- [ ] Evidence templates have concrete command & output fields

---

#### Open Checkpoint Evidence (Ownership, Plans)

| Gate | Evidence Type                     | Status                   |
| ---- | --------------------------------- | ------------------------ |
| 4.4  | Primary Source (names + sign-off) | ROLES_OWNERS_TEMPLATE.md |

**Check**:

- [ ] Gate 4.4 asks for names, not "TBD"
- [ ] Evidence includes signature block

---

### ✅ User Story Alignment

#### User Story 1 (Grant & Billing Gate)

| Document                                 | References                                   |
| ---------------------------------------- | -------------------------------------------- |
| spec.md US1                              | "Nonprofit grant active, billing configured" |
| contracts/deployment-contract.md         | Grant-/Billing-Checklist table               |
| IMPLEMENTATION_MASTER_SPEC.md T1.1, T1.2 | Subscription + Billing verification          |
| ACCEPTANCE_GATE_MATRIX.md Gate 1.1       | Evidence template for grant status           |
| QUICK_CHECKLIST_PRE_EPIC1.md             | Grant verification section                   |

**Check**:

- [ ] All references mention same criteria
- [ ] Evidence path is clear (Grant doc → Gate 1.1 → Signoff)

---

#### User Story 2 (Azure Target Architecture)

| Document                               | References                                    |
| -------------------------------------- | --------------------------------------------- |
| spec.md US2                            | "Single-Main n8n on Azure VM with PostgreSQL" |
| plan.md                                | "Phase 1–2 infrastructure + n8n deployment"   |
| contracts/deployment-contract.md       | Azure resource model                          |
| contracts/runtime-contract.md          | n8n single-main, container layout             |
| IMPLEMENTATION_MASTER_SPEC.md EPIC 1–3 | All infrastructure & runtime steps            |

**Check**:

- [ ] All components named consistently
- [ ] Port assignments are same across all docs
- [ ] Single-Main mode explicitly mentioned

---

#### User Story 3 (DNS/HTTPS/Backup Path)

| Document                                  | References                                 |
| ----------------------------------------- | ------------------------------------------ |
| spec.md US3                               | "DNS target, HTTPS, backup before go-live" |
| contracts/workflow-validation-contract.md | DNS & HTTPS acceptance gate                |
| contracts/runtime-contract.md             | Backup-Pflicht                             |
| IMPLEMENTATION_MASTER_SPEC.md EPIC 3–4    | DNS config, HTTPS, Backup script           |
| ACCEPTANCE_GATE_MATRIX.md Gate 4.2–4.3    | HTTPS and Backup evidence                  |

**Check**:

- [ ] All three requirements present in evidence
- [ ] Gate sequence is: T3.6 (HTTPS) → T4.1–3 (Backup) → T5 (Final)

---

### ✅ Blocker Classification Consistency

#### Provisioning Blockers (8 Gates)

Gates that MUST pass before infrastructure can move forward:

| Gate | Blocker Class        | Task Blocked | Documented in                      |
| ---- | -------------------- | ------------ | ---------------------------------- |
| 1.1  | provisioning_blocker | All EPIC 1   | contracts/deployment-contract.md   |
| 1.2  | provisioning_blocker | All EPIC 1   | IMPLEMENTATION_MASTER_SPEC.md T1.1 |
| 1.3  | provisioning_blocker | All EPIC 1   | (RG depends on subscription)       |
| 1.4  | provisioning_blocker | EPIC 2       | (IP before VM assign)              |
| 2.1  | provisioning_blocker | EPIC 2–3     | (VM must run before docker)        |
| 2.2  | provisioning_blocker | EPIC 3       | (Docker before n8n)                |
| 3.1  | provisioning_blocker | EPIC 3       | (n8n editor must start)            |
| 3.2  | provisioning_blocker | EPIC 3       | (DB must connect)                  |

**Check**:

- [ ] All 8 provisioning blockers listed
- [ ] No gates missing from this list
- [ ] Each blocker has clear "blocks what" definition

---

#### Go-Live Blockers (7 Gates)

Gates that MUST pass before production release:

| Gate | Blocker Class   | Reason                                   | Documented in                             |
| ---- | --------------- | ---------------------------------------- | ----------------------------------------- |
| 1.5  | go_live_blocker | Security: ports must be firewalled       | contracts/deployment-contract.md          |
| 2.3  | go_live_blocker | Security: UFW must be on                 | contracts/deployment-contract.md          |
| 2.4  | go_live_blocker | Security: SSH must be hardened           | contracts/deployment-contract.md          |
| 4.1  | go_live_blocker | Security: private ports cannot be open   | contracts/workflow-validation-contract.md |
| 4.2  | go_live_blocker | Security/Operations: HTTPS must be valid | contracts/workflow-validation-contract.md |
| 4.3  | go_live_blocker | Disaster recovery: backup must work      | contracts/runtime-contract.md             |
| 4.4  | go_live_blocker | Operations: ownership must be clear      | data-model.md                             |

**Check**:

- [ ] All 7 go_live_blockers listed
- [ ] Each blocker has security or operational reason
- [ ] No blocker can be waived without review

---

### ✅ Terminology Consistency

#### "Abnahmevorbereitung" (Acceptance Readiness)

**Definition** (from spec.md):
"System ist ready für finale Acceptance Testing, aber NICHT für produktiven Rollout."

**Check**:

- [ ] plan.md uses "Abnahmevorbereitung"
- [ ] IMPLEMENTATION_MASTER_SPEC.md marks "after EPIC 5 = Acceptance Ready"
- [ ] GO_LIVE_SIGNOFF_TEMPLATE.md indicates "This is Go/No-Go decision, NOT production commitment"

---

#### "Blocker" vs. "Warnung" (Blocker vs. Warning)

**Definition**:

- **Blocker** = Red line, must pass or escalate
- **Warnung** = Yellow warning, proceed with caution

**Check**:

- [ ] No "blocker" called as "warning"
- [ ] All 15 gates have explicit blocker class
- [ ] Decision tree uses "blocker" consistently

---

#### "Betrieb" (Operations) vs. "Deployment"

**Usage**:

- **Deployment** = Installation process (EPIC 1–5)
- **Betrieb** = Day-to-day running (after EPIC 5)

**Check**:

- [ ] IMPLEMENTATION_MASTER_SPEC.md uses "Deployment"
- [ ] quickstart.md uses "operative"
- [ ] contracts/runtime-contract.md uses "Betriebsmodus"

---

## 📝 Consistency Report Template

**Report Date**: [YYYY-MM-DD]
**Reviewed By**: [Name]
**Report Version**: 1.0

### Summary

- [ ] **Layer A ↔ B Consistency**: ✅ PASS / ⚠️ WARNINGS / ❌ FAIL
- [ ] **Layer B ↔ C Consistency**: ✅ PASS / ⚠️ WARNINGS / ❌ FAIL
- [ ] **Evidence Type Alignment**: ✅ PASS / ⚠️ WARNINGS / ❌ FAIL
- [ ] **Blocker Classification**: ✅ PASS / ⚠️ WARNINGS / ❌ FAIL
- [ ] **Terminology Usage**: ✅ PASS / ⚠️ WARNINGS / ❌ FAIL

### Issues Found

```
[If any issues, list them with severity and fix owner]

1. Issue: [Describe inconsistency]
   Severity: [High / Medium / Low]
   Fix Owner: [Name]
   Fix Date: [Target]

2. [...]
```

### Recommendations

```
[Optional recommendations for improvement]
```

### Sign-Off

**Consistency Check Status**: [ ] APPROVED / [ ] APPROVED WITH CONDITIONS / [ ] REJECTED

**Reviewer Signature**: \***\*\*\*\*\***\_\***\*\*\*\*\*** Date: [______]

**Next Review Date**: [YYYY-MM-DD] (after EPIC 1 / EPIC 3 / Production)

---

**Document Version**: 1.0
**Last Consistency Check**: [YYYY-MM-DD]
**Next Scheduled Check**: [YYYY-MM-DD]
