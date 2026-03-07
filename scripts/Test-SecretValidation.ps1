<#
.SYNOPSIS
    Umfassende Secret-Validierung für Menschlichkeit Österreich
.DESCRIPTION
    Testet ob alle dokumentierten Secrets korrekt gesetzt sind:
    - .env vs .env.example Vergleich
    - Platzhalter-Erkennung
    - Format-Validierung
    - GitHub Secrets Check (URLs)
    - dotenv-vault Verfügbarkeit
.EXAMPLE
    .\scripts\Test-SecretValidation.ps1
.EXAMPLE
    .\scripts\Test-SecretValidation.ps1 -Verbose
.NOTES
    Version: 1.0.0
    Autor: AI Agent (GitHub Copilot)
    Datum: 18. Oktober 2025
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$ErrorCount = 0
$WarningCount = 0

# Farb-Funktionen
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Failure { param($Message) Write-Host "❌ $Message" -ForegroundColor Red; $script:ErrorCount++ }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow; $script:WarningCount++ }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Section { param($Message) Write-Host "`n═══ $Message ═══" -ForegroundColor Magenta }

# ================== SECTION 1: .env Existenz & Vergleich ==================
Write-Section "1. .env Datei Check"

if (-not (Test-Path .env)) {
    Write-Failure ".env Datei existiert nicht!"
    Write-Info "Erstelle .env via: cp .env.example .env"
    exit 1
} else {
    Write-Success ".env Datei gefunden"
}

if (-not (Test-Path .env.example)) {
    Write-Failure ".env.example nicht gefunden!"
    exit 1
}

# Parse ENV-Dateien
$exampleKeys = Get-Content .env.example |
    Select-String -Pattern "^[A-Z_]+=" |
    ForEach-Object { ($_.Line -split '=')[0] } |
    Sort-Object -Unique

$actualKeys = Get-Content .env |
    Select-String -Pattern "^[A-Z_]+=" |
    ForEach-Object { ($_.Line -split '=')[0] } |
    Sort-Object -Unique

Write-Info "Keys in .env.example: $($exampleKeys.Count)"
Write-Info "Keys in .env: $($actualKeys.Count)"

# Fehlende Keys
$missingKeys = Compare-Object $exampleKeys $actualKeys |
    Where-Object { $_.SideIndicator -eq '<=' } |
    Select-Object -ExpandProperty InputObject

if ($missingKeys) {
    Write-Section "Fehlende Keys in .env"
    $missingKeys | ForEach-Object { Write-Failure "Fehlt: $_" }
} else {
    Write-Success "Alle Keys aus .env.example vorhanden"
}

# Zusätzliche Keys (nicht kritisch)
$extraKeys = Compare-Object $exampleKeys $actualKeys |
    Where-Object { $_.SideIndicator -eq '=>' } |
    Select-Object -ExpandProperty InputObject

if ($extraKeys) {
    Write-Section "Zusätzliche Keys in .env (nicht in .env.example)"
    $extraKeys | ForEach-Object { Write-Info "Extra: $_" }
}

# ================== SECTION 2: Platzhalter-Erkennung ==================
Write-Section "2. Platzhalter & Ungültige Werte"

$placeholderPatterns = @(
    "CHANGE",
    "XXX",
    "YOUR_",
    "TODO",
    "GENERATE",
    "EXAMPLE",
    "PLACEHOLDER",
    "password123",
    "secret123",
    "test123",
    "admin123"
)

$envContent = Get-Content .env -Raw
$placeholderFound = $false

foreach ($pattern in $placeholderPatterns) {
    if ($envContent -match $pattern) {
        Write-Failure "Platzhalter gefunden: '$pattern' in .env"
        $placeholderFound = $true
    }
}

if (-not $placeholderFound) {
    Write-Success "Keine offensichtlichen Platzhalter gefunden"
}

# ================== SECTION 3: Kritische Required Secrets ==================
Write-Section "3. Kritische Required Secrets"

$requiredSecrets = @{
    "DATABASE_URL" = "^postgresql://.*"
    "GH_TOKEN" = "^ghp_[A-Za-z0-9]{36}$"
    "JWT_SECRET" = ".{32,}" # Min. 32 Zeichen
    "STRIPE_API_KEY" = "^sk_(test|live)_[A-Za-z0-9]{99}$"
    "FIGMA_API_TOKEN" = "^figd_[A-Za-z0-9_-]{43}$"
}

$envHash = @{}
Get-Content .env | ForEach-Object {
    if ($_ -match '^([A-Z_]+)=(.*)$') {
        $envHash[$matches[1]] = $matches[2]
    }
}

