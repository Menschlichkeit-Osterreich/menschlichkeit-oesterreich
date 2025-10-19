# Test-SecretFunctionality.ps1
# Testet die tatsächliche Funktionalität aller Secrets
# Version: 1.0.0
# Datum: 2025-10-18

[CmdletBinding()]
param(
    [switch]$SkipNetworkTests,
    [string]$EnvFile = ".env"
)

$ErrorActionPreference = "Stop"
$Results = @{
    Total = 0
    Passed = 0
    Failed = 0
    Skipped = 0
    Warnings = 0
    Details = @()
}

function Write-TestResult {
    param(
        [string]$Category,
        [string]$Secret,
        [string]$Status,
        [string]$Message,
        [string]$Details = ""
    )

    $Color = switch ($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        "SKIP" { "Gray" }
        default { "White" }
    }

    Write-Host "[$Status] " -ForegroundColor $Color -NoNewline
    Write-Host "$Category :: $Secret - $Message"

    if ($Details -and $VerbosePreference -eq 'Continue') {
        Write-Host "  Details: $Details" -ForegroundColor Gray
    }

    $Results.Details += @{
        Category = $Category
        Secret = $Secret
        Status = $Status
        Message = $Message
        Details = $Details
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }

    $Results.Total++
    switch ($Status) {
        "PASS" { $Results.Passed++ }
        "FAIL" { $Results.Failed++ }
        "SKIP" { $Results.Skipped++ }
        "WARN" { $Results.Warnings++ }
    }
}

function Test-GitHubToken {
    param([string]$Token)

    if (-not $Token -or $Token -match "CHANGE|XXX|YOUR_|TODO|GENERATE|EXAMPLE|PLACEHOLDER") {
        Write-TestResult "GitHub" "GH_TOKEN" "FAIL" "Token ist Platzhalter oder leer"
        return
    }

    # Format prüfen
    if ($Token -notmatch "^ghp_[A-Za-z0-9]{36}$") {
        Write-TestResult "GitHub" "GH_TOKEN" "FAIL" "Ungültiges Format (erwartet: ghp_XXXXX...)"
        return
    }

    if ($SkipNetworkTests) {
        Write-TestResult "GitHub" "GH_TOKEN" "SKIP" "Netzwerk-Tests übersprungen"
        return
    }

    # API-Test
    try {
        $headers = @{
            "Authorization" = "Bearer $Token"
            "Accept" = "application/vnd.github+json"
        }
        $response = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers -Method Get -TimeoutSec 10

        Write-TestResult "GitHub" "GH_TOKEN" "PASS" "Token funktioniert (User: $($response.login))" -Details "Scopes prüfen mit: curl -H 'Authorization: Bearer TOKEN' -I https://api.github.com/user"
    }
    catch {
        Write-TestResult "GitHub" "GH_TOKEN" "FAIL" "API-Aufruf fehlgeschlagen" -Details $_.Exception.Message
    }
}

function Test-FigmaToken {
    param([string]$Token)

    if (-not $Token -or $Token -match "CHANGE|XXX|YOUR_|TODO|GENERATE|EXAMPLE|PLACEHOLDER") {
        Write-TestResult "Figma" "FIGMA_ACCESS_TOKEN" "FAIL" "Token ist Platzhalter oder leer"
        return
    }

    # Format prüfen (Figma tokens sind meist 43-44 Zeichen, alphanumerisch mit Bindestrichen)
    if ($Token.Length -lt 40) {
        Write-TestResult "Figma" "FIGMA_ACCESS_TOKEN" "WARN" "Token scheint zu kurz (< 40 Zeichen)"
    }

    if ($SkipNetworkTests) {
        Write-TestResult "Figma" "FIGMA_ACCESS_TOKEN" "SKIP" "Netzwerk-Tests übersprungen"
        return
    }

    # API-Test
    try {
        $headers = @{
            "X-Figma-Token" = $Token
        }
        $response = Invoke-RestMethod -Uri "https://api.figma.com/v1/me" -Headers $headers -Method Get -TimeoutSec 10

        Write-TestResult "Figma" "FIGMA_ACCESS_TOKEN" "PASS" "Token funktioniert (User: $($response.email))"
    }
    catch {
        Write-TestResult "Figma" "FIGMA_ACCESS_TOKEN" "FAIL" "API-Aufruf fehlgeschlagen" -Details $_.Exception.Message
    }
}

