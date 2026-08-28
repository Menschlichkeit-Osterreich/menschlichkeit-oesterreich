<?php

/**
 * @file
 * Drupal site settings für Menschlichkeit Österreich CRM (Plesk-Produktion).
 *
 * Wird in das Chroot-Home deployt nach:
 *   subdomains/crm/httpdocs/native/sites/default/settings.php
 *
 * DSGVO: Kein PII in Logs.
 */

// ── Umgebung ─────────────────────────────────────────────────────────────────
// APP_ENV steuert, ob unsichere lokale Fallback-Werte erlaubt sind.
// In 'production' gilt fail-closed: fehlende Secrets brechen den Start ab,
// statt auf einen im Repository sichtbaren Standardwert zurueckzufallen.
$moe_app_env = getenv('APP_ENV') ?: 'development';
$moe_is_production = ($moe_app_env === 'production');

// ── Pflicht-Secrets ──────────────────────────────────────────────────────────
// Schluessel => nur ausserhalb der Produktion verwendeter Entwicklungswert.
// Die Aufloesung erfolgt bewusst inline statt ueber eine Hilfsfunktion:
// settings.php wird von Drupal mehrfach eingebunden, eine global deklarierte
// Funktion waere beim zweiten Einbinden ein Fatal Error.
$moe_required_settings = [
  'DRUPAL_HASH_SALT' => 'dev-only-insecure-hash-salt-do-not-use-in-production',
  'DRUPAL_DB_NAME'   => 'moe_crm',
  'DRUPAL_DB_USER'   => 'moe_crm_user',
  // Leeres Passwort ist nur lokal zulaessig; in Produktion fail-closed.
  'DRUPAL_DB_PASS'   => '',
];

$moe_settings = [];
foreach ($moe_required_settings as $moe_key => $moe_dev_value) {
  $moe_value = getenv($moe_key);

  if ($moe_value === FALSE || $moe_value === '') {
    if ($moe_is_production) {
      // Kein Secret-Wert im Fehlertext (DSGVO / Secret-Hygiene).
      throw new RuntimeException(
        sprintf(
          'Produktionsstart abgebrochen: Pflicht-Umgebungsvariable %s ist nicht gesetzt. '
          . 'Produktionswerte kommen ausschliesslich aus dem Secrets-Provider.',
          $moe_key
        )
      );
    }
    $moe_value = $moe_dev_value;
  }

  $moe_settings[$moe_key] = $moe_value;
}

// ── Datenbank ────────────────────────────────────────────────────────────────
// Wird via Plesk-Umgebungsvariable DATABASE_URL oder explizit gesetzt.
// Lokal: .env.local überschreibt diese Werte.
$databases['default']['default'] = [
  'driver'    => 'mysql',
  'database'  => $moe_settings['DRUPAL_DB_NAME'],
  'username'  => $moe_settings['DRUPAL_DB_USER'],
  'password'  => $moe_settings['DRUPAL_DB_PASS'],
  'host'      => getenv('DRUPAL_DB_HOST')   ?: 'localhost',
  'port'      => getenv('DRUPAL_DB_PORT')   ?: '3306',
  'prefix'    => '',
  'collation' => 'utf8mb4_general_ci',
  'namespace' => 'Drupal\\mysql\\Driver\\Database\\mysql',
  'autoload'  => 'core/modules/mysql/src/Driver/Database/mysql/',
];

// ── Hash-Salt ────────────────────────────────────────────────────────────────
// Der Hash-Salt schuetzt Session-, CSRF- und One-Time-Login-Token. Ein im
// Repository sichtbarer Standardwert waere in Produktion oeffentlich bekannt
// und damit wertlos. Deshalb: fail-closed, kein produktionsfaehiger Default.
// Der Entwicklungswert ist bewusst als NICHT produktionstauglich markiert.
$settings['hash_salt'] = $moe_settings['DRUPAL_HASH_SALT'];

// ── Trusted-Host-Patterns ────────────────────────────────────────────────────
// WICHTIG: Ohne diese Einstellung gibt Drupal HTTP 403 auf allen Requests zurück.
$settings['trusted_host_patterns'] = [
  '^crm\.menschlichkeit\-oesterreich\.at$',
  '^localhost$',
  '^127\.0\.0\.1$',
];

// ── Basis-URL fuer den Native-Backoffice-Pfad ────────────────────────────────
// Das produktive Drupal/CiviCRM-Runtime liegt unter https://crm.../native/.
$base_url = getenv('DRUPAL_BASE_URL') ?: 'https://crm.menschlichkeit-oesterreich.at/native';

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
