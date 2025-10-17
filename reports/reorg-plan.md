# Repository Reorganisations-Plan – Dokumentation & Struktur

**Status:** Draft  
**Erstellt:** 2025-10-17  
**Verantwortlich:** Lead Architect (Peter Schuller)  
**Ziel:** Lückenlose Doku-Neuordnung, Archive-Management, Duplikate-Elimination

---

## Überblick

### Motivation

Das Repository hat organisch gewachsen und zeigt typische Symptome:

1. **🗂️ Root-Pollution:** 84+ Markdown-Dateien im Root (STATUS_UPDATE_*, CODESPACE_*, PR-*-*.md)
2. **📋 Duplikate:** ~94 Dateien in `prompts/chatmodes/` sind Kopien von `.github/chatmodes/`
3. **🏚️ Tote Docs:** Veraltete Implementierungs-Reports ohne Wartung
4. **🔀 Inkonsistente Struktur:** Mix aus `docs/`, `.github/instructions/`, `prompts/`, Root-MDs
5. **❓ Fehlende Versionierung:** Keine einheitlichen Frontmatter-Standards

**Risiken ohne Reorganisation:**
- ❌ Developer-Confusion (Wo ist die richtige Doku?)
- ❌ Veraltete Informationen (Sicherheitsrisiko bei DSGVO/Security-Docs)
- ❌ Wartungsaufwand steigt exponentiell
- ❌ Onboarding-Zeit für neue Contributors verdoppelt

### Scope & Nicht-Scope

✅ **IN SCOPE:**
- Root-Cleanup (84 MDs → strukturierte Verzeichnisse)
- Duplikat-Elimination (`prompts/chatmodes/` → `.github/chatmodes/`)
- Archive-Management (retention, reaktivierung, löschung)
- Einheitliche Frontmatter-Versionierung
- Directory-Struktur-Optimierung

❌ **OUT OF SCOPE:**
- Code-Refactoring (nur Doku)
- Issue-Backlog-Sanierung (separate Phase 5)
- Breaking Changes an APIs/Services
- Deployment-Änderungen

---

## Aktuelle Struktur (IST-Zustand)

### Root-Directory (Auszug – 84 tracked MDs)

```text
ROOT/
├── agents.md                                   [✅ NEU: v2.0.0 – behalten!]
├── CHANGELOG.md                                [✅ Standard – behalten]
├── CODE_OF_CONDUCT.md                          [✅ Standard – behalten]
├── CONTRIBUTING.md                             [✅ Standard – behalten]
├── LICENSE                                     [✅ Standard – behalten]
├── README.md                                   [✅ Haupteinsteig – behalten]
├── SECURITY.md                                 [✅ Standard – behalten]
├── SUPPORT.md                                  [✅ Standard – behalten]
│
├── CODESPACE-*.md (8 Dateien)                  [🗄️ ARCHIV: docs/archive/codespace/]
├── CODEQL-FIX-*.md                             [🗄️ ARCHIV: docs/archive/codeql/]
├── DEVCONTAINER-*.md (2 Dateien)               [🗄️ ARCHIV: docs/archive/devcontainer/]
├── DOCS_REPORT*.md (3 Dateien)                 [🗄️ ARCHIV: docs/archive/analysis/]
├── FIGMA-*.md (3 Dateien)                      [🗄️ ARCHIV: docs/archive/figma/]
├── IMPLEMENTATION-REPORT.md                    [🗄️ ARCHIV: docs/archive/implementation/]
├── MERGE-*.md (2 Dateien)                      [🗄️ ARCHIV: docs/archive/merge/]
├── NEUE-AUFGABEN-2025-10.md                    [📋 REAKTIVIEREN: docs/planning/]
├── PR-*.md (3 Dateien)                         [🗄️ ARCHIV: docs/archive/prs/]
├── PRODUCTION-READINESS-REPORT.json            [🗄️ ARCHIV: quality-reports/archive/]
├── README-*.md (4 Dateien)                     [🗄️ ARCHIV: docs/archive/readme-variants/]
├── RESOLUTION-STEPS.md                         [🗄️ ARCHIV: docs/archive/troubleshooting/]
├── SECURITY-*.md (2 Dateien)                   [🗄️ ARCHIV: docs/archive/security/]
├── SEMGREP-FIX-SUMMARY.md                      [🗄️ ARCHIV: docs/archive/semgrep/]
├── SERVICE-STATUS.md                           [📋 REAKTIVIEREN: docs/operations/]
├── SESSION_SUMMARY_2025-01-10.md               [🗄️ ARCHIV: docs/archive/sessions/]
├── STATUS_UPDATE_*.md (3 Dateien)              [🗄️ ARCHIV: docs/archive/status/]
├── TASK-COMPLETION-*.md (2 Dateien)            [🗄️ ARCHIV: docs/archive/tasks/]
├── TRIVY-FIX-*.md (2 Dateien)                  [🗄️ ARCHIV: docs/archive/trivy/]
│
├── DEVELOPMENT-QUICKSTART.md                   [📋 REAKTIVIEREN: docs/onboarding/]
├── DOCS-INDEX.md                               [📋 REAKTIVIEREN: docs/]
├── FIGMA-MCP-QUICKSTART.md                     [📋 REAKTIVIEREN: docs/integrations/]
├── QUICK-START.md                              [📋 REAKTIVIEREN: docs/onboarding/]
│
├── _clean_deleted-20250929-155819.csv          [🗑️ LÖSCHEN: temporärer Report]
├── build-report.json                           [📊 VERSCHIEBEN: quality-reports/builds/]
├── composer-setup.php                          [🔧 OK: Build-Tool-Setup]
├── docs-inventory.csv                          [📊 VERSCHIEBEN: reports/]
├── git-commit-script.py                        [🔧 VERSCHIEBEN: scripts/git/]
├── MOVES.csv                                   [📊 VERSCHIEBEN: reports/]
├── multi-service-status-*.json                 [📊 VERSCHIEBEN: quality-reports/services/]
├── NORMALIZATION_RULES.yml                     [🔧 VERSCHIEBEN: config-templates/]
├── secrets.manifest.json                       [🔒 OK: Secrets-Metadaten]
├── TRASHLIST.csv                               [🗑️ LÖSCHEN: obsolet]
├── Untitled-1.ipynb                            [🗑️ LÖSCHEN: leeres Notebook]
└── ...

docs/
├── README.md                                   [✅ Index]
├── architecture/                               [✅ ADRs, Diagramme]
├── development/                                [✅ Dev-Guides]
├── operations/                                 [✅ Deployment, Monitoring]
├── security/                                   [✅ Security-Audits, Pentests]
├── infrastructure/                             [✅ Plesk, n8n, Database]
├── integrations/                               [✅ CiviCRM, Figma, MCP]
├── legal/                                      [✅ Vereinsstatuten, DSGVO]
├── onboarding/                                 [✅ Quickstarts, Tutorials]
└── archive/                                    [🗄️ Alte Docs mit ARCHIVE_NOTE.md]

.github/
├── instructions/
│   ├── core/                                   [✅ Universal-Instruktionen]
│   ├── dsgvo-compliance.instructions.md        [✅ Domain-spezifisch]
│   ├── verein-statuten.instructions.md         [✅ Domain-spezifisch]
│   └── ...
├── chatmodes/
│   ├── compliance/                             [✅ DSGVO, A11y, Security]
│   ├── development/                            [✅ Feature, Debugging]
│   ├── general/                                [✅ Performance, Docs]
│   └── operations/                             [✅ Deployment, Rollback]
└── prompts/
    ├── 01_code_review_standardization.md       [✅ Nummerierte Prompts]
    ├── ...
    ├── 146_...md
    └── chatmodes/                              [❌ DUPLIKAT – 94 Dateien LÖSCHEN!]

prompts/                                        [⚠️ DEPRECATED – migriert zu .github/prompts/]
├── *.prompt.md                                 [🗄️ ARCHIV: mit Migration-Hinweis]
└── chatmodes/                                  [❌ DUPLIKAT – 94 Dateien LÖSCHEN!]

reports/                                        [✅ NEU: Governance & Analyse]
├── label-mapping.csv
├── triage-rules.md
├── roadmap.md
├── archive-recovery.md
├── reorg-plan.md (diese Datei)
└── (13 weitere Artifacts geplant)
```

