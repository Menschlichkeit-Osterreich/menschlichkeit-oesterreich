# Tasks: Azure-n8n-Produktionspfad bis Abnahmevorbereitung

## ⚠️ WICHTIG: Struktur-Umstellung auf EPIC-basiert

Mit der Erstellung von [IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md) wurde die Task-Struktur umgestellt auf eine **EPIC-basierte atomare Struktur** mit 25 ausführbaren Tasks.

**Neue Struktur**:

```
EPIC 1 — Azure Foundation (T1.1 bis T1.6)
EPIC 2 — VM Runtime (T2.1 bis T2.5)
EPIC 3 — n8n Runtime (T3.1 bis T3.6)
EPIC 4 — Persistence & Recovery (T4.1 bis T4.4)
EPIC 5 — Acceptance (T5.1 bis T5.6)
```

**⭐ Quelle der Wahrheit ist jetzt**: [IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md) — Ebene C (Execution)

**⭐ Operatives Nachweislogbuch**: [ACCEPTANCE_GATE_MATRIX.md](./ACCEPTANCE_GATE_MATRIX.md)

## Diese Datei wird nicht mehr aktiv gepflegt. Siehe Master-Spec für aktuelle Task-Details, Definition of Done und Blockerregeln.

## Plan-Abschnittsreferenzen (Speckit-Mapping)

Diese Referenz mappt die Abschnitte aus `plan.md` explizit auf die Ausfuehrungsartefakte.

- **Summary** -> [IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md)
- **Technical Context** -> [IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md)
- **Constitution Check** -> [spec.md](./spec.md), [plan.md](./plan.md)
- **Phase Plan** -> [IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md)
- **Phase 1 - Wahrheitssystem und Gate-Definition** -> [ACCEPTANCE_GATE_MATRIX.md](./ACCEPTANCE_GATE_MATRIX.md)
- **Phase 2 - Zielarchitektur und Haertungsvertrag** -> [contracts/](./contracts/), [IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md)
- **Phase 3 - Abnahmevorbereitung** -> [quickstart.md](./quickstart.md), [ACCEPTANCE_GATE_MATRIX.md](./ACCEPTANCE_GATE_MATRIX.md)
- **Project Structure** -> [INDEX.md](./INDEX.md), [README.md](./README.md)
- **Deliverables** -> [DELIVERY_READINESS.md](./DELIVERY_READINESS.md)
- **Complexity Tracking** -> [GOVERNANCE_CONSISTENCY_CHECK.md](./GOVERNANCE_CONSISTENCY_CHECK.md)

## EBENE A — Governance Spec Dokumentation ✅

- [x] T001-T003 — Grant/Billing/Evidenztypen definiert
- [x] T004-T007 — Azure-Sollbild + Haertungsvertrag
- [x] T008-T014 — DNS/HTTPS/Backup + Abnahme-Gate

**Status**: Complete → Siehe [spec.md](./spec.md), [plan.md](./plan.md), [contracts/](./contracts/)

---

## EBENE B & C — Implementation Readiness ✅

- [x] IMPLEMENTATION_MASTER_SPEC.md — Kanonische technische Spezifikation (5 EPICs, 25 atomare Tasks)
- [x] ACCEPTANCE_GATE_MATRIX.md — Operatives Nachweislogbuch + Go/No-Go-Template

**Status**: Complete → Siehe [IMPLEMENTATION_MASTER_SPEC.md](./IMPLEMENTATION_MASTER_SPEC.md)

---

## EPIC-Struktur (Nachschlagwerk aus IMPLEMENTATION_MASTER_SPEC.md)

### EPIC 1 — Azure Foundation

- T1.1 Subscription verifizieren
- T1.2 Billing aktivieren
- T1.3 Resource Group anlegen
- T1.4 Statische Public IP reservieren
- T1.5 NSG erstellen
- T1.6 SSH-Keypair erzeugen

### EPIC 2 — VM Runtime

- T2.1 Ubuntu LTS VM deployen
- T2.2 Docker installieren
- T2.3 Docker Compose installieren
- T2.4 UFW konfigurieren
- T2.5 SSH härten

### EPIC 3 — n8n Runtime

- T3.1 Verzeichnisstruktur erzeugen
- T3.2 .env erstellen
- T3.3 PostgreSQL konfigurieren
- T3.4 n8n konfigurieren
- T3.5 Reverse Proxy konfigurieren
- T3.6 HTTPS aktivieren

### EPIC 4 — Persistence & Recovery

- T4.1 Backup-Script schreiben
- T4.2 DB-Dumps testen
- T4.3 Restore-Test durchführen
- T4.4 Snapshot-Strategie dokumentieren

### EPIC 5 — Acceptance

- T5.1 Port-Exposure prüfen
- T5.2 Webhook-Test
- T5.3 Persistence-Test
- T5.4 Restart-Test
- T5.5 TLS-Test
- T5.6 Finale Abnahme-Checklist

---

## Nächste Schritte (außerhalb dieser Datei)

1. **Rollen bestimmen**: Grant-/Billing-, Azure-Infra-, Netzwerk-Owner
2. **EPIC 1 Kickoff**: Foundation-Tasks starten
3. **Gate-Status pflegen**: [ACCEPTANCE_GATE_MATRIX.md](./ACCEPTANCE_GATE_MATRIX.md) täglich füllen
4. **Go/No-Go Decision**: Nach EPIC 5 Completion

---

**Legacy-Dokument-Version**: 1.0
**Archiviert**: 2026-05-18
**Quelle der Wahrheit ist jetzt**: IMPLEMENTATION_MASTER_SPEC.md + ACCEPTANCE_GATE_MATRIX.md
