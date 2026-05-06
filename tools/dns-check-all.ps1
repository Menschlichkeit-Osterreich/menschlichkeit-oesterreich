param([string]$Domain = "menschlichkeit-oesterreich.at")

$results = [System.Collections.ArrayList]::new()
function Add-Check($name,$ok,$detail){ 
    $null = $results.Add([pscustomobject]@{ Check=$name; OK=$ok; Detail=$detail })
}

Write-Host "`n🌐 DNS-Check für $Domain`n" -ForegroundColor Cyan

try { 
    $a = Resolve-DnsName $Domain -Type A -ErrorAction Stop
    Add-Check "A ($Domain)" $true ($a.IPAddress -join ", ") 
} catch { 
    Add-Check "A ($Domain)" $false $_.Exception.Message 
}

try { 
    $mx = Resolve-DnsName $Domain -Type MX -ErrorAction Stop
    Add-Check "MX" $true (($mx | ForEach-Object {"$($_.NameExchange) ($($_.Preference))"}) -join ", ") 
} catch { 
    Add-Check "MX" $false $_.Exception.Message 
}

try { 
    $spf = (Resolve-DnsName $Domain -Type TXT -ErrorAction Stop).Strings | Where-Object {$_ -match '^v=spf1'}
    Add-Check "SPF" ([bool]$spf) ($spf -join " | ") 
} catch { 
    Add-Check "SPF" $false $_.Exception.Message 
}

try { 
    $dkim = (Resolve-DnsName "default._domainkey.$Domain" -Type TXT -ErrorAction Stop).Strings -join ""
    $dkimShort = if ($dkim.Length -gt 60) { $dkim.Substring(0, 60) + "..." } else { $dkim }
    Add-Check "DKIM (default)" ($dkim -match '^v=DKIM1') $dkimShort 
} catch { 
    Add-Check "DKIM (default)" $false $_.Exception.Message 
}

try { 
    $dmarc = (Resolve-DnsName "_dmarc.$Domain" -Type TXT -ErrorAction Stop).Strings -join ""
    Add-Check "DMARC" ($dmarc -match '^v=DMARC1') $dmarc 
} catch { 
    Add-Check "DMARC" $false $_.Exception.Message 
}

try { 
    $mtasts = (Resolve-DnsName "_mta-sts.$Domain" -Type TXT -ErrorAction Stop).Strings -join ""
    Add-Check "MTA-STS TXT" ($mtasts -match '^v=STSv1') $mtasts 
} catch { 
    Add-Check "MTA-STS TXT" $false $_.Exception.Message 
}

try { 
    $policy = Invoke-WebRequest -Uri "https://mta-sts.$Domain/.well-known/mta-sts.txt" -ErrorAction Stop
    Add-Check "MTA-STS HTTPS" ($policy.StatusCode -eq 200) "Status $($policy.StatusCode)" 
} catch { 
    Add-Check "MTA-STS HTTPS" $false $_.Exception.Message 
}

try { 
    $tlsrpt = (Resolve-DnsName "_smtp._tls.$Domain" -Type TXT -ErrorAction Stop).Strings -join ""
    Add-Check "TLS-RPT" ($tlsrpt -match '^v=TLSRPTv1') $tlsrpt 
} catch { 
    Add-Check "TLS-RPT" $false $_.Exception.Message 
}

try { 
    $caa = Resolve-DnsName $Domain -Type CAA -ErrorAction Stop
    Add-Check "CAA" $true (($caa | ForEach-Object {"$($_.Type) $($_.RData)"}) -join ", ") 
} catch { 
    Add-Check "CAA" $false $_.Exception.Message 
}

try { 
    $mail_a = Resolve-DnsName "mail.$Domain" -Type A -ErrorAction Stop
    Add-Check "A (mail.$Domain)" $true ($mail_a.IPAddress -join ", ") 
} catch { 
    Add-Check "A (mail.$Domain)" $false $_.Exception.Message 
}

Write-Host "`n📊 Ergebnisse:`n" -ForegroundColor Yellow
$results | ForEach-Object {
    $icon = if ($_.OK) { "✅" } else { "❌" }
    Write-Host "$icon $($_.Check)" -ForegroundColor $(if ($_.OK) { "Green" } else { "Red" })
    if ($_.Detail) { 
        Write-Host "   → $($_.Detail)" -ForegroundColor Gray 
    }
}

$passed = ($results | Where-Object {$_.OK}).Count
$total = $results.Count
$color = if ($passed -eq $total) { "Green" } elseif ($passed -ge ($total * 0.7)) { "Yellow" } else { "Red" }
Write-Host "`n📈 $passed/$total Checks erfolgreich" -ForegroundColor $color

# Export (optional)
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportDir = "reports/dns"
if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
}
$reportFile = "$reportDir/dns-check-$timestamp.json"
$results | ConvertTo-Json | Out-File -Encoding UTF8 $reportFile
Write-Host "`n💾 Bericht gespeichert: $reportFile" -ForegroundColor Cyan
