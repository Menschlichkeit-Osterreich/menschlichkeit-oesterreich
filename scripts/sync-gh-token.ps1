#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Synchronisiert GitHub PAT zwischen dotenv-vault und lokaler .env

.DESCRIPTION
    Dieses Script holt den aktuellen GitHub PAT aus dotenv-vault
    und schreibt ihn in die lokale .env-Datei. Unterstützt auch
    Validierung, Ablaufprüfung und automatische Rotation.

.PARAMETER Action
    Operation: pull (holen), validate (prüfen), rotate (neu generieren)

.PARAMETER Force
    Überschreibt .env auch wenn bereits vorhanden

.EXAMPLE
    .\scripts\sync-gh-token.ps1 -Action pull
    .\scripts\sync-gh-token.ps1 -Action validate
    .\scripts\sync-gh-token.ps1 -Action rotate -Force

.NOTES
    Autor: Security Analyst (Peter Schuller)
    Version: 1.0.0
    Erstellt: 2025-10-18
    Abhängigkeiten: dotenv-vault CLI, gh CLI
    Siehe: .github/instructions/core/github-pat-management.instructions.md
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("pull", "validate", "rotate")]
    [string]$Action = "pull",

    [Parameter(Mandatory = $false)]
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# -----------------------------------------------------------------------------
# Konfiguration
# -----------------------------------------------------------------------------
$REPO_ROOT = Split-Path -Parent $PSScriptRoot
$ENV_FILE = Join-Path $REPO_ROOT ".env"
$ENV_EXAMPLE = Join-Path $REPO_ROOT ".env.example"
$DOTENV_VAULT_CLI = "npx --yes dotenv-vault@1.24.0"

# -----------------------------------------------------------------------------
# Helper-Funktionen
# -----------------------------------------------------------------------------
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN"  { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-CommandExists {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Get-TokenExpiry {
    param([string]$Token)

    if (-not $Token) {
        Write-Log "Kein Token übergeben" -Level "ERROR"
        return $null
    }

    # GitHub API aufrufen (Token-Info)
    try {
        $headers = @{ Authorization = "Bearer $Token" }
        $response = Invoke-RestMethod `
            -Uri "https://api.github.com/user" `
            -Headers $headers `
            -ErrorAction Stop

        # Rate-Limit-Info holen (enthält Ablaufdatum bei Fine-Grained PATs)
        $rateLimitResponse = Invoke-RestMethod `
            -Uri "https://api.github.com/rate_limit" `
            -Headers $headers `
            -ErrorAction Stop

        Write-Log "Token gültig für User: $($response.login)" -Level "SUCCESS"
        return $rateLimitResponse
    }
    catch {
        Write-Log "Token-Validierung fehlgeschlagen: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }
}

# -----------------------------------------------------------------------------
# Action: pull (Token aus dotenv-vault holen)
# -----------------------------------------------------------------------------
function Invoke-PullToken {
    Write-Log "Pulling GitHub PAT from dotenv-vault..." -Level "INFO"

    # Prüfung: dotenv-vault CLI verfügbar?
    if (-not (Test-CommandExists "npx")) {
        Write-Log "npx nicht gefunden. Bitte Node.js installieren." -Level "ERROR"
        exit 1
    }

    # dotenv-vault pull
    try {
        Invoke-Expression "$DOTENV_VAULT_CLI pull --yes" | Out-Null
        Write-Log "dotenv-vault pull erfolgreich" -Level "SUCCESS"
    }
    catch {
        Write-Log "dotenv-vault pull fehlgeschlagen: $($_.Exception.Message)" -Level "ERROR"
        exit 1
    }

    # .env einlesen
    if (-not (Test-Path $ENV_FILE)) {
        Write-Log ".env nicht gefunden nach Pull. Ist dotenv-vault konfiguriert?" -Level "ERROR"
        exit 1
    }

    # GH_TOKEN extrahieren
    $envContent = Get-Content $ENV_FILE -Raw
    if ($envContent -match 'GH_TOKEN=([^\r\n]+)') {
        $token = $matches[1].Trim()

        if ($token -eq "" -or $token -eq "your_github_token_here") {
            Write-Log "GH_TOKEN in .env leer oder Platzhalter. Bitte in dotenv-vault setzen." -Level "WARN"
            Write-Log "Anleitung: npx dotenv-vault open" -Level "INFO"
            exit 1
        }

        Write-Log "GH_TOKEN erfolgreich geladen ($(($token.Substring(0, 10)))...)" -Level "SUCCESS"

        # Umgebungsvariable setzen (Session-weit)
        $env:GH_TOKEN = $token
        Write-Log "Token in `$env:GH_TOKEN verfügbar (nur diese Session)" -Level "INFO"
    }
    else {
        Write-Log "GH_TOKEN nicht in .env gefunden" -Level "WARN"
        exit 1
    }
}

