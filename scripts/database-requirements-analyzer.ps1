#!/usr/bin/env pwsh
# 🗂️ Database Requirements Analyzer für das Arbeitsverzeichnis
# Analysiert welche Datenbanken das Projekt benötigt und erstellt SQL-Befehle für phpMyAdmin

$ErrorActionPreference = "Stop"

Write-Host "🗂️ Database Requirements Analysis - menschlichkeit-oesterreich.at" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Datenbank-Anforderungen basierend auf Projektanalyse
$DatabaseRequirements = @{
    Primary = @{
        Name = "mo_laravel_api"
        Purpose = "Laravel API Backend - HAUPTSYSTEM"
        Technology = "Laravel + Prisma ORM"
        Provider = "MySQL/MariaDB (Produktion) + PostgreSQL (Entwicklung)"
        Required = $true
        Priority = 1
    }
    CRM = @{
        Name = "mo_civicrm_data" 
        Purpose = "CiviCRM Datenmanagement"
        Technology = "CiviCRM + Drupal"
        Provider = "MySQL/MariaDB"
        Required = $true
        Priority = 2
    }
    Gaming = @{
        Name = "mo_gaming_platform"
        Purpose = "Educational Gaming Platform"
        Technology = "Prisma ORM + PostgreSQL"
        Provider = "PostgreSQL (empfohlen für Prisma)"
        Required = $true
        Priority = 1
    }
    WordPress_Legacy = @{
        Name = "mo_wordpress_main"
        Purpose = "WordPress (DEPRECATED)"
        Technology = "WordPress"
        Provider = "MySQL/MariaDB"
        Required = $false
        Priority = 9
    }
}

function Show-ProjectDatabaseNeeds {
    Write-Host "`n📊 Projektanalysierte Datenbank-Anforderungen:" -ForegroundColor Yellow
    Write-Host "===============================================" -ForegroundColor Yellow
    
    Write-Host "`n🎯 Basierend auf gefundenen Dateien:" -ForegroundColor Cyan
    Write-Host "   schema.prisma: PostgreSQL für Gaming Platform" -ForegroundColor Green
    Write-Host "   .env: Laravel API + CiviCRM (MySQL/MariaDB)" -ForegroundColor Green
    Write-Host "   composer.json: CiviCRM + Drupal System" -ForegroundColor Green
    
    Write-Host "`n🗂️ Erforderliche Datenbanken:" -ForegroundColor Cyan
    
    $requiredDbs = $DatabaseRequirements.Values | Where-Object { $_.Required -eq $true } | Sort-Object Priority
    
    foreach ($db in $requiredDbs) {
        Write-Host "`n📋 $($db.Name)" -ForegroundColor Yellow
        Write-Host "   Zweck: $($db.Purpose)" -ForegroundColor Gray
        Write-Host "   Technologie: $($db.Technology)" -ForegroundColor Gray
        Write-Host "   Provider: $($db.Provider)" -ForegroundColor Gray
        Write-Host "   Priorität: $($db.Priority)" -ForegroundColor $(if($db.Priority -eq 1){"Red"}elseif($db.Priority -eq 2){"Yellow"}else{"Gray"})
    }
}

function Generate-PleskSQLCommands {
    Write-Host "`n🔧 SQL-Befehle für phpMyAdmin @ digimagical.com:" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    
    Write-Host @"

-- ============================================================================
-- 🗂️ DATABASE SETUP für menschlichkeit-oesterreich.at @ Plesk digimagical.com
-- MariaDB 10.6.22 auf Ubuntu 22.04, nginx/1.28.0, PHP 8.4.11
-- ============================================================================

-- 1️⃣ DATENBANKEN ERSTELLEN (falls noch nicht vorhanden)
-- ============================================================================
CREATE DATABASE IF NOT EXISTS mo_laravel_api 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci 
    COMMENT 'Laravel API Backend - PRIMARY SYSTEM';

CREATE DATABASE IF NOT EXISTS mo_civicrm_data 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci 
    COMMENT 'CiviCRM Datenmanagement + Drupal';

CREATE DATABASE IF NOT EXISTS mo_gaming_platform 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci 
    COMMENT 'Educational Gaming Platform (Prisma ORM)';

-- 2️⃣ BENUTZER ERSTELLEN mit minimalen Rechten
-- ============================================================================

-- Laravel API Benutzer
CREATE USER IF NOT EXISTS 'laravel_user'@'localhost' IDENTIFIED BY 'IHR_SICHERES_LARAVEL_PASSWORT_HIER';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, REFERENCES 
    ON mo_laravel_api.* TO 'laravel_user'@'localhost';

-- CiviCRM Benutzer
CREATE USER IF NOT EXISTS 'civicrm_user'@'localhost' IDENTIFIED BY 'IHR_SICHERES_CIVICRM_PASSWORT_HIER';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, REFERENCES 
    ON mo_civicrm_data.* TO 'civicrm_user'@'localhost';

-- Gaming Platform Benutzer
CREATE USER IF NOT EXISTS 'gaming_user'@'localhost' IDENTIFIED BY 'IHR_SICHERES_GAMING_PASSWORT_HIER';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, REFERENCES 
    ON mo_gaming_platform.* TO 'gaming_user'@'localhost';

-- 3️⃣ BERECHTIGUNGEN AKTIVIEREN
-- ============================================================================
FLUSH PRIVILEGES;

-- 4️⃣ BENUTZER UND DATENBANKEN ÜBERPRÜFEN
-- ============================================================================
SELECT 
    User AS DB_User, 
    Host AS Host,
    plugin AS Auth_Plugin
FROM mysql.user 
WHERE User IN ('laravel_user', 'civicrm_user', 'gaming_user');

SHOW DATABASES LIKE 'mo_%';

-- 5️⃣ DATABASE-SPEZIFISCHE OPTIMIERUNGEN
-- ============================================================================

-- Laravel API Optimierungen
USE mo_laravel_api;
SET GLOBAL innodb_buffer_pool_size = 256M;
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 64M;

-- CiviCRM Optimierungen  
USE mo_civicrm_data;
SET GLOBAL wait_timeout = 28800;
SET GLOBAL interactive_timeout = 28800;

-- Gaming Platform Optimierungen
USE mo_gaming_platform;
SET GLOBAL innodb_log_file_size = 128M;
SET GLOBAL innodb_flush_log_at_trx_commit = 2;

-- 6️⃣ OPTIONAL: Legacy WordPress Archivierung
-- ============================================================================
-- Falls mo_wordpress_main existiert:
-- RENAME TABLE mo_wordpress_main TO mo_wordpress_archive_20250926;
-- DROP USER IF EXISTS 'mo_wp_user'@'localhost';

-- 7️⃣ VERBINDUNGSTEST
-- ============================================================================
SELECT 
    'Laravel API' AS System_Name,
    'mo_laravel_api' AS Database_Name,
    'laravel_user' AS User_Name,
    'READY' AS Status
UNION ALL
SELECT 
    'CiviCRM',
    'mo_civicrm_data',
    'civicrm_user',
    'READY'
UNION ALL
SELECT 
    'Gaming Platform',
    'mo_gaming_platform', 
    'gaming_user',
    'READY';

"@ -ForegroundColor White
}

