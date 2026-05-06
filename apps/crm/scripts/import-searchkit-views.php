<?php
/**
 * SearchKit-Views importieren
 * Issue #128–#131 – CiviCRM SearchKit-Views via API4 deployen
 *
 * Aufruf: drush php-script apps/crm/scripts/import-searchkit-views.php
 * Oder als Post-Deploy-Hook via CI/CD.
 */

// Drupal Bootstrap (wenn außerhalb von Drush aufgerufen)
if (!defined('DRUPAL_ROOT')) {
    define('DRUPAL_ROOT', dirname(__DIR__) . '/web');
}

$searchkitDir = __DIR__ . '/../civicrm/searchkit';

if (!is_dir($searchkitDir)) {
    fwrite(STDERR, "SearchKit-Verzeichnis nicht gefunden: $searchkitDir\n");
    exit(1);
}

$files = glob($searchkitDir . '/*.civisearch.json');

if (empty($files)) {
    fwrite(STDERR, "Keine SearchKit-JSON-Dateien gefunden in: $searchkitDir\n");
    exit(1);
}

$imported = 0;
$errors   = 0;

foreach ($files as $file) {
    $raw = file_get_contents($file);
    if ($raw === false) {
        fwrite(STDERR, "Datei konnte nicht gelesen werden: $file\n");
        $errors++;
        continue;
    }

    $config = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        fwrite(STDERR, "JSON-Fehler in $file: " . json_last_error_msg() . "\n");
        $errors++;
        continue;
    }

    // Entferne interne Kommentare
    unset($config['_comment']);

    $name  = $config['name']  ?? basename($file, '.civisearch.json');
    $label = $config['label'] ?? $name;

    try {
        // Prüfen ob View bereits existiert
        $existing = \Civi\Api4\SavedSearch::get(false)
            ->addWhere('name', '=', $name)
            ->execute()
            ->first();

        if ($existing) {
            // Bestehende View aktualisieren
            \Civi\Api4\SavedSearch::update(false)
                ->addWhere('name', '=', $name)
                ->setValues([
                    'label'       => $label,
                    'description' => $config['description'] ?? '',
                    'api_entity'  => $config['entity'],
                    'api_params'  => [
                        'select'  => $config['select']  ?? [],
                        'join'    => $config['joins']   ?? [],
                        'where'   => $config['where']   ?? [],
                        'orderBy' => $config['orderBy'] ?? [],
                        'limit'   => $config['limit']   ?? 50,
                    ],
                ])
                ->execute();
            echo "Aktualisiert: $label ($name)\n";
        } else {
            // Neue View anlegen
            \Civi\Api4\SavedSearch::create(false)
                ->setValues([
                    'name'        => $name,
                    'label'       => $label,
                    'description' => $config['description'] ?? '',
                    'api_entity'  => $config['entity'],
                    'api_params'  => [
                        'select'  => $config['select']  ?? [],
                        'join'    => $config['joins']   ?? [],
                        'where'   => $config['where']   ?? [],
                        'orderBy' => $config['orderBy'] ?? [],
                        'limit'   => $config['limit']   ?? 50,
                    ],
                ])
                ->execute();
            echo "Erstellt: $label ($name)\n";
        }
        $imported++;

    } catch (\Exception $e) {
        fwrite(STDERR, "Fehler beim Import von $name: " . $e->getMessage() . "\n");
        $errors++;
    }
}

echo "\nErgebnis: $imported importiert, $errors Fehler.\n";
exit($errors > 0 ? 1 : 0);
