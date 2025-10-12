# Secrets Bootstrap Script - PowerShell
# Setzt alle erforderlichen GitHub Secrets via GitHub CLI

param(
    [switch]$DryRun = $false
)

# Configuration
$ORG = "peschull"
$REPO = "menschlichkeit-oesterreich-development"

# Functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-GitHubCLI {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        Write-Error "GitHub CLI (gh) not found. Install from https://cli.github.com"
        exit 1
    }
    
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "GitHub CLI not authenticated. Run: gh auth login"
        exit 1
    }
    
    Write-Info "GitHub CLI authenticated ✓"
}

function New-RandomSecret {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
    $rng.GetBytes($bytes)
    [Convert]::ToBase64String($bytes)
}

function Set-RepoSecret {
    param(
        [string]$Name,
        [string]$Value
    )
    
    if ($DryRun) {
        Write-Info "[DRY-RUN] Would set: $Name"
        return
    }
    
    try {
        $Value | gh secret set $Name --repo "$ORG/$REPO" 2>&1 | Out-Null
        Write-Info "✓ Set: $Name"
    }
    catch {
        Write-Error "✗ Failed: $Name"
    }
}

function Set-OrgSecret {
    param(
        [string]$Name,
        [string]$Value,
        [string]$Repos
    )
    
    if ($DryRun) {
        Write-Info "[DRY-RUN] Would set (Org): $Name"
        return
    }
    
    try {
        $Value | gh secret set $Name --org $ORG --repos $Repos 2>&1 | Out-Null
        Write-Info "✓ Set (Org): $Name"
    }
    catch {
        Write-Error "✗ Failed (Org): $Name"
    }
}

function Set-EnvSecret {
    param(
        [string]$Environment,
        [string]$Name,
        [string]$Value
    )
    
    if ($DryRun) {
        Write-Info "[DRY-RUN] Would set (Env:$Environment): $Name"
        return
    }
    
    try {
        $Value | gh secret set $Name --env $Environment --repo "$ORG/$REPO" 2>&1 | Out-Null
        Write-Info "✓ Set (Env:$Environment): $Name"
    }
    catch {
        Write-Error "✗ Failed (Env:$Environment): $Name"
    }
}

# Main Script
Write-Info "=== Secrets Bootstrap für Menschlichkeit Österreich ==="
Write-Host ""

if ($DryRun) {
    Write-Warn "DRY-RUN MODE - No secrets will be set"
    Write-Host ""
}

# Check prerequisites
Test-GitHubCLI

# User parameters
$DPO_NAME = Read-Host "DPO_NAME (Datenschutzbeauftragte:r)"
$DPO_EMAIL = Read-Host "DPO_EMAIL"
$SEC_EMAIL = Read-Host "SEC_EMAIL (Security Contact)"
$INCIDENT_PAGER = Read-Host "INCIDENT_PAGER (Matrix/Slack On-Call)"

Write-Host ""
Write-Info "=== Step 1: Infrastructure Secrets ==="

# SSH Deployment
$sshKeyPath = "$env:USERPROFILE\.ssh\id_ed25519"
if (Test-Path $sshKeyPath) {
    $SSH_PRIVATE_KEY = Get-Content $sshKeyPath -Raw
    Set-RepoSecret "SSH_PRIVATE_KEY" $SSH_PRIVATE_KEY
}
else {
    Write-Warn "SSH key not found at $sshKeyPath. Please set manually."
}

$SSH_HOST = Read-Host "SSH_HOST (e.g., user@host)"
Set-RepoSecret "SSH_HOST" $SSH_HOST

$SSH_USER = Read-Host "SSH_USER"
Set-RepoSecret "SSH_USER" $SSH_USER

$SSH_PORT = Read-Host "SSH_PORT (default: 22)"
if ([string]::IsNullOrWhiteSpace($SSH_PORT)) { $SSH_PORT = "22" }
Set-RepoSecret "SSH_PORT" $SSH_PORT

Write-Host ""
Write-Info "=== Step 2: Database Hosts ==="

$MYSQL_HOST = Read-Host "MYSQL_HOST (External MariaDB)"
Set-RepoSecret "MYSQL_HOST" $MYSQL_HOST

$PG_HOST = Read-Host "PG_HOST (External PostgreSQL)"
Set-RepoSecret "PG_HOST" $PG_HOST

$REDIS_HOST = Read-Host "REDIS_HOST (Optional, press Enter to skip)"
if (-not [string]::IsNullOrWhiteSpace($REDIS_HOST)) {
    Set-RepoSecret "REDIS_HOST" $REDIS_HOST
}

Write-Host ""
Write-Info "=== Step 3: Database Passwords (Auto-Generate) ==="

# Plesk MariaDB
$pleskDBs = @("MAIN", "VOTES", "SUPPORT", "NEWSLETTER", "FORUM")
foreach ($db in $pleskDBs) {
    $secretName = "MO_${db}_DB_PASS"
    $secretValue = New-RandomSecret
    Set-RepoSecret $secretName $secretValue
    Write-Warn "Please update $db DB password to: [REDACTED - check GitHub Secrets]"
}

