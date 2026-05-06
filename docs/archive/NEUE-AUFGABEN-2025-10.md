# 📋 Neue Aufgaben & Backlog - Oktober 2025

> **Status:** AKTIV  
> **Erstellt:** 2025-10-13  
> **Letzte Aktualisierung:** 2025-10-13  
> **Verantwortlich:** Development Team

---

## 📊 Übersicht

Dieses Dokument enthält neue Aufgaben, die auf Basis der aktuellen Analyse des Repositories identifiziert wurden, sowie den Status der Bearbeitung offener Aufgaben aus STATUS_UPDATE_2025-10-10_FINAL.md.

---

## ✅ Abgeschlossene Aufgaben (2025-10-13)

### Phase 1: Dokumentation & Standards

- [x] **.gitignore erweitert** - Drupal Core Dokumentation ausgeschlossen
  - Hinzugefügt: `crm.*/web/core/tests/**/README.md`
  - Hinzugefügt: `crm.*/web/core/themes/**/README.md`
  - Hinzugefügt: `crm.*/web/core/modules/*/tests/**/README.md`
  - **Status:** ✅ COMPLETE
  - **Datei:** `.gitignore`

- [x] **CONTRIBUTING.md erstellt** - Umfassende Contribution Guidelines
  - Branch Strategy (Git Flow)
  - Commit Convention (Conventional Commits)
  - PR-Prozess mit Checklists
  - Code Review Guidelines
  - Testing Requirements
  - Quality Gates
  - CODEOWNERS Struktur
  - **Status:** ✅ COMPLETE (12.8 KB)
  - **Datei:** `CONTRIBUTING.md`

- [x] **CODE_OF_CONDUCT.md erstellt** - Community Standards
  - Contributor Covenant 2.1
  - Durchsetzungsrichtlinien
  - Meldeverfahren
  - **Status:** ✅ COMPLETE (6.5 KB)
  - **Datei:** `CODE_OF_CONDUCT.md`

- [x] **SUPPORT.md erstellt** - Support & Hilfestellung
  - Getting Help Anleitung
  - Issue Reporting Templates
  - FAQ (20+ Fragen)
  - Kontaktinformationen
  - Office Hours
  - **Status:** ✅ COMPLETE (9.1 KB)
  - **Datei:** `SUPPORT.md`

- [x] **NORMALIZATION_RULES.yml validiert** - Bereits vorhanden
  - **Status:** ✅ EXISTS
  - **Datei:** `NORMALIZATION_RULES.yml`

---

## 🔴 KRITISCHE Aufgaben (Noch offen)

### 1. Front-Matter auf Dokumentation anwenden

**Beschreibung:** Anwendung von Front-Matter auf Markdown-Dateien zur Verbesserung der Documentation Coverage.

**Aktueller Status:**
- Script vorhanden: `scripts/add-frontmatter.ps1`
- DRY-RUN erfolgreich getestet
- 344 Dateien identifiziert (nach Ausschlüssen)

**Aktion erforderlich:**
```bash
# Option 1: Alle Dateien (vorsichtig!)
pwsh -Command "& ./scripts/add-frontmatter.ps1 -DryRun \$false"

# Option 2: Nur Priority Files (empfohlen)
pwsh -Command "& ./scripts/add-frontmatter.ps1 -TargetFiles @(
  'README.md',
  'CHANGELOG.md',
  'api.menschlichkeit-oesterreich.at/README.md',
  'crm.menschlichkeit-oesterreich.at/README.md',
  'frontend/README.md',
  'web/README.md',
  'automation/README.md',
  'deployment-scripts/README.md'
) -DryRun \$false"
```

**Erwartetes Ergebnis:**
- Front-Matter Coverage: 10% → 87-91%
- Bessere Dokumentations-Navigation
- Automatische Kategorisierung

**Priorität:** 🔴 CRITICAL  
**Schätzung:** 30 Min  
**Deadline:** 2025-10-15  
**Verantwortlich:** Documentation Team

---

## 🟡 HOHE PRIORITÄT

### 2. Link-Validierung durchführen

**Beschreibung:** Überprüfung aller internen und externen Links in Markdown-Dokumentation.

**Tools:**
- `markdown-link-check` (npm package)
- Oder PowerShell-basierte Lösung

**Aktion:**
```bash
# Installation
npm install -g markdown-link-check

# Ausführung
find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" \
  -exec markdown-link-check {} \; > quality-reports/link-validation-report.txt

# Oder mit npm script
npm run docs:validate
```

**Bekannte Issues:**
- 65 broken links aus früheren Analysen
- Viele relative Links zu legacy Dateien

**Priorität:** 🟡 HIGH  
**Schätzung:** 2 Stunden  
**Deadline:** 2025-10-18  
**Verantwortlich:** Documentation Team

### 3. Markdown Linting durchführen

**Beschreibung:** Einheitliche Markdown-Formatierung über alle Dokumente.

**Tools:**
- `markdownlint-cli2` (bereits in package.json)
- Config: `.markdownlint.json`

