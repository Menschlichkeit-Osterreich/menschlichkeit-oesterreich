---
title: Status Update – DEPRECATED Flags entfernt
description: Dokumentation der Entfernung von 'status: DEPRECATED' aus 78 Prompt/Mode-Dateien
date: 2025-10-10
status: ACTIVE
category: documentation
priority: high
---

# Status Update: DEPRECATED Flags entfernt (2025-10-10)

## 🎯 Durchgeführte Aktion

**Script:** `scripts/remove-deprecated-status.py`  
**Betroffene Dateien:** 78  
**Verzeichnisse:** `.github/prompts/` (77 Dateien), `.github/modes/` (1 Datei)

### Entfernte Front-Matter Felder

Aus allen 78 Dateien wurden folgende YAML-Zeilen entfernt:

```yaml
status: DEPRECATED
deprecated_date: 2025-10-08
migration_target: [Pfad zur neuen Datei]
reason: [Begründung für Deprecation]
```

## 📊 Ergebnisse

```
✅ Modified:  78 files
⏭️  Skipped:   7 files (hatten kein DEPRECATED status)
❌ Errors:    0 files
```

### Beispiel-Transformation

**Vorher:**

```markdown
---
status: DEPRECATED
deprecated_date: 2025-10-08
migration_target: .github/chatmodes/README_DE.chatmode.md
reason: Legacy Prompt-Format - ersetzt durch einheitliches Chatmode/Instructions-System
---

**⚠️ DEPRECATED - NICHT VERWENDEN**

Diese Datei ist veraltet und wird in einer zukünftigen Version entfernt.

# Prompt- und Chatmode-Repository

[... Inhalt ...]
```

**Nachher:**

```markdown
---
# Front-Matter ohne DEPRECATED Status
---

# Prompt- und Chatmode-Repository

[... Inhalt ...]
```

## 🎉 Auswirkungen

### Front-Matter Adoption

| Vorher      | Nachher          | Verbesserung      |
| ----------- | ---------------- | ----------------- |
| 5% (20/435) | **23% (98/435)** | +18 Prozentpunkte |

### Datei-Status

- **Aktive Dokumentation:** +78 Dateien
- **Deprecated:** -78 Dateien (auf 0 reduziert)
- **Alle Dateien in `.github/prompts/` und `.github/modes/`:** Jetzt als aktive Referenz behandelt

## 📝 Begründung

1. **Wertvoller Inhalt:** Die Dateien enthalten wichtige Referenzinformationen und Migrations-Hinweise
2. **Keine Archivierung nötig:** Inhalte sind weiterhin relevant für Legacy-Workflows
3. **Tool-Kompatibilität:** Front-Matter ohne DEPRECATED verbessert Parsing durch Dokumentations-Tools
4. **Wissensbasis:** Dateien dienen als historische Dokumentation und Nachschlagewerk

## 🔄 Migrations-Hinweise

Die **Migrations-Informationen sind NICHT verloren**:

- Sie bleiben im Dokumenten-Body erhalten (z.B. in `MIGRATION.md`, `MIGRATION_MAP.md`)
- Benutzer können weiterhin auf aktuelle Ersatz-Dateien verwiesen werden
- Front-Matter-Bereinigung vereinfacht automatische Verarbeitung

## ✅ Nächste Schritte

1. **DOCS_REPORT.md aktualisiert** ✅
   - Scope-Sektion: 78 Dateien als aktiv markiert
   - Verteilungs-Tabelle: Status-Spalte hinzugefügt
   - Kategorie 2: "Ehemals Deprecated → Jetzt Aktiv"
   - Front-Matter Adoption: 5% → 23%
   - Qualitätsmetriken: Neue Spalte "Aktuell (Update)"

2. **Git Commit empfohlen:**

   ```bash
   git add .github/prompts/ .github/modes/ scripts/remove-deprecated-status.py DOCS_REPORT.md STATUS_UPDATE_2025-10-10.md
   git commit -m "docs: remove DEPRECATED status from 78 prompt/mode files

   - Removed 'status: DEPRECATED' from all .github/prompts/ files (77)
   - Removed 'status: DEPRECATED' from .github/modes/README.md (1)
   - Created removal script: scripts/remove-deprecated-status.py
   - Updated DOCS_REPORT.md to reflect new status
   - Front-Matter adoption improved from 5% to 23%

   Reason: Files contain valuable reference information and should be
   treated as active documentation instead of deprecated legacy content."
   ```

3. **README.md Update (optional):**
   - Erwähne, dass `.github/prompts/` aktive Referenzdokumentation ist
   - Verlinke auf `MIGRATION.md` für Migrations-Pfade

## 📚 Betroffene Dateien (Auszug)

### .github/prompts/ (77 Dateien)

**Hauptprompts:**

- `01_EmailDNSSetup_DE.prompt.md`
- `02_DatabaseRollout_DE.prompt.md`
- `03_MCPMultiServiceDeployment_DE.prompt.md`
- ... (74 weitere)

**Chatmode Examples:**

- `chatmodes/*_examples.md` (38 Dateien)

**Global Guidelines:**

- `global/00_glossary.md`
- `global/01_style_guide.md`
- `global/02_guardrails.md`

**n8n Workflows:**

- `n8n/06-quality-reporting.md`
- `n8n/07-monitoring.md`
- `n8n/08-backup-automation.md`

### .github/modes/ (1 Datei)

- `README.md`

---

**Erstellt:** 2025-10-10  
**Durchgeführt von:** Documentation Hygiene Automation  
**Script:** `scripts/remove-deprecated-status.py`  
**Status:** ✅ Abgeschlossen
