# Setup MCP Environment Variables for Current Session
# This script sources the environment variables needed for MCP server startup

Write-Host "=== MCP Environment Setup ===" -ForegroundColor Cyan

# Set environment variables in current session (for testing)
$env:DATABASE_URL = "sqlite:////home/node/.n8n/database.sqlite"
$env:N8N_API_URL = "http://localhost:5678"

# Try to get N8N_API_KEY from Windows User scope
try {
    $apiKey = [System.Environment]::GetEnvironmentVariable("N8N_API_KEY", "User")
    if ($apiKey) {
        $env:N8N_API_KEY = $apiKey
        Write-Host "✓ N8N_API_KEY sourced from Windows User scope" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ N8N_API_KEY not found in Windows User scope" -ForegroundColor Yellow
        Write-Host "  (It may need to be set via Windows Environment Variables)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "✗ Error reading N8N_API_KEY from User scope: $_" -ForegroundColor Red
}

# Verify all variables are set
Write-Host "`nEnvironment Variables Status:" -ForegroundColor Cyan
Write-Host "DATABASE_URL: $(if($env:DATABASE_URL) { '✓ SET' } else { '✗ NOT SET' })"
Write-Host "N8N_API_URL: $(if($env:N8N_API_URL) { '✓ SET' } else { '✗ NOT SET' })"
Write-Host "N8N_API_KEY: $(if($env:N8N_API_KEY) { '✓ SET' } else { '✗ NOT SET' })"

Write-Host "`nValues:" -ForegroundColor Cyan
Write-Host "DATABASE_URL = $env:DATABASE_URL"
Write-Host "N8N_API_URL = $env:N8N_API_URL"
if ($env:N8N_API_KEY) {
    Write-Host "N8N_API_KEY = [REDACTED]"
}
else {
    Write-Host "N8N_API_KEY = [NOT SET - CHECK WINDOWS USER ENVIRONMENT]"
}

Write-Host "`n=== Ready for MCP Server Startup ===" -ForegroundColor Green