---

## Ziel-Struktur (SOLL-Zustand)

### Prinzipien

1. **📁 Single Source of Truth:** Jede Doku existiert nur einmal
2. **🏷️ Kategorisierung:** Klare Verzeichnis-Taxonomie (docs/, .github/, reports/, scripts/)
3. **📦 Root-Minimalismus:** Max. 15 Dateien im Root (Standards + agents.md)
4. **🗂️ Archive mit Retention:** `docs/archive/` mit ARCHIVE_NOTE.md + Lösch-Datum
5. **🔗 Symlinks wo nötig:** Rückwärtskompatibilität für häufig referenzierte Pfade

### Root (Target: 15 Dateien)

```text
ROOT/
├── agents.md                    [✅ v2.0.0 – Steuerzentrale]
├── CHANGELOG.md                 [✅ Standard]
├── CODE_OF_CONDUCT.md           [✅ Standard]
├── CONTRIBUTING.md              [✅ Standard]
├── LICENSE                      [✅ Standard]
├── README.md                    [✅ Haupteinsteig]
├── SECURITY.md                  [✅ Standard]
├── SUPPORT.md                   [✅ Standard]
├── build-pipeline.sh            [✅ Build-Tool]
├── composer.json                [✅ PHP-Dependencies]
├── docker-compose.yml           [✅ Container-Orchestrierung]
├── package.json                 [✅ Node-Dependencies + Scripts]
├── schema.prisma                [✅ DB-Schema]
├── tailwind.config.js           [✅ Frontend-Config]
└── vitest.config.js             [✅ Test-Runner]
```

### docs/ (Hauptdokumentation)

```text
docs/
├── README.md                               [✅ Index mit TOC]
│
├── architecture/                           [✅ ADRs, Diagramme]
│   ├── adr/
│   │   ├── ADR-001-figma-mcp-integration.md
│   │   └── ...
│   ├── diagrams/
│   │   ├── system-overview.mmd (Mermaid)
│   │   └── ...
│   └── decisions.md                        [✅ Entscheidungs-Log]
│
├── development/                            [✅ Dev-Guides]
│   ├── setup.md                            [✅ Entwicklungsumgebung]
│   ├── testing.md                          [✅ Test-Strategien]
│   ├── code-style.md                       [✅ ESLint, PHPStan]
│   └── workflows.md                        [✅ Git-Workflows]
│
├── operations/                             [✅ Deployment, Monitoring]
│   ├── deployment.md                       [✅ Plesk, Multi-Service]
│   ├── monitoring.md                       [✅ n8n, Logs, Alerts]
│   ├── rollback.md                         [✅ Notfall-Prozeduren]
│   └── service-status.md                   [📋 Reaktiviert aus Root]
│
├── security/                               [✅ Security-Audits, Pentests]
│   ├── audits/
│   │   ├── 2025-10-17-gitleaks.json
│   │   └── ...
│   ├── compliance.md                       [✅ DSGVO, TKG]
│   └── vulnerability-management.md         [✅ Trivy, CVE-Tracking]
│
├── infrastructure/                         [✅ Plesk, n8n, Database]
│   ├── plesk-ssh-setup.md                  [📋 Reaktiviert aus Archive]
│   ├── n8n-workflows.md
│   ├── database-migrations.md
│   └── backup-restore.md
│
├── integrations/                           [✅ CiviCRM, Figma, MCP]
│   ├── civicrm.md
│   ├── figma-mcp.md                        [📋 Reaktiviert (FIGMA-MCP-QUICKSTART.md)]
│   ├── mcp-servers.md
│   └── n8n-automation.md
│
├── legal/                                  [✅ Vereinsstatuten, DSGVO]
│   ├── vereinsstatuten.md
│   ├── dsgvo.md
│   ├── beitragsordnung.md
│   └── impressum.md
│
├── onboarding/                             [✅ Quickstarts, Tutorials]
│   ├── quickstart.md                       [📋 Reaktiviert (QUICK-START.md)]
│   ├── development-quickstart.md           [📋 Reaktiviert (DEVELOPMENT-QUICKSTART.md)]
│   └── contributing-guide.md               [✅ Link zu CONTRIBUTING.md]
│
├── planning/                               [✅ Roadmaps, Backlogs]
│   ├── roadmap-2025-2026.md                [📋 Link zu reports/roadmap.md]
│   └── neue-aufgaben-2025-10.md            [📋 Reaktiviert aus Root]
│
└── archive/                                [🗄️ Alte Docs mit Retention]
    ├── ARCHIVE_NOTE.md                     [✅ Retention-Policy: 2 Jahre, dann löschen]
    ├── codespace/                          [🗄️ 8 Dateien, Retention: 2026-10-17]
    ├── codeql/
    ├── devcontainer/
    ├── figma/
    ├── implementation/
    ├── merge/
    ├── prs/
    ├── readme-variants/
    ├── security/
    ├── semgrep/
    ├── sessions/
    ├── status/
    ├── tasks/
    └── trivy/
```

