# ENV-Sync-Tool – Automatisierte Subset-Generierung
# Regeneriert Teilprojekt-.env.example aus Master (.env.example)

$ErrorActionPreference = "Stop"

# Master-Datei (Single Source of Truth)
$masterFile = ".\.env.example"

# Whitelist-Map: Pfad → Benötigte Keys
$subsetMap = @{
    "api\fastapi\.env.example" = @(
        'DATABASE_URL', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'DB_PORT',
        'APP_ENV', 'APP_PORT', 'DEBUG', 'JWT_SECRET', 'FRONTEND_ORIGINS',
        'CIVI_BASE_URL', 'CIVICRM_API_KEY', 'CIVICRM_SITE_KEY',
        'REDIS_URL'
    )
    "frontend\.env.example" = @(
        'VITE_APP_ENVIRONMENT', 'VITE_API_BASE_URL', 'VITE_API_TIMEOUT_MS',
        'VITE_ADMIN_EMAILS', 'VITE_ANALYTICS_PROVIDER', 'VITE_SENTRY_DSN'
    )
    "automation\n8n\.env.example" = @(
        'ADMIN_EMAIL', 'ADMIN_EMAIL_PASS', 'ACME_EMAIL',
        'CIVIMAIL_EMAIL', 'CIVIMAIL_EMAIL_PASS', 'BOUNCE_EMAIL', 'BOUNCE_EMAIL_PASS',
        'IMAP_HOST', 'IMAP_PORT', 'IMAP_USER', 'IMAP_PASS',
        'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS',
        'STRIPE_API_KEY', 'STRIPE_WEBHOOK_SECRET',
        'N8N_ENCRYPTION_KEY', 'N8N_USER_MANAGEMENT_DISABLED', 'N8N_BASIC_AUTH_ACTIVE',
        'N8N_BASIC_AUTH_USER', 'N8N_BASIC_AUTH_PASSWORD', 'WEBHOOK_URL'
    )
    "automation\elk-stack\.env.example" = @(
        'ENVIRONMENT', 'CLUSTER_NAME', 'ELASTIC_PASSWORD', 'ES_JAVA_OPTS',
        'ELK_NETWORK_SUBNET', 'KIBANA_SYSTEM_PASSWORD', 'COMPLIANCE_RETENTION_DAYS'
    )
    "deployment-scripts\drupal\.env.template" = @(
        'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS',
        'CIVICRM_DB_HOST', 'CIVICRM_DB_NAME', 'CIVICRM_DB_USER', 'CIVICRM_DB_PASS',
        'CIVICRM_DB_CHARSET', 'CIVICRM_DB_COLLATE',
        'CIVICRM_API_KEY', 'CIVICRM_SITE_KEY',
        'DRUPAL_ADMIN_USER', 'DRUPAL_ADMIN_PASS'
    )
}

# Master-Datei lesen (nur KEY= Zeilen)
if (-not (Test-Path $masterFile)) {
    Write-Error "Master-Datei nicht gefunden: $masterFile"
    exit 1
}

$masterLines = Get-Content $masterFile -Encoding UTF8
$masterKeys = @{}

foreach ($line in $masterLines) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=') {
        $key = $matches[1]
        $masterKeys[$key] = $line
    }
}

Write-Host "✅ Master-Datei gelesen: $($masterKeys.Count) Keys gefunden" -ForegroundColor Green

# Subsets generieren
$generatedCount = 0

foreach ($target in $subsetMap.Keys) {
    $allowedKeys = $subsetMap[$target]
    $header = "# Generated from repo-root .env.example on $(Get-Date -Format 'yyyy-MM-dd')`n"
    $lines = @()

    # Nur erlaubte Keys aus Master übernehmen (ohne Wert)
    foreach ($key in $allowedKeys) {
        if ($masterKeys.ContainsKey($key)) {
            $lines += "$key="
        } else {
            Write-Warning "Key '$key' nicht in Master gefunden (für $target)"
        }
    }

    # Datei schreiben
    $destPath = Join-Path "." $target
    $destDir = Split-Path $destPath
    
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    }

    $content = $header + ($lines -join "`n") + "`n"
    $content | Set-Content $destPath -Encoding UTF8 -NoNewline
    
    Write-Host "✅ Generiert: $destPath ($($lines.Count) Keys)" -ForegroundColor Cyan
    $generatedCount++
}

Write-Host "`n🎉 ENV-Sync abgeschlossen: $generatedCount Dateien aktualisiert" -ForegroundColor Green
