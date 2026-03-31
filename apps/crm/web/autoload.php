<?php

/**
 * @file
 * Includes the Composer autoloader for the CRM runtime.
 *
 * In production the native Drupal/CiviCRM tree is deployed under `/native/`
 * while the Composer project lives in a hidden build directory at CRM root.
 * This fallback keeps local root-hosted installs working while also allowing
 * `/native/autoload.php` to resolve `../.native-build/vendor/autoload.php`.
 *
 * @see composer.json
 * @see index.php
 * @see core/install.php
 * @see core/rebuild.php
 */

$autoloadCandidates = [
  __DIR__ . '/../vendor/autoload.php',
  dirname(__DIR__) . '/.native-build/vendor/autoload.php',
];

foreach ($autoloadCandidates as $autoloadPath) {
  if (file_exists($autoloadPath)) {
    return require $autoloadPath;
  }
}

throw new RuntimeException('Composer autoload.php konnte fuer das CRM-Runtime nicht gefunden werden.');
