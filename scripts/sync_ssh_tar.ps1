# Sync via SSH + tar (ohne SFTP)
# Vorteil: Umgeht SFTP-Subsystem, schnell und selektiv

$ErrorActionPreference = "Stop"

# Serverdaten
$SSH_HOST = "5.183.217.146"
$SSH_USER = "dmpl20230054"
$SSH_KEY = "C:\Users\schul\.ssh\id_ed25519"

# Remote-Pfade (Plesk-Chroot)
$REMOTE_MAIN = "/httpdocs"
$REMOTE_API = "/api.menschlichkeit-oesterreich.at"
$REMOTE_CRM = "/crm.menschlichkeit-oesterreich.at"

# Lokale Ziele
$BASE_DIR = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$REPO = Join-Path $BASE_DIR "menschlichkeit-oesterreich-monorepo"
$LOCAL_MAIN = Join-Path $REPO "httpdocs"
$LOCAL_API = Join-Path $REPO "api.menschlichkeit-oesterreich.at"
$LOCAL_CRM = Join-Path $REPO "crm.menschlichkeit-oesterreich.at"

New-Item -ItemType Directory -Force -Path $LOCAL_MAIN, $LOCAL_API, $LOCAL_CRM | Out-Null

function Get-RemoteTestItem {
    param(
        [string]$RemoteDir
    )

    $probeCmdParts = @(
        "set -e",
        "cd '$RemoteDir'",
        'for f in index.php configuration.php README.md readme.md public/index.php web/index.php; do if [ -e "$f" ]; then echo "$f"; exit 0; fi; done',
        'ls -p | grep -v / | head -n 1 || true'
    )
    $probeScript = ($probeCmdParts -join '; ')

    $sshInfo = New-Object System.Diagnostics.ProcessStartInfo
    $sshInfo.FileName = 'ssh'
    $sshInfo.UseShellExecute = $false
    $sshInfo.RedirectStandardOutput = $true
    $sshInfo.RedirectStandardError = $true
    $sshInfo.CreateNoWindow = $true
    $sshInfo.ArgumentList.Add('-i') | Out-Null
    $sshInfo.ArgumentList.Add($SSH_KEY) | Out-Null
    $sshInfo.ArgumentList.Add('-o') | Out-Null
    $sshInfo.ArgumentList.Add('RemoteCommand=none') | Out-Null
    $sshInfo.ArgumentList.Add('-o') | Out-Null
    $sshInfo.ArgumentList.Add('BatchMode=yes') | Out-Null
    $sshInfo.ArgumentList.Add('-o') | Out-Null
    $sshInfo.ArgumentList.Add('NumberOfPasswordPrompts=0') | Out-Null
    $sshInfo.ArgumentList.Add('-o') | Out-Null
    $sshInfo.ArgumentList.Add('ConnectTimeout=10') | Out-Null
    $sshInfo.ArgumentList.Add('-T') | Out-Null
    $sshInfo.ArgumentList.Add("$SSH_USER@$SSH_HOST") | Out-Null
    $sshInfo.ArgumentList.Add('bash') | Out-Null
    $sshInfo.ArgumentList.Add('-lc') | Out-Null
    $sshInfo.ArgumentList.Add($probeScript) | Out-Null

    $proc = [System.Diagnostics.Process]::Start($sshInfo)
    $out = $proc.StandardOutput.ReadToEnd().Trim()
    $err = $proc.StandardError.ReadToEnd()
    $proc.WaitForExit()

    if ($proc.ExitCode -ne 0) {
        Write-Host "⚠️ Probe im Remote-Verzeichnis fehlgeschlagen: $err" -ForegroundColor Yellow
        return $null
    }
    if ([string]::IsNullOrWhiteSpace($out)) { return $null }
    return $out
}

