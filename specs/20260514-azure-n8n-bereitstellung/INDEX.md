# INDEX — Alle Dokumente im Überblick

**Aktualisiert**: 2026-05-18
**Gesamt-Dokumente**: 19  
**Gesamt-Umfang**: ~10.000 Zeilen

**Zentraler Statushinweis**: Maßgeblich ist die Statusaussage in [README.md](./README.md). Dieses Verzeichnis ist Spec-/Handoff-Dokumentation und kein Live-Betriebsnachweis.

---

## 🎯 Quick Navigation

### 🚀 ICH BIN NEU — Wo fange ich an?

1. **[README.md](./README.md)** ← Start here (5 Min Lese-Zeit)
2. **[QUICK_CHECKLIST_PRE_EPIC1.md](./QUICK_CHECKLIST_PRE_EPIC1.md)** ← Was ist zu tun? (Phase 0)
3. **[ROLES_OWNERS_TEMPLATE.md](./ROLES_OWNERS_TEMPLATE.md)** ← Wer macht was? (ausfüllen)
4. **[IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md)** ← Wie machen wir es? (Technisch)

### 📊 ICH MUSS EINEN GATE NACHWEISEN

→ **[ACCEPTANCE_GATE_MATRIX.md](./ACCEPTANCE_GATE_MATRIX.md)** (Gate 1.1–4.4)

### 🏗️ ICH BAUE ETWAS GERADE

→ **[IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md)** (Ebene B+C, alle 5 EPICs)

### 📋 ICH MUSS OPERATIV HANDELN

→ **[quickstart.md](./quickstart.md)** (Schritt-für-Schritt operative Anleitung)

---

## 📚 Vollständiges Dokumentverzeichnis

### ⭐⭐⭐ **MUST READ — Die 3 Kerndokumente**

| Dokument                                                             | Typ         | Seiten | Zielgruppe    | Zweck                                                      |
| -------------------------------------------------------------------- | ----------- | ------ | ------------- | ---------------------------------------------------------- |
| **[IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md)** | Technical   | ~80    | Engineers     | Alle technischen Details: EPICs, Tasks, Commands, Blockers |
| **[ACCEPTANCE_GATE_MATRIX.md](./ACCEPTANCE_GATE_MATRIX.md)**         | Operational | ~60    | Operators, QA | Go/No-Go Nachweise, Gate-Status, Evidenz-Templates         |
| **[README.md](./README.md)**                                         | Navigation  | ~8     | Everyone      | Einstiegspunkt, Überblick, Schnelle Links                  |

---

### 📖 **Ebene A — Governance Spec (Sollzustand, stabil)**

| Datei                            | Zweck                                                                                   | Audience                                | Status      |
| -------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------- | ----------- |
| [spec.md](./spec.md)             | Feature-Spezifikation: Ziel, Scope, User Stories, FR-001–FR-014, Acceptance Criteria    | Product Owner, Architects, Review Board | ✅ Complete |
| [plan.md](./plan.md)             | Phasenplan: Phase 1–3, Architektur-Kontext, Deliverables, Constitution Check            | Tech Lead, Project Manager              | ✅ Complete |
| [data-model.md](./data-model.md) | Acceptance Objects (12 Stück), Evidence Types, Blocker Rules, Gate Matrix Template      | QA, Acceptance Manager, Data Steward    | ✅ Complete |
| [research.md](./research.md)     | Entscheidungsweiche: 7 kritische Entscheidungen mit Rationale, Alternativen, Trade-offs | Decision Makers, Reviewer, Architect    | ✅ Complete |

---

### 🔧 **Ebene B — Technical Implementation (Wie baue ich es?)**

| Datei                                                                                    | Zweck                                                                                                  | Audience                              | Status      |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------- | ----------- |
| **[IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md)** ⭐                  | Kanonische Spezifikation aller 5 EPICs: Infrastruktur, Runtime, Security, Operations, 25 atomare Tasks | Engineers, DevOps, Platform           | ✅ Complete |
| [contracts/deployment-contract.md](./contracts/deployment-contract.md)                   | Azure Infrastruktur-Vertrag: VM, RG, IP, NSG, Disk, Tagging                                            | Infrastructure Owner, Cloud Architect | ✅ Complete |
| [contracts/runtime-contract.md](./contracts/runtime-contract.md)                         | n8n Single-Main Betriebsmodus, Container Sollbild, Exposure Rules, Pflicht-Config                      | Platform Owner, DevOps, Ops Lead      | ✅ Complete |
| [contracts/workflow-validation-contract.md](./contracts/workflow-validation-contract.md) | DNS Target State, HTTPS Acceptance Gate, URL Consistency, Port Exposure, Rollback Path                 | Network Owner, Security, DNS Admin    | ✅ Complete |

---

