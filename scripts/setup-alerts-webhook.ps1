#!/usr/bin/env pwsh
<#
    .DESCRIPTION
    Retrieve ALERTS_SLACK_WEBHOOK from Bitwarden Secrets Manager and configure it
    in the API .env file for alert testing. No secrets are logged to output.
#>

param(
    [Parameter(Mandatory = $false)]
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

. (Join-Path $PSScriptRoot "bitwarden-common.ps1")

function Write-Info { param([string]$Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Ok { param([string]$Message) Write-Host "[OK]   $Message" -ForegroundColor Green }
function Write-WarnLine { param([string]$Message) Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Write-Fail { param([string]$Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

# Resolve BSM token
$null = Resolve-BitwardenAccessToken -TokenFile $env:BW_TOKEN_FILE -ExportToProcess -Quiet

# Function to retrieve secret from BSM
function Get-AlertsWebhook {
    if (-not $env:BSM_ACCESS_TOKEN) {
        Write-Fail "BSM_ACCESS_TOKEN nicht gesetzt – Bitwarden-Zugriff nicht möglich."
        return $null
    }

    try {
        $secretsRaw = Invoke-BwsCommand -Arguments @("secret", "list", "--output", "json") -TokenFile $env:BW_TOKEN_FILE -Quiet
        $secrets = $secretsRaw | ConvertFrom-Json
        
        $candidates = @(
            "ALERTS_SLACK_WEBHOOK",
            "alerts/SLACK_WEBHOOK",
            "slack/ALERTS_WEBHOOK",
            "SLACK_WEBHOOK"
        )
        
        foreach ($candidate in $candidates) {
            $secret = $secrets | Where-Object { $_.key -eq $candidate } | Select-Object -First 1
            if ($secret -and -not [string]::IsNullOrWhiteSpace($secret.value)) {
                Write-Info "Secret gefunden: $candidate"
                return $secret.value
            }
        }
        
        Write-WarnLine "ALERTS_SLACK_WEBHOOK nicht in Bitwarden gefunden (Kandidaten: $($candidates -join ', '))"
        return $null
    }
    catch {
        Write-Fail "BSM-Abfrage fehlgeschlagen: $($_.Exception.Message)"
        return $null
    }
}

# Retrieve the webhook
Write-Info "Hole ALERTS_SLACK_WEBHOOK aus Bitwarden..."
$webhookValue = Get-AlertsWebhook

if (-not $webhookValue) {
    Write-Fail "ALERTS_SLACK_WEBHOOK konnte nicht abgerufen werden. Bitte in Bitwarden prüfen."
    exit 1
}

# Set in API .env file
$apiEnvFile = "apps/api/.env"

if (-not (Test-Path $apiEnvFile)) {
    Write-Fail "$apiEnvFile existiert nicht."
    exit 1
}

$content = Get-Content $apiEnvFile -Raw

# Check if already set
if ($content -match "ALERTS_SLACK_WEBHOOK=") {
    if ($DryRun) {
        Write-Info "[DRY-RUN] ALERTS_SLACK_WEBHOOK ist bereits in $apiEnvFile gesetzt"
    }
    else {
        Write-Ok "ALERTS_SLACK_WEBHOOK ist bereits in $apiEnvFile gesetzt"
    }
}
else {
    if ($DryRun) {
        Write-Info "[DRY-RUN] ALERTS_SLACK_WEBHOOK würde zu $apiEnvFile hinzugefügt"
    }
    else {
        # Add to file (secret value not logged)
        $newLine = "ALERTS_SLACK_WEBHOOK=$webhookValue"
        $separator = if ($content -and -not $content.EndsWith("`n")) { "`r`n" } else { "" }
        $updated = "$content$separator$newLine`r`n"
        [System.IO.File]::WriteAllText((Join-Path $RepoRoot $apiEnvFile), $updated, [System.Text.Encoding]::UTF8)
        Write-Ok "ALERTS_SLACK_WEBHOOK in $apiEnvFile konfiguriert"
    }
}

Write-Host ""
Write-Ok "Phase B.2-B.3 abgeschlossen: ALERTS_SLACK_WEBHOOK bereit für API-Neustart"
