<#
.SYNOPSIS
    Konfiguriert GPG-Agent für 12h Passphrase-Cache (Windows)

.DESCRIPTION
    Dieses Skript:
    - Erstellt ~/.gnupg/gpg-agent.conf mit 12h Cache-Einstellungen
    - Startet gpg-agent neu
    - Testet die Konfiguration mit einem signierten Test-Commit

    Passphrase muss nur 1× pro Arbeitstag eingegeben werden.

.PARAMETER KeyId
    GPG Key ID (optional, aus .env oder Git-Config)

.EXAMPLE
    .\Setup-GPGCache.ps1

.EXAMPLE
    .\Setup-GPGCache.ps1 -KeyId 78CCAE5641193DA3

.NOTES
    Version: 1.0.0
    Author: Menschlichkeit Österreich
    Datum: 2025-10-18

.LINK
    .github/instructions/gpg-passphrase-cache.instructions.md
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$KeyId = $null
)

# Farben für Output
function Write-Info($message) {
    Write-Host "ℹ️  $message" -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Write-ErrorMsg($message) {
    Write-Host "❌ $message" -ForegroundColor Red
}

# Banner
Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "GPG-Agent 12h Cache Setup (Windows)" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# 1. GPG-Pfad ermitteln
Write-Info "Ermittle GPG-Installation..."

$gpgPaths = @(
    "C:\Program Files\Git\usr\bin\gpg.exe",
    "C:\Program Files (x86)\GnuPG\bin\gpg.exe",
    "C:\Program Files\GnuPG\bin\gpg.exe",
    "$env:LOCALAPPDATA\Programs\GnuPG\bin\gpg.exe"
)

$gpgPath = $null
foreach ($path in $gpgPaths) {
    if (Test-Path $path) {
        $gpgPath = $path
        break
    }
}

if (-not $gpgPath) {
    Write-ErrorMsg "GPG nicht gefunden!"
    Write-Warning "Installiere GPG:"
    Write-Host "  winget install --id GnuPG.Gpg4win" -ForegroundColor Gray
    Write-Host "  oder: winget install --id GnuPG.GnuPG" -ForegroundColor Gray
    exit 1
}

Write-Success "GPG gefunden: $gpgPath"

# gpgconf-Pfad (gleicher Ordner wie gpg.exe)
$gpgconfPath = Join-Path (Split-Path $gpgPath) "gpgconf.exe"
if (-not (Test-Path $gpgconfPath)) {
    Write-ErrorMsg "gpgconf.exe nicht gefunden in: $(Split-Path $gpgPath)"
    exit 1
}

# 2. GnuPG-Verzeichnis erstellen
Write-Info "Erstelle ~/.gnupg Verzeichnis..."

$gnupgDir = Join-Path $env:USERPROFILE ".gnupg"
if (!(Test-Path $gnupgDir)) {
    New-Item -ItemType Directory -Path $gnupgDir -Force | Out-Null
    Write-Success "Verzeichnis erstellt: $gnupgDir"
} else {
    Write-Info "Verzeichnis existiert bereits: $gnupgDir"
}

# 3. gpg-agent.conf erstellen
Write-Info "Erstelle gpg-agent.conf mit 12h Cache..."

$agentConfigPath = Join-Path $gnupgDir "gpg-agent.conf"
$configContent = @"
# GPG-Agent Konfiguration – Passphrase Cache auf 12h
# Generiert: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Cache-Dauer: 12 Stunden (43 200 Sekunden)
default-cache-ttl 43200
max-cache-ttl 43200

# Loopback Pinentry für Skripte/CI
allow-loopback-pinentry
"@

Set-Content -Path $agentConfigPath -Value $configContent -Encoding UTF8
Write-Success "Konfiguration erstellt: $agentConfigPath"

# 4. gpg-agent neu starten
Write-Info "Starte gpg-agent neu..."

try {
    # Agent beenden
    & $gpgconfPath --kill gpg-agent 2>&1 | Out-Null
    Start-Sleep -Seconds 1

    # Agent starten
    & $gpgconfPath --launch gpg-agent 2>&1 | Out-Null
    Start-Sleep -Seconds 1

    Write-Success "gpg-agent neu gestartet"
} catch {
    Write-Warning "Fehler beim Neustart: $_"
    Write-Info "Versuche fortzufahren..."
}

# 5. Key ID ermitteln (falls nicht angegeben)
if (-not $KeyId) {
    Write-Info "Ermittle GPG Key ID aus Git-Config..."

    try {
        $KeyId = git config --global user.signingkey
        if ($KeyId) {
            Write-Success "Key ID aus Git-Config: $KeyId"
        }
    } catch {
        # Fallback: Aus .env lesen
        $envPath = Join-Path (Get-Location) ".env"
        if (Test-Path $envPath) {
            Write-Info "Lese Key ID aus .env..."
            $envContent = Get-Content $envPath -Raw
            if ($envContent -match "GPG_KEY_ID=([A-F0-9]+)") {
                $KeyId = $matches[1]
                Write-Success "Key ID aus .env: $KeyId"
            }
        }
    }
}

if (-not $KeyId) {
    Write-Warning "Keine Key ID gefunden!"
    Write-Info "Keys auflisten:"
    & $gpgPath --list-secret-keys --keyid-format=long
    Write-Host ""
    Write-Info "Setze Key ID in Git-Config:"
    Write-Host "  git config --global user.signingkey <KEY_ID>" -ForegroundColor Gray
    exit 0
}

# 6. Git-Config aktualisieren
Write-Info "Konfiguriere Git für GPG-Signing..."

git config --global user.signingkey $KeyId
git config --global commit.gpgsign true
git config --global gpg.program $gpgPath

Write-Success "Git-Config aktualisiert"

# 7. Test
Write-Info "Teste GPG-Signing..."
Write-Warning "Bei der nächsten Passphrase-Abfrage: Eingeben → Cache für 12h aktiv!"

try {
    # Test-Commit (empty)
    git commit -S --allow-empty -m "test: GPG signing with 12h cache" 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Test erfolgreich! Passphrase ist jetzt 12h gecacht."
    } else {
        Write-Warning "Test-Commit fehlgeschlagen (Exit Code: $LASTEXITCODE)"
        Write-Info "Mögliche Ursachen:"
        Write-Host "  - Passphrase wurde nicht eingegeben" -ForegroundColor Gray
        Write-Host "  - Key ID stimmt nicht" -ForegroundColor Gray
        Write-Host "  - GPG-Agent läuft nicht" -ForegroundColor Gray
    }
} catch {
    Write-Warning "Test-Commit konnte nicht ausgeführt werden: $_"
}

# 8. Zusammenfassung
Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Setup abgeschlossen!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Info "Konfiguration:"
Write-Host "  Config-Datei:      $agentConfigPath" -ForegroundColor Gray
Write-Host "  Cache-Dauer:       12 Stunden (43 200 Sekunden)" -ForegroundColor Gray
Write-Host "  GPG-Programm:      $gpgPath" -ForegroundColor Gray
Write-Host "  Key ID:            $KeyId" -ForegroundColor Gray
Write-Host ""
Write-Info "Nächste Schritte:"
Write-Host "  1. Passphrase wird beim nächsten Commit abgefragt" -ForegroundColor Gray
Write-Host "  2. Danach 12h kein erneutes Abfragen" -ForegroundColor Gray
Write-Host "  3. Test: git commit -S --allow-empty -m 'test'" -ForegroundColor Gray
Write-Host ""
Write-Success "✨ Fertig! Viel Erfolg beim Entwickeln!"
Write-Host ""