### 📋 **Ebene C — Execution (Was genau tue ich jetzt?)**

| Datei                                                           | Zweck                                                                                              | Audience                   | Status                  |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------- |
| **[ACCEPTANCE_GATE_MATRIX.md](./ACCEPTANCE_GATE_MATRIX.md)** ⭐ | 14 Gate-Punkte mit Templates: Sollzustand, Nachweis-Befehle, Evidenz-Form, Go/No-Go-Decision       | Operators, QA, Acceptance  | ✅ Complete, ausfüllbar |
| [quickstart.md](./quickstart.md)                                | Operatives Übergabepaket: 9 Schritte für Operatoren, Evidenzanforderung, Fallback-Pfad, Eskalation | Operators, DevOps, On-Call | ✅ Complete             |
| [tasks.md](./tasks.md)                                          | Legacy Task-Verzeichnis (→ siehe IMPLEMENTATION_MASTER_SPEC.md für aktuelle Tasks)                 | Historical Reference       | ✅ Archive              |

---

### 🎯 **Phase 0 — Pre-Kickoff Documents (Rollen & Checklisten)**

| Datei                                                              | Zweck                                                                               | Audience                    | Status                  |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | --------------------------- | ----------------------- |
| **[QUICK_CHECKLIST_PRE_EPIC1.md](./QUICK_CHECKLIST_PRE_EPIC1.md)** | Was ist zu tun vor EPIC 1? Blockers, Rollen-Readiness, Grant/Billing, Subscriptions | All Owners, Project Manager | ✅ Complete             |
| **[ROLES_OWNERS_TEMPLATE.md](./ROLES_OWNERS_TEMPLATE.md)**         | Ownership Matrix: 7 Primary Owners + Backups, Escalation, Communication, Sign-Off   | All Owners, HR, Finance     | ✅ Complete, ausfüllbar |
| **[INDEX.md](./INDEX.md)** (this file)                             | Navigation Guide: Wo ist welches Dokument?                                          | Everyone                    | ✅ Complete             |

---

### 🚀 **Sonder-Dokumente (werden später erzeugt)**

| Datei                               | Zweck                                               | Audience                                | Status                     |
| ----------------------------------- | --------------------------------------------------- | --------------------------------------- | -------------------------- |
| **GOVERNANCE_CHECK_REPORT.md**      | Automatisierter Governance-Konsistenz-Check         | Tech Lead, Reviewer                     | ⏳ Pending (nach EPIC 1)   |
| **GO_LIVE_SIGNOFF.md**              | Go/No-Go Decision Template mit Unterschriften       | Exec Sponsor, Operations Lead, Security | ⏳ Pending (nach EPIC 5)   |
| **INCIDENT_POSTMORTEM_TEMPLATE.md** | Vorlage für Incident Response & Postmortem Analysis | Ops Lead, Team                          | ⏳ Pending (For reference) |

---

## 🔍 Dokument-Abhängigkeiten

```
ROLES_OWNERS_TEMPLATE.md ← Ausfüllen zuerst
         ↓
QUICK_CHECKLIST_PRE_EPIC1.md ← Phase 0 durcharbeiten
         ↓
README.md ← Einstiegspunkt verstehen
         ↓
spec.md + plan.md ← Governance verstehen
         ↓
IMPLEMENTATION_MASTER_SPEC.md ← Technische Details
         ↓
ACCEPTANCE_GATE_MATRIX.md ← Gates füllen während Execution
         ↓
quickstart.md ← Operativ umsetzen
```

---

## 🎯 Dokumente nach Phase

### **Phase 0 — Pre-Kickoff (Woche 1)**

- ROLES_OWNERS_TEMPLATE.md (ausfüllen)
- QUICK_CHECKLIST_PRE_EPIC1.md (durcharbeiten)
- README.md (lesen)

### **Phase 1 — Azure Foundation (EPIC 1, ~2–3 Wochen)**

- IMPLEMENTATION_MASTER_SPEC.md → EPIC 1 section
- ACCEPTANCE_GATE_MATRIX.md → Gates 1.1–1.5 füllen
- contracts/deployment-contract.md (Referenz)

### **Phase 2 — VM Runtime (EPIC 2, ~1–2 Wochen)**

- IMPLEMENTATION_MASTER_SPEC.md → EPIC 2 section
- ACCEPTANCE_GATE_MATRIX.md → Gates 2.1–2.4 füllen
- contracts/deployment-contract.md (SSH, Firewall)

### **Phase 3 — n8n Runtime (EPIC 3, ~1–2 Wochen)**

- IMPLEMENTATION_MASTER_SPEC.md → EPIC 3 section
- ACCEPTANCE_GATE_MATRIX.md → Gates 3.1–3.2 füllen
- contracts/runtime-contract.md (n8n Config)
- quickstart.md (operative Checkliste)

