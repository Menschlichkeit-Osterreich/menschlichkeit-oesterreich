# ============================================================
# windows-pull.ps1 — Repo auf Windows aktualisieren
# ============================================================
# Führt git pull für den aktuellen Branch aus und seeded
# Testbenutzer in der lokalen Datenbank.
#
# Voraussetzungen:
#   - Git installiert
#   - Python 3.12+ installiert
#   - PostgreSQL läuft (via Docker oder lokal)
#
# Verwendung (PowerShell als normaler User):
#   cd E:\openclawd-win-bridge\repos\Menschlichkeit-Osterreich\menschlichkeit-oesterreich-development
#   .\scripts\windows-pull.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "`n=== Menschlichkeit Österreich — Windows Pull ===" -ForegroundColor Cyan
Write-Host "Repo: $RepoRoot" -ForegroundColor Gray

# ── 1. Git Pull ───────────────────────────────────────────────
Write-Host "`n[1/3] Git fetch + pull …" -ForegroundColor Yellow
Set-Location $RepoRoot
git fetch origin
git pull origin (git rev-parse --abbrev-ref HEAD)

Write-Host "  Aktueller Branch: $(git rev-parse --abbrev-ref HEAD)" -ForegroundColor Green
Write-Host "  Letzter Commit:   $(git log -1 --oneline)" -ForegroundColor Green

# ── 2. npm install (falls package.json geändert) ──────────────
$pkgChanged = git diff HEAD@{1} HEAD --name-only 2>$null | Select-String "package.json"
if ($pkgChanged) {
    Write-Host "`n[2/3] package.json geändert — npm install …" -ForegroundColor Yellow
    npm install --prefix $RepoRoot
} else {
    Write-Host "`n[2/3] package.json unverändert — npm install übersprungen." -ForegroundColor Gray
}

# ── 3. Test-Benutzer seeden ───────────────────────────────────
Write-Host "`n[3/3] Testbenutzer anlegen / aktualisieren …" -ForegroundColor Yellow
$SeedScript = Join-Path $RepoRoot "apps\api\scripts\seed_test_users.py"
$EnvCandidates = @(
    (Join-Path $RepoRoot ".env.test.local"),
    (Join-Path $RepoRoot ".env.test.example")
)

if (Test-Path $SeedScript) {
    $LoadedEnv = $EnvCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($LoadedEnv) {
        Get-Content $LoadedEnv | ForEach-Object {
            if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
                [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
            }
        }
    }
    python $SeedScript
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "  Seed fehlgeschlagen — Datenbank läuft? Siehe .env.test.local bzw. .env.test.example."
    }
} else {
    Write-Warning "  Seed-Script nicht gefunden: $SeedScript"
}

Write-Host "`n=== Fertig ===" -ForegroundColor Cyan
Write-Host @"

Test-Login-Daten (Webseite: http://localhost:5173):
  sysadmin   test-sysadmin@menschlichkeit-oesterreich.at  / TestSysAdmin2025!
  admin      test-admin@menschlichkeit-oesterreich.at     / TestAdmin2025!
  vorstand   test-vorstand@menschlichkeit-oesterreich.at  / TestVorstand2025!
  moderator  test-moderator@menschlichkeit-oesterreich.at / TestModerator2025!
  mitglied   test-mitglied@menschlichkeit-oesterreich.at  / TestMitglied2025!
  fördernd   test-foerdermitglied@menschlichkeit-oesterreich.at / TestFoerder2025!
  inaktiv    test-inaktiv@menschlichkeit-oesterreich.at   / TestInaktiv2025!

API Login: POST http://localhost:8001/api/auth/login
"@ -ForegroundColor White
