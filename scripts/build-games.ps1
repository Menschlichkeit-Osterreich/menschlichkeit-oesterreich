#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"

$rootDir = Join-Path $PSScriptRoot ".."
Set-Location $rootDir

Write-Host "🎮 Baue Babylon.js-Spiel nach apps/game/dist ..." -ForegroundColor Cyan
node "apps/game/scripts/build-game.mjs"
Write-Host "✅ Games-Build abgeschlossen." -ForegroundColor Green
