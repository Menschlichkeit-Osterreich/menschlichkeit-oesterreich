# SSL/TLS Production Hardening - Windows PowerShell Script
# Deployment für Plesk auf Windows Server

param(
    [Parameter(Mandatory=$false)]
    [switch]$TestMode = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$BackupPath = "C:\Plesk\backup\ssl-config-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
)

# Configuration
$Script:Config = @{
    PleskPath = "C:\Program Files (x86)\Plesk\client\bin"
    NginxPath = "C:\Plesk\nginx\conf"
    SSLPath = "C:\Plesk\ssl"
    Domains = @("menschlichkeit-oesterreich.at", "crm.menschlichkeit-oesterreich.at", "api.menschlichkeit-oesterreich.at")
    AlertEmail = "admin@menschlichkeit-oesterreich.at"
    AlertThreshold = 30
}

# Logging functions
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN"  { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
    
    # Log to file
    $logPath = "C:\Plesk\logs\ssl-hardening.log"
    if (!(Test-Path (Split-Path $logPath))) {
        New-Item -ItemType Directory -Path (Split-Path $logPath) -Force | Out-Null
    }
    "[$timestamp] [$Level] $Message" | Out-File -FilePath $logPath -Append
}

# Error handling
function Write-Error-Log {
    param([string]$Message, [System.Management.Automation.ErrorRecord]$ErrorRecord = $null)
    
    Write-Log $Message "ERROR"
    if ($ErrorRecord) {
        Write-Log "Exception: $($ErrorRecord.Exception.Message)" "ERROR"
        Write-Log "Stack Trace: $($ErrorRecord.ScriptStackTrace)" "ERROR"
    }
}

# Check prerequisites
function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    $errors = @()
    
    # Check if running as Administrator
    if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
        $errors += "Script must be run as Administrator"
    }
    
    # Check if Plesk is installed
    if (!(Test-Path $Script:Config.PleskPath)) {
        $errors += "Plesk installation not found at $($Script:Config.PleskPath)"
    }
    
    # Check if nginx is available
    if (!(Test-Path "$($Script:Config.NginxPath)\nginx.exe")) {
        $errors += "nginx not found in Plesk installation"
    }
    
    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -lt 5) {
        $errors += "PowerShell 5.0 or higher required"
    }
    
    if ($errors.Count -gt 0) {
        foreach ($error in $errors) {
            Write-Error-Log $error
        }
        throw "Prerequisites check failed"
    }
    
    Write-Log "Prerequisites check completed successfully" "SUCCESS"
}

# Create backup
function New-ConfigBackup {
    Write-Log "Creating configuration backup..."
    
    try {
        if (!(Test-Path $BackupPath)) {
            New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
        }
        
        # Backup nginx configuration
        if (Test-Path $Script:Config.NginxPath) {
            Copy-Item -Path "$($Script:Config.NginxPath)\*" -Destination $BackupPath -Recurse -Force
        }
        
        # Backup Plesk panel configuration
        if (Test-Path "C:\Plesk\admin\conf\panel.ini") {
            Copy-Item -Path "C:\Plesk\admin\conf\panel.ini" -Destination "$BackupPath\panel.ini.bak"
        }
        
        Write-Log "Backup created successfully at: $BackupPath" "SUCCESS"
        return $true
    }
    catch {
        Write-Error-Log "Failed to create backup" $_
        return $false
    }
}

