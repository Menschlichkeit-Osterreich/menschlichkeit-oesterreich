<?php
/**
 * phpBB Konfiguration — Menschlichkeit Österreich Forum
 *
 * Alle Credentials werden über Umgebungsvariablen bezogen.
 * NIEMALS Secrets direkt in diese Datei schreiben.
 *
 * Diese Datei wird als Template verwendet. Der phpBB Web-Installer
 * generiert die finale config.php mit zusätzlichen Werten
 * (cookie-Namen, ACP-Pfad, etc.). Danach können die DB/Cache-
 * Einstellungen durch die Env-Var-Versionen hier ersetzt werden.
 */

// @define('PHPBB_INSTALLED', true);
@define('DEBUG', false);

// ── Datenbank (PostgreSQL) ──────────────────────────────────
$dbms = 'phpbb\\db\\driver\\postgres';
$dbhost = getenv('PHPBB_DB_HOST') ?: 'localhost';
$dbport = getenv('PHPBB_DB_PORT') ?: '5432';
$dbname = getenv('PHPBB_DB_NAME') ?: 'phpbb';
$dbuser = getenv('PHPBB_DB_USER') ?: 'phpbb';
$dbpasswd = getenv('PHPBB_DB_PASSWORD') ?: '';
$table_prefix = 'phpbb_';

// ── Cache (Redis, DB Index 2) ───────────────────────────────
// DB 0 = Haupt-App, DB 1 = PHP-Sessions, DB 2 = phpBB-Cache
$acm_type = 'phpbb\\cache\\driver\\redis';
$acm_options = array(
    'host' => getenv('PHPBB_REDIS_HOST') ?: 'localhost',
    'port' => (int)(getenv('PHPBB_REDIS_PORT') ?: 6379),
    'database' => 2,
    'prefix' => 'phpbb_cache_',
);

// ── Umgebung ────────────────────────────────────────────────
@define('PHPBB_ENVIRONMENT', getenv('PHPBB_ENVIRONMENT') ?: 'production');

// ── ACP (wird vom Installer gesetzt) ────────────────────────
// $phpbb_adm_relative_path = 'adm/';
// $acm_type und $acm_options werden oben bereits definiert
