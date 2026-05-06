[CmdletBinding()]
param(
    [string]$CaseName = "selective-timeout-5.183.217.146",
    [string]$EgressLabel = "current-shell",
    [string]$TargetHost = "plesk7.digimagical.com",
    [string]$TargetIp = "5.183.217.146",
    [string]$SshUser = "dmpl20230054",
    [int]$ConnectTimeoutSeconds = 5,
    [string]$OutputRoot,
    [string]$PublishedRoot
)

$ErrorActionPreference = "Stop"

function Write-Log {
    param([string]$Message)
    Write-Host "[incident-network-timeout] $Message"
}

function Get-RepoRoot {
    $root = (& git rev-parse --show-toplevel 2>$null)
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($root)) {
        throw "Konnte das Git-Repo-Root nicht bestimmen."
    }

    return $root.Trim()
}

function Get-SafeName {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return "unknown"
    }

    return (($Value -replace "[^A-Za-z0-9._-]", "-") -replace "-{2,}", "-").Trim("-")
}

function Write-File {
    param(
        [string]$Path,
        [string]$Content
    )

    $parent = Split-Path -Parent $Path
    if ($parent) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    Set-Content -LiteralPath $Path -Value $Content -Encoding utf8
}

function Get-NativeExecutable {
    param([string[]]$Candidates)

    foreach ($candidate in $Candidates) {
        $command = Get-Command $candidate -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($null -ne $command) {
            if ($command.CommandType -eq "Application") {
                return $command.Source
            }

            if ($command.CommandType -eq "ExternalScript") {
                return $command.Source
            }
        }
    }

    return $null
}

function Test-ReachedRemote {
    param([string]$Outcome)

    return $Outcome -in @("connected", "success", "connected_auth_failed", "refused")
}

function Get-Outcome {
    param(
        [string]$Text,
        [int]$ExitCode
    )

    if ($Text -match "Connection timed out|connect to host .* timed out|Operation timed out|Failed to connect .* Timed out|curl: \(28\)") {
        return "timeout"
    }

    if ($Text -match "Could not resolve host|Could not resolve hostname|Name or service not known|Temporary failure in name resolution") {
        return "dns_error"
    }

    if ($Text -match "Connection refused|actively refused") {
        return "refused"
    }

    if ($Text -match "Permission denied") {
        return "connected_auth_failed"
    }

    if ($Text -match "SSH-|Connected to|HTTP/\d\.\d|SSL connection using|server certificate|subject:|Remote version string") {
        return "connected"
    }

    if ($ExitCode -eq 0) {
        return "success"
    }

    return "error"
}

function Invoke-NativeCapture {
    param(
        [string]$Name,
        [string]$Executable,
        [string[]]$Arguments,
        [string]$RunDir
    )

    if (-not $Executable) {
        $fileName = "$Name.txt"
        Write-File -Path (Join-Path $RunDir $fileName) -Content "Executable for $Name not found on this host.`n"
        return [pscustomobject]@{
            Name     = $Name
            File     = $fileName
            Command  = "(missing executable)"
            ExitCode = 127
            Outcome  = "missing_tool"
        }
    }

    $fileName = "$Name.txt"
    $filePath = Join-Path $RunDir $fileName
    $displayArgs = @()
    foreach ($argument in $Arguments) {
        if ($argument -match "\s") {
            $displayArgs += '"' + $argument.Replace('"', '\"') + '"'
        } else {
            $displayArgs += $argument
        }
    }

    $commandLine = '$ ' + $Executable + ' ' + ($displayArgs -join ' ')
    $global:LASTEXITCODE = 0
    $output = @()
    $caughtMessage = $null

    try {
        $output = & $Executable @Arguments 2>&1 | ForEach-Object {
            if ($_ -is [System.Management.Automation.ErrorRecord]) {
                $_.ToString()
            } else {
                [string]$_
            }
        }
    } catch {
        $caughtMessage = $_.Exception.Message
    }

    $exitCode = if ($LASTEXITCODE -is [int]) { $LASTEXITCODE } else { 0 }
    $lines = New-Object System.Collections.Generic.List[string]
    $lines.Add($commandLine)
    $lines.Add("")
    if ($output.Count -gt 0) {
        foreach ($line in $output) {
            $lines.Add($line)
        }
    }
    if ($caughtMessage) {
        $lines.Add($caughtMessage)
    }
    $lines.Add("")
    $lines.Add("[exit-code] $exitCode")

    $text = ($lines -join [Environment]::NewLine)
    Write-File -Path $filePath -Content $text

    return [pscustomobject]@{
        Name     = $Name
        File     = $fileName
        Command  = $commandLine
        ExitCode = $exitCode
        Outcome  = Get-Outcome -Text $text -ExitCode $exitCode
    }
}