# Deploy SSL security configuration
function Set-SSLSecurityConfig {
    Write-Log "Deploying SSL security configuration..."
    
    try {
        $sslConfigContent = @"
# Modern SSL Configuration for A+ Rating
# Menschlichkeit Österreich - Production SSL/TLS Configuration

# SSL/TLS Protocols - Only modern versions
ssl_protocols TLSv1.2 TLSv1.3;

# Modern cipher suite for forward secrecy and security
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;

# Server cipher preference
ssl_prefer_server_ciphers off;

# SSL session settings for performance
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;

# OCSP stapling for certificate validation
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Perfect Forward Secrecy with DH parameters
ssl_dhparam C:/Plesk/ssl/dhparam.pem;

# Security headers for all SSL connections
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
"@
        
        $sslConfigPath = "$($Script:Config.NginxPath)\ssl_security.conf"
        $sslConfigContent | Out-File -FilePath $sslConfigPath -Encoding UTF8
        
        Write-Log "SSL security configuration deployed to: $sslConfigPath" "SUCCESS"
        return $true
    }
    catch {
        Write-Error-Log "Failed to deploy SSL configuration" $_
        return $false
    }
}

# Generate DH parameters
function New-DHParameters {
    $dhParamPath = "$($Script:Config.SSLPath)\dhparam.pem"
    
    if (Test-Path $dhParamPath) {
        Write-Log "DH parameters already exist: $dhParamPath"
        return $true
    }
    
    Write-Log "Generating DH parameters (this may take several minutes)..."
    
    try {
        if (!(Test-Path $Script:Config.SSLPath)) {
            New-Item -ItemType Directory -Path $Script:Config.SSLPath -Force | Out-Null
        }
        
        # Use OpenSSL from Plesk installation or system PATH
        $opensslPath = Get-Command openssl -ErrorAction SilentlyContinue
        if ($opensslPath) {
            $process = Start-Process -FilePath $opensslPath.Source -ArgumentList "dhparam", "-out", $dhParamPath, "2048" -Wait -PassThru -NoNewWindow
            if ($process.ExitCode -eq 0) {
                Write-Log "DH parameters generated successfully: $dhParamPath" "SUCCESS"
                return $true
            }
        } else {
            Write-Log "OpenSSL not found in PATH, using alternative method..." "WARN"
            # Alternative: Use .NET crypto APIs (simplified implementation)
            # This would require more complex implementation
            throw "OpenSSL required for DH parameter generation"
        }
    }
    catch {
        Write-Error-Log "Failed to generate DH parameters" $_
        return $false
    }
}

# Configure SSL for domains using Plesk CLI
function Set-DomainSSL {
    param([string]$Domain)
    
    Write-Log "Configuring SSL for domain: $Domain"
    
    try {
        $pleskBin = "$($Script:Config.PleskPath)\plesk.exe"
        
        # Enable SSL for domain
        $arguments = @("bin", "site", "--update-ssl", $Domain, "-ssl-certificates-location", "default")
        $process = Start-Process -FilePath $pleskBin -ArgumentList $arguments -Wait -PassThru -NoNewWindow -RedirectStandardOutput "C:\temp\plesk_output.txt" -RedirectStandardError "C:\temp\plesk_error.txt"
        
        if ($process.ExitCode -eq 0) {
            Write-Log "SSL enabled for $Domain" "SUCCESS"
            
            # Configure security headers via Plesk
            Set-SecurityHeaders $Domain
            return $true
        } else {
            $error = Get-Content "C:\temp\plesk_error.txt" -ErrorAction SilentlyContinue
            Write-Error-Log "Failed to configure SSL for $Domain. Error: $error"
            return $false
        }
    }
    catch {
        Write-Error-Log "Error configuring SSL for domain $Domain" $_
        return $false
    }
}

# Configure security headers for domain
function Set-SecurityHeaders {
    param([string]$Domain)
    
    Write-Log "Configuring security headers for: $Domain"
    
    try {
        $pleskBin = "$($Script:Config.PleskPath)\plesk.exe"
        
        # HSTS Header
        $hstsDirective = 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;'
        & $pleskBin bin site --update $Domain -nginx-directives $hstsDirective
        
        # X-Frame-Options
        $frameDirective = 'add_header X-Frame-Options "SAMEORIGIN" always;'
        & $pleskBin bin site --update $Domain -nginx-directives $frameDirective
        
        # X-Content-Type-Options
        $contentTypeDirective = 'add_header X-Content-Type-Options "nosniff" always;'
        & $pleskBin bin site --update $Domain -nginx-directives $contentTypeDirective
        
        Write-Log "Security headers configured for $Domain" "SUCCESS"
        return $true
    }
    catch {
        Write-Error-Log "Failed to configure security headers for $Domain" $_
        return $false
    }
}

