param(
    [Parameter(Mandatory=$true)]
    [string]$File,
    [string]$Signature
)

if (-not $Signature) {
    $Signature = "$File.asc"
}

if (-not (Test-Path $File)) {
    Write-Host "❌ Datei nicht gefunden: $File" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $Signature)) {
    Write-Host "❌ Signatur nicht gefunden: $Signature" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Verifiziere Signatur..." -ForegroundColor Cyan
Write-Host "📄 Datei: $File" -ForegroundColor Gray
Write-Host "🔏 Signatur: $Signature" -ForegroundColor Gray
Write-Host ""

$result = gpg --verify $Signature $File 2>&1
$exitCode = $LASTEXITCODE

Write-Host $result

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "✅ Signatur gültig!" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "❌ Signatur ungültig oder fehlerhaft!" -ForegroundColor Red
    exit 1
}