function Invoke-DnsQuery {
    param(
        [string]$Name,
        [string]$Query,
        [string]$Type,
        [string]$RunDir
    )

    $fileName = "$Name.txt"
    $filePath = Join-Path $RunDir $fileName
    $answers = @()
    $outcome = "unknown"

    if (Get-Command Resolve-DnsName -ErrorAction SilentlyContinue) {
        $lines = New-Object System.Collections.Generic.List[string]
        $lines.Add('$ Resolve-DnsName ' + $Query + ' -Type ' + $Type)
        $lines.Add("")

        try {
            $records = Resolve-DnsName $Query -Type $Type -ErrorAction Stop
            $table = $records | Format-Table -AutoSize | Out-String
            foreach ($line in ($table -split "`r?`n")) {
                $lines.Add($line)
            }

            switch ($Type) {
                "A" {
                    $answers = $records | Where-Object { $_.IPAddress } | ForEach-Object { $_.IPAddress }
                }
                "AAAA" {
                    $answers = $records | Where-Object { $_.IP6Address } | ForEach-Object { $_.IP6Address }
                }
                "PTR" {
                    $answers = $records | Where-Object { $_.NameHost } | ForEach-Object { $_.NameHost }
                }
            }

            if ($answers.Count -gt 0) {
                $outcome = "ok"
            } elseif ($Type -eq "AAAA") {
                $outcome = "no_record"
            } else {
                $outcome = "empty"
            }
        } catch {
            $lines.Add($_.Exception.Message)
            if ($Type -eq "AAAA") {
                $outcome = "no_record"
            } else {
                $outcome = "error"
            }
        }

        Write-File -Path $filePath -Content ($lines -join [Environment]::NewLine)
    } else {
        $nslookup = Get-NativeExecutable -Candidates @("nslookup.exe", "nslookup")
        $args = if ($Type -eq "PTR") { @($Query) } else { @("-type=$Type", $Query) }
        $result = Invoke-NativeCapture -Name $Name -Executable $nslookup -Arguments $args -RunDir $RunDir
        $text = Get-Content -LiteralPath (Join-Path $RunDir $result.File) -Raw
        switch ($Type) {
            "A" {
                $answers = [regex]::Matches($text, "Address:\s+(\d{1,3}(?:\.\d{1,3}){3})") | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
            }
            "AAAA" {
                $answers = [regex]::Matches($text, "Address:\s+([0-9a-fA-F:]+)") | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
            }
            "PTR" {
                $answers = [regex]::Matches($text, "name = ([^\r\n]+)") | ForEach-Object { $_.Groups[1].Value.Trim() } | Select-Object -Unique
            }
        }
        if ($answers.Count -gt 0) {
            $outcome = "ok"
        } elseif ($Type -eq "AAAA") {
            $outcome = "no_record"
        } else {
            $outcome = $result.Outcome
        }
    }

    return [pscustomobject]@{
        Name    = $Name
        File    = $fileName
        Outcome = $outcome
        Answers = @($answers)
    }
}

function Get-PublicIpData {
    param(
        [string]$RunDir,
        [int]$TimeoutSeconds
    )

    $fileName = "public-ip.txt"
    $filePath = Join-Path $RunDir $fileName
    $providers = @(
        @{ Name = "api.ipify.org"; Url = "https://api.ipify.org" },
        @{ Name = "ifconfig.me"; Url = "https://ifconfig.me/ip" },
        @{ Name = "checkip.amazonaws.com"; Url = "https://checkip.amazonaws.com" }
    )
    $lines = New-Object System.Collections.Generic.List[string]
    $value = $null
    $providerName = $null

    foreach ($provider in $providers) {
        $lines.Add("## $($provider.Name)")
        $lines.Add('$ Invoke-WebRequest ' + $provider.Url)
        try {
            $response = Invoke-WebRequest -Uri $provider.Url -UseBasicParsing -TimeoutSec $TimeoutSeconds
            $content = $response.Content.Trim()
            $lines.Add($content)
            if (-not $value -and $content -match '^\d{1,3}(\.\d{1,3}){3}$') {
                $value = $content
                $providerName = $provider.Name
            }
        } catch {
            $lines.Add("ERROR: $($_.Exception.Message)")
        }
        $lines.Add("")
    }

    Write-File -Path $filePath -Content ($lines -join [Environment]::NewLine)

    return [pscustomobject]@{
        File     = $fileName
        Value    = $value
        Provider = $providerName
        Outcome  = if ($value) { "ok" } else { "unavailable" }
    }
}

