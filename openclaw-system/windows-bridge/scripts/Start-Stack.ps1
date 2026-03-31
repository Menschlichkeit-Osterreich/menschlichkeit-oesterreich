<#
.SYNOPSIS
    Startet den OpenClaw-Stack ueber WSL2 fuer die lokale Windows-Bridge.
.DESCRIPTION
    Das Skript ermittelt das aktuelle Repository-Root, wandelt den Windows-Pfad
    in einen WSL-Pfad um und startet danach `openclaw-system/scripts/boot.sh`
    in der gewaehlten Distribution.
.EXAMPLE
    ./Start-Stack.ps1
    ./Start-Stack.ps1 -WslDistro Ubuntu
#>

param(
    [string]$WslDistro = $(if ($env:OPENCLAW_WSL_DISTRO) { $env:OPENCLAW_WSL_DISTRO } else { "Ubuntu" })
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path -Path (Join-Path $ScriptDir "..\..\..")).Path

Write-Host "Ermittle WSL-Pfad fuer $ProjectRoot ..." -ForegroundColor Cyan
$WslProjectRoot = (& wsl.exe -d $WslDistro -- wslpath -a $ProjectRoot).Trim()

if (-not $WslProjectRoot) {
    throw "WSL-Pfad fuer '$ProjectRoot' konnte nicht ermittelt werden."
}

$BootCommand = "set -euo pipefail; cd '$WslProjectRoot'; bash openclaw-system/scripts/boot.sh"

Write-Host "Starte OpenClaw-Stack in WSL-Distro '$WslDistro' ..." -ForegroundColor Cyan
& wsl.exe -d $WslDistro -- bash -lc $BootCommand

if ($LASTEXITCODE -ne 0) {
    throw "OpenClaw-Stack konnte nicht gestartet werden."
}

Write-Host "OpenClaw-Stack wurde gestartet." -ForegroundColor Green
