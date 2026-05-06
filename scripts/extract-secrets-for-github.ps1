#!/usr/bin/env pwsh

<#
    .SYNOPSIS
    Extrahiert Secrets aus .env Datei für GitHub Secrets Setup
    
    .DESCRIPTION
    Dieses Script liest die lokale .env Datei und erstellt eine sichere
    Ausgabe aller Secrets, die in GitHub Repository Settings konfiguriert 
    werden müssen. Die Secrets werden NICHT ins Repository committed.
    
    .EXAMPLE
    .\scripts\extract-secrets-for-github.ps1
    .\scripts\extract-secrets-for-github.ps1 -OutputFormat JSON
    .\scripts\extract-secrets-for-github.ps1 -OnlyRequired
#>

param(
    [ValidateSet("Console", "JSON", "PowerShell")]
    [string]$OutputFormat = "Console",
    
    [switch]$OnlyRequired = $false,
    
    [switch]$IncludeSSHKey = $true,
    
    [switch]$ValidateFormat = $true
)

# Pfade definieren
$envFile = Join-Path $PSScriptRoot "..\\.env"
$sshKeyPath = "$env:USERPROFILE\\.ssh\\id_ed25519"

Write-Host "🔐 GitHub Secrets Extraktor" -ForegroundColor Green  
Write-Host "Menschlichkeit Österreich Enterprise Repository" -ForegroundColor Blue
Write-Host ""

# Prüfen ob .env existiert
if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env Datei nicht gefunden: $envFile" -ForegroundColor Red
    Write-Host "   Erstelle zunächst eine .env basierend auf .env.example" -ForegroundColor Yellow
    exit 1
}

# .env laden und parsen
$secrets = @{}
$envContent = Get-Content $envFile | Where-Object { 
    $_ -match "^[A-Z_]+=.+" -and $_ -notmatch "^#" 
}

foreach ($line in $envContent) {
    if ($line -match "^([A-Z_]+)=(.+)$") {
        $key = $matches[1]
        $value = $matches[2]
        
        # Anführungszeichen entfernen falls vorhanden
        $value = $value -replace '^"(.*)"$', '$1'
        $value = $value -replace "^'(.*)'$", '$1'
        
        $secrets[$key] = $value
    }
}

# SSH Key laden wenn gewünscht
if ($IncludeSSHKey -and (Test-Path $sshKeyPath)) {
    $sshKeyContent = Get-Content $sshKeyPath -Raw
    $secrets["SSH_PRIVATE_KEY"] = $sshKeyContent.Trim()
}

# Erforderliche vs. optionale Secrets definieren
$requiredSecrets = @(
    "PLESK_HOST",
    "SSH_PRIVATE_KEY", 
    "LARAVEL_DB_NAME",
    "LARAVEL_DB_USER",
    "LARAVEL_DB_PASS",
    "CIVICRM_DB_NAME", 
    "CIVICRM_DB_USER",
    "CIVICRM_DB_PASS",
    "MAIL_LOGGING_EMAIL",
    "MAIL_LOGGING_PASSWORD",
    "MAIL_INFO_EMAIL",
    "MAIL_INFO_PASSWORD",
    "MAIL_ADMIN_EMAIL",
    "MAIL_ADMIN_PASSWORD",
    "MAIL_CIVIMAIL_EMAIL",
    "MAIL_CIVIMAIL_PASSWORD",
    "MAIL_BOUNCE_EMAIL",
    "MAIL_BOUNCE_PASSWORD",
    "JWT_SECRET",
    "SNYK_TOKEN",
    "CODACY_API_TOKEN",
    "N8N_USER",
    "N8N_PASSWORD",
    "N8N_ENCRYPTION_KEY",
    "CIVICRM_API_KEY",
    "CIVICRM_SITE_KEY"
)

$optionalSecrets = @(
    "SONAR_TOKEN",
    "GITHUB_TOKEN",
    "WEBHOOK_SECRET",
    "OPENAI_API_KEY"
)

