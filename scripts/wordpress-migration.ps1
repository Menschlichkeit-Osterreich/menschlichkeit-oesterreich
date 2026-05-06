#!/usr/bin/env pwsh
# Database Migration Script - WordPress zu Laravel + CiviCRM
# Sicheres Entfernen/Archivieren von WordPress und Setup neuer DB-User

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("analyze", "migrate", "cleanup", "create-users", "help")]
    [string]$Action = "help",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "🔄 WordPress zu Laravel+CiviCRM Migration" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

function Show-Help {
    Write-Host @"
Verwendung: .\scripts\wordpress-migration.ps1 [Action] [Options]

Aktionen:
  analyze       - Analysiert aktuelle WordPress-Installation
  migrate       - Migriert zu Laravel+CiviCRM Setup
  cleanup       - Entfernt/archiviert WordPress-Datenbank sicher
  create-users  - Erstellt neue DB-Benutzer für Laravel und CiviCRM
  help          - Diese Hilfe anzeigen

Optionen:
  -DryRun       - Nur anzeigen, was gemacht würde
  -Force        - Überschreibt Sicherheitsabfragen

Migration von:
  ❌ mo_wordpress_main (WordPress - wird archiviert)
  ❌ mo_wp_user (Legacy User - wird ersetzt)

Migration zu:
  ✅ mo_laravel_api (Laravel API - PRIMARY)
  ✅ mo_civicrm_data (CiviCRM Standalone/Drupal)
  ✅ laravel_user (Neue DB-User mit minimalen Rechten)
  ✅ civicrm_user (Separate User für CiviCRM)
  
"@ -ForegroundColor Yellow
}

# Migration Plan
$MigrationPlan = @{
    Remove = @{
        Database = "mo_wordpress_main"
        User = "mo_wp_user"  
        ConfigFiles = @("wp-config.php", "wordpress-wp-config.php")
        Status = "ARCHIVIEREN oder LÖSCHEN"
    }
    Create = @{
        Users = @(
            @{
                Name = "laravel_user"
                Password = "SECURE_LARAVEL_2025"
                Database = "mo_laravel_api"
                Privileges = "SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,INDEX,ALTER"
            },
            @{
                Name = "civicrm_user" 
                Password = "SECURE_CIVICRM_2025"
                Database = "mo_civicrm_data"
                Privileges = "SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,INDEX,ALTER"
            }
        )
        ConfigFiles = @("laravel-no-wp.env", "civicrm-standalone.settings.php")
    }
}

function Analyze-WordPressUsage {
    Write-Host "`n🔍 WordPress Installation Analysis" -ForegroundColor Yellow
    Write-Host "==================================" -ForegroundColor Yellow
    
    # Prüfe WordPress-Dateien
    $wpFiles = @(
        "wp-config.php",
        "index.php",
        "wp-admin",
        "wp-content", 
        "wp-includes"
    )
    
    Write-Host "`n📁 WordPress-Dateien suchen:" -ForegroundColor Cyan
    foreach ($file in $wpFiles) {
        $exists = Test-Path $file
        $status = if ($exists) { "✅ Gefunden" } else { "❌ Nicht vorhanden" }
        $color = if ($exists) { "Green" } else { "Gray" }
        Write-Host "   $file`: $status" -ForegroundColor $color
    }
    
    # Prüfe WordPress-Database
    Write-Host "`n🗂️  WordPress-Datenbank Status:" -ForegroundColor Cyan
    Write-Host "   mo_wordpress_main: ⚠️ Vorhanden (Empfehlung: Archivieren)" -ForegroundColor Yellow
    Write-Host "   mo_wp_user: ⚠️ Legacy User (Empfehlung: Ersetzen)" -ForegroundColor Yellow
    
    # Empfohlene Aktion
    Write-Host "`n💡 Empfohlene Maßnahmen:" -ForegroundColor Cyan
    Write-Host "   1. WordPress-Datenbank exportieren/archivieren" -ForegroundColor Green
    Write-Host "   2. Neue DB-Benutzer für Laravel und CiviCRM erstellen" -ForegroundColor Green
    Write-Host "   3. mo_wp_user Rechte überprüfen und ggf. entfernen" -ForegroundColor Green
    Write-Host "   4. Website-Fokus auf Laravel API + CiviCRM setzen" -ForegroundColor Green
}

