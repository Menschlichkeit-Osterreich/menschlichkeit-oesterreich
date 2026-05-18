# Azure n8n Abnahmevorbereitung — Spec & Implementation Guide

**Status**: Specification Complete ✅ | Implementation Pending ⏳  
**Gültig ab**: 2026-05-18
**Zielplattform**: Azure VM (Ubuntu 22.04 LTS) + Docker Compose + n8n + PostgreSQL

**Autoritativer Statushinweis**: Dieses Verzeichnis dokumentiert Spec- und Handoff-Reife. Es ist kein Nachweis für produktiven Betrieb, DNS-Umschaltung, HTTPS-Abnahme oder Backup-Restore im Live-System.

---

## 🎯 Worum geht es?

Dieses Projekt dokumentiert den **vollständigen, evidenzgetriebenen Pfad** zur Inbetriebnahme von n8n auf Azure mit automatisierter Governance, technischen Spezifikationen und atomaren Execution-Tasks — **ohne implizite Annahmen**.

**Besonderheiten**:

- ✅ Dreischichtige Architektur: Governance (stabil) → Technical (detailliert) → Execution (atomar)
- ✅ Blocker-Matrix: Provisioning vs. Go-Live
- ✅ Ausfüllbares Nachweislogbuch (ACCEPTANCE_GATE_MATRIX.md)
- ✅ 25 atomare Tasks mit Definition of Done
- ✅ Go/No-Go-Entscheidungs-Vorlage
- ✅ Explizite Rollback-Strategien pro EPIC

---

## 📚 Dokumentation navigieren

### 🔴 START HIER: Was ich wissen muss, bevor ich anfange

1. **[QUICK_CHECKLIST_PRE_EPIC1.md](./QUICK_CHECKLIST_PRE_EPIC1.md)** — Was ist zu tun, bevor T1.1 startet?
2. **[ROLES_OWNERS_TEMPLATE.md](./ROLES_OWNERS_TEMPLATE.md)** — Wer macht was? (auszufüllen)

### 📖 Ebene A — Governance Spec (Was ist Sollzustand?)

| Datei                            | Zweck                                                                | Für wen                       |
| -------------------------------- | -------------------------------------------------------------------- | ----------------------------- |
| [spec.md](./spec.md)             | Feature-Spezifikation: Ziel, Scope, User Stories, Akzeptanzkriterien | Architekten, Product Owner    |
| [plan.md](./plan.md)             | Phasenplan, Architektur-Kontext, Deliverables                        | Projektmanager, Tech Lead     |
| [data-model.md](./data-model.md) | Abnahmeobjekte, Evidenztypen, Blockerregeln                          | QA, Acceptance Manager        |
| [research.md](./research.md)     | Entscheidungsweiche mit Rationales                                   | Entscheidungsträger, Reviewer |

### 🔧 Ebene B+C — Technical Implementation (Wie mache ich es?)

| Datei                                                                                    | Zweck                                                                | Für wen                |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------- |
| **[IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md)** ⭐                  | Kanonische technische Spezifikation: 5 EPICs, 25 Tasks, alle Befehle | Engineers, Operators   |
| [contracts/deployment-contract.md](./contracts/deployment-contract.md)                   | Azure Infrastruktur-Vertrag                                          | DevOps, Infrastructure |
| [contracts/runtime-contract.md](./contracts/runtime-contract.md)                         | n8n Single-Main Betriebsmodus                                        | Platform Owner, Ops    |
| [contracts/workflow-validation-contract.md](./contracts/workflow-validation-contract.md) | HTTPS, DNS, Exposure Acceptance                                      | Network, Security      |

### 📋 Operatives Nachweislogbuch (Wie track ich Fortschritt?)

| Datei                                                           | Zweck                                                                           | Status                            |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------- |
| **[ACCEPTANCE_GATE_MATRIX.md](./ACCEPTANCE_GATE_MATRIX.md)** ⭐ | 14 Gate-Punkte + Evidenz-Templates + Go/No-Go-Entscheidung                      | Ausfüllbar, täglich aktualisieren |
| [tasks.md](./tasks.md)                                          | Legacy Task-Referenz (→ siehe IMPLEMENTATION_MASTER_SPEC.md für aktuelle Tasks) | Historisch                        |
| [quickstart.md](./quickstart.md)                                | Operatives Übergabepaket für Operator                                           | Schritt-für-Schritt               |

---

## 🚀 Wie starte ich EPIC 1?

### Phase 0 — Pre-Kickoff (diese Woche)

