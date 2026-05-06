param(
    [string]$Id,
    [switch]$List,
    [switch]$Tunnel
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$configFile = Join-Path (Resolve-Path (Join-Path $PSScriptRoot "..")) "config-templates\mcp-hosts.json"
if (-not (Test-Path $configFile)) {
    throw "Konfigurationsdatei $configFile wurde nicht gefunden."
}
$config = Get-Content $configFile -Raw | ConvertFrom-Json

if ($List) {
    Write-Host "Verfügbare MCP-Hosts:" -ForegroundColor Cyan
    $config.hosts | ForEach-Object { Write-Host (" - {0} ({1})" -f $_.id, $_.name) }
    return
}

function Resolve-Host {
    param([string]$identifier)

    if ($identifier) {
        $match = $config.hosts | Where-Object { $_.id -eq $identifier -or $_.name -eq $identifier }
        if ($match) { return $match }
        throw "Host '$identifier' ist in $configFile nicht definiert."
    }

    Write-Host "Bitte wähle ein Ziel:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $config.hosts.Count; $i++) {
        $item = $config.hosts[$i]
        Write-Host (" [{0}] {1} -> {2}:{3}" -f $i, $item.name, $item.host, $item.port)
    }
    $selection = Read-Host "Index"
    $parsed = 0
    if ([int]::TryParse($selection, [ref]$parsed) -and $parsed -ge 0 -and $parsed -lt $config.hosts.Count) {
        return $config.hosts[$parsed]
    }
    throw "Keine gültige Auswahl getroffen."
}

$hostConfig = Resolve-Host -identifier $Id
$user = if ($config.defaultUser) { $config.defaultUser } else { $env:USERNAME }
$key = $null
if ($config.sshKeyPath) {
    $expanded = [Environment]::ExpandEnvironmentVariables($config.sshKeyPath)
    $key = (Resolve-Path $expanded -ErrorAction SilentlyContinue)?.Path
}

$sshArgs = @()
if ($key) {
    $sshArgs += "-i"
    $sshArgs += $key
}
$sshArgs += "-p"
$sshArgs += $hostConfig.port

if ($Tunnel -and $hostConfig.localForwards) {
    foreach ($forward in $hostConfig.localForwards) {
        $sshArgs += "-L"
        $sshArgs += "${($forward.localPort)}:${($forward.remoteHost)}:${($forward.remotePort)}"
        Write-Host ("Tunnel ${0} -> {1}:{2} aktiv" -f $forward.localPort, $forward.remoteHost, $forward.remotePort) -ForegroundColor Green
    }
    $sshArgs += "-N"
}

$destination = "{0}@{1}" -f $user, $hostConfig.host

Write-Host ("Verbinde zu {0}..." -f $destination) -ForegroundColor Yellow

$sshBinary = Get-Command ssh -ErrorAction SilentlyContinue
if (-not $sshBinary) {
    throw "ssh wurde nicht gefunden. Installiere OpenSSH Client."
}

& $sshBinary.Source @sshArgs $destination
