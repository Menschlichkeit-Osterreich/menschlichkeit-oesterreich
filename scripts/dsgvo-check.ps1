#!/usr/bin/env pwsh
# DSGVO Compliance Check Script for Menschlichkeit Österreich
# Checks for PII in logs, validates consent mechanisms, and audits data retention

param(
  [string]$OutputPath = "quality-reports/dsgvo-check.json",
  [switch]$Verbose
)

$ErrorActionPreference = "Continue"

Write-Host "🛡️ DSGVO Compliance Check starting..." -ForegroundColor Green

# Initialize compliance report
$ComplianceReport = @{
  timestamp   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  environment = $env:ENVIRONMENT ?? "development"
  checks      = @{
    pii_in_logs        = @{ status = "unknown"; issues = @(); details = "" }
    consent_mechanisms = @{ status = "unknown"; issues = @(); details = "" }
    data_retention     = @{ status = "unknown"; issues = @(); details = "" }
    right_to_deletion  = @{ status = "unknown"; issues = @(); details = "" }
    data_minimization  = @{ status = "unknown"; issues = @(); details = "" }
  }
  summary     = @{
    total_checks = 5
    passed       = 0
    failed       = 0
    warnings     = 0
  }
}

# Check 1: PII in Logs
Write-Host "📋 Checking for PII in log files..." -ForegroundColor Cyan

try {
  $LogFiles = Get-ChildItem -Path "." -Include "*.log" -Recurse -ErrorAction SilentlyContinue
  $PiiPatterns = @(
    '[\w\.-]+@[\w\.-]+\.\w+',  # Email addresses
    '\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}',  # Credit card numbers
    '\+?[1-9]\d{1,14}',  # Phone numbers
    'password["\s]*[:=]["\s]*[^"\s,}]+',  # Passwords
    'api[_-]?key["\s]*[:=]["\s]*[^"\s,}]+'  # API keys
  )

  $PiiFound = @()
  foreach ($LogFile in $LogFiles) {
    $Content = Get-Content $LogFile.FullName -ErrorAction SilentlyContinue
    foreach ($Pattern in $PiiPatterns) {
      $Matches = $Content | Select-String -Pattern $Pattern -AllMatches
      if ($Matches) {
        $PiiFound += @{
          file    = $LogFile.FullName
          pattern = $Pattern
          matches = $Matches.Count
        }
      }
    }
  }

  if ($PiiFound.Count -eq 0) {
    $ComplianceReport.checks.pii_in_logs.status = "passed"
    $ComplianceReport.checks.pii_in_logs.details = "No PII patterns detected in log files"
    $ComplianceReport.summary.passed++
  }
  else {
    $ComplianceReport.checks.pii_in_logs.status = "failed"
    $ComplianceReport.checks.pii_in_logs.issues = $PiiFound
    $ComplianceReport.checks.pii_in_logs.details = "PII patterns found in $($PiiFound.Count) locations"
    $ComplianceReport.summary.failed++
  }
}
catch {
  $ComplianceReport.checks.pii_in_logs.status = "error"
  $ComplianceReport.checks.pii_in_logs.details = "Error checking PII: $($_.Exception.Message)"
  $ComplianceReport.summary.warnings++
}

# Check 2: Consent Mechanisms (CiviCRM)
Write-Host "📋 Checking consent mechanisms..." -ForegroundColor Cyan

