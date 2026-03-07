<#
.SYNOPSIS
    Uninstalls the OpenClaw Windows Bridge.
.DESCRIPTION
    This script stops and removes the WSL2 proxy service, deletes the firewall rule,
    and removes the installation directory C:\openclawd-win-bridge.
.EXAMPLE
    ./Uninstall-OpenClawBridge.ps1
#>

param()

$ErrorActionPreference = "SilentlyContinue"

Write-Host "Stopping and removing OpenClaw Bridge service..." -ForegroundColor Yellow

# Stop and delete the background service (created with nssm.exe)
nssm.exe stop OpenClawBridge
nssm.exe remove OpenClawBridge confirm

Write-Host "Removing firewall rule..." -ForegroundColor Yellow
Remove-NetFirewallRule -DisplayName "OpenClaw WSL2 Bridge"

Write-Host "Removing installation directory C:\openclawd-win-bridge..." -ForegroundColor Yellow
Remove-Item -Path "C:\openclawd-win-bridge" -Recurse -Force

Write-Host "
Uninstallation complete." -ForegroundColor Green
Write-Host "You may need to manually remove nssm.exe from your system if you placed it in a system path."
