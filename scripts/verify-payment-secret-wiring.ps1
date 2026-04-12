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
    ApiStripeSecret             = Get-EnvState 'apps/api/.env' 'STRIPE_SECRET_KEY'
    WebsiteLegacyPayPalRemoved  = (Get-EnvState 'apps/website/.env.local' 'VITE_PAYPAL_CLIENT_ID') -eq 'missing-key'
    ApiLegacyPayPalIdRemoved    = (Get-EnvState 'apps/api/.env' 'PAYPAL_CLIENT_ID') -eq 'missing-key'
    ApiLegacyPayPalSecretRemoved = (Get-EnvState 'apps/api/.env' 'PAYPAL_CLIENT_SECRET') -eq 'missing-key'
    BsmOrganizationConfigured   = -not [string]::IsNullOrWhiteSpace($env:BSM_ORGANIZATION_ID)
} | ConvertTo-Json -Compress
