$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'bitwarden-common.ps1')

$token = Resolve-BitwardenAccessToken -TokenFile $env:BW_TOKEN_FILE -ExportToProcess
if ([string]::IsNullOrWhiteSpace($token)) {
    throw 'Kein Bitwarden Access Token gefunden. Setze BSM_ACCESS_TOKEN/BW_ACCESS_TOKEN oder BW_TOKEN_FILE.'
}

$outDir = Join-Path $repoRoot 'quality-reports'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outFile = Join-Path $outDir 'bws-projects.json'

Write-Host 'Listing Bitwarden Secrets Manager projects...' -ForegroundColor Cyan
$projectsJson = Invoke-BwsCommand -Arguments @('project', 'list', '--output', 'json') -TokenFile $env:BW_TOKEN_FILE
$projectsJson | Set-Content -Path $outFile -Encoding UTF8
$projectsJson

Write-Host "`nSaved project list to $outFile" -ForegroundColor Green
