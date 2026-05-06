# OpenAI Codex & Secrets Management - PowerShell Automation Script
# Automatisierte Reparatur und sichere API-Key-Verwaltung

param(
    [Parameter(Mandatory=$false)]
    [switch]$SetupKeys = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$LoadSecrets = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$TestConnection = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$RepairExtension = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$OpenAIApiKey = "",
    
    [Parameter(Mandatory=$false)]
    [string]$OpenAIOrgId = ""
)

# Configuration
$Script:Config = @{
    WorkspaceRoot = $PWD.Path
    SecretsPath = "$($PWD.Path)\secrets\ai"
    VSCodeSecretsPath = "$($PWD.Path)\.vscode\secrets"
    SOPSConfigPath = "$($PWD.Path)\.sops.yaml"
    EnvironmentFile = "$($PWD.Path)\.env.local"
}

# Logging function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN"  { "Yellow" }
        "SUCCESS" { "Green" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-Prerequisites {
    Write-Log "Checking prerequisites for OpenAI Codex repair..."
    
    $errors = @()
    
    # Check if VS Code is installed
    $vscodeCommand = Get-Command code -ErrorAction SilentlyContinue
    if (-not $vscodeCommand) {
        $errors += "VS Code command-line tool 'code' not found in PATH"
    }
    
    # Check if Node.js is installed (required for MCP servers)
    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeCommand) {
        $errors += "Node.js not found. Install from https://nodejs.org/"
    }
    
    # Check if npm is available
    $npmCommand = Get-Command npm -ErrorAction SilentlyContinue
    if (-not $npmCommand) {
        $errors += "npm not found. Install Node.js to get npm"
    }
    
    # Check for age encryption tool (optional but recommended)
    $ageCommand = Get-Command age -ErrorAction SilentlyContinue
    if (-not $ageCommand) {
        Write-Log "age encryption tool not found. Install from https://age-encryption.org/" "WARN"
        Write-Log "SOPS encryption will not work without age keys" "WARN"
    }
    
    # Check for SOPS (optional but recommended)
    $sopsCommand = Get-Command sops -ErrorAction SilentlyContinue
    if (-not $sopsCommand) {
        Write-Log "SOPS not found. Install from https://github.com/mozilla/sops" "WARN"
        Write-Log "Secrets encryption will not be available" "WARN"
    }
    
    if ($errors.Count -gt 0) {
        foreach ($error in $errors) {
            Write-Log $error "ERROR"
        }
        throw "Prerequisites check failed"
    }
    
    Write-Log "Prerequisites check completed successfully" "SUCCESS"
}