# Create SSL monitoring script
function New-SSLMonitoringScript {
    Write-Log "Creating SSL monitoring script..."
    
    try {
        $monitoringScript = @"
# SSL Certificate Monitoring Script for Windows/Plesk
# Monitors SSL certificates and sends alerts

param()

`$Config = @{
    Domains = @("$($Script:Config.Domains -join '", "')")
    AlertEmail = "$($Script:Config.AlertEmail)"
    AlertThreshold = $($Script:Config.AlertThreshold)
    PleskPath = "$($Script:Config.PleskPath)"
}

function Test-SSLCertificate {
    param([string]`$Domain)
    
    try {
        # Get certificate information
        `$cert = [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {`$true}
        `$request = [System.Net.WebRequest]::Create("https://`$Domain")
        `$request.Timeout = 10000
        `$response = `$request.GetResponse()
        `$cert = `$request.ServicePoint.Certificate
        
        if (`$cert) {
            `$expiryDate = [DateTime]::Parse(`$cert.GetExpirationDateString())
            `$daysUntilExpiry = (`$expiryDate - (Get-Date)).Days
            
            Write-Output "Domain: `$Domain - Expires in `$daysUntilExpiry days (`$expiryDate)"
            
            if (`$daysUntilExpiry -lt `$Config.AlertThreshold) {
                `$subject = "SSL Certificate Alert - `$Domain"
                `$body = "SSL certificate for `$Domain expires in `$daysUntilExpiry days on `$expiryDate"
                Send-MailMessage -To `$Config.AlertEmail -Subject `$subject -Body `$body -SmtpServer "localhost"
            }
            
            return `$daysUntilExpiry
        }
    }
    catch {
        Write-Error "Error checking certificate for `$Domain`: `$_.Exception.Message"
        return -1
    }
}

# Check all domains
foreach (`$domain in `$Config.Domains) {
    Test-SSLCertificate `$domain
}
"@
        
        $scriptPath = "C:\Plesk\scripts\ssl-monitor.ps1"
        if (!(Test-Path (Split-Path $scriptPath))) {
            New-Item -ItemType Directory -Path (Split-Path $scriptPath) -Force | Out-Null
        }
        
        $monitoringScript | Out-File -FilePath $scriptPath -Encoding UTF8
        
        Write-Log "SSL monitoring script created: $scriptPath" "SUCCESS"
        
        # Create scheduled task for monitoring
        New-SSLMonitoringTask $scriptPath
        
        return $true
    }
    catch {
        Write-Error-Log "Failed to create SSL monitoring script" $_
        return $false
    }
}

# Create scheduled task for SSL monitoring
function New-SSLMonitoringTask {
    param([string]$ScriptPath)
    
    Write-Log "Creating scheduled task for SSL monitoring..."
    
    try {
        $taskName = "SSL Certificate Monitoring"
        $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File `"$ScriptPath`""
        $trigger = New-ScheduledTaskTrigger -Daily -At "06:00"
        $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
        $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
        
        # Remove existing task if it exists
        try {
            Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
        } catch {}
        
        # Register new task
        Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings
        
        Write-Log "SSL monitoring scheduled task created successfully" "SUCCESS"
        return $true
    }
    catch {
        Write-Error-Log "Failed to create scheduled task for SSL monitoring" $_
        return $false
    }
}