try {
  $CiviCrmPath = "crm.menschlichkeit-oesterreich.at"
  $ConsentChecks = @()

  # Check for double opt-in implementation
  if (Test-Path "$CiviCrmPath/httpdocs") {
    $PhpFiles = Get-ChildItem -Path "$CiviCrmPath" -Include "*.php" -Recurse -ErrorAction SilentlyContinue
    $OptInFound = $false

    foreach ($File in $PhpFiles) {
      $Content = Get-Content $File.FullName -ErrorAction SilentlyContinue
      if ($Content -match "double.*opt.*in|opt.*in.*confirm|consent.*confirm") {
        $OptInFound = $true
        break
      }
    }

    if ($OptInFound) {
      $ComplianceReport.checks.consent_mechanisms.status = "passed"
      $ComplianceReport.checks.consent_mechanisms.details = "Double opt-in mechanisms detected"
      $ComplianceReport.summary.passed++
    }
    else {
      $ComplianceReport.checks.consent_mechanisms.status = "warning"
      $ComplianceReport.checks.consent_mechanisms.details = "Double opt-in implementation needs verification"
      $ComplianceReport.summary.warnings++
    }
  }
  else {
    $ComplianceReport.checks.consent_mechanisms.status = "warning"
    $ComplianceReport.checks.consent_mechanisms.details = "CiviCRM path not found - manual verification required"
    $ComplianceReport.summary.warnings++
  }
}
catch {
  $ComplianceReport.checks.consent_mechanisms.status = "error"
  $ComplianceReport.checks.consent_mechanisms.details = "Error checking consent mechanisms: $($_.Exception.Message)"
  $ComplianceReport.summary.warnings++
}

# Check 3: Data Retention Policies
Write-Host "📋 Checking data retention policies..." -ForegroundColor Cyan

try {
  # Check Prisma schema for CASCADE deletes
  if (Test-Path "schema.prisma") {
    $PrismaContent = Get-Content "schema.prisma"
    $CascadeFound = $PrismaContent -match "onDelete.*Cascade"

    if ($CascadeFound) {
      $ComplianceReport.checks.data_retention.status = "passed"
      $ComplianceReport.checks.data_retention.details = "Cascade delete patterns found in Prisma schema"
      $ComplianceReport.summary.passed++
    }
    else {
      $ComplianceReport.checks.data_retention.status = "warning"
      $ComplianceReport.checks.data_retention.details = "No cascade delete patterns found - review data retention manually"
      $ComplianceReport.summary.warnings++
    }
  }
  else {
    $ComplianceReport.checks.data_retention.status = "warning"
    $ComplianceReport.checks.data_retention.details = "Prisma schema not found - manual review required"
    $ComplianceReport.summary.warnings++
  }
}
catch {
  $ComplianceReport.checks.data_retention.status = "error"
  $ComplianceReport.checks.data_retention.details = "Error checking data retention: $($_.Exception.Message)"
  $ComplianceReport.summary.warnings++
}

# Check 4: Right to Deletion Implementation
Write-Host "📋 Checking right to deletion implementation..." -ForegroundColor Cyan

try {
  $ApiPath = "api.menschlichkeit-oesterreich.at"
  $DeletionEndpoints = @()

  if (Test-Path "$ApiPath/app") {
    $ApiFiles = Get-ChildItem -Path "$ApiPath/app" -Include "*.py" -Recurse -ErrorAction SilentlyContinue

    foreach ($File in $ApiFiles) {
      $Content = Get-Content $File.FullName -ErrorAction SilentlyContinue
      if ($Content -match "delete.*user|delete.*contact|gdpr.*delete|right.*deletion") {
        $DeletionEndpoints += $File.Name
      }
    }

    if ($DeletionEndpoints.Count -gt 0) {
      $ComplianceReport.checks.right_to_deletion.status = "passed"
      $ComplianceReport.checks.right_to_deletion.details = "Deletion endpoints found: $($DeletionEndpoints -join ', ')"
      $ComplianceReport.summary.passed++
    }
    else {
      $ComplianceReport.checks.right_to_deletion.status = "warning"
      $ComplianceReport.checks.right_to_deletion.details = "No deletion endpoints detected - manual verification required"
      $ComplianceReport.summary.warnings++
    }
  }
  else {
    $ComplianceReport.checks.right_to_deletion.status = "warning"
    $ComplianceReport.checks.right_to_deletion.details = "API path not found - manual review required"
    $ComplianceReport.summary.warnings++
  }
}
catch {
  $ComplianceReport.checks.right_to_deletion.status = "error"
  $ComplianceReport.checks.right_to_deletion.details = "Error checking deletion rights: $($_.Exception.Message)"
  $ComplianceReport.summary.warnings++
}

