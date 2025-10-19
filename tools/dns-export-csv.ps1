$domain = "menschlichkeit-oesterreich.at"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportDir = "reports/dns"
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
$csvFile = "$reportDir/dns-inventory-$timestamp.csv"

Write-Host "`n📋 Exportiere DNS-Inventar für $domain" -ForegroundColor Cyan

"fqdn,type,target,ttl,status,verified_at,notes" | Out-File $csvFile -Encoding UTF8

function Add-Record($fqdn, $type, $target, $ttl=3600, $status="", $notes="") {
    "$fqdn,$type,$target,$ttl,$status,$(Get-Date -Format s),$notes" | Out-File $csvFile -Append -Encoding UTF8
}

# Apex A
try { 
    $a = Resolve-DnsName $domain -Type A -ErrorAction Stop
    Add-Record $domain "A" $a.IPAddress $a.TTL "✅" 
} catch { 
    Add-Record $domain "A" "" 3600 "❌" $_.Exception.Message 
}

# MX
try { 
    $mx = Resolve-DnsName $domain -Type MX -ErrorAction Stop
    foreach ($m in $mx) { 
        Add-Record $domain "MX" "$($m.Preference) $($m.NameExchange)" $m.TTL "✅" 
    } 
} catch { 
    Add-Record $domain "MX" "" 3600 "❌" 
}

# SPF
try { 
    $spf = (Resolve-DnsName $domain -Type TXT -ErrorAction Stop | Where-Object {$_.Strings -match '^v=spf1'}).Strings -join " "
    Add-Record $domain "TXT (SPF)" "`"$spf`"" 3600 "✅" 
} catch { 
    Add-Record $domain "TXT (SPF)" "" 3600 "❌" 
}

# DKIM
try { 
    $dkim = (Resolve-DnsName "default._domainkey.$domain" -Type TXT -ErrorAction Stop).Strings -join ""
    Add-Record "default._domainkey.$domain" "TXT (DKIM)" "`"$($dkim.Substring(0, [Math]::Min(50, $dkim.Length)))...`"" 3600 "✅" 
} catch { 
    Add-Record "default._domainkey.$domain" "TXT (DKIM)" "" 3600 "❌" 
}

# DMARC
try { 
    $dmarc = (Resolve-DnsName "_dmarc.$domain" -Type TXT -ErrorAction Stop).Strings -join ""
    Add-Record "_dmarc.$domain" "TXT (DMARC)" "`"$dmarc`"" 3600 "✅" 
} catch { 
    Add-Record "_dmarc.$domain" "TXT (DMARC)" "" 3600 "❌" 
}

# MTA-STS
try { 
    $mtasts = (Resolve-DnsName "_mta-sts.$domain" -Type TXT -ErrorAction Stop).Strings -join ""
    Add-Record "_mta-sts.$domain" "TXT (MTA-STS)" "`"$mtasts`"" 3600 "✅" 
} catch { 
    Add-Record "_mta-sts.$domain" "TXT (MTA-STS)" "" 3600 "❌" 
}

# TLS-RPT
try { 
    $tlsrpt = (Resolve-DnsName "_smtp._tls.$domain" -Type TXT -ErrorAction Stop).Strings -join ""
    Add-Record "_smtp._tls.$domain" "TXT (TLS-RPT)" "`"$tlsrpt`"" 3600 "✅" 
} catch { 
    Add-Record "_smtp._tls.$domain" "TXT (TLS-RPT)" "" 3600 "❌" 
}

# Subdomains
$subdomains = @(
    "www", "admin.stg", "analytics", "api.stg", "consent", "crm", "docs", 
    "forum", "games", "grafana", "hooks", "idp", "logs", "media", "n8n", 
    "newsletter", "s3", "status", "support", "votes", "mail", "mta-sts"
)

foreach ($sub in $subdomains) {
    $fqdn = "$sub.$domain"
    try {
        $cname = Resolve-DnsName $fqdn -Type CNAME -ErrorAction SilentlyContinue
        if ($cname) { 
            Add-Record $fqdn "CNAME" $cname.NameHost $cname.TTL "✅"
            continue 
        }
        $a = Resolve-DnsName $fqdn -Type A -ErrorAction Stop
        Add-Record $fqdn "A" ($a.IPAddress -join ", ") $a.TTL "✅"
    } catch { 
        Add-Record $fqdn "N/A" "" 3600 "❌" "Nicht konfiguriert" 
    }
}

Write-Host "`n✅ DNS-Inventar exportiert: $csvFile`n" -ForegroundColor Green
Import-Csv $csvFile | Format-Table -AutoSize
