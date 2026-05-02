#Requires -Version 7.0
<#
.SYNOPSIS
    Sync Microsoft Graph secrets from Bitwarden SM to local .env file
.DESCRIPTION
    Retrieves MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET,
    and MICROSOFT_GRAPH_SENDER from Bitwarden SM (api/ project) and updates
    the apps/api/.env file with these values.
.PARAMETER DryRun
    Show what would change without modifying files
.PARAMETER StripeMode
    Which Stripe mode: test (default) or live
#>

param(
    [switch] $DryRun,
    [ValidateSet('test', 'live')] [string] $StripeMode = 'test'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$wrapperScript = Join-Path $PSScriptRoot 'Sync-BitwardenSecrets.ps1'

if (-not (Test-Path $wrapperScript)) {
    Write-Host "❌ Wrapper nicht gefunden: $wrapperScript" -ForegroundColor Red
    exit 1
}

& $wrapperScript -DryRun:$DryRun -StripeMode $StripeMode
exit $LASTEXITCODE
