#!/usr/bin/env pwsh
# Lightweight workspace bootstrap aligned with service-specific env templates.

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

$copies = @(
    @{ Source = ".env.example"; Destination = ".env" },
    @{ Source = "apps/api/.env.example"; Destination = "apps/api/.env" },
    @{ Source = "apps/website/.env.example"; Destination = "apps/website/.env.local" },
    @{ Source = "automation/n8n/.env.example"; Destination = "automation/n8n/.env" },
    @{ Source = ".env.test.example"; Destination = ".env.test.local" }
)

foreach ($copy in $copies) {
    if ((Test-Path $copy.Source) -and -not (Test-Path $copy.Destination)) {
        Copy-Item $copy.Source $copy.Destination
        Write-Host "Erstellt: $($copy.Destination)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Workspace vorbereitet. Bitte die lokalen Env-Dateien mit echten Werten fuellen." -ForegroundColor Cyan