```
1. Rollen aus ROLES_OWNERS_TEMPLATE.md bestimmen
2. Pre-EPIC-1-Checklist durcharbeiten (QUICK_CHECKLIST_PRE_EPIC1.md)
3. Grant-/Billing-Status verifizieren (Gate 1.1)
4. Azure Subscription aktivieren (Gate 1.2)
```

### Phase 1 — Azure Foundation (T1.1–T1.6, ~2–3 Wochen)

```
T1.1 Subscription verifizieren     → Gate 1.2 ✓
T1.2 Billing aktivieren             → Gate 1.1 ✓
T1.3 Resource Group anlegen         → Gate 1.3 ✓
T1.4 Public IP reservieren          → Gate 1.4 ✓
T1.5 NSG erstellen                  → Gate 1.5 ✓
T1.6 SSH-Keypair erzeugen           → Keine Gate (Artifact)
```

**Nachweise täglich in ACCEPTANCE_GATE_MATRIX.md eintragen.**

---

## 📌 Key Concepts

### Blocker-Klassifikation

| Blocker-Klasse         | Effekt                                   | Beispiel            |
| ---------------------- | ---------------------------------------- | ------------------- |
| `provisioning_blocker` | Stopp aller weiteren Infrastruktur-Tasks | Grant-Status unklar |
| `go_live_blocker`      | Stopp Produktiv-Freigabe                 | HTTPS ungültig      |

### Evidenz-Typen

| Typ                 | Quelle                                        | Beleg                                |
| ------------------- | --------------------------------------------- | ------------------------------------ |
| **Primary Source**  | Offizielle Dokumentation, Konfigurationsdatei | `az account show`, Grant-Bestätigung |
| **Live Proof**      | Befehl ausführen, Live-Test                   | `ssh`, `curl`, Port-Scan             |
| **Open Checkpoint** | Ausstehend, aber dokumentiert                 | "Ops-Owner TBD"                      |

### Gate-Status

- ⬜ **Open** — Nicht begonnen
- 🟡 **Pending** — In Arbeit
- ✅ **Pass** — Bestanden
- ❌ **Fail** — Nicht bestanden (Blocker?)

---

## 🔐 Sicherheit & Compliance

- **SSH-only**: Kein Passwort-Login, Public Key Authentication
- **Network**: Nur 22/80/443 offen; 5678/5432/6379 nicht öffentlich
- **Encryption**: `N8N_ENCRYPTION_KEY` Pflicht, nicht in .env hartcodiert
- **Backup**: Täglich, mit Restore-Test
- **Audit**: Alle Gate-Nachweise in ACCEPTANCE_GATE_MATRIX.md dokumentiert

---

## 📞 Support & Escalation

**Wenn du nicht weiterkommen...**

| Problem                       | Erste Ansprechperson       | Eskalation                  |
| ----------------------------- | -------------------------- | --------------------------- |
| Grants/Billing blockiert      | Grant Owner                | Finance/Sponsorship Manager |
| Azure-Ressourcen fehlschlagen | Azure Infrastructure Owner | Cloud Architect             |
| n8n startet nicht             | Runtime Owner              | Platform/DevOps Lead        |
| Security-Fragen               | Security Owner             | CISO / Compliance Officer   |

---

## 📈 Erfolgsmessung

**Go-Kriterium**: Alle 14 Gates in ACCEPTANCE_GATE_MATRIX.md = `pass`

**Timeline**:

- **EPIC 1** (Azure Foundation): 2–3 Wochen
- **EPIC 2** (VM Runtime): 1–2 Wochen
- **EPIC 3** (n8n Runtime): 1–2 Wochen
- **EPIC 4** (Persistence): 1 Woche
- **EPIC 5** (Acceptance): 1 Woche

**Total**: ~8–10 Wochen bis Acceptance Readiness

---

## 📝 Versions & Changes

| Version | Datum      | Autor       | Änderung                                      |
| ------- | ---------- | ----------- | --------------------------------------------- |
| 1.0     | 2026-05-18 | AI Dev Team | Initial: Governance + Technical Spec Complete |

---

## 🔗 Schnelle Links

- 📋 [Rollen-Matrix](./ROLES_OWNERS_TEMPLATE.md)
- ✅ [Pre-EPIC-1-Checklist](./QUICK_CHECKLIST_PRE_EPIC1.md)
- ⭐ [IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md)
- 📊 [ACCEPTANCE_GATE_MATRIX.md](./ACCEPTANCE_GATE_MATRIX.md)
- 🚀 [Quickstart für Operator](./quickstart.md)

---

**Kontakt für Fragen**:
Lead Engineer: [TBD]
Operations Lead: [TBD]
Security Lead: [TBD]

**Letzte Aktualisierung**: 2026-05-18