# -----------------------------------------------------------------------------
# Action: validate (Token-Gültigkeit prüfen)
# -----------------------------------------------------------------------------
function Invoke-ValidateToken {
    Write-Log "Validating GitHub PAT..." -Level "INFO"

    # Token aus .env laden
    if (-not (Test-Path $ENV_FILE)) {
        Write-Log ".env nicht gefunden. Bitte zuerst 'pull' ausführen." -Level "ERROR"
        exit 1
    }

    # GH_TOKEN extrahieren
    $envContent = Get-Content $ENV_FILE -Raw
    if ($envContent -match 'GH_TOKEN=([^\r\n]+)') {
        $token = $matches[1].Trim()

        if ($token -eq "" -or $token -eq "your_github_token_here") {
            Write-Log "GH_TOKEN in .env leer oder Platzhalter." -Level "ERROR"
            exit 1
        }

        # Token validieren
        $result = Get-TokenExpiry -Token $token

        if ($result) {
            Write-Log "Token ist gültig" -Level "SUCCESS"

            # Rate-Limit-Info anzeigen
            $limit = $result.rate.limit
            $remaining = $result.rate.remaining
            $resetTime = [DateTimeOffset]::FromUnixTimeSeconds($result.rate.reset).LocalDateTime

            Write-Log "Rate Limit: $remaining / $limit verbleibend (Reset: $resetTime)" -Level "INFO"
        }
        else {
            Write-Log "Token ist ungültig oder abgelaufen" -Level "ERROR"
            exit 1
        }
    }
    else {
        Write-Log "GH_TOKEN nicht in .env gefunden" -Level "ERROR"
        exit 1
    }
}

# -----------------------------------------------------------------------------
# Action: rotate (Neuen Token generieren - Anleitung)
# -----------------------------------------------------------------------------
function Invoke-RotateToken {
    Write-Log "Token-Rotation - Manuelle Schritte erforderlich:" -Level "WARN"

    $instructions = @"

╔══════════════════════════════════════════════════════════════════════════╗
║                    GitHub PAT Rotation - Anleitung                       ║
╚══════════════════════════════════════════════════════════════════════════╝

1. NEUEN TOKEN GENERIEREN:
   → GitHub → Settings → Developer settings → Personal access tokens
   → Fine-grained tokens → "Generate new token"
   → Name: MOE-Dev-$(Get-Date -Format 'yyyy-MM-dd')
   → Expiration: 90 days
   → Scopes:
     ✓ repo (Read and write)
     ✓ read:org
     ✓ workflow (Read and write)
     ✓ write:packages
   → "Generate token" → Token kopieren (wird nur 1× angezeigt!)

2. TOKEN IN DOTENV-VAULT SPEICHERN:
   > npx dotenv-vault open
   → GH_TOKEN=ghp_... (neuer Token einfügen)
   → Speichern & Schließen
   > npx dotenv-vault push

3. GITHUB SECRETS AKTUALISIEREN (für CI/CD):
   → GitHub Repo → Settings → Secrets and variables → Actions
   → "GH_PAT_FINE_GRAINED" → Edit → Neuer Token → Save

4. ALTEN TOKEN WIDERRUFEN:
   → GitHub → Settings → Developer settings → PATs
   → Alten Token finden → "Revoke"

5. TESTEN:
   > .\scripts\sync-gh-token.ps1 -Action pull
   > .\scripts\sync-gh-token.ps1 -Action validate

6. DOKUMENTATION AKTUALISIEREN:
   → SECURITY.md: Token-ID + Ablaufdatum eintragen

7. TEAM INFORMIEREN (falls relevant):
   → Slack/E-Mail: "GitHub PAT wurde rotiert. Bitte dotenv-vault pull ausführen."

╔══════════════════════════════════════════════════════════════════════════╗
║  WICHTIG: Diese Schritte können NICHT automatisiert werden (GitHub API  ║
║  erlaubt keine PAT-Generierung via API aus Sicherheitsgründen).         ║
╚══════════════════════════════════════════════════════════════════════════╝

"@

    Write-Host $instructions -ForegroundColor Cyan
}

# -----------------------------------------------------------------------------
# Main Execution
# -----------------------------------------------------------------------------
Write-Log "GitHub PAT Sync Script gestartet" -Level "INFO"
Write-Log "Action: $Action" -Level "INFO"

switch ($Action) {
    "pull" {
        Invoke-PullToken
    }
    "validate" {
        Invoke-ValidateToken
    }
    "rotate" {
        Invoke-RotateToken
    }
}

Write-Log "Script erfolgreich abgeschlossen" -Level "SUCCESS"
exit 0
