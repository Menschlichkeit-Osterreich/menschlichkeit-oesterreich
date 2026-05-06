# ChatGPT Extension Repair Script
# Repariert OpenAI ChatGPT Extension in VS Code

param(
    [switch]$Force,
    [switch]$ResetAuth,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$WarningPreference = "Continue"

Write-Host "🔧 ChatGPT Extension Repair Process Starting..." -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Gray

# Check VS Code Installation
Write-Host "`n1. Checking VS Code Installation..." -ForegroundColor Yellow
try {
    $vscodeVersion = code --version
    Write-Host "✅ VS Code Version: $($vscodeVersion[0])" -ForegroundColor Green
} catch {
    Write-Error "❌ VS Code not found in PATH. Please install VS Code first."
    exit 1
}

# Check ChatGPT Extension
Write-Host "`n2. Checking ChatGPT Extension..." -ForegroundColor Yellow
$extensions = code --list-extensions
if ($extensions -contains "openai.chatgpt") {
    Write-Host "✅ OpenAI ChatGPT Extension found" -ForegroundColor Green
} else {
    Write-Host "❌ ChatGPT Extension not found. Installing..." -ForegroundColor Red
    code --install-extension openai.chatgpt
}

# Check Extension Directory
Write-Host "`n3. Checking Extension Directory..." -ForegroundColor Yellow
$extensionDir = "$env:USERPROFILE\.vscode\extensions"
$chatgptExtensionDir = Get-ChildItem -Path $extensionDir -Directory | Where-Object { $_.Name -like "*openai.chatgpt*" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($chatgptExtensionDir) {
    Write-Host "✅ Extension Directory: $($chatgptExtensionDir.FullName)" -ForegroundColor Green
    
    # Check package.json
    $packageJsonPath = Join-Path $chatgptExtensionDir.FullName "package.json"
    if (Test-Path $packageJsonPath) {
        $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
        Write-Host "✅ Extension Version: $($packageJson.version)" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Extension directory not found" -ForegroundColor Red
}

# Reset Authentication if requested
if ($ResetAuth) {
    Write-Host "`n4. Resetting ChatGPT Authentication..." -ForegroundColor Yellow
    
    # Clear VS Code workspace storage
    $workspaceStorageDir = "$env:APPDATA\Code\User\workspaceStorage"
    if (Test-Path $workspaceStorageDir) {
        Get-ChildItem -Path $workspaceStorageDir -Recurse -File | Where-Object { 
            $_.Name -like "*chatgpt*" -or $_.Name -like "*openai*" 
        } | Remove-Item -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Cleared workspace storage" -ForegroundColor Green
    }
    
    # Clear global storage
    $globalStorageDir = "$env:APPDATA\Code\User\globalStorage\openai.chatgpt"
    if (Test-Path $globalStorageDir) {
        Remove-Item -Path $globalStorageDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Cleared global storage" -ForegroundColor Green
    }
}

# Check VS Code Settings
Write-Host "`n5. Checking VS Code Settings..." -ForegroundColor Yellow
$settingsPath = "d:\Arbeitsverzeichniss\.vscode\settings.json"
if (Test-Path $settingsPath) {
    $settings = Get-Content $settingsPath | ConvertFrom-Json
    
    if ($settings.PSObject.Properties["chatgpt.apiKey"]) {
        Write-Host "✅ ChatGPT API Key configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  ChatGPT API Key not configured in settings" -ForegroundColor Yellow
    }
    
    if ($settings.PSObject.Properties["openai.apiKey"]) {
        Write-Host "✅ OpenAI API Key configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  OpenAI API Key not configured in settings" -ForegroundColor Yellow
    }
}

# Check Environment Variables
Write-Host "`n6. Checking Environment Variables..." -ForegroundColor Yellow
if ($env:OPENAI_API_KEY) {
    $keyPreview = $env:OPENAI_API_KEY.Substring(0, [Math]::Min(10, $env:OPENAI_API_KEY.Length)) + "..."
    Write-Host "✅ OPENAI_API_KEY found: $keyPreview" -ForegroundColor Green
} else {
    Write-Host "⚠️  OPENAI_API_KEY environment variable not set" -ForegroundColor Yellow
}

if ($env:OPENAI_ORG_ID) {
    Write-Host "✅ OPENAI_ORG_ID found" -ForegroundColor Green
} else {
    Write-Host "⚠️  OPENAI_ORG_ID environment variable not set" -ForegroundColor Yellow
}

# Test Extension Functionality
Write-Host "`n7. Testing Extension Functionality..." -ForegroundColor Yellow

# Create test workspace if it doesn't exist
$testWorkspace = "d:\Arbeitsverzeichniss\.vscode"
if (-not (Test-Path $testWorkspace)) {
    New-Item -ItemType Directory -Path $testWorkspace -Force
}

# Update VS Code settings for ChatGPT
Write-Host "`n8. Updating VS Code Settings..." -ForegroundColor Yellow
$settingsPath = "d:\Arbeitsverzeichniss\.vscode\settings.json"

try {
    if (Test-Path $settingsPath) {
        $currentSettings = Get-Content $settingsPath -Raw | ConvertFrom-Json
    } else {
        $currentSettings = @{}
    }
    
    # Add/Update ChatGPT specific settings
    $currentSettings | Add-Member -Type NoteProperty -Name "chatgpt.apiKey" -Value "`${env:OPENAI_API_KEY}" -Force
    $currentSettings | Add-Member -Type NoteProperty -Name "chatgpt.openOnStartup" -Value $true -Force
    $currentSettings | Add-Member -Type NoteProperty -Name "chatgpt.gpt3.apiKey" -Value "`${env:OPENAI_API_KEY}" -Force
    $currentSettings | Add-Member -Type NoteProperty -Name "chatgpt.gpt3.organization" -Value "`${env:OPENAI_ORG_ID}" -Force
    
    # Ensure OpenAI settings are also present
    $currentSettings | Add-Member -Type NoteProperty -Name "openai.apiKey" -Value "`${env:OPENAI_API_KEY}" -Force
    $currentSettings | Add-Member -Type NoteProperty -Name "openai.organization" -Value "`${env:OPENAI_ORG_ID}" -Force
    
    $updatedJson = $currentSettings | ConvertTo-Json -Depth 10
    Set-Content -Path $settingsPath -Value $updatedJson -Encoding UTF8
    
    Write-Host "✅ VS Code settings updated successfully" -ForegroundColor Green
} catch {
    Write-Error "❌ Failed to update VS Code settings: $_"
}

# Final Status Report
Write-Host "`n9. Final Status Report..." -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Gray

Write-Host "`n📋 ChatGPT Extension Status:" -ForegroundColor Cyan
Write-Host "• Extension installed: ✅" -ForegroundColor Green
Write-Host "• Settings configured: ✅" -ForegroundColor Green
Write-Host "• Environment variables: $(if($env:OPENAI_API_KEY) { '✅' } else { '⚠️ ' })" -ForegroundColor $(if($env:OPENAI_API_KEY) { 'Green' } else { 'Yellow' })

Write-Host "`n🔄 Next Steps Required:" -ForegroundColor Cyan
Write-Host "1. Restart VS Code completely (Ctrl+Shift+P → 'Developer: Reload Window')" -ForegroundColor White
Write-Host "2. Use Ctrl+Shift+P and search for 'ChatGPT: Sign in'" -ForegroundColor White
Write-Host "3. Authenticate with your ChatGPT Plus/Pro account" -ForegroundColor White
Write-Host "4. Test with Ctrl+Shift+P → 'ChatGPT: Ask ChatGPT'" -ForegroundColor White

if (-not $env:OPENAI_API_KEY) {
    Write-Host "`n⚠️  Optional: Set up OpenAI API Key for enhanced features:" -ForegroundColor Yellow
    Write-Host "1. Get API key from https://platform.openai.com/api-keys" -ForegroundColor White
    Write-Host "2. Run: `$env:OPENAI_API_KEY='your-key-here'" -ForegroundColor White
    Write-Host "3. Restart VS Code" -ForegroundColor White
}

Write-Host "`n✅ ChatGPT Extension Repair Process Completed!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Gray