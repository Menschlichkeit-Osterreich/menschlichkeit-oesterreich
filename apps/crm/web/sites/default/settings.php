<?php

/**
 * @file
 * Drupal site settings für Menschlichkeit Österreich CRM (Plesk-Produktion).
 *
 * Wird in das Chroot-Home deployt nach:
 *   subdomains/crm/httpdocs/web/sites/default/settings.php
 *
 * DSGVO: Kein PII in Logs.
 */

// ── Datenbank ────────────────────────────────────────────────────────────────
// Wird via Plesk-Umgebungsvariable DATABASE_URL oder explizit gesetzt.
// Lokal: .env.local überschreibt diese Werte.
$databases['default']['default'] = [
  'driver'    => 'mysql',
  'database'  => getenv('DRUPAL_DB_NAME')   ?: 'moe_crm',
  'username'  => getenv('DRUPAL_DB_USER')   ?: 'moe_crm_user',
  'password'  => getenv('DRUPAL_DB_PASS')   ?: '',
  'host'      => getenv('DRUPAL_DB_HOST')   ?: 'localhost',
  'port'      => getenv('DRUPAL_DB_PORT')   ?: '3306',
  'prefix'    => '',
  'collation' => 'utf8mb4_general_ci',
  'namespace' => 'Drupal\\mysql\\Driver\\Database\\mysql',
  'autoload'  => 'core/modules/mysql/src/Driver/Database/mysql/',
];

// ── Hash-Salt ────────────────────────────────────────────────────────────────
$settings['hash_salt'] = getenv('DRUPAL_HASH_SALT') ?: 'MenschlichkeitOesterreich2024PleaseChangeInProd';

// ── Trusted-Host-Patterns ────────────────────────────────────────────────────
// WICHTIG: Ohne diese Einstellung gibt Drupal HTTP 403 auf allen Requests zurück.
$settings['trusted_host_patterns'] = [
  '^crm\.menschlichkeit\-oesterreich\.at$',
  '^localhost$',
  '^127\.0\.0\.1$',
];

// ── Konfigurationsverzeichnis ────────────────────────────────────────────────
$settings['config_sync_directory'] = '../config/sync';

// ── Dateisystem ─────────────────────────────────────────────────────────────
$settings['file_public_path']  = 'sites/default/files';
$settings['file_private_path'] = '../private';

// ── Deployment-Modus ────────────────────────────────────────────────────────
$settings['update_free_access']   = FALSE;
$settings['container_yamls'][]    = $app_root . '/' . $site_path . '/services.yml';

// ── Fehlerausgabe: in Produktion alles unterdrücken ──────────────────────────
// Kein PII in Error-Meldungen (DSGVO).
if (getenv('APP_ENV') === 'production') {
  $config['system.logging']['error_level'] = 'hide';
  error_reporting(0);
  ini_set('display_errors', '0');
}

// ── Reverse-Proxy (Plesk / Nginx-Vorschalter) ────────────────────────────────
// Falls Plesk einen internen Reverse-Proxy verwendet.
if (getenv('HTTP_X_FORWARDED_HOST')) {
  $settings['reverse_proxy']         = TRUE;
  $settings['reverse_proxy_addresses'] = ['127.0.0.1'];
}

// ── Lokale Overrides (NICHT committen) ───────────────────────────────────────
if (file_exists($app_root . '/' . $site_path . '/settings.local.php')) {
  include $app_root . '/' . $site_path . '/settings.local.php';
}
