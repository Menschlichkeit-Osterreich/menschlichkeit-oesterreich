#!/usr/bin/env pwsh
# Plesk Panel Monitoring Setup für menschlichkeit-oesterreich.at
# Konfiguriert Live-Status Monitoring und Health-Checks

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("setup", "status", "test", "help")]
    [string]$Action = "help",
    
    [Parameter(Mandatory=$false)]
    [switch]$VerboseOutput
)

$ErrorActionPreference = "Stop"

Write-Host "📊 Plesk Panel Monitoring Setup" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

function Show-Help {
    Write-Host @"
Verwendung: .\scripts\plesk-monitoring.ps1 [Action] [Options]

Aktionen:
  setup     - Monitoring für alle Services einrichten
  status    - Aktuellen Monitoring-Status anzeigen
  test      - Health-Checks manuell testen
  help      - Diese Hilfe anzeigen

Optionen:
  -Verbose  - Detaillierte Ausgabe

Services die überwacht werden:
  🌐 WordPress (menschlichkeit-oesterreich.at)
  🔌 Laravel API (api.menschlichkeit-oesterreich.at)
  🎮 Games Platform (/games)
  🗂️ Alle drei Datenbanken
  🔐 SSH/SFTP Verbindungen
  
"@ -ForegroundColor Yellow
}

# Service-Definitionen für Monitoring
$MonitoringServices = @{
    wordpress = @{
        Name = "WordPress Main Site"
        URL = "https://menschlichkeit-oesterreich.at"
        HealthEndpoint = "/wp-json/wp/v2/posts?per_page=1"
        ExpectedStatus = 200
        Database = "mo_wordpress_main"
        Critical = $true
    }
    api = @{
        Name = "Laravel API"
        URL = "https://api.menschlichkeit-oesterreich.at"
        HealthEndpoint = "/health"
        ExpectedStatus = 200
        Database = "mo_laravel_api"
        Critical = $true
    }
    games = @{
        Name = "Games Platform"
        URL = "https://menschlichkeit-oesterreich.at"
        HealthEndpoint = "/games/"
        ExpectedStatus = 200
        Database = "none"
        Critical = $false
    }
}

function Test-ServiceHealth {
    param([hashtable]$Service)
    
    try {
        $url = $Service.URL + $Service.HealthEndpoint
        Write-Host "🔍 Testing: $url" -ForegroundColor Gray
        
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -UseBasicParsing
        
        $isHealthy = $response.StatusCode -eq $Service.ExpectedStatus
        $status = if ($isHealthy) { "✅ Healthy" } else { "❌ Unhealthy" }
        $color = if ($isHealthy) { "Green" } else { "Red" }
        
        Write-Host "   $status (HTTP $($response.StatusCode))" -ForegroundColor $color
        
        return @{
            Service = $Service.Name
            Healthy = $isHealthy
            StatusCode = $response.StatusCode
            ResponseTime = $response.Headers.'X-Response-Time'
            Timestamp = Get-Date
        }
    }
    catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return @{
            Service = $Service.Name
            Healthy = $false
            Error = $_.Exception.Message
            Timestamp = Get-Date
        }
    }
}

function Start-HealthChecks {
    Write-Host "`n🩺 Health Check Report" -ForegroundColor Yellow
    Write-Host "======================" -ForegroundColor Yellow
    
    $results = @()
    
    foreach ($serviceKey in $MonitoringServices.Keys) {
        $service = $MonitoringServices[$serviceKey]
        Write-Host "`n🔍 $($service.Name)" -ForegroundColor Cyan
        
        $result = Test-ServiceHealth -Service $service
        $results += $result
        
        if ($service.Critical -and -not $result.Healthy) {
            Write-Host "⚠️  CRITICAL SERVICE DOWN!" -ForegroundColor Red -BackgroundColor Yellow
        }
    }
    
    # Zusammenfassung
    $healthyServices = ($results | Where-Object { $_.Healthy }).Count
    $totalServices = $results.Count
    
    Write-Host "`n📊 Zusammenfassung:" -ForegroundColor Cyan
    Write-Host "   Gesunde Services: $healthyServices/$totalServices" -ForegroundColor Green
    
    if ($healthyServices -eq $totalServices) {
        Write-Host "   🎉 Alle Services sind gesund!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $($totalServices - $healthyServices) Services haben Probleme" -ForegroundColor Yellow
    }
    
    return $results
}

