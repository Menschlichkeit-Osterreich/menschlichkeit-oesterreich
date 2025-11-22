#!/usr/bin/env pwsh
# SSH Key zu GitHub Secrets Transfer Helper
# Bereitet SSH-Keys für GitHub Secrets vor

Write-Host "🔐 SSH Key zu GitHub Secrets Transfer" -ForegroundColor Green
Write-Host "Repository: menschlichkeit-oesterreich-development`n" -ForegroundColor Cyan

# SSH Key Dateien prüfen
$PrivateKeyPath = ".ssh/id_ed25519"
$PublicKeyPath = ".ssh/id_ed25519.pub"

if (-not (Test-Path $PrivateKeyPath)) {
    Write-Host "❌ Private SSH Key nicht gefunden: $PrivateKeyPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $PublicKeyPath)) {
    Write-Host "❌ Public SSH Key nicht gefunden: $PublicKeyPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SSH Keys gefunden!" -ForegroundColor Green

# Private Key Inhalt anzeigen (für GitHub Secrets)
Write-Host "`n🔑 PRIVATE KEY für GitHub Secret SSH_PRIVATE_KEY:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
$PrivateKeyContent = Get-Content $PrivateKeyPath -Raw
Write-Host $PrivateKeyContent -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

# Public Key anzeigen (zur Information)
Write-Host "`n🔓 PUBLIC KEY (zur Information):" -ForegroundColor Yellow
$PublicKeyContent = Get-Content $PublicKeyPath -Raw
Write-Host $PublicKeyContent.Trim() -ForegroundColor Gray

# Anweisungen für GitHub Secrets
Write-Host "`n📋 GITHUB SECRETS SETUP:" -ForegroundColor Yellow
Write-Host "1. Gehe zu: https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/settings/secrets/actions" -ForegroundColor Cyan
Write-Host "2. Klicke 'New repository secret'" -ForegroundColor Cyan
Write-Host "3. Name: SSH_PRIVATE_KEY" -ForegroundColor Cyan
Write-Host "4. Value: Kopiere den PRIVATE KEY Inhalt oben (inkl. -----BEGIN/END-----)" -ForegroundColor Cyan

Write-Host "`n🎯 WEITERE BENÖTIGTE SECRETS:" -ForegroundColor Yellow
Write-Host "PLESK_HOST=dmpl20230054@5.183.217.146" -ForegroundColor White
Write-Host "LARAVEL_DB_USER=laravel_user" -ForegroundColor White
Write-Host "LARAVEL_DB_PASS=SECURE_LARAVEL_2025" -ForegroundColor White
Write-Host "LARAVEL_DB_NAME=mo_laravel_api" -ForegroundColor White
Write-Host "CIVICRM_DB_USER=civicrm_user" -ForegroundColor White
Write-Host "CIVICRM_DB_PASS=SECURE_CIVICRM_2025" -ForegroundColor White
Write-Host "CIVICRM_DB_NAME=mo_civicrm_data" -ForegroundColor White

Write-Host "`n⚠️  SICHERHEITSHINWEIS:" -ForegroundColor Red
Write-Host "Der SSH Key wird NICHT in das Repository committed!" -ForegroundColor Yellow
Write-Host "Er wird nur über GitHub Secrets für Codespaces verfügbar gemacht." -ForegroundColor Yellow

Write-Host "`n✅ NACH DER EINRICHTUNG:" -ForegroundColor Green
Write-Host "GitHub Codespaces können dann auf Plesk Server zugreifen" -ForegroundColor Cyan
Write-Host "Deployment-Scripts funktionieren automatisch" -ForegroundColor Cyan

# SSH Key aus Git entfernen (falls versehentlich hinzugefügt)
try {
    $gitCheck = git ls-files --error-unmatch .ssh/id_ed25519 2>$null
    if ($gitCheck) {
        Write-Host "`n🚨 SSH Key ist im Git Index! Entferne ihn..." -ForegroundColor Red
        git rm --cached .ssh/id_ed25519
        Write-Host "✅ SSH Key aus Git Index entfernt" -ForegroundColor Green
    }
} catch {
    # SSH Key ist nicht im Index - das ist gut!
}

Write-Host "`n🔧 AUTOMATISCHE INTEGRATION:" -ForegroundColor Yellow
Write-Host "Nach GitHub Secrets Setup funktionieren diese Scripts automatisch:" -ForegroundColor Cyan
Write-Host "  ./scripts/safe-deploy.sh --dry-run" -ForegroundColor White
Write-Host "  ./deployment-scripts/deploy-api-plesk.sh" -ForegroundColor White
Write-Host "  ./deployment-scripts/deploy-crm-plesk.sh" -ForegroundColor White

Write-Host "`n🚀 Bereit für Git Commit und Push!" -ForegroundColor Green
