# Database Setup Script für Menschlichkeit Österreich Development

param(
    [string]$MySQLRoot = "root",
    [string]$MySQLRootPassword = "",
    [string]$MySQLHost = "localhost",
    [int]$MySQLPort = 3306
)

Write-Host "🗄️  Database Setup für Menschlichkeit Österreich Development" -ForegroundColor Blue
Write-Host "=============================================================="

# Funktion für MySQL Kommando
function Invoke-MySQLCommand {
    param(
        [string]$Command,
        [string]$Database = ""
    )
    
    $MySQLArgs = @(
        "-u", $MySQLRoot
        "-h", $MySQLHost
        "-P", $MySQLPort
    )
    
    if ($MySQLRootPassword) {
        $MySQLArgs += "-p$MySQLRootPassword"
    }
    
    if ($Database) {
        $MySQLArgs += $Database
    }
    
    $MySQLArgs += "-e", $Command
    
    try {
        & mysql @MySQLArgs
        return $true
    }
    catch {
        Write-Host "❌ MySQL Fehler: $_" -ForegroundColor Red
        return $false
    }
}

# Test MySQL Verbindung
Write-Host "🔍 Teste MySQL Verbindung..." -ForegroundColor Yellow

if (-not (Invoke-MySQLCommand "SELECT VERSION() as version;")) {
    Write-Host "❌ Keine Verbindung zu MySQL möglich!" -ForegroundColor Red
    Write-Host "   Überprüfe:" -ForegroundColor Yellow
    Write-Host "   - MariaDB/MySQL Server läuft auf $MySQLHost`:$MySQLPort" -ForegroundColor Yellow
    Write-Host "   - Root-Passwort korrekt" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ MySQL Verbindung erfolgreich!" -ForegroundColor Green

# WordPress Datenbank erstellen
Write-Host "`n📝 Erstelle WordPress Datenbank..." -ForegroundColor Yellow

$WordPressCommands = @(
    "CREATE DATABASE IF NOT EXISTS mo_wordpress CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
    "CREATE USER IF NOT EXISTS 'mo_wp_user'@'localhost' IDENTIFIED BY 'secure_wp_2025';",
    "GRANT ALL PRIVILEGES ON mo_wordpress.* TO 'mo_wp_user'@'localhost';",
    "FLUSH PRIVILEGES;"
)

foreach ($cmd in $WordPressCommands) {
    if (Invoke-MySQLCommand $cmd) {
        Write-Host "✅ $cmd" -ForegroundColor Green
    }
}

# Laravel API Datenbank erstellen
Write-Host "`n🚀 Erstelle Laravel API Datenbank..." -ForegroundColor Yellow

$LaravelCommands = @(
    "CREATE DATABASE IF NOT EXISTS mo_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
    "CREATE USER IF NOT EXISTS 'mo_api_user'@'localhost' IDENTIFIED BY 'secure_api_2025';",
    "GRANT ALL PRIVILEGES ON mo_api.* TO 'mo_api_user'@'localhost';",
    "FLUSH PRIVILEGES;"
)

foreach ($cmd in $LaravelCommands) {
    if (Invoke-MySQLCommand $cmd) {
        Write-Host "✅ $cmd" -ForegroundColor Green
    }
}

# CiviCRM Datenbank erstellen
Write-Host "`n🏢 Erstelle CiviCRM Datenbank..." -ForegroundColor Yellow

$CiviCRMCommands = @(
    "CREATE DATABASE IF NOT EXISTS mo_civicrm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
    "CREATE USER IF NOT EXISTS 'mo_crm_user'@'localhost' IDENTIFIED BY 'secure_crm_2025';",
    "GRANT ALL PRIVILEGES ON mo_civicrm.* TO 'mo_crm_user'@'localhost';",
    "FLUSH PRIVILEGES;"
)

foreach ($cmd in $CiviCRMCommands) {
    if (Invoke-MySQLCommand $cmd) {
        Write-Host "✅ $cmd" -ForegroundColor Green
    }
}

# Datenbank-Status überprüfen
Write-Host "`n📊 Datenbank-Status:" -ForegroundColor Blue

$Databases = @("mo_wordpress", "mo_api", "mo_civicrm")
foreach ($db in $Databases) {
    Write-Host "   📂 $db" -ForegroundColor Cyan
    Invoke-MySQLCommand "SHOW TABLES;" $db | Out-Null
}

# Konfigurationsdateien erstellen
Write-Host "`n⚙️  Erstelle Konfigurationsdateien..." -ForegroundColor Yellow

# WordPress wp-config.php Template
$WPConfigTemplate = @"
<?php
// WordPress Datenbank-Konfiguration - Menschlichkeit Österreich
define('DB_NAME', 'mo_wordpress');
define('DB_USER', 'mo_wp_user');
define('DB_PASSWORD', 'secure_wp_2025');
define('DB_HOST', 'localhost:3306');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', 'utf8mb4_unicode_ci');

// Sicherheitsschlüssel - ERSETZE MIT ECHTEN SCHLÜSSELN!
define('AUTH_KEY',         'setze-hier-deinen-einzigartigen-schluessel-ein');
define('SECURE_AUTH_KEY',  'setze-hier-deinen-einzigartigen-schluessel-ein');
define('LOGGED_IN_KEY',    'setze-hier-deinen-einzigartigen-schluessel-ein');
define('NONCE_KEY',        'setze-hier-deinen-einzigartigen-schluessel-ein');

// WordPress Debug (Development)
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);

