# Bitwarden Secrets Manager — Einmal-Migration von .env nach BSM
# Liest bestehende .env-Dateien und erstellt BSM-Secrets
#
# Verwendung:
#   .\scripts\bsm-seed.ps1 -Environment development
#   .\scripts\bsm-seed.ps1 -Environment development -DryRun
#
# Voraussetzungen:
#   1. BSM-Organisation und Projekt (moe-development/staging/production) existieren
#   2. BSM_ACCESS_TOKEN und BSM_ORGANIZATION_ID sind gesetzt
#   3. bws CLI ist installiert

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development",

    [Parameter(Mandatory = $false)]
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

# ── Voraussetzungen ─────────────────────────────────────────

if (-not $env:BSM_ACCESS_TOKEN) {
    Write-Host "[ERROR] BSM_ACCESS_TOKEN ist nicht gesetzt." -ForegroundColor Red
    exit 1
}

if (-not $env:BSM_ORGANIZATION_ID) {
    Write-Host "[ERROR] BSM_ORGANIZATION_ID ist nicht gesetzt." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command bws -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] bws CLI nicht gefunden." -ForegroundColor Red
    exit 1
}

# ── Konfiguration ───────────────────────────────────────────

$projectMap = @{
    "development" = "moe-development"
    "staging"     = "moe-staging"
    "production"  = "moe-production"
}
$projectName = $projectMap[$Environment]

# Service-spezifische .env-Dateien und deren BSM-Prefix
$envSources = @(
    @{ File = ".env";                                Prefix = "" },
    @{ File = "apps/api/.env";                       Prefix = "api" },
    @{ File = "automation/n8n/.env";                  Prefix = "n8n" },
    @{ File = "automation/openclaw/config/.env";      Prefix = "openclaw" }
)

# Mapping: env_var → bsm_key (aus secrets.manifest.json)
$manifestPath = Join-Path $PSScriptRoot ".." "secrets.manifest.json"
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$secretKeyMap = @{}
foreach ($secret in $manifest.secrets) {
    $secretKeyMap[$secret.env_var] = $secret.bsm_key
}

Write-Host "[INFO] BSM Seed: Umgebung=$Environment, Projekt=$projectName" -ForegroundColor Green
Write-Host "[INFO] Manifest geladen: $($manifest.secrets.Count) Secret-Definitionen" -ForegroundColor Green

# ── Projekt-ID ermitteln ────────────────────────────────────

$projectsJson = & bws project list --output json 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] bws project list fehlgeschlagen" -ForegroundColor Red
    exit 1
}

$projects = $projectsJson | ConvertFrom-Json
$targetProject = $projects | Where-Object { $_.name -eq $projectName }

if (-not $targetProject) {
    Write-Host "[ERROR] BSM-Projekt '$projectName' nicht gefunden." -ForegroundColor Red
    Write-Host "Erstelle es zuerst in der BSM-Web-Oberflaeche." -ForegroundColor Yellow
    exit 1
}

$projectId = $targetProject.id
Write-Host "[INFO] Projekt: $projectName (ID: $projectId)" -ForegroundColor Green

# ── .env-Dateien einlesen und Secrets erstellen ─────────────

$createdCount = 0
$skippedCount = 0
$errorCount = 0

foreach ($source in $envSources) {
    $envFile = Join-Path $PSScriptRoot ".." $source.File

    if (-not (Test-Path $envFile)) {
        Write-Host "[SKIP] Datei nicht gefunden: $($source.File)" -ForegroundColor Gray
        continue
    }

    Write-Host "`n[INFO] Lese: $($source.File)" -ForegroundColor Cyan

    $lines = Get-Content $envFile
    foreach ($line in $lines) {
        $line = $line.Trim()

        # Kommentare und leere Zeilen ueberspringen
        if ($line -eq "" -or $line.StartsWith("#")) { continue }

        # KEY=VALUE parsen
        if ($line -match "^([A-Za-z_][A-Za-z0-9_]*)=(.*)$") {
            $envVar = $Matches[1]
            $envValue = $Matches[2]

            # Placeholder-Werte ueberspringen
            if ($envValue -match "^(CHANGE_ME|PLACEHOLDER|sk_test_PLACEHOLDER|whsec_PLACEHOLDER)") {
                Write-Host "  [SKIP] $envVar (Placeholder-Wert)" -ForegroundColor Gray
                $skippedCount++
                continue
            }

            # Leere Werte ueberspringen
            if ([string]::IsNullOrWhiteSpace($envValue)) {
                Write-Host "  [SKIP] $envVar (leer)" -ForegroundColor Gray
                $skippedCount++
                continue
            }

            # BSM-Key bestimmen: Manifest-Mapping oder Prefix/ENV_VAR
            $bsmKey = $null
            if ($secretKeyMap.ContainsKey($envVar)) {
                $bsmKey = $secretKeyMap[$envVar]
            }
            elseif ($source.Prefix) {
                $bsmKey = "$($source.Prefix)/$envVar"
            }
            else {
                # Root .env: anhand des Prefixes zuordnen
                if ($envVar -like "OC_*") { $bsmKey = "openclaw/$envVar" }
                elseif ($envVar -like "GH_*" -or $envVar -like "GPG_*") { $bsmKey = "shared/$envVar" }
                elseif ($envVar -like "SSH_*" -or $envVar -like "PLESK_*") { $bsmKey = "infra/$envVar" }
                else { $bsmKey = "shared/$envVar" }
            }

            if ($DryRun) {
                Write-Host "  [DRY-RUN] Wuerde erstellen: $bsmKey" -ForegroundColor Yellow
                $createdCount++
            }
            else {
                try {
                    & bws secret create "$bsmKey" "$envValue" --project-id "$projectId" --output json 2>&1 | Out-Null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "  [OK] $bsmKey" -ForegroundColor Green
                        $createdCount++
                    }
                    else {
                        Write-Host "  [WARN] $bsmKey existiert bereits oder Fehler" -ForegroundColor Yellow
                        $skippedCount++
                    }
                }
                catch {
                    Write-Host "  [ERROR] $bsmKey — $($_.Exception.Message)" -ForegroundColor Red
                    $errorCount++
                }
            }
        }
    }
}

# ── Zusammenfassung ─────────────────────────────────────────

Write-Host "`n=== Zusammenfassung ===" -ForegroundColor Cyan
Write-Host "  Erstellt:     $createdCount" -ForegroundColor Green
Write-Host "  Uebersprungen: $skippedCount" -ForegroundColor Yellow
Write-Host "  Fehler:       $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })

if ($DryRun) {
    Write-Host "`n[DRY-RUN] Keine Aenderungen vorgenommen." -ForegroundColor Yellow
    Write-Host "Ohne --DryRun ausfuehren um Secrets zu erstellen." -ForegroundColor Yellow
}
else {
    Write-Host "`n[INFO] Seed abgeschlossen. Verifiziere mit:" -ForegroundColor Green
    Write-Host "  bws secret list $projectId --output json | jq '.[].key'" -ForegroundColor Gray
}
