<#
.SYNOPSIS
    PowerShell wrapper for scripts/validate-secrets.py
#>

param(
    [string]$EnvFile = ".env",
    [ValidateSet("env", "template", "suite")]
    [string]$Mode = "env"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

if ($Mode -eq "suite") {
    python scripts/validate-secrets.py --mode suite
    exit $LASTEXITCODE
}

python scripts/validate-secrets.py --mode $Mode --file $EnvFile
exit $LASTEXITCODE
