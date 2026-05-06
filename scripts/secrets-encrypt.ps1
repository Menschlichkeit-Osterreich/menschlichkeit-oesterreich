<#
.SYNOPSIS
  Verschlüsselt config/.env nach config/.env.enc mit sops (dotenv input type)

.NOTES
  Erfordert: sops
#>

$ErrorActionPreference = 'Stop'

$envPath = "config/.env"
$encPath = "config/.env.enc"

if (!(Test-Path $envPath)) { throw ".env nicht gefunden: $envPath" }

Write-Host "[SOPS] Encrypting $envPath -> $encPath"
& sops --input-type dotenv --encrypt $envPath | Out-File -FilePath $encPath -Encoding utf8 -NoNewline
Write-Host "[OK] $encPath aktualisiert" -ForegroundColor Green

