# 🔧 PLESK-KONFIGURATION MONITORING & DEPLOYMENT SCRIPT
# Basierend auf der vollständigen PHP-Konfiguration von digimagical.com

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("monitor", "deploy", "validate", "sync", "all")]
    [string]$Action = "monitor",
    
    [Parameter(Mandatory=$false)]
    [string]$Domain = "all"
)

# =============================================================================
# 📋 PLESK DOMAIN CONFIGURATION (von digimagical.com)
# =============================================================================

$PleskConfig = @{
    Domains = @(
        @{
            Name = "menschlichkeit-oesterreich.at"
            Type = "main"
            DocRoot = "/var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs"
            LocalSource = "frontend/dist"
            System = "Next.js Frontend"
            Database = $null
        },
        @{
            Name = "api.menschlichkeit-oesterreich.at"
            Type = "subdomain"
            DocRoot = "/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/api/httpdocs"
            LocalSource = "api.menschlichkeit-oesterreich.at"
            System = "FastAPI Backend"
            Database = "mo_laravel_api"
            DbUser = "laravel_user"
        },
        @{
            Name = "crm.menschlichkeit-oesterreich.at"
            Type = "subdomain"
            DocRoot = "/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/crm/httpdocs"
            LocalSource = "crm.menschlichkeit-oesterreich.at"
            System = "CiviCRM + Drupal"
            Database = "mo_civicrm_data"
            DbUser = "civicrm_user"
        },
        @{
            Name = "games.menschlichkeit-oesterreich.at"
            Type = "subdomain"  
            DocRoot = "/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/games/httpdocs"
            LocalSource = "web"
            System = "Web Games + Prisma"
            Database = "mo_gaming_platform"
            DbUser = "gaming_user"
        }
    )
    PHP = @{
        Version = "8.3.25"
        Mode = "FPM-Apache"
        MemoryLimit = "512M"
        MaxExecutionTime = 30
        UploadMaxFilesize = "2M"
        PostMaxSize = "8M"
        IncludePath = ".:/opt/plesk/php/8.3/share/pear"
        SessionSavePath = "/var/lib/php/sessions"
        OpenBasedir = "{WEBSPACEROOT}{/}{:}{TMP}{/}"
    }
    FPM = @{
        PM = "ondemand"
        MaxChildren = 10
        StartServers = 1
        MinSpareServers = 1
        MaxSpareServers = 1
        MaxRequests = 0
    }
}

# =============================================================================
# 🚀 FUNCTIONS
# =============================================================================

function Write-Header {
    param([string]$Title)
    Write-Host "`n" -NoNewline
    Write-Host "=" * 80 -ForegroundColor Cyan
    Write-Host "🔧 $Title" -ForegroundColor Yellow
    Write-Host "=" * 80 -ForegroundColor Cyan
}

function Test-LocalFiles {
    param([hashtable]$DomainConfig)
    
    $LocalPath = Join-Path $PSScriptRoot ".." $DomainConfig.LocalSource
    $Exists = Test-Path $LocalPath
    
    if ($Exists) {
        $FileCount = (Get-ChildItem $LocalPath -Recurse -File | Measure-Object).Count
        Write-Host "✅ $($DomainConfig.Name): $FileCount Dateien in $($DomainConfig.LocalSource)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($DomainConfig.Name): Lokaler Ordner $($DomainConfig.LocalSource) nicht gefunden!" -ForegroundColor Red
    }
    
    return $Exists
}

function Test-DatabaseConfig {
    param([hashtable]$DomainConfig)
    
    if (-not $DomainConfig.Database) {
        Write-Host "ℹ️  $($DomainConfig.Name): Keine Datenbank erforderlich" -ForegroundColor Gray
        return $true
    }
    
    # Check for .env or config files
    $LocalPath = Join-Path $PSScriptRoot ".." $DomainConfig.LocalSource
    $EnvFile = Join-Path $LocalPath ".env"
    $ConfigExists = Test-Path $EnvFile
    
    if ($ConfigExists) {
        $EnvContent = Get-Content $EnvFile -Raw
        $HasDbConfig = $EnvContent -match "DB_DATABASE.*$($DomainConfig.Database)"
        
        if ($HasDbConfig) {
            Write-Host "✅ $($DomainConfig.Name): Datenbankkonfiguration gefunden" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $($DomainConfig.Name): .env existiert, aber DB-Config fehlt" -ForegroundColor Yellow
        }
        
        return $HasDbConfig
    } else {
        Write-Host "❌ $($DomainConfig.Name): .env Datei fehlt für DB $($DomainConfig.Database)" -ForegroundColor Red
        return $false
    }
}

function Show-PHPConfiguration {
    Write-Header "PHP-KONFIGURATION @ digimagical.com"
    
    Write-Host "🐘 PHP Version: $($PleskConfig.PHP.Version)" -ForegroundColor Green
    Write-Host "⚡ Modus: $($PleskConfig.PHP.Mode)" -ForegroundColor Green
    Write-Host "💾 Memory Limit: $($PleskConfig.PHP.MemoryLimit)" -ForegroundColor Green
    Write-Host "⏱️  Max Execution: $($PleskConfig.PHP.MaxExecutionTime)s" -ForegroundColor Green
    Write-Host "📤 Upload Max: $($PleskConfig.PHP.UploadMaxFilesize)" -ForegroundColor Green
    Write-Host "📬 Post Max: $($PleskConfig.PHP.PostMaxSize)" -ForegroundColor Green
    
    Write-Host "`n🔧 FPM-Konfiguration:" -ForegroundColor Cyan
    Write-Host "   PM: $($PleskConfig.FPM.PM)" -ForegroundColor Gray
    Write-Host "   Max Children: $($PleskConfig.FPM.MaxChildren)" -ForegroundColor Gray
    Write-Host "   Start Servers: $($PleskConfig.FPM.StartServers)" -ForegroundColor Gray
}

