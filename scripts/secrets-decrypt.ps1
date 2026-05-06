<#
.SYNOPSIS
  Entschlüsselt config/.env.enc nach config/.env mit sops (dotenv output type)

.NOTES
  Erfordert: sops
  Hinweis: Privater age Schlüssel via $env:SOPS_AGE_KEY_FILE oder $env:SOPS_AGE_KEY bereitstellen.
#>

$ErrorActionPreference = 'Stop'

$envPath = "config/.env"
$encPath = "config/.env.enc"

if (!(Test-Path $encPath)) { throw ".env.enc nicht gefunden: $encPath" }

Write-Host "[SOPS] Decrypting $encPath -> $envPath"
& sops --input-type dotenv --decrypt $encPath | Out-File -FilePath $envPath -Encoding utf8 -NoNewline
Write-Host "[OK] $envPath erstellt/aktualisiert" -ForegroundColor Green

