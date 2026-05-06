<#
.SYNOPSIS
  Decrypts `secrets/production/api-keys.yaml` with sops (if available), extracts OpenAI key, and runs a connectivity test against OpenAI models endpoint.

USAGE
  pwsh .\scripts\openai-test.ps1

NOTES
  - Requires `sops` in PATH and a valid age private key available via $env:SOPS_AGE_KEY or $env:SOPS_AGE_KEY_FILE.
  - Does not write secrets to disk in plaintext; uses in-memory objects.
#>

$ErrorActionPreference = 'Stop'

function Get-OpenAIKeyFromSops {
    param([string]$secretPath = 'secrets/production/api-keys.yaml')
    if (!(Test-Path $secretPath)) { throw "Secrets file not found: $secretPath" }
    $sopsCmd = Get-Command sops -ErrorAction SilentlyContinue
    if (-not $sopsCmd) { throw "sops not installed or not in PATH" }
    Write-Host "Decrypting $secretPath with sops..."
    $yaml = & sops --decrypt $secretPath 2>&1
    if ($LASTEXITCODE -ne 0) { throw "sops decrypt failed: $yaml" }
    $obj = $yaml | ConvertFrom-Yaml
    return $obj.openai.api_key
}

try {
  if ($env:OPENAI_API_KEY) {
    Write-Host "Using OPENAI_API_KEY from environment (no decrypt needed)"
    $key = $env:OPENAI_API_KEY
  }
  else {
    $key = Get-OpenAIKeyFromSops
  }
    if (-not $key) { throw "OpenAI key not present in decrypted secrets" }
    Write-Host "OPENAI key extracted (preview): " + $key.Substring(0,[Math]::Min(10,$key.Length)) + "..."
    $env:OPENAI_API_KEY = $key
    Write-Host "Running OpenAI connectivity test..."
    $headers = @{ Authorization = "Bearer $($env:OPENAI_API_KEY)" }
    $resp = Invoke-RestMethod -Uri "https://api.openai.com/v1/models" -Headers $headers -Method GET -ErrorAction Stop
    Write-Host "OpenAI connectivity test successful. Models returned: " ($resp.data | ForEach-Object { $_.id }) -ForegroundColor Green
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 2
}