### **Phase 4 — Persistence (EPIC 4, ~1 Woche)**

- IMPLEMENTATION_MASTER_SPEC.md → EPIC 4 section
- ACCEPTANCE_GATE_MATRIX.md → Gate 4.3 (Backup/Restore) füllen
- contracts/runtime-contract.md (Backup Policy)

### **Phase 5 — Acceptance (EPIC 5, ~1 Woche)**

- IMPLEMENTATION_MASTER_SPEC.md → EPIC 5 section
- ACCEPTANCE_GATE_MATRIX.md → Gates 4.1–4.4 + Go/No-Go Decision füllen
- contracts/workflow-validation-contract.md (HTTPS, DNS)

---

## 📊 Statistik

| Metrik                      | Wert            |
| --------------------------- | --------------- |
| **Gesamt-Dokumente**        | 14              |
| **Gesamt-Zeilen Code/Doku** | ~10.000         |
| **Ebene A (Governance)**    | 4 Dateien       |
| **Ebene B (Technical)**     | 4 Dateien       |
| **Ebene C (Execution)**     | 2 Dateien       |
| **Operative Vorlagen**      | 3 Dateien       |
| **Sonder-Dokumente**        | 1 Datei (INDEX) |
| **EPICs**                   | 5               |
| **Tasks (Atomic)**          | 25              |
| **Gates (Acceptance)**      | 14              |

---

## 🔗 Schnelle Links (Kopieren & Einfügen)

```markdown
Governance Layer:

- [spec.md](./spec.md)
- [plan.md](./plan.md)
- [data-model.md](./data-model.md)
- [research.md](./research.md)

Technical Layer:

- [IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md)
- [contracts/deployment-contract.md](./contracts/deployment-contract.md)
- [contracts/runtime-contract.md](./contracts/runtime-contract.md)
- [contracts/workflow-validation-contract.md](./contracts/workflow-validation-contract.md)

Execution Layer:

- [ACCEPTANCE_GATE_MATRIX.md](./ACCEPTANCE_GATE_MATRIX.md)
- [quickstart.md](./quickstart.md)

Pre-Kickoff:

- [QUICK_CHECKLIST_PRE_EPIC1.md](./QUICK_CHECKLIST_PRE_EPIC1.md)
- [ROLES_OWNERS_TEMPLATE.md](./ROLES_OWNERS_TEMPLATE.md)

Navigation:

- [README.md](./README.md)
- [INDEX.md](./INDEX.md) ← You are here
```

---

## 🆘 Ich weiß nicht, welches Dokument ich lesen sollte...

### **Mein Problem ist**: "Grant ist unklar"

→ Lese: [QUICK_CHECKLIST_PRE_EPIC1.md](./QUICK_CHECKLIST_PRE_EPIC1.md) → "Grant & Billing Verification"

### **Mein Problem ist**: "Wie starte ich EPIC 1?"

→ Lese: [IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md) → "EPIC 1 — Azure Foundation"

### **Mein Problem ist**: "Wie verifiziere ich, dass EPIC 1 fertig ist?"

→ Lese: [ACCEPTANCE_GATE_MATRIX.md](./ACCEPTANCE_GATE_MATRIX.md) → "Gates 1.1–1.5"

### **Mein Problem ist**: "Was soll ich täglich tun?"

→ Lese: [quickstart.md](./quickstart.md) → "Schrittfolge für Operatoren"

### **Mein Problem ist**: "Wer ist dafür verantwortlich?"

→ Lese: [ROLES_OWNERS_TEMPLATE.md](./ROLES_OWNERS_TEMPLATE.md) → Deine Rolle

### **Mein Problem ist**: "Warum wurde diese Architektur entschieden?"

→ Lese: [research.md](./research.md) → "Entscheidungsweiche"

### **Mein Problem ist**: "Gibt es Sicherheits-Anforderungen?"

→ Lese: [contracts/runtime-contract.md](./contracts/runtime-contract.md) → "Security-Haertung"

---

## ✅ Verifikation

**Alle 14 Dokumente vorhanden**:

- [x] spec.md
- [x] plan.md
- [x] data-model.md
- [x] research.md
- [x] IMPLEMENTATION_MASTER_SPEC.md
- [x] contracts/deployment-contract.md
- [x] contracts/runtime-contract.md
- [x] contracts/workflow-validation-contract.md
- [x] ACCEPTANCE_GATE_MATRIX.md
- [x] quickstart.md
- [x] tasks.md (archive)
- [x] QUICK_CHECKLIST_PRE_EPIC1.md
- [x] ROLES_OWNERS_TEMPLATE.md
- [x] INDEX.md (this file)

---

**Index-Version**: 1.0
**Erstellt**: 2026-05-18
**Nächste Aktualisierung**: Nach EPIC 1 Abschluss