# Test SSL configuration
function Test-SSLConfiguration {
    Write-Log "Testing SSL configuration..."
    
    $results = @{}
    
    foreach ($domain in $Script:Config.Domains) {
        Write-Log "Testing SSL for: $domain"
        
        try {
            # Test basic SSL connection
            $request = [System.Net.WebRequest]::Create("https://$domain")
            $request.Timeout = 10000
            $response = $request.GetResponse()
            
            if ($response.StatusCode -eq [System.Net.HttpStatusCode]::OK) {
                Write-Log "✓ SSL connection to $domain successful" "SUCCESS"
                $results[$domain] = @{ Connection = $true }
            }
            
            # Test HSTS header
            $headers = $response.Headers
            if ($headers["Strict-Transport-Security"]) {
                Write-Log "✓ HSTS header present for $domain" "SUCCESS"
                $results[$domain].HSTS = $true
            } else {
                Write-Log "✗ HSTS header missing for $domain" "WARN"
                $results[$domain].HSTS = $false
            }
            
            $response.Close()
        }
        catch {
            Write-Error-Log "SSL test failed for $domain" $_
            $results[$domain] = @{ Connection = $false; Error = $_.Exception.Message }
        }
    }
    
    return $results
}

# Rollback configuration
function Restore-Configuration {
    Write-Log "Rolling back SSL configuration..." "WARN"
    
    try {
        if (Test-Path $BackupPath) {
            Copy-Item -Path "$BackupPath\*" -Destination $Script:Config.NginxPath -Recurse -Force
            
            # Restart nginx
            Restart-Service -Name "nginx" -Force
            
            Write-Log "Configuration rolled back successfully" "SUCCESS"
        } else {
            Write-Log "Backup path not found, cannot rollback" "ERROR"
        }
    }
    catch {
        Write-Error-Log "Failed to rollback configuration" $_
    }
}

# Main execution function
function Start-SSLHardening {
    Write-Log "Starting SSL/TLS Production Hardening for Windows/Plesk"
    Write-Log "=========================================================="
    
    $success = $true
    
    try {
        # Test mode check
        if ($TestMode) {
            Write-Log "Running in TEST MODE - no changes will be made" "WARN"
        }
        
        # Run deployment steps
        Test-Prerequisites
        
        if (-not $TestMode) {
            $success = $success -and (New-ConfigBackup)
            $success = $success -and (Set-SSLSecurityConfig)
            $success = $success -and (New-DHParameters)
            
            # Configure SSL for each domain
            foreach ($domain in $Script:Config.Domains) {
                $success = $success -and (Set-DomainSSL $domain)
            }
            
            $success = $success -and (New-SSLMonitoringScript)
        }
        
        # Always run tests
        $testResults = Test-SSLConfiguration
        
        if ($success -and -not $TestMode) {
            Write-Log "=========================================================="
            Write-Log "SSL/TLS Production Hardening Completed Successfully!" "SUCCESS"
            Write-Log ""
            Write-Log "Next steps:"
            Write-Log "1. Test SSL configuration: https://www.ssllabs.com/ssltest/"
            Write-Log "2. Verify HSTS preload eligibility: https://hstspreload.org/"
            Write-Log "3. Check security headers: https://securityheaders.com/"
            Write-Log "4. Monitor SSL certificates via scheduled task"
            Write-Log ""
            Write-Log "Backup created at: $BackupPath"
            Write-Log "SSL monitoring script: C:\Plesk\scripts\ssl-monitor.ps1"
        } elseif ($TestMode) {
            Write-Log "=========================================================="
            Write-Log "SSL/TLS Test Mode Completed" "SUCCESS"
            Write-Log "Configuration appears valid. Run without -TestMode to deploy."
        } else {
            Write-Log "SSL/TLS hardening encountered errors" "ERROR"
            if (-not $TestMode) {
                Restore-Configuration
            }
        }
        
        return $success
    }
    catch {
        Write-Error-Log "Critical error during SSL hardening deployment" $_
        if (-not $TestMode) {
            Restore-Configuration
        }
        return $false
    }
}

# Execute main function
try {
    $result = Start-SSLHardening
    if ($result) {
        exit 0
    } else {
        exit 1
    }
}
catch {
    Write-Error-Log "Unhandled exception in SSL hardening script" $_
    exit 1
}