#Requires -Version 5.1
<#!
.SYNOPSIS
  Lädt GH_TOKEN/GITHUB_TOKEN aus .env/.env.local (falls vorhanden) in die Prozessumgebung und startet den Python-Validator.

.DESCRIPTION
  - Sucht .env.local zuerst, danach .env im Repo-Root
  - Lädt nur Schlüssel/Werte, überschreibt vorhandene Env-Variablen NICHT (Least Surprise)
  - Startet bevorzugt ein lokales venv-Python (./.venv/Scripts/python.exe), sonst 'python'
  - Gibt nur eine knappe JSON-Zusammenfassung aus, Token wird nie geloggt

.NOTES
  Sicherheit: Keine Secrets-Ausgabe. Verwenden Sie diese Datei lokal.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info($msg) { Write-Host "[token-validate] $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "[token-validate] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "[token-validate] $msg" -ForegroundColor Red }

# Ermittele Repo-Root relativ zu diesem Skript (scripts/gh → ../../)
$repoRoot = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..\..')

function Import-DotEnvFile {
  param(
    [Parameter(Mandatory)][string]$Path
  )
  if (-not (Test-Path -LiteralPath $Path)) { return }
  Write-Info "Lade Umgebungsvariablen aus $(Split-Path -Leaf $Path) (ohne Override)"
  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($line)) { return }
    if ($line.StartsWith('#')) { return }
    $eq = $line.IndexOf('=')
    if ($eq -lt 1) { return }
    $key = $line.Substring(0, $eq).Trim()
    $val = $line.Substring($eq + 1).Trim().Trim('"').Trim("'")
    if (-not [string]::IsNullOrWhiteSpace($key)) {
      $existing = [System.Environment]::GetEnvironmentVariable($key, 'Process')
      if ([string]::IsNullOrEmpty($existing)) {
        # Setze nur, wenn noch nicht gesetzt
        [System.Environment]::SetEnvironmentVariable($key, $val, 'Process')
      }
    }
  }
}

# 1) .env.local bevorzugen, dann .env
$dotenvLocal = Join-Path $repoRoot '.env.local'
$dotenv      = Join-Path $repoRoot '.env'
Import-DotEnvFile -Path $dotenvLocal
Import-DotEnvFile -Path $dotenv

# 2) Python-Interpreter bestimmen
$venvPy = Join-Path $repoRoot '.venv\Scripts\python.exe'
$python = if (Test-Path -LiteralPath $venvPy) { $venvPy } else { 'python' }

# 3) Validator-Skriptpfad
$validator = Join-Path $repoRoot 'scripts\validate-github-files.py'
if (-not (Test-Path -LiteralPath $validator)) {
  Write-Err "Validator nicht gefunden: $validator"
  exit 2
}

# 4) Starten
Write-Info "Starte Validator mit $python"
try {
  & $python $validator
  exit $LASTEXITCODE
} catch {
  Write-Err $_.Exception.Message
  exit 1
}
