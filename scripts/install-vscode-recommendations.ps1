#!/usr/bin/env pwsh
<#!
.SYNOPSIS
  Installiert kuratierte VS Code Extension-Empfehlungen aus .vscode/extensions.json.
.DESCRIPTION
  Nutzt die Code-CLI. Bereits installierte Extensions werden sauber uebersprungen.
#>

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$extensionsConfig = Join-Path $repoRoot '.vscode/extensions.json'

if (-not (Test-Path -LiteralPath $extensionsConfig)) {
    throw "Extensions-Konfiguration nicht gefunden: $extensionsConfig"
}

$codeCommand = Get-Command code.cmd -ErrorAction SilentlyContinue
if (-not $codeCommand) {
    $codeCommand = Get-Command code -ErrorAction SilentlyContinue
}
if (-not $codeCommand) {
    throw "Die VS Code CLI 'code' wurde nicht gefunden. Bitte in VS Code 'Shell Command: Install code command in PATH' ausfuehren."
}

$codeCli = $codeCommand.Source

$config = Get-Content -LiteralPath $extensionsConfig -Raw | ConvertFrom-Json
$recommendations = @($config.recommendations)

if ($recommendations.Count -eq 0) {
    Write-Host 'Keine empfohlenen Extensions gefunden.' -ForegroundColor Yellow
    exit 0
}

$current = & $codeCli --list-extensions
$installed = @{}
foreach ($extension in $current) {
    if (-not [string]::IsNullOrWhiteSpace($extension)) {
        $installed[$extension.Trim().ToLowerInvariant()] = $true
    }
}

$installedCount = 0
$skippedCount = 0
$failed = @()

foreach ($extension in $recommendations) {
    if ([string]::IsNullOrWhiteSpace($extension)) {
        continue
    }

    $key = $extension.ToLowerInvariant()
    if ($installed.ContainsKey($key)) {
        Write-Host "[skip] $extension (bereits installiert)" -ForegroundColor DarkGray
        $skippedCount++
        continue
    }

    $installId = $extension.ToLowerInvariant()
    Write-Host "[install] $extension" -ForegroundColor Cyan
    $installOutput = & $codeCli --install-extension $installId --force 2>&1
    if ($LASTEXITCODE -ne 0) {
        $installText = if ($installOutput) { ($installOutput | Out-String).Trim() } else { '' }
        if ($installText -match 'is a built-in extension' -and $installText -match 'cannot be downgraded') {
            Write-Host "[skip] $extension (bereits als built-in verfuegbar)" -ForegroundColor DarkGray
            $skippedCount++
            continue
        }

        Write-Host "[warn] Installation fehlgeschlagen fuer $extension" -ForegroundColor Yellow
        if ($installText) {
            Write-Host $installText -ForegroundColor DarkYellow
        }
        $failed += $extension
        continue
    }

    $installedCount++
}

Write-Host ''
Write-Host "Extensions installiert: $installedCount" -ForegroundColor Green
Write-Host "Bereits vorhanden: $skippedCount" -ForegroundColor Green
if ($failed.Count -gt 0) {
    Write-Host "Installationswarnungen: $($failed -join ', ')" -ForegroundColor Yellow
}
