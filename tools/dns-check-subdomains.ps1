$domain = "menschlichkeit-oesterreich.at"
$subdomains = @(
    "www", "admin.stg", "analytics", "api.stg", "consent", "crm", "docs", 
    "forum", "games", "grafana", "hooks", "idp", "logs", "media", "n8n", 
    "newsletter", "s3", "status", "support", "votes"
)

Write-Host "`n🌐 Subdomain-Check für $domain`n" -ForegroundColor Cyan
$results = @()

foreach ($sub in $subdomains) {
    $fqdn = "$sub.$domain"
    Write-Host "Checking $fqdn..." -NoNewline
    
    try {
        $cname = Resolve-DnsName $fqdn -Type CNAME -ErrorAction SilentlyContinue
        if ($cname) {
            $results += [pscustomobject]@{ 
                FQDN=$fqdn; Type="CNAME"; Target=$cname.NameHost; Status="✅" 
            }
            Write-Host " ✅ CNAME → $($cname.NameHost)" -ForegroundColor Green
            continue
        }
        
        $a = Resolve-DnsName $fqdn -Type A -ErrorAction Stop
        $results += [pscustomobject]@{ 
            FQDN=$fqdn; Type="A"; Target=($a.IPAddress -join ", "); Status="✅" 
        }
        Write-Host " ✅ A → $($a.IPAddress -join ', ')" -ForegroundColor Green
        
    } catch {
        $results += [pscustomobject]@{ 
            FQDN=$fqdn; Type="N/A"; Target=""; Status="❌" 
        }
        Write-Host " ❌ Nicht gefunden" -ForegroundColor Red
    }
}

Write-Host "`n📊 Zusammenfassung:`n"
$results | Format-Table -AutoSize

$configured = ($results | Where-Object {$_.Status -eq "✅"}).Count
$total = $subdomains.Count
$color = if ($configured -eq $total) { "Green" } elseif ($configured -ge ($total * 0.7)) { "Yellow" } else { "Red" }
Write-Host "`n📈 $configured/$total Subdomains konfiguriert" -ForegroundColor $color

# Export
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportDir = "reports/dns"
if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
}
$csvFile = "$reportDir/subdomains-$timestamp.csv"
$results | Export-Csv -Path $csvFile -NoTypeInformation -Encoding UTF8
Write-Host "`n💾 CSV exportiert: $csvFile" -ForegroundColor Cyan