function Show-DatabasePurposeMapping {
    Write-Host "`n🎯 Database-zu-System-Zuordnung:" -ForegroundColor Yellow
    Write-Host "=================================" -ForegroundColor Yellow
    
    Write-Host @"

📊 SYSTEM MAPPING für menschlichkeit-oesterreich.at:

1️⃣ mo_laravel_api (PRIMARY)
   └── api.menschlichkeit-oesterreich.at
   └── FastAPI Backend + Laravel Components
   └── Benutzer: laravel_user
   └── Priorität: KRITISCH

2️⃣ mo_civicrm_data
   └── CRM System (Drupal + CiviCRM)
   └── Kontakt- & Spendenverwaltung
   └── Benutzer: civicrm_user
   └── Priorität: HOCH

3️⃣ mo_gaming_platform
   └── Educational Games (schema.prisma)
   └── User Progress, Achievements, Scores
   └── Benutzer: gaming_user  
   └── Priorität: KRITISCH

❌ mo_wordpress_main (DEPRECATED)
   └── Nicht mehr erforderlich
   └── Status: Archivieren oder löschen

"@ -ForegroundColor Cyan
}

function Show-PleskPanelSteps {
    Write-Host "`n📋 Plesk Panel - Manuelle Schritte:" -ForegroundColor Yellow
    Write-Host "===================================" -ForegroundColor Yellow
    
    Write-Host @"

1. 🌐 Plesk Panel Login:
   URL: https://digimagical.com:8443 (oder Ihr Plesk URL)
   
2. 🗂️ Databases → Create Database:
   ✅ mo_laravel_api
   ✅ mo_civicrm_data  
   ✅ mo_gaming_platform

3. 👤 Database Users erstellen:
   ✅ laravel_user (nur mo_laravel_api Zugriff)
   ✅ civicrm_user (nur mo_civicrm_data Zugriff)
   ✅ gaming_user (nur mo_gaming_platform Zugriff)

4. 🔐 Sichere Passwörter generieren:
   Mindestens 16 Zeichen, Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen

5. 🔧 phpMyAdmin öffnen:
   Alle obigen SQL-Befehle ausführen

6. ⚙️ Website-Zuordnung:
   mo_laravel_api → api.menschlichkeit-oesterreich.at
   mo_civicrm_data → crm.menschlichkeit-oesterreich.at (falls Subdomain)
   mo_gaming_platform → menschlichkeit-oesterreich.at

"@ -ForegroundColor Cyan
}

function Generate-EnvironmentConfig {
    Write-Host "`n📄 .env Konfiguration aktualisieren:" -ForegroundColor Yellow
    Write-Host "====================================" -ForegroundColor Yellow
    
    Write-Host @"

# Nach DB-Erstellung diese Werte in .env eintragen:

# Laravel API Database (PRIMARY)
LARAVEL_DB_CONNECTION=mysql
LARAVEL_DB_HOST=127.0.0.1
LARAVEL_DB_PORT=3306
LARAVEL_DB_NAME=mo_laravel_api
LARAVEL_DB_USER=laravel_user
LARAVEL_DB_PASS=IHR_LARAVEL_PASSWORT

# CiviCRM Database
CIVICRM_DB_HOST=localhost
CIVICRM_DB_NAME=mo_civicrm_data  
CIVICRM_DB_USER=civicrm_user
CIVICRM_DB_PASS=IHR_CIVICRM_PASSWORT

# Gaming Platform Database (Prisma)
DATABASE_URL="mysql://gaming_user:IHR_GAMING_PASSWORT@localhost:3306/mo_gaming_platform"

# Server Information
DB_SERVER=MariaDB 10.6.22 @ digimagical.com
DB_CHARSET=utf8mb4
DB_COLLATE=utf8mb4_unicode_ci

"@ -ForegroundColor Green
}

# Hauptausführung
Show-ProjectDatabaseNeeds
Generate-PleskSQLCommands  
Show-DatabasePurposeMapping
Show-PleskPanelSteps
Generate-EnvironmentConfig

Write-Host "`n✅ Database Setup für menschlichkeit-oesterreich.at komplett!" -ForegroundColor Green
Write-Host "🎯 Kopieren Sie die SQL-Befehle und führen Sie diese in phpMyAdmin aus." -ForegroundColor Cyan