# 📚 Documentation Hygiene Report – README+ v2.0.0

> **Generated**: 2025-10-10 22:45:00 UTC  
> **Tool**: PowerShell docs-hygiene.ps1 v2.0.0  
> **Scope**: Vollständige Inventarisierung, Duplikats-Erkennung, Front-Matter-Analyse, Qualitäts-Gates

---

## 🎯 Executive Summary

- **Gesamt Dokumente**: 31 Dateien (30 `.md`, 1 `.ipynb`)
- **Mit Front-Matter**: 3 (10%) ❌
- **Ohne Front-Matter**: 27 (90%) → **KRITISCH**
- **Exakte Duplikate (Hash)**: 3 → **Löschen empfohlen**
- **Namens-Duplikate**: 23 READMEs → **Konsolidierung nötig**
- **Empfohlene Aussortierungen**: 9 Drupal Core Test-Fixtures

---

## 📊 Telemetrie & Metriken

### Front-Matter Coverage

| Status               | Anzahl | Prozent  | Bewertung           |
| -------------------- | ------ | -------- | ------------------- |
| ✅ Mit Front-Matter  | 3      | 10%      | ❌ Ungenügend       |
| ❌ Ohne Front-Matter | 27     | 90%      | ❌ Kritisch         |
| **ZIEL**             | **31** | **100%** | **✅ Erforderlich** |

**Gap**: **-27 Dateien** benötigen Front-Matter-Ergänzung!

### Kategorie-Verteilung

| Kategorie           | Anzahl | Anteil | Hinweis                                     |
| ------------------- | ------ | ------ | ------------------------------------------- |
| `uncategorized`     | 13     | 42%    | 🚨 Höchste Priorität                        |
| `crm` (Drupal Core) | 11     | 36%    | ⚠️ Meiste sind Test-Fixtures (ausschließen) |
| `automation`        | 3      | 10%    | ✅ Gut strukturiert                         |
| `frontend`          | 2      | 6%     | ⚠️ 1 Duplikat gefunden                      |
| `api`               | 1      | 3%     | ✅ OK                                       |

**Empfehlung**: Uncategorized Dateien in thematische docs/-Unterordner verschieben (siehe MOVES.csv).

### Größenverteilung (Top 10)

| Datei                                           | Größe    | Kategorie     | Letzte Änderung |
| ----------------------------------------------- | -------- | ------------- | --------------- |
| `DOCS-INDEX.md`                                 | 21.41 KB | uncategorized | 2025-10-10      |
| `DOCS_REPORT.md`                                | 18.05 KB | uncategorized | 2025-10-10      |
| `README.md` (root)                              | 14.36 KB | root          | 2025-10-10      |
| `docs/QUALITY_GATE_SUMMARY.md`                  | 11.83 KB | governance    | 2025-10-10      |
| `automation/elk-stack/.../README.md`            | 11.00 KB | automation    | 2025-10-09      |
| `crm.../modules/custom/pii_sanitizer/README.md` | 8.96 KB  | crm           | 2025-10-09      |
| `automation/README.md`                          | 8.98 KB  | automation    | 2025-10-10      |
| `frontend/README.md`                            | 8.76 KB  | frontend      | 2025-10-10      |
| `frontend/1760122668294-README.md`              | 8.76 KB  | frontend      | 2025-10-10      |
| `crm.../README.md`                              | 8.67 KB  | crm           | 2025-10-10      |

**Findings**:

- Root `README.md` (14.36 KB) **enthält Korruption** (gitleaks-Output in Zeilen ~200-250) → **Fix erforderlich**
- `frontend/1760122668294-README.md` ist **exaktes Duplikat** → **Löschen**

---

## 🔍 Duplikats-Analyse

### Hash-Duplikate (Exakte Kopien)

| Original                                      | Duplikat                                | Aktion                              | Begründung                          |
| --------------------------------------------- | --------------------------------------- | ----------------------------------- | ----------------------------------- |
| `frontend/1760122668294-README.md`            | `frontend/README.md`                    | ❌ Lösche `1760122668294-README.md` | Identischer SHA256-Hash, alt-Backup |
| `crm.../fixtures/.../sites/default/README.md` | `crm.../fixtures/.../docroot/README.md` | ⚠️ Exclude from docs                | Drupal Core Test-Fixtures           |
| `crm.../fixtures/.../sites/default/README.md` | `crm.../fixtures/.../assets/README.md`  | ⚠️ Exclude from docs                | Drupal Core Test-Fixtures           |

