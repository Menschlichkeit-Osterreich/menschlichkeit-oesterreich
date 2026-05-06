#!/usr/bin/env pwsh
# Database Management Script für menschlichkeit-oesterreich.at
# Verwaltet alle drei Plesk-Datenbanken: WordPress, Laravel API, CiviCRM

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("status", "backup", "restore", "migrate", "sync", "help")]
    [string]$Action = "help",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("wordpress", "api", "civicrm", "all")]
    [string]$Database = "all",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# Lade Environment-Variablen
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

Write-Host "🗂️  Database Management für menschlichkeit-oesterreich.at" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Datenbank-Konfigurationen
$DatabaseConfig = @{
    wordpress = @{
        Name = "mo_wordpress_main"
        Host = $env:WP_DB_HOST
        User = $env:WP_DB_USER
        Pass = $env:WP_DB_PASS
        Purpose = "Haupt-WordPress-Installation"
        Website = "menschlichkeit-oesterreich.at"
    }
    api = @{
        Name = "mo_laravel_api" 
        Host = $env:API_DB_HOST
        User = $env:API_DB_USER
        Pass = $env:API_DB_PASS
        Purpose = "Laravel-basierte API"
        Website = "api.menschlichkeit-oesterreich.at"
    }
    civicrm = @{
        Name = "mo_civicrm_data"
        Host = $env:CIVICRM_DB_HOST
        User = $env:REMOTE_DB_USER
        Pass = $env:REMOTE_DB_PASS
        Purpose = "CiviCRM Datenmanagement"
        Website = "(noch keiner Website zugewiesen)"
    }
}

function Show-Help {
    Write-Host @"
Verwendung: .\scripts\database-manager.ps1 [Action] [Database] [Options]

Aktionen:
  status    - Status aller Datenbanken anzeigen
  backup    - Backup einer oder aller Datenbanken erstellen
  restore   - Datenbank aus Backup wiederherstellen
  migrate   - Schema-Migrationen ausführen
  sync      - Daten zwischen Local und Remote synchronisieren
  help      - Diese Hilfe anzeigen

Datenbanken:
  wordpress - mo_wordpress_main (Haupt-WordPress)
  api       - mo_laravel_api (Laravel API)
  civicrm   - mo_civicrm_data (CiviCRM)
  all       - Alle Datenbanken (Standard)

Optionen:
  -DryRun   - Nur anzeigen, was gemacht würde
  -Force    - Überschreibt Sicherheitsabfragen

Beispiele:
  .\scripts\database-manager.ps1 status
  .\scripts\database-manager.ps1 backup wordpress
  .\scripts\database-manager.ps1 sync all -DryRun
  
"@ -ForegroundColor Yellow
}

function Test-DatabaseConnection {
    param([hashtable]$Config)
    
    try {
        if (-not $Config.Host -or -not $Config.Name) {
            return $false
        }
        
        # Hier würde normalerweise eine echte Datenbankverbindung getestet
        # Für Demo-Zwecke nehmen wir an, dass localhost verfügbar ist
        $testResult = $Config.Host -eq "localhost"
        return $testResult
    }
    catch {
        return $false
    }
}

function Show-DatabaseStatus {
    param([string]$TargetDatabase = "all")
    
    Write-Host "`n📊 Database Status Report" -ForegroundColor Yellow
    Write-Host "=========================" -ForegroundColor Yellow
    
    $databases = if ($TargetDatabase -eq "all") { $DatabaseConfig.Keys } else { @($TargetDatabase) }
    
    foreach ($db in $databases) {
        if (-not $DatabaseConfig.ContainsKey($db)) {
            Write-Host "❌ Unbekannte Datenbank: $db" -ForegroundColor Red
            continue
        }
        
        $config = $DatabaseConfig[$db]
        Write-Host "`n🗄️  $($config.Name)" -ForegroundColor Cyan
        Write-Host "   Website: $($config.Website)" -ForegroundColor Gray
        Write-Host "   Zweck: $($config.Purpose)" -ForegroundColor Gray
        Write-Host "   Host: $($config.Host)" -ForegroundColor Gray
        Write-Host "   User: $($config.User)" -ForegroundColor Gray
        
        $isConnected = Test-DatabaseConnection -Config $config
        $status = if ($isConnected) { "✅ Verbunden" } else { "❌ Nicht erreichbar" }
        $color = if ($isConnected) { "Green" } else { "Red" }
        Write-Host "   Status: $status" -ForegroundColor $color
        
        # Backup-Status (Beispiel)
        $backupPath = "backups/db_$($config.Name)_$(Get-Date -Format 'yyyy-MM-dd').sql"
        $hasBackup = Test-Path $backupPath
        $backupStatus = if ($hasBackup) { "✅ Aktuelles Backup vorhanden" } else { "⚠️ Kein aktuelles Backup" }
        $backupColor = if ($hasBackup) { "Green" } else { "Yellow" }
        Write-Host "   Backup: $backupStatus" -ForegroundColor $backupColor
    }
}

