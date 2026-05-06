# Environment Variables Security Management
# PowerShell script for secure secrets handling with SOPS integration

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("decrypt", "encrypt", "edit", "validate", "init")]
    [string]$Action = "decrypt",
    
    [Parameter(Mandatory=$false)]
    [switch]$ExportToEnv = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$SpecificFile = $null
)

# Configuration
$Script:Config = @{
    SecretsPath = "secrets"
    TempPath = "temp"
    EncryptedSuffix = ".encrypted"
    MaxDecryptedLifetime = 300  # 5 minutes
    RequiredTools = @("sops", "age")
    LogFile = "logs/secrets-management.log"
}

# Ensure logs directory exists
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" -Force | Out-Null
}

# Logging function
function Write-LogMessage {
    param(
        [string]$Message,
        [ValidateSet("INFO", "WARN", "ERROR", "SUCCESS")]
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Console output with colors
    switch ($Level) {
        "INFO"    { Write-Host $logEntry -ForegroundColor White }
        "WARN"    { Write-Host $logEntry -ForegroundColor Yellow }
        "ERROR"   { Write-Host $logEntry -ForegroundColor Red }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
    }
    
    # Log to file
    $logEntry | Out-File -FilePath $Script:Config.LogFile -Append -Encoding UTF8
}

# Check if required tools are installed
function Test-RequiredTools {
    Write-LogMessage "Checking required tools..." "INFO"
    
    $missingTools = @()
    
    foreach ($tool in $Script:Config.RequiredTools) {
        try {
            $null = Get-Command $tool -ErrorAction Stop
            Write-LogMessage "✓ $tool is installed" "SUCCESS"
        } catch {
            $missingTools += $tool
            Write-LogMessage "✗ $tool is not installed or not in PATH" "ERROR"
        }
    }
    
    if ($missingTools.Count -gt 0) {
        Write-LogMessage "Missing tools detected. Installation guide:" "ERROR"
        Write-LogMessage "SOPS: choco install sops" "ERROR"
        Write-LogMessage "Age: choco install age" "ERROR"
        Write-LogMessage "Or download from: https://github.com/mozilla/sops/releases" "ERROR"
        return $false
    }
    
    return $true
}

# Initialize secrets management
function Initialize-SecretsManagement {
    Write-LogMessage "Initializing secrets management..." "INFO"
    
    # Create age key if not exists
    $ageKeyPath = "$env:USERPROFILE/.config/age/keys.txt"
    if (!(Test-Path $ageKeyPath)) {
        Write-LogMessage "Generating age key..." "INFO"
        $keyDir = Split-Path $ageKeyPath -Parent
        if (!(Test-Path $keyDir)) {
            New-Item -ItemType Directory -Path $keyDir -Force | Out-Null
        }
        
        $ageKey = & age-keygen 2>&1
        $ageKey | Out-File -FilePath $ageKeyPath -Encoding UTF8
        Write-LogMessage "Age key generated at: $ageKeyPath" "SUCCESS"
        
        # Extract public key for SOPS config
        $publicKey = ($ageKey | Select-String "public key:").Line -replace ".*public key: ", ""
        Write-LogMessage "Public key: $publicKey" "INFO"
        Write-LogMessage "Update .sops.yaml with this public key" "WARN"
    }
    
    # Create directory structure
    $directories = @(
        "$($Script:Config.SecretsPath)/production",
        "$($Script:Config.SecretsPath)/staging", 
        "$($Script:Config.SecretsPath)/development",
        "$($Script:Config.TempPath)"
    )
    
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-LogMessage "Created directory: $dir" "SUCCESS"
        }
    }
    
    Write-LogMessage "Secrets management initialized successfully" "SUCCESS"
}

# Get secrets files for environment
function Get-SecretsFiles {
    param([string]$Environment)
    
    $secretsDir = Join-Path $Script:Config.SecretsPath $Environment
    
    if (!(Test-Path $secretsDir)) {
        Write-LogMessage "Secrets directory not found: $secretsDir" "ERROR"
        return @()
    }
    
    return Get-ChildItem -Path $secretsDir -Filter "*.yaml" -Recurse
}

