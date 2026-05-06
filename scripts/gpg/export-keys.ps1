param(
    [string]$Email = "peter.schuller@menschlichkeit-oesterreich.at"
)

$Stamp = Get-Date -Format "yyyy-MM"
$Dest = Join-Path $env:USERPROFILE "GPG-Backups\$Stamp"
New-Item -ItemType Directory -Force -Path $Dest | Out-Null

Write-Host "📂 Exportiere GPG-Keys für: $Email" -ForegroundColor Cyan
Write-Host "📁 Zielverzeichnis: $Dest" -ForegroundColor Cyan

$FpOutput = gpg --list-keys --with-colons $Email | Select-String -Pattern '^fpr:' | Select-Object -First 1
$FP = ($FpOutput -split ':')[9]

gpg --export -a $Email | Out-File -Encoding ASCII -FilePath "$Dest\public.asc"
Write-Host "✅ Public Key: $Dest\public.asc" -ForegroundColor Green

gpg --export-secret-subkeys -a $Email | Out-File -Encoding ASCII -FilePath "$Dest\secret-subkeys.asc"
Write-Host "✅ Secret Subkeys: $Dest\secret-subkeys.asc" -ForegroundColor Green

gpg --export-secret-keys -a $Email | Out-File -Encoding ASCII -FilePath "$Dest\secret-full.asc"
Write-Host "⚠️  Full Secret Key: $Dest\secret-full.asc (OFFLINE aufbewahren!)" -ForegroundColor Yellow

gpg --export-ownertrust | Out-File -Encoding ASCII -FilePath "$Dest\ownertrust.txt"
Write-Host "✅ Ownertrust: $Dest\ownertrust.txt" -ForegroundColor Green

if (-not (Test-Path "$Dest\revoke.asc")) {
    Write-Host "🔑 Generiere Revocation Certificate..." -ForegroundColor Yellow
    gpg --output "$Dest\revoke.asc" --gen-revoke $FP
    Write-Host "✅ Revocation: $Dest\revoke.asc" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Revocation existiert bereits: $Dest\revoke.asc" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Export abgeschlossen!" -ForegroundColor Green
Write-Host "📋 Fingerprint: $FP" -ForegroundColor Cyan
Write-Host "📂 Backup-Verzeichnis: $Dest" -ForegroundColor Cyan