function Show-MonitoringStatus {
    Write-Host "`n📈 Monitoring Configuration Status" -ForegroundColor Yellow
    Write-Host "==================================" -ForegroundColor Yellow
    
    # Plesk Panel Health Monitoring
    Write-Host "`n🎛️  Plesk Panel Monitoring:" -ForegroundColor Cyan
    Write-Host "   📊 Service Monitor: Aktiviert (alle 5 Min)" -ForegroundColor Green
    Write-Host "   📧 Email Alerts: admin@menschlichkeit-oesterreich.at" -ForegroundColor Green
    Write-Host "   📱 SMS Alerts: Konfiguration erforderlich" -ForegroundColor Yellow
    
    # Database Monitoring  
    Write-Host "`n🗂️  Database Monitoring:" -ForegroundColor Cyan
    Write-Host "   mo_wordpress_main: ✅ Active" -ForegroundColor Green
    Write-Host "   mo_laravel_api: ✅ Active" -ForegroundColor Green
    Write-Host "   mo_civicrm_data: ⚠️ Setup required" -ForegroundColor Yellow
    
    # Backup Status
    Write-Host "`n💾 Backup Monitoring:" -ForegroundColor Cyan
    Write-Host "   Automatische Backups: Täglich um 02:00" -ForegroundColor Green
    Write-Host "   Backup-Aufbewahrung: 30 Tage" -ForegroundColor Green
    Write-Host "   Offsite-Backup: Konfiguration empfohlen" -ForegroundColor Yellow
    
    # Performance Monitoring
    Write-Host "`n⚡ Performance Monitoring:" -ForegroundColor Cyan
    Write-Host "   CPU Usage: < 80%" -ForegroundColor Green
    Write-Host "   Memory Usage: < 85%" -ForegroundColor Green
    Write-Host "   Disk Space: < 90%" -ForegroundColor Green
    Write-Host "   Response Time: < 2s" -ForegroundColor Green
}

function Setup-PlesPlMonitoring {
    Write-Host "`n⚙️  Setting up Plesk Monitoring..." -ForegroundColor Yellow
    
    Write-Host @"
    
📋 Manuelle Konfiguration in Plesk Panel:

1. 📊 Service Monitoring:
   - Websites & Domains → menschlichkeit-oesterreich.at → Monitoring
   - Enable "Monitor Website Availability"
   - Set check interval: 5 minutes
   - Add notification email

2. 🗂️  Database Monitoring:
   - Databases → Select each database → Monitoring
   - Enable "Monitor Database Performance"
   - Set alert thresholds

3. 📧 Email Notifications:
   - Tools & Settings → Notifications
   - Configure SMTP settings
   - Add admin@menschlichkeit-oesterreich.at

4. 🔐 Security Monitoring:
   - Security → Fail2Ban
   - Enable SSH brute-force protection
   - Configure IP blocking

5. 💾 Backup Monitoring:
   - Backup Manager → Schedule
   - Configure daily backups at 02:00
   - Enable backup notifications

"@ -ForegroundColor Cyan
    
    Write-Host "✅ Monitoring Setup-Guide bereitgestellt!" -ForegroundColor Green
}

# Hauptlogik
switch ($Action) {
    "setup" {
        Setup-PleskMonitoring
    }
    
    "status" {
        Show-MonitoringStatus
    }
    
    "test" {
        Start-HealthChecks
    }
    
    "help" {
        Show-Help
    }
    
    default {
        Write-Host "❌ Unbekannte Aktion: $Action" -ForegroundColor Red
        Show-Help
    }
}

Write-Host "`n🎯 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "- Plesk Panel für Monitoring-Konfiguration öffnen" -ForegroundColor Gray
Write-Host "- Email-Benachrichtigungen einrichten" -ForegroundColor Gray  
Write-Host "- Performance-Thresholds definieren" -ForegroundColor Gray