function Pull-Tar {
    param(
        [string]$RemoteDir,
        [string]$LocalDir,
        [string]$Label,
        [string[]]$Items,
        [string[]]$Excludes = @()
    )

    Write-Host "→ Pull: $Label nach $LocalDir" -ForegroundColor Cyan
    Write-Host "   ⌛ Übertrage Archive-Stream (kann je nach Größe dauern)" -ForegroundColor DarkCyan

    $excludeArgs = @()
    foreach ($ex in $Excludes) { if ($ex) { $excludeArgs += "--exclude=$ex" } }
    $remoteCmdItems = @("tar", "-C", $RemoteDir, "-czf", "-") + $excludeArgs + $Items

    # Hinweis: Unter Windows 10/11 ist tar (bsdtar) Teil von Windows
    $sshInfo = New-Object System.Diagnostics.ProcessStartInfo
    $sshInfo.FileName = "ssh"
    $sshInfo.UseShellExecute = $false
    $sshInfo.RedirectStandardOutput = $true
    $sshInfo.RedirectStandardError = $true
    $sshInfo.CreateNoWindow = $true
    $sshInfo.ArgumentList.Add("-i") | Out-Null
    $sshInfo.ArgumentList.Add($SSH_KEY) | Out-Null
    # Wichtig: Falls in ~/.ssh/config ein RemoteCommand gesetzt ist (z.B. durch VS Code), muss es überschrieben werden
    $sshInfo.ArgumentList.Add("-o") | Out-Null
    $sshInfo.ArgumentList.Add("RemoteCommand=none") | Out-Null
    $sshInfo.ArgumentList.Add("-o") | Out-Null
    $sshInfo.ArgumentList.Add("BatchMode=yes") | Out-Null
    $sshInfo.ArgumentList.Add("-o") | Out-Null
    $sshInfo.ArgumentList.Add("NumberOfPasswordPrompts=0") | Out-Null
    $sshInfo.ArgumentList.Add("-o") | Out-Null
    $sshInfo.ArgumentList.Add("ConnectTimeout=10") | Out-Null
    $sshInfo.ArgumentList.Add("-o") | Out-Null
    $sshInfo.ArgumentList.Add("ServerAliveInterval=15") | Out-Null
    $sshInfo.ArgumentList.Add("-o") | Out-Null
    $sshInfo.ArgumentList.Add("ServerAliveCountMax=4") | Out-Null
    $sshInfo.ArgumentList.Add("-T") | Out-Null
    $sshInfo.ArgumentList.Add("$SSH_USER@$SSH_HOST") | Out-Null
    foreach ($arg in $remoteCmdItems) { $sshInfo.ArgumentList.Add($arg) | Out-Null }

    $tarInfo = New-Object System.Diagnostics.ProcessStartInfo
    $tarInfo.FileName = "tar"
    $tarInfo.UseShellExecute = $false
    $tarInfo.RedirectStandardInput = $true
    $tarInfo.RedirectStandardError = $true
    $tarInfo.CreateNoWindow = $true
    $tarInfo.ArgumentList.Add("-xzf") | Out-Null
    $tarInfo.ArgumentList.Add("-") | Out-Null
    $tarInfo.ArgumentList.Add("-C") | Out-Null
    $tarInfo.ArgumentList.Add($LocalDir) | Out-Null

    $sshProc = [System.Diagnostics.Process]::Start($sshInfo)
    $tarProc = [System.Diagnostics.Process]::Start($tarInfo)

    $sshProc.StandardOutput.BaseStream.CopyTo($tarProc.StandardInput.BaseStream)
    $tarProc.StandardInput.Close()

    $sshProc.WaitForExit(); $tarProc.WaitForExit()

    if ($sshProc.ExitCode -ne 0 -or $tarProc.ExitCode -ne 0) {
        $errSsh = $sshProc.StandardError.ReadToEnd()
        $errTar = $tarProc.StandardError.ReadToEnd()
        Write-Host "❌ Fehler bei $Label" -ForegroundColor Red
        if ($errSsh) { Write-Host $errSsh -ForegroundColor Yellow }
        if ($errTar) { Write-Host $errTar -ForegroundColor Yellow }
    } else {
        Write-Host "✅ $Label synchronisiert" -ForegroundColor Green
    }
}

# TEST_ONLY: Nur kleine Dateien ziehen, um Pfade zu verifizieren
if ($env:TEST_ONLY -eq '1') {
    Pull-Tar -RemoteDir $REMOTE_MAIN -LocalDir $LOCAL_MAIN -Label "WordPress" -Items @(
        "index.php",
        "wp-config.php"
    )
    Pull-Tar -RemoteDir $REMOTE_API -LocalDir $LOCAL_API -Label "API" -Items @(
        "composer.json"
    )
    $crmTestItem = Get-RemoteTestItem -RemoteDir $REMOTE_CRM
    if ($crmTestItem) {
        Pull-Tar -RemoteDir $REMOTE_CRM -LocalDir $LOCAL_CRM -Label "CRM" -Items @($crmTestItem)
    } else {
        Write-Host "⚠️ Kein geeignetes Test-File im CRM-Verzeichnis gefunden – überspringe CRM im TEST_ONLY-Modus." -ForegroundColor Yellow
    }
}
else {
    # WordPress (ohne uploads)
    Pull-Tar -RemoteDir $REMOTE_MAIN -LocalDir $LOCAL_MAIN -Label "WordPress" -Items @(
        "index.php",
        "wp-admin",
        "wp-includes",
        "wp-config.php",
        "wp-content/themes",
        "wp-content/plugins"
    )

    # API (Laravel)
    Pull-Tar -RemoteDir $REMOTE_API -LocalDir $LOCAL_API -Label "API" -Items @(
        "app","bootstrap","config","database","public","resources","routes","composer.json"
    )

    # CRM: Gesamtes Verzeichnis mit Excludes (robuster bei unbekannter Struktur)
    Pull-Tar -RemoteDir $REMOTE_CRM -LocalDir $LOCAL_CRM -Label "CRM" -Items @(
        "."
    ) -Excludes @(
        "node_modules",
        "vendor",
        "cache",
        "tmp",
        "*.log",
        "*.zip",
        "wp-content/uploads",
        "uploads",
        "files",
        "images/cache"
    )
}

Write-Host "✓ SSH+tar Sync fertig." -ForegroundColor Green