function Show-DomainOverview {
    Write-Header "DOMAIN-ÜBERSICHT"
    
    foreach ($Domain in $PleskConfig.Domains) {
        Write-Host "`n🌐 $($Domain.Name)" -ForegroundColor Yellow
        Write-Host "   📂 DocRoot: $($Domain.DocRoot)" -ForegroundColor Gray
        Write-Host "   📁 Lokal: $($Domain.LocalSource)" -ForegroundColor Gray
        Write-Host "   🔧 System: $($Domain.System)" -ForegroundColor Gray
        
        if ($Domain.Database) {
            Write-Host "   💾 DB: $($Domain.Database) (User: $($Domain.DbUser))" -ForegroundColor Gray
        } else {
            Write-Host "   💾 DB: Keine" -ForegroundColor Gray
        }
    }
}

function Test-AllConfiguration {
    Write-Header "KONFIGURATION VALIDIERUNG"
    
    $AllGood = $true
    
    foreach ($Domain in $PleskConfig.Domains) {
        Write-Host "`n🔍 Teste $($Domain.Name)..." -ForegroundColor Cyan
        
        $LocalOK = Test-LocalFiles $Domain
        $DbOK = Test-DatabaseConfig $Domain
        
        if (-not $LocalOK -or -not $DbOK) {
            $AllGood = $false
        }
    }
    
    if ($AllGood) {
        Write-Host "`n🎉 ALLE KONFIGURATIONEN SIND BEREIT!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  EINIGE KONFIGURATIONEN BENÖTIGEN AUFMERKSAMKEIT" -ForegroundColor Yellow
    }
    
    return $AllGood
}

function Generate-SFTPConfig {
    Write-Header "SFTP-KONFIGURATION GENERIEREN"
    
    $SftpConfig = @{
        host = "digimagical.com"
        username = "PLESK_USERNAME"
        protocol = "sftp"
        port = 22
        remotePath = "/var/www/vhosts/menschlichkeit-oesterreich.at"
        uploadOnSave = $false
        ignore = @(".git", "node_modules", ".env.local", "*.log")
        watcher = @{
            files = "**/*"
            autoUpload = $false
            autoDelete = $false
        }
    }
    
    $ConfigPath = Join-Path $PSScriptRoot ".." ".vscode" "sftp.json"
    $ConfigDir = Split-Path $ConfigPath -Parent
    
    if (-not (Test-Path $ConfigDir)) {
        New-Item -ItemType Directory $ConfigDir -Force | Out-Null
    }
    
    $SftpConfig | ConvertTo-Json -Depth 3 | Set-Content $ConfigPath -Encoding UTF8
    
    Write-Host "✅ SFTP-Konfiguration erstellt: .vscode/sftp.json" -ForegroundColor Green
    Write-Host "⚠️  BITTE PLESK_USERNAME durch echten Benutzernamen ersetzen!" -ForegroundColor Yellow
}

function Show-DeploymentMapping {
    Write-Header "DEPLOYMENT-MAPPING"
    
    Write-Host "📤 UPLOAD-ZUORDNUNG:" -ForegroundColor Cyan
    Write-Host "Lokal → Plesk Remote" -ForegroundColor Gray
    Write-Host ("-" * 50) -ForegroundColor Gray
    
    foreach ($Domain in $PleskConfig.Domains) {
        $LocalPath = $Domain.LocalSource
        $RemotePath = $Domain.DocRoot
        Write-Host "$LocalPath → $RemotePath" -ForegroundColor White
    }
    
    Write-Host "`n🔧 KONFIGURATIONSDATEIEN:" -ForegroundColor Cyan
    Write-Host "config-templates/laravel-env-production.env → /subdomains/api/httpdocs/.env"
    Write-Host "config-templates/civicrm-settings.php → /subdomains/crm/httpdocs/sites/default/"
    Write-Host "[Gaming .env zu erstellen] → /subdomains/games/httpdocs/.env"
}

# =============================================================================
# 🎯 MAIN EXECUTION
# =============================================================================

switch ($Action) {
    "monitor" {
        Show-PHPConfiguration
        Show-DomainOverview
        Test-AllConfiguration
    }
    
    "validate" {
        Test-AllConfiguration
    }
    
    "deploy" {
        Show-DeploymentMapping
        Generate-SFTPConfig
    }
    
    "sync" {
        Write-Host "🚀 SYNC-FUNKTIONALITÄT (wird implementiert)" -ForegroundColor Yellow
        Write-Host "   - SSH-Verbindung testen"
        Write-Host "   - Dateien synchronisieren"
        Write-Host "   - Datenbankverbindungen prüfen"
    }
    
    "all" {
        Show-PHPConfiguration
        Show-DomainOverview
        Test-AllConfiguration
        Show-DeploymentMapping
        Generate-SFTPConfig
    }
}

Write-Host "`n✅ Plesk-Monitoring abgeschlossen!" -ForegroundColor Green
Write-Host "📋 Verwendung: .\plesk-config-manager.ps1 [monitor|validate|deploy|sync|all]" -ForegroundColor Gray