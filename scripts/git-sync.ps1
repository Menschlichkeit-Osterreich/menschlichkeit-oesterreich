param(
    [ValidateSet("status", "commit", "sync", "hooks")]
    [string]$Action = "status",

    [string]$Message,

    [string]$Remote = "origin",

    [switch]$IncludeUntracked,

    [switch]$SkipPull,

    [switch]$SkipPush,

    [switch]$SkipChecks
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [switch]$AllowFailure
    )

    $output = & git @Arguments 2>&1
    $exitCode = $LASTEXITCODE
    $text = ($output | Out-String).Trim()

    if (-not $AllowFailure -and $exitCode -ne 0) {
        throw "git $($Arguments -join ' ') fehlgeschlagen.`n$text"
    }

    [pscustomobject]@{
        ExitCode = $exitCode
        Output   = $text
    }
}

function Get-CurrentBranch {
    $branch = (Invoke-Git -Arguments @("branch", "--show-current")).Output
    if ([string]::IsNullOrWhiteSpace($branch)) {
        throw "Detached HEAD erkannt. Bitte zuerst einen Branch auschecken."
    }

    $branch
}

function Get-UpstreamBranch {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Branch
    )

    $result = Invoke-Git -Arguments @("rev-parse", "--abbrev-ref", "$Branch@{upstream}") -AllowFailure
    if ($result.ExitCode -ne 0 -or [string]::IsNullOrWhiteSpace($result.Output)) {
        return $null
    }

    $result.Output
}

function Get-AheadBehind {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Upstream
    )

    $result = Invoke-Git -Arguments @("rev-list", "--left-right", "--count", "$Upstream...HEAD")
    $parts = $result.Output -split "\s+"

    if ($parts.Length -lt 2) {
        return [pscustomobject]@{
            Behind = 0
            Ahead  = 0
        }
    }

    [pscustomobject]@{
        Behind = [int]$parts[0]
        Ahead  = [int]$parts[1]
    }
}

function Get-StatusLines {
    $result = Invoke-Git -Arguments @("status", "--porcelain=v1")
    if ([string]::IsNullOrWhiteSpace($result.Output)) {
        return @()
    }

    $result.Output -split "`r?`n" | Where-Object { $_.Trim().Length -gt 0 }
}

function Get-StagedFiles {
    $result = Invoke-Git -Arguments @("diff", "--cached", "--name-only")
    if ([string]::IsNullOrWhiteSpace($result.Output)) {
        return @()
    }

    $result.Output -split "`r?`n" | Where-Object { $_.Trim().Length -gt 0 }
}

function Test-ConventionalCommitMessage {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CommitMessage
    )

    $pattern = '^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([^)]+\))?!?: .+'
    if ($CommitMessage -notmatch $pattern) {
        throw "Commit-Message muss Conventional Commits folgen, z. B. 'chore(repo): sync tooling'."
    }
}

function Invoke-GovernanceCheckIfNeeded {
    param(
        [string[]]$Files
    )

    if ($SkipChecks) {
        Write-Host "⏭ Governance-Check uebersprungen." -ForegroundColor Yellow
        return
    }

    $needsGovernanceCheck = $false
    foreach ($file in $Files) {
        if ($file -match '^(AGENTS\.md|CLAUDE\.md|agents\.md|package\.json|mcp\.json|.*\.code-workspace|\.claude/|\.github/|\.vscode/|scripts/validate-ai-governance\.mjs)') {
            $needsGovernanceCheck = $true
            break
        }
    }

    if (-not $needsGovernanceCheck) {
        return
    }

    Write-Host "🔎 Governance-Dateien erkannt - starte npm run governance:check ..." -ForegroundColor Cyan
    npm run governance:check
    if ($LASTEXITCODE -ne 0) {
        throw "Governance-Check fehlgeschlagen. Commit wurde nicht ausgefuehrt."
    }
}

function Stage-CommitChanges {
    Write-Host "📦 Stage verfolgte Aenderungen ..." -ForegroundColor Cyan
    Invoke-Git -Arguments @("add", "--update") | Out-Null

    if ($IncludeUntracked) {
        $untracked = (Invoke-Git -Arguments @("ls-files", "--others", "--exclude-standard")).Output
        if (-not [string]::IsNullOrWhiteSpace($untracked)) {
            $files = $untracked -split "`r?`n" | Where-Object { $_.Trim().Length -gt 0 }
            if ($files.Count -gt 0) {
                Write-Host "📎 Stage untracked Dateien ..." -ForegroundColor Cyan
                Invoke-Git -Arguments (@("add", "--") + $files) | Out-Null
            }
        }
    }
}

