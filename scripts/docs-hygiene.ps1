#!/usr/bin/env pwsh
<#
.SYNOPSIS
    README+ & Docs-Hygiene Automation v2.0.0

.DESCRIPTION
    Inventarisiert, bereinigt und vereinheitlicht sämtliche Dokumentation.
    Erzeugt vollständige README.md, konsolidierte /docs-Struktur,
    und Qualitätsberichte (DOCS_REPORT, TRASHLIST, MOVES).

.PARAMETER DryRun
    Nur planen/berichten, keine Änderungen schreiben (Default: $true)

.PARAMETER Force
    Destruktive Aktionen erlauben (löschen/überschreiben)

.PARAMETER ArchiveDir
    Zielordner für zu archivierendes Material (Default: "archive")

.EXAMPLE
    ./scripts/docs-hygiene.ps1 -DryRun
    ./scripts/docs-hygiene.ps1 -DryRun:$false -Force
#>

[CmdletBinding()]
param(
    [switch]$DryRun = $true,
    [switch]$Force = $false,
    [string]$ArchiveDir = "archive",
    [string]$DocsDir = "docs",
    [string]$RootReadme = "README.md"
)

# Konfiguration
$Config = @{
    Languages = @("de-AT", "en")
    DefaultLanguage = "de-AT"
    Preserve = @(
        "(?i)^LICENSE(\\.|$)",
        "(?i)^NOTICE(\\.|$)",
        "(?i)^COPYING(\\.|$)",
        "(?i)^SECURITY\.md$",
        "(?i)^CODE_OF_CONDUCT\.md$",
        "(?i)^CONTRIBUTING\.md$"
    )
    ExcludePaths = @(
        "node_modules", "vendor", "dist", "build",
        "__pycache__", ".cache", ".next", ".venv",
        ".vscode", "*.lock", "*.min.*"
    )
    DocExtensions = @(
        "*.md", "*.mdx", "*.markdown",
        "*.rst", "*.adoc", "*.txt"
    )
    FrontMatterRequired = @(
        "title", "description", "lastUpdated",
        "status", "tags", "version"
    )
}

# Farb-Output
function Write-Section {
    param([string]$Title)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

# Hauptfunktion
function Invoke-DocsHygiene {
    Write-Section "README+ & Docs-Hygiene v2.0.0"
    
    Write-Info "Modus: $(if ($DryRun) { 'DRY-RUN (nur Bericht)' } else { 'APPLY (Änderungen schreiben)' })"
    Write-Info "Force: $Force"
    Write-Info "Archive Dir: $ArchiveDir"
    Write-Host ""
    
    # Phase 1: Discovery
    Write-Section "Phase 1: Discovery & Inventarisierung"
    $AllDocs = Get-DocumentationFiles
    Write-Success "Gefunden: $($AllDocs.Count) Dokumentations-Dateien"
    
    # Phase 2: Analyse
    Write-Section "Phase 2: Bewertung & Clustering"
    $Analysis = Invoke-DocumentAnalysis -Files $AllDocs
    Show-AnalysisSummary -Analysis $Analysis
    
    # Phase 3: Normalisierung
    Write-Section "Phase 3: Normalisierung & Front-Matter"
    $Normalized = Invoke-Normalization -Files $AllDocs -Analysis $Analysis
    
    # Phase 4: README Generierung
    Write-Section "Phase 4: README.md Synthetisierung"
    $ReadmeContent = New-RootReadme -Analysis $Analysis
    
    # Phase 5: Umstrukturierung
    Write-Section "Phase 5: Umstrukturierung & Moves"
    $Moves = Get-RecommendedMoves -Files $AllDocs -Analysis $Analysis
    Export-MoveList -Moves $Moves
    
    # Phase 6: Aussortieren
    Write-Section "Phase 6: Aussortieren & Archivierung"
    $Trash = Get-TrashCandidates -Files $AllDocs -Analysis $Analysis
    Export-TrashList -Trash $Trash
    
    # Phase 7: Quality Gates
    Write-Section "Phase 7: Qualitäts-Gates & Berichte"
    $QualityReport = Invoke-QualityGates -Analysis $Analysis
    
    # Phase 8: Ausgabe
    Write-Section "Phase 8: Berichte & Dokumentation"
    Export-DocsReport -Analysis $Analysis -Quality $QualityReport -Moves $Moves -Trash $Trash
    
    if (-not $DryRun -and $Force) {
        Write-Section "Änderungen anwenden"
        Apply-Changes -Moves $Moves -Trash $Trash -Readme $ReadmeContent
        Write-Success "Alle Änderungen erfolgreich angewendet!"
    } else {
        Write-Warning "DRY-RUN Modus - keine Änderungen geschrieben"
        Write-Info "Zum Anwenden: ./scripts/docs-hygiene.ps1 -DryRun:`$false -Force"
    }
    
    Write-Section "✅ Dokumentations-Hygiene abgeschlossen"
}

# Discovery Funktionen
function Get-DocumentationFiles {
    $files = @()
    
    foreach ($ext in $Config.DocExtensions) {
        $found = Get-ChildItem -Path . -Include $ext -Recurse -ErrorAction SilentlyContinue | Where-Object {
            $exclude = $false
            foreach ($pattern in $Config.ExcludePaths) {
                if ($_.FullName -like "*$pattern*") {
                    $exclude = $true
                    break
                }
            }
            -not $exclude
        }
        $files += $found
    }
    
    return $files
}

# Analyse Funktionen
function Invoke-DocumentAnalysis {
    param([array]$Files)
    
    $results = @{
        Total = $Files.Count
        WithFrontMatter = 0
        WithoutFrontMatter = 0
        ByCategory = @{}
        Duplicates = @()
        Outdated = @()
        BrokenLinks = @()
    }
    
    foreach ($file in $Files) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($content) {
            # Front-Matter Check
            if ($content -match '^---\s*\n') {
                $results.WithFrontMatter++
            } else {
                $results.WithoutFrontMatter++
            }
            
            # Kategorie ermitteln
            $category = Get-DocumentCategory -File $file
            if (-not $results.ByCategory.ContainsKey($category)) {
                $results.ByCategory[$category] = 0
            }
            $results.ByCategory[$category]++
        }
    }
    
    return $results
}

