#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Creates 5 BSM GitHub Variables for deployment automation via GitHub REST API
.DESCRIPTION
  Sets up GitHub Repository Variables required by .github/workflows/reusable-bsm-secrets.yml
  for loading Bitwarden Secrets Manager credentials during deployment.
#>

param(
  [string]$Token = (Get-Content .local-secrets/github.env -ErrorAction SilentlyContinue | Select-String 'github_pat_' | ForEach-Object { $_.ToString() -replace '.*="', '' -replace '"$', '' }),
  [string]$Owner = "Menschlichkeit-Osterreich",
  [string]$Repo = "menschlichkeit-oesterreich"
)

if (-not $Token) {
  Write-Error "Token nicht gefunden in .local-secrets/github.env"
  exit 1
}

Write-Host "GitHub Token-validiert ✅ ($(($Token).Substring(0, 20))...)" -ForegroundColor Green
Write-Host "Repository: $Owner/$Repo" -ForegroundColor Cyan

$variables = @(
  @{
    name = "BSM_API_ALERTS_SLACK_WEBHOOK"
    value = "6ae7736b-87ee-42a2-ad70-b4320175a89a"
    description = "Slack webhook UUID for deployment alerts"
  },
  @{
    name = "BSM_API_MICROSOFT_TENANT_ID"
    value = "896d9258-dfe3-423f-a4ef-b43300a782a4"
    description = "Microsoft Entra Tenant ID for BSM auth"
  },
  @{
    name = "BSM_API_MICROSOFT_CLIENT_ID"
    value = "db7a1253-082c-4cfb-a5cc-b43300ad91df"
    description = "Microsoft Entra App Registration Client ID"
  },
  @{
    name = "BSM_API_MICROSOFT_CLIENT_SECRET"
    value = "d7399a8e-2559-4f11-a9ec-b43300ab8b11"
    description = "Microsoft Entra Client Secret (stored in GitHub Secrets)"
  },
  @{
    name = "BSM_API_MICROSOFT_GRAPH_SENDER"
    value = "0d276eb3-407d-49c4-89c7-b43300b3cfbb"
    description = "Microsoft Graph Sender Email for n8n notifications"
  }
)

$headers = @{
  "Authorization" = "Bearer $Token"
  "Accept" = "application/vnd.github+json"
  "X-GitHub-Api-Version" = "2022-11-28"
}

$successCount = 0
$errorCount = 0

Write-Host "`nSetze $($variables.Count) GitHub Variables..." -ForegroundColor Cyan

foreach ($var in $variables) {
  $body = @{
    name = $var.name
    value = $var.value
  } | ConvertTo-Json -Compress

  $uri = "https://api.github.com/repos/$Owner/$Repo/actions/variables"

  try {
    # Versuche zu erstellen
    $response = Invoke-RestMethod -Uri $uri `
      -Headers $headers `
      -Method Post `
      -Body $body `
      -ContentType "application/json" `
      -ErrorAction Stop

    Write-Host "  ✅ CREATE: $($var.name)" -ForegroundColor Green
    $successCount++
  }
  catch {
    # Wenn 409 Conflict → Variable existiert bereits → Update statt Create
    if ($_.Exception.Response.StatusCode -eq 409) {
      try {
        $patchUri = "$uri/$($var.name)"
        $response = Invoke-RestMethod -Uri $patchUri `
          -Headers $headers `
          -Method Patch `
          -Body $body `
          -ContentType "application/json" `
          -ErrorAction Stop

        Write-Host "  ✅ UPDATE: $($var.name)" -ForegroundColor Green
        $successCount++
      }
      catch {
        Write-Host "  ❌ UPDATE FAILED: $($var.name) - $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
      }
    }
    else {
      Write-Host "  ❌ CREATE FAILED: $($var.name) - $($_.Exception.Message)" -ForegroundColor Red
      $errorCount++
    }
  }
}

Write-Host "`n📊 Ergebnis: $successCount erfolgreich, $errorCount Fehler" -ForegroundColor Cyan

if ($errorCount -eq 0 -and $successCount -eq $variables.Count) {
  Write-Host "`n✅ Alle $($variables.Count) GitHub Variables erfolgreich gesetzt!" -ForegroundColor Green

  # Verifiziere durch auflisten
  Write-Host "`nVerifiziere Variables-Setup..." -ForegroundColor Cyan
  $listUri = "https://api.github.com/repos/$Owner/$Repo/actions/variables"
  $allVars = Invoke-RestMethod -Uri $listUri -Headers $headers -Method Get

  $bsmVars = $allVars.variables | Where-Object { $_.name -like "BSM_*" }
  Write-Host "✅ $($bsmVars.Count) BSM Variables gefunden in Repository" -ForegroundColor Green
  $bsmVars | ForEach-Object { Write-Host "   - $($_.name)" -ForegroundColor Green }

  exit 0
}
else {
  Write-Host "`n❌ Variables-Setup unvollständig" -ForegroundColor Red
  exit 1
}