function Test-DatabaseConnection {
    param([string]$ConnectionString)

    if (-not $ConnectionString -or $ConnectionString -match "CHANGE|XXX|YOUR_|TODO|GENERATE|EXAMPLE|PLACEHOLDER") {
        Write-TestResult "Database" "DATABASE_URL" "FAIL" "Connection String ist Platzhalter oder leer"
        return
    }

    # Format prüfen
    if ($ConnectionString -notmatch "^postgresql://") {
        Write-TestResult "Database" "DATABASE_URL" "FAIL" "Ungültiges Format (erwartet: postgresql://...)"
        return
    }

    # Sensitive Daten extrahieren (ohne sie anzuzeigen)
    if ($ConnectionString -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
        $dbUser = $Matches[1]
        $dbHost = $Matches[3]
        $dbPort = $Matches[4]
        $database = $Matches[5]

        if ($SkipNetworkTests) {
            Write-TestResult "Database" "DATABASE_URL" "SKIP" "Netzwerk-Tests übersprungen" -Details "Host: $dbHost, Port: $dbPort, DB: $database"
            return
        }

        # TCP-Port-Test (ohne Passwort-Exposure)
        try {
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $tcpClient.Connect($dbHost, $dbPort)
            $tcpClient.Close()

            Write-TestResult "Database" "DATABASE_URL" "PASS" "PostgreSQL Server erreichbar" -Details "Host: ${dbHost}:${dbPort}, DB: $database"
        }
        catch {
            Write-TestResult "Database" "DATABASE_URL" "FAIL" "Server nicht erreichbar" -Details "Host: ${dbHost}:${dbPort} - $($_.Exception.Message)"
        }
    }
    else {
        Write-TestResult "Database" "DATABASE_URL" "FAIL" "Connection String kann nicht geparst werden"
    }
}

function Test-SMTPCredentials {
    param(
        [string]$SmtpHost,
        [string]$SmtpPort,
        [string]$SmtpUser,
        [string]$SmtpPassword
    )

    if (-not $SmtpHost -or $SmtpHost -match "CHANGE|XXX|YOUR_|TODO|GENERATE|EXAMPLE|PLACEHOLDER") {
        Write-TestResult "SMTP" "SMTP_HOST" "FAIL" "Host ist Platzhalter oder leer"
        return
    }

    if (-not $SmtpPort -or $SmtpPort -notmatch "^\d+$") {
        Write-TestResult "SMTP" "SMTP_PORT" "FAIL" "Port ist ungültig oder leer"
        return
    }

    if (-not $SmtpUser -or $SmtpUser -match "CHANGE|XXX|YOUR_|TODO|GENERATE|EXAMPLE|PLACEHOLDER") {
        Write-TestResult "SMTP" "SMTP_USER" "FAIL" "User ist Platzhalter oder leer"
        return
    }

    if (-not $SmtpPassword -or $SmtpPassword -match "CHANGE|XXX|YOUR_|TODO|GENERATE|EXAMPLE|PLACEHOLDER") {
        Write-TestResult "SMTP" "SMTP_PASSWORD" "FAIL" "Password ist Platzhalter oder leer"
        return
    }

    if ($SkipNetworkTests) {
        Write-TestResult "SMTP" "SMTP_*" "SKIP" "Netzwerk-Tests übersprungen"
        return
    }

    # TCP-Port-Test
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect($SmtpHost, $SmtpPort)
        $tcpClient.Close()

        Write-TestResult "SMTP" "SMTP_HOST" "PASS" "SMTP Server erreichbar" -Details "Host: ${SmtpHost}:${SmtpPort}"
        Write-TestResult "SMTP" "SMTP_PORT" "PASS" "Port ist offen"
        Write-TestResult "SMTP" "SMTP_USER" "PASS" "Format gültig (Login-Test nicht implementiert)"
        Write-TestResult "SMTP" "SMTP_PASSWORD" "PASS" "Gesetzt (Login-Test nicht implementiert)"
    }
    catch {
        Write-TestResult "SMTP" "SMTP_HOST" "FAIL" "Server nicht erreichbar" -Details "${SmtpHost}:${SmtpPort} - $($_.Exception.Message)"
    }
}