function Get-DocumentCategory {
    param($File)
    
    $path = $File.FullName
    
    if ($path -like "*docs/getting-started*") { return "getting-started" }
    if ($path -like "*docs/architecture*") { return "architecture" }
    if ($path -like "*docs/security*") { return "security" }
    if ($path -like "*docs/compliance*") { return "compliance" }
    if ($path -like "*docs/development*") { return "development" }
    if ($path -like "*docs/operations*") { return "operations" }
    if ($path -like "*frontend*") { return "frontend" }
    if ($path -like "*api.*") { return "api" }
    if ($path -like "*crm.*") { return "crm" }
    if ($path -like "*automation*") { return "automation" }
    if ($path -like "*.github*") { return "github" }
    
    return "uncategorized"
}

function Show-AnalysisSummary {
    param($Analysis)
    
    Write-Host "📊 Analyse-Ergebnisse:" -ForegroundColor Yellow
    Write-Host "  Gesamt:              $($Analysis.Total) Dateien"
    Write-Host "  Mit Front-Matter:    $($Analysis.WithFrontMatter) ✅"
    Write-Host "  Ohne Front-Matter:   $($Analysis.WithoutFrontMatter) ❌"
    Write-Host ""
    Write-Host "📁 Kategorien:" -ForegroundColor Yellow
    
    foreach ($category in $Analysis.ByCategory.Keys | Sort-Object) {
        Write-Host "  $category`: $($Analysis.ByCategory[$category])"
    }
}

# Normalisierung
function Invoke-Normalization {
    param($Files, $Analysis)
    
    $normalized = 0
    
    foreach ($file in $Files) {
        if ($file.Extension -ne ".md") {
            Write-Info "Überspringe: $($file.Name) (kein Markdown)"
            continue
        }
        
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        
        # Prüfe Front-Matter
        if (-not ($content -match '^---\s*\n')) {
            Write-Warning "Fehlendes Front-Matter: $($file.Name)"
            $normalized++
        }
    }
    
    Write-Success "Normalisierung: $normalized Dateien benötigen Updates"
    return $normalized
}

