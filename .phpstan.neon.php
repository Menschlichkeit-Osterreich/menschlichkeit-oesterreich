<?php

return [
    /*
    |--------------------------------------------------------------------------
    | PHPStan Configuration
    |--------------------------------------------------------------------------
    */
    'parameters' => [
        'level' => 8,
        'paths' => [
            'crm.menschlichkeit-oesterreich.at/httpdocs',
            'api.menschlichkeit-oesterreich.at',
        ],
        'excludePaths' => [
            '*/vendor/*',
            '*/storage/*',
            '*/bootstrap/cache/*',
            '*/node_modules/*',
            '*/web/games/js/*', // Gaming JS files
        ],
        'checkMissingIterableValueType' => false,
        'checkGenericClassInNonGenericObjectType' => false,
        'reportUnmatchedIgnoredErrors' => false,
        'ignoreErrors' => [
            // Drupal specific ignores
            '#Call to an undefined method.*#',
            '#Access to an undefined property.*#',
            '#Function drupal_.*not found.*#',
        ],
    ],

    'includes' => [
        // Add Symfony and Laravel extensions if needed
        // 'vendor/phpstan/phpstan-symfony/extension.neon',
        // 'vendor/phpstan/phpstan-doctrine/extension.neon',
    ],
];