# Check 5: Data Minimization (Prisma Models)
Write-Host "📋 Checking data minimization principles..." -ForegroundColor Cyan

try {
  if (Test-Path "schema.prisma") {
    $PrismaContent = Get-Content "schema.prisma"
    $Models = $PrismaContent | Select-String "model\s+(\w+)" -AllMatches
    $OptionalFields = $PrismaContent | Select-String "\w+\s+\w+\?" -AllMatches

    $MinimizationScore = if ($Models.Count -gt 0) {
      [math]::Round(($OptionalFields.Count / $Models.Count), 2)
    }
    else { 0 }

    if ($MinimizationScore -gt 0.3) {
      # 30% optional fields as threshold
      $ComplianceReport.checks.data_minimization.status = "passed"
      $ComplianceReport.checks.data_minimization.details = "Good data minimization ratio: $MinimizationScore"
      $ComplianceReport.summary.passed++
    }
    else {
      $ComplianceReport.checks.data_minimization.status = "warning"
      $ComplianceReport.checks.data_minimization.details = "Consider more optional fields for data minimization. Current ratio: $MinimizationScore"
      $ComplianceReport.summary.warnings++
    }
  }
  else {
    $ComplianceReport.checks.data_minimization.status = "warning"
    $ComplianceReport.checks.data_minimization.details = "Prisma schema not found - manual review required"
    $ComplianceReport.summary.warnings++
  }
}
catch {
  $ComplianceReport.checks.data_minimization.status = "error"
  $ComplianceReport.checks.data_minimization.details = "Error checking data minimization: $($_.Exception.Message)"
  $ComplianceReport.summary.warnings++
}

# Generate final assessment
$ComplianceReport.summary.compliance_score = [math]::Round((($ComplianceReport.summary.passed / $ComplianceReport.summary.total_checks) * 100), 2)

if ($ComplianceReport.summary.failed -eq 0 -and $ComplianceReport.summary.warnings -le 2) {
  $ComplianceReport.overall_status = "compliant"
}
elseif ($ComplianceReport.summary.failed -eq 0) {
  $ComplianceReport.overall_status = "mostly_compliant"
}
else {
  $ComplianceReport.overall_status = "non_compliant"
}

# Ensure output directory exists
$OutputDir = Split-Path $OutputPath -Parent
if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Save report
$ComplianceReport | ConvertTo-Json -Depth 5 | Out-File -FilePath $OutputPath -Encoding utf8

# Console summary
Write-Host "`n🛡️ DSGVO Compliance Check Complete!" -ForegroundColor Green
Write-Host "📊 Overall Status: $($ComplianceReport.overall_status.ToUpper())" -ForegroundColor $(
  switch ($ComplianceReport.overall_status) {
    "compliant" { "Green" }
    "mostly_compliant" { "Yellow" }
    default { "Red" }
  }
)
Write-Host "📈 Compliance Score: $($ComplianceReport.summary.compliance_score)%" -ForegroundColor Cyan
Write-Host "✅ Passed: $($ComplianceReport.summary.passed)"
Write-Host "❌ Failed: $($ComplianceReport.summary.failed)"
Write-Host "⚠️  Warnings: $($ComplianceReport.summary.warnings)"
Write-Host "📋 Report saved to: $OutputPath" -ForegroundColor Blue

if ($Verbose) {
  Write-Host "`n📋 Detailed Results:" -ForegroundColor Yellow
  foreach ($Check in $ComplianceReport.checks.GetEnumerator()) {
    $Status = switch ($Check.Value.status) {
      "passed" { "✅" }
      "failed" { "❌" }
      "warning" { "⚠️" }
      "error" { "🚨" }
      default { "❓" }
    }
    Write-Host "$Status $($Check.Key): $($Check.Value.details)"
  }
}

# Exit with appropriate code
if ($ComplianceReport.overall_status -eq "non_compliant") {
  exit 1
}
else {
  exit 0
}