function Test-StripeKeys {
    param(
        [string]$PublishableKey,
        [string]$SecretKey
    )

    if (-not $PublishableKey -or $PublishableKey -match "CHANGE|XXX|YOUR_|TODO|GENERATE|EXAMPLE|PLACEHOLDER") {
        Write-TestResult "Stripe" "STRIPE_PUBLISHABLE_KEY" "FAIL" "Key ist Platzhalter oder leer"
    }
    elseif ($PublishableKey -notmatch "^pk_(test|live)_[A-Za-z0-9]{24,}$") {
        Write-TestResult "Stripe" "STRIPE_PUBLISHABLE_KEY" "FAIL" "Ungültiges Format (erwartet: pk_test_... oder pk_live_...)"
    }
    else {
        $mode = if ($PublishableKey -match "^pk_test_") { "TEST" } else { "LIVE" }
        Write-TestResult "Stripe" "STRIPE_PUBLISHABLE_KEY" "PASS" "Format gültig ($mode Mode)"
    }

    if (-not $SecretKey -or $SecretKey -match "CHANGE|XXX|YOUR_|TODO|GENERATE|EXAMPLE|PLACEHOLDER") {
        Write-TestResult "Stripe" "STRIPE_SECRET_KEY" "FAIL" "Key ist Platzhalter oder leer"
    }
    elseif ($SecretKey -notmatch "^sk_(test|live)_[A-Za-z0-9]{24,}$") {
        Write-TestResult "Stripe" "STRIPE_SECRET_KEY" "FAIL" "Ungültiges Format (erwartet: sk_test_... oder sk_live_...)"
    }
    else {
        $mode = if ($SecretKey -match "^sk_test_") { "TEST" } else { "LIVE" }
        Write-TestResult "Stripe" "STRIPE_SECRET_KEY" "PASS" "Format gültig ($mode Mode)"

        # Warnung bei Mode-Mismatch
        if (($PublishableKey -match "test" -and $SecretKey -match "live") -or
            ($PublishableKey -match "live" -and $SecretKey -match "test")) {
            Write-TestResult "Stripe" "STRIPE_*" "WARN" "Mode-Mismatch zwischen Publishable und Secret Key"
        }
    }
}

function Test-JWTSecret {
    param([string]$Secret)

    if (-not $Secret -or $Secret -match "CHANGE|XXX|YOUR_|TODO|GENERATE|EXAMPLE|PLACEHOLDER") {
        Write-TestResult "JWT" "JWT_SECRET" "FAIL" "Secret ist Platzhalter oder leer"
        return
    }

    # Mindestlänge prüfen (NIST empfiehlt 256 bits = 32 Bytes = 64 hex chars)
    if ($Secret.Length -lt 32) {
        Write-TestResult "JWT" "JWT_SECRET" "FAIL" "Secret zu kurz (< 32 Zeichen, empfohlen: ≥64)"
        return
    }

    if ($Secret.Length -lt 64) {
        Write-TestResult "JWT" "JWT_SECRET" "WARN" "Secret könnte länger sein (aktuell: $($Secret.Length), empfohlen: ≥64)"
    }
    else {
        Write-TestResult "JWT" "JWT_SECRET" "PASS" "Secret hat sichere Länge ($($Secret.Length) Zeichen)"
    }
}

