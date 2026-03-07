# Secret-Synchronisation zwischen Repos (PowerShell)
# Usage: .\secret-sync.ps1 -SecretName "DATABASE_URL" -SourceRepo "owner/source" -TargetRepo "owner/target"

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SecretName,

    [Parameter(Mandatory = $false)]
    [string]$SourceRepo = "Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development",

    [Parameter(Mandatory = $true)]
    [string]$TargetRepo
)

function Write-Info($message) {
    Write-Host "ℹ️  $message" -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-ErrorMsg($message) {
    Write-Host "❌ $message" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host " Secret-Synchronisation" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

# Secret-Wert aus .env.local laden (da API kein Read-Access auf Secrets hat)
Write-Info "Lade Secret aus .env.local..."
# .env.local im Repo-Root erwartet
$envLocalPath = Join-Path -Path (Resolve-Path "$PSScriptRoot\..\..\").Path -ChildPath ".env.local"
$envLocal = Get-Content $envLocalPath -ErrorAction SilentlyContinue

if (-not $envLocal) {
    Write-ErrorMsg "Datei .env.local nicht gefunden!"
    Write-Host "   Pfad: $envLocalPath"
    exit 1
}

$secretValue = $envLocal | Where-Object { $_ -match "^$SecretName=" } | ForEach-Object {
    $_.Split("=", 2)[1]
}

if (-not $secretValue) {
    Write-ErrorMsg "Secret '$SecretName' nicht in .env.local gefunden!"
    Write-Host "   Verfügbare Secrets:"
    $envLocal | Where-Object { $_ -match "^[A-Z_]+=" } | ForEach-Object {
        Write-Host "     - $($_.Split('=')[0])"
    }
    exit 1
}

Write-Success "Secret-Wert geladen (Länge: $($secretValue.Length) Zeichen)"

# Secret in Ziel-Repo setzen
Write-Info "Setze Secret in $TargetRepo..."

try {
    $secretValue | gh secret set $SecretName --repo $TargetRepo

    Write-Success "Secret synchronisiert!"
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host " Erfolgreich!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Source:  $SourceRepo"
    Write-Host "Target:  $TargetRepo"
    Write-Host "Secret:  $SecretName"
    Write-Host ""
    Write-Info "Prüfe mit:"
    Write-Host "  gh secret list --repo $TargetRepo"
}
catch {
    Write-ErrorMsg "Fehler beim Setzen des Secrets!"
    Write-Host "   Fehler: $_"
    Write-Host ""
    Write-Info "Stelle sicher, dass:"
    Write-Host "  1. GH_TOKEN admin:org Scope hat"
    Write-Host "  2. Du Zugriff auf Ziel-Repo hast"
    Write-Host "  3. Repo-Name korrekt ist (owner/repo)"
    exit 1
}
