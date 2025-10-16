#!/usr/bin/env pwsh
# Build script for Gaming Platform (web/)
# Generates Prisma client and bundles static assets

$ErrorActionPreference = "Stop"

Write-Host "🎮 Building Gaming Platform..." -ForegroundColor Cyan

# Navigate to root directory (schema.prisma is at root)
$rootDir = "$PSScriptRoot\.."
Set-Location $rootDir

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Generate Prisma Client (schema.prisma is at root)
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate --schema="$rootDir\schema.prisma"

# Optional: Bundle assets if needed (currently serving via Python HTTP server)
Write-Host "✅ Gaming Platform build complete!" -ForegroundColor Green
Write-Host "   Run 'npm run dev:games' to start development server on http://localhost:3000" -ForegroundColor Gray

# Return to root
Set-Location $PSScriptRoot\..