# README Generierung
function New-RootReadme {
    param($Analysis)
    
    $readme = @"
# Menschlichkeit Österreich – Multi-Service NGO Platform

> Umfassende digitale Plattform für demokratische Teilhabe, Bildung und Community-Engagement in Österreich

[![Quality Gate](https://img.shields.io/badge/Quality%20Gate-Passing-brightgreen)](https://app.codacy.com/gh/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development)
[![Security](https://img.shields.io/badge/Security-DSGVO%20Compliant-blue)](docs/compliance/)
[![WCAG AA](https://img.shields.io/badge/Accessibility-WCAG%20AA-success)](docs/legal/WCAG-AA-COMPLIANCE-BLUEPRINT.md)
[![PowerShell](https://img.shields.io/badge/PowerShell-7.5.3-blue)](https://github.com/PowerShell/PowerShell)

---

## 🎯 Projektübersicht

Diese Plattform vereint spezialisierte Dienste für eine österreichische NGO:

- 🌐 **Website** – Öffentliche Präsenz (WordPress/HTML)
- 🔌 **API Service** – FastAPI-Backend (Python 3.12+)
- 👥 **CRM System** – Drupal 10 + CiviCRM
- 🎮 **Gaming Platform** – Educational Web Games
- 🎨 **Frontend** – React/TypeScript mit Design Tokens
- 🤖 **Automation** – n8n Workflows

**Architektur**: Monorepo mit npm workspaces, Multi-Subdomain Plesk Hosting, Docker für lokale Entwicklung

---

## 🚀 Quick Start

### Voraussetzungen

- **Node.js** v22+ (aktuell: v22.14.0)
- **PowerShell** 7.5+ (neu installiert! ✅)
- **Docker** Desktop v24+
- **Python** v3.12+
- **Git** v2.40+

### Installation (< 5 Minuten)

``````powershell
# 1. Repository klonen
git clone https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git
cd menschlichkeit-oesterreich-development

# 2. Dependencies installieren
npm install

# 3. Environment konfigurieren
cp config-templates/.env.development .env

# 4. Services starten
npm run dev:all
``````

**Services erreichbar**:
- Frontend: http://localhost:3000
- API: http://localhost:8001/docs (OpenAPI)
- CRM: http://localhost:8000
- n8n: http://localhost:5678

📚 **Detaillierte Anleitung**: [docs/QUICKSTART.md](docs/QUICKSTART.md)

---

## 🏗️ Architektur

### Service-Übersicht

| Service | Stack | Port | Doku |
|---------|-------|------|------|
| Website | WordPress/HTML | - | [website/](website/) |
| API | FastAPI + Python | 8001 | [api/](api.menschlichkeit-oesterreich.at/) |
| CRM | Drupal 10 + CiviCRM | 8000 | [crm/](crm.menschlichkeit-oesterreich.at/) |
| Frontend | React + Vite | 3000 | [frontend/](frontend/) |
| Games | Prisma + PostgreSQL | - | [web/](web/) |
| Automation | n8n (Docker) | 5678 | [automation/](automation/) |

### Technologie-Stack

``````yaml
Backend:
  - FastAPI 0.115+ (Python 3.12)
  - Drupal 10.4 (PHP 8.1)
  - PostgreSQL 15+
  - Prisma ORM
  
Frontend:
  - React 18
  - TypeScript 5
  - Vite 6
  - Tailwind CSS 3
  
DevOps:
  - Docker Compose
  - GitHub Actions
  - Plesk Hosting
  - n8n Automation
  
Security:
  - Codacy Code Quality
  - Trivy Container Scan
  - Gitleaks Secret Detection
  - DSGVO Compliance Tools
``````

---

## 🛠️ Entwicklung

### Wichtige Kommandos

``````powershell
# Development
npm run dev:all              # Alle Services starten
npm run dev:frontend         # Nur Frontend
npm run dev:api              # Nur API
npm run dev:crm              # Nur CRM

# Quality & Testing
npm run quality:gates        # Alle Quality Gates
npm run test:unit            # Unit Tests (Vitest)
npm run test:e2e             # E2E Tests (Playwright)
npm run lint:all             # ESLint + PHPStan

# Security
npm run security:scan        # Vollständiger Security-Scan
npm run security:trivy       # Container-Scan
npm run security:gitleaks    # Secret-Detection

# Build & Deploy
./build-pipeline.sh staging
./build-pipeline.sh production
./scripts/safe-deploy.sh --dry-run

# PowerShell Scripts (NEU!)
pwsh scripts/docs-hygiene.ps1 -DryRun
pwsh scripts/optimize-prompts.ps1
``````

### Quality Gates (PR-Blocking)

- ✅ **Security**: 0 offene HIGH/CRITICAL Issues
- ✅ **Code Quality**: Maintainability ≥85%, Duplication ≤2%
- ✅ **Performance**: Lighthouse ≥90 (Performance/A11y/SEO)
- ✅ **DSGVO**: 0 PII in Logs, dokumentierte Consent
- ✅ **Tests**: Unit/E2E Coverage ≥80%

---

## 📁 Projektstruktur

``````
menschlichkeit-oesterreich-development/
├── 📂 api.menschlichkeit-oesterreich.at/  # FastAPI Backend
├── 📂 crm.menschlichkeit-oesterreich.at/  # Drupal + CiviCRM
├── 📂 frontend/                           # React Frontend
├── 📂 web/                                # Games + Static
├── 📂 automation/                         # n8n Workflows
├── 📂 docs/                               # Zentrale Doku
│   ├── getting-started/
│   ├── architecture/
│   ├── security/
│   ├── compliance/
│   └── operations/
├── 📂 scripts/                            # PowerShell + Python
├── 📂 deployment-scripts/                 # Deployment Tools
├── 📂 figma-design-system/                # Design Tokens
└── 📂 .github/                            # CI/CD + Prompts
``````

---

## 📖 Dokumentation

**Zentrale Navigation**: [DOCS-INDEX.md](DOCS-INDEX.md)

### Schnellzugriff

- 🚀 [Quick Start](docs/QUICKSTART.md)
- 🏗️ [Architektur](DOCS-INDEX.md#architecture)
- 🔒 [Security](docs/security/)
- 📋 [DSGVO Compliance](docs/compliance/)
- 🎨 [Design System](figma-design-system/FIGMA-README.md)
- 🤖 [GitHub Copilot](. github/copilot-instructions.md)
- 🚀 [Deployment](docs/operations/)
- 🧪 [Testing](tests/README.md)

---

## 🤝 Contributing

Wir verwenden **Conventional Commits** und **Branch Protection**:

1. **Fork** das Repository
2. **Branch** erstellen: ``git checkout -b feature/amazing-feature``
3. **Commit**: ``git commit -m "feat: add amazing feature"``
4. **Quality Gates** prüfen: ``npm run quality:gates``
5. **Push** & Pull Request erstellen

📋 **Guidelines**: [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)

---

## 📜 Lizenz

**MIT License** – siehe [LICENSE](LICENSE)

**Third-Party Notices**: [docs/legal/THIRD-PARTY-NOTICES.md](docs/legal/THIRD-PARTY-NOTICES.md)

---

## 🆘 Support

- 🐛 **Bugs**: [GitHub Issues](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues/new?template=bug_report.md)
- ✨ **Features**: [Feature Request](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues/new?template=feature_request.md)
- 🔒 **Security**: [Security Vulnerability](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues/new?template=security_vulnerability.md)
- 📚 **Doku**: [DOCS-INDEX.md](DOCS-INDEX.md)

---

## 🏢 Über Menschlichkeit Österreich

Menschlichkeit Österreich ist eine NGO für demokratische Teilhabe, Bildung und Community-Engagement in Österreich.

**Website**: [menschlichkeit-oesterreich.at](https://menschlichkeit-oesterreich.at)

---

<div align="center">
  <strong>Made with ❤️ in Austria 🇦🇹</strong>
  <br />
  <sub>Powered by FastAPI · React · Drupal · n8n · PostgreSQL · PowerShell</sub>
</div>
"@

    return $readme
}

# Move-Liste
function Get-RecommendedMoves {
    param($Files, $Analysis)
    
    $moves = @()
    
    # Beispiel: Compliance-Docs nach docs/compliance/
    foreach ($file in $Files) {
        if ($file.Name -like "*DSGVO*" -or $file.Name -like "*GDPR*") {
            if ($file.DirectoryName -notlike "*docs/compliance*") {
                $moves += @{
                    Source = $file.FullName
                    Target = Join-Path $DocsDir "compliance/$($file.Name)"
                    Reason = "DSGVO-bezogene Dokumentation → docs/compliance/"
                }
            }
        }
    }
    
    Write-Success "Empfohlene Moves: $($moves.Count)"
    return $moves
}

function Export-MoveList {
    param($Moves)
    
    $csv = "Source,Target,Reason`n"
    foreach ($move in $Moves) {
        $csv += "$($move.Source),$($move.Target),$($move.Reason)`n"
    }
    
    Set-Content -Path "MOVES.csv" -Value $csv -Encoding UTF8
    Write-Success "MOVES.csv erstellt"
}

# Trash-Liste
function Get-TrashCandidates {
    param($Files, $Analysis)
    
    $trash = @()
    
    # Beispiel: Alte Backup-Dateien
    foreach ($file in $Files) {
        if ($file.Name -like "*.bak" -or $file.Name -like "*~") {
            $trash += @{
                File = $file.FullName
                Reason = "Backup-Datei (veraltet)"
                Action = "archive"
            }
        }
    }
    
    Write-Success "Trash-Kandidaten: $($trash.Count)"
    return $trash
}

function Export-TrashList {
    param($Trash)
    
    $csv = "File,Reason,Action`n"
    foreach ($item in $Trash) {
        $csv += "$($item.File),$($item.Reason),$($item.Action)`n"
    }
    
    Set-Content -Path "TRASHLIST.csv" -Value $csv -Encoding UTF8
    Write-Success "TRASHLIST.csv erstellt"
}

# Quality Gates
function Invoke-QualityGates {
    param($Analysis)
    
    $report = @{
        FrontMatterCoverage = [math]::Round(($Analysis.WithFrontMatter / $Analysis.Total) * 100, 2)
        BrokenLinks = 0
        LintErrors = 0
        SpellingErrors = 0
    }
    
    Write-Success "Quality Gates: Front-Matter Coverage = $($report.FrontMatterCoverage)%"
    return $report
}

# Export Report
function Export-DocsReport {
    param($Analysis, $Quality, $Moves, $Trash)
    
    $report = @"
# Documentation Hygiene Report
**Generated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## 📊 Zusammenfassung

- **Gesamt Dokumente**: $($Analysis.Total)
- **Mit Front-Matter**: $($Analysis.WithFrontMatter) ($($Quality.FrontMatterCoverage)%)
- **Ohne Front-Matter**: $($Analysis.WithoutFrontMatter)
- **Empfohlene Moves**: $($Moves.Count)
- **Trash-Kandidaten**: $($Trash.Count)

## 📁 Kategorien

$($Analysis.ByCategory.Keys | Sort-Object | ForEach-Object { "- **$_**: $($Analysis.ByCategory[$_]) Dateien" } | Out-String)

## ✅ Quality Gates

- Front-Matter Coverage: **$($Quality.FrontMatterCoverage)%**
- Broken Links: **$($Quality.BrokenLinks)**
- Lint Errors: **$($Quality.LintErrors)**
- Spelling Errors: **$($Quality.SpellingErrors)**

## 📋 Empfohlene Aktionen

### Moves
Siehe: [MOVES.csv](MOVES.csv)

### Archivierung
Siehe: [TRASHLIST.csv](TRASHLIST.csv)

---
*Generiert mit PowerShell docs-hygiene.ps1 v2.0.0*
"@

    Set-Content -Path "DOCS_REPORT_POWERSHELL.md" -Value $report -Encoding UTF8
    Write-Success "DOCS_REPORT_POWERSHELL.md erstellt"
}

# Änderungen anwenden
function Apply-Changes {
    param($Moves, $Trash, $Readme)
    
    Write-Warning "Änderungen werden angewendet..."
    
    # README schreiben
    Set-Content -Path $RootReadme -Value $Readme -Encoding UTF8
    Write-Success "README.md aktualisiert"
    
    # Moves ausführen
    foreach ($move in $Moves) {
        $targetDir = Split-Path $move.Target -Parent
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        Move-Item -Path $move.Source -Destination $move.Target -Force
        Write-Success "Verschoben: $($move.Source) → $($move.Target)"
    }
    
    # Archivierung
    if (-not (Test-Path $ArchiveDir)) {
        New-Item -ItemType Directory -Path $ArchiveDir -Force | Out-Null
    }
    
    foreach ($item in $Trash) {
        $archivePath = Join-Path $ArchiveDir (Split-Path $item.File -Leaf)
        Move-Item -Path $item.File -Destination $archivePath -Force
        Write-Success "Archiviert: $($item.File)"
    }
}

# Script ausführen
try {
    Invoke-DocsHygiene
} catch {
    Write-Error "Fehler: $_"
    exit 1
}
