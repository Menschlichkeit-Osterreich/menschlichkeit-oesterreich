<#
.SYNOPSIS
    Deployment-Helfer für Menschlichkeit Österreich
#>

function Start-StagingDeployment {
    param(
        [switch]$SkipTests
    )

    Write-Host "🚀 Starte Staging Deployment..." -ForegroundColor Cyan

    $args = @("staging")
    if ($SkipTests) {
        $args += "--skip-tests"
    }

    & ./build-pipeline.sh @args
}

function Start-ProductionDeployment {
    Write-Host "🚀 Starte Production Deployment..." -ForegroundColor Cyan
    Write-Host "⚠️  ACHTUNG: Production Deployment!" -ForegroundColor Yellow

    $confirmation = Read-Host "Fortfahren? (yes/no)"
    if ($confirmation -eq "yes") {
        & ./build-pipeline.sh production
    } else {
        Write-Host "❌ Deployment abgebrochen" -ForegroundColor Red
    }
}

function Invoke-Rollback {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Version
    )

    Write-Host "⏮️  Führe Rollback aus..." -ForegroundColor Yellow
    & ./deployment-scripts/rollback.sh $Version
}

Export-ModuleMember -Function Start-StagingDeployment, Start-ProductionDeployment, Invoke-Rollback
