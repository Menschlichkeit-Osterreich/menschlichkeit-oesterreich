$ErrorActionPreference = 'Stop'

# Read-only repository consistency check. Does not call external services and does not print secret values.
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

function Test-FileContains {
    param(
        [string]$Path,
        [string]$Needle
    )

    if (-not (Test-Path $Path)) {
        return $false
    }

    $content = Get-Content -Path $Path -Raw
    return $content.Contains($Needle)
}

function Get-ProfileSecretMap {
    param(
        [string]$MapPath,
        [string]$Profile
    )

    $json = Get-Content -Path $MapPath -Raw | ConvertFrom-Json
    $profileNode = $json.profiles.$Profile
    if (-not $profileNode) {
        throw "BSM profile '$Profile' fehlt in $MapPath"
    }
    return $profileNode.secrets
}

$mapPath = '.github/bsm-secret-ids.json'
$deployWorkflow = '.github/workflows/deploy-plesk.yml'
$runtimeContract = 'apps/api/app/runtime_secret_contract.py'
$mainPath = 'apps/api/app/main.py'
$paymentsPath = 'apps/api/app/routers/payments.py'

$requiredApiKeys = @(
    'DATABASE_URL',
    'JWT_SECRET_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'MOE_API_TOKEN',
    'N8N_WEBHOOK_SECRET',
    'CIVICRM_SITE_KEY',
    'CIVICRM_API_KEY',
    'ALERTS_SLACK_WEBHOOK',
    'MICROSOFT_TENANT_ID',
    'MICROSOFT_CLIENT_ID',
    'MICROSOFT_CLIENT_SECRET',
    'MICROSOFT_GRAPH_SENDER'
)

$requiredInfraKeys = @(
    'PLESK_HOST',
    'PLESK_USER',
    'PLESK_PORT',
    'PLESK_SSH_PRIVATE_KEY',
    'PLESK_KNOWN_HOSTS'
)

$profileSecrets = Get-ProfileSecretMap -MapPath $mapPath -Profile 'deploy-production'
$profileEnvVars = @($profileSecrets | ForEach-Object { $_.env_var })

$missingApiInProfile = @($requiredApiKeys | Where-Object { $_ -notin $profileEnvVars })
$missingInfraInProfile = @($requiredInfraKeys | Where-Object { $_ -notin $profileEnvVars })

$placeholderCount = @(
    $profileSecrets | Where-Object {
        $_.uuid -match '^(UPDATE_VALUE_IN_VAULT|PLACEHOLDER_)'
    }
).Count

$result = [ordered]@{
    ProfileDeployProductionExists = $true
    MissingApiKeysInProfile = $missingApiInProfile
    MissingInfraKeysInProfile = $missingInfraInProfile
    PlaceholderUuidCount = $placeholderCount
    RuntimeContractHasStripeSecret = Test-FileContains -Path $runtimeContract -Needle '"STRIPE_SECRET_KEY"'
    RuntimeContractHasStripeWebhook = Test-FileContains -Path $runtimeContract -Needle '"STRIPE_WEBHOOK_SECRET"'
    RuntimeContractHasSlackWebhook = Test-FileContains -Path $runtimeContract -Needle '"ALERTS_SLACK_WEBHOOK"'
    MainEnforcesRuntimeContract = Test-FileContains -Path $mainPath -Needle 'validate_runtime_secret_contract(ENVIRONMENT)'
    PaymentsUsesSlackSecretProvider = (
        (Test-FileContains -Path $paymentsPath -Needle 'get_secret(') -and
        (Test-FileContains -Path $paymentsPath -Needle '"ALERTS_SLACK_WEBHOOK"') -and
        (Test-FileContains -Path $paymentsPath -Needle 'bsm_key="api/ALERTS_SLACK_WEBHOOK"')
    )
    DeployWorkflowUsesBsmInjectedPleskKey = Test-FileContains -Path $deployWorkflow -Needle 'PLESK_SSH_PRIVATE_KEY'
    DeployWorkflowAvoidsDirectSecretRefs = -not (Test-FileContains -Path $deployWorkflow -Needle 'secrets.PLESK_')
}

$ok = ($missingApiInProfile.Count -eq 0) -and
      ($missingInfraInProfile.Count -eq 0) -and
      ($placeholderCount -eq 0) -and
      $result.RuntimeContractHasStripeSecret -and
      $result.RuntimeContractHasStripeWebhook -and
      $result.RuntimeContractHasSlackWebhook -and
      $result.MainEnforcesRuntimeContract -and
      $result.PaymentsUsesSlackSecretProvider -and
      $result.DeployWorkflowUsesBsmInjectedPleskKey -and
      $result.DeployWorkflowAvoidsDirectSecretRefs

$result['Pass'] = $ok
$result | ConvertTo-Json -Depth 5 -Compress

if (-not $ok) {
    exit 1
}