function Show-SyncStatus {
    param(
        [switch]$RefreshRemote
    )

    if ($RefreshRemote) {
        Write-Host "🔄 Hole Remote-Status von $Remote ..." -ForegroundColor Cyan
        Invoke-Git -Arguments @("fetch", $Remote, "--prune") | Out-Null
    }

    $branch = Get-CurrentBranch
    $upstream = Get-UpstreamBranch -Branch $branch
    $lines = Get-StatusLines

    $staged = 0
    $unstaged = 0
    $untracked = 0

    foreach ($line in $lines) {
        if ($line.StartsWith("??")) {
            $untracked++
            continue
        }

        if ($line.Length -ge 2) {
            $indexState = $line[0]
            $workTreeState = $line[1]

            if ($indexState -ne ' ') {
                $staged++
            }
            if ($workTreeState -ne ' ') {
                $unstaged++
            }
        }
    }

    Write-Host ""
    Write-Host "Git Sync Status" -ForegroundColor Green
    Write-Host "Branch:   $branch"

    if ($null -ne $upstream) {
        $delta = Get-AheadBehind -Upstream $upstream
        Write-Host "Upstream: $upstream"
        Write-Host "Ahead:    $($delta.Ahead)"
        Write-Host "Behind:   $($delta.Behind)"
    }
    else {
        Write-Host "Upstream: <nicht gesetzt>"
    }

    Write-Host "Staged:   $staged"
    Write-Host "Unstaged: $unstaged"
    Write-Host "Untracked:$untracked"

    $gpgSign = (Invoke-Git -Arguments @("config", "--get", "commit.gpgsign") -AllowFailure).Output
    if ([string]::IsNullOrWhiteSpace($gpgSign)) {
        Write-Host "GPG Sign: <nicht gesetzt>" -ForegroundColor Yellow
    }
    else {
        Write-Host "GPG Sign: $gpgSign"
    }

    if ($lines.Count -gt 0) {
        Write-Host ""
        Write-Host "Geaenderte Dateien:" -ForegroundColor Cyan
        foreach ($line in $lines | Select-Object -First 20) {
            Write-Host "  $line"
        }
    }

    Write-Host ""
}

function Invoke-CommitFlow {
    if ([string]::IsNullOrWhiteSpace($Message)) {
        throw "Fuer -Action commit ist -Message erforderlich."
    }

    Test-ConventionalCommitMessage -CommitMessage $Message
    Stage-CommitChanges

    $stagedFiles = Get-StagedFiles
    if ($stagedFiles.Count -eq 0) {
        throw "Keine gestagten Aenderungen gefunden. Nichts zu committen."
    }

    Invoke-GovernanceCheckIfNeeded -Files $stagedFiles

    Write-Host "📝 Committe mit Message: $Message" -ForegroundColor Green
    Invoke-Git -Arguments @("commit", "-m", $Message) | Out-Null
    Write-Host "✅ Commit erstellt." -ForegroundColor Green
}

function Test-WorkingTreeClean {
    $lines = Get-StatusLines
    if ($lines.Count -gt 0) {
        throw "Arbeitsbaum ist nicht sauber. Bitte Status pruefen, bevor ein Pull/Rebase laeuft."
    }
}

function Invoke-SyncFlow {
    Show-SyncStatus -RefreshRemote

    if (-not [string]::IsNullOrWhiteSpace($Message)) {
        Invoke-CommitFlow
        Show-SyncStatus -RefreshRemote
    }

    $branch = Get-CurrentBranch
    $upstream = Get-UpstreamBranch -Branch $branch

    if ($null -eq $upstream) {
        if ($SkipPush) {
            Write-Host "ℹ Kein Upstream gesetzt und Push uebersprungen." -ForegroundColor Yellow
            return
        }

        Write-Host "⬆ Setze Upstream und pushe Branch ..." -ForegroundColor Cyan
        Invoke-Git -Arguments @("push", "-u", $Remote, "HEAD") | Out-Null
        Write-Host "✅ Branch wurde zu $Remote gepusht und mit Upstream verknuepft." -ForegroundColor Green
        return
    }

    $delta = Get-AheadBehind -Upstream $upstream

    if ($delta.Behind -gt 0 -and -not $SkipPull) {
        Test-WorkingTreeClean
        Write-Host "⬇ Pull --rebase von $upstream ..." -ForegroundColor Cyan
        Invoke-Git -Arguments @("pull", "--rebase", $Remote, $branch) | Out-Null
        $delta = Get-AheadBehind -Upstream $upstream
    }

    if ($delta.Ahead -gt 0 -and -not $SkipPush) {
        Write-Host "⬆ Push nach $upstream ..." -ForegroundColor Cyan
        Invoke-Git -Arguments @("push", $Remote, "HEAD") | Out-Null
        Write-Host "✅ Sync abgeschlossen." -ForegroundColor Green
        return
    }

    if ($delta.Behind -eq 0 -and $delta.Ahead -eq 0) {
        Write-Host "✅ Branch ist bereits synchron." -ForegroundColor Green
        return
    }

    Write-Host "ℹ Sync beendet. Ahead=$($delta.Ahead), Behind=$($delta.Behind)." -ForegroundColor Yellow
}

function Enable-GitHooks {
    Invoke-Git -Arguments @("config", "core.hooksPath", ".githooks") | Out-Null
    Write-Host "✅ Git-Hooks aktiviert: core.hooksPath=.githooks" -ForegroundColor Green
}

switch ($Action) {
    "status" {
        Show-SyncStatus -RefreshRemote
    }
    "commit" {
        Invoke-CommitFlow
    }
    "sync" {
        Invoke-SyncFlow
    }
    "hooks" {
        Enable-GitHooks
    }
}
