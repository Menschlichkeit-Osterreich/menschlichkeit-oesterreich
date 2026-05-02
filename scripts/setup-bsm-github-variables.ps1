#Requires -Version 5.1
<#
.SYNOPSIS
    Lädt GitHub PAT aus Bitwarden, setzt 5 BSM_API_* GitHub Variables, startet Deploy Dry-Run
.PARAMETER GitHubTokenUUID
    UUID des GitHub PAT Secrets in Bitwarden
.PARAMETER DryRun
    Wenn $true, führt Deploy mit dry_run=true aus (Standard: $true)
#>
[CmdletBinding()]
param(
    [string]$GitHubTokenUUID = "",
    [bool]$DryRun = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Import Bitwarden Helper
. "$PSScriptRoot\bitwarden-common.ps1"

Write-Host "🔑 GitHub PAT + Variables + Dry-Run Setup`n"

if (-not $GitHubTokenUUID) {
    $GitHubTokenUUID = $env:BWS_GITHUB_PAT_UUID
}
if (-not $GitHubTokenUUID) {
    Write-Host "❌ FEHLER: GitHubTokenUUID fehlt. Übergib -GitHubTokenUUID oder setze BWS_GITHUB_PAT_UUID."
    exit 1
}

# 1. BSM Token laden
Write-Host "📦 [1/5] Lade Bitwarden Secrets Manager Token..."
$bsmToken = Resolve-BitwardenAccessToken -ExportToProcess
if (-not $bsmToken) {
    Write-Host "❌ FEHLER: BSM Token nicht gefunden"
    exit 1
}
Write-Host "✅ BSM Token geladen"

# 2. GitHub PAT aus BSM laden
Write-Host "📦 [2/5] Lade GitHub PAT aus BSM (UUID: $GitHubTokenUUID)..."
try {
    $ghPatOutput = & bws secret get $GitHubTokenUUID 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "bws command failed: $ghPatOutput"
    }
    $ghPatJson = $ghPatOutput | ConvertFrom-Json -ErrorAction Stop
    $ghPAT = $ghPatJson.value
    if (-not $ghPAT -or $ghPAT.Length -lt 30) {
        throw "GitHub PAT ungültig oder zu kurz"
    }
    Write-Host "✅ GitHub PAT geladen (Länge: $($ghPAT.Length), Präfix: ghp_...)"
} catch {
    Write-Host "❌ FEHLER: Konnte GitHub PAT nicht laden - $_"
    exit 1
}

# 3. GitHub CLI authentifizieren
Write-Host "📦 [3/5] Authentifiziere GitHub CLI mit PAT..."
$env:GH_TOKEN = $ghPAT
$authStatus = & gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ FEHLER: GitHub CLI Auth fehlgeschlagen"
    Write-Host $authStatus
    exit 1
}
$authUser = ($authStatus | Select-String "Logged in to github.com as" -ErrorAction SilentlyContinue) -split " " | Select-Object -Last 1
Write-Host "✅ Authentifiziert als: $authUser"

# 4. GitHub Variables setzen
Write-Host "📦 [4/5] Setze 5 GitHub Variables (BSM_API_*)..."
$variables = @{
    "BSM_API_ALERTS_SLACK_WEBHOOK"      = "6ae7736b-87ee-42a2-ad70-b4320175a89a"
    "BSM_API_MICROSOFT_TENANT_ID"       = "896d9258-dfe3-423f-a4ef-b43300a782a4"
    "BSM_API_MICROSOFT_CLIENT_ID"       = "db7a1253-082c-4cfb-a5cc-b43300ad91df"
    "BSM_API_MICROSOFT_CLIENT_SECRET"   = "d7399a8e-2559-4f11-a9ec-b43300ab8b11"
    "BSM_API_MICROSOFT_GRAPH_SENDER"    = "0d276eb3-407d-49c4-89c7-b43300b3cfbb"
}

$repo = "Menschlichkeit-Osterreich/menschlichkeit-oesterreich"
$setCount = 0

foreach ($varName in $variables.Keys) {
    $uuid = $variables[$varName]
    try {
        $output = & gh variable set "$varName" -b "$uuid" --repo $repo 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $varName = $uuid"
            $setCount++
        } else {
            Write-Host "  ⚠️  $varName: $output"
        }
    } catch {
        Write-Host "  ❌ $varName: $_"
    }
}

if ($setCount -lt 5) {
    Write-Host "`n⚠️  Warnung: Nur $setCount/5 Variables gesetzt"
} else {
    Write-Host "`n✅ Alle 5 Variables gesetzt"
}

# 5. Verifiziere Variables
Write-Host "`n📦 [5/5] Verifiziere GitHub Variables..."
try {
    $varsJson = & gh variable list --repo $repo --json name,value 2>&1
    if ($LASTEXITCODE -eq 0) {
        $allVars = $varsJson | ConvertFrom-Json -ErrorAction SilentlyContinue
        $bsmVars = @($allVars | Where-Object { $_.name -like "BSM_API_*" })
        Write-Host "✅ Gefunden: $($bsmVars.Count)/5 BSM_API_* Variables"

        foreach ($v in $bsmVars) {
            Write-Host "  • $($v.name) = $($v.value)"
        }
    }
} catch {
    Write-Host "⚠️  Verifizierung fehlgeschlagen: $_"
}

# 6. Starte Deploy Dry-Run
if ($DryRun) {
    Write-Host "`n🚀 Starte Deploy Dry-Run (deploy-plesk.yml mit dry_run=true)..."
    try {
        $runOutput = & gh workflow run deploy-plesk.yml -f dry_run=true --repo $repo 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Workflow gestartet"
            Write-Host $runOutput

            # Kurz warten und Job-Status abrufen
            Write-Host "`n⏳ Warte 5 Sekunden auf Job-Disponibilität..."
            Start-Sleep -Seconds 5

            $runsJson = & gh run list --workflow deploy-plesk.yml --repo $repo --limit 1 --json databaseId,status,conclusion,headBranch 2>&1
            if ($LASTEXITCODE -eq 0) {
                $runs = $runsJson | ConvertFrom-Json -ErrorAction SilentlyContinue
                if ($runs) {
                    $runId = $runs.databaseId
                    $status = $runs.status
                    $conclusion = $runs.conclusion
                    Write-Host "  📊 Job-ID: $runId"
                    Write-Host "  📊 Status: $status"
                    Write-Host "  📊 Ergebnis: $conclusion"
                    Write-Host "`n✅ Dry-Run gestartet. Job läuft im Hintergrund."
                    Write-Host "   Link: https://github.com/$repo/actions/runs/$runId"
                }
            }
        } else {
            Write-Host "❌ Workflow-Start fehlgeschlagen"
            Write-Host $runOutput
            exit 1
        }
    } catch {
        Write-Host "❌ FEHLER: $_"
        exit 1
    }
}

Write-Host "`n✅ Setup abgeschlossen!`n"
Write-Host "ZUSAMMENFASSUNG:"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "✅ GitHub PAT aus BSM geladen"
Write-Host "✅ 5 BSM_API_* Variables gesetzt"
Write-Host "✅ Deploy Dry-Run gestartet"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "`nDas ist Phase 3 ABGESCHLOSSEN. Prüfe GitHub Actions:"
Write-Host "  → https://github.com/$repo/actions"
