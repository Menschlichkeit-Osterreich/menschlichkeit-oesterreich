param(
    [Parameter(Mandatory = $true)]
    [string]$ReplaceText,
    [string]$MirrorDir = "",
    [string]$Remote = "origin",
    [switch]$Push
)

$ErrorActionPreference = "Stop"

$gitBash = "C:\Program Files\Git\bin\bash.exe"
if (-not (Test-Path $gitBash)) {
    throw "Git Bash nicht gefunden unter '$gitBash'. Bitte Git fuer Windows installieren oder das Bash-Skript direkt in WSL ausfuehren."
}

$repoRoot = (Get-Location).Path.Replace('\', '/')
$scriptPath = "$repoRoot/scripts/security/rewrite-public-secrets.sh"
$escapedReplaceText = $ReplaceText.Replace('\', '/')
$escapedMirrorDir = $MirrorDir.Replace('\', '/')

$cmd = "'$scriptPath' --replace-text '$escapedReplaceText' --remote '$Remote'"
if (-not [string]::IsNullOrWhiteSpace($escapedMirrorDir)) {
    $cmd += " --mirror-dir '$escapedMirrorDir'"
}
if ($Push.IsPresent) {
    $cmd += " --push"
}

& $gitBash -lc $cmd

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
