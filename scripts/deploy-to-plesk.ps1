#!/usr/bin/env pwsh
# 🚀 PLESK SFTP DEPLOYMENT SCRIPT
# Synchronisiert lokale Dateien mit Plesk-Server und entfernt Altlasten

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("api", "crm", "games", "frontend", "all")]
    [string]$Target = "all",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force = $false
)

$Server = "dmpl20230054@5.183.217.146"
$ServerPath = "/home/dmpl20230054"

Write-Host "🚀 PLESK DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "Target: $Target | DryRun: $DryRun | Force: $Force" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray

function Deploy-API {
    Write-Host "📡 Deploying API Backend (FastAPI)..." -ForegroundColor Green
    
    if (-not $DryRun) {
        # Build requirements.txt if not exists
        if (Test-Path "api.menschlichkeit-oesterreich.at/requirements.txt") {
            Write-Host "  ✅ requirements.txt found"
        } else {
            Write-Host "  ⚠️  Creating requirements.txt..."
            Set-Content -Path "api.menschlichkeit-oesterreich.at/requirements.txt" -Value @"
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-dotenv==1.0.0
sqlalchemy==2.0.23
pymysql==1.1.0
cryptography==41.0.7
pydantic==2.5.0
pydantic-settings==2.1.0
"@
        }
        
        # Deploy API files
        scp -r "api.menschlichkeit-oesterreich.at/*" "${Server}:subdomains/api/httpdocs/"
        Write-Host "  ✅ API files deployed"
    } else {
        Write-Host "  🔍 [DRY RUN] Would deploy: api.menschlichkeit-oesterreich.at/* -> subdomains/api/httpdocs/"
    }
}

function Deploy-CRM {
    Write-Host "🏛️ Deploying CRM System (Drupal+CiviCRM)..." -ForegroundColor Green
    
    if (-not $DryRun) {
        # Deploy CRM source into the canonical CRM portal root
        scp -r "apps/crm/*" "${Server}:subdomains/crm/httpdocs/"
        
        # Deploy .env file
        if (Test-Path "apps/crm/.env") {
            scp "apps/crm/.env" "${Server}:subdomains/crm/httpdocs/"
        }
        
        Write-Host "  ✅ CRM files deployed"
    } else {
        Write-Host "  🔍 [DRY RUN] Would deploy: apps/crm/* -> subdomains/crm/httpdocs/"
    }
}

function Deploy-Games {
    Write-Host "🎮 Deploying Gaming Platform..." -ForegroundColor Green
    
    if (-not $DryRun) {
        # Deploy game files
        scp -r "web/*" "${Server}:subdomains/games/httpdocs/"
        Write-Host "  ✅ Games files deployed"
    } else {
        Write-Host "  🔍 [DRY RUN] Would deploy: web/* -> subdomains/games/httpdocs/"
    }
}

function Deploy-Frontend {
    Write-Host "🌐 Deploying Frontend (Next.js)..." -ForegroundColor Green
    
    if (-not $DryRun) {
        # Build frontend first
        Write-Host "  📦 Building Next.js application..."
        Set-Location "frontend"
        npm run build
        Set-Location ".."
        
        # Deploy built files
        if (Test-Path "frontend/out") {
            scp -r "frontend/out/*" "${Server}:httpdocs/"
            Write-Host "  ✅ Frontend deployed (Static Export)"
        } elseif (Test-Path "frontend/.next") {
            scp -r "frontend/.next/*" "${Server}:httpdocs/"
            Write-Host "  ✅ Frontend deployed (Server Build)"
        } else {
            Write-Host "  ❌ No build output found!"
        }
    } else {
        Write-Host "  🔍 [DRY RUN] Would build and deploy frontend to httpdocs/"
    }
}

function Set-Permissions {
    Write-Host "🔐 Setting correct permissions..." -ForegroundColor Cyan
    
    if (-not $DryRun) {
        ssh $Server @"
chmod -R 755 httpdocs/
chmod -R 755 subdomains/*/httpdocs/
find httpdocs/ -name "*.php" -exec chmod 644 {} \;
find subdomains/*/httpdocs/ -name "*.php" -exec chmod 644 {} \;
find httpdocs/ -name "*.html" -exec chmod 644 {} \;
find subdomains/*/httpdocs/ -name "*.html" -exec chmod 644 {} \;
"@
        Write-Host "  ✅ Permissions set correctly"
    } else {
        Write-Host "  🔍 [DRY RUN] Would set permissions on all deployed files"
    }
}

# Main deployment logic
switch ($Target) {
    "api" { Deploy-API }
    "crm" { Deploy-CRM }
    "games" { Deploy-Games }
    "frontend" { Deploy-Frontend }
    "all" {
        Deploy-API
        Deploy-CRM
        Deploy-Games
        Deploy-Frontend
        Set-Permissions
    }
}

Write-Host ""
Write-Host "✅ DEPLOYMENT COMPLETED!" -ForegroundColor Green
Write-Host "🌐 Check your sites:" -ForegroundColor Cyan
Write-Host "  • Main: https://menschlichkeit-oesterreich.at"
Write-Host "  • API:  https://api.menschlichkeit-oesterreich.at"
Write-Host "  • CRM:  https://crm.menschlichkeit-oesterreich.at"
Write-Host "  • Games: https://games.menschlichkeit-oesterreich.at"
