#!/usr/bin/env pwsh
<#
.SYNOPSIS
    PowerShell Setup & Verification für Menschlichkeit Österreich Codespace
.DESCRIPTION
    Installiert PowerShell-Module, konfiguriert Profile und verifiziert die Umgebung
    Läuft mit Fehlertoleranz - scheitert nicht bei einzelnen Modulen
.NOTES
    Author: Menschlichkeit Österreich DevOps Team
    Date: 2025-01-10
    Updated: 2025-10-12 - Added timeout protection and error handling
#>

# Set error action to continue (don't stop on errors)
$ErrorActionPreference = 'Continue'

Write-Host "🚀 PowerShell Setup für Menschlichkeit Österreich" -ForegroundColor Cyan
Write-Host "=" * 60

# 1. Prüfe PowerShell Version
Write-Host "`n📋 PowerShell Version:" -ForegroundColor Yellow
try {
    $PSVersionTable.PSVersion | Format-Table
} catch {
    Write-Host "  ⚠️ Could not display PowerShell version" -ForegroundColor Yellow
}

# 2. Installiere nützliche Module (mit Timeout-Schutz)
Write-Host "`n📦 Installiere PowerShell-Module (optional)..." -ForegroundColor Yellow

$modules = @(
    'PSReadLine',           # Verbesserte Kommandozeilen-Erfahrung
    'posh-git',             # Git-Integration
    'Terminal-Icons',       # File Icons im Terminal
    'PSScriptAnalyzer'      # PowerShell Linting
)

