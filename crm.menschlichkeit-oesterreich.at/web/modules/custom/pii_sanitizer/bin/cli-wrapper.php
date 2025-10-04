#!/usr/bin/env php
<?php
/**
 * CLI Wrapper für PiiSanitizer
 * Ermöglicht JSON-basierte Kommandozeilen-Nutzung für n8n Integration
 * 
 * Usage: php cli-wrapper.php --text "..." --types "email,phone" --metrics 1
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/src/PiiSanitizer.php';

use Drupal\pii_sanitizer\PiiSanitizer;

// Parse CLI arguments
$options = getopt('', ['text:', 'types:', 'metrics:']);

if (!isset($options['text'])) {
    fwrite(STDERR, "Error: --text parameter required\n");
    exit(1);
}

$text = $options['text'];
$types = isset($options['types']) ? explode(',', $options['types']) : [];
$metrics = isset($options['metrics']) && $options['metrics'] === '1';

try {
    $sanitizer = new PiiSanitizer();
    
    // Konfiguriere aktivierte PII-Typen (falls angegeben)
    if (!empty($types)) {
        // In echter Implementierung würde man hier die aktivierten Typen konfigurieren
        // Für jetzt: alle Typen aktiv, da scrubText alle Pattern prüft
    }
    
    // Führe Maskierung durch
    $sanitized = $sanitizer->scrubText($text);
    
    // Bereite Output vor
    $output = [
        'sanitized' => $sanitized,
    ];
    
    if ($metrics) {
        $output['metrics'] = $sanitizer->getMetrics();
    }
    
    // Gib JSON aus
    echo json_encode($output, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit(0);
    
} catch (Exception $e) {
    fwrite(STDERR, "Error: " . $e->getMessage() . "\n");
    exit(1);
}