# Decrypt secrets for environment
function Invoke-SecretsDecryption {
    param([string]$Environment)
    
    Write-LogMessage "🔓 Decrypting secrets for environment: $Environment" "INFO"
    
    $secretsFiles = Get-SecretsFiles $Environment
    
    if ($secretsFiles.Count -eq 0) {
        Write-LogMessage "No secret files found for environment: $Environment" "WARN"
        return $false
    }
    
    # Create temporary .env file
    $tempEnvFile = Join-Path $Script:Config.TempPath ".env.$Environment.decrypted"
    
    # Header for env file
    @(
        "# Generated environment variables from SOPS secrets",
        "# Environment: $Environment",
        "# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
        "# WARNING: This file contains decrypted secrets - auto-deleted in 5 minutes",
        ""
    ) | Out-File -FilePath $tempEnvFile -Encoding UTF8
    
    $successCount = 0
    foreach ($secretFile in $secretsFiles) {
        Write-LogMessage "  Processing: $($secretFile.Name)" "INFO"
        
        try {
            # Decrypt with SOPS
            $decryptedContent = & sops -d $secretFile.FullName | ConvertFrom-Yaml
            
            # Convert YAML structure to environment variables
            ConvertTo-EnvironmentVariables -Object $decryptedContent -OutputFile $tempEnvFile
            
            $successCount++
            Write-LogMessage "    ✓ Successfully processed $($secretFile.Name)" "SUCCESS"
            
        } catch {
            Write-LogMessage "    ✗ Failed to decrypt $($secretFile.Name): $($_.Exception.Message)" "ERROR"
        }
    }
    
    if ($successCount -gt 0) {
        Write-LogMessage "✅ Secrets decrypted to: $tempEnvFile" "SUCCESS"
        Write-LogMessage "📋 Successfully processed $successCount/$($secretsFiles.Count) files" "SUCCESS"
        
        # Export to environment if requested
        if ($ExportToEnv) {
            Export-EnvironmentVariables -FilePath $tempEnvFile
        }
        
        # Schedule cleanup
        Schedule-FileCleanup -FilePath $tempEnvFile -DelaySeconds $Script:Config.MaxDecryptedLifetime
        
        return $true
    } else {
        Write-LogMessage "❌ No secrets could be decrypted" "ERROR"
        return $false
    }
}

# Convert YAML object to environment variables
function ConvertTo-EnvironmentVariables {
    param(
        [hashtable]$Object,
        [string]$OutputFile,
        [string]$Prefix = ""
    )
    
    foreach ($key in $Object.Keys) {
        $envKey = if ($Prefix) { "${Prefix}_${key}".ToUpper() } else { $key.ToUpper() }
        $value = $Object[$key]
        
        if ($value -is [hashtable]) {
            # Recursive processing for nested objects
            ConvertTo-EnvironmentVariables -Object $value -OutputFile $OutputFile -Prefix $envKey
        } elseif ($value -is [array]) {
            # Arrays as comma-separated values
            $arrayValue = $value -join ","
            "$envKey=$arrayValue" | Out-File -FilePath $OutputFile -Append -Encoding UTF8
        } else {
            # Simple key-value pair
            "$envKey=$value" | Out-File -FilePath $OutputFile -Append -Encoding UTF8
        }
    }
}

# Export environment variables to current session
function Export-EnvironmentVariables {
    param([string]$FilePath)
    
    Write-LogMessage "🌐 Exporting environment variables..." "INFO"
    
    $exportedCount = 0
    Get-Content $FilePath | ForEach-Object {
        if ($_ -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            
            # Skip comments and empty lines
            if (!$name.StartsWith("#") -and $name -ne "") {
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
                Write-LogMessage "  Exported: $name" "SUCCESS"
                $exportedCount++
            }
        }
    }
    
    Write-LogMessage "✅ Exported $exportedCount environment variables" "SUCCESS"
}

