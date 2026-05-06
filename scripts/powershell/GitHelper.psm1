<#
.SYNOPSIS
    Git-Workflow-Helfer für Menschlichkeit Österreich
#>

function New-FeatureBranch {
    param(
        [Parameter(Mandatory=$true)]
        [string]$IssueNumber,
        
        [Parameter(Mandatory=$true)]
        [string]$Description
    )
    
    $branchName = "feature/$IssueNumber-$Description"
    git checkout -b $branchName
    Write-Host "✅ Branch erstellt: $branchName" -ForegroundColor Green
}

function Invoke-QualityCheck {
    Write-Host "🔍 Führe Quality Gates aus..." -ForegroundColor Cyan
    npm run quality:gates
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Alle Quality Gates bestanden!" -ForegroundColor Green
    } else {
        Write-Host "❌ Quality Gates fehlgeschlagen!" -ForegroundColor Red
        exit 1
    }
}

function Invoke-SafeCommit {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,

        [switch]$IncludeUntracked
    )
    
    # Pre-commit checks
    Write-Host "🔍 Pre-commit checks..." -ForegroundColor Yellow
    Invoke-QualityCheck
    
    if ($LASTEXITCODE -eq 0) {
        $gitSyncScript = Join-Path $PSScriptRoot "..\git-sync.ps1"
        & pwsh -File $gitSyncScript -Action commit -Message $Message -IncludeUntracked:$IncludeUntracked
        Write-Host "✅ Commit erfolgreich!" -ForegroundColor Green
    }
}

function Invoke-RegularSync {
    param(
        [string]$Message,

        [switch]$IncludeUntracked,

        [switch]$SkipPull,

        [switch]$SkipPush
    )

    $gitSyncScript = Join-Path $PSScriptRoot "..\git-sync.ps1"
    $args = @("-File", $gitSyncScript, "-Action", "sync")

    if (-not [string]::IsNullOrWhiteSpace($Message)) {
        $args += @("-Message", $Message)
    }
    if ($IncludeUntracked) {
        $args += "-IncludeUntracked"
    }
    if ($SkipPull) {
        $args += "-SkipPull"
    }
    if ($SkipPush) {
        $args += "-SkipPush"
    }

    & pwsh @args
}

Export-ModuleMember -Function New-FeatureBranch, Invoke-QualityCheck, Invoke-SafeCommit, Invoke-RegularSync
