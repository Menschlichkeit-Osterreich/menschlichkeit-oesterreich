# PowerShell Script für Plesk Database Setup Upload
# Lädt die Database-Setup-Dateien auf den Plesk-Server hoch

param(
    [switch]$Execute = $false  # Set to $true to execute database setup remotely
)

# ====== Server-Zugang ======
$HOST_ADDR = "5.183.217.146"
$USER = "dmpl20230054"
$SSH_KEY = "C:\Users\schul\.ssh\id_ed25519"

# ====== Lokale Dateien ======
$BASE_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PLESK_DB_SETUP = "$BASE_DIR\plesk-db-setup.php"
$ENV_TEMPLATES = @(
    "$BASE_DIR\menschlichkeit-oesterreich-monorepo\.env.template",
    "$BASE_DIR\menschlichkeit-oesterreich-monorepo\api.menschlichkeit-oesterreich.at\.env.template",
    "$BASE_DIR\menschlichkeit-oesterreich-monorepo\crm.menschlichkeit-oesterreich.at\.env.template"
)

function Write-ColorOutput {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [ConsoleColor]$ForegroundColor = [ConsoleColor]::White
    )
    
    $originalColor = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $originalColor
}

function Upload-File {
    param (
        [string]$LocalFile,
        [string]$RemotePath,
        [string]$Description
    )
    
    if (-not (Test-Path $LocalFile)) {
        Write-ColorOutput "❌ Lokale Datei nicht gefunden: $LocalFile" -ForegroundColor Red
        return $false
    }
    
    Write-ColorOutput "📤 Upload: $Description..." -ForegroundColor Cyan
    
    $batchFile = Join-Path $env:TEMP "sftp_upload_$([Guid]::NewGuid().ToString()).txt"
    
    "put `"$LocalFile`" `"$RemotePath`"" | Out-File -FilePath $batchFile -Encoding utf8
    
    try {
        $result = & sftp -i "$SSH_KEY" -o "StrictHostKeyChecking=accept-new" -b $batchFile "$USER@$HOST_ADDR" 2>&1
        $success = ($LASTEXITCODE -eq 0)
        
        if ($success) {
            Write-ColorOutput "✅ $Description erfolgreich hochgeladen" -ForegroundColor Green
        } else {
            Write-ColorOutput "❌ Upload fehlgeschlagen: $result" -ForegroundColor Red
        }
        
        return $success
    }
    catch {
        Write-ColorOutput "❌ Upload-Fehler: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    finally {
        Remove-Item -Path $batchFile -Force -ErrorAction SilentlyContinue
    }
}

