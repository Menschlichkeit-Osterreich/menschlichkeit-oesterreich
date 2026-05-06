param(
    [string]$BackupRoot = "${PSScriptRoot}\..\config-templates\vscode-sync",
    [switch]$Restore,
    [string]$Snapshot = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$workspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$workspaceVscode = Join-Path $workspaceRoot ".vscode"

function Initialize-BackupDirectory {
    if (-not (Test-Path $BackupRoot)) {
        New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
    }
    if ($Restore) {
        if (-not $Snapshot) {
            throw "Bitte gib mit -Snapshot den Ordner an, der wiederhergestellt werden soll."
        }
        $restorePath = Join-Path $BackupRoot $Snapshot
        if (-not (Test-Path $restorePath)) {
            throw "Snapshot '$Snapshot' wurde unter $BackupRoot nicht gefunden."
        }
        return $restorePath
    }
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $target = Join-Path $BackupRoot $timestamp
    New-Item -ItemType Directory -Path $target -Force | Out-Null
    return $target
}

function Backup-VSCode {
    param([string]$target)

    Write-Host "Sichere VS Code Workspace- und User-Konfiguration nach $target" -ForegroundColor Cyan

    if (Test-Path $workspaceVscode) {
        Copy-Item $workspaceVscode (Join-Path $target "workspace") -Recurse -Force
    }

    $userDir = Join-Path $env:APPDATA "Code\User"
    if (Test-Path $userDir) {
        foreach ($file in @("settings.json", "keybindings.json", "locale.json")) {
            $source = Join-Path $userDir $file
            if (Test-Path $source) {
                Copy-Item $source (Join-Path $target $file) -Force
            }
        }
        $snippetSource = Join-Path $userDir "snippets"
        if (Test-Path $snippetSource) {
            Copy-Item $snippetSource (Join-Path $target "snippets") -Recurse -Force
        }
    }

    $extensionsFile = Join-Path $target "extensions.txt"
    $codeCli = Get-Command code-insiders -ErrorAction SilentlyContinue
    if (-not $codeCli) {
        $codeCli = Get-Command code -ErrorAction SilentlyContinue
    }
    if ($codeCli) {
        & $codeCli.Source --list-extensions | Sort-Object | Set-Content -Path $extensionsFile -Encoding utf8NoBOM
    }
    else {
        "VS Code CLI nicht gefunden. Installiere 'code' im PATH und starte das Script erneut." | Set-Content -Path $extensionsFile -Encoding utf8NoBOM
    }
}

function Restore-VSCode {
    param([string]$snapshotPath)

    Write-Host "Stelle VS Code Einstellungen aus $snapshotPath wieder her" -ForegroundColor Yellow

    if (Test-Path (Join-Path $snapshotPath "workspace")) {
        Copy-Item (Join-Path $snapshotPath "workspace" "*") $workspaceVscode -Recurse -Force
    }

    $userDir = Join-Path $env:APPDATA "Code\User"
    if (-not (Test-Path $userDir)) {
        New-Item -ItemType Directory -Path $userDir -Force | Out-Null
    }

    foreach ($file in @("settings.json", "keybindings.json", "locale.json")) {
        $source = Join-Path $snapshotPath $file
        if (Test-Path $source) {
            Copy-Item $source $userDir -Force
        }
    }

    $snippetSource = Join-Path $snapshotPath "snippets"
    if (Test-Path $snippetSource) {
        Copy-Item $snippetSource (Join-Path $userDir "snippets") -Recurse -Force
    }

    $extensionsList = Join-Path $snapshotPath "extensions.txt"
    if (Test-Path $extensionsList) {
        Write-Host "Erweiterungen aus $extensionsList installieren (optional):" -ForegroundColor Green
        Get-Content $extensionsList | ForEach-Object { "  code --install-extension $_" }
    }
}

$targetPath = Initialize-BackupDirectory
if ($Restore) {
    Restore-VSCode -snapshotPath $targetPath
}
else {
    Backup-VSCode -target $targetPath
}