### .github/ (AI-Instruktionen & Templates)

```text
.github/
├── ISSUE_TEMPLATE/
│   ├── bug_report.yml                      [✅ Standardisiert nach triage-rules.md]
│   ├── feature_request.yml                 [✅ Standardisiert]
│   ├── security_vulnerability.yml          [✅ Standardisiert]
│   └── config.yml                          [✅ Template-Config]
│
├── PULL_REQUEST_TEMPLATE.md                [✅ DoD-Checkliste]
│
├── workflows/                              [✅ CI/CD]
│   ├── deploy-staging.yml
│   ├── enterprise-pipeline.yml
│   └── ...
│
├── instructions/
│   ├── core/                               [✅ Universal]
│   │   ├── code-quality-guidelines.instructions.md
│   │   ├── deployment-procedures.instructions.md
│   │   ├── quality-gates.instructions.md
│   │   ├── security-best-practices.instructions.md
│   │   └── testing-standards.instructions.md
│   │
│   ├── dsgvo-compliance.instructions.md    [✅ Domain-spezifisch]
│   ├── verein-statuten.instructions.md     [✅ Domain-spezifisch]
│   ├── mitgliedsbeitraege.instructions.md  [✅ Domain-spezifisch]
│   ├── copilot.mcp-servers.instructions.md [✅ MCP-Integration]
│   └── codacy.instructions.md              [✅ Code-Quality-Automation]
│
├── chatmodes/
│   ├── compliance/
│   │   ├── dsgvo-audit-workflow.md
│   │   ├── accessibility-wcag-audit.md
│   │   └── security-incident-response.md
│   ├── development/
│   │   ├── feature-development.md
│   │   └── debugging-workflow.md
│   ├── general/
│   │   ├── performance-optimization.md
│   │   └── documentation-update.md
│   └── operations/
│       ├── deployment-workflow.md
│       └── rollback-emergency.md
│
└── prompts/
    ├── INDEX.md                            [✅ Auto-generierte Prompt-Liste]
    ├── 01_code_review_standardization.md
    ├── ...
    └── 146_...md                           [✅ Nummerierte Prompts, keine Duplikate]
```

### prompts/ (DEPRECATED – Migration zu .github/prompts/)

```text
prompts/
├── MIGRATION.md                            [✅ Mapping: Alt → Neu]
├── DEPRECATED_*.prompt.md                  [🗄️ Mit Frontmatter status: DEPRECATED]
└── chatmodes/                              [❌ LÖSCHEN – 94 Duplikat-Dateien!]
```

### reports/ (Governance & Analyse)

```text
reports/
├── file-inventory-tracked.csv              [✅ Git-Tracked-Files]
├── file-inventory-untracked.csv            [✅ Untracked-Files]
├── file-inventory-fs.csv                   [✅ Filesystem-Reconciliation]
├── duplicates.csv                          [✅ SHA-256 Exact + Fuzzy]
├── dead-links.csv                          [✅ Markdown-Links]
├── label-mapping.csv                       [✅ Existing → Target]
├── triage-rules.md                         [✅ Issue-SLA & Workflows]
├── roadmap.md                              [✅ 2025-2026 Milestones]
├── archive-recovery.md                     [✅ Reaktivierungs-Kandidaten]
├── reorg-plan.md                           [✅ Diese Datei]
├── todo-cleanup.md                         [🔄 Geplant]
├── compliance-secrets.md                   [🔄 Geplant]
├── gov-gap-analysis.md                     [🔄 Geplant]
├── issues-inventory.csv                    [🔄 Geplant]
└── issues-duplicates.csv                   [🔄 Geplant]
```

### scripts/ (Utility-Scripts)

```text
scripts/
├── git/
│   └── git-commit-script.py                [📋 Verschoben aus Root]
├── analysis/
│   ├── file-inventory.ps1
│   └── analyze-github-duplicates.py        [🔄 Neu zu erstellen]
├── deployment/
│   └── safe-deploy.sh
└── quality/
    └── log-analyzer.py
```

### quality-reports/ (Test- & Security-Results)

```text
quality-reports/
├── builds/
│   └── build-report.json                   [📋 Verschoben aus Root]
├── services/
│   └── multi-service-status-*.json         [📋 Verschoben aus Root]
├── lighthouse/
├── trivy/
├── codacy/
├── deployment-metrics/
└── archive/
    └── PRODUCTION-READINESS-REPORT.json    [📋 Verschoben aus Root]
```

---

## Aktionsplan (Step-by-Step)

### Phase 1: Vorbereitung (PRE-FLIGHT)

#### 1.1 Duplikat-Analyse

```bash
# Script: scripts/analysis/analyze-github-duplicates.py
# Output: reports/duplicates.csv

# Duplikat-Typen:
# - Exact (SHA-256 Match)
# - Near (Fuzzy Match >90%)
# - Format-Duplikate (.yaml.json + .yaml)
```

**Ergebnis-Erwartung:**
- `prompts/chatmodes/` → 94 Dateien als Duplikate von `.github/chatmodes/` markiert
- Format-Duplikate: `.yaml.json` → `.yaml` (JSON ist redundant)
- Beispiel-Duplikate: `_examples.md` → in Haupt-MD integrieren

#### 1.2 Dead-Link-Analyse

```bash
# Grep alle Markdown-Links: [text](path)
# Prüfe Existenz von path
# Output: reports/dead-links.csv
```

**Erwartete Findings:**
- Alte README-Referenzen auf verschobene Dateien
- Broken Links zu gelöschten CODESPACE-*.md
- Alte ADR-Links

#### 1.3 Archive-Kandidaten festlegen

