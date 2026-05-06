#!/usr/bin/env pwsh
# GitHub Secrets Setup Helper für Menschlichkeit Österreich
# Hilft beim sicheren Setup der GitHub Repository Secrets

param(
    [switch]$GenerateKeys,
    [switch]$ValidateSecrets,
    [switch]$ShowSecretsList,
    [string]$Environment = "development"
)

Write-Host "🔐 GitHub Secrets Setup Helper" -ForegroundColor Green
Write-Host "Menschlichkeit Österreich Enterprise Repository" -ForegroundColor Cyan

# Define all required secrets
$RequiredSecrets = @{
    # Infrastructure & SSH
    "PLESK_HOST" = @{
        description = "Plesk server host with username"
        example = "user@server-ip"
        category = "Infrastructure"
        required = $true
    }
    "SSH_PRIVATE_KEY" = @{
        description = "SSH private key content for Plesk access"
        example = "***REMOVED***..."
        category = "Infrastructure"
        required = $true
    }

    # Database Credentials
    "LARAVEL_DB_USER" = @{
        description = "Laravel API database username"
        example = "laravel_user"
        category = "Database"
        required = $true
    }
    "LARAVEL_DB_PASS" = @{
        description = "Laravel API database password"
        example = "secure-password-2025"
        category = "Database"
        required = $true
    }
    "LARAVEL_DB_NAME" = @{
        description = "Laravel API database name"
        example = "mo_laravel_api"
        category = "Database"
        required = $true
    }
    "CIVICRM_DB_USER" = @{
        description = "CiviCRM database username"
        example = "civicrm_user"
        category = "Database"
        required = $true
    }
    "CIVICRM_DB_PASS" = @{
        description = "CiviCRM database password"
        example = "secure-civicrm-2025"
        category = "Database"
        required = $true
    }
    "CIVICRM_DB_NAME" = @{
        description = "CiviCRM database name"
        example = "mo_civicrm_data"
        category = "Database"
        required = $true
    }

    # Quality Tools
    "CODACY_API_TOKEN" = @{
        description = "Codacy API token for quality analysis"
        example = "codacy-api-token-here"
        category = "Quality"
        required = $true
    }
    "SNYK_TOKEN" = @{
        description = "Snyk authentication token for security scanning"
        example = "snyk-token-here"
        category = "Security"
        required = $true
    }
    "SONAR_TOKEN" = @{
        description = "SonarQube/SonarCloud token"
        example = "sonar-token-here"
        category = "Quality"
        required = $false
    }

    # n8n Automation
    "N8N_USER" = @{
        description = "n8n admin username"
        example = "admin"
        category = "Automation"
        required = $true
    }
    "N8N_PASSWORD" = @{
        description = "n8n admin password"
        example = "secure-n8n-password"
        category = "Automation"
        required = $true
    }
    "N8N_ENCRYPTION_KEY" = @{
        description = "n8n encryption key (32 characters)"
        example = "generated-32-char-key"
        category = "Automation"
        required = $true
    }

    # CiviCRM Integration
    "CIVICRM_SITE_KEY" = @{
        description = "CiviCRM site key for API access"
        example = "civicrm-site-key"
        category = "Integration"
        required = $true
    }
    "CIVICRM_API_KEY" = @{
        description = "CiviCRM API v4 key"
        example = "civicrm-api-key"
        category = "Integration"
        required = $true
    }
    "JWT_SECRET" = @{
        description = "JWT secret for API authentication (32 characters)"
        example = "generated-jwt-secret"
        category = "Security"
        required = $true
    }
}

if ($ShowSecretsList) {
    Write-Host "`n📋 Required GitHub Secrets:" -ForegroundColor Yellow

    $Categories = $RequiredSecrets.Values | Group-Object -Property category
    foreach ($Category in $Categories) {
        Write-Host "`n🔹 $($Category.Name)" -ForegroundColor Cyan
        foreach ($Secret in $Category.Group) {
            $SecretName = ($RequiredSecrets.GetEnumerator() | Where-Object { $_.Value -eq $Secret }).Key
            $RequiredText = if ($Secret.required) { "REQUIRED" } else { "OPTIONAL" }
            $Color = if ($Secret.required) { "Red" } else { "Yellow" }
            Write-Host "  $SecretName" -ForegroundColor White -NoNewline
            Write-Host " ($RequiredText)" -ForegroundColor $Color
            Write-Host "    $($Secret.description)" -ForegroundColor Gray
        }
    }

    Write-Host "`n💡 Setup Instructions:" -ForegroundColor Yellow
    Write-Host "1. Go to GitHub Repository → Settings → Secrets and variables → Actions" -ForegroundColor Cyan
    Write-Host "2. Click 'New repository secret'" -ForegroundColor Cyan
    Write-Host "3. Add each secret with the exact name shown above" -ForegroundColor Cyan
    Write-Host "4. Use GITHUB-SECRETS-SETUP.md for detailed instructions" -ForegroundColor Cyan
    return
}