function Execute-RemoteCommand {
    param (
        [string]$Command,
        [string]$Description
    )
    
    Write-ColorOutput "🔧 Ausführung: $Description..." -ForegroundColor Cyan
    
    try {
        $result = & ssh -i "$SSH_KEY" -o "StrictHostKeyChecking=accept-new" "$USER@$HOST_ADDR" $Command 2>&1
        $success = ($LASTEXITCODE -eq 0)
        
        if ($success) {
            Write-ColorOutput "✅ $Description erfolgreich" -ForegroundColor Green
            if ($result) {
                Write-ColorOutput $result -ForegroundColor Gray
            }
        } else {
            Write-ColorOutput "❌ Fehler bei $Description`: $result" -ForegroundColor Red
        }
        
        return $success
    }
    catch {
        Write-ColorOutput "❌ SSH-Fehler: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# ====== Hauptprogramm ======
Write-ColorOutput "`n🚀 Plesk Database Setup Upload..." -ForegroundColor Cyan
Write-ColorOutput "Server: $USER@$HOST_ADDR" -ForegroundColor Cyan

# 1. Database Setup Script hochladen
$success = Upload-File -LocalFile $PLESK_DB_SETUP -RemotePath "/httpdocs/plesk-db-setup.php" -Description "Database Setup Script"

if (-not $success) {
    Write-ColorOutput "❌ Upload des Database Setup Scripts fehlgeschlagen. Abbruch." -ForegroundColor Red
    exit 1
}

# 2. .env Templates hochladen
Write-ColorOutput "`n📁 Upload .env Templates..." -ForegroundColor Cyan

$template_success = @()

# Main WordPress .env Template
$template_success += Upload-File -LocalFile "$BASE_DIR\menschlichkeit-oesterreich-monorepo\.env.template" -RemotePath "/httpdocs/.env.template" -Description "WordPress Main .env Template"

# Laravel API .env Template
$template_success += Upload-File -LocalFile "$BASE_DIR\menschlichkeit-oesterreich-monorepo\api.menschlichkeit-oesterreich.at\.env.template" -RemotePath "/api.menschlichkeit-oesterreich.at/.env.template" -Description "Laravel API .env Template"

# CiviCRM .env Template
$template_success += Upload-File -LocalFile "$BASE_DIR\menschlichkeit-oesterreich-monorepo\crm.menschlichkeit-oesterreich.at\.env.template" -RemotePath "/crm.menschlichkeit-oesterreich.at/.env.template" -Description "CiviCRM .env Template"

# 3. Berechtigung für Setup-Script setzen
Execute-RemoteCommand -Command "chmod 755 /var/www/vhosts/*/httpdocs/plesk-db-setup.php" -Description "Setup-Script Berechtigung setzen"

# 4. Optional: Database Setup ausführen
if ($Execute) {
    Write-ColorOutput "`n🔧 Database Setup wird ausgeführt..." -ForegroundColor Yellow
    Write-ColorOutput "⚠️  Achtung: Dies erfordert das Database Root Passwort!" -ForegroundColor Yellow
    
    $rootPassword = Read-Host -AsSecureString "Database Root Passwort eingeben"
    $rootPasswordText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($rootPassword))
    
    # Setup via curl (falls möglich)
    $setupUrl = "https://menschlichkeit-oesterreich.at/plesk-db-setup.php"
    Write-ColorOutput "Database Setup URL: $setupUrl" -ForegroundColor Gray
    Write-ColorOutput "Manuell im Browser ausführen mit Key: MO_SETUP_2025_SECURE_KEY" -ForegroundColor Yellow
}

# ====== Zusammenfassung ======
$all_success = $success -and ($template_success -notcontains $false)

if ($all_success) {
    Write-ColorOutput "`n✅ Alle Uploads erfolgreich abgeschlossen!" -ForegroundColor Green
    Write-ColorOutput "`n🎯 Nächste Schritte:" -ForegroundColor Yellow
    Write-ColorOutput "1. Database Setup im Browser ausführen:" -ForegroundColor Yellow
    Write-ColorOutput "   https://menschlichkeit-oesterreich.at/plesk-db-setup.php?key=MO_SETUP_2025_SECURE_KEY" -ForegroundColor Gray
    Write-ColorOutput "2. .env-Dateien von Templates kopieren und anpassen" -ForegroundColor Yellow  
    Write-ColorOutput "3. WordPress Salts generieren und einsetzen" -ForegroundColor Yellow
    Write-ColorOutput "4. Laravel App Key generieren: php artisan key:generate" -ForegroundColor Yellow
    Write-ColorOutput "5. CiviCRM Site Key und API Key generieren" -ForegroundColor Yellow
    Write-ColorOutput "6. Setup-Script nach erfolgreicher Ausführung löschen!" -ForegroundColor Yellow
} else {
    Write-ColorOutput "`n❌ Einige Uploads sind fehlgeschlagen!" -ForegroundColor Red
    Write-ColorOutput "Bitte Fehler beheben und erneut versuchen." -ForegroundColor Red
}

Write-ColorOutput "`n📊 Upload-Status:" -ForegroundColor Cyan
Write-ColorOutput "Database Setup Script: $(if ($success) { '✅' } else { '❌' })" -ForegroundColor $(if ($success) { 'Green' } else { 'Red' })
Write-ColorOutput ".env Templates: $(if ($template_success -notcontains $false) { '✅' } else { '❌' })" -ForegroundColor $(if ($template_success -notcontains $false) { 'Green' } else { 'Red' })