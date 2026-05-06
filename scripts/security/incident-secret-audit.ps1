param(
    [string]$OutputDir = ""
)

$ErrorActionPreference = "Stop"

$gitBash = "C:\Program Files\Git\bin\bash.exe"
if (-not (Test-Path $gitBash)) {
    throw "Git Bash nicht gefunden unter '$gitBash'. Bitte Git fuer Windows installieren oder das Bash-Skript direkt in WSL ausfuehren."
}

$repoRoot = (Get-Location).Path.Replace('\', '/')
$scriptPath = "$repoRoot/scripts/security/incident-secret-audit.sh"
$escapedOutput = $OutputDir.Replace('\', '/')

if ([string]::IsNullOrWhiteSpace($escapedOutput)) {
    & $gitBash -lc "'$scriptPath'"
} else {
    & $gitBash -lc "'$scriptPath' '$escapedOutput'"
}

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
