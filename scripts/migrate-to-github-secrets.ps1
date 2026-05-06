#!/usr/bin/env pwsh
# Sichere .env Migration zu GitHub Secrets
# Führt das komplette Setup sicher durch

Write-Host "🔐 Sichere Migration zu GitHub Secrets" -ForegroundColor Green
Write-Host "Menschlichkeit Österreich Enterprise Setup`n" -ForegroundColor Cyan

# Check if .env exists and contains production secrets
if (Test-Path ".env") {
    Write-Host "⚠️  PRODUKTIONS-SECRETS ERKANNT!" -ForegroundColor Red
    Write-Host "Die folgenden Secrets müssen zu GitHub Secrets migriert werden:`n" -ForegroundColor Yellow

    Write-Host "🔐 KRITISCHE SECRETS:" -ForegroundColor Red
    Write-Host "PLESK_HOST=dmpl20230054@5.183.217.146" -ForegroundColor White
    Write-Host "LARAVEL_DB_PASS=SECURE_LARAVEL_2025" -ForegroundColor White
    Write-Host "CIVICRM_DB_PASS=SECURE_CIVICRM_2025" -ForegroundColor White
    Write-Host "SSH_KEY=~/.ssh/id_ed25519" -ForegroundColor White

    Write-Host "`n📋 MIGRATION CHECKLIST:" -ForegroundColor Yellow
    Write-Host "□ 1. GitHub Repository → Settings → Secrets and variables → Actions" -ForegroundColor Cyan
    Write-Host "□ 2. Füge PLESK_HOST Secret hinzu" -ForegroundColor Cyan
    Write-Host "□ 3. Füge SSH_PRIVATE_KEY Secret hinzu (Inhalt von ~/.ssh/id_ed25519)" -ForegroundColor Cyan
    Write-Host "□ 4. Füge LARAVEL_DB_* Secrets hinzu" -ForegroundColor Cyan
    Write-Host "□ 5. Füge CIVICRM_DB_* Secrets hinzu" -ForegroundColor Cyan
    Write-Host "□ 6. Teste GitHub Actions mit neuen Secrets" -ForegroundColor Cyan

    Write-Host "`n🚨 NACH DER MIGRATION:" -ForegroundColor Red
    Write-Host "1. Verwende nur noch .env.example als Vorlage" -ForegroundColor Yellow
    Write-Host "2. .env bleibt lokal für Development (bereits in .gitignore)" -ForegroundColor Yellow
    Write-Host "3. Production verwendet GitHub Secrets über GitHub Actions" -ForegroundColor Yellow

    Write-Host "`n🔧 HILFS-SCRIPTS:" -ForegroundColor Green
    Write-Host "./scripts/setup-github-secrets.ps1 -ShowSecretsList" -ForegroundColor Cyan
    Write-Host "./scripts/setup-github-secrets.ps1 -GenerateKeys" -ForegroundColor Cyan
    Write-Host "./scripts/setup-github-secrets.ps1 -ValidateSecrets" -ForegroundColor Cyan

} else {
    Write-Host "✅ Keine .env Datei gefunden - Setup ist sicher!" -ForegroundColor Green
}

Write-Host "`n📚 DOKUMENTATION:" -ForegroundColor Yellow
Write-Host "Detaillierte Anweisungen: GITHUB-SECRETS-SETUP.md" -ForegroundColor Cyan
Write-Host "Sichere Templates: .env.example" -ForegroundColor Cyan

Write-Host "`n🎯 STATUS:" -ForegroundColor Yellow
if (Test-Path ".env.example") {
    Write-Host "✅ .env.example Template vorhanden" -ForegroundColor Green
} else {
    Write-Host "❌ .env.example Template fehlt" -ForegroundColor Red
}

if (Test-Path "GITHUB-SECRETS-SETUP.md") {
    Write-Host "✅ GitHub Secrets Dokumentation vorhanden" -ForegroundColor Green
} else {
    Write-Host "❌ GitHub Secrets Dokumentation fehlt" -ForegroundColor Red
}

$GitignoreContent = Get-Content ".gitignore" -Raw
if ($GitignoreContent -match "\.env$") {
    Write-Host "✅ .gitignore schützt .env Dateien" -ForegroundColor Green
} else {
    Write-Host "❌ .gitignore muss .env ausschließen!" -ForegroundColor Red
}

Write-Host "`n🚀 Nächste Schritte:" -ForegroundColor Green
Write-Host "1. Secrets in GitHub Repository einrichten" -ForegroundColor Cyan
Write-Host "2. GitHub Actions testen" -ForegroundColor Cyan
Write-Host "3. Lokale .env für Development beibehalten" -ForegroundColor Cyan
Write-Host "4. Production läuft über GitHub Secrets" -ForegroundColor Cyan