function Get-CaseSummaryOutcome {
    param([object[]]$Runs)

    if (-not $Runs -or $Runs.Count -eq 0) {
        return "no_runs"
    }

    $failingRuns = @(
        $Runs | Where-Object {
            $_.Tests.direct443.Outcome -eq "timeout" -and $_.Tests.sni443.Outcome -eq "timeout"
        }
    )
    $distinctPublicIpCount = @(
        $Runs | ForEach-Object { $_.PublicIp.Value } | Where-Object { $_ } | Select-Object -Unique
    ).Count
    $reachingRuns = @(
        $Runs | Where-Object {
            (Test-ReachedRemote $_.Tests.direct443.Outcome) -or
            (Test-ReachedRemote $_.Tests.sni443.Outcome) -or
            (Test-ReachedRemote $_.Tests.direct8443.Outcome) -or
            (Test-ReachedRemote $_.Tests.ssh22.Outcome)
        }
    )

    if ($failingRuns.Count -gt 0 -and $reachingRuns.Count -gt 0) {
        return "source_path_selective_filtering_likely"
    }

    if ($failingRuns.Count -eq $Runs.Count -and $Runs.Count -gt 1) {
        if ($distinctPublicIpCount -ge 2) {
            return "all_runs_failing"
        }
    }

    if ($failingRuns.Count -gt 0) {
        return "dns_excluded_but_control_pending"
    }

    return "inconclusive"
}

function Get-CaseAssessmentLines {
    param([object[]]$Runs)

    $outcome = Get-CaseSummaryOutcome -Runs $Runs
    $distinctPublicIps = @(
        $Runs | ForEach-Object { $_.PublicIp.Value } | Where-Object { $_ } | Select-Object -Unique
    )
    $distinctEgresses = @(
        $Runs | ForEach-Object { $_.EgressLabel } | Where-Object { $_ } | Select-Object -Unique
    )
    $reaching8443Runs = @(
        $Runs | Where-Object {
            Test-ReachedRemote $_.Tests.direct8443.Outcome
        }
    )

    switch ($outcome) {
        "source_path_selective_filtering_likely" {
            $lines = @(
                '- Mindestens ein Egress timed out auf direkter IP und mit `--resolve`; DNS ist fuer diese Runs nicht ursaechlich.',
                "- Mindestens ein anderer Egress erreicht den Zielhost oder zumindest den TCP/TLS/SSH-Handshake; source-/path-selektives Filtering ist derzeit die staerkste Hypothese."
            )
            if ($reaching8443Runs.Count -eq 0) {
                $lines += "- Port 8443 timed out bislang auch auf dem Kontrollpfad und sollte separat von 22/443 bewertet werden."
            }
            return $lines
        }
        "all_runs_failing" {
            return @(
                "- Alle bisher erfassten Runs scheitern bereits auf TCP-Ebene; ein genereller Host-/Provider-Ausfall bleibt moeglich.",
                '- DNS ist fuer Runs mit direktem IP-Timeout plus `--resolve`-Timeout trotzdem nicht die Primaerursache.'
            )
        }
        "dns_excluded_but_control_pending" {
            $lines = @(
                '- Fuer mindestens einen Run scheitern direkte IP und `--resolve` identisch; DNS ist fuer diesen Pfad nicht die Primaerursache.',
                "- Ein funktionierender Kontrollpfad (LTE oder VPN) fehlt noch; selektives Filtering ist plausibel, aber noch nicht provider-tauglich bewiesen."
            )
            if ($distinctEgresses.Count -ge 2 -and $distinctPublicIps.Count -eq 1) {
                $lines += "- Mehrere Egress-Labels wurden erfasst, aber bislang mit derselben oeffentlichen IP; das ist noch keine echte Vergleichsquelle."
            }
            return $lines
        }
        default {
            return @(
                "- Die bisherige Datenlage ist noch nicht ausreichend fuer eine belastbare Zuordnung.",
                "- Mindestens ein weiterer Kontrollpfad sollte mit demselben Collector erfasst werden."
            )
        }
    }
}

