# Automatisiertes Starten des SFTP-Sync-Skripts
# Findet Git Bash, prüft SSH-Verbindung und startet sync_sftp.sh

$ErrorActionPreference = "Stop"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$syncShellScript = Join-Path $scriptPath "sync_sftp.sh"

# Parameter aus sync_sftp.sh auslesen
$shellScript = Get-Content $syncShellScript
$hostLine = $shellScript | Where-Object { $_ -like 'HOST=*' }
$userLine = $shellScript | Where-Object { $_ -like 'USER=*' }
$keyLine = $shellScript | Where-Object { $_ -like 'SSH_KEY=*' }

$host_value = if ($hostLine -match 'HOST="([^"]*)"') { $matches[1] } else { $null }
$user_value = if ($userLine -match 'USER="([^"]*)"') { $matches[1] } else { $null }
$key_value = if ($keyLine -match 'SSH_KEY="([^"]*)"') { $matches[1] } else { $null }

# Umwandlung von Unix-Pfad in Windows-Pfad
if ($key_value -and $key_value.StartsWith("~")) {
    $key_value = $key_value.Replace("~", $env:USERPROFILE)
}
$key_value = $key_value.Replace("/", "\")

function FindGitBash {
    # Prüfe die üblichen Installationsorte
    $paths = @(
        "$env:ProgramFiles\Git\bin\bash.exe",
        "${env:ProgramFiles(x86)}\Git\bin\bash.exe"
    )

    foreach ($path in $paths) {
        if (Test-Path $path) {
            return $path
        }
    }

    # Fallback: Prüfe, ob bash im PATH ist
    $bashInPath = Get-Command bash -ErrorAction SilentlyContinue
    if ($bashInPath) {
        return $bashInPath.Source
    }

    return $null
}

function TestSSHConnection {
    param(
        [string]$host_value,
        [string]$user_value,
        [string]$key_value
    )

    if (-not $host_value -or -not $user_value -or -not $key_value) {
        Write-Host "⚠️ Konnte Host, User oder SSH-Key-Pfad nicht aus dem Skript lesen." -ForegroundColor Yellow
        return $false
    }

    if (-not (Test-Path $key_value)) {
        Write-Host "⚠️ SSH-Key nicht gefunden: $key_value" -ForegroundColor Yellow
        return $false
    }

    try {
        Write-Host "📡 Teste SSH-Verbindung zu $user_value@$host_value..." -ForegroundColor Cyan
        
        # Prüfe erst, ob der Host erreichbar ist
        $testConn = Test-NetConnection -ComputerName $host_value -Port 22 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if (-not $testConn.TcpTestSucceeded) {
            Write-Host "❌ Server nicht erreichbar auf Port 22 (SSH)" -ForegroundColor Red
            return $false
        }

        # Ein einfacherer Test - wir prüfen nur, ob wir uns verbinden können, kein Befehl nötig
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "ssh"
        $processInfo.Arguments = "-i `"$key_value`" -o StrictHostKeyChecking=accept-new -o BatchMode=yes -o ConnectTimeout=5 $user_value@$host_value exit"
        $processInfo.RedirectStandardError = $true
        $processInfo.RedirectStandardOutput = $true
        $processInfo.UseShellExecute = $false
        $processInfo.CreateNoWindow = $true
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $processInfo
        $process.Start() | Out-Null
        $process.WaitForExit()
        
        if ($process.ExitCode -eq 0) {
            Write-Host "✅ SSH-Verbindung erfolgreich getestet!" -ForegroundColor Green
            return $true
        } else {
            $stderr = $process.StandardError.ReadToEnd()
            Write-Host "❌ SSH-Verbindung fehlgeschlagen (Exit-Code: $($process.ExitCode))" -ForegroundColor Red
            Write-Host "   $stderr" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ SSH-Verbindung fehlgeschlagen: $_" -ForegroundColor Red
        return $false
    }
}

# BASE_DIR für Dateipfade
$BASE_DIR = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Hauptteil - Git Bash nicht mehr nötig
# $bashPath = FindGitBash
# if (-not $bashPath) {
#     Write-Host "❌ Git Bash nicht gefunden. Bitte Git für Windows installieren." -ForegroundColor Red
#     exit 1
# }

# SSH-Verbindung testen
if (-not (TestSSHConnection -host_value $host_value -user_value $user_value -key_value $key_value)) {
    Write-Host "🔑 SSH-Verbindungstest fehlgeschlagen. Mögliche Probleme:" -ForegroundColor Yellow
    Write-Host "  - Host-Key noch nicht akzeptiert (einmal manuell verbinden)" -ForegroundColor Yellow
    Write-Host "  - SSH-Key benötigt Passphrase (wird im Skript nicht unterstützt)" -ForegroundColor Yellow
    Write-Host "  - Firewall blockiert Verbindung" -ForegroundColor Yellow
    
    $continue = Read-Host "Trotzdem fortfahren? (j/n)"
    if ($continue -ne "j") {
        exit 1
    }
}

# Skript ausführen
Write-Host "🚀 Starte SFTP-Sync..." -ForegroundColor Cyan

# Statt das Bash-Skript direkt auszuführen, nutzen wir SFTP direkt aus PowerShell
try {
    # Parameter aus dem Shell-Script verwenden
    $batchCommands = @"
lcd $BASE_DIR\menschlichkeit-oesterreich-monorepo\httpdocs
cd /var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs
get -r index.php
get -r wp-admin
get -r wp-includes
get -r wp-config.php
get -r wp-content/themes
get -r wp-content/plugins
"@

    Write-Host "→ Pull: Hauptdomain (WordPress) nach $BASE_DIR\menschlichkeit-oesterreich-monorepo\httpdocs" -ForegroundColor Cyan
    
    # Verzeichnis erstellen falls nicht vorhanden
    New-Item -Path "$BASE_DIR\menschlichkeit-oesterreich-monorepo\httpdocs" -ItemType Directory -Force | Out-Null
    
    # SFTP-Batch direkt ausführen
    $batchFile = Join-Path $env:TEMP "sftp_commands.txt"
    $batchCommands | Set-Content -Path $batchFile -Encoding UTF8
    
    # SFTP direkt aus PowerShell aufrufen
    $sftpArgs = @(
        "-i", "`"$key_value`"",
        "-b", "`"$batchFile`"", 
        "$user_value@$host_value"
    )
    
    Write-Host "sftp $sftpArgs" -ForegroundColor DarkGray
    & sftp $sftpArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Sync erfolgreich abgeschlossen!" -ForegroundColor Green
    } else {
        Write-Host "❌ Sync fehlgeschlagen mit Exit-Code: $LASTEXITCODE" -ForegroundColor Red
    }
    
    # Temp-Datei aufräumen
    Remove-Item -Path $batchFile -Force -ErrorAction SilentlyContinue
}
catch {
    Write-Host "❌ Fehler beim Ausführen des SFTP-Syncs: $_" -ForegroundColor Red
}