#!/usr/bin/env pwsh
# PR-Validierung für merge-bot
# Umgebung: stage
# Zweck: Automatisierte Secrets-Verwaltung & Konfliktanalyse vor Merge

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('dev', 'stage', 'prod')]
    [string]$Environment = 'stage',
    
    [Parameter(Mandatory = $false)]
    [int]$PullRequestNumber = 87,
    
    [Parameter(Mandatory = $false)]
    [switch]$DryRun = $false
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

Write-Host "🔍 PR-Validierung für merge-bot" -ForegroundColor Cyan
Write-Host "Umgebung: $Environment | PR: #$PullRequestNumber" -ForegroundColor Yellow

# Konfiguration
$LogsDir = "logs"
$ConflictsDir = "$LogsDir/conflicts"
$AuditDir = "$LogsDir/audit"
$MergeDir = "$LogsDir/merge"
$SecretsManifest = "secrets.manifest.json"
$CodacyConfig = ".codacy/codacy.yaml"
$WorkflowsDir = ".github/workflows"

# Log-Verzeichnisse erstellen
function Initialize-LogDirectories {
    Write-Host "`n📁 Initialisiere Log-Verzeichnisse..." -ForegroundColor Yellow
    
    @($LogsDir, $ConflictsDir, $AuditDir, $MergeDir) | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
            Write-Host "  ✅ Erstellt: $_" -ForegroundColor Green
        } else {
            Write-Host "  ✓ Existiert: $_" -ForegroundColor Gray
        }
    }
}

# 1. Secrets-Manifest validieren
function Test-SecretsManifest {
    Write-Host "`n🔐 Validiere Secrets-Manifest..." -ForegroundColor Yellow
    
    if (-not (Test-Path $SecretsManifest)) {
        Write-Host "  ❌ FEHLER: $SecretsManifest nicht gefunden!" -ForegroundColor Red
        return $false
    }
    
    try {
        $manifest = Get-Content $SecretsManifest -Raw | ConvertFrom-Json
        
        # Validiere Pflichtfelder
        $requiredFields = @('version', 'environment', 'secrets', 'updated_at')
        $missingFields = $requiredFields | Where-Object { -not $manifest.PSObject.Properties.Name.Contains($_) }
        
        if ($missingFields.Count -gt 0) {
            Write-Host "  ❌ Fehlende Felder: $($missingFields -join ', ')" -ForegroundColor Red
            return $false
        }
        
        # Validiere Secrets-Anzahl
        if ($manifest.secrets.Count -eq 0) {
            Write-Host "  ⚠️  WARNUNG: Keine Secrets im Manifest" -ForegroundColor Yellow
        } else {
            Write-Host "  ✅ Manifest gültig: $($manifest.secrets.Count) Secrets registriert" -ForegroundColor Green
        }
        
        return $true
    } catch {
        Write-Host "  ❌ JSON-Parse-Fehler: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 2. CI-Workflow validieren
function Test-SecretsValidateWorkflow {
    Write-Host "`n🔄 Validiere secrets-validate.yml Workflow..." -ForegroundColor Yellow
    
    $workflowFile = "$WorkflowsDir/secrets-validate.yml"
    
    if (-not (Test-Path $workflowFile)) {
        Write-Host "  ❌ FEHLER: $workflowFile nicht gefunden!" -ForegroundColor Red
        return $false
    }
    
    $content = Get-Content $workflowFile -Raw
    
    # Prüfe kritische Elemente
    $checks = @{
        'on: pull_request' = $content -match 'on:\s*pull_request'
        'secrets validation' = $content -match 'secrets'
        'job definition' = $content -match 'jobs:'
        'runs-on ubuntu' = $content -match 'runs-on:\s*ubuntu-latest'
    }
    
    $allPassed = $true
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "  ✅ $($check.Key)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($check.Key)" -ForegroundColor Red
            $allPassed = $false
        }
    }
    
    return $allPassed
}

