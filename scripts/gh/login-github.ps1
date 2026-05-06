#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [string]$Repo = "Menschlichkeit-Osterreich/menschlichkeit-oesterreich",
    [switch]$SkipCleanup
)

$ErrorActionPreference = "Stop"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Remove-StaleGitHubCredential {
    param([string]$Target)
    $output = cmdkey /delete:$Target 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Credential entfernt: $Target"
    }
    else {
        Write-Info "Credential nicht vorhanden oder bereits entfernt: $Target"
    }
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI (gh) ist nicht installiert."
}

if (-not $SkipCleanup) {
    Write-Info "Bereinige alte GitHub-Credentials..."
    $targets = @(
        "git:https://github.com",
        "gh:github.com:",
        "gh:github.com:peschull"
    )

    foreach ($target in $targets) {
        Remove-StaleGitHubCredential -Target $target
    }

    gh auth logout --hostname github.com | Out-Null
}

Write-Info "Starte GitHub-Login im HTTPS-Modus. Browser-Bestaetigung kann erforderlich sein..."
gh auth login --hostname github.com --git-protocol https --web

Write-Info "Richte Git Credential Manager fuer gh ein..."
gh auth setup-git

Write-Info "Pruefe Repo-Zugriff..."
gh repo view $Repo | Out-Null
Write-Success "Repo-Zugriff erfolgreich: $Repo"

if (Test-Path ".git") {
    Write-Info "Pruefe Git-Push im Dry-Run..."
    git push --dry-run origin main
    Write-Success "Git-Push-Dry-Run erfolgreich."
}
