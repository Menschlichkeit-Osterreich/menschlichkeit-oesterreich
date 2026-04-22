$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

function Get-EnvState {
    param(
        [string]$Path,
        [string]$Key
    )

    if (-not (Test-Path $Path)) { return 'missing-file' }

    $line = Get-Content $Path | Where-Object { $_ -match ('^' + [regex]::Escape($Key) + '=') } | Select-Object -First 1
    if (-not $line) { return 'missing-key' }

    $value = ($line -split '=', 2)[1].Trim()
    if ([string]::IsNullOrWhiteSpace($value)) { return 'empty' }
    if ($value -match 'PLACEHOLDER|CHANGE_ME') { return 'placeholder' }
    return 'set'
}

[PSCustomObject]@{
    WebsiteStripePublishable    = Get-EnvState 'apps/website/.env.local' 'VITE_STRIPE_PUBLISHABLE_KEY'
    ApiDatabaseUrl              = Get-EnvState 'apps/api/.env' 'DATABASE_URL'
    ApiStripeSecret             = Get-EnvState 'apps/api/.env' 'STRIPE_SECRET_KEY'
    ApiStripeWebhookSecret      = Get-EnvState 'apps/api/.env' 'STRIPE_WEBHOOK_SECRET'
    ApiAlertsSlackWebhook       = Get-EnvState 'apps/api/.env' 'ALERTS_SLACK_WEBHOOK'
    ApiMailUsername             = Get-EnvState 'apps/api/.env' 'MAIL_USERNAME'
    ApiMailPassword             = Get-EnvState 'apps/api/.env' 'MAIL_PASSWORD'
    ApiMailHost                 = Get-EnvState 'apps/api/.env' 'MAIL_HOST'
    ApiMailPort                 = Get-EnvState 'apps/api/.env' 'MAIL_PORT'
    ApiMailEncryption           = Get-EnvState 'apps/api/.env' 'MAIL_ENCRYPTION'
    ApiMailFromAddress          = Get-EnvState 'apps/api/.env' 'MAIL_FROM_ADDRESS'
    ApiMailFromName             = Get-EnvState 'apps/api/.env' 'MAIL_FROM_NAME'
    ApiMailReplyToAddress       = Get-EnvState 'apps/api/.env' 'MAIL_REPLY_TO_ADDRESS'
    WebsiteLegacyPayPalRemoved  = (Get-EnvState 'apps/website/.env.local' 'VITE_PAYPAL_CLIENT_ID') -eq 'missing-key'
    ApiLegacyPayPalIdRemoved    = (Get-EnvState 'apps/api/.env' 'PAYPAL_CLIENT_ID') -eq 'missing-key'
    ApiLegacyPayPalSecretRemoved = (Get-EnvState 'apps/api/.env' 'PAYPAL_CLIENT_SECRET') -eq 'missing-key'
    BsmOrganizationConfigured   = -not [string]::IsNullOrWhiteSpace($env:BSM_ORGANIZATION_ID)
} | ConvertTo-Json -Compress