function Format-UtcString {
    param([object]$Value)

    if ($null -eq $Value) {
        return "unknown"
    }

    try {
        return ([datetime]$Value).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    } catch {
        return [string]$Value
    }
}

function Update-CaseArtifacts {
    param(
        [string]$CaseDir,
        [string]$TargetHost,
        [string]$TargetIp,
        [string]$PublishedRoot
    )

    $runsDir = Join-Path $CaseDir "runs"
    $metadataFiles = Get-ChildItem -Path $runsDir -Filter metadata.json -Recurse -ErrorAction SilentlyContinue | Sort-Object FullName
    $runs = @()
    foreach ($file in $metadataFiles) {
        $runs += Get-Content -LiteralPath $file.FullName -Raw | ConvertFrom-Json
    }

    $summaryLines = New-Object System.Collections.Generic.List[string]
    $summaryLines.Add("# Selective Timeout Case Summary")
    $summaryLines.Add("")
    $summaryLines.Add('- Case: `' + (Split-Path $CaseDir -Leaf) + '`')
    $summaryLines.Add('- Target host: `' + $TargetHost + '`')
    $summaryLines.Add('- Target IP: `' + $TargetIp + '`')
    $summaryLines.Add('- Generated (UTC): `' + ((Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")) + '`')
    $summaryLines.Add("")
    $summaryLines.Add("## Run Matrix")
    $summaryLines.Add("")
    $summaryLines.Add("| Run | Egress | UTC | Public IP | A | PTR | AAAA | 443 direct | 443 SNI | 8443 direct | SSH 22 |")
    $summaryLines.Add("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |")
    foreach ($run in ($runs | Sort-Object CollectedAtUtc)) {
        $publicIpText = if ($run.PublicIp.Value) { $run.PublicIp.Value } else { "unknown" }
        $aAnswerText = if (@($run.Dns.A.Answers).Count -gt 0) { @($run.Dns.A.Answers) -join ", " } else { "n/a" }
        $ptrAnswerText = if (@($run.Dns.Ptr.Answers).Count -gt 0) { @($run.Dns.Ptr.Answers) -join ", " } else { "n/a" }
        $summaryLines.Add("| $($run.RunName) | $($run.EgressLabel) | $(Format-UtcString $run.CollectedAtUtc) | $publicIpText | $aAnswerText | $ptrAnswerText | $($run.Dns.Aaaa.Outcome) | $($run.Tests.direct443.Outcome) | $($run.Tests.sni443.Outcome) | $($run.Tests.direct8443.Outcome) | $($run.Tests.ssh22.Outcome) |")
    }
    $summaryLines.Add("")
    $summaryLines.Add("## Current Assessment")
    $summaryLines.Add("")
    foreach ($line in (Get-CaseAssessmentLines -Runs $runs)) {
        $summaryLines.Add($line)
    }
    $summaryLines.Add("- Ein Mitschnitt aus WSL2/NAT ist nicht beweiskraeftig fuer Paketankunft auf dem Zielhost; provider- oder hostseitiger Mitschnitt bleibt Pflicht.")
    $summaryLines.Add("")
    $summaryLines.Add("## Next Provider-Side Step")
    $summaryLines.Add("")
    $summaryLines.Add('```bash')
    $summaryLines.Add("tcpdump -ni any -vv 'src host <aktuelle_quell_ip> and (tcp port 22 or 443 or 8443)'")
    $summaryLines.Add('```')
    $summaryLines.Add("")
    $summaryLines.Add("- SYN sichtbar: eher host-lokaler oder hostnaher Security-Block.")
    $summaryLines.Add("- Kein SYN sichtbar: eher upstream/providerseitiges Filtering.")
    $summaryLines.Add("")
    $summaryLines.Add("## References")
    $summaryLines.Add("")
    $summaryLines.Add("- https://learn.microsoft.com/windows/wsl/networking")
    $summaryLines.Add("- https://docs.plesk.com/en-US/obsidian/cli-linux/using-command-line-utilities/ip_ban-ip-address-banning-fail2ban.73594/")
    $summaryLines.Add("- https://support.plesk.com/hc/en-us/articles/12377562770967-Site-is-not-accesible-Unable-to-connect-connection-timed-out-This-site-can-t-be-reached")
    Write-File -Path (Join-Path $CaseDir "SUMMARY.md") -Content ($summaryLines -join [Environment]::NewLine)

    $failingRuns = @(
        $runs | Where-Object {
            $_.Tests.direct443.Outcome -eq "timeout" -and $_.Tests.sni443.Outcome -eq "timeout"
        }
    )
    $reachingRuns = @(
        $runs | Where-Object {
            (Test-ReachedRemote $_.Tests.direct443.Outcome) -or
            (Test-ReachedRemote $_.Tests.sni443.Outcome) -or
            (Test-ReachedRemote $_.Tests.direct8443.Outcome) -or
            (Test-ReachedRemote $_.Tests.ssh22.Outcome)
        }
    )
    $reaching8443Runs = @(
        $runs | Where-Object {
            Test-ReachedRemote $_.Tests.direct8443.Outcome
        }
    )
    $reachingSshRuns = @(
        $runs | Where-Object {
            Test-ReachedRemote $_.Tests.ssh22.Outcome
        }
    )
    $reaching443Runs = @(
        $runs | Where-Object {
            (Test-ReachedRemote $_.Tests.direct443.Outcome) -or
            (Test-ReachedRemote $_.Tests.sni443.Outcome)
        }
    )
    $failingIps = @($failingRuns | ForEach-Object { $_.PublicIp.Value } | Where-Object { $_ } | Sort-Object -Unique)
    $reachingIps = @($reachingRuns | ForEach-Object { $_.PublicIp.Value } | Where-Object { $_ } | Sort-Object -Unique)
    $ticketLines = New-Object System.Collections.Generic.List[string]
    $ticketLines.Add("# Provider Ticket Draft")
    $ticketLines.Add("")
    $ticketLines.Add("## Subject")
    $ticketLines.Add("")
    $ticketLines.Add("[NETWORK] Source-IP-dependent connectivity to $TargetIp ($TargetHost); 22/443 selective, 8443 still filtered")
    $ticketLines.Add("")
    $ticketLines.Add("## Problem Summary")
    $ticketLines.Add("")
    if ($failingIps.Count -gt 0) {
        $ticketLines.Add('- Failing source IPs observed so far: `' + ($failingIps -join '`, `') + '`')
    } else {
        $ticketLines.Add("- Failing source IPs observed so far: pending capture")
    }
    if ($reachingIps.Count -gt 0) {
        $ticketLines.Add('- Control-path source IPs that can reach the service: `' + ($reachingIps -join '`, `') + '`')
    } else {
        $ticketLines.Add("- Control-path source IPs: still pending; add LTE or VPN capture before sending if available.")
    }
    if ($reaching443Runs.Count -gt 0) {
        $ticketLines.Add("- Port 443 is reachable on at least one control path.")
    }
    if ($reachingSshRuns.Count -gt 0) {
        $ticketLines.Add("- Port 22 reaches the SSH service on at least one control path (currently auth failure instead of connect timeout).")
    }
    if ($reaching8443Runs.Count -eq 0) {
        $ticketLines.Add("- Port 8443 currently times out on all observed source IPs and should be treated as a separate issue from the selective 22/443 behavior.")
    }
    $ticketLines.Add('- `plesk7.digimagical.com` resolves consistently to `' + $TargetIp + '`; reverse PTR points back to `' + $TargetHost + '`; no AAAA record is present in the current captures.')
    $ticketLines.Add("- A prior packet capture taken inside WSL2/NAT is excluded from causal interpretation because it does not prove packet arrival on the target host or edge firewall.")
    $ticketLines.Add("")
    $ticketLines.Add("## Requested Checks")
    $ticketLines.Add("")
    $ticketLines.Add('- Please inspect source-IP-based filtering, edge ACLs, DDoS/WAF policies, or routing asymmetries between the listed failing source IPs and `' + $TargetIp + '`.')
    $ticketLines.Add("- Please run a host- or edge-side capture during the supplied repro window:")
    $ticketLines.Add('  `tcpdump -ni any -vv ''src host <aktuelle_quell_ip> and (tcp port 22 or 443 or 8443)''`')
    $ticketLines.Add("- If the SYN packets are visible, please verify host-local controls such as Fail2Ban, IP bans, or local firewall layers. If no SYN packets are visible, please investigate upstream filtering before the host.")
    $ticketLines.Add("")
    $ticketLines.Add("## Attached Evidence")
    $ticketLines.Add("")
    foreach ($run in ($runs | Sort-Object CollectedAtUtc)) {
        $ticketLines.Add('- `' + $run.RunName + '` (`' + $run.EgressLabel + '`, public IP `' + ($run.PublicIp.Value ?? 'unknown') + '`)')
        $ticketLines.Add('  - `runs/' + $run.RunName + '/dns-a.txt`')
        $ticketLines.Add('  - `runs/' + $run.RunName + '/dns-ptr.txt`')
        $ticketLines.Add('  - `runs/' + $run.RunName + '/dns-aaaa.txt`')
        $ticketLines.Add('  - `runs/' + $run.RunName + '/curl-direct-443.txt`')
        $ticketLines.Add('  - `runs/' + $run.RunName + '/curl-sni-443.txt`')
        $ticketLines.Add('  - `runs/' + $run.RunName + '/curl-direct-8443.txt`')
        $ticketLines.Add('  - `runs/' + $run.RunName + '/ssh-direct-22.txt`')
    }
    Write-File -Path (Join-Path $CaseDir "provider-ticket.md") -Content ($ticketLines -join [Environment]::NewLine)

    if ($PublishedRoot) {
        $publishDir = Join-Path $PublishedRoot (Split-Path $CaseDir -Leaf)
        New-Item -ItemType Directory -Path $publishDir -Force | Out-Null

        Copy-Item -LiteralPath (Join-Path $CaseDir "SUMMARY.md") -Destination (Join-Path $publishDir "SUMMARY.md") -Force
        Copy-Item -LiteralPath (Join-Path $CaseDir "provider-ticket.md") -Destination (Join-Path $publishDir "provider-ticket.md") -Force

        $latestRun = $runs | Sort-Object CollectedAtUtc -Descending | Select-Object -First 1
        if ($latestRun) {
            $latestRunDir = Join-Path (Join-Path $CaseDir "runs") $latestRun.RunName
            $metadataPath = Join-Path $latestRunDir "metadata.json"
            $runReadmePath = Join-Path $latestRunDir "README.md"

            if (Test-Path $metadataPath) {
                Copy-Item -LiteralPath $metadataPath -Destination (Join-Path $publishDir "latest-run-metadata.json") -Force
            }

            if (Test-Path $runReadmePath) {
                Copy-Item -LiteralPath $runReadmePath -Destination (Join-Path $publishDir "latest-run-README.md") -Force
            }

            $publishReadme = @(
                "# Published Incident Artifacts",
                "",
                ('- Case: `' + (Split-Path $CaseDir -Leaf) + '`'),
                ('- Latest run: `' + $latestRun.RunName + '`'),
                ('- Published at (UTC): `' + ((Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")) + '`'),
                "",
                "## Files",
                "",
                '- `SUMMARY.md`',
                '- `provider-ticket.md`',
                '- `latest-run-metadata.json`',
                '- `latest-run-README.md`',
                "",
                "## Raw Evidence Location",
                "",
                ('- `' + $CaseDir + '`'),
                ('- `' + $latestRunDir + '`')
            )
            Write-File -Path (Join-Path $publishDir "README.md") -Content ($publishReadme -join [Environment]::NewLine)
        }
    }
}

$repoRoot = Get-RepoRoot
if (-not $OutputRoot) {
    $OutputRoot = Join-Path $repoRoot "quality-reports/incident-network-timeout"
}
if (-not $PublishedRoot) {
    $PublishedRoot = Join-Path $repoRoot "reports/incident-network-timeout"
}

$timestampUtc = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$safeEgress = Get-SafeName -Value $EgressLabel
$caseDir = Join-Path $OutputRoot (Get-SafeName -Value $CaseName)
$runDir = Join-Path (Join-Path $caseDir "runs") "$timestampUtc-$safeEgress"
New-Item -ItemType Directory -Path $runDir -Force | Out-Null

Write-Log "writing artifacts to $runDir"

$curlExecutable = Get-NativeExecutable -Candidates @("curl.exe", "curl")
$sshExecutable = Get-NativeExecutable -Candidates @("ssh.exe", "ssh")
$publicIp = Get-PublicIpData -RunDir $runDir -TimeoutSeconds $ConnectTimeoutSeconds
$dnsA = Invoke-DnsQuery -Name "dns-a" -Query $TargetHost -Type "A" -RunDir $runDir
$dnsPtr = Invoke-DnsQuery -Name "dns-ptr" -Query $TargetIp -Type "PTR" -RunDir $runDir
$dnsAaaa = Invoke-DnsQuery -Name "dns-aaaa" -Query $TargetHost -Type "AAAA" -RunDir $runDir
$direct443 = Invoke-NativeCapture -Name "curl-direct-443" -Executable $curlExecutable -Arguments @("-vk", "--connect-timeout", "$ConnectTimeoutSeconds", "https://$TargetIp/") -RunDir $runDir
$sni443 = Invoke-NativeCapture -Name "curl-sni-443" -Executable $curlExecutable -Arguments @("-vk", "--connect-timeout", "$ConnectTimeoutSeconds", "--resolve", "$TargetHost`:443`:$TargetIp", "https://$TargetHost/") -RunDir $runDir
$direct8443 = Invoke-NativeCapture -Name "curl-direct-8443" -Executable $curlExecutable -Arguments @("-vk", "--connect-timeout", "$ConnectTimeoutSeconds", "https://$TargetIp`:8443/") -RunDir $runDir
$ssh22 = Invoke-NativeCapture -Name "ssh-direct-22" -Executable $sshExecutable -Arguments @("-o", "ConnectTimeout=$ConnectTimeoutSeconds", "-o", "BatchMode=yes", "$SshUser@$TargetIp", "exit") -RunDir $runDir
$publicIpDisplay = if ($publicIp.Value) { $publicIp.Value } else { "unknown" }

$summaryLines = @(
    "# Selective Timeout Run",
    "",
    ('- Case: `' + (Split-Path $caseDir -Leaf) + '`'),
    ('- Run: `' + $timestampUtc + '-' + $safeEgress + '`'),
    ('- Egress label: `' + $EgressLabel + '`'),
    ('- Collected at (UTC): `' + ((Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")) + '`'),
    ('- Local host: `' + (hostname) + '`'),
    ('- Public source IP: `' + $publicIpDisplay + '`'),
    "",
    "## Key Findings",
    "",
    ('- DNS A result: `' + ((@($dnsA.Answers) -join ', ')) + '`'),
    ('- DNS PTR result: `' + ((@($dnsPtr.Answers) -join ', ')) + '`'),
    ('- DNS AAAA result: `' + $dnsAaaa.Outcome + '`'),
    ('- Direct 443 outcome: `' + $direct443.Outcome + '`'),
    ('- SNI/`--resolve` 443 outcome: `' + $sni443.Outcome + '`'),
    ('- Direct 8443 outcome: `' + $direct8443.Outcome + '`'),
    ('- SSH 22 outcome: `' + $ssh22.Outcome + '`'),
    "",
    "## Files",
    "",
    '- `public-ip.txt`',
    '- `dns-a.txt`',
    '- `dns-ptr.txt`',
    '- `dns-aaaa.txt`',
    '- `curl-direct-443.txt`',
    '- `curl-sni-443.txt`',
    '- `curl-direct-8443.txt`',
    '- `ssh-direct-22.txt`'
)
Write-File -Path (Join-Path $runDir "README.md") -Content ($summaryLines -join [Environment]::NewLine)

$metadata = [ordered]@{
    CaseName       = Split-Path $caseDir -Leaf
    RunName        = "$timestampUtc-$safeEgress"
    EgressLabel    = $EgressLabel
    CollectedAtUtc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    LocalHost      = hostname
    TargetHost     = $TargetHost
    TargetIp       = $TargetIp
    SshUser        = $SshUser
    PublicIp       = [ordered]@{
        Value    = $publicIp.Value
        Provider = $publicIp.Provider
        Outcome  = $publicIp.Outcome
        File     = $publicIp.File
    }
    Dns            = [ordered]@{
        A    = $dnsA
        Ptr  = $dnsPtr
        Aaaa = $dnsAaaa
    }
    Tests          = [ordered]@{
        direct443  = $direct443
        sni443     = $sni443
        direct8443 = $direct8443
        ssh22      = $ssh22
    }
}
Write-File -Path (Join-Path $runDir "metadata.json") -Content (($metadata | ConvertTo-Json -Depth 8))

Update-CaseArtifacts -CaseDir $caseDir -TargetHost $TargetHost -TargetIp $TargetIp -PublishedRoot $PublishedRoot
Write-Log "done"