**Aktion:**
```bash
# Installation (falls nicht vorhanden)
npm install

# Ausführung
npx markdownlint-cli2 "**/*.md" --config .markdownlint.json

# Mit Fix-Option
npx markdownlint-cli2 "**/*.md" --fix

# Output speichern
npx markdownlint-cli2 "**/*.md" --config .markdownlint.json \
  --output quality-reports/markdownlint-report.json
```

**Priorität:** 🟡 HIGH  
**Schätzung:** 1 Stunde  
**Deadline:** 2025-10-18  
**Verantwortlich:** Documentation Team

### 4. Rechtschreibprüfung (de-AT & en)

**Beschreibung:** Spell-Check für deutsche und englische Dokumentation.

**Tools:**
- `cspell` mit österreichischem Wörterbuch

**Aktion:**
```bash
# Installation
npm install -g cspell

# Konfiguration erstellen (falls nicht vorhanden)
cat > cspell.json << 'EOF'
{
  "version": "0.2",
  "language": "de-AT,en",
  "words": [
    "Menschlichkeit",
    "Österreich",
    "CiviCRM",
    "FastAPI",
    "PostgreSQL",
    "MariaDB"
  ],
  "ignorePaths": [
    "node_modules",
    "vendor",
    ".git",
    "dist",
    "build"
  ]
}
EOF

# Ausführung
cspell "**/*.md" --config cspell.json --language de-AT,en \
  > quality-reports/spelling-errors.txt
```

**Priorität:** 🟡 HIGH  
**Schätzung:** 1.5 Stunden  
**Deadline:** 2025-10-18  
**Verantwortlich:** Documentation Team

---

## 🟢 MITTLERE PRIORITÄT

### 5. docs/INDEX.md Sitemap erstellen

**Beschreibung:** Zentrale Navigation für alle Dokumentationsdateien.

**Struktur:**
```markdown
# Documentation Index

## 🚀 Getting Started
- [README](../README.md)
- [Quick Start Guide](getting-started.md)
- [Contributing](../CONTRIBUTING.md)

## 🏗️ Architecture
- [System Architecture](architecture/SYSTEM-ARCHITECTURE.md)
- [Service Overview](architecture/SERVICES.md)
- [Database Schema](architecture/DATABASE.md)

## 🔒 Security & Compliance
- [Security Policy](../SECURITY.md)
- [DSGVO Compliance](compliance/DSGVO.md)
- [Right to Erasure](compliance/RIGHT-TO-ERASURE-PROCEDURES.md)

## 💻 Development
- [Development Setup](development-setup.md)
- [Testing Guide](testing-guide.md)
- [Deployment Guide](deployment-guide.md)

## 📚 Services
- [API Backend](../api.menschlichkeit-oesterreich.at/README.md)
- [CRM System](../crm.menschlichkeit-oesterreich.at/README.md)
- [Frontend](../frontend/README.md)
- [Gaming Platform](../web/README.md)
- [Automation](../automation/README.md)
```

**Priorität:** 🟢 MEDIUM  
**Schätzung:** 2 Stunden  
**Deadline:** 2025-10-20  
**Verantwortlich:** Documentation Team

### 6. Service READMEs standardisieren

**Beschreibung:** Einheitliche Struktur für alle Service-READMEs.

**Template:**
```markdown
# [Service Name]

> [One-line description]

## Quick Start

```bash
# 5 steps or less
npm install
npm run dev:[service]
```

## Architecture

[Mermaid diagram showing service structure]

## Configuration

- Environment variables
- Configuration files
- Database setup

## Development

- Local development
- Testing
- Debugging

## Deployment

- Build process
- Deployment steps
- Environment-specific configs

## API Documentation

[Link to OpenAPI spec or detailed API docs]

## Troubleshooting

Common issues and solutions
```

**Betroffene Dateien:**
- `api.menschlichkeit-oesterreich.at/README.md`
- `crm.menschlichkeit-oesterreich.at/README.md`
- `frontend/README.md`
- `web/README.md`
- `automation/README.md`

**Priorität:** 🟢 MEDIUM  
**Schätzung:** 3 Stunden  
**Deadline:** 2025-10-22  
**Verantwortlich:** Service Owners

### 7. MOVES.csv finalisieren

**Beschreibung:** Entscheidung über Reorganisation von Session-Dokumenten.

**Vorschlag:**
```csv
CurrentPath,NewPath,Reason
STATUS_UPDATE_*.md,docs/sessions/,Session documentation
TASK-COMPLETION-SUMMARY.md,docs/sessions/,Session documentation
DOCS_REPORT_*.md,quality-reports/,Quality reports
```

**Aktion:**
1. Review mit Team
2. Approval einholen
3. Files verschieben
4. Links aktualisieren

**Priorität:** 🟢 MEDIUM  
**Schätzung:** 1 Stunde  
**Deadline:** 2025-10-22  
**Verantwortlich:** DevOps Team

---

## 🔵 NIEDRIGE PRIORITÄT / BACKLOG

### 8. Issue Templates aktualisieren

**Beschreibung:** Verbesserung der GitHub Issue Templates.

