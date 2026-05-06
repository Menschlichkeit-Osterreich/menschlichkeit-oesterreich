# 🚀 MANUAL DEPLOYMENT via SCP/PowerShell
# Alternative zu VS Code SFTP-Extension

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("api", "crm", "games", "all")]
    [string]$Target = "api"
)

$Server = "dmpl20230054@5.183.217.146"
$BasePath = "/home/dmpl20230054"

Write-Host "🚀 Deploying to Server: $Server" -ForegroundColor Green

switch ($Target) {
    "api" {
        Write-Host "📤 Uploading API Backend..." -ForegroundColor Cyan
        scp -r "api.menschlichkeit-oesterreich.at/*" "${Server}:${BasePath}/subdomains/api/httpdocs/"
    }
    
    "crm" {
        Write-Host "📤 Uploading CRM System..." -ForegroundColor Cyan
        scp -r "crm.menschlichkeit-oesterreich.at/*" "${Server}:${BasePath}/subdomains/crm/httpdocs/"
    }
    
    "games" {
        Write-Host "📤 Uploading Games Platform..." -ForegroundColor Cyan
        scp -r "web/*" "${Server}:${BasePath}/subdomains/games/httpdocs/"
    }
    
    "all" {
        Write-Host "📤 Uploading ALL systems..." -ForegroundColor Yellow
        scp -r "api.menschlichkeit-oesterreich.at/*" "${Server}:${BasePath}/subdomains/api/httpdocs/"
        scp -r "crm.menschlichkeit-oesterreich.at/*" "${Server}:${BasePath}/subdomains/crm/httpdocs/"
        scp -r "web/*" "${Server}:${BasePath}/subdomains/games/httpdocs/"
    }
}

Write-Host "✅ Deployment completed!" -ForegroundColor Green