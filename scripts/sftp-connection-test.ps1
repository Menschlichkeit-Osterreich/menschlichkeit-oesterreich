# 🔍 SFTP-VERBINDUNGSTEST für digimagical.com
# Test-Script für Plesk SFTP-Konfiguration

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("basic", "advanced", "vscode", "all")]
    [string]$TestType = "basic"
)

# =============================================================================
# 📋 KONFIGURATION
# =============================================================================
$SftpConfig = @{
    Host = "digimagical.com"
    Port = 22
    Username = "dmpl20230054"
    RemotePath = "/var/www/vhosts/menschlichkeit-oesterreich.at"
    Timeout = 10
}

# =============================================================================
# 🔧 FUNCTIONS
# =============================================================================

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n" -NoNewline
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host "🔍 $Title" -ForegroundColor Yellow
    Write-Host "=" * 60 -ForegroundColor Cyan
}

function Test-SSHConnection {
    Write-TestHeader "SSH-VERBINDUNGSTEST"
    
    Write-Host "🌐 Teste Verbindung zu $($SftpConfig.Host):$($SftpConfig.Port)..." -ForegroundColor Cyan
    
    try {
        # Test mit PowerShell SSH (falls verfügbar)
        $result = Test-NetConnection -ComputerName $SftpConfig.Host -Port $SftpConfig.Port -InformationLevel Quiet
        
        if ($result) {
            Write-Host "✅ SSH-Port $($SftpConfig.Port) ist erreichbar!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ SSH-Port $($SftpConfig.Port) ist nicht erreichbar!" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "⚠️  Verbindungstest fehlgeschlagen: $($_.Exception.Message)" -ForegroundColor Yellow
        return $false
    }
}

function Test-SFTPAuthentication {
    Write-TestHeader "SFTP-AUTHENTIFIZIERUNGSTEST"
    
    Write-Host "👤 Teste Anmeldung für Benutzer: $($SftpConfig.Username)" -ForegroundColor Cyan
    
    # Erstelle temporäres SFTP-Test-Script
    $sftpScript = @"
ls
pwd
exit
"@
    
    $scriptPath = Join-Path $env:TEMP "sftp_test.txt"
    $sftpScript | Out-File -FilePath $scriptPath -Encoding ASCII
    
    try {
        Write-Host "🔐 Führe SFTP-Verbindungstest aus..." -ForegroundColor Gray
        Write-Host "   📝 Bitte geben Sie Ihr Plesk-Passwort ein, wenn gefragt." -ForegroundColor Yellow
        
        # SFTP-Verbindungstest
        $sftpCommand = "sftp -o ConnectTimeout=$($SftpConfig.Timeout) -P $($SftpConfig.Port) $($SftpConfig.Username)@$($SftpConfig.Host) < `"$scriptPath`""
        
        Write-Host "🚀 Führe aus: sftp -P $($SftpConfig.Port) $($SftpConfig.Username)@$($SftpConfig.Host)" -ForegroundColor Gray
        Write-Host "   ⚠️  Falls Sie nach einem Passwort gefragt werden, geben Sie Ihr Plesk-Passwort ein." -ForegroundColor Yellow
        
        # Hinweis für manuelle Eingabe
        Write-Host "`n🔧 MANUELLER TEST ERFORDERLICH:" -ForegroundColor Yellow
        Write-Host "   Öffnen Sie ein neues PowerShell-Fenster und führen Sie aus:" -ForegroundColor Gray
        Write-Host "   sftp -P 22 dmpl20230054@digimagical.com" -ForegroundColor White
        Write-Host "   Dann testen Sie: ls, pwd, cd /var/www/vhosts" -ForegroundColor Gray
        
        return $null  # Manueller Test erforderlich
    } catch {
        Write-Host "❌ SFTP-Test fehlgeschlagen: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    } finally {
        # Cleanup
        if (Test-Path $scriptPath) {
            Remove-Item $scriptPath -Force
        }
    }
}

function Test-VSCodeSFTPExtension {
    Write-TestHeader "VS CODE SFTP EXTENSION TEST"
    
    $sftpConfigPath = Join-Path $PSScriptRoot ".." ".vscode" "sftp.json"
    
    if (Test-Path $sftpConfigPath) {
        Write-Host "✅ SFTP-Konfiguration gefunden: .vscode/sftp.json" -ForegroundColor Green
        
        try {
            $config = Get-Content $sftpConfigPath | ConvertFrom-Json
            
            Write-Host "📋 Konfiguration:" -ForegroundColor Cyan
            Write-Host "   🌐 Host: $($config.host)" -ForegroundColor Gray
            Write-Host "   👤 User: $($config.username)" -ForegroundColor Gray
            Write-Host "   📂 Remote: $($config.remotePath)" -ForegroundColor Gray
            Write-Host "   🔌 Port: $($config.port)" -ForegroundColor Gray
            
            if ($config.profiles) {
                Write-Host "   🎯 Profile verfügbar:" -ForegroundColor Gray
                foreach ($profile in $config.profiles.PSObject.Properties) {
                    Write-Host "      - $($profile.Name): $($profile.Value.remotePath)" -ForegroundColor Gray
                }
            }
            
            Write-Host "`n🚀 VS Code SFTP Commands zum Testen:" -ForegroundColor Yellow
            Write-Host "   1. Ctrl+Shift+P → 'SFTP: Open SSH Terminal'" -ForegroundColor White
            Write-Host "   2. Ctrl+Shift+P → 'SFTP: List Folder'" -ForegroundColor White
            Write-Host "   3. Ctrl+Shift+P → 'SFTP: Download Folder'" -ForegroundColor White
            
            return $true
        } catch {
            Write-Host "❌ Fehler beim Lesen der SFTP-Konfiguration: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "❌ SFTP-Konfiguration nicht gefunden: $sftpConfigPath" -ForegroundColor Red
        return $false
    }
}

function Test-RemoteDirectories {
    Write-TestHeader "REMOTE-VERZEICHNIS STRUKTUR TEST"
    
    Write-Host "📂 Zu testende Verzeichnisse:" -ForegroundColor Cyan
    
    $directories = @(
        "/var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs",
        "/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/api/httpdocs", 
        "/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/crm/httpdocs",
        "/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/games/httpdocs"
    )
    
    foreach ($dir in $directories) {
        Write-Host "   📁 $dir" -ForegroundColor Gray
    }
    
    Write-Host "`n🔧 MANUELLER REMOTE-TEST:" -ForegroundColor Yellow
    Write-Host "   Nach erfolgreicher SFTP-Verbindung testen Sie:" -ForegroundColor Gray
    Write-Host "   ls -la /var/www/vhosts/menschlichkeit-oesterreich.at/" -ForegroundColor White
    Write-Host "   cd httpdocs && ls -la" -ForegroundColor White
    Write-Host "   cd ../subdomains && ls -la" -ForegroundColor White
}

function Show-TroubleshootingGuide {
    Write-TestHeader "TROUBLESHOOTING GUIDE"
    
    Write-Host "🛠️  Häufige Probleme und Lösungen:" -ForegroundColor Yellow
    
    Write-Host "`n❌ Problem: 'Connection refused'" -ForegroundColor Red
    Write-Host "   ✅ Lösung: Firewall/Port 22 prüfen" -ForegroundColor Green
    Write-Host "   🔧 Test: telnet digimagical.com 22" -ForegroundColor Gray
    
    Write-Host "`n❌ Problem: 'Authentication failed'" -ForegroundColor Red  
    Write-Host "   ✅ Lösung: Username/Passwort prüfen" -ForegroundColor Green
    Write-Host "   🔧 Username: dmpl20230054" -ForegroundColor Gray
    Write-Host "   🔧 Passwort: Ihr Plesk-Panel Passwort" -ForegroundColor Gray
    
    Write-Host "`n❌ Problem: 'Permission denied'" -ForegroundColor Red
    Write-Host "   ✅ Lösung: SSH-Zugang in Plesk aktivieren" -ForegroundColor Green
    Write-Host "   🔧 Plesk → Web Hosting Access → SSH Access: Enable" -ForegroundColor Gray
    
    Write-Host "`n❌ Problem: 'Directory not found'" -ForegroundColor Red
    Write-Host "   ✅ Lösung: Remote-Pfade prüfen" -ForegroundColor Green
    Write-Host "   🔧 Start mit: cd /var/www/vhosts" -ForegroundColor Gray
    
    Write-Host "`n🔐 SSH-KEY SETUP (Empfohlen):" -ForegroundColor Yellow
    Write-Host "   1. ssh-keygen -t rsa -b 4096 -C 'your-email'" -ForegroundColor Gray
    Write-Host "   2. Öffentlichen Key zu Plesk SSH Keys hinzufügen" -ForegroundColor Gray
    Write-Host "   3. SFTP-Config um privateKeyPath erweitern" -ForegroundColor Gray
}

# =============================================================================
# 🎯 MAIN EXECUTION
# =============================================================================

Write-Host "🚀 SFTP-VERBINDUNGSTEST für digimagical.com" -ForegroundColor Green
Write-Host "Ziel: dmpl20230054@digimagical.com:22" -ForegroundColor Gray

switch ($TestType) {
    "basic" {
        Test-SSHConnection
        Test-VSCodeSFTPExtension
        Show-TroubleshootingGuide
    }
    
    "advanced" {
        Test-SSHConnection
        Test-SFTPAuthentication  
        Test-RemoteDirectories
    }
    
    "vscode" {
        Test-VSCodeSFTPExtension
    }
    
    "all" {
        Test-SSHConnection
        Test-SFTPAuthentication
        Test-VSCodeSFTPExtension
        Test-RemoteDirectories
        Show-TroubleshootingGuide
    }
}

Write-Host "`n✅ SFTP-Test abgeschlossen!" -ForegroundColor Green
Write-Host "📋 Verwendung: .\sftp-connection-test.ps1 [basic|advanced|vscode|all]" -ForegroundColor Gray