# Ausgabe je nach Format
switch ($OutputFormat) {
    "JSON" {
        $output = @{
            required = @{}
            optional = @{}
            metadata = @{
                generated = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                source = ".env file extraction"
                repository = "menschlichkeit-oesterreich"
            }
        }
        
        foreach ($key in $requiredSecrets) {
            if ($secrets.ContainsKey($key)) {
                $output.required[$key] = $secrets[$key]
            }
        }
        
        if (-not $OnlyRequired) {
            foreach ($key in $optionalSecrets) {
                if ($secrets.ContainsKey($key)) {
                    $output.optional[$key] = $secrets[$key]
                }
            }
        }
        
        $output | ConvertTo-Json -Depth 3 | Write-Host
    }
    
    "PowerShell" {
        Write-Host "# GitHub Secrets PowerShell Setup Script" -ForegroundColor Green
        Write-Host "# Generiert: $(Get-Date)" -ForegroundColor Gray
        Write-Host ""
        
        foreach ($key in $requiredSecrets) {
            if ($secrets.ContainsKey($key)) {
                $value = $secrets[$key] -replace '"', '""'  # Escape quotes for PowerShell
                Write-Host "`$env:$key = `"$value`"" -ForegroundColor Cyan
            }
        }
    }
    
    default {
        Write-Host "📋 GITHUB SECRETS SETUP ANWEISUNGEN" -ForegroundColor Yellow
        Write-Host "=" * 50 -ForegroundColor Yellow
        Write-Host ""
        
        Write-Host "🎯 Gehe zu:" -ForegroundColor Green
        Write-Host "   GitHub Repository → Settings → Secrets and variables → Actions" -ForegroundColor White
        Write-Host ""
        
        Write-Host "🔐 ERFORDERLICHE SECRETS:" -ForegroundColor Red
        Write-Host "-" * 30 -ForegroundColor Red
        
        foreach ($key in $requiredSecrets) {
            if ($secrets.ContainsKey($key)) {
                $value = $secrets[$key]
                
                # SSH Key speziell behandeln
                if ($key -eq "SSH_PRIVATE_KEY") {
                    Write-Host ""
                    Write-Host "Name: $key" -ForegroundColor Yellow
                    Write-Host "Value: [SSH Private Key Content - siehe unten]" -ForegroundColor White
                    Write-Host ""
                    Write-Host "SSH PRIVATE KEY CONTENT:" -ForegroundColor Magenta
                    Write-Host $value -ForegroundColor White
                    Write-Host ""
                    Write-Host "-" * 50 -ForegroundColor Gray
                }
                # Passwörter und sensible Daten
                elseif ($key -match "(PASS|TOKEN|SECRET|KEY)" -and $key -ne "SSH_PRIVATE_KEY") {
                    Write-Host ""
                    Write-Host "Name: $key" -ForegroundColor Yellow
                    Write-Host "Value: $value" -ForegroundColor White
                    Write-Host ""
                }
                # Normale Konfiguration
                else {
                    Write-Host ""
                    Write-Host "Name: $key" -ForegroundColor Yellow  
                    Write-Host "Value: $value" -ForegroundColor White
                    Write-Host ""
                }
            } else {
                Write-Host ""
                Write-Host "❌ FEHLT: $key" -ForegroundColor Red
                Write-Host "   Muss manuell generiert/konfiguriert werden" -ForegroundColor Yellow
                Write-Host ""
            }
        }
        
        if (-not $OnlyRequired) {
            Write-Host "🔹 OPTIONALE SECRETS:" -ForegroundColor Blue
            Write-Host "-" * 30 -ForegroundColor Blue
            
            foreach ($key in $optionalSecrets) {
                if ($secrets.ContainsKey($key)) {
                    Write-Host ""
                    Write-Host "Name: $key" -ForegroundColor Yellow
                    Write-Host "Value: $($secrets[$key])" -ForegroundColor White
                    Write-Host ""
                }
            }
        }
        
        Write-Host ""
        Write-Host "🚀 NACH DEM SETUP:" -ForegroundColor Green
        Write-Host "   1. Teste GitHub Actions mit: ./scripts/test-github-secrets.ps1" -ForegroundColor White
        Write-Host "   2. Validiere Secrets mit: ./scripts/setup-github-secrets.ps1 -ValidateSecrets" -ForegroundColor White
        Write-Host "   3. .env bleibt lokal für Development" -ForegroundColor White
        Write-Host ""
        
        Write-Host "⚠️  WICHTIG:" -ForegroundColor Red
        Write-Host "   Diese Secrets werden NIEMALS ins Repository committed!" -ForegroundColor Yellow
        Write-Host "   .env ist bereits in .gitignore ausgeschlossen" -ForegroundColor Yellow
    }
}

# Validierung
if ($ValidateFormat) {
    Write-Host ""
    Write-Host "🔍 VALIDIERUNG:" -ForegroundColor Cyan
    
    $missingRequired = $requiredSecrets | Where-Object { -not $secrets.ContainsKey($_) }
    
    if ($missingRequired.Count -gt 0) {
        Write-Host "❌ Fehlende erforderliche Secrets:" -ForegroundColor Red
        $missingRequired | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
    } else {
        Write-Host "✅ Alle erforderlichen Secrets vorhanden" -ForegroundColor Green
    }
    
    # SSH Key Validierung
    if ($secrets.ContainsKey("SSH_PRIVATE_KEY")) {
        $sshKey = $secrets["SSH_PRIVATE_KEY"]
        if ($sshKey -match "-----BEGIN.*PRIVATE KEY-----" -and $sshKey -match "-----END.*PRIVATE KEY-----") {
            Write-Host "✅ SSH Private Key Format korrekt" -ForegroundColor Green
        } else {
            Write-Host "❌ SSH Private Key Format ungültig" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "📊 ZUSAMMENFASSUNG:" -ForegroundColor Blue
    Write-Host "   Gefundene Secrets: $($secrets.Count)" -ForegroundColor White
    Write-Host "   Erforderliche: $($requiredSecrets.Count - $missingRequired.Count)/$($requiredSecrets.Count)" -ForegroundColor White
    Write-Host "   Optionale: $(($optionalSecrets | Where-Object { $secrets.ContainsKey($_) }).Count)/$($optionalSecrets.Count)" -ForegroundColor White
}

Write-Host ""
Write-Host "🔐 Secrets erfolgreich extrahiert und bereit für GitHub Setup!" -ForegroundColor Green
