# 📦 Documentation Archive

> **Historische Dokumentation abgeschlossener Projekte, Migrationen und Setup-Phasen**

Dieses Archiv enthält Dokumentation, die **nicht mehr aktiv benötigt** wird, aber für Referenzzwecke, Audit-Trails und historische Nachvollziehbarkeit aufbewahrt wird.

---

## 📂 Archiv-Struktur

### `branch-management/` – Branch Migration & Cleanup (2025-10-09 bis 2025-10-10)

Dokumentation der Branch-Umstellung von `chore/figma-mcp-make` → `main` als Default Branch.

| Dokument                         | Beschreibung                                     | Abgeschlossen |
| -------------------------------- | ------------------------------------------------ | ------------- |
| `BRANCH-RENAME-TO-MAIN.md`       | Schritt-für-Schritt Anleitung Branch-Umbenennung | 2025-10-10    |
| `BRANCH-CLEANUP-REPORT.md`       | Branch Cleanup Report (alte Branches gelöscht)   | 2025-10-10    |
| `QUICK-BRANCH-CHANGE.md`         | Quick Fix Guide für Branch-Probleme              | 2025-10-10    |
| `BRANCH-UMSTELLUNG-ANLEITUNG.md` | Branch Migration Guide                           | 2025-10-09    |
| `BRANCH-PROTECTION-SETUP.md`     | Branch Protection Setup                          | 2025-10-09    |

**Status**: ✅ Abgeschlossen – Default Branch ist jetzt `main`, alle alten Branches gelöscht

---

### `setup-reports/` – GitHub Secrets & Enterprise Setup (2025-10-09 bis 2025-10-10)

Dokumentation der initialen GitHub Secrets-Konfiguration und Enterprise-Setup-Phase.

| Dokument                             | Beschreibung                        | Abgeschlossen |
| ------------------------------------ | ----------------------------------- | ------------- |
| `ENTERPRISE-SETUP-SUCCESS-REPORT.md` | Enterprise Setup Success Report     | 2025-10-09    |
| `GITHUB-SECRETS-COMPLETE-SETUP.md`   | GitHub Secrets Complete Setup Guide | 2025-10-09    |
| `GITHUB-SECRETS-SETUP.md`            | GitHub Secrets Setup Instructions   | 2025-10-09    |
| `GITHUB-TOKEN-SETUP.md`              | GitHub Token Setup für CI/CD        | 2025-10-09    |
| `PR62-SECURITY-FIXES.md`             | Security Fixes PR #62 Audit Trail   | 2025-10-10    |

**Status**: ✅ Abgeschlossen – Alle Secrets konfiguriert, CI/CD aktiv, PR #65 merged (ersetzt PR #62)

---

### `migration-reports/` – Migrations & Integrations (2025-10-03)

_Aktuell leer – Migration-Reports bleiben in ihren Service-spezifischen Ordnern:_

- **Figma Integration**: `figma-design-system/FIGMA-INTEGRATION-COMPLETE.md`
- **Git LFS Migration**: `quality-reports/GIT-LFS-MIGRATION-REPORT.md`
- **Security Phase 0**: `docs/security/PHASE-0-FINAL-REPORT.md`

**Verwendung**: Wird für zukünftige abgeschlossene Migrationen verwendet.

---

## 🔍 Warum archivieren?

### Vorteile

✅ **Saubere Root-Ebene** – Nur aktive Dokumentation im Hauptverzeichnis  
✅ **Audit Trail** – Vollständige Historie für Compliance & Nachvollziehbarkeit  
✅ **Referenz** – Bei wiederkehrenden Problemen schnell nachlesen  
✅ **Onboarding** – Neue Team-Mitglieder verstehen Historie

### Archivierungs-Kriterien

Dokumentation wird archiviert, wenn:

- ✅ Projekt/Setup **vollständig abgeschlossen** ist
- ✅ Keine **aktiven Referenzen** mehr im Code
- ✅ Ersetzt durch neuere Dokumentation
- ✅ Nur noch **historischer Wert**

---

## 📜 Vollständige Dokumentation

**Aktive Dokumentation**: [DOCS-INDEX.md](../DOCS-INDEX.md)  
**Projekt-README**: [README.md](../../README.md)

---

## 🗂️ Archivierungs-Richtlinien

### Wann archivieren?

1. **Completion Reports**: Nach erfolgreichem Projektabschluss
2. **Setup Guides**: Nach erfolgreicher initialer Konfiguration
3. **Migration Docs**: Nach erfolgreicher Migration
4. **Troubleshooting Guides**: Wenn Problem dauerhaft gelöst/obsolet

### Aufbewahrungsfristen

- **Branch Management**: 1 Jahr (bis 2026-10-10)
- **Setup Reports**: 2 Jahre (für Audits)
- **Migration Reports**: Permanent (Compliance)
- **Security Reports**: Permanent (DSGVO Art. 5 Abs. 2 – Rechenschaftspflicht)

### Löschung

Archivierte Dokumente werden **NICHT gelöscht**, außer:

- Nach Aufbewahrungsfrist UND
- Keine rechtliche/compliance Anforderung UND
- Entscheidung durch Tech Lead

---

## 📞 Fragen?

Bei Fragen zur archivierten Dokumentation:

- **GitHub Issues**: [Documentation Request](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues/new?template=documentation.md)
- **DOCS-INDEX**: [Vollständige Dokumentationsübersicht](../DOCS-INDEX.md)

---

<div align="center">
  <sub>Archiv erstellt: 2025-10-10 | Zuletzt aktualisiert: 2025-10-10</sub>
</div>
