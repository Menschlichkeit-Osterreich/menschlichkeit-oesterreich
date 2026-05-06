#!/usr/bin/env pwsh
# Setup current env files for the active monorepo structure.

param(
    [switch]$All,
    [switch]$API,
    [switch]$Frontend,
    [switch]$Automation,
    [switch]$Tests,
    [switch]$Help
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

function Show-Help {
    Write-Host "Environment Setup fuer Menschlichkeit Oesterreich" -ForegroundColor Cyan
    Write-Host "  -All         Root, API, Frontend, Automation und Test-Env anlegen"
    Write-Host "  -API         apps/api/.env anlegen"
    Write-Host "  -Frontend    apps/website/.env.local anlegen"
    Write-Host "  -Automation  automation/n8n/.env anlegen"
    Write-Host "  -Tests       .env.test.local anlegen"
}

function Copy-TemplateIfMissing {
    param(
        [string]$Source,
        [string]$Destination
    )

    if (-not (Test-Path $Source)) {
        Write-Warning "Template fehlt: $Source"
        return
    }

    if (Test-Path $Destination) {
        Write-Host "Bereits vorhanden: $Destination" -ForegroundColor Green
        return
    }

    Copy-Item $Source $Destination
    Write-Host "Erstellt: $Destination" -ForegroundColor Green
}

if ($Help) {
    Show-Help
    exit 0
}

$RunAll = $All -or (-not ($API -or $Frontend -or $Automation -or $Tests))

Write-Host "Konfiguriere Env-Dateien..." -ForegroundColor Cyan
Copy-TemplateIfMissing ".env.example" ".env"

if ($RunAll -or $API) {
    Copy-TemplateIfMissing "apps/api/.env.example" "apps/api/.env"
}

if ($RunAll -or $Frontend) {
    Copy-TemplateIfMissing "apps/website/.env.example" "apps/website/.env.local"
}

if ($RunAll -or $Automation) {
    Copy-TemplateIfMissing "automation/n8n/.env.example" "automation/n8n/.env"
}

if ($RunAll -or $Tests) {
    Copy-TemplateIfMissing ".env.test.example" ".env.test.local"
}

Write-Host ""
Write-Host "Weiter mit:" -ForegroundColor Yellow
Write-Host "  apps/api/.env fuer API-Laufzeitwerte"
Write-Host "  apps/website/.env.local fuer Vite-Werte"
Write-Host "  automation/n8n/.env fuer n8n"
Write-Host "  .env.test.local fuer lokale Test-Credentials"
Write-Host ""
Write-Host "Bitwarden BSM (falls konfiguriert):" -ForegroundColor Cyan
Write-Host "  .\scripts\bsm-fetch-env.ps1 -Environment development -Service api -OutputFile apps/api/.env"
Write-Host "  .\scripts\bsm-fetch-env.ps1 -Environment development -Service website -OutputFile apps/website/.env.local"