### Namens-Duplikate (23× README.md)

**Problem**: 23 verschiedene Dateien mit gleichem Namen `README.md` im Repository.

**Auswirkung**:

- Erschwert Navigation
- Unklare Kontext-Zuordnung
- Suchmaschinen-Konfusion

**Lösung**:

1. **Root-Level behalten**: `/README.md`, `/DOCS-INDEX.md` (zentrale Doku)
2. **Service-READMEs behalten**: `/api.*/README.md`, `/crm.*/README.md`, `/frontend/README.md`, `/web/README.md`, `/automation/README.md`
3. **Drupal Core ausschließen**: Alle `/crm.*/web/core/**` READMEs via `.gitignore` pattern
4. **Spezifische READMEs umbenennen** (optional):
   - `docs/archive/README.md` → `docs/archive/INDEX.md` (weniger Konfusion)
   - `mcp-servers/README.md` → `mcp-servers/MCP-SERVER-SETUP.md` (aussagekräftiger)

---

## 📋 Empfohlene Aktionen

### 1. Front-Matter ergänzen (27 Dateien)

**Skript**: `scripts/add-frontmatter.ps1` (neu zu erstellen)

**Template**:

```yaml
---
title: [Auto-generiert aus Dateiname/erster H1]
description: [Auto-generiert aus erstem Absatz oder Prompt]
lastUpdated: 2025-10-10
status: ACTIVE
category: [automation|api|crm|frontend|compliance|development|...]
tags: [readme, documentation, setup]
version: 1.0.0
language: de-AT
audience: [Developers, DevOps Team, End Users]
---
```

**Priorität**:

1. **HOCH**: Root README.md, service READMEs (api/crm/frontend/web/automation)
2. **MITTEL**: docs/archive, tests/, deployment-scripts/, mcp-servers/
3. **NIEDRIG**: Dateien in `.github/` (bereits viele optimiert)

### 2. Duplikate löschen (1 Datei)

```bash
rm frontend/1760122668294-README.md
git commit -m "docs: remove duplicate frontend README (identical hash to canonical)"
```

### 3. Drupal Core Docs ausschließen (9 Dateien)

**Methode 1**: `.gitignore` ergänzen (verhindert Tracking, aber nicht Analyse)

```gitignore
# Drupal Core Test Fixtures
crm.menschlichkeit-oesterreich.at/web/core/tests/**/README.md
crm.menschlichkeit-oesterreich.at/web/core/themes/**/README.md
```

**Methode 2**: PowerShell Exclusion-Pattern (nur Dokumentations-Scans)

```powershell
$Config.ExcludePaths += "crm.*/web/core/tests", "crm.*/web/core/themes"
```

### 4. Uncategorized Dateien re-organisieren

**Vorschlag** (siehe MOVES.csv):

- `DOCS-INDEX.md` → bleibt (zentrale Navigation)
- `DOCS_REPORT.md` → `quality-reports/DOCS_REPORT_FINAL.md`
- `SESSION_SUMMARY_2025-01-10.md` → `docs/sessions/2025-01-10-summary.md`
- `STATUS_UPDATE_2025-01-10_POWERSHELL.md` → `docs/sessions/2025-01-10-powershell-setup.md`

### 5. Root README.md Korruption beheben

**Problem**: Zeilen ~200-250 enthalten gitleaks Security Scan Output

```
Finding: aws_secret="AKIAIMNOJVGFDXXXE4OA"
RuleID: aws-access-token
Secret AKIAIMNOJVGFDXXXE4OA
Entropy: 3.65
File: checks_test.go
Line: 37
```

**Aktion**:

```powershell
# Manuell oder via Script entfernen
# Siehe: scripts/fix-readme-corruption.ps1
```

---

## 🗂️ MOVES.csv – Umstrukturierung

Siehe: [MOVES.csv](MOVES.csv)

**Highlights**:

- 0 Moves derzeit empfohlen (meiste Dateien bereits an passendem Ort)
- Optional: Session-Dokumente nach `docs/sessions/` verschieben

**Erwartung**: Manuelle Review und Ergänzung durch Team.

---

## 🗑️ TRASHLIST.csv – Aussortierung

Siehe: [TRASHLIST.csv](TRASHLIST.csv)

**Zusammenfassung**:

