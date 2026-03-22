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

$civicrm_db_host = moe_env('CIVICRM_DB_HOST', 'localhost');
$civicrm_db_name = moe_env('CIVICRM_DB_NAME', 'CHANGE_ME_CIVICRM_DB_NAME');
$civicrm_db_user = moe_env('CIVICRM_DB_USER', 'CHANGE_ME_CIVICRM_DB_USER');
$civicrm_db_pass = moe_env('CIVICRM_DB_PASS', 'CHANGE_ME_CIVICRM_DB_PASS');
$civicrm_wp_db_user = moe_env('WORDPRESS_DB_USER', 'CHANGE_ME_WORDPRESS_DB_USER');
$civicrm_wp_db_pass = moe_env('WORDPRESS_DB_PASS', 'CHANGE_ME_WORDPRESS_DB_PASS');
$civicrm_wp_db_name = moe_env('WORDPRESS_DB_NAME', 'CHANGE_ME_WORDPRESS_DB_NAME');
$civicrm_base_url = rtrim(moe_env('MAIN_SITE_URL', 'https://menschlichkeit-oesterreich.at/'), '/') . '/';
$civicrm_dsn = sprintf('mysql://%s:%s@%s/%s?new_link=true', $civicrm_db_user, $civicrm_db_pass, $civicrm_db_host, $civicrm_db_name);
$civicrm_uf_dsn = sprintf('mysql://%s:%s@%s/%s?new_link=true', $civicrm_wp_db_user, $civicrm_wp_db_pass, $civicrm_db_host, $civicrm_wp_db_name);

/**
 * CiviCRM Configuration für mo_civicrm_data @ digimagical.com
 * settings.php oder wp-config.php Integration
 * MariaDB 10.6.22 auf Ubuntu 22.04
 */

// CiviCRM Database Configuration - STANDALONE (ohne WordPress)
// Dedicated civicrm_user (NICHT mo_wp_user)
define('CIVICRM_DSN', $civicrm_dsn);

// CiviCRM Database Character Set
define('CIVICRM_DB_CHARSET', 'utf8mb4');
define('CIVICRM_DB_COLLATE', 'utf8mb4_unicode_ci');

// CiviCRM Template Compilation Directory
define('CIVICRM_TEMPLATE_COMPILEDIR', moe_env('CIVICRM_TEMPLATE_COMPILEDIR', '/var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs/wp-content/uploads/civicrm/templates_c/'));

// CiviCRM Upload Directory
define('CIVICRM_UF_BASEURL', $civicrm_base_url);
define('CIVICRM_UPLOAD_DIR', moe_env('CIVICRM_UPLOAD_DIR', '/var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs/wp-content/uploads/civicrm/upload/'));

// CiviCRM Custom Files Directory
define('CIVICRM_CUSTOM_PHP_DIR', moe_env('CIVICRM_CUSTOM_PHP_DIR', '/var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs/wp-content/uploads/civicrm/custom/'));
define('CIVICRM_CUSTOM_TEMPLATE_DIR', moe_env('CIVICRM_CUSTOM_TEMPLATE_DIR', '/var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs/wp-content/uploads/civicrm/custom/templates/'));

// CiviCRM Extensions Directory
define('CIVICRM_EXT_DIR', moe_env('CIVICRM_EXT_DIR', '/var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs/wp-content/uploads/civicrm/ext/'));
define('CIVICRM_EXT_URL', moe_env('CIVICRM_EXT_URL', 'https://menschlichkeit-oesterreich.at/wp-content/uploads/civicrm/ext/'));

// CiviCRM Site Key (Unique identifier)
define('CIVICRM_SITE_KEY', moe_env('CIVICRM_SITE_KEY', 'CHANGE_ME_CIVICRM_SITE_KEY'));

// CiviCRM User Framework (WordPress Integration)
define('CIVICRM_UF', 'WordPress');
define('CIVICRM_UF_DSN', $civicrm_uf_dsn);

// Performance Settings
define('CIVICRM_CACHE_TYPE', 'ArrayCache');
define('CIVICRM_SMARTY_DEFAULT_ESCAPE', 'htmlentities');

// Security Settings
define('CIVICRM_SIGN_KEYS', moe_env('CIVICRM_SIGN_KEYS', 'CHANGE_ME_CIVICRM_SIGN_KEYS'));
define('CIVICRM_CRYPT_KEYS', moe_env('CIVICRM_CRYPT_KEYS', 'CHANGE_ME_CIVICRM_CRYPT_KEYS'));

// Email Configuration (Plesk SMTP)
define('CIVICRM_MAIL_SMTP', '1');
define('CIVICRM_MAIL_SMTP_SERVER', moe_env('CIVICRM_MAIL_SMTP_SERVER', 'smtp.menschlichkeit-oesterreich.at'));
define('CIVICRM_MAIL_SMTP_PORT', moe_env('CIVICRM_MAIL_SMTP_PORT', '587'));
define('CIVICRM_MAIL_SMTP_AUTH', '1');
define('CIVICRM_MAIL_SMTP_USERNAME', moe_env('CIVICRM_MAIL_SMTP_USERNAME', 'CHANGE_ME_CIVICRM_SMTP_USER'));
define('CIVICRM_MAIL_SMTP_PASSWORD', moe_env('CIVICRM_MAIL_SMTP_PASSWORD', 'CHANGE_ME_CIVICRM_SMTP_PASS'));

// Logging & Debugging
define('CIVICRM_DEBUG_LOG_QUERY', 0);
define('CIVICRM_BACKTRACE', 0);

// Plesk-spezifische Konfiguration
define('CIVICRM_SERVER_INFO', 'MariaDB 10.6.22 @ digimagical.com');
define('CIVICRM_WEBSERVER', 'nginx/1.28.0');
define('CIVICRM_PHP_VERSION', '8.4.11');

// Website Assignment Information
// ✅ RESOLVED: Assign mo_civicrm_data to menschlichkeit-oesterreich.at in Plesk Panel
// Current Status: ✅ Website-Zuordnung für Produktionsserver vorbereitet
// Action Required: In Plesk Panel → Databases → mo_civicrm_data → assign to main domain
// Backup Strategy: Automated via Plesk website-level backup for menschlichkeit-oesterreich.at

/**
 * Alternative Configuration for WordPress wp-config.php Integration:
 *
 * // Add to wp-config.php after database configuration:
 *
 * // CiviCRM Database
 * define('CIVICRM_DSN', getenv('CIVICRM_DSN'));
 * define('CIVICRM_UF_DSN', getenv('CIVICRM_UF_DSN'));
 *
 * // CiviCRM Site Configuration
 * define('CIVICRM_SITE_KEY', getenv('CIVICRM_SITE_KEY'));
 * define('CIVICRM_UF', 'WordPress');
 *
 * // CiviCRM Directories
 * define('CIVICRM_TEMPLATE_COMPILEDIR', WP_CONTENT_DIR . '/uploads/civicrm/templates_c/');
 * define('CIVICRM_UF_BASEURL', get_site_url() . '/');
 */

// Performance Optimization für MariaDB
ini_set('mysql.connect_timeout', 10);
ini_set('default_socket_timeout', 10);

// Character Set Enforcement
$GLOBALS['civicrm_db_charset'] = 'utf8mb4';
$GLOBALS['civicrm_db_collate'] = 'utf8mb4_unicode_ci';