**Kriterien:**
- ✅ **ARCHIV:** Temporäre Implementierungs-Reports (CODESPACE-*, PR-*, TASK-*)
- ✅ **ARCHIV:** Status-Updates älter als 90 Tage
- ✅ **ARCHIV:** Fix-Summaries (TRIVY-*, SEMGREP-*, CODEQL-*)
- ✅ **REAKTIVIEREN:** Aktive Quickstarts (DEVELOPMENT-QUICKSTART.md)
- ✅ **REAKTIVIEREN:** Service-Status (SERVICE-STATUS.md)
- 🗑️ **LÖSCHEN:** Temporäre CSVs (_clean_deleted-*.csv, TRASHLIST.csv)
- 🗑️ **LÖSCHEN:** Leere Notebooks (Untitled-1.ipynb)

**Output:** `reports/archive-recovery.md` (bereits erstellt, 31 Kandidaten)

---

### Phase 2: Root-Cleanup

#### 2.1 Archivierung (Batch-Move)

```bash
# Erstelle Archive-Directories
mkdir -p docs/archive/{codespace,codeql,devcontainer,figma,implementation,merge,prs,readme-variants,security,semgrep,sessions,status,tasks,trivy}

# Batch-Move mit Git
git mv CODESPACE-*.md docs/archive/codespace/
git mv CODEQL-FIX-*.md docs/archive/codeql/
git mv DEVCONTAINER-*.md docs/archive/devcontainer/
git mv DOCS_REPORT*.md docs/archive/analysis/
git mv FIGMA-*.md docs/archive/figma/
git mv IMPLEMENTATION-REPORT.md docs/archive/implementation/
git mv MERGE-*.md docs/archive/merge/
git mv PR-*.md docs/archive/prs/
git mv README-*.md docs/archive/readme-variants/
git mv RESOLUTION-STEPS.md docs/archive/troubleshooting/
git mv SECURITY-*.md docs/archive/security/
git mv SEMGREP-FIX-SUMMARY.md docs/archive/semgrep/
git mv SESSION_SUMMARY_2025-01-10.md docs/archive/sessions/
git mv STATUS_UPDATE_*.md docs/archive/status/
git mv TASK-COMPLETION-*.md docs/archive/tasks/
git mv TRIVY-FIX-*.md docs/archive/trivy/
```

**ARCHIVE_NOTE.md in jedem Subdir:**

```markdown
# 🗄️ Archiv – [Kategorie]

**Retention-Policy:** Diese Dateien werden 2 Jahre nach Archivierung aufbewahrt, dann gelöscht.

**Archivierungs-Datum:** 2025-10-17  
**Lösch-Datum:** 2027-10-17  

**Grund der Archivierung:**
- Temporäre Implementierungs-Reports (bereits gemerged/abgeschlossen)
- Historischer Kontext (keine aktive Wartung)
- Referenz für Post-Mortems/Audits

**Reaktivierung:**
Falls benötigt: `git mv docs/archive/[kategorie]/[datei] docs/[zieldir]/`
```

#### 2.2 Reaktivierung (Strategische Docs)

```bash
# Aktive Quickstarts
git mv DEVELOPMENT-QUICKSTART.md docs/onboarding/development-quickstart.md
git mv QUICK-START.md docs/onboarding/quickstart.md
git mv FIGMA-MCP-QUICKSTART.md docs/integrations/figma-mcp.md

# Operations
git mv SERVICE-STATUS.md docs/operations/service-status.md

# Planning
git mv NEUE-AUFGABEN-2025-10.md docs/planning/neue-aufgaben-2025-10.md

# Index
git mv DOCS-INDEX.md docs/README.md
```

#### 2.3 Reports & Scripts verschieben

```bash
# Reports
git mv docs-inventory.csv reports/file-inventory-docs.csv
git mv MOVES.csv reports/file-moves-history.csv

# Scripts
mkdir -p scripts/git
git mv git-commit-script.py scripts/git/git-commit-script.py

# Quality Reports
mkdir -p quality-reports/{builds,services,archive}
git mv build-report.json quality-reports/builds/build-report-$(date +%Y%m%d).json
git mv multi-service-status-*.json quality-reports/services/
git mv PRODUCTION-READINESS-REPORT.json quality-reports/archive/
```

#### 2.4 Löschung (Obsolete Dateien)

```bash
# Temporäre/Obsolete Dateien
git rm _clean_deleted-20250929-155819.csv
git rm TRASHLIST.csv
git rm Untitled-1.ipynb

# Optional: Weitere Cleanup-Kandidaten nach Review
```

---

### Phase 3: Duplikat-Elimination

#### 3.1 prompts/chatmodes/ → .github/chatmodes/ (KRITISCH!)

**Problem:** 94 Duplikat-Dateien in `prompts/chatmodes/`

**Analyse-Script:**

```python
# scripts/analysis/analyze-github-duplicates.py
import hashlib
import os

def sha256(file_path):
    with open(file_path, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()

# Compare prompts/chatmodes/* vs .github/chatmodes/*
# Output: reports/duplicates.csv
#   path1,path2,match_type,action
#   prompts/chatmodes/foo.yaml,.github/chatmodes/foo.yaml,exact,DELETE prompts version
```

**Aktion:**

```bash
# Nach Bestätigung dass alle Duplikate:
git rm -r prompts/chatmodes/
```

**Migration-Hinweis erstellen:**

