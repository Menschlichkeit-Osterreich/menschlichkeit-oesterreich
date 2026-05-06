# Plesk Database Setup Script - Erneuter Upload mit Verifikation
# Lädt das Database Setup Script erneut hoch und überprüft den Upload

param(
    [switch]$Verify = $true
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

# Base Directory
$BASE_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$SETUP_FILE = "$BASE_DIR\plesk-db-setup.php"

Write-ColorOutput "`n🔧 Plesk Database Setup - Erneuter Upload..." -ForegroundColor Cyan
Write-ColorOutput "Server: $USER@$HOST_ADDR" -ForegroundColor Cyan

# Prüfe lokale Datei
if (-not (Test-Path $SETUP_FILE)) {
    Write-ColorOutput "❌ Lokale Setup-Datei nicht gefunden: $SETUP_FILE" -ForegroundColor Red
    exit 1
}

Write-ColorOutput "✅ Lokale Setup-Datei gefunden: $SETUP_FILE" -ForegroundColor Green

# Upload mit verschiedenen Pfaden versuchen
$UPLOAD_PATHS = @(
    "httpdocs/plesk-db-setup.php",
    "public_html/plesk-db-setup.php", 
    "www/plesk-db-setup.php",
    "html/plesk-db-setup.php",
    "./plesk-db-setup.php"
)

$success = $false

foreach ($remote_path in $UPLOAD_PATHS) {
    Write-ColorOutput "`n📤 Versuche Upload nach: $remote_path" -ForegroundColor Cyan
    
    try {
        $result = & scp -i "$SSH_KEY" -o "StrictHostKeyChecking=accept-new" "$SETUP_FILE" "${USER}@${HOST_ADDR}:$remote_path" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Upload erfolgreich nach: $remote_path" -ForegroundColor Green
            $success = $true
            $successful_path = $remote_path
            break
        } else {
            Write-ColorOutput "❌ Upload fehlgeschlagen für: $remote_path" -ForegroundColor Yellow
            Write-ColorOutput "   Fehler: $result" -ForegroundColor Gray
        }
    }
    catch {
        Write-ColorOutput "❌ Upload-Fehler für $remote_path`: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

if (-not $success) {
    Write-ColorOutput "`n❌ Alle Upload-Versuche fehlgeschlagen!" -ForegroundColor Red
    Write-ColorOutput "Mögliche Ursachen:" -ForegroundColor Yellow
    Write-ColorOutput "- SSH-Key Berechtigung" -ForegroundColor Gray
    Write-ColorOutput "- Falsche Verzeichnispfade" -ForegroundColor Gray
    Write-ColorOutput "- Server-Konfiguration" -ForegroundColor Gray
    exit 1
}

Write-ColorOutput "`n🎯 Setup-Script erfolgreich hochgeladen!" -ForegroundColor Green
Write-ColorOutput "Pfad auf Server: $successful_path" -ForegroundColor Green

Write-ColorOutput "`n📋 Mögliche URLs zum Testen:" -ForegroundColor Cyan
Write-ColorOutput "• https://menschlichkeit-oesterreich.at/plesk-db-setup.php?key=MO_SETUP_2025_SECURE_KEY" -ForegroundColor White
Write-ColorOutput "• https://www.menschlichkeit-oesterreich.at/plesk-db-setup.php?key=MO_SETUP_2025_SECURE_KEY" -ForegroundColor White

Write-ColorOutput "`n⚠️  Wichtiger Hinweis:" -ForegroundColor Yellow
Write-ColorOutput "Falls die URL immer noch nicht funktioniert:" -ForegroundColor Yellow
Write-ColorOutput "1. Plesk Panel öffnen und File Manager verwenden" -ForegroundColor Gray
Write-ColorOutput "2. Script manuell in httpdocs/ Ordner hochladen" -ForegroundColor Gray
Write-ColorOutput "3. Berechtigung auf 755 setzen: chmod 755 plesk-db-setup.php" -ForegroundColor Gray

Write-ColorOutput "`n🔐 Setup Key: MO_SETUP_2025_SECURE_KEY" -ForegroundColor Cyan