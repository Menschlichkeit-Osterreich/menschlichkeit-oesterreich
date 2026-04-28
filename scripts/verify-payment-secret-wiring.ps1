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

$mapPath = '.github/bsm-secret-ids.json'
$deployWorkflow = '.github/workflows/deploy-plesk.yml'
$runtimeContract = 'apps/api/app/runtime_secret_contract.py'
$mainPath = 'apps/api/app/main.py'
$paymentsPath = 'apps/api/app/routers/payments.py'
$mailServicePath = 'apps/api/app/services/mail_service.py'
$graphMailTransportPath = 'apps/api/app/services/graph_mail_transport.py'

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

$smtpProfileKeys = @(
    'MAIL_USERNAME',
    'MAIL_PASSWORD'
)

$secretMapJson = Get-Content -Path $mapPath -Raw | ConvertFrom-Json
$deployProductionSecretSet = $secretMapJson.profiles.'deploy-production'
if (-not $deployProductionSecretSet) {
    throw "BSM profile 'deploy-production' fehlt in $mapPath"
}

$deploySetSecrets = $deployProductionSecretSet.secrets
$deploySetEnvVars = @($deploySetSecrets | ForEach-Object { $_.env_var })

$missingApiInDeploySet = @($requiredApiKeys | Where-Object { $_ -notin $deploySetEnvVars })
$missingInfraInDeploySet = @($requiredInfraKeys | Where-Object { $_ -notin $deploySetEnvVars })
$smtpKeysInDeploySet = @($smtpProfileKeys | Where-Object { $_ -in $deploySetEnvVars })

$placeholderCount = @(
    $deploySetSecrets | Where-Object {
        $_.uuid -match '^(UPDATE_VALUE_IN_VAULT|PLACEHOLDER_)'
    }
).Count

$result = [ordered]@{
    DeploySetProductionExists = $true
    MissingApiKeysInDeploySet = $missingApiInDeploySet
    MissingInfraKeysInDeploySet = $missingInfraInDeploySet
    SmtpKeysPresentInDeploySet = $smtpKeysInDeploySet
    PlaceholderUuidCount = $placeholderCount
    RuntimeContractHasStripeSecret = Test-FileContains -Path $runtimeContract -Needle '"STRIPE_SECRET_KEY"'
    RuntimeContractHasStripeWebhook = Test-FileContains -Path $runtimeContract -Needle '"STRIPE_WEBHOOK_SECRET"'
    RuntimeContractHasSlackWebhook = Test-FileContains -Path $runtimeContract -Needle '"ALERTS_SLACK_WEBHOOK"'
    RuntimeContractHasMicrosoftTenant = Test-FileContains -Path $runtimeContract -Needle '"MICROSOFT_TENANT_ID"'
    RuntimeContractHasMicrosoftClientId = Test-FileContains -Path $runtimeContract -Needle '"MICROSOFT_CLIENT_ID"'
    RuntimeContractHasMicrosoftClientSecret = Test-FileContains -Path $runtimeContract -Needle '"MICROSOFT_CLIENT_SECRET"'
    RuntimeContractHasMicrosoftGraphSender = Test-FileContains -Path $runtimeContract -Needle '"MICROSOFT_GRAPH_SENDER"'
    RuntimeContractDefaultsMailTransportToGraph = Test-FileContains -Path $runtimeContract -Needle 'os.getenv("MAIL_TRANSPORT", "graph")'
    RuntimeContractGuardsSmtpConditionally = (
        (Test-FileContains -Path $runtimeContract -Needle 'if mail_transport == "smtp":') -and
        (Test-FileContains -Path $runtimeContract -Needle 'get_secret("MAIL_USERNAME", bsm_key="api/MAIL_USERNAME")') -and
        (Test-FileContains -Path $runtimeContract -Needle 'get_secret("MAIL_PASSWORD", bsm_key="api/MAIL_PASSWORD")')
    )
    MainEnforcesRuntimeContract = Test-FileContains -Path $mainPath -Needle 'validate_runtime_secret_contract(ENVIRONMENT)'
    PaymentsUsesSlackSecretProvider = (
        (Test-FileContains -Path $paymentsPath -Needle 'get_secret(') -and
        (Test-FileContains -Path $paymentsPath -Needle '"ALERTS_SLACK_WEBHOOK"') -and
        (Test-FileContains -Path $paymentsPath -Needle 'bsm_key="api/ALERTS_SLACK_WEBHOOK"')
    )
    MailServiceUsesGraphTransport = (
        (Test-FileContains -Path $mailServicePath -Needle 'MAIL_TRANSPORT == "graph"') -and
        (Test-FileContains -Path $mailServicePath -Needle 'GraphMailTransport(') -and
        (Test-FileContains -Path $mailServicePath -Needle 'bsm_key="api/MICROSOFT_TENANT_ID"') -and
        (Test-FileContains -Path $mailServicePath -Needle 'bsm_key="api/MICROSOFT_CLIENT_ID"') -and
        (Test-FileContains -Path $mailServicePath -Needle 'bsm_key="api/MICROSOFT_CLIENT_SECRET"') -and
        (Test-FileContains -Path $mailServicePath -Needle 'bsm_key="api/MICROSOFT_GRAPH_SENDER"')
    )
    MailServiceStillSupportsConditionalSmtpSecrets = (
        (Test-FileContains -Path $mailServicePath -Needle 'get_secret(') -and
        (Test-FileContains -Path $mailServicePath -Needle '"MAIL_USERNAME"') -and
        (Test-FileContains -Path $mailServicePath -Needle '"MAIL_PASSWORD"')
    )
    GraphMailTransportTargetsMicrosoftEndpoints = (
        (Test-FileContains -Path $graphMailTransportPath -Needle 'login.microsoftonline.com') -and
        (Test-FileContains -Path $graphMailTransportPath -Needle 'graph.microsoft.com/v1.0/users/') -and
        (Test-FileContains -Path $graphMailTransportPath -Needle '/sendMail')
    )
    DeployWorkflowUsesBsmInjectedPleskKey = Test-FileContains -Path $deployWorkflow -Needle 'PLESK_SSH_PRIVATE_KEY'
    DeployWorkflowAvoidsDirectSecretRefs = -not (Test-FileContains -Path $deployWorkflow -Needle 'secrets.PLESK_')
}

$ok = ($missingApiInDeploySet.Count -eq 0) -and
    ($missingInfraInDeploySet.Count -eq 0) -and
      ($placeholderCount -eq 0) -and
      $result.RuntimeContractHasStripeSecret -and
      $result.RuntimeContractHasStripeWebhook -and
      $result.RuntimeContractHasSlackWebhook -and
    $result.RuntimeContractHasMicrosoftTenant -and
    $result.RuntimeContractHasMicrosoftClientId -and
    $result.RuntimeContractHasMicrosoftClientSecret -and
    $result.RuntimeContractHasMicrosoftGraphSender -and
    $result.RuntimeContractDefaultsMailTransportToGraph -and
    $result.RuntimeContractGuardsSmtpConditionally -and
      $result.MainEnforcesRuntimeContract -and
      $result.PaymentsUsesSlackSecretProvider -and
    $result.MailServiceUsesGraphTransport -and
    $result.MailServiceStillSupportsConditionalSmtpSecrets -and
    $result.GraphMailTransportTargetsMicrosoftEndpoints -and
      $result.DeployWorkflowUsesBsmInjectedPleskKey -and
      $result.DeployWorkflowAvoidsDirectSecretRefs

$result['Pass'] = $ok
$result | ConvertTo-Json -Depth 5 -Compress

if (-not $ok) {
    exit 1
}
