#!/usr/bin/env pwsh

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("api", "crm", "frontend", "all")]
    [string]$Target = "all",

    [Parameter(Mandatory = $false)]
    [switch]$DryRun = $false,

    [Parameter(Mandatory = $false)]
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

function Get-EnvValue {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $false)][string]$DefaultValue = ""
    )

    $value = [Environment]::GetEnvironmentVariable($Name)
    if ([string]::IsNullOrWhiteSpace($value)) {
        return $DefaultValue
    }

    return $value
}

function Resolve-RemoteHost {
    $hostValue = Get-EnvValue -Name "PLESK_HOST"
    $userValue = Get-EnvValue -Name "PLESK_USER"

    if ([string]::IsNullOrWhiteSpace($hostValue)) {
        throw "PLESK_HOST fehlt. Fuer produktive Deploys bleibt .github/workflows/deploy-plesk.yml die Source of Truth."
    }

    if ($hostValue -match "@") {
        return $hostValue
    }

    if ([string]::IsNullOrWhiteSpace($userValue)) {
        throw "PLESK_HOST enthaelt keinen Benutzer und PLESK_USER fehlt."
    }

    return "$userValue@$hostValue"
}

function Get-RemoteDisplay {
    $hostValue = Get-EnvValue -Name "PLESK_HOST"
    $userValue = Get-EnvValue -Name "PLESK_USER"

    if (-not [string]::IsNullOrWhiteSpace($hostValue) -and $hostValue -match "@") {
        return $hostValue
    }

    if (-not [string]::IsNullOrWhiteSpace($hostValue) -and -not [string]::IsNullOrWhiteSpace($userValue)) {
        return "$userValue@$hostValue"
    }

    if (-not [string]::IsNullOrWhiteSpace($hostValue)) {
        return $hostValue
    }

    if (-not [string]::IsNullOrWhiteSpace($userValue)) {
        return "$userValue@<PLESK_HOST>"
    }

    return "<PLESK_USER>@<PLESK_HOST>"
}

function Get-TargetSpec {
    param([Parameter(Mandatory = $true)][string]$Name)

    $frontendDist = Join-Path $RepoRoot "apps/website/dist"
    $frontendProject = Join-Path $RepoRoot "apps/website"

    $specs = @{
        "frontend" = @{
            Description = "Website / CRM Portal Build"
            LocalPath = $frontendDist
            RemotePath = (Get-EnvValue -Name "PLESK_FRONTEND_PATH" -DefaultValue "httpdocs")
            Prepare = {
                Push-Location $frontendProject
                try {
                    npm run build:prerender
                } finally {
                    Pop-Location
                }
            }
        }
        "api" = @{
            Description = "FastAPI Source Tree"
            LocalPath = (Join-Path $RepoRoot "apps/api")
            RemotePath = (Get-EnvValue -Name "PLESK_API_PATH" -DefaultValue "subdomains/api/httpdocs")
        }
        "crm" = @{
            Description = "Drupal / CiviCRM Source Tree"
            LocalPath = (Join-Path $RepoRoot "apps/crm")
            RemotePath = (Get-EnvValue -Name "PLESK_CRM_PATH" -DefaultValue "subdomains/crm/httpdocs")
        }
    }

    return $specs[$Name]
}

function Ensure-LocalSource {
    param([Parameter(Mandatory = $true)][hashtable]$Spec)

    if (Test-Path $Spec.LocalPath) {
        return
    }

    if ($Spec.ContainsKey("Prepare")) {
        Write-Host "  -> Baue fehlende Artefakte lokal..." -ForegroundColor Yellow
        & $Spec.Prepare
    }

    if (-not (Test-Path $Spec.LocalPath)) {
        throw "Lokaler Pfad fehlt weiterhin: $($Spec.LocalPath)"
    }
}

function Invoke-TargetDeploy {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$RemoteHost,
        [Parameter(Mandatory = $true)][string]$Port
    )

    $spec = Get-TargetSpec -Name $Name
    Write-Host "==> $Name : $($spec.Description)" -ForegroundColor Cyan
    Write-Host "    Lokal : $($spec.LocalPath)"
    Write-Host "    Remote: ${RemoteHost}:$($spec.RemotePath)"

    if ($DryRun) {
        if (-not (Test-Path $spec.LocalPath) -and $spec.ContainsKey("Prepare")) {
            Write-Host "    Dry-Run: Build-Artefakt fehlt noch und wuerde vor echtem Fallback-Deploy gebaut." -ForegroundColor Yellow
        }
        return
    }

    if (-not $Force) {
        throw "Echter manueller Deploy nur mit -Force. Kanonischer Produktionsweg bleibt .github/workflows/deploy-plesk.yml."
    }

    Ensure-LocalSource -Spec $spec

    ssh -p $Port $RemoteHost "mkdir -p '$($spec.RemotePath)'"
    scp -P $Port -r "$($spec.LocalPath)/*" "${RemoteHost}:$($spec.RemotePath)/"
}

$remoteHost = if ($DryRun) { Get-RemoteDisplay } else { Resolve-RemoteHost }
$port = Get-EnvValue -Name "PLESK_PORT" -DefaultValue "22"

Write-Host "Plesk Fallback Deploy Helper" -ForegroundColor Green
Write-Host "Target: $Target | DryRun: $DryRun | Force: $Force" -ForegroundColor Yellow
Write-Host "Source of Truth: .github/workflows/deploy-plesk.yml" -ForegroundColor DarkGray

$targets = if ($Target -eq "all") { @("frontend", "api", "crm") } else { @($Target) }

foreach ($item in $targets) {
    Invoke-TargetDeploy -Name $item -RemoteHost $remoteHost -Port $port
}

Write-Host ""
if ($DryRun) {
    Write-Host "Dry-Run abgeschlossen. Kein Schreiben auf Produktion." -ForegroundColor Green
} else {
    Write-Host "Manueller Fallback-Deploy abgeschlossen." -ForegroundColor Green
}
