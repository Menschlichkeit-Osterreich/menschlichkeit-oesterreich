<?php

if (!function_exists('moe_env')) {
    function moe_env(string $name, ?string $default = null): ?string {
        $value = getenv($name);
        if ($value === false || $value === '') {
            return $default;
        }
        return $value;
    }
}

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
    'database' => moe_env('DRUPAL_DB_NAME', 'CHANGE_ME_DRUPAL_DB_NAME'),
    'username' => moe_env('DRUPAL_DB_USER', 'CHANGE_ME_DRUPAL_DB_USER'),
    'password' => moe_env('DRUPAL_DB_PASS', 'CHANGE_ME_DRUPAL_DB_PASS'),
    'prefix' => '',
    'host' => moe_env('DRUPAL_DB_HOST', 'localhost'),
    'port' => moe_env('DRUPAL_DB_PORT', '3306'),
    'namespace' => 'Drupal\\mysql\\Driver\\Database\\mysql',
    'driver' => 'mysql',
    'charset' => moe_env('DRUPAL_DB_CHARSET', 'utf8mb4'),
    'collation' => moe_env('DRUPAL_DB_COLLATE', 'utf8mb4_unicode_ci'),
    'autoload' => 'core/modules/mysql/src/Driver/Database/mysql/',
);

/**
 * =============================================================================
 * 🔐 DRUPAL SECURITY CONFIGURATION
 * =============================================================================
 */
$settings['hash_salt'] = moe_env('DRUPAL_HASH_SALT', 'CHANGE_ME_DRUPAL_HASH_SALT');
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

/**
 * =============================================================================
 * ⚙️ CONFIG SYNC – Issue #132-#134 Webforms, CiviCRM-Konfigurationsexporte
 * =============================================================================
 * Ermöglicht: drush config:import / drush config:export
 * Konfigurationsexporte liegen in: apps/crm/config/sync/
 * =============================================================================
 */
$settings['config_sync_directory'] = '../config/sync';

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
$config['smtp']['smtp_host'] = moe_env('DRUPAL_SMTP_HOST', 'localhost');
$config['smtp']['smtp_port'] = moe_env('DRUPAL_SMTP_PORT', '587');
$config['smtp']['smtp_username'] = moe_env('DRUPAL_SMTP_USER', 'CHANGE_ME_DRUPAL_SMTP_USER');
$config['smtp']['smtp_password'] = moe_env('DRUPAL_SMTP_PASS', 'CHANGE_ME_DRUPAL_SMTP_PASS');
$config['smtp']['smtp_protocol'] = moe_env('DRUPAL_SMTP_PROTOCOL', 'tls');

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