- **1 DELETE**: `frontend/1760122668294-README.md` (Hash-Duplikat)
- **9 EXCLUDE_FROM_DOCS**: Drupal Core Test-Fixtures (nicht projektspezifisch)

**Umsetzung**:

```bash
# Nach Freigabe:
pwsh scripts/docs-hygiene.ps1 -DryRun:$false -Force
```

---

## ✅ Quality Gates

### Front-Matter Conformity

| Gate            | Status | Wert                | Ziel                                    | Bewertung |
| --------------- | ------ | ------------------- | --------------------------------------- | --------- |
| Coverage        | ❌     | 10%                 | 100%                                    | **FAIL**  |
| Required Fields | ⏳     | N/A (nur 3 Dateien) | title, description, lastUpdated, status | Pending   |

### Link Validation

| Gate           | Status | Wert               | Hinweis                          |
| -------------- | ------ | ------------------ | -------------------------------- |
| Broken Links   | ⚠️     | 0 (nicht getestet) | Vollständiger Scan ausstehend    |
| External Links | ⚠️     | N/A                | Erreichbarkeits-Check ausstehend |

**Empfehlung**: `markdown-link-check` Tool ausführen oder PowerShell-Script erweitern.

### Lint & Spell Check

| Gate             | Status | Wert    | Tool                                     |
| ---------------- | ------ | ------- | ---------------------------------------- |
| Markdown Lint    | ⏳     | Pending | `markdownlint-cli2`                      |
| Spelling (de-AT) | ⏳     | Pending | `cspell` mit Österreichischem Wörterbuch |
| Spelling (en)    | ⏳     | Pending | `cspell`                                 |

**Nächster Schritt**:

```bash
npm install -g markdownlint-cli2 cspell
markdownlint-cli2 "**/*.md" --config .markdownlint.json
cspell "**/*.md" --config cspell.json --language de-AT,en
```

---

## 🔄 Normalisierung (angewendete Regeln)

### Encoding & Line Endings

- ✅ UTF-8 ohne BOM
- ✅ LF (Unix) statt CRLF

### Front-Matter Schema

```yaml
title: string (required)
description: string (required, max 200 chars)
lastUpdated: YYYY-MM-DD (required)
status: ACTIVE|DRAFT|DEPRECATED|ARCHIVED (required)
category: string (required, from predefined list)
tags: array of strings (required, min 1)
version: semver (required)
language: de-AT|en (optional, default: de-AT)
audience: array (optional, from predefined list)
```

### Markdown Konventionen

- Überschriften: ATX-Style (`# Heading`) statt Setext
- Listen: Konsistente Aufzählungszeichen (`-` für unordered, `1.` für ordered)
- Code Blöcke: Sprache explizit angeben (`yaml, `powershell, etc.)
- Zeilenumbruch: Max. 120 Zeichen (soft wrap empfohlen)

### Dateinamen

- Kebab-case: `mein-dokument.md` (statt `Mein Dokument.md`)
- Keine Sonderzeichen außer `-` und `_`
- Englisch bevorzugt, Deutsch erlaubt wenn thematisch sinnvoll

---

## 📈 Fortschritt & Metriken

### Before/After (seit Projektstart)

| Metrik                 | Vor Optimierung  | Nach Optimierung      | Verbesserung |
| ---------------------- | ---------------- | --------------------- | ------------ |
| Front-Matter Coverage  | 5% (20/435)      | 23% (98/435)          | **+18%**     |
| DEPRECATED Dateien     | 79               | 0                     | **-79** ✅   |
| Prompt Optimierung     | 0 standardisiert | 75 standardisiert     | **+75**      |
| PowerShell Integration | ❌               | ✅ (v7.5.3)           | **NEU**      |
| Duplikats-Erkennung    | ❌               | ✅ (3 Hash, 23 Namen) | **NEU**      |

### Aktueller Status (2025-10-10)

| Phase            | Status | Fortschritt              | Nächster Schritt              |
| ---------------- | ------ | ------------------------ | ----------------------------- |
| 1. Discovery     | ✅     | 100%                     | -                             |
| 2. Assessment    | ✅     | 100%                     | -                             |
| 3. Normalization | ⏳     | 10% (3/31 Front-Matter)  | Front-Matter Script ausführen |
| 4. Synthesis     | ✅     | 100%                     | README.md Korruption fixen    |
| 5. Restructuring | ⏳     | 0% (MOVES.csv leer)      | Team-Review für Moves         |
| 6. Cleanup       | ⏳     | 50% (TRASHLIST erstellt) | Freigabe + Löschen            |
| 7. Quality Gates | ⏳     | 25%                      | Link-Check + Lint + Spell     |
| 8. Reports       | ✅     | 100%                     | -                             |

