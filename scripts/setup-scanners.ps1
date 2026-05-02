#!/usr/bin/env pwsh
# Install security scanner CLIs for local development
Write-Host "Installing security scanners..." -ForegroundColor Cyan
winget install AquaSecurity.Trivy --silent --accept-package-agreements
winget install Gitleaks.Gitleaks --silent --accept-package-agreements
if (Test-Path ".venv\Scripts\pip.exe") {
    .\.venv\Scripts\pip install "bandit>=1.7.0"
}
else {
    pip install "bandit>=1.7.0"
}
Write-Host "Scanner setup complete." -ForegroundColor Green
Write-Host "Run 'npm run security:bandit' to verify Bandit installation." -ForegroundColor Yellow
