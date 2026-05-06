<#
.SYNOPSIS
    Deprecated wrapper for the Python env/template validator.

.DESCRIPTION
    This script keeps the old entrypoint alive, but delegates all logic to
    scripts/validate-secrets.py so there is one central source of truth.
#>

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

Write-Warning "Test-SecretValidation.ps1 ist veraltet. Verwende die zentrale Python-Validierung."
Write-Host "Starte: python scripts/validate-secrets.py --mode suite" -ForegroundColor Cyan

Set-Location $repoRoot
python scripts/validate-secrets.py --mode suite
exit $LASTEXITCODE
