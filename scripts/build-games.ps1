#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"

$rootDir = Join-Path $PSScriptRoot ".."
Set-Location $rootDir

Write-Host "🎮 Baue Babylon.js-Spiel (Next.js) ..." -ForegroundColor Cyan
npm run build --workspace=@moe/babylon-game
Write-Host "✅ Games-Build abgeschlossen." -ForegroundColor Green
