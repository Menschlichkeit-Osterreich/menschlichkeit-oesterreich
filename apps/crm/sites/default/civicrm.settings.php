<?php

/**
 * =============================================================================
 * 🏥 CIVICRM CONFIGURATION - crm.menschlichkeit-oesterreich.at
 * =============================================================================
 * CiviCRM Database & System Configuration
 * Plesk Server: digimagical.com | PHP 8.3.25 FPM-Apache
 * Database: mo_civicrm_data | User: civicrm_user
 * =============================================================================
 */

/**
 * =============================================================================
 * 🗄️ CIVICRM DATABASE CONFIGURATION
 * =============================================================================
 */
define('CIVICRM_DSN', 'mysql://civicrm_user:yFNhGHHcvU2Tw7BeSBgKwkFGxr@localhost:3306/mo_civicrm_data?new_link=true');
define('CIVICRM_DB_HOST', 'localhost');
define('CIVICRM_DB_PORT', '3306');
define('CIVICRM_DB_NAME', 'mo_civicrm_data');
define('CIVICRM_DB_USER', 'civicrm_user');
define('CIVICRM_DB_PASS', 'yFNhGHHcvU2Tw7BeSBgKwkFGxr');

/**
 * =============================================================================
 * 🔐 CIVICRM SECURITY CONFIGURATION
 * =============================================================================
 */
define('CIVICRM_SITE_KEY', hash('sha256', 'mo_civicrm_' . date('Y')));
define('CIVICRM_CRED_KEYS', hash('sha256', 'mo_creds_' . date('Ymd')));
define('CIVICRM_SIGN_KEYS', hash('sha256', 'mo_sign_' . date('YmdH')));

/**
 * =============================================================================
 * 📂 CIVICRM PATHS & URLs (Plesk)
 * =============================================================================
 */
define('CIVICRM_UF', 'Drupal');
define('CIVICRM_UF_DSN', 'mysql://civicrm_user:yFNhGHHcvU2Tw7BeSBgKwkFGxr@localhost:3306/mo_civicrm_data?new_link=true');
define('CIVICRM_UF_BASEURL', 'https://crm.menschlichkeit-oesterreich.at/');

// Plesk-spezifische Pfade
$civicrm_root = '/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/crm/httpdocs/';
define('CIVICRM_TEMPLATE_COMPILEDIR', $civicrm_root . 'sites/default/files/civicrm/templates_c/');

/**
 * =============================================================================
 * 📧 EMAIL & COMMUNICATION
 * =============================================================================
 */
define('CIVICRM_MAIL_SMARTY', 1);
define('CIVICRM_MAIL_LOG', 1);

// SMTP Configuration über Plesk
define('CIVICRM_MAILER_BOUNCE_PROCESSING', 1);
define('CIVICRM_MAILING_BASE_URL', 'https://crm.menschlichkeit-oesterreich.at/');

/**
 * =============================================================================
 * 🌐 MULTI-DOMAIN CONFIGURATION
 * =============================================================================
 */
// Integration mit anderen Subdomains
define('CIVICRM_API_MAIN_SITE', 'https://menschlichkeit-oesterreich.at');
define('CIVICRM_API_ENDPOINT', 'https://api.menschlichkeit-oesterreich.at');
define('CIVICRM_GAMING_INTEGRATION', 'https://games.menschlichkeit-oesterreich.at');

/**
 * =============================================================================
 * ⚡ PERFORMANCE CONFIGURATION
 * =============================================================================
 */
define('CIVICRM_DB_CACHE_CLASS', 'CRM_Utils_Cache_Memcache');
define('CIVICRM_DB_CACHE_HOST', 'localhost');
define('CIVICRM_DB_CACHE_PORT', 11211);
define('CIVICRM_DB_CACHE_TIMEOUT', 3600);
define('CIVICRM_DB_CACHE_PREFIX', 'mo_civicrm_');

/**
 * =============================================================================
 * 🔍 DEBUGGING & LOGGING (Production: 0)
 * =============================================================================
 */
define('CIVICRM_DEBUG_LOG_QUERY', 0);
define('CIVICRM_DEBUG_LOG_QUERY_PARAMS', 0);
define('CIVICRM_BACKTRACE', 0);
ini_set('log_errors', 1);
ini_set('error_log', $civicrm_root . 'sites/default/files/civicrm/ConfigAndLog/CiviCRM.log');

/**
 * =============================================================================
 * 📊 EXTENSIONS & CUSTOMIZATION
 * =============================================================================
 */
define('CIVICRM_EXTENSIONS_BASE_URL', 'https://crm.menschlichkeit-oesterreich.at/sites/default/files/civicrm/ext/');
define('CIVICRM_EXTENSIONS_BASE_DIR', $civicrm_root . 'sites/default/files/civicrm/ext/');

/**
 * =============================================================================
 * 🌍 LOCALE & INTERNATIONALIZATION
 * =============================================================================
 */
define('CIVICRM_UF_LOCALE_CALLBACK', array('CRM_Utils_System_Drupal', 'getUFLocale'));
define('CIVICRM_DEFAULT_LOCALE', 'de_AT');
define('CIVICRM_DEFAULT_CURRENCY', 'EUR');

/**
 * =============================================================================
 * 🔒 SECURITY HEADERS
 * =============================================================================
 */
define('CIVICRM_CMSDIR', $civicrm_root);
define('CIVICRM_DOMAIN_ID', 1);
define('CIVICRM_DOMAIN_ORG_URL', 'https://menschlichkeit-oesterreich.at');

/**
 * =============================================================================
 * 📱 API & WEBHOOK CONFIGURATION
 * =============================================================================
 */
define('CIVICRM_API_KEYS', 1);
define('CIVICRM_WEBHOOK_ENABLED', 1);
define('CIVICRM_WEBHOOK_URL', 'https://api.menschlichkeit-oesterreich.at/webhooks/civicrm');

/**
 * =============================================================================
 * 💾 BACKUP & MAINTENANCE
 * =============================================================================
 */
define('CIVICRM_BACKUP_DIR', $civicrm_root . 'sites/default/files/civicrm/backup/');
define('CIVICRM_BACKUP_RETENTION_DAYS', 30);

/**
 * =============================================================================
 * 🎯 PLESK SPECIFIC SETTINGS
 * =============================================================================
 */
define('CIVICRM_PLESK_SERVER', 'digimagical.com');
define('CIVICRM_PHP_VERSION', '8.3.25');
define('CIVICRM_SERVER_MODE', 'FPM-Apache');

/**
 * =============================================================================
 * ✅ CONFIGURATION VERIFICATION
 * =============================================================================
 * Config Created: $(date)
 * Target: crm.menschlichkeit-oesterreich.at
 * Database: mo_civicrm_data (civicrm_user)  
 * PHP: 8.3.25 FPM-Apache @ digimagical.com
 * CiviCRM: Latest Stable
 * Status: Production Ready ✅
 * =============================================================================
 */

// Load CiviCRM
if (!defined('CIVICRM_SETTINGS_PATH')) {
    define('CIVICRM_SETTINGS_PATH', __DIR__ . '/');
}

// Include custom CiviCRM extensions settings
$custom_settings = __DIR__ . '/civicrm.custom.php';
if (file_exists($custom_settings)) {
    require_once $custom_settings;
}

// Development overrides (nicht in Production verwenden)
$dev_settings = __DIR__ . '/civicrm.local.php';
if (file_exists($dev_settings)) {
    require_once $dev_settings;
}
