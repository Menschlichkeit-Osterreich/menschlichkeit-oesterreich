#!/usr/bin/env pwsh
# Plesk Deployment Script für VS Code SFTP Extension
# Verwendet die .vscode/sftp.json Konfiguration für sicheren Transfer

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("deploy", "sync", "status", "help")]
    [string]$Action = "help",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Plesk Deployment Script" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

function Show-Help {
    Write-Host @"
Verwendung: .\scripts\plesk-deploy.ps1 [Action] [Options]

Aktionen:
  deploy    - Lokale Änderungen zu Plesk hochladen
  sync      - Vollständige Synchronisation mit Plesk
  status    - Deployment-Status anzeigen
  help      - Diese Hilfe anzeigen

Optionen:
  -Force    - Überschreibt Sicherheitsabfragen

Beispiele:
  .\scripts\plesk-deploy.ps1 deploy
  .\scripts\plesk-deploy.ps1 sync -Force
  
Hinweis: Nutzt VS Code SFTP Extension für sicheren Transfer.
"@ -ForegroundColor Yellow
}

function Test-SftpConfig {
    $sftpConfigPath = ".vscode/sftp.json"
    
    if (-not (Test-Path $sftpConfigPath)) {
        Write-Error "SFTP-Konfiguration nicht gefunden: $sftpConfigPath"
        return $false
    }
    
    try {
        $sftpConfig = Get-Content $sftpConfigPath | ConvertFrom-Json
        Write-Host "✅ SFTP-Konfiguration gefunden:" -ForegroundColor Green
        Write-Host "   Host: $($sftpConfig.host)" -ForegroundColor Gray
        Write-Host "   User: $($sftpConfig.username)" -ForegroundColor Gray
        Write-Host "   Port: $($sftpConfig.port)" -ForegroundColor Gray
        return $true
    }
    catch {
        Write-Error "Fehler beim Lesen der SFTP-Konfiguration: $_"
        return $false
    }
}

function Start-PlesPlDeploy {
    Write-Host "📤 Starte Plesk-Deployment..." -ForegroundColor Yellow
    
    # Prüfe ob Änderungen vorliegen
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "⚠️ Ungespeicherte Git-Änderungen gefunden:" -ForegroundColor Yellow
        $gitStatus | Write-Host -ForegroundColor Gray
        
        if (-not $Force) {
            $response = Read-Host "Trotzdem fortfahren? (y/N)"
            if ($response -ne "y") {
                Write-Host "❌ Deployment abgebrochen." -ForegroundColor Red
                return $false
            }
        }
    }
    
    Write-Host "🔄 Nutze VS Code SFTP Extension für sicheren Upload..." -ForegroundColor Green
    Write-Host @"
    
📋 Manuelle Schritte für Deployment:
1. Öffnen Sie VS Code Command Palette (Ctrl+Shift+P)
2. Führen Sie 'SFTP: Sync Local -> Remote' aus
3. Wählen Sie die Dateien aus, die hochgeladen werden sollen
4. Bestätigen Sie den Upload

Alternativ: Rechtsklick auf Ordner -> 'Upload Folder'
"@ -ForegroundColor Cyan
    
    return $true
}

function Show-DeploymentStatus {
    Write-Host "📊 Deployment-Status" -ForegroundColor Cyan
    Write-Host "===================" -ForegroundColor Cyan
    
    # Git Status
    Write-Host "`n📁 Git Status:" -ForegroundColor Yellow
    git status --short
    
    # Letzte Commits
    Write-Host "`n📝 Letzte Commits:" -ForegroundColor Yellow
    git log --oneline -5
    
    # SFTP-Konfiguration
    Write-Host "`n🔧 SFTP-Konfiguration:" -ForegroundColor Yellow
    if (Test-Path ".vscode/sftp.json") {
        $sftpConfig = Get-Content ".vscode/sftp.json" | ConvertFrom-Json
        Write-Host "   ✅ Konfiguriert für: $($sftpConfig.host)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Keine SFTP-Konfiguration gefunden" -ForegroundColor Red
    }
}

# Hauptlogik
switch ($Action) {
    "deploy" {
        if (Test-SftpConfig) {
            Start-PleskDeploy
        }
    }
    
    "sync" {
        if (Test-SftpConfig) {
            Write-Host "🔄 Vollständige Synchronisation wird vorbereitet..." -ForegroundColor Yellow
            Start-PleskDeploy
        }
    }
    
    "status" {
        Show-DeploymentStatus
    }
    
    "help" {
        Show-Help
    }
    
    default {
        Write-Host "❌ Unbekannte Aktion: $Action" -ForegroundColor Red
        Show-Help
    }
}