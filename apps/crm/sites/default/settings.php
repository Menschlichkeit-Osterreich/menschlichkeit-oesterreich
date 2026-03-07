<?php

/**
 * =============================================================================
 * 🏥 CRM SUBDOMAIN CONFIGURATION - crm.menschlichkeit-oesterreich.at
 * =============================================================================
 * Drupal + CiviCRM Database Configuration
 * Plesk Server: digimagical.com | PHP 8.3.25 FPM-Apache
 * Database: mo_civicrm_data | User: civicrm_user
 * =============================================================================
 */

/**
 * =============================================================================
 * 🗄️ PRODUCTION DATABASE CONFIGURATION
 * =============================================================================
 */
$databases = [];
$databases['default']['default'] = array(
    'database' => 'mo_civicrm_data',
    'username' => 'civicrm_user',
    'password' => 'yFNhGHHcvU2Tw7BeSBgKwkFGxr',
    'prefix' => '',
    'host' => 'localhost',
    'port' => '3306',
    'namespace' => 'Drupal\\mysql\\Driver\\Database\\mysql',
    'driver' => 'mysql',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'autoload' => 'core/modules/mysql/src/Driver/Database/mysql/',
);

/**
 * =============================================================================
 * 🔐 DRUPAL SECURITY CONFIGURATION
 * =============================================================================
 */
$settings['hash_salt'] = 'your-unique-hash-salt-here-' . hash('sha256', 'mo_civicrm_data_salt');
$settings['update_free_access'] = FALSE;
$settings['container_yamls'][] = $app_root . '/' . $site_path . '/services.yml';

/**
 * =============================================================================
 * 📂 FILE SYSTEM CONFIGURATION (Plesk)
 * =============================================================================
 */
$settings['file_public_path'] = 'sites/default/files';
$settings['file_private_path'] = 'sites/default/files/private';
$settings['file_temp_path'] = '/tmp';

// Plesk-spezifische Pfade
$config['system.file']['path']['temporary'] = '/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/crm/httpdocs/sites/default/files/tmp';

/**
 * =============================================================================
 * 🌐 TRUSTED HOST CONFIGURATION
 * =============================================================================
 */
$settings['trusted_host_patterns'] = [
    '^crm\.menschlichkeit-oesterreich\.at$',
    '^www\.crm\.menschlichkeit-oesterreich\.at$',
];

/**
 * =============================================================================
 * 📧 EMAIL CONFIGURATION
 * =============================================================================
 */
$config['system.mail']['interface']['default'] = 'smtp';
$config['smtp']['smtp_host'] = 'localhost';
$config['smtp']['smtp_port'] = '587';
$config['smtp']['smtp_username'] = 'crm@menschlichkeit-oesterreich.at';
$config['smtp']['smtp_password'] = 'your-email-password-here';
$config['smtp']['smtp_protocol'] = 'tls';

/**
 * =============================================================================
 * ⚡ PERFORMANCE CONFIGURATION
 * =============================================================================
 */
$settings['cache']['default'] = 'cache.backend.database';
$settings['cache']['bins']['render'] = 'cache.backend.database';
$settings['cache']['bins']['page'] = 'cache.backend.database';
$settings['cache']['bins']['dynamic_page_cache'] = 'cache.backend.database';

// CSS/JS Aggregation
$config['system.performance']['css']['preprocess'] = TRUE;
$config['system.performance']['js']['preprocess'] = TRUE;

/**
 * =============================================================================
 * 🔍 LOGGING & DEBUGGING (Production: FALSE)
 * =============================================================================
 */
$config['system.logging']['error_level'] = 'hide';
$settings['rebuild_access'] = FALSE;
$settings['skip_permissions_hardening'] = FALSE;

/**
 * =============================================================================
 * 🌍 LOCALE CONFIGURATION
 * =============================================================================
 */
$config['system.site']['default_langcode'] = 'de';
$config['system.regional']['first_day'] = 1; // Montag
$config['system.date']['timezone']['default'] = 'Europe/Vienna';

/**
 * =============================================================================
 * 📱 MOBILE & RESPONSIVE CONFIGURATION
 * =============================================================================
 */
$config['system.theme']['default'] = 'your_theme_name';
$config['system.theme']['admin'] = 'seven';

/**
 * =============================================================================
 * 🔗 EXTERNAL INTEGRATIONS
 * =============================================================================
 */
// API Integration mit Hauptdomain
$config['api']['main_site'] = 'https://menschlichkeit-oesterreich.at';
$config['api']['api_endpoint'] = 'https://api.menschlichkeit-oesterreich.at';
$config['api']['gaming_platform'] = 'https://games.menschlichkeit-oesterreich.at';

/**
 * =============================================================================
 * 💾 BACKUP CONFIGURATION
 * =============================================================================
 */
$config['backup_migrate']['settings']['backup_dir'] = 'sites/default/files/backup_migrate';
$config['backup_migrate']['settings']['schedule_enabled'] = TRUE;
$config['backup_migrate']['settings']['schedule_time'] = '02:00';

/**
 * =============================================================================
 * 🎯 PLESK SPECIFIC SETTINGS
 * =============================================================================
 */
$settings['plesk_server'] = 'digimagical.com';
$settings['document_root'] = '/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/crm/httpdocs';
$settings['php_version'] = '8.3.25';
$settings['server_software'] = 'Apache FPM';

/**
 * =============================================================================
 * ✅ CONFIGURATION VERIFICATION
 * =============================================================================
 * Config Created: $(date)
 * Target: crm.menschlichkeit-oesterreich.at
 * Database: mo_civicrm_data (civicrm_user)
 * PHP: 8.3.25 FPM-Apache @ digimagical.com
 * Status: Production Ready ✅
 * =============================================================================
 */

// Load services definition file.
$settings['container_yamls'][] = __DIR__ . '/services.yml';

// Include CiviCRM settings
$civicrm_setting_file = __DIR__ . '/civicrm.settings.php';
if (file_exists($civicrm_setting_file)) {
    require_once $civicrm_setting_file;
}

// Load local development override configuration, if available.
if (file_exists(__DIR__ . '/settings.local.php')) {
    include __DIR__ . '/settings.local.php';
}