**Templates zu erstellen/aktualisieren:**
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/ISSUE_TEMPLATE/documentation.yml`
- `.github/ISSUE_TEMPLATE/security_report.yml`

**Priorität:** 🔵 LOW  
**Schätzung:** 1.5 Stunden  
**Deadline:** 2025-10-25

### 9. GitHub Actions Workflows optimieren

**Beschreibung:** Verbesserung der CI/CD Pipelines.

**Optimierungen:**
- Parallel execution wo möglich
- Caching verbessern
- Redundante Steps entfernen
- Performance Monitoring

**Betroffene Workflows:**
- `.github/workflows/secrets-validate.yml`
- `.github/workflows/quality-gates.yml`
- `.github/workflows/deploy-staging.yml`

**Priorität:** 🔵 LOW  
**Schätzung:** 3 Stunden  
**Deadline:** 2025-10-30

### 10. Automatische Changelog-Generierung

**Beschreibung:** Setup für automatische Changelog-Updates basierend auf Conventional Commits.

**Tools:**
- `standard-version` oder `semantic-release`

**Konfiguration:**
```json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major"
  }
}
```

**Priorität:** 🔵 LOW  
**Schätzung:** 2 Stunden  
**Deadline:** 2025-11-05

---

## 🆕 NEUE AUFGABEN FÜR NÄCHSTEN SPRINT

### Sprint Planning (2025-10-20 bis 2025-11-03)

#### Theme: Documentation Excellence & Developer Experience

**Epic 1: Documentation Coverage**
- [ ] Apply Front-Matter to all priority files
- [ ] Create comprehensive docs/INDEX.md
- [ ] Standardize all service READMEs
- [ ] Complete link validation & fixes

**Epic 2: Quality Assurance**
- [ ] Markdown linting (100% coverage)
- [ ] Spell checking (de-AT & en)
- [ ] Automated quality reports
- [ ] CI/CD integration for docs quality

**Epic 3: Developer Experience**
- [ ] Improve onboarding documentation
- [ ] Create video tutorials (optional)
- [ ] Setup automated release notes
- [ ] Enhance GitHub Actions workflows

**Epic 4: Compliance & Security**
- [ ] Review and update SECURITY.md
- [ ] Complete DSGVO documentation
- [ ] Security audit of dependencies
- [ ] Penetration testing (if applicable)

---

## 📊 Metriken & Fortschritt

### Documentation Coverage

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Front-Matter Coverage | 10% (3/30) | 90%+ | 🔴 |
| Broken Links | Unknown | 0 | ⏳ |
| Markdown Lint Errors | Unknown | 0 | ⏳ |
| Spelling Errors | Unknown | <5 | ⏳ |
| Service README Coverage | 60% (3/5) | 100% | 🟡 |

### Compliance Documentation

| Document | Status | Last Updated |
|----------|--------|--------------|
| CONTRIBUTING.md | ✅ Complete | 2025-10-13 |
| CODE_OF_CONDUCT.md | ✅ Complete | 2025-10-13 |
| SUPPORT.md | ✅ Complete | 2025-10-13 |
| SECURITY.md | ⚠️ Needs Review | 2025-10-13 |
| NORMALIZATION_RULES.yml | ✅ Exists | 2025-10-10 |

---

## 🎯 Definition of Done

### Für Documentation Tasks

- [ ] Front-Matter vollständig und korrekt
- [ ] Markdown Lint Errors = 0
- [ ] Alle Links funktionieren
- [ ] Rechtschreibung geprüft
- [ ] Review durch Documentation Team
- [ ] Commit mit beschreibender Message

### Für Code Tasks

- [ ] Tests geschrieben und grün
- [ ] Linting passed
- [ ] Code Review durchgeführt
- [ ] Documentation aktualisiert
- [ ] Quality Gates passed
- [ ] PR gemerged

---

## 📝 Notizen & Erkenntnisse

### 2025-10-13

**Abgeschlossen:**
- Grundlegende Compliance-Dokumentation vollständig
- CONTRIBUTING.md mit umfassenden Guidelines
- .gitignore erweitert für bessere Docs-Hygiene

**Erkenntnisse:**
- Front-Matter Script funktioniert einwandfrei (DRY-RUN erfolgreich)
- 344 Dateien könnten Front-Matter bekommen (nach Ausschlüssen)
- Vorsichtiger Ansatz empfohlen: Erst Priority Files, dann Rest

**Nächste Schritte:**
- Front-Matter auf kritische Files anwenden
- Link-Validierung als nächste Priorität
- Quality Reports automatisieren

---

## 🔗 Verwandte Dokumente

- [STATUS_UPDATE_2025-10-10_FINAL.md](STATUS_UPDATE_2025-10-10_FINAL.md)
- [PR-87-IMPLEMENTATION-COMPLETE.md](PR-87-IMPLEMENTATION-COMPLETE.md)
- [DOCS_REPORT_FINAL.md](DOCS_REPORT_FINAL.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [NORMALIZATION_RULES.yml](NORMALIZATION_RULES.yml)

---

**Maintainer:** Development Team  
**Review Cycle:** Weekly  
**Last Review:** 2025-10-13  
**Next Review:** 2025-10-20
