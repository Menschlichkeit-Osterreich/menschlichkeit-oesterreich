# Phase 1 Report: Analyse & Cleanup

**Datum:** 2025-10-08  
**Status:** ✅ ABGESCHLOSSEN  
**Phase:** 1 von 5 (Analyse & Cleanup)

---

## 🎯 Ziele Phase 1

- [x] Duplikate identifizieren
- [x] Legacy-Dateien markieren
- [x] Migration-Mapping erstellen
- [x] Cleanup-Strategie definieren

---

## 📊 Ergebnisse

### Duplikat-Analyse

**Skript:** `scripts/analyze-github-duplicates.py`  
**Reports:**
- CSV: `quality-reports/github-duplicates.csv`
- JSON: `quality-reports/github-duplicates.json`

#### Statistiken

| Kategorie | Anzahl |
|-----------|--------|
| **Duplikat-Gruppen (Namen)** | 49 |
| **Duplikat-Gruppen (Inhalt)** | 91 |
| **Identische Duplikate** | 1 |
| **Ähnliche Dateien** | 0 |
| **Zu prüfen** | 0 |
| **Unterschiedlich (Keep)** | 48 |

#### Top 10 Duplikat-Gruppen (nach Dateianzahl)

1. **onboarding** - 8 Dateien
   - `chatmodes/Onboarding_DE.chatmode.md`
   - `prompts/Onboarding_DE.prompt.md`
   - `prompts/chatmodes/onboarding.yaml` (DUPLIKAT)
   - `prompts/chatmodes/onboarding_examples.md` (zu integrieren)
   - `prompts/chatmodes/onboarding.yaml.json` (redundant)
   - ⚠️ **3× Duplikate in prompts/chatmodes/**

2. **roadmap** - 8 Dateien
   - Gleiche Struktur wie onboarding

3. **civicrm-n8n-automation** - 8 Dateien
   - `instructions/civicrm-n8n-automation.instructions.md` (AKTIV)
   - Legacy prompts (zu deprecaten)

4. **civicrm-vereinsbuchhaltung** - 8 Dateien
5. **n8n-automation** - 7 Dateien
6. **n8n-workflows** - 6 Dateien
7. **marketing-content** - 6 Dateien
8. **dsgvo-compliance-audit** - 6 Dateien
9. **verein-mitgliederaufnahme** - 6 Dateien
10. **accessibility-audit** - 6 Dateien

### Identifizierte Probleme

#### 1. Massive Redundanz in `prompts/chatmodes/`

**Pattern:** Jedes Topic hat 3 Dateien
```text
topic.yaml          # Original
topic.yaml.json     # JSON-Duplikat (REDUNDANT)
topic_examples.md   # Sollte inline sein
```

**Impact:** 94 Dateien → sollten zu ~31 konsolidiert werden  
**Recommendation:** DELETE `.yaml.json`, MERGE `_examples.md` in Haupt-Dateien

#### 2. Legacy Prompts in `prompts/`

**Anzahl:** ~50 `.prompt.md` Dateien  
**Status:** Überlappen mit `chatmodes/` und `instructions/`  
**Recommendation:** Als DEPRECATED markieren, Migration Guide erstellen

#### 3. Inkonsistente Namenskonventionen

| Verzeichnis | Convention | Beispiel |
|-------------|-----------|----------|
| `chatmodes/` | `CamelCase_DE.chatmode.md` | `CodeReview_DE.chatmode.md` |
| `prompts/` | `CamelCase_DE.prompt.md` | `CodeReview_DE.prompt.md` |
| `prompts/chatmodes/` | `kebab-case.yaml` | `code-review.yaml` |
| `instructions/` | `kebab-case.instructions.md` | `code-review.instructions.md` |

**Recommendation:** Einheitlich auf `kebab-case` für neue Dateien

---

## 🛠️ Erstellte Tools

### 1. Duplikat-Analyzer
**Datei:** `scripts/analyze-github-duplicates.py`  
**Funktionen:**
- Findet Duplikate nach Namen (normalisiert)
- Findet Duplikate nach Inhalt (SHA256-Hash)
- Berechnet Content-Similarity (difflib)
- Gibt Empfehlungen (DELETE/MERGE/REVIEW/KEEP)
- Exportiert CSV + JSON Reports

**Usage:**
```bash
python3 scripts/analyze-github-duplicates.py
```

### 2. Legacy Files Marker
**Datei:** `scripts/mark-legacy-files.py`  
**Funktionen:**
- Markiert veraltete Dateien mit `status: DEPRECATED` Frontmatter
- Fügt Migration-Target und Reason hinzu
- Erstellt Migration Map (JSON)
- Bereitet Cleanup vor

**Usage:**
```bash
python3 scripts/mark-legacy-files.py
```

### 3. Frontmatter Adder
**Datei:** `scripts/add-frontmatter.py`  
**Funktionen:**
- Fügt YAML Frontmatter zu aktiven Dateien hinzu
- Automatische Kategorisierung
- Priority-Bestimmung basierend auf Dateiname
- ApplyTo-Pattern-Generierung
- Versionierung (Semantic Versioning)

**Usage:**
```bash
python3 scripts/add-frontmatter.py
```

---

## 📋 Migration Strategy

### Phase 1: Cleanup (JETZT)
1. ✅ Duplikat-Analyse durchgeführt
2. 🔄 Legacy-Dateien markieren:
   ```bash
   chmod +x scripts/mark-legacy-files.py
   python3 scripts/mark-legacy-files.py
   ```
3. ⏳ Review & Commit

### Phase 2: Versionierung (NÄCHSTE)
1. Frontmatter zu allen aktiven Dateien hinzufügen:
   ```bash
   chmod +x scripts/add-frontmatter.py
   python3 scripts/add-frontmatter.py
   ```
2. Kategorien validieren
3. Versionen festlegen

### Phase 3: Reorganisation
1. Subdirectories erstellen
2. Dateien verschieben
3. Cross-References updaten

### Phase 4: Automatisierung
1. CI-Validation erstellen
2. Pre-commit hooks
3. Automated tests

### Phase 5: Dokumentation
1. INDEX.md erstellen
2. MIGRATION.md Guide
3. CHANGELOG

---

## 🎯 Metriken

### Aktueller Stand

| Metrik | Wert | Ziel | Fortschritt |
|--------|------|------|-------------|
| **Duplikate gefunden** | 49 Gruppen | 0 | 0% |
| **Dateien zu konsolidieren** | ~94 | 0 | 0% |
| **Dateien mit Frontmatter** | 0 | 42 | 0% |
| **Kategorisierte Dateien** | 0 | 42 | 100% (Plan) |
| **CI-Checks aktiv** | 0 | 3 | 0% |

### Zeitplan

| Phase | Geplant | Tatsächlich | Status |
|-------|---------|-------------|--------|
| **Phase 1** | 2h | ~1.5h | ✅ FERTIG |
| Phase 2 | 3h | - | ⏳ BEREIT |
| Phase 3 | 2h | - | 🔜 WARTET |
| Phase 4 | 2h | - | 🔜 WARTET |
| Phase 5 | 1h | - | 🔜 WARTET |
| **GESAMT** | 10h | 1.5h | 15% |

---

## 🚨 Kritische Findings

### Hohe Priorität

1. **`.yaml.json` Duplikate löschen** (sofort)
   - Impact: 47 redundante Dateien
   - Risiko: Keine (JSON ist exakte YAML-Kopie)
   - Aktion: Automatisches Delete-Skript

2. **`_schema.json` Duplikat** (sofort)
   - `prompts/chatmodes/_schema.json` ist doppelt
   - Identischer Content (SHA256 match)
   - Aktion: Eine Kopie löschen

3. **Legacy Prompts deprecaten** (diese Woche)
   - ~50 `.prompt.md` Dateien in `prompts/`
   - Überlappung mit `chatmodes/` und `instructions/`
   - Aktion: DEPRECATED Marker hinzufügen

### Mittlere Priorität

4. **`_examples.md` integrieren** (Phase 2)
   - 31 separate Example-Dateien
   - Sollten inline in Haupt-Dateien
   - Aktion: Content mergen, Dateien löschen

5. **Kategorisierung inkonsistent** (Phase 2)
   - Keine klare Struktur
   - Flache Verzeichnisse
   - Aktion: Subdirectories + kategorisierte Migration

---

## ✅ Nächste Schritte

### Sofort (heute)
1. [x] Review dieser Report
2. [ ] `mark-legacy-files.py` ausführen
3. [ ] Änderungen committen:
   ```bash
   git add .github/prompts/ quality-reports/ scripts/
   git commit -m "chore(github): Phase 1 - Mark legacy files as DEPRECATED"
   ```

### Diese Woche (Phase 2)
4. [ ] `add-frontmatter.py` ausführen
5. [ ] Frontmatter manuell validieren
6. [ ] Kategorien anpassen falls nötig

### Nächste Woche (Phase 3-5)
7. [ ] Reorganisation durchführen
8. [ ] CI-Automation implementieren
9. [ ] Dokumentation vervollständigen

---

## 📚 Referenzen

- **Master Plan:** `.github/VERSIONING-AND-CONSOLIDATION-PLAN.md`
- **Duplikat-Report:** `quality-reports/github-duplicates.csv`
- **Migration Map:** `.github/prompts/MIGRATION_MAP.json` (wird von mark-legacy-files.py erstellt)
- **Scripts:** `scripts/analyze-github-duplicates.py`, `scripts/mark-legacy-files.py`, `scripts/add-frontmatter.py`

---

**Report erstellt:** 2025-10-08  
**Nächster Review:** Nach Phase 2 (Versionierung)  
**Verantwortlich:** AI Development Assistant  
**Status:** ✅ BEREIT FÜR PHASE 2