# External MariaDB
$externalDBs = @("CRM", "N8N", "HOOKS", "CONSENT", "GAMES", "ANALYTICS", "API_STG", "ADMIN_STG", "NEXTCLOUD")
foreach ($db in $externalDBs) {
    $secretName = "MO_${db}_DB_PASS"
    $secretValue = New-RandomSecret
    Set-RepoSecret $secretName $secretValue
}

# PostgreSQL
$pgDBs = @("IDP", "GRAFANA", "DISCOURSE")
foreach ($db in $pgDBs) {
    $secretName = "PG_${db}_DB_PASS"
    $secretValue = New-RandomSecret
    Set-RepoSecret $secretName $secretValue
}

# Redis (if configured)
if (-not [string]::IsNullOrWhiteSpace($REDIS_HOST)) {
    $REDIS_PASSWORD = New-RandomSecret
    Set-RepoSecret "REDIS_PASSWORD" $REDIS_PASSWORD
}

Write-Host ""
Write-Info "=== Step 4: Application Secrets ==="

# JWT & Encryption
$JWT_SECRET = New-RandomSecret
Set-RepoSecret "JWT_SECRET" $JWT_SECRET

$N8N_ENCRYPTION_KEY = New-RandomSecret
Set-RepoSecret "N8N_ENCRYPTION_KEY" $N8N_ENCRYPTION_KEY

# CiviCRM
$CIVICRM_SITE_KEY = Read-Host "CIVICRM_SITE_KEY (32 chars, or press Enter to generate)"
if ([string]::IsNullOrWhiteSpace($CIVICRM_SITE_KEY)) {
    $CIVICRM_SITE_KEY = New-RandomSecret
}
Set-RepoSecret "CIVICRM_SITE_KEY" $CIVICRM_SITE_KEY

$CIVICRM_API_KEY = Read-Host "CIVICRM_API_KEY (or press Enter to generate)"
if ([string]::IsNullOrWhiteSpace($CIVICRM_API_KEY)) {
    $CIVICRM_API_KEY = New-RandomSecret
}
Set-RepoSecret "CIVICRM_API_KEY" $CIVICRM_API_KEY

# n8n
$N8N_USER = Read-Host "N8N_USER (admin username)"
Set-RepoSecret "N8N_USER" $N8N_USER

$N8N_PASSWORD = Read-Host "N8N_PASSWORD" -AsSecureString
$N8N_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($N8N_PASSWORD))
Set-RepoSecret "N8N_PASSWORD" $N8N_PASSWORD_PLAIN

Write-Host ""
Write-Info "=== Step 5: Organization Secrets (Optional) ==="

$setOrg = Read-Host "Set Organization Secrets? (y/N)"
if ($setOrg -eq "y" -or $setOrg -eq "Y") {
    $FIGMA_TOKEN = Read-Host "FIGMA_ACCESS_TOKEN"
    Set-OrgSecret "FIGMA_ACCESS_TOKEN" $FIGMA_TOKEN $REPO
    
    $CODACY_TOKEN = Read-Host "CODACY_API_TOKEN (optional, press Enter to skip)"
    if (-not [string]::IsNullOrWhiteSpace($CODACY_TOKEN)) {
        Set-OrgSecret "CODACY_API_TOKEN" $CODACY_TOKEN $REPO
    }
}

Write-Host ""
Write-Info "=== Step 6: Environment Secrets ==="

# Production
Write-Info "Setting Production Environment Secrets..."
$PROD_DB_URL = Read-Host "PROD_DATABASE_URL"
Set-EnvSecret "production" "DATABASE_URL" $PROD_DB_URL
Set-EnvSecret "production" "API_BASE_URL" "https://api.menschlichkeit-oesterreich.at"
Set-EnvSecret "production" "LOG_LEVEL" "info"

# Staging
Write-Info "Setting Staging Environment Secrets..."
$STAGING_DB_URL = Read-Host "STAGING_DATABASE_URL"
Set-EnvSecret "staging" "DATABASE_URL" $STAGING_DB_URL
Set-EnvSecret "staging" "API_BASE_URL" "https://api.stg.menschlichkeit-oesterreich.at"
Set-EnvSecret "staging" "LOG_LEVEL" "debug"

Write-Host ""
Write-Info "=== Step 7: Validation ==="

if (-not $DryRun) {
    Write-Info "Repository Secrets:"
    gh secret list --repo "$ORG/$REPO"
}

Write-Host ""
Write-Info "✅ Bootstrap completed!"
Write-Host ""
Write-Warn "⚠️ NEXT STEPS:"
Write-Host "1. Update database passwords on servers with generated values"
Write-Host "2. Run validation: npm run validate:secrets"
Write-Host "3. Test deployment with new secrets"
Write-Host "4. Document any custom secrets in docs/security/secrets-catalog.md"
Write-Host ""
Write-Info "📝 Secrets are encrypted and only visible to authorized users."
