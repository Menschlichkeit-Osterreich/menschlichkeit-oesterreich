#Requires -Version 7.0
<#
.SYNOPSIS
    Synchronisiert Bitwarden Secrets zu .env Datei

.DESCRIPTION
    PowerShell-Wrapper für Python-basierte Bitwarden Secret-Synchronisation
    Nutzt die Bitwarden Python SDK (bereits installiert)

.PARAMETER DryRun
    Zeigt Änderungen ohne diese zu schreiben (empfohlen beim ersten Lauf)

.PARAMETER StripeMode
    Stripe-Umgebung: 'test' oder 'live' (default: 'test')

.PARAMETER AccessToken
    Bitwarden API Access Token (optional, sonst aus $env:BWS_ACCESS_TOKEN)

.PARAMETER OrganizationId
    Bitwarden Organization ID (optional, sonst aus $env:BWS_ORGANIZATION_ID)

.EXAMPLE
    # Test ohne Änderungen
    .\Sync-BitwardenSecrets.ps1 -DryRun

    # Echte Synchronisation
    .\Sync-BitwardenSecrets.ps1

    # Mit Credentials als Parameter
    .\Sync-BitwardenSecrets.ps1 -AccessToken "my_token" -OrganizationId "my_org_id"
#>

param(
    [switch]$DryRun = $false,
    [ValidateSet('test', 'live')]
    [string]$StripeMode = 'test',
    [string]$AccessToken,
    [string]$OrganizationId
)

$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
. (Join-Path $scriptRoot 'bitwarden-common.ps1')

function Resolve-PythonCommand {
    $venvPython = Join-Path $repoRoot '.venv\Scripts\python.exe'
    if (Test-Path $venvPython) {
        return $venvPython
    }

    $globalPython = Get-Command python -ErrorAction SilentlyContinue
    if ($globalPython) {
        return $globalPython.Source
    }

    throw 'Python nicht gefunden (weder .venv noch globaler PATH).'
}

# Verifiziere dass Python verfügbar ist
try {
    $pythonCommand = Resolve-PythonCommand
    $pythonVersion = & $pythonCommand --version 2>&1
    Write-Host "✓ Python verfügbar: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verifiziere dass Bitwarden Python SDK verfügbar ist
try {
    & $pythonCommand -c "from bitwarden_sdk import BitwardenClient, client_settings_from_dict" 2>$null
    Write-Host "✓ Bitwarden Python SDK verfügbar" -ForegroundColor Green
}
catch {
    Write-Host "✗ Bitwarden Python SDK nicht installiert" -ForegroundColor Red
    Write-Host "  Installiere mit: pip install bitwarden-sdk" -ForegroundColor Yellow
    exit 1
}

# Setze Umgebungsvariablen wenn Parameter übergeben
if ($AccessToken) {
    $env:BWS_ACCESS_TOKEN = $AccessToken
}
else {
    $resolvedToken = Resolve-BitwardenAccessToken -TokenFile $env:BW_TOKEN_FILE -ExportToProcess -Quiet
    if ($resolvedToken) {
        $env:BWS_ACCESS_TOKEN = $resolvedToken
    }
}

if ($OrganizationId) {
    $env:BWS_ORGANIZATION_ID = $OrganizationId
}
else {
    $resolvedOrganization = Resolve-BitwardenOrganizationId -TokenFile $env:BW_TOKEN_FILE -ExportToProcess
    if ($resolvedOrganization) {
        $env:BWS_ORGANIZATION_ID = $resolvedOrganization
    }
}

# Verifiziere dass Credentials gesetzt sind
if (-not $env:BWS_ACCESS_TOKEN -or -not $env:BWS_ORGANIZATION_ID) {
    Write-Host "✗ Bitwarden Credentials nicht gesetzt" -ForegroundColor Red
    Write-Host ""
    Write-Host "Setze folgende Umgebungsvariablen:" -ForegroundColor Yellow
    Write-Host "  `$env:BWS_ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'" -ForegroundColor Green
    Write-Host "  `$env:BWS_ORGANIZATION_ID = 'YOUR_ORGANIZATION_ID'" -ForegroundColor Green
    Write-Host ""
    Write-Host "Alternativ: lege eine gitignored Token-Datei in .local-secrets\bitwarden.env an und setze optional BSM_ORGANIZATION_ID." -ForegroundColor Cyan
    exit 1
}

# Konstruiere Python-Skript-Pfad
$pythonScript = Join-Path $scriptRoot 'sync-secrets-from-bw.py'

if (-not (Test-Path $pythonScript)) {
    Write-Host "✗ Python-Skript nicht gefunden: $pythonScript" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Python-Skript gefunden" -ForegroundColor Green
Write-Host ""

# Baue Python-Befehl
$pythonArgs = @(
    $pythonScript,
    "--mode", $StripeMode
)

if ($DryRun) {
    $pythonArgs += "--dry-run"
    Write-Host "🔍 DRY-RUN MODE (keine echten Änderungen)" -ForegroundColor Yellow
}
else {
    Write-Host "⚠️  ECHTE SYNCHRONISATION (Änderungen werden geschrieben)" -ForegroundColor Yellow
}

Write-Host ""

try {
    # Führe Python-Skript aus
    & $pythonCommand @pythonArgs

    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "✗ Synchronisation fehlgeschlagen (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
        exit $LASTEXITCODE
    }

    Write-Host ""
    if ($DryRun) {
        Write-Host "✓ Dry-Run erfolgreich abgeschlossen" -ForegroundColor Green
        Write-Host "  Wenn dies korrekt aussieht, führe ohne -DryRun Schalter aus" -ForegroundColor Cyan
    }
    else {
        Write-Host "✓ Synchronisation erfolgreich abgeschlossen" -ForegroundColor Green
        Write-Host "  Secrets wurden in .env aktualisiert" -ForegroundColor Cyan
    }
}
catch {
    Write-Host ""
    Write-Host "✗ Fehler bei Synchronisation:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