foreach ($key in $requiredSecrets.Keys) {
    if (-not $envHash.ContainsKey($key)) {
        Write-Failure "Required Secret fehlt: $key"
    } elseif ($envHash[$key] -eq "") {
        Write-Failure "$key ist leer!"
    } elseif ($envHash[$key] -notmatch $requiredSecrets[$key]) {
        Write-Warning "$key hat ungültiges Format (Pattern: $($requiredSecrets[$key]))"
    } else {
        Write-Success "$key vorhanden & Format OK"
    }
}

# ================== SECTION 4: Mail-Adressen Validierung ==================
Write-Section "4. Mail-Adressen Validierung"

$mailKeys = @(
    "ADMIN_EMAIL",
    "BOUNCE_EMAIL",
    "CIVIMAIL_EMAIL",
    "ACME_EMAIL",
    "MAIL_FROM_ADDRESS"
)

$mailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

foreach ($key in $mailKeys) {
    if (-not $envHash.ContainsKey($key)) {
        Write-Failure "Mail-Adresse fehlt: $key"
    } elseif ($envHash[$key] -notmatch $mailRegex) {
        Write-Failure "$key hat ungültiges E-Mail-Format: $($envHash[$key])"
    } else {
        Write-Success "$key = $($envHash[$key])"
    }
}

# ================== SECTION 5: Passwort-Stärke Check ==================
Write-Section "5. Passwort-Stärke Check"

$passwordKeys = @(
    "ADMIN_EMAIL_PASS",
    "BOUNCE_EMAIL_PASS",
    "CIVIMAIL_EMAIL_PASS",
    "DRUPAL_ADMIN_PASS",
    "DB_PASS",
    "SMTP_PASS",
    "IMAP_PASS",
    "ELASTIC_PASSWORD",
    "KIBANA_SYSTEM_PASSWORD"
)

foreach ($key in $passwordKeys) {
    if ($envHash.ContainsKey($key)) {
        $pass = $envHash[$key]
        $length = $pass.Length

        if ($length -lt 12) {
            Write-Failure "$key zu kurz ($length Zeichen, min. 12)"
        } elseif ($pass -match "^[a-z]+$" -or $pass -match "^[A-Z]+$" -or $pass -match "^[0-9]+$") {
            Write-Warning "$key zu einfach (nur Kleinbuchstaben/Großbuchstaben/Zahlen)"
        } else {
            Write-Success "$key Stärke OK ($length Zeichen)"
        }
    }
}

# ================== SECTION 6: dotenv-vault Check ==================
Write-Section "6. dotenv-vault Verschlüsselung"

if (Test-Path .env.vault) {
    Write-Success ".env.vault Datei gefunden (verschlüsselte Secrets)"

    # Prüfe ob Keys existieren
    try {
        $vaultOutput = npx --yes dotenv-vault@1.24.0 keys 2>&1 | Out-String
        if ($vaultOutput -match "development.*dotenv://") {
            Write-Success "dotenv-vault Keys vorhanden (development, ci, staging, production)"
        } else {
            Write-Warning "dotenv-vault Keys unvollständig"
        }
    } catch {
        Write-Warning "Fehler beim Prüfen von dotenv-vault: $($_.Exception.Message)"
    }
} else {
    Write-Warning ".env.vault nicht gefunden - Secrets nicht verschlüsselt!"
    Write-Info "Verschlüsseln via: npx dotenv-vault@1.24.0 push"
}

# ================== SECTION 7: GitHub Secrets Check ==================
Write-Section "7. GitHub Secrets (Repository Settings)"

$ghSecrets = @(
    "CODACY_API_TOKEN",
    "DB_HOST", "DB_NAME", "DB_USER", "DB_PASS",
    "N8N_WEBHOOK_URL", "N8N_WEBHOOK_SECRET", "N8N_BASE_URL",
    "PLESK_SSH_KEY", "SNYK_TOKEN",
    "SSH_PRIVATE_KEY", "SLACK_API_TOKEN",
    "STAGING_REMOTE_USER", "STAGING_REMOTE_HOST",
    "PROD_REMOTE_USER", "PROD_REMOTE_HOST"
)

Write-Info "Folgende Secrets MÜSSEN in GitHub Actions verfügbar sein:"
$ghSecrets | ForEach-Object { Write-Host "  - $_" }

Write-Info "`n⚠️  Manuelle Prüfung erforderlich:"
Write-Host "    https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/settings/secrets/actions" -ForegroundColor Cyan

# ================== SECTION 8: Service-spezifische Tests ==================
Write-Section "8. Service-spezifische Validierung"

# PostgreSQL Connection String
if ($envHash.ContainsKey("DATABASE_URL")) {
    $dbUrl = $envHash["DATABASE_URL"]
    if ($dbUrl -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
        $dbUser = $matches[1]
        $dbPass = $matches[2]
        $dbHost = $matches[3]
        $dbPort = $matches[4]
        $dbName = $matches[5]

        Write-Success "DATABASE_URL Format OK"
        Write-Info "  User: $dbUser, Host: $dbHost, Port: $dbPort, DB: $dbName"

        # Test Connection (optional, nur wenn PostgreSQL erreichbar)
        if (Test-NetConnection -ComputerName $dbHost -Port $dbPort -WarningAction SilentlyContinue -InformationLevel Quiet) {
            Write-Success "PostgreSQL Server erreichbar (${dbHost}:${dbPort})"
        } else {
            Write-Warning "PostgreSQL Server NICHT erreichbar (${dbHost}:${dbPort})"
        }
    } else {
        Write-Failure "DATABASE_URL hat ungültiges Format"
    }
}

