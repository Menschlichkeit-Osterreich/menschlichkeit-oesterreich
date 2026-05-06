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
