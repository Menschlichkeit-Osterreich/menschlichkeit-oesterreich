# Test URLs für das Database Setup Script

$BASE_URL = "menschlichkeit-oesterreich.at"
$SCRIPT_NAME = "plesk-db-setup.php"
$KEY = "MO_SETUP_2025_SECURE_KEY"

$TEST_URLS = @(
    "https://$BASE_URL/$SCRIPT_NAME?key=$KEY",
    "https://www.$BASE_URL/$SCRIPT_NAME?key=$KEY",
    "http://$BASE_URL/$SCRIPT_NAME?key=$KEY",
    "http://www.$BASE_URL/$SCRIPT_NAME?key=$KEY"
)

Write-Host "🔍 Testing Database Setup Script URLs..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

foreach ($url in $TEST_URLS) {
    Write-Host "`n📋 Testing: $url" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method HEAD -TimeoutSec 10 -ErrorAction Stop
        Write-Host "✅ Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
        Write-Host "✅ URL ist erreichbar!" -ForegroundColor Green
    }
    catch {
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            Write-Host "❌ Status: $statusCode" -ForegroundColor Red
            
            if ($statusCode -eq 404) {
                Write-Host "❌ File not found - Script ist nicht an diesem Pfad" -ForegroundColor Red
            } elseif ($statusCode -eq 403) {
                Write-Host "⚠️  Access forbidden - Script existiert aber keine Berechtigung" -ForegroundColor Yellow
            } elseif ($statusCode -eq 500) {
                Write-Host "⚠️  Server error - Script hat Fehler" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Connection error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n🎯 Empfohlene URL:" -ForegroundColor Green
Write-Host "https://$BASE_URL/$SCRIPT_NAME?key=$KEY" -ForegroundColor White

Write-Host "`n💡 Alternative Lösungen falls URL nicht funktioniert:" -ForegroundColor Yellow
Write-Host "1. Plesk Panel → File Manager → httpdocs → Datei suchen" -ForegroundColor Gray
Write-Host "2. Script-Berechtigung prüfen: chmod 755 plesk-db-setup.php" -ForegroundColor Gray
Write-Host "3. PHP-Fehlerlog in Plesk prüfen" -ForegroundColor Gray
Write-Host "4. Domain-Konfiguration in Plesk überprüfen" -ForegroundColor Gray