function Test-GPGKey {
    param([string]$KeyID)

    if (-not $KeyID -or $KeyID -match "CHANGE|XXX|YOUR_|TODO|GENERATE|EXAMPLE|PLACEHOLDER") {
        Write-TestResult "GPG" "GPG_KEY_ID" "FAIL" "Key ID ist Platzhalter oder leer"
        return
    }

    # Format prüfen (8 oder 16 hex chars)
    if ($KeyID -notmatch "^[A-F0-9]{8}$|^[A-F0-9]{16}$") {
        Write-TestResult "GPG" "GPG_KEY_ID" "FAIL" "Ungültiges Format (erwartet: 8 oder 16 hex chars)"
        return
    }

    # gpg installiert?
    try {
        $null = gpg --version 2>&1 | Select-Object -First 1

        # Key im Keyring?
        $null = gpg --list-keys $KeyID 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-TestResult "GPG" "GPG_KEY_ID" "PASS" "Key existiert im Keyring"
        }
        else {
            Write-TestResult "GPG" "GPG_KEY_ID" "WARN" "Key nicht im Keyring gefunden (evtl. noch zu importieren)"
        }
    }
    catch {
        Write-TestResult "GPG" "GPG_KEY_ID" "SKIP" "gpg nicht installiert oder nicht im PATH"
    }
}

# Main Execution
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Secret Functionality Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# .env laden
if (-not (Test-Path $EnvFile)) {
    Write-Host "ERROR: $EnvFile nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "Lade $EnvFile..." -ForegroundColor Gray
$envVars = @{}
Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $Matches[1].Trim()
        $value = $Matches[2].Trim()
        # Quotes entfernen
        $value = $value -replace '^[''"]|[''"]$', ''
        $envVars[$key] = $value
    }
}

Write-Host "Gefunden: $($envVars.Count) Variablen`n" -ForegroundColor Gray

# Tests ausführen
Write-Host "Starte Tests...`n" -ForegroundColor Yellow

# GitHub
Test-GitHubToken -Token $envVars["GH_TOKEN"]

# Figma
Test-FigmaToken -Token $envVars["FIGMA_ACCESS_TOKEN"]

# Database
Test-DatabaseConnection -ConnectionString $envVars["DATABASE_URL"]

# SMTP
Test-SMTPCredentials -SmtpHost $envVars["SMTP_HOST"] -SmtpPort $envVars["SMTP_PORT"] -SmtpUser $envVars["SMTP_USER"] -SmtpPassword $envVars["SMTP_PASSWORD"]

# Stripe
Test-StripeKeys -PublishableKey $envVars["STRIPE_PUBLISHABLE_KEY"] -SecretKey $envVars["STRIPE_SECRET_KEY"]

# JWT
Test-JWTSecret -Secret $envVars["JWT_SECRET"]

# GPG
Test-GPGKey -KeyID $envVars["GPG_KEY_ID"]

# Zusammenfassung
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total:    $($Results.Total)" -ForegroundColor White
Write-Host "Passed:   $($Results.Passed)" -ForegroundColor Green
Write-Host "Failed:   $($Results.Failed)" -ForegroundColor Red
Write-Host "Warnings: $($Results.Warnings)" -ForegroundColor Yellow
Write-Host "Skipped:  $($Results.Skipped)" -ForegroundColor Gray

# JSON Export
$reportPath = "quality-reports/secret-functionality-test-$(Get-Date -Format 'yyyy-MM-dd_HHmmss').json"
$Results | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding utf8
Write-Host "`nDetaillierter Report: $reportPath" -ForegroundColor Gray

# Exit Code
if ($Results.Failed -gt 0) {
    Write-Host "`nERROR: $($Results.Failed) Tests fehlgeschlagen!" -ForegroundColor Red
    exit 1
}
elseif ($Results.Warnings -gt 0) {
    Write-Host "`nWARNING: $($Results.Warnings) Warnungen gefunden" -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "`nSUCCESS: Alle Tests bestanden!" -ForegroundColor Green
    exit 0
}
