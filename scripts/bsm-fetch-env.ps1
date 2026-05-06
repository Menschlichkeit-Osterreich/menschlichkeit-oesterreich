# Bitwarden Secrets Manager → .env Generator
# Ersetzt secrets-decrypt.ps1 (SOPS-basiert)
#
# Verwendung:
#   .\scripts\bsm-fetch-env.ps1 -Environment development -Service all -OutputFile .env
#   .\scripts\bsm-fetch-env.ps1 -Environment production -Service api -OutputFile apps/api/.env
#   .\scripts\bsm-fetch-env.ps1 -Environment development -Service website -OutputFile apps/website/.env.local

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development",

    [Parameter(Mandatory = $false)]
    [ValidateSet("api", "website", "n8n", "infra", "shared", "all")]
    [string]$Service = "all",

    [Parameter(Mandatory = $false)]
    [string]$OutputFile = ".env",

    [Parameter(Mandatory = $false)]
    [string]$TokenFile = $env:BW_TOKEN_FILE,

    [Parameter(Mandatory = $false)]
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

$wingetLinks = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links"
if ((Test-Path $wingetLinks) -and ($env:Path -notlike "*$wingetLinks*")) {
    $env:Path += ";$wingetLinks"
}

. (Join-Path $PSScriptRoot "bitwarden-common.ps1")

# ── Voraussetzungen pruefen ─────────────────────────────────

$null = Resolve-BitwardenAccessToken -TokenFile $TokenFile -ExportToProcess

if (-not $env:BSM_ACCESS_TOKEN) {
    Write-Host "[ERROR] BSM_ACCESS_TOKEN ist nicht gesetzt." -ForegroundColor Red
    Write-Host "Setze BSM_ACCESS_TOKEN/BW_ACCESS_TOKEN oder verweise mit BW_TOKEN_FILE auf deine gitignored Token-Datei." -ForegroundColor Yellow
    exit 1
}

# ── Konfiguration ───────────────────────────────────────────

$scopeLabel = if ($env:BSM_PROJECT_NAME) { $env:BSM_PROJECT_NAME } else { $Environment }
$bsmApiUrl = if ($env:BSM_API_URL) { $env:BSM_API_URL } else { "https://api.bitwarden.eu" }
$bsmIdentityUrl = if ($env:BSM_IDENTITY_URL) { $env:BSM_IDENTITY_URL } else { "https://identity.bitwarden.eu" }

Write-Host "[INFO] BSM Secrets laden: Scope=$scopeLabel, Service=$Service" -ForegroundColor Green

# ── Secrets laden ───────────────────────────────────────────

$secretsJson = Invoke-BwsCommand -Arguments @("secret", "list", "--output", "json") -TokenFile $TokenFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] bws secret list fehlgeschlagen: $secretsJson" -ForegroundColor Red
    exit 1
}

$secrets = $secretsJson | ConvertFrom-Json

# Nach Service filtern (BSM-Key Format: service/SECRET_NAME)
if ($Service -ne "all") {
    $secrets = $secrets | Where-Object {
        $_.key -like "$Service/*" -or $_.key -like "shared/*"
    }
}

if ($secrets.Count -eq 0) {
    Write-Host "[WARN] Keine Secrets fuer Service=$Service in $projectName gefunden." -ForegroundColor Yellow
    exit 0
}

Write-Host "[INFO] $($secrets.Count) Secrets geladen." -ForegroundColor Green

# ── .env-Datei generieren ───────────────────────────────────

$envLines = @(
    "# Generiert von bsm-fetch-env.ps1"
    "# Umgebung: $Environment | Service: $Service"
    "# Zeitpunkt: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    "# Quelle: Bitwarden Secrets Manager — Projekt $projectName"
    "# ACHTUNG: Diese Datei enthaelt Secrets — nie committen!"
    ""
)

foreach ($secret in $secrets) {
    # BSM-Key ist z.B. "api/DATABASE_URL" → env_var = "DATABASE_URL"
    $envVarName = $secret.key -replace "^[^/]+/", ""
    $envLines += "$envVarName=$($secret.value)"
}

if ($DryRun) {
    Write-Host "`n[DRY-RUN] Folgende .env wuerde geschrieben:" -ForegroundColor Yellow
    $envLines | ForEach-Object {
        if ($_ -match "^[A-Z]") {
            $keyOnly = ($_ -split "=")[0]
            Write-Host "  $keyOnly=***" -ForegroundColor Gray
        }
        else {
            Write-Host "  $_" -ForegroundColor Gray
        }
    }
}
else {
    $envContent = $envLines -join "`n"
    [System.IO.File]::WriteAllText(
        (Resolve-Path -Path "." | Join-Path -ChildPath $OutputFile),
        $envContent,
        [System.Text.Encoding]::UTF8
    )
    Write-Host "[OK] .env geschrieben: $OutputFile ($($secrets.Count) Secrets)" -ForegroundColor Green
}

Write-Host "[INFO] Fertig." -ForegroundColor Green
