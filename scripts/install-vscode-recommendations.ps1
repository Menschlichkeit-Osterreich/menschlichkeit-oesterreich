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

$codeCommand = Get-Command code -ErrorAction SilentlyContinue
if (-not $codeCommand) {
    throw "Die VS Code CLI 'code' wurde nicht gefunden. Bitte in VS Code 'Shell Command: Install code command in PATH' ausfuehren."
}

$config = Get-Content -LiteralPath $extensionsConfig -Raw | ConvertFrom-Json
$recommendations = @($config.recommendations)

if ($recommendations.Count -eq 0) {
    Write-Host 'Keine empfohlenen Extensions gefunden.' -ForegroundColor Yellow
    exit 0
}

$current = & code --list-extensions
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
    & code --install-extension $installId --force
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[warn] Installation fehlgeschlagen fuer $extension" -ForegroundColor Yellow
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
