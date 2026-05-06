<#
.SYNOPSIS
  Überträgt eine .env-Datei per SCP/SSH auf den Server.

.USAGE
  ./scripts/ssh-env-sync.ps1 -LocalEnvPath config/.env -RemoteHost host -RemoteUser user -RemotePath /var/www/vhosts/site/private/.env

.NOTES
  Erfordert: OpenSSH-Client (scp)
#>

param(
  [Parameter(Mandatory=$true)][string]$LocalEnvPath,
  [Parameter(Mandatory=$true)][string]$RemoteHost,
  [Parameter(Mandatory=$true)][string]$RemoteUser,
  [int]$RemotePort = 22,
  [Parameter(Mandatory=$true)][string]$RemotePath
)

$ErrorActionPreference = 'Stop'

if (!(Test-Path $LocalEnvPath)) { throw "Local env file not found: $LocalEnvPath" }

Write-Host "[SCP] $LocalEnvPath -> $RemoteUser@$RemoteHost:$RemotePath"
& scp -P $RemotePort $LocalEnvPath "$RemoteUser@$RemoteHost:$RemotePath"
Write-Host "[OK] .env übertragen" -ForegroundColor Green