# Encrypt secrets file
function Invoke-SecretsEncryption {
    param(
        [string]$Environment,
        [string]$FilePath
    )
    
    if (!(Test-Path $FilePath)) {
        Write-LogMessage "File not found: $FilePath" "ERROR"
        return $false
    }
    
    Write-LogMessage "🔒 Encrypting secrets file: $FilePath" "INFO"
    
    try {
        # Encrypt in place
        & sops -e -i $FilePath
        Write-LogMessage "✅ Successfully encrypted: $FilePath" "SUCCESS"
        return $true
    } catch {
        Write-LogMessage "❌ Encryption failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Edit secrets file (decrypt, open editor, re-encrypt)
function Invoke-SecretsEdit {
    param(
        [string]$Environment,
        [string]$FilePath
    )
    
    if (!(Test-Path $FilePath)) {
        Write-LogMessage "File not found: $FilePath" "ERROR"
        return $false
    }
    
    Write-LogMessage "✏️ Opening secrets file for editing: $FilePath" "INFO"
    
    try {
        # SOPS will handle decrypt -> edit -> encrypt cycle
        & sops $FilePath
        Write-LogMessage "✅ Secrets file editing completed" "SUCCESS"
        return $true
    } catch {
        Write-LogMessage "❌ Edit failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Validate secrets configuration
function Test-SecretsConfiguration {
    param([string]$Environment)
    
    Write-LogMessage "🔍 Validating secrets configuration for: $Environment" "INFO"
    
    $secretsFiles = Get-SecretsFiles $Environment
    $validationErrors = @()
    
    foreach ($secretFile in $secretsFiles) {
        Write-LogMessage "  Validating: $($secretFile.Name)" "INFO"
        
        try {
            # Test decryption
            $null = & sops -d $secretFile.FullName
            Write-LogMessage "    ✓ Decryption successful" "SUCCESS"
        } catch {
            $validationErrors += "Decryption failed for $($secretFile.Name): $($_.Exception.Message)"
            Write-LogMessage "    ✗ Decryption failed" "ERROR"
        }
        
        # Check for placeholder values
        try {
            $content = Get-Content $secretFile.FullName -Raw
            if ($content -match "REPLACE_WITH_") {
                $validationErrors += "$($secretFile.Name) contains placeholder values (REPLACE_WITH_*)"
                Write-LogMessage "    ⚠️ Contains placeholder values" "WARN"
            }
        } catch {
            # File might be encrypted, skip placeholder check
        }
    }
    
    if ($validationErrors.Count -eq 0) {
        Write-LogMessage "✅ All secrets validation passed" "SUCCESS"
        return $true
    } else {
        Write-LogMessage "❌ Validation errors found:" "ERROR"
        foreach ($error in $validationErrors) {
            Write-LogMessage "  - $error" "ERROR"
        }
        return $false
    }
}

# Schedule file cleanup for security
function Schedule-FileCleanup {
    param(
        [string]$FilePath,
        [int]$DelaySeconds
    )
    
    $scriptBlock = {
        param($Path, $Delay)
        Start-Sleep -Seconds $Delay
        if (Test-Path $Path) {
            Remove-Item $Path -Force
            Write-Host "🗑️ Cleaned up temporary secrets file: $Path" -ForegroundColor Gray
        }
    }
    
    Start-Job -ScriptBlock $scriptBlock -ArgumentList $FilePath, $DelaySeconds | Out-Null
    Write-LogMessage "⏰ Scheduled cleanup for $FilePath in $DelaySeconds seconds" "INFO"
}

# Convert YAML to hashtable (helper function)
function ConvertFrom-Yaml {
    param([Parameter(ValueFromPipeline)]$InputObject)
    
    # Simple YAML parser - for production use, consider PowerShell-Yaml module
    $result = @{}
    $lines = $InputObject -split "`n"
    $currentSection = $result
    
    foreach ($line in $lines) {
        $line = $line.Trim()
        if ($line -eq "" -or $line.StartsWith("#")) { continue }
        
        if ($line -match "^([^:]+):(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            
            if ($value -eq "") {
                # Nested object
                $currentSection[$key] = @{}
                $currentSection = $currentSection[$key]
            } else {
                # Simple key-value
                $currentSection[$key] = $value
            }
        }
    }
    
    return $result
}

# Main execution logic
function Invoke-SecretsManagement {
    Write-LogMessage "🔐 Environment Variables Security Management" "INFO"
    Write-LogMessage "Environment: $Environment | Action: $Action" "INFO"
    
    # Check prerequisites
    if (!(Test-RequiredTools)) {
        Write-LogMessage "❌ Required tools missing. Please install and try again." "ERROR"
        exit 1
    }
    
    # Execute requested action
    $success = switch ($Action) {
        "init" {
            Initialize-SecretsManagement
            $true
        }
        "decrypt" {
            if ($SpecificFile) {
                Invoke-SecretsDecryption -Environment $Environment -SpecificFile $SpecificFile
            } else {
                Invoke-SecretsDecryption -Environment $Environment
            }
        }
        "encrypt" {
            if (!$SpecificFile) {
                Write-LogMessage "Specific file required for encryption" "ERROR"
                $false
            } else {
                Invoke-SecretsEncryption -Environment $Environment -FilePath $SpecificFile
            }
        }
        "edit" {
            if (!$SpecificFile) {
                Write-LogMessage "Specific file required for editing" "ERROR"
                $false
            } else {
                Invoke-SecretsEdit -Environment $Environment -FilePath $SpecificFile
            }
        }
        "validate" {
            Test-SecretsConfiguration -Environment $Environment
        }
        default {
            Write-LogMessage "Unknown action: $Action" "ERROR"
            $false
        }
    }
    
    if ($success) {
        Write-LogMessage "✅ Operation completed successfully" "SUCCESS"
        exit 0
    } else {
        Write-LogMessage "❌ Operation failed" "ERROR"
        exit 1
    }
}

# Execute main function
try {
    Invoke-SecretsManagement
} catch {
    Write-LogMessage "💥 Critical error: $($_.Exception.Message)" "ERROR"
    Write-LogMessage "Stack trace: $($_.ScriptStackTrace)" "ERROR"
    exit 1
}