```markdown
# prompts/MIGRATION.md

## ⚠️ prompts/chatmodes/ wurde gelöscht

**Datum:** 2025-10-17

**Grund:** 94 Duplikat-Dateien – identisch zu `.github/chatmodes/`

**Migration:**
Alle Referenzen zu `prompts/chatmodes/*` → `.github/chatmodes/*`

**Mapping (Beispiele):**
- `prompts/chatmodes/code-review.yaml` → `.github/chatmodes/development/code-review.yaml`
- `prompts/chatmodes/deployment.yaml` → `.github/chatmodes/operations/deployment-workflow.md`

**Vollständiges Mapping:** Siehe `reports/duplicates.csv`
```

#### 3.2 Format-Duplikate (.yaml.json → .yaml)

```bash
# Alle .yaml.json löschen (redundant, YAML ist Source of Truth)
find .github/chatmodes -name "*.yaml.json" -delete
find .github/prompts -name "*.yaml.json" -delete
```

#### 3.3 Beispiel-Duplikate (_examples.md → inline)

**Strategie:** Integriere `_examples.md` als `## Examples` Section in Haupt-Datei.

**Beispiel:**

```bash
# Vorher:
# - code-review.yaml
# - code-review_examples.md

# Nachher:
# - code-review.yaml (mit ## Examples Section am Ende)

# Löschen:
git rm .github/chatmodes/*_examples.md
```

---

### Phase 4: Versionierung & Frontmatter

#### 4.1 Frontmatter-Standard definieren

**Template (`config-templates/frontmatter-standard.yml`):**

```yaml
---
title: [Kurztitel]
description: [1-Satz-Beschreibung]
applyTo: '**' | 'frontend/**' | 'api/**' | etc.
priority: critical | high | medium | low
category: core | development | operations | compliance | documentation
status: ACTIVE | DEPRECATED | DRAFT
version: 1.0.0 | 2.0.0 | etc. (SemVer)
created: YYYY-MM-DD
lastUpdated: YYYY-MM-DD
deprecatedBy: [path/to/replacement.md] (nur bei DEPRECATED)
migrationPath: [Hinweis zur Migration] (nur bei DEPRECATED)
---
```

#### 4.2 Batch-Update (Instructions)

**Script:** `scripts/quality/add-frontmatter.py`

**Target:** Alle `.instructions.md` in `.github/instructions/`

**Aktion:**
- Lese bestehenden Frontmatter (falls vorhanden)
- Ergänze fehlende Felder (default: `version: 1.0.0`, `status: ACTIVE`)
- Setze `created` auf Git-First-Commit-Date (via `git log --follow --format=%aI --reverse`)
- Setze `lastUpdated` auf Git-Last-Commit-Date (via `git log -1 --format=%aI`)

**Beispiel-Output:**

```markdown
---
title: DSGVO-Compliance – Datenschutz im Verein
description: DSGVO-Compliance für Menschlichkeit Österreich – Datenschutz gemäß Statuten § 16
applyTo: '**'
priority: critical
category: compliance
status: ACTIVE
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
---

# DSGVO-Compliance – Datenschutz im Verein (Österreich)

[... existing content ...]
```

#### 4.3 Batch-Update (Chatmodes)

**Target:** Alle `.md` in `.github/chatmodes/`

**Aktion:** Gleiches Script, angepasste Defaults:

```yaml
category: [abgeleitet von Subdir: compliance, development, general, operations]
priority: medium (default)
status: ACTIVE
version: 1.0.0
```

#### 4.4 Deprecated-Markierung (Legacy Prompts)

**Target:** Alte Prompts in `prompts/*.prompt.md`

**Aktion:**

```yaml
status: DEPRECATED
deprecatedBy: .github/prompts/[nummer]_[titel].md
migrationPath: Siehe prompts/MIGRATION.md für vollständiges Mapping
```

---

### Phase 5: README & Index-Updates

#### 5.1 Root-README.md aktualisieren

**Neue Sektion hinzufügen:**

```markdown
## 📚 Dokumentation

- **[Hauptdokumentation](docs/README.md)** – Vollständiger Index
- **[Onboarding](docs/onboarding/)** – Quickstarts & Tutorials
- **[Architecture](docs/architecture/)** – ADRs & Entscheidungen
- **[Operations](docs/operations/)** – Deployment & Monitoring
- **[Security](docs/security/)** – Audits & Compliance
- **[Legal](docs/legal/)** – Vereinsstatuten & DSGVO

## 🤖 AI-Agents & Instructions

- **[agents.md](agents.md)** – Zentrale Steuerdatei (v2.0.0)
- **[Instructions](.github/instructions/)** – Core & Domain-Instruktionen
- **[Chatmodes](.github/chatmodes/)** – Kontext-spezifische Workflows
- **[Prompts](.github/prompts/)** – 146 nummerierte Prompts

## 📊 Reports & Governance

- **[reports/](reports/)** – Governance, Analyse, Roadmap
- **[quality-reports/](quality-reports/)** – Test- & Security-Results
```

#### 5.2 docs/README.md erstellen (Haupt-Index)

**Template:**

```markdown
# Dokumentation – Menschlichkeit Österreich

**Letzte Aktualisierung:** 2025-10-17  
**Maintainer:** Tech Lead (Peter Schuller)

---

## 📖 Table of Contents

### 🏗️ Architecture
- [ADRs](architecture/adr/) – Architecture Decision Records
- [Diagramme](architecture/diagrams/) – System-Übersicht (Mermaid)
- [Entscheidungs-Log](architecture/decisions.md)

### 💻 Development
- [Setup](development/setup.md) – Entwicklungsumgebung
- [Testing](development/testing.md) – Unit, Integration, E2E
- [Code-Style](development/code-style.md) – ESLint, PHPStan
- [Git-Workflows](development/workflows.md)

### 🚀 Operations
- [Deployment](operations/deployment.md) – Plesk, Multi-Service
- [Monitoring](operations/monitoring.md) – n8n, Logs, Alerts
- [Rollback](operations/rollback.md) – Notfall-Prozeduren
- [Service-Status](operations/service-status.md) – Live-Status

### 🔒 Security
- [Audits](security/audits/) – Trivy, Gitleaks, Semgrep
- [Compliance](security/compliance.md) – DSGVO, TKG
- [Vulnerability-Management](security/vulnerability-management.md)

### 🏢 Infrastructure
- [Plesk](infrastructure/plesk-ssh-setup.md) – SSH-Tunnel, SFTP
- [n8n](infrastructure/n8n-workflows.md) – Automation-Workflows
- [Database](infrastructure/database-migrations.md) – Alembic, Prisma
- [Backup/Restore](infrastructure/backup-restore.md)

### 🔗 Integrations
- [CiviCRM](integrations/civicrm.md) – Mitgliederverwaltung
- [Figma-MCP](integrations/figma-mcp.md) – Design-Token-Sync
- [MCP-Server](integrations/mcp-servers.md) – GitHub Copilot Extensions
- [n8n-Automation](integrations/n8n-automation.md)

### ⚖️ Legal
- [Vereinsstatuten](legal/vereinsstatuten.md)
- [DSGVO](legal/dsgvo.md) – Datenschutz
- [Beitragsordnung](legal/beitragsordnung.md)
- [Impressum](legal/impressum.md)

### 🎓 Onboarding
- [Quickstart](onboarding/quickstart.md)
- [Development-Quickstart](onboarding/development-quickstart.md)
- [Contributing-Guide](onboarding/contributing-guide.md)

### 📅 Planning
- [Roadmap 2025-2026](planning/roadmap-2025-2026.md)
- [Neue Aufgaben](planning/neue-aufgaben-2025-10.md)

### 🗄️ Archive
- [Archive-Note](archive/ARCHIVE_NOTE.md) – Retention-Policy: 2 Jahre
- [Kategorien](archive/) – codespace, codeql, devcontainer, etc.

---

## 🔍 Suche & Navigation

**Quick Links:**
- [README.md](../README.md) – Root-README
- [agents.md](../agents.md) – AI-Agent-Steuerzentrale
- [CONTRIBUTING.md](../CONTRIBUTING.md) – Contribution-Guidelines
- [CHANGELOG.md](../CHANGELOG.md) – Version History

**Reports & Governance:**
- [reports/](../reports/) – Issue-Triage, Roadmap, Analyse
- [quality-reports/](../quality-reports/) – Test- & Security-Results
```

#### 5.3 .github/prompts/INDEX.md auto-generieren

**Script:** `scripts/quality/generate-prompt-index.py`

**Output:**

```markdown
# Prompt-Index – 146 Nummerierte Prompts

**Auto-Generated:** 2025-10-17  
**Source:** `.github/prompts/*.md`

---

## Quick Reference

| Nr | Titel | Kategorie | Rollen |
|----|-------|-----------|--------|
| 01 | Code Review Standardization | Development | Developer |
| 02 | ... | ... | ... |
| ... | ... | ... | ... |
| 146 | ... | ... | ... |

---

## Nach Kategorie

### Development (20 Prompts)
- [01 Code Review Standardization](01_code_review_standardization.md)
- ...

### Operations (15 Prompts)
- [06 Deployment Automation](06_deployment_automation.md)
- ...

### Security (12 Prompts)
- [11 Security Vulnerability Assessment](11_security_vulnerability_assessment.md)
- ...

### Compliance (8 Prompts)
- [15 DSGVO Compliance Check](15_dsgvo_compliance_check.md)
- ...

---

**Vollständige Liste:** Siehe Dateien in `.github/prompts/`
```

---

### Phase 6: Symlinks (Optional – Rückwärtskompatibilität)

**Problem:** Externe Docs/Tools referenzieren alte Pfade (z. B. `QUICK-START.md`)

**Lösung:** Symlinks für häufig referenzierte Dateien

**Beispiel (Git Bash / WSL):**

```bash
# Windows: mklink (Cmd/PowerShell als Admin)
mklink /H QUICK-START.md docs\onboarding\quickstart.md

# Unix/WSL: ln -s
ln -s docs/onboarding/quickstart.md QUICK-START.md
```

**Kandidaten:**
- `QUICK-START.md` → `docs/onboarding/quickstart.md`
- `DEVELOPMENT-QUICKSTART.md` → `docs/onboarding/development-quickstart.md`
- `FIGMA-MCP-QUICKSTART.md` → `docs/integrations/figma-mcp.md`

**Hinweis in README:**

```markdown
## ⚠️ Legacy Symlinks

Die folgenden Dateien im Root sind Symlinks zu ihrer neuen Location:
- `QUICK-START.md` → `docs/onboarding/quickstart.md`
- `DEVELOPMENT-QUICKSTART.md` → `docs/onboarding/development-quickstart.md`

Diese Symlinks bleiben für 6 Monate (bis 2026-04-17), dann Entfernung.
```

---

### Phase 7: Validierung & Quality-Gates

#### 7.1 Dead-Link-Check (erneut)

```bash
# Nach allen Moves: Prüfe ob Links noch funktionieren
npm run lint:markdown
# Oder manuelles Script: scripts/quality/check-markdown-links.py
```

#### 7.2 Duplikat-Check (erneut)

```bash
# Sicherstellen, dass keine neuen Duplikate entstanden sind
python scripts/analysis/analyze-github-duplicates.py
# Erwartung: reports/duplicates.csv hat 0 Zeilen (außer Header)
```

#### 7.3 Stichproben (Manuelle Review)

**Checkliste:**

- [ ] Root hat max. 15 Dateien (Standards + agents.md)
- [ ] `docs/README.md` existiert und ist vollständig
- [ ] Alle Archive-Dirs haben `ARCHIVE_NOTE.md`
- [ ] `prompts/MIGRATION.md` existiert und ist korrekt
- [ ] `.github/prompts/INDEX.md` ist aktuell
- [ ] Alle `.instructions.md` haben vollständigen Frontmatter
- [ ] Alle `.github/chatmodes/*.md` haben vollständigen Frontmatter
- [ ] Keine `.yaml.json` Dateien mehr vorhanden
- [ ] `prompts/chatmodes/` ist gelöscht
- [ ] Symlinks funktionieren (falls erstellt)

#### 7.4 Git-Status überprüfen

```bash
git status
# Erwartung:
# - Viele "renamed" (git mv erhält History)
# - Einige "deleted" (Duplikate, obsolete Dateien)
# - Einige "new file" (docs/README.md, ARCHIVE_NOTE.md, INDEX.md)
```

---

### Phase 8: Commit & PR

#### 8.1 Staged Commits (semantisch gruppiert)

```bash
# Commit 1: Archivierung
git add docs/archive/
git commit -m "chore(docs): Archiviere temporäre Implementation-Reports

- Move CODESPACE-*.md → docs/archive/codespace/
- Move CODEQL-FIX-*.md → docs/archive/codeql/
- Move DEVCONTAINER-*.md → docs/archive/devcontainer/
- Move FIGMA-*.md → docs/archive/figma/
- Move IMPLEMENTATION-REPORT.md → docs/archive/implementation/
- Move MERGE-*.md → docs/archive/merge/
- Move PR-*.md → docs/archive/prs/
- Move README-*.md → docs/archive/readme-variants/
- Move RESOLUTION-STEPS.md → docs/archive/troubleshooting/
- Move SECURITY-*.md → docs/archive/security/
- Move SEMGREP-FIX-SUMMARY.md → docs/archive/semgrep/
- Move SESSION_SUMMARY_*.md → docs/archive/sessions/
- Move STATUS_UPDATE_*.md → docs/archive/status/
- Move TASK-COMPLETION-*.md → docs/archive/tasks/
- Move TRIVY-FIX-*.md → docs/archive/trivy/
- Add ARCHIVE_NOTE.md in allen Subdirs (Retention: 2 Jahre)

Relates-to: [Issue-Nummer aus Phase 5 Issue-Governance]
Reports: reports/reorg-plan.md"

# Commit 2: Reaktivierung
git add docs/onboarding/ docs/operations/ docs/planning/ docs/integrations/
git commit -m "chore(docs): Reaktiviere aktive Docs zu strukturierten Verzeichnissen

- Move DEVELOPMENT-QUICKSTART.md → docs/onboarding/development-quickstart.md
- Move QUICK-START.md → docs/onboarding/quickstart.md
- Move FIGMA-MCP-QUICKSTART.md → docs/integrations/figma-mcp.md
- Move SERVICE-STATUS.md → docs/operations/service-status.md
- Move NEUE-AUFGABEN-2025-10.md → docs/planning/neue-aufgaben-2025-10.md
- Move DOCS-INDEX.md → docs/README.md

Relates-to: [Issue-Nummer]
Reports: reports/reorg-plan.md"

# Commit 3: Duplikat-Elimination
git add .github/chatmodes/ .github/prompts/ prompts/
git commit -m "chore(prompts): Eliminiere 94 Duplikat-Dateien in prompts/chatmodes/

- Delete prompts/chatmodes/ (94 Dateien – identisch zu .github/chatmodes/)
- Delete .github/**/*.yaml.json (Format-Duplikate, YAML ist Source of Truth)
- Delete .github/**/*_examples.md (inline integriert als ## Examples)
- Add prompts/MIGRATION.md (Mapping Alt → Neu)

Relates-to: [Issue-Nummer]
Reports: reports/duplicates.csv"

# Commit 4: Versionierung
git add .github/instructions/ .github/chatmodes/ prompts/
git commit -m "chore(instructions): Füge einheitlichen Frontmatter zu allen Instructions/Chatmodes hinzu

- Add Frontmatter zu allen .instructions.md (version, status, created, lastUpdated)
- Add Frontmatter zu allen .github/chatmodes/*.md
- Mark prompts/*.prompt.md als DEPRECATED (status: DEPRECATED)
- Add .github/prompts/INDEX.md (auto-generated)

Relates-to: [Issue-Nummer]
Reports: reports/reorg-plan.md"

# Commit 5: Index-Updates
git add README.md docs/README.md .github/prompts/INDEX.md
git commit -m "docs: Update README & Indices nach Repo-Reorganisation

- Update Root-README.md (neue Doku-Sektion, AI-Agents, Reports)
- Add docs/README.md (vollständiger Haupt-Index)
- Add .github/prompts/INDEX.md (146 Prompts)

Relates-to: [Issue-Nummer]
Reports: reports/reorg-plan.md"

# Commit 6: Cleanup (optional – falls Symlinks)
git add QUICK-START.md DEVELOPMENT-QUICKSTART.md
git commit -m "chore: Add legacy Symlinks für Rückwärtskompatibilität (6 Monate Retention)

- Add Symlink QUICK-START.md → docs/onboarding/quickstart.md
- Add Symlink DEVELOPMENT-QUICKSTART.md → docs/onboarding/development-quickstart.md
- Retention: Bis 2026-04-17

Relates-to: [Issue-Nummer]"
```

#### 8.2 Pull Request erstellen

**Titel:**

```text
chore: Repository-Reorganisation – Doku-Neuordnung, Archive-Management, Duplikat-Elimination
```

**Body:**

```markdown
## 🎯 Ziel

Lückenlose Repo-Analyse, Doku-Neuordnung, Archive-Management gemäß Masterprompt "Gouvernance-Overhaul".

## 📋 Änderungen

### 1. Root-Cleanup (84 → 15 Dateien)

- ✅ 60+ MDs archiviert (docs/archive/)
- ✅ 5 MDs reaktiviert (docs/onboarding/, docs/operations/, docs/planning/)
- ✅ 3 obsolete Dateien gelöscht (_clean_deleted-*.csv, TRASHLIST.csv, Untitled-1.ipynb)

### 2. Duplikat-Elimination (94 Dateien)

- ✅ prompts/chatmodes/ gelöscht (94 Duplikate von .github/chatmodes/)
- ✅ Format-Duplikate entfernt (.yaml.json → .yaml)
- ✅ Beispiel-Duplikate integriert (_examples.md → inline ## Examples)

### 3. Versionierung & Frontmatter

- ✅ Alle .instructions.md mit vollständigem Frontmatter (version, status, created, lastUpdated)
- ✅ Alle .github/chatmodes/*.md mit Frontmatter
- ✅ Legacy-Prompts als DEPRECATED markiert (prompts/*.prompt.md)

### 4. Index-Updates

- ✅ Root-README.md aktualisiert (neue Sektionen: Doku, AI-Agents, Reports)
- ✅ docs/README.md erstellt (vollständiger Haupt-Index mit TOC)
- ✅ .github/prompts/INDEX.md auto-generiert (146 Prompts)

### 5. Archive-Management

- ✅ ARCHIVE_NOTE.md in allen Subdirs (Retention: 2 Jahre bis 2027-10-17)
- ✅ 31 Reaktivierungs-Kandidaten identifiziert (reports/archive-recovery.md)

## 📊 Reports

- [reorg-plan.md](reports/reorg-plan.md) – Vollständiger Reorganisations-Plan
- [archive-recovery.md](reports/archive-recovery.md) – Reaktivierungs-Kandidaten
- [duplicates.csv](reports/duplicates.csv) – Duplikat-Analyse

## ✅ Checkliste (Definition of Done)

- [x] Root hat max. 15 Dateien (Standards + agents.md)
- [x] docs/README.md existiert und ist vollständig
- [x] Alle Archive-Dirs haben ARCHIVE_NOTE.md
- [x] prompts/MIGRATION.md existiert und ist korrekt
- [x] .github/prompts/INDEX.md ist aktuell
- [x] Alle .instructions.md haben vollständigen Frontmatter
- [x] Alle .github/chatmodes/*.md haben vollständigen Frontmatter
- [x] Keine .yaml.json Dateien mehr vorhanden
- [x] prompts/chatmodes/ ist gelöscht
- [x] Dead-Link-Check durchgeführt (0 Errors)
- [x] Duplikat-Check durchgeführt (0 Duplikate)
- [ ] Quality-Gates grün (wird in CI ausgeführt)
- [ ] Stakeholder-Review (Tech Lead, Vorstand)

## 🔗 Related Issues

Fixes #[Issue-Nummer aus Phase 5 Issue-Governance]  
Relates-to: #[agents.md v2.0.0 Issue]

## 🚨 Breaking Changes

**KEINE Breaking Changes:**
- Alle Moves mit `git mv` (Git-History bleibt erhalten)
- Optional: Symlinks für häufig referenzierte Dateien (6 Monate Retention)
- Migration-Hinweise in prompts/MIGRATION.md

## 📝 Reviewer-Notes

**Bitte prüfen:**
1. **Root-Cleanup:** Sind alle wichtigen Docs reaktiviert? (Check docs/onboarding/, docs/operations/)
2. **Archive:** Ist Retention-Policy (2 Jahre) korrekt dokumentiert?
3. **Duplikate:** Bestätigen, dass prompts/chatmodes/ wirklich 100% Duplikate waren
4. **Frontmatter:** Stichprobe: 5 random .instructions.md auf vollständigkeit prüfen
5. **Indices:** docs/README.md vollständig? Keine Broken-Links?

**Approval erforderlich von:**
- @peschull (Tech Lead)
- @mschulller (Vorstand)
```

---

## Breaking-Change-Analyse

### Risiko-Level: **LOW** ✅

**Begründung:**

1. **Git-History bleibt erhalten:** Alle Moves mit `git mv` (kein `rm` + `create`)
2. **Keine API-Änderungen:** Reine Dokumentations-Reorganisation
3. **Rückwärtskompatibilität:**
   - Optional: Symlinks für häufig referenzierte Dateien (6 Monate)
   - Migration-Hinweise in prompts/MIGRATION.md
   - Alle alten Pfade in Archive mit Hinweis auf neue Location

### Betroffene Systeme

| System | Impact | Mitigation |
|--------|--------|------------|
| **External Docs** | Links zu QUICK-START.md brechen | ✅ Symlinks für 6 Monate |
| **CI/CD** | Pfad-Referenzen in Workflows | ✅ Review .github/workflows/*.yml |
| **Developer-Bookmarks** | Alte Pfade nicht mehr gültig | ✅ Changelog + Migration-Guide |
| **Search-Indexing** | Google/Internal Search veraltet | ✅ Kein Eingriff möglich (aktualisiert sich automatisch) |

### Rollback-Plan

**Falls kritische Issues nach Merge:**

```bash
# Option 1: Revert des Merge-Commits
git revert -m 1 [merge-commit-hash]

# Option 2: Rollback zu vorherigem Stand
git checkout main
git reset --hard [commit-vor-reorganisation]
git push --force-with-lease

# Option 3: Cherry-Pick einzelner Reverts
git revert [commit-1-hash]
git revert [commit-2-hash]
# etc.
```

**Entscheidungs-Matrix:**

| Issue | Severity | Rollback-Option |
|-------|----------|-----------------|
| **Broken CI/CD** | P0-Critical | Option 2 (Full Rollback) |
| **Fehlende wichtige Docs** | P1-High | Option 3 (Cherry-Pick-Revert des Archive-Commits) |
| **Symlink-Issues (Windows)** | P2-Medium | Hotfix: Symlinks entfernen, READMEs mit Redirect |
| **Dead Links in README** | P2-Medium | Hotfix: PR mit Link-Fixes |

---

## Timeline & Milestones

### Milestone 1: Vorbereitung (2 Tage)

- [x] reports/reorg-plan.md erstellen (diese Datei)
- [ ] Duplikat-Analyse-Script entwickeln
- [ ] Dead-Link-Check-Script entwickeln
- [ ] Archive-Kandidaten finalisieren (reports/archive-recovery.md bereits vorhanden)

### Milestone 2: Execution (3 Tage)

- [ ] Root-Cleanup (Batch-Moves)
- [ ] Duplikat-Elimination
- [ ] Versionierung & Frontmatter
- [ ] Index-Updates
- [ ] Symlinks (optional)

### Milestone 3: Validierung (1 Tag)

- [ ] Dead-Link-Check (erneut)
- [ ] Duplikat-Check (erneut)
- [ ] Manuelle Stichproben
- [ ] Git-Status Review

### Milestone 4: PR & Merge (1 Tag)

- [ ] Staged Commits (semantisch gruppiert)
- [ ] Pull Request erstellen
- [ ] Stakeholder-Review (Tech Lead, Vorstand)
- [ ] CI/CD-Gates grün
- [ ] Merge to main

**Gesamtdauer:** ~7 Tage (ohne Blockierungen)

---

## Success Metrics

**Quantitativ:**

- ✅ Root-Dateien: 84 → 15 (-82%)
- ✅ Duplikate eliminiert: ~94 Dateien (-100% in prompts/chatmodes/)
- ✅ Archive-Retention dokumentiert: 100% (ARCHIVE_NOTE.md in allen Subdirs)
- ✅ Versionierung: 100% (alle .instructions.md + .github/chatmodes/*.md mit Frontmatter)
- ✅ Dead-Links: 0 (nach Validierung)

**Qualitativ:**

- ✅ Developer-Onboarding-Zeit sinkt (klarer Einstieg via docs/README.md)
- ✅ Doku-Wartungsaufwand sinkt (Single Source of Truth)
- ✅ Suchbarkeit verbessert (strukturierte Verzeichnisse, Indices)
- ✅ Compliance-Risiko sinkt (keine veralteten Security-Docs im Root)

---

## Anhang

### A. Referenzierte Dokumente

- [agents.md v2.0.0](../agents.md) – Zentrale Steuerdatei
- [reports/archive-recovery.md](archive-recovery.md) – Reaktivierungs-Kandidaten
- [reports/label-mapping.csv](label-mapping.csv) – Label-Taxonomie
- [reports/triage-rules.md](triage-rules.md) – Issue-SLA & Workflows
- [reports/roadmap.md](roadmap.md) – 2025-2026 Milestones

### B. Scripts (zu entwickeln)

- `scripts/analysis/analyze-github-duplicates.py` – SHA-256 + Fuzzy-Match
- `scripts/quality/check-markdown-links.py` – Dead-Link-Detection
- `scripts/quality/add-frontmatter.py` – Batch-Frontmatter-Update
- `scripts/quality/generate-prompt-index.py` – Auto-Index für .github/prompts/

### C. Templates

- `config-templates/frontmatter-standard.yml` – Frontmatter-Schema
- `docs/archive/ARCHIVE_NOTE.md` – Template für Archiv-Retention

---

**Ende reorg-plan.md**

**Erstellt:** 2025-10-17  
**Verantwortlich:** Lead Architect (Peter Schuller)  
**Review:** Tech Lead (Peter Schuller), Vorstand (Michael Schuller)  
**Status:** Draft – Ready for Implementation
