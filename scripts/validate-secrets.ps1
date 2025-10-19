<#
.SYNOPSIS
    Secret-Validierung für .env-Dateien (PowerShell-Version)

.DESCRIPTION
    Prüft .env-Dateien auf:
    - Vorhandensein aller Pflicht-Variablen
    - Platzhalter-Werte (CHANGE, XXX, TODO)
    - Format-Validierung (Regex)
    - Security-Checks (keine Prod-Keys in Dev)

.PARAMETER EnvFile
    Pfad zur .env-Datei (Standard: .env)

.PARAMETER Strict
    Exit mit Fehler-Code bei Warnungen

.PARAMETER Environment
    Umgebung für Security-Checks (development, staging, production)

.EXAMPLE
    .\scripts\validate-secrets.ps1
    .\scripts\validate-secrets.ps1 -Strict
    .\scripts\validate-secrets.ps1 -EnvFile .env.staging -Environment staging
#>

param(
    [string]$EnvFile = ".env",
    [switch]$Strict,
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development"
)

# Validierungs-Patterns
$Patterns = @{
    "GH_TOKEN" = "^ghp_[A-Za-z0-9]{36}$"
    "FIGMA_API_TOKEN" = "^figd_[A-Za-z0-9_-]{24,}$"
    "FIGMA_FILE_KEY" = "^[A-Za-z0-9]{22}$"
    "DATABASE_URL" = "^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/\w+$"
    "JWT_SECRET" = "^.{32,}$"
    "SMTP_HOST" = "^[a-z0-9.-]+\.[a-z]{2,}$"
    "SMTP_USER" = "^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$"
    "SMTP_PASSWORD" = "^.{16,}$"
    "STRIPE_API_KEY" = "^sk_(test|live)_[A-Za-z0-9]{24,}$"
    "STRIPE_WEBHOOK_SECRET" = "^whsec_[A-Za-z0-9]{32,}$"
    "SENTRY_DSN" = "^https:\/\/[a-f0-9]+@[^\/]+\.ingest\.sentry\.io\/\d+$"
    "GPG_KEY_ID" = "^[A-F0-9]{16}$"
}

# Platzhalter (immer invalid)
$Placeholders = @("CHANGE", "PLACEHOLDER", "XXX+", "TODO", "REPLACE", "GENERATE", "YOUR_", "EXAMPLE")

# Pflicht-Variablen
$RequiredVars = @("DATABASE_URL", "JWT_SECRET")

# Optionale Variablen
$OptionalVars = @("GH_TOKEN", "FIGMA_API_TOKEN", "SENTRY_DSN")

# Security-Regeln
$SecurityRules = @(
    @{
        Key = "STRIPE_API_KEY"
        Env = "development"
        ForbiddenPattern = "^sk_live_"
        Message = "⚠️  Live Stripe-Key in Development-Umgebung!"
    },
    @{
        Key = "DATABASE_URL"
        Env = "development"
        ForbiddenPattern = "@(prod|production)\."
        Message = "⚠️  Production-DB in Development-Umgebung!"
    }
)

# Hilfsfunktionen
function Load-EnvFile {
    param([string]$Path)
    $envVars = @{}
    if (Test-Path $Path) {
        Get-Content $Path | ForEach-Object {
            if ($_ -match '^\s*([^#=]+)\s*=\s*(.*)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim().Trim('"').Trim("'")
                $envVars[$key] = $value
            }
        }
    }
    return $envVars
}

function Check-Placeholder {
    param([string]$Value)
    foreach ($pattern in $Placeholders) {
        if ($Value -match $pattern) {
            return @{ IsValid = $false; Message = "Platzhalter-Pattern: $pattern" }
        }
    }
    return @{ IsValid = $true; Message = "" }
}

function Validate-Format {
    param([string]$Key, [string]$Value)
    if ($Patterns.ContainsKey($Key)) {
        if ($Value -match $Patterns[$Key]) {
            return @{ IsValid = $true; Message = "" }
        } else {
            return @{ IsValid = $false; Message = "Format ungültig (Pattern: $($Patterns[$Key]))" }
        }
    }
    return @{ IsValid = $true; Message = "" }
}

function Check-Security {
    param([string]$Key, [string]$Value, [string]$Env)
    $warnings = @()
    foreach ($rule in $SecurityRules) {
        if ($rule.Key -eq $Key -and $rule.Env -eq $Env) {
            if ($Value -match $rule.ForbiddenPattern) {
                $warnings += $rule.Message
            }
        }
    }
    return $warnings
}

# Hauptvalidierung
Write-Host "`n🔍 Validiere Secrets: $EnvFile" -ForegroundColor Cyan
Write-Host "Umgebung: $Environment`n"

if (-not (Test-Path $EnvFile)) {
    Write-Host "✗ Datei nicht gefunden: $EnvFile" -ForegroundColor Red
    exit 2
}

$envVars = Load-EnvFile -Path $EnvFile
$errors = @()
$warnings = @()
$success = @()

# 1. Pflicht-Variablen
foreach ($var in $RequiredVars) {
    if (-not $envVars.ContainsKey($var) -or [string]::IsNullOrWhiteSpace($envVars[$var])) {
        $errors += "$var`: Pflicht-Variable fehlt oder leer"
    } else {
        $success += "$var`: Vorhanden"
    }
}

# 2. Optionale Variablen
foreach ($var in $OptionalVars) {
    if (-not $envVars.ContainsKey($var) -or [string]::IsNullOrWhiteSpace($envVars[$var])) {
        $warnings += "$var`: Optional, aber empfohlen"
    }
}

# 3. Alle gesetzten Variablen validieren
foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    if ([string]::IsNullOrWhiteSpace($value)) { continue }
    
    # Platzhalter
    $result = Check-Placeholder -Value $value
    if (-not $result.IsValid) {
        $errors += "$key`: $($result.Message)"
        continue
    }
    
    # Format
    $result = Validate-Format -Key $key -Value $value
    if (-not $result.IsValid) {
        $errors += "$key`: $($result.Message)"
        continue
    }
    
    # Security
    $secWarnings = Check-Security -Key $key -Value $value -Env $Environment
    foreach ($w in $secWarnings) {
        $warnings += "$key`: $w"
    }
}

# Ergebnisse
if ($success.Count -gt 0) {
    Write-Host "✓ Erfolgreiche Checks ($($success.Count)):" -ForegroundColor Green
    foreach ($s in $success | Select-Object -First 5) {
        Write-Host "  ✓ $s" -ForegroundColor Green
    }
    if ($success.Count -gt 5) {
        Write-Host "  ... und $($success.Count - 5) weitere`n"
    } else {
        Write-Host ""
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "⚠ Warnungen ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($w in $warnings) {
        Write-Host "  ⚠ $w" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($errors.Count -gt 0) {
    Write-Host "✗ Fehler ($($errors.Count)):" -ForegroundColor Red
    foreach ($e in $errors) {
        Write-Host "  ✗ $e" -ForegroundColor Red
    }
    Write-Host ""
}

# Exit-Code
if ($errors.Count -gt 0) {
    Write-Host "❌ Validierung fehlgeschlagen!`n" -ForegroundColor Red
    exit 2
} elseif ($warnings.Count -gt 0 -and $Strict) {
    Write-Host "⚠️  Validierung mit Warnungen (Strict-Mode)`n" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "✅ Validierung erfolgreich!`n" -ForegroundColor Green
    exit 0
}
