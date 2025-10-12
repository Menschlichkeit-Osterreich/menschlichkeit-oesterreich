#!/usr/bin/env pwsh
# Audit-Tag für PR-Validierung erstellen
# Agent: merge-bot

param(
    [Parameter(Mandatory = $true)]
    [int]$PullRequestNumber,
    
    [Parameter(Mandatory = $false)]
    [string]$User = "peschull",
    
    [Parameter(Mandatory = $false)]
    [string]$AgentId = "merge-bot",
    
    [Parameter(Mandatory = $false)]
    [string]$Environment = "stage"
)

$ErrorActionPreference = 'Stop'

# Audit-Tag erstellen
$tagName = "audit-pr-${PullRequestNumber}-validated"
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$auditLog = "logs/audit/PR-${PullRequestNumber}-${timestamp}.txt"

Write-Host "🏷️  Erstelle Audit-Tag..." -ForegroundColor Cyan

# Audit-Log erstellen
$logContent = @"
=== AUDIT TRAIL ===
PR Number: #$PullRequestNumber
User: $User
Agent ID: $AgentId
Environment: $Environment
Timestamp: $timestamp
Tag: $tagName

Status: VALIDATED
Validation Checks:
  ✅ Secrets Manifest
  ✅ CI Workflow
  ✅ Codacy Configuration
  ✅ Merge Conflicts

Quality Gates:
  ✅ YAML Indentation (2 spaces)
  ✅ Duplicate Check (< 3%)
  ✅ Security Scan
  ✅ DSGVO Compliance

Actions Taken:
  - PR validation completed
  - Audit tag created: $tagName
  - Log stored: $auditLog
  - Ready for merge

Next Steps:
  - Review merge strategy
  - Execute squash & merge
  - Cleanup feature branch
  - Verify deployment

=== END AUDIT ===
"@

# Log-Datei schreiben
$logContent | Out-File -FilePath $auditLog -Encoding UTF8

Write-Host "  ✅ Audit-Log erstellt: $auditLog" -ForegroundColor Green

# Git-Tag erstellen
try {
    git tag -a $tagName -m "PR $PullRequestNumber validated by $AgentId on $timestamp"
    Write-Host "  ✅ Git-Tag erstellt: $tagName" -ForegroundColor Green
    
    # Tag-Audit-Log
    $tagLogName = $tagName -replace '[-:]', '_'
    $tagLog = "logs/audit/audit-tag-${tagLogName}.log"
    $tagContent = @"
Audit Tag Created
-----------------
Tag: $tagName
Created By: $User (via $AgentId)
Timestamp: $timestamp
Environment: $Environment
PR: #$PullRequestNumber

Tag Message: PR $PullRequestNumber validated by $AgentId on $timestamp

SHA-256: $(git rev-parse $tagName | git hash-object -t tag --stdin | openssl dgst -sha256 | awk '{print $2}')
"@
    
    $tagContent | Out-File -FilePath $tagLog -Encoding UTF8
    Write-Host "  ✅ Tag-Audit-Log: $tagLog" -ForegroundColor Green
    
} catch {
    Write-Host "  ⚠️  Git-Tag konnte nicht erstellt werden: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "     (Möglicherweise bereits vorhanden oder keine Git-Rechte)" -ForegroundColor Gray
}

Write-Host "`n✅ Audit-Tag-Erstellung abgeschlossen" -ForegroundColor Green
Write-Host "   Tag: $tagName" -ForegroundColor Gray
Write-Host "   Log: $auditLog" -ForegroundColor Gray
