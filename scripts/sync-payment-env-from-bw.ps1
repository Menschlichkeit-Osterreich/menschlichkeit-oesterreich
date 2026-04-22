#!/usr/bin/env pwsh
# Sync local payment env values from Bitwarden.
# Bevorzugt Bitwarden Secrets Manager (bws oder Docker-Fallback) und nutzt
# die Vault-CLI `bw` nur noch als Rueckfall, falls lokal bereits entsperrt.
#
# Example:
#   $env:BW_TOKEN_FILE = "$env:USERPROFILE\OneDrive - Menschlichkeit Österreich\Desktop\BW_ACCESS_TOKEN.txt"
#   .\scripts\sync-payment-env-from-bw.ps1 -Environment development -StripeMode test
#   .\scripts\sync-payment-env-from-bw.ps1 -Environment production -StripeMode live

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("test", "live")]
    [string]$StripeMode = "test",

    [Parameter(Mandatory = $false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development",

    [Parameter(Mandatory = $false)]
    [string]$WebsiteEnvFile = "apps/website/.env.local",

    [Parameter(Mandatory = $false)]
    [string]$ApiEnvFile = "apps/api/.env",

    [Parameter(Mandatory = $false)]
    [string]$TokenFile = $env:BW_TOKEN_FILE,

    [Parameter(Mandatory = $false)]
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

$wingetLinks = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links"
if ((Test-Path $wingetLinks) -and ($env:Path -notlike "*$wingetLinks*")) {
    $env:Path += ";$wingetLinks"
}

. (Join-Path $PSScriptRoot "bitwarden-common.ps1")

function Write-Info { param([string]$Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Ok { param([string]$Message) Write-Host "[OK]   $Message" -ForegroundColor Green }
function Write-WarnLine { param([string]$Message) Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Write-Fail { param([string]$Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

$null = Resolve-BitwardenAccessToken -TokenFile $TokenFile -ExportToProcess -Quiet
$bwAvailable = [bool](Get-Command bw -ErrorAction SilentlyContinue)
$bwReady = $bwAvailable
$bwArgs = @()

if ($bwAvailable) {
    $statusRaw = & bw status 2>$null
    if ($LASTEXITCODE -eq 0 -and $statusRaw) {
        $status = $statusRaw | ConvertFrom-Json
        if ($status.status -eq "unauthenticated") {
            $bwReady = $false
            if (-not $env:BSM_ACCESS_TOKEN) {
                Write-Fail "Bitwarden ist weder via BSM_ACCESS_TOKEN noch via 'bw login --apikey' verfuegbar."
                exit 1
            }
        }
        elseif ($status.status -eq "locked") {
            if ($env:BW_SESSION) {
                $bwArgs += @("--session", $env:BW_SESSION)
            }
            else {
                $bwReady = $false
                Write-Info "Lokaler bw-Vault ist gesperrt – verwende den BSM-Flow ohne interaktiven Unlock."
            }
        }
    }
}
elseif (-not $env:BSM_ACCESS_TOKEN) {
    Write-Fail "Weder 'bw' noch ein Bitwarden Access Token sind verfuegbar. Setze BSM_ACCESS_TOKEN/BW_ACCESS_TOKEN oder BW_TOKEN_FILE."
    exit 1
}

$script:BwsSecretLookup = $null

function Get-BwsSecretLookup {
    if ($script:BwsSecretLookup -is [hashtable]) {
        return $script:BwsSecretLookup
    }

    $script:BwsSecretLookup = @{}
    if (-not $env:BSM_ACCESS_TOKEN) {
        return $script:BwsSecretLookup
    }

    try {
        $secretsRaw = Invoke-BwsCommand -Arguments @("secret", "list", "--output", "json") -TokenFile $TokenFile -Quiet
        $secrets = $secretsRaw | ConvertFrom-Json
        foreach ($secret in $secrets) {
            if ($secret.key -and -not [string]::IsNullOrWhiteSpace($secret.value)) {
                $script:BwsSecretLookup[$secret.key] = [string]$secret.value
            }
        }

        Write-Info "BSM-Secrets geladen ($($script:BwsSecretLookup.Count) Eintraege, Scope=$Environment)."
    }
    catch {
        Write-WarnLine "BSM konnte nicht verwendet werden: $($_.Exception.Message)"
    }

    return $script:BwsSecretLookup
}

function Get-BitwardenSecretValue {
    param(
        [string[]]$Candidates
    )

    $bwsLookup = Get-BwsSecretLookup
    foreach ($candidate in $Candidates) {
        if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
        if ($bwsLookup.ContainsKey($candidate) -and -not [string]::IsNullOrWhiteSpace($bwsLookup[$candidate])) {
            return [string]$bwsLookup[$candidate]
        }
    }

    if (-not $bwReady) {
        return $null
    }

    foreach ($candidate in $Candidates) {
        if ([string]::IsNullOrWhiteSpace($candidate)) { continue }

        $itemsRaw = & bw @bwArgs list items --search $candidate 2>$null
        if ($LASTEXITCODE -ne 0 -or -not $itemsRaw) { continue }

        $items = $itemsRaw | ConvertFrom-Json
        if (-not $items) { continue }

        $item = $items | Where-Object { $_.name -eq $candidate } | Select-Object -First 1
        if (-not $item) {
            $item = $items | Select-Object -First 1
        }
        if (-not $item) { continue }

        $directCandidates = @(
            $item.login.password,
            $item.notes,
            $item.value
        )
        foreach ($value in $directCandidates) {
            if (-not [string]::IsNullOrWhiteSpace($value)) {
                return [string]$value
            }
        }

        if ($item.fields) {
            foreach ($fieldName in @("value", "secret", "token", "api_key", $candidate)) {
                $field = $item.fields | Where-Object { $_.name -eq $fieldName } | Select-Object -First 1
                if ($field -and -not [string]::IsNullOrWhiteSpace($field.value)) {
                    return [string]$field.value
                }
            }
            foreach ($field in $item.fields) {
                if ($field -and -not [string]::IsNullOrWhiteSpace($field.value)) {
                    return [string]$field.value
                }
            }
        }
    }

    return $null
}

function Ensure-EnvFile {
    param(
        [string]$Path,
        [string]$TemplatePath
    )

    if (Test-Path $Path) { return }
    if (Test-Path $TemplatePath) {
        Copy-Item $TemplatePath $Path
        Write-Info "Template kopiert: $Path"
        return
    }
    New-Item -ItemType File -Path $Path -Force | Out-Null
    Write-Info "Leere Env-Datei erstellt: $Path"
}

function Set-EnvValue {
    param(
        [string]$Path,
        [string]$Key,
        [string]$Value
    )

    $content = if (Test-Path $Path) { Get-Content $Path -Raw } else { "" }
    $escapedKey = [regex]::Escape($Key)
    $newLine = "$Key=$Value"

    if ($content -match "(?m)^$escapedKey=.*$") {
        $updated = [regex]::Replace($content, "(?m)^$escapedKey=.*$", $newLine)
    }
    else {
        $separator = if ($content -and -not $content.EndsWith("`n")) { "`r`n" } else { "" }
        $updated = "$content$separator$newLine`r`n"
    }

    if ($DryRun) {
        Write-Info "[DRY-RUN] $Key würde in $Path gesetzt"
        return
    }

    [System.IO.File]::WriteAllText((Join-Path $RepoRoot $Path), $updated, [System.Text.Encoding]::UTF8)
    Write-Ok "$Key in $Path aktualisiert"
}

function Remove-EnvKey {
    param(
        [string]$Path,
        [string]$Key
    )

    if (-not (Test-Path $Path)) { return }

    $content = Get-Content $Path -Raw
    $escapedKey = [regex]::Escape($Key)
    if ($content -notmatch "(?m)^$escapedKey=.*$") { return }

    $updated = [regex]::Replace($content, "(?m)^$escapedKey=.*(?:\r?\n)?", "")

    if ($DryRun) {
        Write-Info "[DRY-RUN] $Key würde aus $Path entfernt"
        return
    }

    [System.IO.File]::WriteAllText((Join-Path $RepoRoot $Path), $updated, [System.Text.Encoding]::UTF8)
    Write-Ok "$Key aus $Path entfernt"
}

Ensure-EnvFile -Path $WebsiteEnvFile -TemplatePath "apps/website/.env.example"
Ensure-EnvFile -Path $ApiEnvFile -TemplatePath "apps/api/.env.example"

$publishableCandidates = @(
    "website/VITE_STRIPE_PUBLISHABLE_KEY",
    "VITE_STRIPE_PUBLISHABLE_KEY",
    "pk_$StripeMode",
    "STRIPE_${StripeMode}_PUBLISHABLE_KEY"
)
$secretCandidates = @(
    "api/STRIPE_SECRET_KEY",
    "STRIPE_SECRET_KEY",
    "sk_$StripeMode",
    "STRIPE_${StripeMode}_SECRET_KEY"
)
$webhookSecretCandidates = @(
    "api/STRIPE_WEBHOOK_SECRET",
    "STRIPE_WEBHOOK_SECRET",
    "whsec_$StripeMode",
    "STRIPE_${StripeMode}_WEBHOOK_SECRET"
)

$publishableKey = Get-BitwardenSecretValue -Candidates $publishableCandidates
$stripeSecret = Get-BitwardenSecretValue -Candidates $secretCandidates
$stripeWebhookSecret = Get-BitwardenSecretValue -Candidates $webhookSecretCandidates

if ($publishableKey) {
    Set-EnvValue -Path $WebsiteEnvFile -Key "VITE_STRIPE_PUBLISHABLE_KEY" -Value $publishableKey
}
else {
    Write-WarnLine "Kein Stripe Publishable Key in Bitwarden gefunden (Kandidaten: $($publishableCandidates -join ', '))."
}

if ($stripeSecret) {
    Set-EnvValue -Path $ApiEnvFile -Key "STRIPE_SECRET_KEY" -Value $stripeSecret
}
else {
    Write-WarnLine "Kein Stripe Secret Key in Bitwarden gefunden (Kandidaten: $($secretCandidates -join ', '))."
}

if ($stripeWebhookSecret) {
    Set-EnvValue -Path $ApiEnvFile -Key "STRIPE_WEBHOOK_SECRET" -Value $stripeWebhookSecret
}
else {
    Write-WarnLine "Kein Stripe Webhook Secret in Bitwarden gefunden (Kandidaten: $($webhookSecretCandidates -join ', '))."
}

foreach ($legacyKey in @("VITE_PAYPAL_CLIENT_ID")) {
    Remove-EnvKey -Path $WebsiteEnvFile -Key $legacyKey
}
foreach ($legacyKey in @("PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_BASE_URL")) {
    Remove-EnvKey -Path $ApiEnvFile -Key $legacyKey
}

Write-Host "";
Write-Host "Fertig. Stripe wurde synchronisiert und alte PayPal-Env-Einträge wurden bereinigt." -ForegroundColor Green