---

## 🎯 Offene TODOs & Follow-Ups

### Kritisch (sofort)

- [ ] **README.md Korruption beheben** (gitleaks Output in Zeilen 200-250 entfernen)
- [ ] **Frontend Duplikat löschen** (`frontend/1760122668294-README.md`)
- [ ] **Front-Matter für 27 Dateien ergänzen** (Script: `scripts/add-frontmatter.ps1`)

### Hoch (diese Woche)

- [ ] **Link Validation** durchführen (`markdown-link-check` oder PowerShell)
- [ ] **Markdown Lint** ausführen (`markdownlint-cli2`)
- [ ] **Spell Check** de-AT + en (`cspell` mit Wörterbüchern)
- [ ] **MOVES.csv** finalisieren (Team-Review für Umstrukturierung)
- [ ] **Drupal Core Exclusion** in `.gitignore` + PowerShell Config

### Mittel (nächste 2 Wochen)

- [ ] **docs/INDEX.md** als umfassende Sitemap erstellen
- [ ] **CONTRIBUTING.md** erweitern (Branch-Strategy, Commit-Konvention, PR-Prozess)
- [ ] **SECURITY.md** finalisieren (Vulnerability Reporting)
- [ ] **Service READMEs** standardisieren (api/crm/frontend/web/automation)
- [ ] **Design System Dokumentation** (figma-design-system/FIGMA-README.md)

### Niedrig (Backlog)

- [ ] **Session-Dokumente** nach `docs/sessions/` verschieben
- [ ] **Quality Gate Summary** automatisieren (CI/CD Integration)
- [ ] **SBOM** (Software Bill of Materials) aktualisieren
- [ ] **Dokumentations-Versionierung** (Changelog für Doku-Änderungen)

---

## 🛠️ Tools & Scripts

### PowerShell Scripts (NEU!)

| Script                      | Zweck                               | Status         |
| --------------------------- | ----------------------------------- | -------------- |
| `docs-hygiene.ps1`          | Vollständige Dokumentations-Hygiene | ✅ Operational |
| `find-duplicates.ps1`       | Hash- und Namens-Duplikate          | ✅ Operational |
| `add-frontmatter.ps1`       | Batch Front-Matter Addition         | ⏳ TODO        |
| `fix-readme-corruption.ps1` | README.md Korruption beheben        | ⏳ TODO        |

### Python Scripts (bestehend)

| Script                                | Zweck                             | Status       |
| ------------------------------------- | --------------------------------- | ------------ |
| `scripts/remove-deprecated-status.py` | DEPRECATED Status entfernen       | ✅ Completed |
| `scripts/optimize-prompts.py`         | Prompts optimieren + Front-Matter | ✅ Completed |

### npm Scripts

```bash
npm run quality:gates       # Alle Quality Gates
npm run lint:md             # Markdown Lint
npm run spell:check         # Spell Check
npm run docs:validate       # Link Validation
```

---

## 📚 Referenzen

- **README+ v2.0.0 Spec**: [.github/instructions/readme-plus-spec.md](.github/instructions/readme-plus-spec.md)
- **Copilot Instructions**: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- **Quality Gates**: [docs/QUALITY_GATE_SUMMARY.md](docs/QUALITY_GATE_SUMMARY.md)
- **Architecture**: [DOCS-INDEX.md](DOCS-INDEX.md)

---

## 👥 Approval & Sign-Off

**Review Required**: Team Lead / Documentation Owner

**Approval Workflow**:

1. Review TRASHLIST.csv → Approve/Reject Deletions
2. Review MOVES.csv → Approve/Reject Reorganizations
3. Execute: `pwsh scripts/docs-hygiene.ps1 -DryRun:$false -Force`

**Sign-Off**:

- [ ] Approved by: ******\_\_\_****** (Date: **\_\_\_**)
- [ ] Executed by: ******\_\_\_****** (Date: **\_\_\_**)

---

<div align="center">
  <strong>Generated with PowerShell 7.5.3 🚀</strong><br />
  <sub>README+ & Docs-Hygiene v2.0.0 – Menschlichkeit Österreich</sub>
</div>