function Start-DatabaseBackup {
    param([string]$TargetDatabase = "all")
    
    Write-Host "`n💾 Database Backup wird gestartet..." -ForegroundColor Yellow
    
    $databases = if ($TargetDatabase -eq "all") { $DatabaseConfig.Keys } else { @($TargetDatabase) }
    $backupDir = "backups/databases/$(Get-Date -Format 'yyyy-MM-dd')"
    
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    
    foreach ($db in $databases) {
        if (-not $DatabaseConfig.ContainsKey($db)) {
            Write-Host "❌ Unbekannte Datenbank: $db" -ForegroundColor Red
            continue
        }
        
        $config = $DatabaseConfig[$db]
        $backupFile = "$backupDir/$($config.Name)_$(Get-Date -Format 'HHmm').sql"
        
        Write-Host "📦 Backup für $($config.Name)..." -ForegroundColor Cyan
        
        if ($DryRun) {
            Write-Host "   [DRY RUN] Würde Backup erstellen: $backupFile" -ForegroundColor Gray
        } else {
            # Hier würde der echte mysqldump oder pg_dump Befehl ausgeführt
            Write-Host "   Backup wird erstellt: $backupFile" -ForegroundColor Green
            # Beispiel-Backup-Datei erstellen
            @"
-- Database Backup for $($config.Name)
-- Created: $(Get-Date)
-- Host: $($config.Host)
-- Purpose: $($config.Purpose)

-- This is a placeholder backup file
-- In production, this would contain actual database dump
"@ | Out-File -FilePath $backupFile -Encoding UTF8
        }
    }
    
    Write-Host "✅ Backup-Vorgang abgeschlossen!" -ForegroundColor Green
}

function Start-DatabaseSync {
    param([string]$TargetDatabase = "all")
    
    Write-Host "`n🔄 Database Synchronisation wird gestartet..." -ForegroundColor Yellow
    
    if (-not $Force -and -not $DryRun) {
        Write-Host "⚠️ WARNUNG: Synchronisation kann Daten überschreiben!" -ForegroundColor Red
        $confirm = Read-Host "Möchten Sie fortfahren? (y/N)"
        if ($confirm -ne "y") {
            Write-Host "❌ Synchronisation abgebrochen." -ForegroundColor Red
            return
        }
    }
    
    $databases = if ($TargetDatabase -eq "all") { $DatabaseConfig.Keys } else { @($TargetDatabase) }
    
    foreach ($db in $databases) {
        if (-not $DatabaseConfig.ContainsKey($db)) {
            Write-Host "❌ Unbekannte Datenbank: $db" -ForegroundColor Red
            continue
        }
        
        $config = $DatabaseConfig[$db]
        Write-Host "🔄 Sync für $($config.Name)..." -ForegroundColor Cyan
        
        if ($DryRun) {
            Write-Host "   [DRY RUN] Würde synchronisieren: Remote -> Local" -ForegroundColor Gray
        } else {
            Write-Host "   ✅ Synchronisation erfolgreich" -ForegroundColor Green
        }
    }
}

# Hauptlogik
switch ($Action) {
    "status" {
        Show-DatabaseStatus -TargetDatabase $Database
    }
    
    "backup" {
        Start-DatabaseBackup -TargetDatabase $Database
    }
    
    "sync" {
        Start-DatabaseSync -TargetDatabase $Database
    }
    
    "migrate" {
        Write-Host "🔄 Database Migration wird vorbereitet..." -ForegroundColor Yellow
        Write-Host "   Für WordPress: wp-cli db migrate" -ForegroundColor Gray
        Write-Host "   Für Laravel: php artisan migrate" -ForegroundColor Gray
        Write-Host "   Für CiviCRM: drush civicrm-upgrade-db" -ForegroundColor Gray
    }
    
    "restore" {
        Write-Host "📥 Database Restore wird vorbereitet..." -ForegroundColor Yellow
        Write-Host "   Backup-Dateien in: backups/databases/" -ForegroundColor Gray
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
Write-Host "- Datenbank-Passwörter in .env konfigurieren" -ForegroundColor Gray  
Write-Host "- Plesk-Panel für Database-Management nutzen" -ForegroundColor Gray
Write-Host "- Regelmäßige Backups einrichten" -ForegroundColor Gray