# 3. Codacy-Konfiguration validieren
function Test-CodacyConfiguration {
    Write-Host "`n📊 Validiere Codacy-Konfiguration..." -ForegroundColor Yellow
    
    if (-not (Test-Path $CodacyConfig)) {
        Write-Host "  ❌ FEHLER: $CodacyConfig nicht gefunden!" -ForegroundColor Red
        return $false
    }
    
    $content = Get-Content $CodacyConfig -Raw
    
    # YAML-Einrückung prüfen (2 spaces)
    $lines = Get-Content $CodacyConfig
    $indentationErrors = @()
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line -match '^(\s+)') {
            $indent = $matches[1]
            if ($indent -match '\t') {
                $indentationErrors += "Zeile $($i+1): Tab statt Spaces"
            } elseif (($indent.Length % 2) -ne 0) {
                $indentationErrors += "Zeile $($i+1): Ungerade Anzahl Spaces ($($indent.Length))"
            }
        }
    }
    
    if ($indentationErrors.Count -gt 0) {
        Write-Host "  ❌ YAML-Einrückung fehlerhaft:" -ForegroundColor Red
        $indentationErrors | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
        return $false
    }
    
    Write-Host "  ✅ YAML-Einrückung korrekt (2 spaces)" -ForegroundColor Green
    
    # Prüfe auf Duplikate (einfache Heuristik)
    $tools = $content | Select-String -Pattern '- (\w+)@' -AllMatches | ForEach-Object { $_.Matches.Groups[1].Value }
    $uniqueTools = $tools | Select-Object -Unique
    
    if ($tools.Count -ne $uniqueTools.Count) {
        Write-Host "  ⚠️  WARNUNG: Mögliche Duplikate in Tools erkannt" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Keine Tool-Duplikate" -ForegroundColor Green
    }
    
    return $true
}

# 4. Merge-Konflikte analysieren
function Test-MergeConflicts {
    Write-Host "`n🔀 Analysiere Merge-Konflikte..." -ForegroundColor Yellow
    
    $conflictLog = "$ConflictsDir/PR-$PullRequestNumber.txt"
    $conflictFiles = @()
    
    # Prüfe kritische Dateien auf Konflikte
    $criticalPaths = @(
        "$WorkflowsDir/*.yml",
        "package.json",
        "docs/archive/*"
    )
    
    foreach ($pattern in $criticalPaths) {
        $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
        
        foreach ($file in $files) {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            
            # Check for actual Git conflict markers (must be at start of line)
            if ($content -match '(?m)^<<<<<<<|^=======\s*$|^>>>>>>>') {
                $conflictFiles += $file.FullName
            }
        }
    }
    
    # Schreibe Konflikt-Report
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $report = @"
PR-Konflikt-Analyse: #$PullRequestNumber
Zeitstempel: $timestamp
Umgebung: $Environment

Analysierte Pfade:
$($criticalPaths | ForEach-Object { "  - $_" } | Out-String)

Gefundene Konflikte: $($conflictFiles.Count)
$($conflictFiles | ForEach-Object { "  ❌ $_" } | Out-String)

Status: $(if ($conflictFiles.Count -eq 0) { "✅ KEINE KONFLIKTE" } else { "❌ KONFLIKTE GEFUNDEN" })
"@
    
    $report | Out-File -FilePath $conflictLog -Encoding UTF8
    
    if ($conflictFiles.Count -gt 0) {
        Write-Host "  ❌ KONFLIKTE GEFUNDEN: $($conflictFiles.Count) Dateien" -ForegroundColor Red
        $conflictFiles | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
        Write-Host "  📝 Log: $conflictLog" -ForegroundColor Yellow
        return $false
    } else {
        Write-Host "  ✅ Keine Merge-Konflikte gefunden" -ForegroundColor Green
        return $true
    }
}

# 5. Quality Gates prüfen
function Test-QualityGates {
    Write-Host "`n🎯 Prüfe Quality Gates..." -ForegroundColor Yellow
    
    $gates = @{
        'Secrets-Manifest' = Test-SecretsManifest
        'CI-Workflow' = Test-SecretsValidateWorkflow
        'Codacy-Config' = Test-CodacyConfiguration
        'Merge-Konflikte' = Test-MergeConflicts
    }
    
    $allPassed = $true
    foreach ($gate in $gates.GetEnumerator()) {
        if (-not $gate.Value) {
            $allPassed = $false
        }
    }
    
    return $allPassed
}

# Hauptausführung
Initialize-LogDirectories

Write-Host "`n🚀 Starte Validierung..." -ForegroundColor Cyan

$validationPassed = Test-QualityGates

Write-Host "`n" + ("=" * 60) -ForegroundColor Gray

if ($validationPassed) {
    Write-Host "✅ VALIDIERUNG BESTANDEN" -ForegroundColor Green
    Write-Host "   Alle Quality Gates sind grün" -ForegroundColor Green
    Write-Host "   Merge kann vorbereitet werden" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ VALIDIERUNG FEHLGESCHLAGEN" -ForegroundColor Red
    Write-Host "   Bitte behebe die Fehler vor Merge" -ForegroundColor Red
    
    if (-not $DryRun) {
        Write-Host "   Rollback erforderlich" -ForegroundColor Yellow
    }
    
    exit 1
}
