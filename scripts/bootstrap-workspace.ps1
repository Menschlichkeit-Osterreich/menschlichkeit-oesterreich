#!/usr/bin/env pwsh
<#!
.SYNOPSIS
  Bootstrappt den Workspace nach Repo-Best-Practice.
.DESCRIPTION
  Aktiviert Git-Hooks, validiert Governance/MCP und installiert optional empfohlene VS Code Extensions.
  Das Skript ist idempotent und kann beliebig oft ausgefuehrt werden.
#>

param(
    [switch]$InstallExtensions = $false,
    [switch]$SkipQuality = $false,
    [switch]$SkipApiTests = $false
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repoRoot

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Cyan
}

function Invoke-RepoCommand {
    param(
        [Parameter(Mandatory = $true)][string]$Command,
        [string[]]$Arguments = @()
    )

    Write-Host "> $Command $($Arguments -join ' ')" -ForegroundColor DarkGray
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed with exit code ${LASTEXITCODE}: $Command $($Arguments -join ' ')"
    }
}

Write-Step 'Git-Hooks aktivieren'
Invoke-RepoCommand -Command 'npm' -Arguments @('run', 'git:hooks:enable')

Write-Step 'Governance-Check ausfuehren'
Invoke-RepoCommand -Command 'npm' -Arguments @('run', 'governance:check')

Write-Step 'MCP-Basischecks ausfuehren'
Invoke-RepoCommand -Command 'npm' -Arguments @('run', 'mcp:check')
Invoke-RepoCommand -Command 'npm' -Arguments @('run', 'mcp:health')

if (-not $SkipApiTests) {
    Write-Step 'API-Schnelltest ausfuehren'
    Invoke-RepoCommand -Command 'npm' -Arguments @('run', 'test:api')
}

if (-not $SkipQuality) {
    Write-Step 'Governance-nahe Doku-Pruefung ausfuehren'
    Invoke-RepoCommand -Command 'npm' -Arguments @('run', 'docs:governance')
}

if ($InstallExtensions) {
    Write-Step 'Empfohlene VS Code Extensions installieren'
    Invoke-RepoCommand -Command 'pwsh' -Arguments @('-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/install-vscode-recommendations.ps1')
}

Write-Host ''
Write-Host 'Workspace-Bootstrap erfolgreich abgeschlossen.' -ForegroundColor Green
Write-Host 'Empfohlene naechste Schritte:' -ForegroundColor Green
Write-Host '  1) npm run dev:frontend' -ForegroundColor Green
Write-Host '  2) npm run dev:api' -ForegroundColor Green
Write-Host '  3) npm run quality:gates' -ForegroundColor Green
