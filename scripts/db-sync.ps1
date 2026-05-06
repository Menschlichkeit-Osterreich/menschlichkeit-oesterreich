<#
.SYNOPSIS
  Datenbank-Synchronisation via SSH (Pull: Prod -> Lokal, Push: Lokal -> Prod)

.USAGE
  # Pull (Prod -> Lokal):
  ./scripts/db-sync.ps1 -Direction pull -RemoteHost your.host -RemoteUser user -DbName db -DbUser user -DbPass pass -LocalDbName db -LocalDbUser root -LocalDbPass secret

  # Push (Lokal -> Prod):
  ./scripts/db-sync.ps1 -Direction push -RemoteHost your.host -RemoteUser user -DbName db -DbUser user -DbPass pass -LocalDbName db -LocalDbUser root -LocalDbPass secret

.NOTES
  Erfordert: OpenSSH-Client (ssh/scp), mysqldump, mysql im PATH.
  Hinweis: Passwörter in CI/Terminals vermeiden. Nutzen Sie .my.cnf oder ENV.
#>

param(
  [ValidateSet('pull','push')][string]$Direction,
  [Parameter(Mandatory=$true)][string]$RemoteHost,
  [Parameter(Mandatory=$true)][string]$RemoteUser,
  [int]$RemotePort = 22,
  [Parameter(Mandatory=$true)][string]$DbName,
  [Parameter(Mandatory=$true)][string]$DbUser,
  [Parameter(Mandatory=$true)][string]$DbPass,
  [string]$DbHost = 'localhost',
  [Parameter(Mandatory=$true)][string]$LocalDbName,
  [Parameter(Mandatory=$true)][string]$LocalDbUser,
  [Parameter(Mandatory=$true)][string]$LocalDbPass
)

$ErrorActionPreference = 'Stop'

function Invoke-RemoteDump {
  param(
    [string]$File
  )
  $cmd = "mysqldump -h $DbHost -u $DbUser -p$DbPass --single-transaction --quick --lock-tables=false $DbName"
  Write-Host "[REMOTE] Dumping $DbName@${DbHost} -> $File"
  ssh -p $RemotePort "$RemoteUser@$RemoteHost" "$cmd | gzip -c" | Set-Content -Path $File -Encoding Byte
}

function Import-Local {
  param([string]$File)
  Write-Host "[LOCAL] Import $File -> $LocalDbName"
  $bytes = Get-Content -Path $File -Encoding Byte
  $stdout = [System.IO.MemoryStream]::new($bytes)
  $gzip = [System.IO.Compression.GzipStream]::new($stdout,[System.IO.Compression.CompressionMode]::Decompress)
  $reader = New-Object System.IO.StreamReader($gzip)
  $sql = $reader.ReadToEnd()
  $rand = [System.IO.Path]::GetTempFileName()
  Set-Content -Path $rand -Value $sql -Encoding UTF8
  try {
    & mysql -u $LocalDbUser -p$LocalDbPass $LocalDbName < $rand
  } finally {
    Remove-Item $rand -Force
  }
}

function Dump-Local {
  param([string]$File)
  Write-Host "[LOCAL] Dump $LocalDbName -> $File"
  & mysqldump -u $LocalDbUser -p$LocalDbPass --single-transaction --quick --lock-tables=false $LocalDbName | gzip -c | Set-Content -Path $File -Encoding Byte
}

function Import-Remote {
  param([string]$File)
  Write-Host "[REMOTE] Import $File -> $DbName"
  # Stream gzip to remote mysql
  Get-Content -Path $File -Encoding Byte | ssh -p $RemotePort "$RemoteUser@$RemoteHost" "gunzip -c | mysql -h $DbHost -u $DbUser -p$DbPass $DbName"
}

$tmp = Join-Path $env:TEMP ("db-" + [Guid]::NewGuid().ToString() + ".sql.gz")
try {
  if ($Direction -eq 'pull') {
    Invoke-RemoteDump -File $tmp
    Import-Local -File $tmp
  } else {
    Dump-Local -File $tmp
    Import-Remote -File $tmp
  }
  Write-Host "[OK] DB sync ($Direction) abgeschlossen." -ForegroundColor Green
} finally {
  if (Test-Path $tmp) { Remove-Item $tmp -Force }
}

