#!/usr/bin/env pwsh
# Unified Build Script
# Builds all system components in the correct order

param(
    [switch]$All,
    [switch]$Frontend,
    [switch]$API,
    [switch]$Games,
    [switch]$Clean,
    [switch]$Help
)

function Show-Help {
    Write-Host "🔨 Build Script für Menschlichkeit Österreich" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Parameters:" -ForegroundColor Yellow
    Write-Host "  -All        Build all components" -ForegroundColor White
    Write-Host "  -Frontend   Build only Frontend (Next.js)" -ForegroundColor White
    Write-Host "  -API        Build only API (Python)" -ForegroundColor White
    Write-Host "  -Games      Build only Games (Static)" -ForegroundColor White
    Write-Host "  -Clean      Clean before build" -ForegroundColor White
    Write-Host "  -Help       Show this help" -ForegroundColor White
}

function Build-Frontend {
    Write-Host "⚛️ Building Frontend..." -ForegroundColor Green
    
    if (Test-Path "frontend") {
        Set-Location "frontend"
        
        # Install dependencies
        npm ci
        
        # Build production
        npm run build
        
        Write-Host "✅ Frontend build completed" -ForegroundColor Green
        Set-Location ".."
    }
}

function Build-API {
    Write-Host "🐍 Building API..." -ForegroundColor Green
    
    if (Test-Path "api.menschlichkeit-oesterreich.at") {
        Set-Location "api.menschlichkeit-oesterreich.at"
        
        # Activate virtual environment
        if (Test-Path ".venv") {
            & ".venv/Scripts/Activate.ps1"
        }
        
        # Install dependencies
        if (Test-Path "requirements.txt") {
            pip install -r requirements.txt
        }
        
        # Create distribution
        python -m build
        
        if (Test-Path ".venv") {
            deactivate
        }
        
        Write-Host "✅ API build completed" -ForegroundColor Green
        Set-Location ".."
    }
}

function Build-Games {
    Write-Host "🎮 Building Games..." -ForegroundColor Green
    
    if (Test-Path "web/games") {
        # Minify JavaScript
        Write-Host "Optimizing JavaScript files..." -ForegroundColor Gray
        Get-ChildItem "web/games/js/*.js" | ForEach-Object {
            # Basic optimization - remove console.log statements in production
            $content = Get-Content $_.FullName -Raw
            $optimized = $content -replace 'console\.log\([^)]*\);?', ''
            Set-Content "$($_.DirectoryName)/$($_.BaseName).min.js" $optimized
        }
        
        # Validate HTML files
        Write-Host "Validating HTML structure..." -ForegroundColor Gray
        Get-ChildItem "web/games/*.html" | ForEach-Object {
            if (Select-String -Path $_.FullName -Pattern '<html.*>') {
                Write-Host "  ✅ $($_.Name) valid" -ForegroundColor Gray
            }
        }
        
        Write-Host "✅ Games build completed" -ForegroundColor Green
    }
}

function Clean-Build {
    Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Yellow
    
    # Clean Frontend
    if (Test-Path "frontend/dist") {
        Remove-Item "frontend/dist" -Recurse -Force
        Write-Host "  ✅ Cleaned Frontend dist" -ForegroundColor Gray
    }
    
    if (Test-Path "frontend/.next") {
        Remove-Item "frontend/.next" -Recurse -Force  
        Write-Host "  ✅ Cleaned Frontend .next" -ForegroundColor Gray
    }
    
    # Clean API
    if (Test-Path "api.menschlichkeit-oesterreich.at/dist") {
        Remove-Item "api.menschlichkeit-oesterreich.at/dist" -Recurse -Force
        Write-Host "  ✅ Cleaned API dist" -ForegroundColor Gray
    }
    
    if (Test-Path "api.menschlichkeit-oesterreich.at/build") {
        Remove-Item "api.menschlichkeit-oesterreich.at/build" -Recurse -Force
        Write-Host "  ✅ Cleaned API build" -ForegroundColor Gray
    }
    
    # Clean Games minified files
    Get-ChildItem "web/games/js/*.min.js" -ErrorAction SilentlyContinue | Remove-Item
    Write-Host "  ✅ Cleaned Games minified files" -ForegroundColor Gray
    
    Write-Host "✅ Clean completed" -ForegroundColor Green
}

function Validate-Build {
    Write-Host "🔍 Validating builds..." -ForegroundColor Green
    
    $validations = @()
    
    # Check Frontend build
    if (Test-Path "frontend/dist" -Or Test-Path "frontend/.next") {
        $validations += "✅ Frontend build artifacts present"
    } else {
        $validations += "❌ Frontend build artifacts missing"
    }
    
    # Check API build
    if (Test-Path "api.menschlichkeit-oesterreich.at/dist") {
        $validations += "✅ API build artifacts present"
    } else {
        $validations += "❌ API build artifacts missing"
    }
    
    # Check Games optimization
    if (Get-ChildItem "web/games/js/*.min.js" -ErrorAction SilentlyContinue) {
        $validations += "✅ Games optimization completed"
    } else {
        $validations += "❌ Games optimization missing"
    }
    
    # Display results
    foreach ($validation in $validations) {
        Write-Host $validation
    }
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

Write-Host "🔨 Menschlichkeit Österreich - Build System" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

if ($Clean) {
    Clean-Build
    Write-Host ""
}

if ($All) {
    Build-Frontend
    Build-API
    Build-Games
} else {
    if ($Frontend) { Build-Frontend }
    if ($API) { Build-API }
    if ($Games) { Build-Games }
}

Write-Host ""
Validate-Build

Write-Host ""
Write-Host "🎉 Build process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Build artifacts ready for deployment:" -ForegroundColor Yellow
Write-Host "  - Frontend: frontend/dist/ or frontend/.next/" -ForegroundColor White
Write-Host "  - API: api.menschlichkeit-oesterreich.at/dist/" -ForegroundColor White  
Write-Host "  - Games: web/games/ (optimized)" -ForegroundColor White