if ($GenerateKeys) {
    Write-Host "`n🔑 Generating secure keys..." -ForegroundColor Yellow

    # Generate JWT Secret
    $JwtSecret = -join ((1..32) | ForEach-Object { [char]((65..90) + (97..122) + (48..57) | Get-Random) })
    Write-Host "`n🔐 JWT_SECRET (copy to GitHub Secrets):" -ForegroundColor Green
    Write-Host $JwtSecret -ForegroundColor White

    # Generate N8N Encryption Key
    $N8nKey = -join ((1..32) | ForEach-Object { [char]((65..90) + (97..122) + (48..57) | Get-Random) })
    Write-Host "`n🔐 N8N_ENCRYPTION_KEY (copy to GitHub Secrets):" -ForegroundColor Green
    Write-Host $N8nKey -ForegroundColor White

    # Generate secure passwords
    $LongPassword = -join ((1..24) | ForEach-Object { [char]((65..90) + (97..122) + (48..57) + (33,35,36,37,38,42,43,45,61,63,64) | Get-Random) })
    Write-Host "`n🔐 Sample secure password (24 chars):" -ForegroundColor Green
    Write-Host $LongPassword -ForegroundColor White

    Write-Host "`n💡 SSH Key Generation:" -ForegroundColor Yellow
    Write-Host "Run these commands to generate SSH key:" -ForegroundColor Cyan
    Write-Host "ssh-keygen -t ed25519 -C 'github-actions@menschlichkeit-oesterreich.at'" -ForegroundColor White
    Write-Host "ssh-copy-id -i ~/.ssh/id_ed25519.pub dmpl20230054@5.183.217.146" -ForegroundColor White
    Write-Host "cat ~/.ssh/id_ed25519  # Copy output to SSH_PRIVATE_KEY secret" -ForegroundColor White
}

if ($ValidateSecrets) {
    Write-Host "`n🔍 Validating secrets configuration..." -ForegroundColor Yellow

    # Check if .env file exists and contains secrets (bad!)
    if (Test-Path ".env") {
        $EnvContent = Get-Content ".env" -Raw
        $ContainsSecrets = $false

        $SensitivePatterns = @(
            "SECURE_LARAVEL_2025",
            "SECURE_CIVICRM_2025",
            "dmpl20230054@5.183.217.146",
            "-----BEGIN",
            "api_token",
            "secret_key"
        )

        foreach ($Pattern in $SensitivePatterns) {
            if ($EnvContent -match $Pattern) {
                $ContainsSecrets = $true
                break
            }
        }

        if ($ContainsSecrets) {
            Write-Host "❌ WARNING: .env file contains production secrets!" -ForegroundColor Red
            Write-Host "   Move these to GitHub Secrets and use placeholders in .env" -ForegroundColor Yellow
        } else {
            Write-Host "✅ .env file looks safe (no production secrets detected)" -ForegroundColor Green
        }
    }

    # Check if .env.example exists and is safe
    if (Test-Path ".env.example") {
        Write-Host "✅ .env.example template found" -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example template missing" -ForegroundColor Red
    }

    # Check .gitignore
    if (Test-Path ".gitignore") {
        $GitignoreContent = Get-Content ".gitignore" -Raw
        if ($GitignoreContent -match "\.env$") {
            Write-Host "✅ .gitignore properly excludes .env files" -ForegroundColor Green
        } else {
            Write-Host "❌ WARNING: .gitignore should exclude .env files" -ForegroundColor Red
            Write-Host "   Add '.env' to .gitignore immediately!" -ForegroundColor Yellow
        }
    }

    Write-Host "`n📋 Secret Categories Status:" -ForegroundColor Yellow
    $Categories = $RequiredSecrets.Values | Group-Object -Property category
    foreach ($Category in $Categories) {
        $RequiredCount = ($Category.Group | Where-Object { $_.required }).Count
        $OptionalCount = ($Category.Group | Where-Object { -not $_.required }).Count
        Write-Host "  $($Category.Name): $RequiredCount required, $OptionalCount optional" -ForegroundColor Cyan
    }
}

# Default action: show overview
if (-not $GenerateKeys -and -not $ValidateSecrets -and -not $ShowSecretsList) {
    Write-Host "`n🎯 GitHub Secrets Setup Overview" -ForegroundColor Yellow
    Write-Host "Available actions:" -ForegroundColor Cyan
    Write-Host "  -ShowSecretsList    Show all required secrets with descriptions" -ForegroundColor White
    Write-Host "  -GenerateKeys       Generate secure keys and passwords" -ForegroundColor White
    Write-Host "  -ValidateSecrets    Validate current configuration" -ForegroundColor White

    Write-Host "`n📊 Summary:" -ForegroundColor Yellow
    $TotalRequired = ($RequiredSecrets.Values | Where-Object { $_.required }).Count
    $TotalOptional = ($RequiredSecrets.Values | Where-Object { -not $_.required }).Count
    Write-Host "  Required secrets: $TotalRequired" -ForegroundColor Red
    Write-Host "  Optional secrets: $TotalOptional" -ForegroundColor Yellow
    Write-Host "  Total secrets: $($TotalRequired + $TotalOptional)" -ForegroundColor Cyan

    Write-Host "`n🚀 Quick Start:" -ForegroundColor Green
    Write-Host "1. ./scripts/setup-github-secrets.ps1 -ShowSecretsList" -ForegroundColor Cyan
    Write-Host "2. ./scripts/setup-github-secrets.ps1 -GenerateKeys" -ForegroundColor Cyan
    Write-Host "3. Setup secrets in GitHub Repository Settings" -ForegroundColor Cyan
    Write-Host "4. ./scripts/setup-github-secrets.ps1 -ValidateSecrets" -ForegroundColor Cyan
}

Write-Host "`n📚 For detailed instructions, see: GITHUB-SECRETS-SETUP.md" -ForegroundColor Blue
