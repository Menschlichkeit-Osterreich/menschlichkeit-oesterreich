<#
.SYNOPSIS
    Fügt Front-Matter zu Markdown-Dateien hinzu (README+ v2.0.0 konform).

.DESCRIPTION
    Analysiert Markdown-Dateien ohne Front-Matter und ergänzt diese automatisch:
    - Extrahiert Titel aus erstem H1 oder Dateinamen
    - Generiert Description aus erstem Absatz
    - Weist Kategorien basierend auf Dateipfad zu
    - Setzt Status, Tags, Version automatisch
    
    WICHTIG: DryRun-Modus standardmäßig aktiv (keine Dateien werden verändert).
    
.PARAMETER DryRun
    Wenn $true (Standard), werden keine Änderungen vorgenommen (nur Simulation).
    
.PARAMETER Force
    Wenn $true, überschreibt auch vorhandenes Front-Matter (USE WITH CAUTION!).
    
.PARAMETER TargetFiles
    Array von Dateipfaden, die verarbeitet werden sollen.
    Wenn leer, werden alle Markdown-Dateien ohne Front-Matter automatisch erkannt.

.EXAMPLE
    .\add-frontmatter.ps1
    # DRY-RUN: Zeigt, welche Dateien Front-Matter erhalten würden

.EXAMPLE
    .\add-frontmatter.ps1 -DryRun:$false
    # Wendet Front-Matter auf alle erkannten Dateien an

.EXAMPLE
    .\add-frontmatter.ps1 -TargetFiles "docs/README.md","frontend/README.md" -DryRun:$false
    # Wendet Front-Matter nur auf spezifische Dateien an

.NOTES
    Author: AI Assistant
    Version: 1.0.0
    Date: 2025-10-10
    Requires: PowerShell 7.0+
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [bool]$DryRun = $true,
    
    [Parameter(Mandatory = $false)]
    [bool]$Force = $false,
    
    [Parameter(Mandatory = $false)]
    [string[]]$TargetFiles = @()
)

# ============================================================================
# KONFIGURATION
# ============================================================================

$Config = @{
    RootPath = $PSScriptRoot | Split-Path -Parent
    
    # Kategorien basierend auf Pfad-Patterns
    CategoryMapping = @{
        'getting-started'  = @('quick-start', 'setup', 'installation')
        'architecture'     = @('architecture', 'system-design', 'technical')
        'security'         = @('security', 'auth', 'encryption', 'compliance')
        'compliance'       = @('dsgvo', 'gdpr', 'legal', 'privacy', 'beitragsordnung', 'statuten')
        'development'      = @('dev', 'development', 'coding', 'testing')
        'operations'       = @('deployment', 'ops', 'infrastructure', 'monitoring')
        'frontend'         = @('frontend', 'react', 'ui', 'design-system', 'figma')
        'api'              = @('api', 'backend', 'fastapi', 'endpoints')
        'crm'              = @('crm', 'drupal', 'civicrm')
        'automation'       = @('automation', 'n8n', 'workflows', 'elk')
        'github'           = @('.github', 'workflows', 'actions', 'ci-cd')
        'uncategorized'    = @()
    }
    
    # Ausschlüsse (werden nicht verarbeitet)
    ExcludePaths = @(
        'node_modules', 'vendor', 'dist', 'build', '__pycache__',
        '.cache', '.next', '.venv', 'venv', 'env',
        'web/core/tests', 'web/core/themes'  # Drupal Core
    )
    
    # Preserve-Patterns (werden nie überschrieben, auch nicht mit -Force)
    PreserveFiles = @(
        '(?i)^LICENSE',
        '(?i)^CHANGELOG\.md$',
        '(?i)^SECURITY\.md$'
    )
    
    # Default Front-Matter Template
    FrontMatterTemplate = @{
        title        = ''  # Auto-generiert
        description  = ''  # Auto-generiert
        lastUpdated  = (Get-Date -Format 'yyyy-MM-dd')
        status       = 'ACTIVE'
        category     = 'uncategorized'
        tags         = @()  # Auto-generiert
        version      = '1.0.0'
        language     = 'de-AT'
        audience     = @('Developers')
    }
}

# ============================================================================
# HELPER FUNKTIONEN
# ============================================================================

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet('Info', 'Success', 'Warning', 'Error')]
        [string]$Level = 'Info'
    )
    
    $Colors = @{
        Info    = 'Cyan'
        Success = 'Green'
        Warning = 'Yellow'
        Error   = 'Red'
    }
    
    $Prefix = @{
        Info    = '  ℹ️ '
        Success = '  ✅'
        Warning = '  ⚠️ '
        Error   = '  ❌'
    }
    
    Write-Host "$($Prefix[$Level]) $Message" -ForegroundColor $Colors[$Level]
}

function Test-HasFrontMatter {
    param([string]$FilePath)
    
    $Content = Get-Content -Path $FilePath -Raw -ErrorAction SilentlyContinue
    return ($Content -match '^---\s*\n')
}

