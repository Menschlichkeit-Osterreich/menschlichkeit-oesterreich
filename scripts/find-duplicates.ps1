#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Erweiterte Dokumentations-Analyse mit Duplikatserkennung

.DESCRIPTION
    Identifiziert Duplikate anhand von:
    - Dateiinhalt (SHA256 Hash)
    - Dateinamen-Ähnlichkeit
    - Größenübereinstimmung
    
.EXAMPLE
    pwsh scripts/find-duplicates.ps1
#>

[CmdletBinding()]
param(
    [string]$OutputDir = "quality-reports"
)

Write-Host "`n🔍 Duplikats-Analyse gestartet..." -ForegroundColor Cyan

# Alle MD-Dateien finden
$files = Get-ChildItem -Path . -Include *.md -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notlike "*node_modules*" -and
    $_.FullName -notlike "*dist*" -and
    $_.FullName -notlike "*build*" -and
    $_.FullName -notlike "*vendor*"
}

Write-Host "📄 Analysiere $($files.Count) Markdown-Dateien..." -ForegroundColor Yellow

# Hash-Berechnung
$fileHashes = @{}
$duplicates = @()

foreach ($file in $files) {
    try {
        $hash = Get-FileHash -Path $file.FullName -Algorithm SHA256
        $key = $hash.Hash
        
        if ($fileHashes.ContainsKey($key)) {
            $duplicates += [PSCustomObject]@{
                Original = $fileHashes[$key].FullName
                Duplicate = $file.FullName
                Hash = $key
                Size = $file.Length
                LastModified = $file.LastWriteTime
            }
            Write-Host "  ⚠️  Duplikat gefunden: $($file.Name)" -ForegroundColor Yellow
        } else {
            $fileHashes[$key] = $file
        }
    } catch {
        Write-Host "  ❌ Fehler bei $($file.Name): $_" -ForegroundColor Red
    }
}

# Namens-Ähnlichkeit (Frontend README Beispiel)
$nameDuplicates = @()
$groupedByName = $files | Group-Object -Property Name | Where-Object { $_.Count -gt 1 }

foreach ($group in $groupedByName) {
    Write-Host "  🔄 Mehrfache Dateinamen: $($group.Name) ($($group.Count)x)" -ForegroundColor Magenta
    
    foreach ($file in $group.Group) {
        $nameDuplicates += [PSCustomObject]@{
            Name = $file.Name
            Path = $file.FullName
            Size = $file.Length
            LastModified = $file.LastWriteTime
        }
    }
}

# Ergebnisse
Write-Host "`n📊 Ergebnisse:" -ForegroundColor Green
Write-Host "  Exakte Duplikate (Hash): $($duplicates.Count)" -ForegroundColor $(if ($duplicates.Count -gt 0) { 'Red' } else { 'Green' })
Write-Host "  Namens-Duplikate: $($groupedByName.Count)" -ForegroundColor $(if ($groupedByName.Count -gt 0) { 'Yellow' } else { 'Green' })

# CSV Export
if ($duplicates.Count -gt 0 -or $nameDuplicates.Count -gt 0) {
    $duplicates | Export-Csv -Path "$OutputDir/hash-duplicates.csv" -NoTypeInformation -Encoding UTF8
    $nameDuplicates | Export-Csv -Path "$OutputDir/name-duplicates.csv" -NoTypeInformation -Encoding UTF8
    
    Write-Host "`n✅ CSV-Berichte erstellt:" -ForegroundColor Green
    Write-Host "  - $OutputDir/hash-duplicates.csv" -ForegroundColor Cyan
    Write-Host "  - $OutputDir/name-duplicates.csv" -ForegroundColor Cyan
}

# Empfohlene Aktionen
Write-Host "`n📋 Empfohlene Aktionen:" -ForegroundColor Yellow

foreach ($dup in $duplicates) {
    Write-Host "  ❌ LÖSCHEN: $($dup.Duplicate)" -ForegroundColor Red
    Write-Host "     ↳ Original: $($dup.Original)" -ForegroundColor Gray
}

foreach ($group in $groupedByName) {
    Write-Host "`n  🔍 PRÜFEN: $($group.Name)" -ForegroundColor Yellow
    foreach ($file in $group.Group) {
        $relPath = $file.FullName -replace [regex]::Escape((Get-Location).Path), ""
        Write-Host "     - $relPath ($($file.Length) bytes, $($file.LastWriteTime))" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Duplikats-Analyse abgeschlossen`n" -ForegroundColor Green