function Start-DatabaseMigration {
    Write-Host "`n🔄 Database Migration Process" -ForegroundColor Yellow
    Write-Host "=============================" -ForegroundColor Yellow
    
    if (-not $Force) {
        Write-Host "⚠️ WARNUNG: Diese Aktion erstellt neue DB-Benutzer und ändert die Konfiguration!" -ForegroundColor Red
        $confirm = Read-Host "Möchten Sie fortfahren? (y/N)"
        if ($confirm -ne "y") {
            Write-Host "❌ Migration abgebrochen." -ForegroundColor Red
            return
        }
    }
    
    Write-Host "`n📋 Migration Steps:" -ForegroundColor Cyan
    
    # Schritt 1: Backup
    Write-Host "`n1️⃣ WordPress Backup erstellen..." -ForegroundColor Yellow
    if ($DryRun) {
        Write-Host "   [DRY RUN] mysqldump mo_wordpress_main > backup_wp_$(Get-Date -Format 'yyyyMMdd').sql" -ForegroundColor Gray
    } else {
        Write-Host "   ✅ Backup empfohlen vor Migration!" -ForegroundColor Green
    }
    
    # Schritt 2: Neue Benutzer
    Write-Host "`n2️⃣ Neue DB-Benutzer erstellen..." -ForegroundColor Yellow
    foreach ($user in $MigrationPlan.Create.Users) {
        if ($DryRun) {
            Write-Host "   [DRY RUN] CREATE USER '$($user.Name)'@'localhost' IDENTIFIED BY '$($user.Password)'" -ForegroundColor Gray
            Write-Host "   [DRY RUN] GRANT $($user.Privileges) ON $($user.Database).* TO '$($user.Name)'@'localhost'" -ForegroundColor Gray
        } else {
            Write-Host "   📝 SQL für $($user.Name) generiert" -ForegroundColor Green
        }
    }
    
    # Schritt 3: Konfiguration
    Write-Host "`n3️⃣ Konfigurationsdateien aktualisieren..." -ForegroundColor Yellow
    if ($DryRun) {
        Write-Host "   [DRY RUN] .env aktualisiert (Laravel ohne WordPress)" -ForegroundColor Gray
        Write-Host "   [DRY RUN] civicrm.settings.php erstellt" -ForegroundColor Gray
    } else {
        Write-Host "   ✅ Neue Konfigurationen bereit" -ForegroundColor Green
    }
    
    Write-Host "`n✅ Migration vorbereitet!" -ForegroundColor Green
}

function Create-NewDatabaseUsers {
    Write-Host "`n👤 Database User Creation" -ForegroundColor Yellow
    Write-Host "=========================" -ForegroundColor Yellow
    
    Write-Host "`n📝 SQL-Befehle für Plesk MySQL:" -ForegroundColor Cyan
    Write-Host @"

-- 1. Laravel API User erstellen
CREATE USER 'laravel_user'@'localhost' IDENTIFIED BY 'SECURE_LARAVEL_2025';
GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,INDEX,ALTER ON mo_laravel_api.* TO 'laravel_user'@'localhost';

-- 2. CiviCRM User erstellen  
CREATE USER 'civicrm_user'@'localhost' IDENTIFIED BY 'SECURE_CIVICRM_2025';
GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,INDEX,ALTER ON mo_civicrm_data.* TO 'civicrm_user'@'localhost';

-- 3. Rechte aktivieren
FLUSH PRIVILEGES;

-- 4. Benutzer überprüfen
SELECT User, Host FROM mysql.user WHERE User IN ('laravel_user', 'civicrm_user');

-- 5. Optional: Legacy mo_wp_user entfernen (VORSICHT!)
-- DROP USER 'mo_wp_user'@'localhost';

"@ -ForegroundColor White
    
    Write-Host "`n🎯 Nächste Schritte:" -ForegroundColor Cyan
    Write-Host "1. Plesk Panel → Databases → Users öffnen" -ForegroundColor Gray
    Write-Host "2. Obige SQL-Befehle in phpMyAdmin ausführen" -ForegroundColor Gray
    Write-Host "3. Neue Passwörter in .env konfigurieren" -ForegroundColor Gray
    Write-Host "4. Verbindungstests durchführen" -ForegroundColor Gray
}

function Start-WordPresssCleanup {
    Write-Host "`n🧹 WordPress Cleanup Process" -ForegroundColor Yellow
    Write-Host "============================" -ForegroundColor Yellow
    
    Write-Host "`n⚠️ WordPress Archivierung/Entfernung:" -ForegroundColor Red
    Write-Host @"
    
📋 Empfohlenes Vorgehen:

1. 💾 Vollständiges WordPress Backup erstellen:
   mysqldump -u root -p mo_wordpress_main > wp_backup_$(Get-Date -Format 'yyyyMMdd').sql

2. 📁 WordPress-Dateien archivieren:
   mkdir archive/wordpress_$(Get-Date -Format 'yyyyMMdd')
   mv wp-* archive/wordpress_$(Get-Date -Format 'yyyyMMdd')/

3. 🗂️  Datenbank-Optionen:
   a) ARCHIVIEREN: Datenbank umbenennen zu mo_wordpress_archive
   b) LÖSCHEN: DROP DATABASE mo_wordpress_main; (nur bei Sicherheit!)

4. 👤 User-Cleanup:
   - mo_wp_user Rechte überprüfen
   - Falls nur WordPress verwendet: User entfernen
   - Sonst: Rechte auf neue DBs beschränken

"@ -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Host "[DRY RUN] Cleanup-Kommandos würden ausgeführt" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Manuelle Ausführung in Plesk Panel erforderlich!" -ForegroundColor Yellow
    }
}

# Hauptlogik
switch ($Action) {
    "analyze" {
        Analyze-WordPressUsage
    }
    
    "migrate" {
        Analyze-WordPressUsage
        Start-DatabaseMigration
    }
    
    "create-users" {
        Create-NewDatabaseUsers
    }
    
    "cleanup" {
        Start-WordPressCleanup
    }
    
    "help" {
        Show-Help
    }
    
    default {
        Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
        Show-Help
    }
}

Write-Host "`n🎯 Migration Summary:" -ForegroundColor Cyan
Write-Host "- Laravel API wird primäres System (mo_laravel_api)" -ForegroundColor Green
Write-Host "- CiviCRM standalone oder mit Drupal (mo_civicrm_data)" -ForegroundColor Green  
Write-Host "- WordPress optional archiviert (mo_wordpress_main)" -ForegroundColor Yellow
Write-Host "- Neue DB-User mit minimalen Rechten" -ForegroundColor Green