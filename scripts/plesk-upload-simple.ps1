# Vereinfachtes Plesk Database Setup Upload
# Lädt nur die wichtigsten Dateien hoch

param(
    [switch]$TestConnection = $false
)

# ====== Server-Zugang ======
$HOST_ADDR = "5.183.217.146"
$USER = "dmpl20230054"
$SSH_KEY = "C:\Users\schul\.ssh\id_ed25519"

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

function Test-Connection {
    Write-ColorOutput "🔍 Testing SSH Connection..." -ForegroundColor Cyan
    
    try {
        $result = & ssh -i "$SSH_KEY" -o "StrictHostKeyChecking=accept-new" -o "ConnectTimeout=10" "$USER@$HOST_ADDR" "echo 'Connection successful'"
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ SSH Connection erfolgreich" -ForegroundColor Green
            return $true
        } else {
            Write-ColorOutput "❌ SSH Connection fehlgeschlagen: $result" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-ColorOutput "❌ SSH Test-Fehler: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Upload-SingleFile {
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
    Write-ColorOutput "   Von: $LocalFile" -ForegroundColor Gray
    Write-ColorOutput "   Nach: $RemotePath" -ForegroundColor Gray
    
    try {
        # Verwende scp anstatt sftp für einfacheren Upload
        $result = & scp -i "$SSH_KEY" -o "StrictHostKeyChecking=accept-new" "$LocalFile" "${USER}@${HOST_ADDR}:$RemotePath" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ $Description erfolgreich hochgeladen" -ForegroundColor Green
            return $true
        } else {
            Write-ColorOutput "❌ Upload fehlgeschlagen für $Description" -ForegroundColor Red
            Write-ColorOutput "   Fehler: $result" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-ColorOutput "❌ Upload-Fehler: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# ====== Hauptprogramm ======
Write-ColorOutput "`n🚀 Vereinfachtes Plesk Setup Upload..." -ForegroundColor Cyan
Write-ColorOutput "Server: $USER@$HOST_ADDR" -ForegroundColor Cyan

# Test Connection wenn gewünscht
if ($TestConnection) {
    if (-not (Test-Connection)) {
        Write-ColorOutput "❌ SSH-Verbindung fehlgeschlagen. Abbruch." -ForegroundColor Red
        exit 1
    }
}

# Base Directory
$BASE_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Database Setup Script hochladen
Write-ColorOutput "`n📋 Upload Database Setup Script..." -ForegroundColor Cyan
$db_success = Upload-SingleFile -LocalFile "$BASE_DIR\plesk-db-setup.php" -RemotePath "httpdocs/plesk-db-setup.php" -Description "Database Setup Script"

# 2. WordPress .env Template hochladen
Write-ColorOutput "`n📝 Upload WordPress .env Template..." -ForegroundColor Cyan
$wp_env_success = Upload-SingleFile -LocalFile "$BASE_DIR\menschlichkeit-oesterreich-monorepo\.env.template" -RemotePath "httpdocs/.env.template" -Description "WordPress .env Template"

# 3. Laravel API .env Template hochladen  
Write-ColorOutput "`n🔧 Upload Laravel API .env Template..." -ForegroundColor Cyan
$api_env_success = Upload-SingleFile -LocalFile "$BASE_DIR\menschlichkeit-oesterreich-monorepo\api.menschlichkeit-oesterreich.at\.env.template" -RemotePath "api.menschlichkeit-oesterreich.at/.env.template" -Description "Laravel API .env Template"

# 4. CiviCRM .env Template hochladen
Write-ColorOutput "`n🏢 Upload CiviCRM .env Template..." -ForegroundColor Cyan  
$crm_env_success = Upload-SingleFile -LocalFile "$BASE_DIR\menschlichkeit-oesterreich-monorepo\crm.menschlichkeit-oesterreich.at\.env.template" -RemotePath "crm.menschlichkeit-oesterreich.at/.env.template" -Description "CiviCRM .env Template"

# ====== Zusammenfassung ======
$all_success = $db_success -and $wp_env_success -and $api_env_success -and $crm_env_success

Write-ColorOutput "`n📊 Upload-Ergebnisse:" -ForegroundColor Cyan
Write-ColorOutput "Database Setup Script: $(if ($db_success) { '✅ Erfolgreich' } else { '❌ Fehlgeschlagen' })" -ForegroundColor $(if ($db_success) { 'Green' } else { 'Red' })
Write-ColorOutput "WordPress .env Template: $(if ($wp_env_success) { '✅ Erfolgreich' } else { '❌ Fehlgeschlagen' })" -ForegroundColor $(if ($wp_env_success) { 'Green' } else { 'Red' })
Write-ColorOutput "Laravel API .env Template: $(if ($api_env_success) { '✅ Erfolgreich' } else { '❌ Fehlgeschlagen' })" -ForegroundColor $(if ($api_env_success) { 'Green' } else { 'Red' })
Write-ColorOutput "CiviCRM .env Template: $(if ($crm_env_success) { '✅ Erfolgreich' } else { '❌ Fehlgeschlagen' })" -ForegroundColor $(if ($crm_env_success) { 'Green' } else { 'Red' })

if ($all_success) {
    Write-ColorOutput "`n✅ Alle Dateien erfolgreich hochgeladen!" -ForegroundColor Green
    Write-ColorOutput "`n🎯 Nächste Schritte:" -ForegroundColor Yellow
    Write-ColorOutput "1. Database Setup im Browser ausführen:" -ForegroundColor Yellow
    Write-ColorOutput "   https://menschlichkeit-oesterreich.at/plesk-db-setup.php?key=MO_SETUP_2025_SECURE_KEY" -ForegroundColor Gray
    Write-ColorOutput "2. .env-Dateien von Templates erstellen:" -ForegroundColor Yellow
    Write-ColorOutput "   - httpdocs/.env (WordPress)" -ForegroundColor Gray
    Write-ColorOutput "   - api.menschlichkeit-oesterreich.at/.env (Laravel)" -ForegroundColor Gray  
    Write-ColorOutput "   - crm.menschlichkeit-oesterreich.at/.env (CiviCRM)" -ForegroundColor Gray
    Write-ColorOutput "3. Nach Database Setup: .env-Dateien mit echten DB-Daten aktualisieren" -ForegroundColor Yellow
    Write-ColorOutput "4. Setup-Script löschen: rm httpdocs/plesk-db-setup.php" -ForegroundColor Yellow
} else {
    Write-ColorOutput "`n❌ Einige Uploads sind fehlgeschlagen!" -ForegroundColor Red
    Write-ColorOutput "Überprüfe SSH-Verbindung und Dateipfade." -ForegroundColor Red
}