# Bitwarden Secrets Manager → .env Generator
# Ersetzt secrets-decrypt.ps1 (SOPS-basiert)
#
# Verwendung:
#   .\scripts\bsm-fetch-env.ps1 -Environment development -Service all -OutputFile .env
#   .\scripts\bsm-fetch-env.ps1 -Environment production -Service api -OutputFile apps/api/.env

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development",

    [Parameter(Mandatory = $false)]
    [ValidateSet("api", "n8n", "openclaw", "infra", "shared", "all")]
    [string]$Service = "all",

    [Parameter(Mandatory = $false)]
    [string]$OutputFile = ".env",

    [Parameter(Mandatory = $false)]
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

# ── Voraussetzungen pruefen ─────────────────────────────────

if (-not $env:BSM_ACCESS_TOKEN) {
    Write-Host "[ERROR] BSM_ACCESS_TOKEN ist nicht gesetzt." -ForegroundColor Red
    Write-Host "Setze BSM_ACCESS_TOKEN in deinem Shell-Profil oder:" -ForegroundColor Yellow
    Write-Host '  $env:BSM_ACCESS_TOKEN = "dein-access-token"' -ForegroundColor Yellow
    exit 1
}

if (-not (Get-Command bws -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] bws CLI nicht gefunden." -ForegroundColor Red
    Write-Host "Installation: choco install bws" -ForegroundColor Yellow
    Write-Host "Oder: https://github.com/bitwarden/sdk-sm/releases" -ForegroundColor Yellow
    exit 1
}

# ── Konfiguration ───────────────────────────────────────────

$projectMap = @{
    "development" = "moe-development"
    "staging"     = "moe-staging"
    "production"  = "moe-production"
}

$projectName = $projectMap[$Environment]
$bsmApiUrl = if ($env:BSM_API_URL) { $env:BSM_API_URL } else { "https://api.bitwarden.eu" }
$bsmIdentityUrl = if ($env:BSM_IDENTITY_URL) { $env:BSM_IDENTITY_URL } else { "https://identity.bitwarden.eu" }

Write-Host "[INFO] BSM Secrets laden: Projekt=$projectName, Service=$Service" -ForegroundColor Green

# ── Projekt-ID ermitteln ────────────────────────────────────

$bwsEnv = @{
    BWS_ACCESS_TOKEN = $env:BSM_ACCESS_TOKEN
}

$projectsJson = & bws project list --output json 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] bws project list fehlgeschlagen: $projectsJson" -ForegroundColor Red
    exit 1
}

$projects = $projectsJson | ConvertFrom-Json
$targetProject = $projects | Where-Object { $_.name -eq $projectName }

if (-not $targetProject) {
    Write-Host "[ERROR] BSM-Projekt '$projectName' nicht gefunden." -ForegroundColor Red
    Write-Host "Verfuegbare Projekte:" -ForegroundColor Yellow
    $projects | ForEach-Object { Write-Host "  - $($_.name)" -ForegroundColor Yellow }
    exit 1
}

$projectId = $targetProject.id
Write-Host "[INFO] Projekt gefunden: $projectName (ID: $projectId)" -ForegroundColor Green

# ── Secrets laden ───────────────────────────────────────────

$secretsJson = & bws secret list "$projectId" --output json 2>&1
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