function Install-RequiredPackages {
    Write-Log "Installing required MCP server packages..."
    
    try {
        # Historically this script attempted to install MCP servers from npm.
        # Some entries (like @openai/mcp-server) are not published to the public registry
        # and cause npm E404 errors. Instead of automatic installs, recommend using
        # provided local stubs or manually install supported servers.
        Write-Log "Skipping automatic npm installs for MCP servers to avoid E404 errors" "WARN"
        Write-Log "If you need real MCP servers, install them manually or use the local stubs at servers/src/mcp-stub.js" "INFO"
        Write-Log "Example manual install: npm install -g @modelcontextprotocol/server-sequential-thinking@latest" "INFO"
    }
    catch {
        Write-Log "Error installing packages: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Initialize-SecretsStructure {
    Write-Log "Initializing secrets directory structure..."
    
    try {
        # Create directories if they don't exist
        $directories = @(
            $Script:Config.SecretsPath,
            $Script:Config.VSCodeSecretsPath,
            "$($Script:Config.SecretsPath)\production",
            "$($Script:Config.SecretsPath)\staging", 
            "$($Script:Config.SecretsPath)\development"
        )
        
        foreach ($dir in $directories) {
            if (!(Test-Path $dir)) {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
                Write-Log "Created directory: $dir"
            }
        }
        
        # Create .gitignore for secrets if it doesn't exist
        $secretsGitignore = "$($Script:Config.SecretsPath)\.gitignore"
        if (!(Test-Path $secretsGitignore)) {
            @"
# Encrypted secrets are OK to commit
*.json
*.yaml
*.yml
*.env

# But never commit unencrypted secrets
*.decrypted.*
*.tmp.*
*_backup.*
"@ | Out-File -FilePath $secretsGitignore -Encoding UTF8
        }
        
        Write-Log "Secrets directory structure initialized" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "Error initializing secrets structure: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Set-OpenAICredentials {
    param(
        [string]$ApiKey,
        [string]$OrgId
    )
    
    Write-Log "Setting up OpenAI credentials..."
    
    try {
        # Validate API key format
        if ($ApiKey -and $ApiKey -notmatch "^sk-[A-Za-z0-9]{32,}$") {
            Write-Log "Invalid OpenAI API key format. Should start with 'sk-'" "ERROR"
            return $false
        }
        
        if ($OrgId -and $OrgId -notmatch "^org-[A-Za-z0-9]{24}$") {
            Write-Log "Invalid OpenAI Organization ID format. Should start with 'org-'" "ERROR"
            return $false
        }
        
        # Read existing config or create new
        $configPath = "$($Script:Config.SecretsPath)\openai.json"
        $config = @{
            openai_api_key = $ApiKey
            openai_org_id = $OrgId
            openai_project_id = ""
            chatgpt_session_token = ""
            model_preferences = @{
                default_model = "gpt-4o"
                max_tokens = 4000
                temperature = 0.7
            }
            rate_limits = @{
                requests_per_minute = 20
                tokens_per_minute = 40000
            }
        }
        
        # Save configuration
        $config | ConvertTo-Json -Depth 5 | Out-File -FilePath $configPath -Encoding UTF8
        Write-Log "OpenAI configuration saved to: $configPath"
        
        # Try to encrypt with SOPS if available
        $sopsCommand = Get-Command sops -ErrorAction SilentlyContinue
        if ($sopsCommand) {
            Write-Log "Encrypting OpenAI configuration with SOPS..."
            $encryptProcess = Start-Process -FilePath "sops" -ArgumentList "--encrypt", "--in-place", $configPath -Wait -PassThru -NoNewWindow
            if ($encryptProcess.ExitCode -eq 0) {
                Write-Log "Configuration encrypted successfully" "SUCCESS"
            } else {
                Write-Log "Failed to encrypt configuration, but it's saved as plaintext" "WARN"
            }
        }
        
        Write-Log "OpenAI credentials configured successfully" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "Error setting OpenAI credentials: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Set-EnvironmentVariables {
    Write-Log "Setting environment variables for current session..."
    
    try {
        # Load from secrets if available
        $configPath = "$($Script:Config.SecretsPath)\openai.json"
        
        if (Test-Path $configPath) {
            # Try to decrypt with SOPS first
            $sopsCommand = Get-Command sops -ErrorAction SilentlyContinue
            if ($sopsCommand) {
                try {
                    $decryptedContent = & sops --decrypt $configPath | ConvertFrom-Json
                    Write-Log "Loaded encrypted OpenAI configuration" "SUCCESS"
                }
                catch {
                    Write-Log "Failed to decrypt with SOPS, trying plaintext..." "WARN"
                    $decryptedContent = Get-Content $configPath | ConvertFrom-Json
                }
            } else {
                $decryptedContent = Get-Content $configPath | ConvertFrom-Json
            }
            
            # Set environment variables
            if ($decryptedContent.openai_api_key) {
                [System.Environment]::SetEnvironmentVariable("OPENAI_API_KEY", $decryptedContent.openai_api_key, "Process")
                Write-Log "Set OPENAI_API_KEY environment variable"
            }
            
            if ($decryptedContent.openai_org_id) {
                [System.Environment]::SetEnvironmentVariable("OPENAI_ORG_ID", $decryptedContent.openai_org_id, "Process")  
                Write-Log "Set OPENAI_ORG_ID environment variable"
            }
            
            # Create .env.local for other tools
            $envContent = @"
# OpenAI Configuration - Auto-generated by secrets management script
# Do not commit this file to version control
OPENAI_API_KEY=$($decryptedContent.openai_api_key)
OPENAI_ORG_ID=$($decryptedContent.openai_org_id)
OPENAI_MODEL=$($decryptedContent.model_preferences.default_model)
"@
            
            $envContent | Out-File -FilePath $Script:Config.EnvironmentFile -Encoding UTF8
            Write-Log "Created .env.local file for environment variables"
            
            return $true
        } else {
            Write-Log "OpenAI configuration not found. Run with -SetupKeys first." "ERROR"
            return $false
        }
    }
    catch {
        Write-Log "Error setting environment variables: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Test-OpenAIConnection {
    Write-Log "Testing OpenAI API connection..."
    
    try {
        $apiKey = [System.Environment]::GetEnvironmentVariable("OPENAI_API_KEY", "Process")
        $orgId = [System.Environment]::GetEnvironmentVariable("OPENAI_ORG_ID", "Process")
        
        if (-not $apiKey) {
            Write-Log "OPENAI_API_KEY environment variable not set" "ERROR"
            return $false
        }
        
        # Test API connection
        $headers = @{
            "Authorization" = "Bearer $apiKey"
            "Content-Type" = "application/json"
        }
        
        if ($orgId) {
            $headers["OpenAI-Organization"] = $orgId
        }
        
        Write-Log "Making test request to OpenAI API..."
        $response = Invoke-RestMethod -Uri "https://api.openai.com/v1/models" -Headers $headers -Method GET
        
        if ($response.data) {
            Write-Log "✅ OpenAI API connection successful!" "SUCCESS"
            Write-Log "Available models: $($response.data.Count)" 
            
            # Check for GPT-4 availability
            $gpt4Models = $response.data | Where-Object { $_.id -like "*gpt-4*" }
            if ($gpt4Models) {
                Write-Log "✅ GPT-4 models available: $($gpt4Models.Count)" "SUCCESS"
            } else {
                Write-Log "⚠️  GPT-4 models not available with this API key" "WARN"
            }
            
            return $true
        } else {
            Write-Log "Unexpected API response format" "ERROR"
            return $false
        }
    }
    catch {
        Write-Log "Error testing OpenAI connection: $($_.Exception.Message)" "ERROR"
        Write-Log "Check your API key and organization ID" "ERROR"
        return $false
    }
}

function Repair-VSCodeExtension {
    Write-Log "Repairing VS Code OpenAI/Codex extension..."
    
    try {
        # Restart Extension Host
        Write-Log "Restarting VS Code Extension Host..."
        & code --command "workbench.action.restartExtensionHost"
        Start-Sleep -Seconds 3
        
        # Check for OpenAI extensions
        Write-Log "Checking installed OpenAI-related extensions..."
        $extensions = & code --list-extensions
        
        $openaiExtensions = $extensions | Where-Object { 
            $_ -match "(openai|codex|chatgpt|gpt)" 
        }
        
        if ($openaiExtensions) {
            Write-Log "Found OpenAI extensions:" "SUCCESS"
            foreach ($ext in $openaiExtensions) {
                Write-Log "  - $ext"
            }
        } else {
            Write-Log "No OpenAI extensions found. Installing recommended extension..." "WARN"
            
            # Install ChatGPT/Codex extension
            & code --install-extension ms-vscode.copilot-chat
            & code --install-extension openai.codex
            Write-Log "Extensions installed. Restart VS Code to activate."
        }
        
        # Update VS Code settings for OpenAI
        $settingsPath = "$($Script:Config.WorkspaceRoot)\.vscode\settings.json"
        if (Test-Path $settingsPath) {
            Write-Log "Updating VS Code settings for OpenAI integration..."
            
            $settings = Get-Content $settingsPath | ConvertFrom-Json -AsHashtable
            
            # Add OpenAI settings
            $settings["openai.apiKey"] = '${env:OPENAI_API_KEY}'
            $settings["openai.organization"] = '${env:OPENAI_ORG_ID}'
            $settings["chatgpt.apiKey"] = '${env:OPENAI_API_KEY}'
            $settings["github.copilot.advanced"] = $true
            
            # Save updated settings
            $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsPath -Encoding UTF8
            Write-Log "VS Code settings updated successfully" "SUCCESS"
        }
        
        Write-Log "VS Code extension repair completed" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "Error repairing VS Code extension: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Show-RepairStatus {
    Write-Log "=== OpenAI Codex Repair Status ===" "INFO"
    
    # Check environment variables
    $apiKey = [System.Environment]::GetEnvironmentVariable("OPENAI_API_KEY", "Process")
    $orgId = [System.Environment]::GetEnvironmentVariable("OPENAI_ORG_ID", "Process")
    
    if ($apiKey) {
        Write-Log "✅ OPENAI_API_KEY is set" "SUCCESS"
    } else {
        Write-Log "❌ OPENAI_API_KEY is not set" "ERROR"
    }
    
    if ($orgId) {
        Write-Log "✅ OPENAI_ORG_ID is set" "SUCCESS"
    } else {
        Write-Log "⚠️  OPENAI_ORG_ID is not set (optional)" "WARN"
    }
    
    # Check secrets files
    $configExists = Test-Path "$($Script:Config.SecretsPath)\openai.json"
    if ($configExists) {
        Write-Log "✅ OpenAI configuration file exists" "SUCCESS"
    } else {
        Write-Log "❌ OpenAI configuration file missing" "ERROR"
    }
    
    # Check VS Code MCP configuration
    $mcpConfig = Test-Path "$($Script:Config.WorkspaceRoot)\.vscode\mcp.json"
    if ($mcpConfig) {
        Write-Log "✅ MCP configuration exists" "SUCCESS"
    } else {
        Write-Log "❌ MCP configuration missing" "ERROR"
    }
    
    Write-Log "=== Repair Status Complete ===" "INFO"
}

# Main execution function
function Start-CodexRepair {
    Write-Log "🚀 Starting OpenAI Codex Repair Process" "INFO"
    Write-Log "=========================================="
    
    try {
        # Test prerequisites
        Test-Prerequisites
        
        # Initialize secrets structure
        Initialize-SecretsStructure
        
        # Setup API keys if provided
        if ($SetupKeys -and $OpenAIApiKey) {
            Set-OpenAICredentials -ApiKey $OpenAIApiKey -OrgId $OpenAIOrgId
        }
        
        # Load secrets into environment
        if ($LoadSecrets -or $SetupKeys) {
            Set-EnvironmentVariables
        }
        
        # Test API connection
        if ($TestConnection -or $SetupKeys) {
            Test-OpenAIConnection
        }
        
        # Repair VS Code extension
        if ($RepairExtension -or $SetupKeys) {
            Install-RequiredPackages
            Repair-VSCodeExtension
        }
        
        # Show final status
        Show-RepairStatus
        
        Write-Log "=========================================="
        Write-Log "🎉 OpenAI Codex Repair Process Completed!" "SUCCESS"
        Write-Log ""
        Write-Log "Next steps:"
        Write-Log "1. Restart VS Code completely"
        Write-Log "2. Open Command Palette (Ctrl+Shift+P)"
        Write-Log "3. Run 'OpenAI: Sign In' or 'ChatGPT: Sign In'"
        Write-Log "4. Test Codex functionality in a code file"
        Write-Log ""
        Write-Log "If still not working:"
        Write-Log "- Check VS Code Output panel → OpenAI/ChatGPT"
        Write-Log "- Verify your ChatGPT Plus/Pro subscription"
        Write-Log "- Run: Get-Help $($MyInvocation.MyCommand.Name) -Detailed"
        
        return $true
    }
    catch {
        Write-Log "Critical error during Codex repair: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Parameter validation and execution
try {
    if ($SetupKeys) {
        if (-not $OpenAIApiKey) {
            $OpenAIApiKey = Read-Host -Prompt "Enter your OpenAI API Key (sk-...)"
        }
        if (-not $OpenAIOrgId) {
            $OpenAIOrgId = Read-Host -Prompt "Enter your OpenAI Organization ID (org-..., optional)"
        }
    }
    
    $result = Start-CodexRepair
    if ($result) {
        exit 0
    } else {
        exit 1
    }
}
catch {
    Write-Log "Unhandled exception: $($_.Exception.Message)" "ERROR"
    exit 1
}

<#
.SYNOPSIS
OpenAI Codex & Secrets Management Repair Script

.DESCRIPTION
Automatisiert die Reparatur von OpenAI Codex in VS Code und implementiert sicheres Secrets Management.

.PARAMETER SetupKeys
Führt komplettes Setup mit API-Key-Konfiguration durch

.PARAMETER LoadSecrets
Lädt verschlüsselte Secrets in Environment Variables

.PARAMETER TestConnection
Testet OpenAI API-Verbindung

.PARAMETER RepairExtension
Repariert VS Code Extensions und MCP-Konfiguration

.PARAMETER OpenAIApiKey
OpenAI API Key (beginnt mit sk-)

.PARAMETER OpenAIOrgId
OpenAI Organization ID (beginnt mit org-)

.EXAMPLE
.\Repair-OpenAICodex.ps1 -SetupKeys -OpenAIApiKey "sk-..." -OpenAIOrgId "org-..."

.EXAMPLE  
.\Repair-OpenAICodex.ps1 -LoadSecrets -TestConnection

.EXAMPLE
.\Repair-OpenAICodex.ps1 -RepairExtension

.LINK
https://developers.openai.com/codex/ide
#>