// WordPress REST API
define('WP_REST_API', true);

// Tabellen-Präfix
${'$'}table_prefix = 'mo_wp_';

// WordPress URLs
define('WP_HOME', 'https://menschlichkeit-oesterreich.at');
define('WP_SITEURL', 'https://menschlichkeit-oesterreich.at');

if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

require_once ABSPATH . 'wp-settings.php';
"@

$WPConfigTemplate | Out-File -FilePath "d:\Arbeitsverzeichniss\wp-config-template.php" -Encoding UTF8
Write-Host "✅ WordPress config template erstellt" -ForegroundColor Green

# Laravel .env Template
$LaravelEnvTemplate = @"
# Laravel API - Menschlichkeit Österreich
APP_NAME="MO API"
APP_ENV=development
APP_KEY=
APP_DEBUG=true
APP_URL=https://api.menschlichkeit-oesterreich.at

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# Database
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=mo_api
DB_USERNAME=mo_api_user
DB_PASSWORD=secure_api_2025

# Cache & Sessions
BROADCAST_DRIVER=log
CACHE_DRIVER=database
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Mail (configure as needed)
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${'$'}{APP_NAME}"

# CiviCRM Integration
CIVICRM_API_URL=https://crm.menschlichkeit-oesterreich.at/wp-content/plugins/civicrm/extern/rest.php
CIVICRM_SITE_KEY=your-site-key
CIVICRM_API_KEY=your-api-key

# WordPress Integration  
WP_API_URL=https://menschlichkeit-oesterreich.at/wp-json/wp/v2
WP_APPLICATION_PASSWORD=your-app-password
"@

$LaravelEnvTemplate | Out-File -FilePath "d:\Arbeitsverzeichniss\.env-api-template" -Encoding UTF8
Write-Host "✅ Laravel .env template erstellt" -ForegroundColor Green

Write-Host "`n🎉 Database Setup completed!" -ForegroundColor Green
Write-Host "📋 Next Steps:" -ForegroundColor Blue
Write-Host "   1. Kopiere wp-config-template.php nach WordPress httpdocs/" -ForegroundColor Yellow
Write-Host "   2. Generiere WordPress Sicherheitsschlüssel: https://api.wordpress.org/secret-key/1.1/salt/" -ForegroundColor Yellow
Write-Host "   3. Kopiere .env-api-template nach Laravel root als .env" -ForegroundColor Yellow
Write-Host "   4. Führe Laravel key:generate aus" -ForegroundColor Yellow
Write-Host "   5. Installiere CiviCRM in crm.domain" -ForegroundColor Yellow