foreach ($module in $modules) {
    try {
        if (!(Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue)) {
            Write-Host "  ⏳ Installiere $module (timeout: 30s)..." -ForegroundColor Gray
            
            # Use timeout with job to prevent hanging
            $job = Start-Job -ScriptBlock {
                param($moduleName)
                Install-Module -Name $moduleName -Force -Scope CurrentUser -SkipPublisherCheck -ErrorAction Stop
            } -ArgumentList $module
            
            $completed = Wait-Job -Job $job -Timeout 30
            
            if ($completed) {
                Receive-Job -Job $job
                Write-Host "  ✅ $module installiert" -ForegroundColor Green
            } else {
                Write-Host "  ⏭️  $module übersprungen (Timeout)" -ForegroundColor Yellow
                Stop-Job -Job $job
            }
            Remove-Job -Job $job -Force
        } else {
            Write-Host "  ⏭️  $module bereits installiert" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ⚠️ $module Installation fehlgeschlagen: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "     Fahre fort ohne $module" -ForegroundColor Gray
    }
}

# 3. Erstelle PowerShell-Profil
Write-Host "`n⚙️  Konfiguriere PowerShell-Profil..." -ForegroundColor Yellow

try {
    $profileDir = Split-Path -Parent $PROFILE
    if (!(Test-Path $profileDir)) {
        New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    }

    $profileContent = @'
# Menschlichkeit Österreich PowerShell Profil
# Generiert am: {0}

# PSReadLine Konfiguration (nur wenn verfügbar)
if (Get-Module -ListAvailable -Name PSReadLine) {{
    Import-Module PSReadLine -ErrorAction SilentlyContinue
    Set-PSReadLineOption -PredictionSource History -ErrorAction SilentlyContinue
    Set-PSReadLineOption -EditMode Emacs -ErrorAction SilentlyContinue
    Set-PSReadLineKeyHandler -Key Tab -Function Complete -ErrorAction SilentlyContinue
    Set-PSReadLineOption -HistorySearchCursorMovesToEnd -ErrorAction SilentlyContinue
    Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward -ErrorAction SilentlyContinue
    Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward -ErrorAction SilentlyContinue
}}

# Git Integration (nur wenn verfügbar)
if (Get-Module -ListAvailable -Name posh-git) {{
    Import-Module posh-git -ErrorAction SilentlyContinue
}}

# Terminal Icons (nur wenn verfügbar)
if (Get-Module -ListAvailable -Name Terminal-Icons) {{
    Import-Module Terminal-Icons -ErrorAction SilentlyContinue
}}

# Nützliche Aliase
Set-Alias -Name g -Value git -ErrorAction SilentlyContinue
Set-Alias -Name k -Value kubectl -ErrorAction SilentlyContinue
Set-Alias -Name d -Value docker -ErrorAction SilentlyContinue
Set-Alias -Name dc -Value docker-compose -ErrorAction SilentlyContinue

# Projekt-spezifische Funktionen
function Start-AllServices {{
    Write-Host "🚀 Starte alle Services..." -ForegroundColor Cyan
    npm run dev:all
}}
Set-Alias -Name devall -Value Start-AllServices

function Start-QualityGates {{
    Write-Host "🔍 Führe Quality Gates aus..." -ForegroundColor Cyan
    npm run quality:gates
}}
Set-Alias -Name quality -Value Start-QualityGates

function Start-SecurityScan {{
    Write-Host "🛡️ Führe Security Scan aus..." -ForegroundColor Cyan
    npm run security:scan
}}
Set-Alias -Name security -Value Start-SecurityScan

# Custom Prompt
function prompt {{
    $path = (Get-Location).Path.Replace($HOME, "~")
    $branch = ""
    
    if (Get-Command git -ErrorAction SilentlyContinue) {{
        $gitBranch = git branch --show-current 2>$null
        if ($gitBranch) {{
            $branch = " [$gitBranch]"
        }}
    }}
    
    Write-Host "🇦🇹 " -NoNewline -ForegroundColor Red
    Write-Host "$path" -NoNewline -ForegroundColor Blue
    Write-Host "$branch" -NoNewline -ForegroundColor Green
    return "> "
}}

Write-Host "✅ Menschlichkeit Österreich PowerShell-Umgebung geladen" -ForegroundColor Green
'@ -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss")

    Set-Content -Path $PROFILE -Value $profileContent -Force
    Write-Host "  ✅ Profil erstellt: $PROFILE" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ Profil konnte nicht erstellt werden: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. Verifiziere Installation
Write-Host "`n✅ Installations-Verifikation:" -ForegroundColor Yellow

# Prüfe verfügbare Commands
$commands = @('git', 'docker', 'npm', 'node', 'python3', 'php', 'pwsh')
foreach ($cmd in $commands) {
    try {
        $exists = Get-Command $cmd -ErrorAction SilentlyContinue
        if ($exists) {
            Write-Host "  ✅ $cmd : verfügbar" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $cmd : NICHT gefunden" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ⚠️ $cmd : Prüfung fehlgeschlagen" -ForegroundColor Yellow
    }
}

# 5. Erstelle nützliche PowerShell-Scripts
Write-Host "`n📝 Erstelle Projekt-Scripts..." -ForegroundColor Yellow

try {
    $scriptsDir = Join-Path $PWD "scripts/powershell"
    if (!(Test-Path $scriptsDir)) {
        New-Item -ItemType Directory -Path $scriptsDir -Force | Out-Null
    }

    # Git Helper Script
    $gitHelperContent = @'
<#
.SYNOPSIS
    Git-Workflow-Helfer für Menschlichkeit Österreich
#>

function New-FeatureBranch {
    param(
        [Parameter(Mandatory=$true)]
        [string]$IssueNumber,
        
        [Parameter(Mandatory=$true)]
        [string]$Description
    )
    
    $branchName = "feature/$IssueNumber-$Description"
    git checkout -b $branchName
    Write-Host "✅ Branch erstellt: $branchName" -ForegroundColor Green
}

function Invoke-QualityCheck {
    Write-Host "🔍 Führe Quality Gates aus..." -ForegroundColor Cyan
    npm run quality:gates
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Alle Quality Gates bestanden!" -ForegroundColor Green
    } else {
        Write-Host "❌ Quality Gates fehlgeschlagen!" -ForegroundColor Red
        exit 1
    }
}

function Invoke-SafeCommit {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    
    # Pre-commit checks
    Write-Host "🔍 Pre-commit checks..." -ForegroundColor Yellow
    Invoke-QualityCheck
    
    if ($LASTEXITCODE -eq 0) {
        git add .
        git commit -m $Message
        Write-Host "✅ Commit erfolgreich!" -ForegroundColor Green
    }
}

Export-ModuleMember -Function New-FeatureBranch, Invoke-QualityCheck, Invoke-SafeCommit
'@

    Set-Content -Path (Join-Path $scriptsDir "GitHelper.psm1") -Value $gitHelperContent -ErrorAction Stop
    Write-Host "  ✅ GitHelper.psm1 erstellt" -ForegroundColor Green

    # Deployment Helper Script
    $deployHelperContent = @'
<#
.SYNOPSIS
    Deployment-Helfer für Menschlichkeit Österreich
#>

function Start-StagingDeployment {
    param(
        [switch]$SkipTests
    )
    
    Write-Host "🚀 Starte Staging Deployment..." -ForegroundColor Cyan
    
    $args = @("staging")
    if ($SkipTests) {
        $args += "--skip-tests"
    }
    
    & ./build-pipeline.sh @args
}

function Start-ProductionDeployment {
    Write-Host "🚀 Starte Production Deployment..." -ForegroundColor Cyan
    Write-Host "⚠️  ACHTUNG: Production Deployment!" -ForegroundColor Yellow
    
    $confirmation = Read-Host "Fortfahren? (yes/no)"
    if ($confirmation -eq "yes") {
        & ./build-pipeline.sh production
    } else {
        Write-Host "❌ Deployment abgebrochen" -ForegroundColor Red
    }
}

function Invoke-Rollback {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Version
    )
    
    Write-Host "⏮️  Führe Rollback aus..." -ForegroundColor Yellow
    & ./deployment-scripts/rollback.sh $Version
}

Export-ModuleMember -Function Start-StagingDeployment, Start-ProductionDeployment, Invoke-Rollback
'@

    Set-Content -Path (Join-Path $scriptsDir "DeploymentHelper.psm1") -Value $deployHelperContent -ErrorAction Stop
    Write-Host "  ✅ DeploymentHelper.psm1 erstellt" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ Script-Erstellung fehlgeschlagen: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 6. Erstelle README für PowerShell-Nutzung
try {
    $readmeContent = @'
# PowerShell in Menschlichkeit Österreich Codespace

## 🚀 Quick Start

```powershell
# PowerShell starten
pwsh

# Hilfe anzeigen
Get-Help

# Verfügbare Module
Get-Module -ListAvailable
```

## 📦 Installierte Module

- **PSReadLine** - Verbesserte Kommandozeile mit Syntax-Highlighting (optional)
- **posh-git** - Git-Integration im Prompt (optional)
- **Terminal-Icons** - Datei-Icons (optional)
- **PSScriptAnalyzer** - Linting für PowerShell-Scripts (optional)

**Note:** Module werden während des Setups versucht zu installieren, aber das Setup schlägt nicht fehl wenn sie nicht verfügbar sind.

## 🛠️ Projekt-spezifische Funktionen

```powershell
# Alle Services starten
devall

# Quality Gates ausführen
quality

# Security Scan
security
```

## 📚 Git-Workflow (PowerShell)

```powershell
# Module importieren
Import-Module ./scripts/powershell/GitHelper.psm1

# Neuen Feature Branch
New-FeatureBranch -IssueNumber "123" -Description "awesome-feature"

# Safe Commit (mit Quality Checks)
Invoke-SafeCommit -Message "feat: add awesome feature"
```

## 🚀 Deployment (PowerShell)

```powershell
# Module importieren
Import-Module ./scripts/powershell/DeploymentHelper.psm1

# Staging Deployment
Start-StagingDeployment

# Production Deployment
Start-ProductionDeployment

# Rollback
Invoke-Rollback -Version "v1.2.3"
```

## 🔧 Konfiguration

**Profil-Location:** `~/.config/powershell/Microsoft.PowerShell_profile.ps1`

**Script-Verzeichnis:** `scripts/powershell/`

## 📖 Ressourcen

- [PowerShell Dokumentation](https://learn.microsoft.com/powershell/)
- [PSReadLine](https://github.com/PowerShell/PSReadLine)
- [posh-git](https://github.com/dahlbyk/posh-git)

## ⚠️ Troubleshooting

If PowerShell modules fail to install:
1. The setup will continue - modules are optional
2. You can manually install later: `Install-Module -Name <module> -Scope CurrentUser`
3. Basic PowerShell functionality works without the modules
'@

    Set-Content -Path (Join-Path $PWD ".devcontainer/POWERSHELL.md") -Value $readmeContent -ErrorAction Stop
    Write-Host "  ✅ POWERSHELL.md erstellt" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ README konnte nicht erstellt werden: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Finale Zusammenfassung
Write-Host "`n" + ("=" * 60)
Write-Host "✅ PowerShell Setup abgeschlossen!" -ForegroundColor Green
Write-Host "=" * 60
Write-Host "`n📝 Hinweise:" -ForegroundColor Cyan
Write-Host "  - PowerShell-Module sind optional und beeinträchtigen nicht die Hauptfunktionalität" -ForegroundColor White
Write-Host "  - Bei Problemen: Setup läuft im Hintergrund und stoppt Codespace nicht" -ForegroundColor White
Write-Host "  - Dokumentation: '.devcontainer/POWERSHELL.md'" -ForegroundColor White
Write-Host "`n🎯 Viel Erfolg mit PowerShell! 🇦🇹" -ForegroundColor Green

# Exit with success even if some steps failed
exit 0