function Get-FileCategory {
    param([string]$FilePath)
    
    $RelativePath = $FilePath.Replace($Config.RootPath, '').TrimStart('\', '/')
    
    foreach ($Category in $Config.CategoryMapping.Keys) {
        foreach ($Pattern in $Config.CategoryMapping[$Category]) {
            if ($RelativePath -match $Pattern) {
                return $Category
            }
        }
    }
    
    return 'uncategorized'
}

function Get-TitleFromContent {
    param([string]$Content)
    
    # Extrahiere ersten H1 (# Heading)
    if ($Content -match '^#\s+(.+)$') {
        return $Matches[1].Trim()
    }
    
    # Fallback: Extrahiere ersten H2 (## Heading)
    if ($Content -match '^##\s+(.+)$') {
        return $Matches[1].Trim()
    }
    
    return $null
}

function Get-DescriptionFromContent {
    param([string]$Content)
    
    # Entferne Front-Matter (falls vorhanden)
    $Content = $Content -replace '(?s)^---.*?---\s*', ''
    
    # Entferne alle Überschriften
    $Content = $Content -replace '(?m)^#{1,6}\s+.+$', ''
    
    # Extrahiere ersten nicht-leeren Absatz
    $Lines = $Content -split '\n' | Where-Object { $_.Trim() -ne '' }
    
    if ($Lines.Count -gt 0) {
        $FirstParagraph = $Lines[0].Trim()
        
        # Kürze auf max. 200 Zeichen
        if ($FirstParagraph.Length -gt 200) {
            return $FirstParagraph.Substring(0, 197) + '...'
        }
        
        return $FirstParagraph
    }
    
    return ''
}

function Get-AutoTags {
    param(
        [string]$FilePath,
        [string]$Category,
        [string]$Title,
        [string]$Description
    )
    
    $Tags = @()
    
    # Basis-Tag: readme
    if ($FilePath -match 'README\.md$') {
        $Tags += 'readme'
    }
    
    # Kategorie als Tag
    if ($Category -ne 'uncategorized') {
        $Tags += $Category
    }
    
    # Erkenne spezifische Keywords
    $AllText = "$Title $Description $FilePath".ToLower()
    
    $KeywordMapping = @{
        'setup'          = @('setup', 'installation', 'install', 'quick-start')
        'documentation'  = @('docs', 'documentation', 'guide', 'manual')
        'api'            = @('api', 'endpoint', 'rest', 'openapi')
        'security'       = @('security', 'auth', 'encryption', 'dsgvo', 'gdpr')
        'deployment'     = @('deploy', 'production', 'staging', 'ci-cd')
        'development'    = @('dev', 'coding', 'testing', 'debug')
        'configuration'  = @('config', 'settings', 'environment')
    }
    
    foreach ($Tag in $KeywordMapping.Keys) {
        foreach ($Keyword in $KeywordMapping[$Tag]) {
            if ($AllText -match $Keyword) {
                $Tags += $Tag
                break
            }
        }
    }
    
    # Dedupliziere und sortiere
    return ($Tags | Select-Object -Unique | Sort-Object)
}

function New-FrontMatter {
    param(
        [string]$FilePath,
        [string]$Content
    )
    
    $Title = Get-TitleFromContent -Content $Content
    if (-not $Title) {
        # Fallback: Dateiname als Titel
        $FileName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
        $Title = $FileName -replace '-', ' ' -replace '_', ' '
        # Capitalize first letter of each word
        $Title = (Get-Culture).TextInfo.ToTitleCase($Title.ToLower())
    }
    
    $Description = Get-DescriptionFromContent -Content $Content
    if (-not $Description) {
        $Description = "Documentation for $Title"
    }
    
    $Category = Get-FileCategory -FilePath $FilePath
    $Tags = Get-AutoTags -FilePath $FilePath -Category $Category -Title $Title -Description $Description
    
    # Erzeuge Front-Matter
    $FrontMatter = $Config.FrontMatterTemplate.Clone()
    $FrontMatter.title = $Title
    $FrontMatter.description = $Description
    $FrontMatter.category = $Category
    $FrontMatter.tags = $Tags
    
    # Baue YAML
    $Yaml = "---`n"
    $Yaml += "title: $($FrontMatter.title)`n"
    $Yaml += "description: $($FrontMatter.description)`n"
    $Yaml += "lastUpdated: $($FrontMatter.lastUpdated)`n"
    $Yaml += "status: $($FrontMatter.status)`n"
    $Yaml += "category: $($FrontMatter.category)`n"
    $Yaml += "tags:`n"
    foreach ($Tag in $FrontMatter.tags) {
        $Yaml += "  - $Tag`n"
    }
    $Yaml += "version: $($FrontMatter.version)`n"
    $Yaml += "language: $($FrontMatter.language)`n"
    $Yaml += "audience:`n"
    foreach ($Aud in $FrontMatter.audience) {
        $Yaml += "  - $Aud`n"
    }
    $Yaml += "---`n`n"
    
    return $Yaml
}

function Add-FrontMatterToFile {
    param(
        [string]$FilePath,
        [bool]$DryRun
    )
    
    $RelativePath = $FilePath.Replace($Config.RootPath, '').TrimStart('\', '/')
    
    # Prüfe Preserve-Patterns
    foreach ($Pattern in $Config.PreserveFiles) {
        if ($RelativePath -match $Pattern) {
            Write-Log "Übersprungen (geschützte Datei): $RelativePath" -Level Warning
            return $false
        }
    }
    
    # Lese Inhalt
    $Content = Get-Content -Path $FilePath -Raw -ErrorAction SilentlyContinue
    if (-not $Content) {
        Write-Log "Fehler beim Lesen: $RelativePath" -Level Error
        return $false
    }
    
    # Generiere Front-Matter
    $FrontMatter = New-FrontMatter -FilePath $FilePath -Content $Content
    
    # Kombiniere
    $NewContent = $FrontMatter + $Content
    
    if ($DryRun) {
        Write-Log "SIMULATION: Front-Matter würde hinzugefügt zu: $RelativePath" -Level Info
        Write-Host "`n--- PREVIEW: $RelativePath ---" -ForegroundColor Magenta
        Write-Host $FrontMatter -ForegroundColor Gray
        Write-Host "---`n" -ForegroundColor Magenta
        return $true
    }
    
    # Schreibe Datei
    try {
        Set-Content -Path $FilePath -Value $NewContent -Encoding UTF8 -NoNewline
        Write-Log "Front-Matter hinzugefügt: $RelativePath" -Level Success
        return $true
    }
    catch {
        Write-Log "Fehler beim Schreiben: $RelativePath - $_" -Level Error
        return $false
    }
}

# ============================================================================
# HAUPTLOGIK
# ============================================================================

function Invoke-AddFrontMatter {
    Write-Host "`n🎨 Front-Matter Batch-Anwendung gestartet..." -ForegroundColor Cyan
    Write-Host "   DryRun: $DryRun | Force: $Force`n" -ForegroundColor Gray
    
    # Schritt 1: Ermittle Zieldateien
    if ($TargetFiles.Count -gt 0) {
        Write-Log "Verwende spezifizierte Dateien: $($TargetFiles.Count)"
        $Files = $TargetFiles | ForEach-Object {
            if (Test-Path $_) {
                Get-Item $_
            }
            else {
                Write-Log "Datei nicht gefunden: $_" -Level Warning
            }
        }
    }
    else {
        Write-Log "Scanne Repository nach Markdown-Dateien..."
        
        $AllFiles = Get-ChildItem -Path $Config.RootPath -Include "*.md", "*.mdx", "*.markdown" -Recurse -File
        
        # Filtere Ausschlüsse
        $Files = $AllFiles | Where-Object {
            $RelativePath = $_.FullName.Replace($Config.RootPath, '').TrimStart('\', '/')
            
            $Exclude = $false
            foreach ($ExcludePath in $Config.ExcludePaths) {
                if ($RelativePath -match $ExcludePath) {
                    $Exclude = $true
                    break
                }
            }
            
            -not $Exclude
        }
        
        Write-Log "Gefunden: $($Files.Count) Markdown-Dateien (nach Ausschlüssen)"
    }
    
    # Schritt 2: Filtere Dateien ohne Front-Matter (oder mit -Force alle)
    $TargetFilesToProcess = $Files | Where-Object {
        $HasFM = Test-HasFrontMatter -FilePath $_.FullName
        
        if ($Force) {
            return $true  # Verarbeite alle, überschreibe vorhandenes Front-Matter
        }
        else {
            return -not $HasFM  # Nur ohne Front-Matter
        }
    }
    
    Write-Log "Zu verarbeitende Dateien: $($TargetFilesToProcess.Count)"
    
    if ($TargetFilesToProcess.Count -eq 0) {
        Write-Log "Keine Dateien zu verarbeiten." -Level Warning
        return
    }
    
    # Schritt 3: Verarbeite Dateien
    $Stats = @{
        Processed = 0
        Skipped   = 0
        Errors    = 0
    }
    
    foreach ($File in $TargetFilesToProcess) {
        $Success = Add-FrontMatterToFile -FilePath $File.FullName -DryRun $DryRun
        
        if ($Success) {
            $Stats.Processed++
        }
        elseif ($Success -eq $false) {
            $Stats.Errors++
        }
        else {
            $Stats.Skipped++
        }
    }
    
    # Schritt 4: Zusammenfassung
    Write-Host "`n📊 Zusammenfassung:" -ForegroundColor Cyan
    Write-Log "Verarbeitet: $($Stats.Processed)" -Level Success
    Write-Log "Übersprungen: $($Stats.Skipped)" -Level Warning
    Write-Log "Fehler: $($Stats.Errors)" -Level Error
    
    if ($DryRun) {
        Write-Host "`n⚠️  DRY-RUN Modus aktiv - keine Änderungen vorgenommen!" -ForegroundColor Yellow
        Write-Host "   Zum Anwenden: .\add-frontmatter.ps1 -DryRun:`$false`n" -ForegroundColor Gray
    }
    else {
        Write-Host "`n✅ Front-Matter erfolgreich angewendet!`n" -ForegroundColor Green
    }
}

# ============================================================================
# ENTRY POINT
# ============================================================================

Invoke-AddFrontMatter