# Redis URL
if ($envHash.ContainsKey("REDIS_URL")) {
    $redisUrl = $envHash["REDIS_URL"]
    if ($redisUrl -match "redis://") {
        Write-Success "REDIS_URL Format OK"
    } else {
        Write-Failure "REDIS_URL hat ungültiges Format (muss redis:// sein)"
    }
}

# Stripe Keys (Test vs Live)
if ($envHash.ContainsKey("STRIPE_API_KEY")) {
    $stripeKey = $envHash["STRIPE_API_KEY"]
    if ($stripeKey -match "^sk_test_") {
        Write-Info "Stripe: TEST-Mode"
    } elseif ($stripeKey -match "^sk_live_") {
        Write-Warning "Stripe: LIVE-Mode (Production!)"
    }
}

# ================== SECTION 9: Deployment-Paths Check ==================
Write-Section "9. Deployment-Paths Validierung"

$pathKeys = @(
    "LOCAL_WEBROOT",
    "LOCAL_frontend",
    "LOCAL_api",
    "LOCAL_crm",
    "PLESK_REMOTE_PATH"
)

foreach ($key in $pathKeys) {
    if ($envHash.ContainsKey($key)) {
        $path = $envHash[$key]

        # Lokale Pfade prüfen
        if ($key -match "^LOCAL_") {
            if (Test-Path $path) {
                Write-Success "$key existiert: $path"
            } else {
                Write-Warning "$key Pfad nicht gefunden: $path"
            }
        } else {
            Write-Info "$key = $path (Remote - nicht testbar)"
        }
    }
}

# ================== SECTION 10: Security-Regeln aus Schema ==================
Write-Section "10. Security-Regeln (aus secrets-audit.schema.yaml)"

# Regel 1: Keine Production Keys in Development
$devKeys = @("sk_live_", "_PROD_", "_PRODUCTION_")
foreach ($pattern in $devKeys) {
    if ($envContent -match $pattern -and $envHash["APP_ENV"] -eq "development") {
        Write-Failure "Production Key in Development Environment gefunden: $pattern"
    }
}

# Regel 2: Keine Production DB in Development
if ($envHash["APP_ENV"] -eq "development") {
    if ($envHash["DATABASE_URL"] -match "production|prod|live") {
        Write-Failure "Production Database in Development Environment!"
    } else {
        Write-Success "Development nutzt korrekte DB"
    }
}

# Regel 3: Min. Secret-Länge für kritische Secrets
$criticalSecrets = @("JWT_SECRET", "N8N_ENCRYPTION_KEY", "STRIPE_WEBHOOK_SECRET")
foreach ($key in $criticalSecrets) {
    if ($envHash.ContainsKey($key)) {
        if ($envHash[$key].Length -lt 32) {
            Write-Failure "$key zu kurz (min. 32 Zeichen)"
        } else {
            Write-Success "$key Länge OK ($($envHash[$key].Length) Zeichen)"
        }
    }
}

# ================== FINAL REPORT ==================
Write-Section "🎯 Zusammenfassung"

$totalKeys = $envHash.Count
$missingCount = $missingKeys.Count
$coverage = [math]::Round((($totalKeys - $missingCount) / $exampleKeys.Count) * 100, 1)

Write-Host "`n📊 Statistik:" -ForegroundColor Cyan
Write-Host "  Gesamt Keys in .env: $totalKeys"
Write-Host "  Keys in .env.example: $($exampleKeys.Count)"
Write-Host "  Fehlende Keys: $missingCount"
Write-Host "  Coverage: $coverage%"
Write-Host "  Fehler: $ErrorCount" -ForegroundColor $(if ($ErrorCount -eq 0) { "Green" } else { "Red" })
Write-Host "  Warnungen: $WarningCount" -ForegroundColor $(if ($WarningCount -eq 0) { "Green" } else { "Yellow" })

if ($ErrorCount -eq 0 -and $WarningCount -eq 0) {
    Write-Host "`n🎉 Alle Secrets korrekt konfiguriert!" -ForegroundColor Green
    exit 0
} elseif ($ErrorCount -eq 0) {
    Write-Host "`n✅ Keine Fehler, aber $WarningCount Warnung(en)" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "`n❌ $ErrorCount Fehler gefunden!" -ForegroundColor Red
    Write-Host "Bitte beheben und erneut prüfen.`n"
    exit 1
}
