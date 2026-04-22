# Gemeinsame Bitwarden-Helfer fuer lokale Dev- und CI-Skripte.
# Ziel: ein zentraler Weg fuer Access-Token-Aufloesung und bws-Aufrufe
# ohne verstreute Desktop-Pfad-Hardcodings oder interaktive Vault-Zwaenge.

function Get-BitwardenTokenFileCandidates {
    param(
        [string]$TokenFile
    )

    $candidates = @()

    foreach ($value in @(
        $TokenFile,
        $env:BW_TOKEN_FILE,
        $env:BWS_TOKEN_FILE,
        $env:BSM_TOKEN_FILE
    )) {
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            $candidates += $value
        }
    }

    if ($env:USERPROFILE) {
        $candidates += Join-Path $env:USERPROFILE ".config\menschlichkeit\BW_ACCESS_TOKEN.txt"
        $candidates += Join-Path $env:USERPROFILE "OneDrive - Menschlichkeit Österreich\Desktop\BW_ACCESS_TOKEN.txt"
        $candidates += Join-Path $env:USERPROFILE "Desktop\BW_ACCESS_TOKEN.txt"
    }

    if ($env:GITHUB_WORKSPACE) {
        $candidates += Join-Path $env:GITHUB_WORKSPACE ".local-secrets\bitwarden.env"
    }

    try {
        $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
        $candidates += Join-Path $repoRoot ".local-secrets\bitwarden.env"
        $candidates += Join-Path $repoRoot ".local-secrets\BW_ACCESS_TOKEN.txt"
    }
    catch {
        # ignore path resolution failures and continue with other candidates
    }

    return $candidates | Select-Object -Unique
}

function Resolve-BitwardenAccessToken {
    param(
        [string]$TokenFile,
        [switch]$ExportToProcess,
        [switch]$Quiet
    )

    foreach ($envName in @('BSM_ACCESS_TOKEN', 'BWS_ACCESS_TOKEN', 'BW_ACCESS_TOKEN')) {
        $value = [Environment]::GetEnvironmentVariable($envName)
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            if ($ExportToProcess) {
                $env:BSM_ACCESS_TOKEN = $value
                $env:BWS_ACCESS_TOKEN = $value
            }
            return $value.Trim()
        }
    }

    foreach ($candidate in Get-BitwardenTokenFileCandidates -TokenFile $TokenFile) {
        if ([string]::IsNullOrWhiteSpace($candidate) -or -not (Test-Path $candidate)) {
            continue
        }

        $raw = Get-Content $candidate -Raw
        $patterns = @(
            '(?m)^\s*(?:BSM_ACCESS_TOKEN|BWS_ACCESS_TOKEN|BW_ACCESS_TOKEN)\s*=\s*"?([^"\r\n]+)"?\s*$',
            '"(?:BSM_ACCESS_TOKEN|BWS_ACCESS_TOKEN|BW_ACCESS_TOKEN)"\s*:\s*"([^"]+)"'
        )

        foreach ($pattern in $patterns) {
            $match = [regex]::Match($raw, $pattern)
            if ($match.Success -and -not [string]::IsNullOrWhiteSpace($match.Groups[1].Value)) {
                $token = $match.Groups[1].Value.Trim()
                if ($ExportToProcess) {
                    $env:BSM_ACCESS_TOKEN = $token
                    $env:BWS_ACCESS_TOKEN = $token
                    if (-not $env:BW_TOKEN_FILE) {
                        $env:BW_TOKEN_FILE = $candidate
                    }
                }
                return $token
            }
        }

        # Fallback: Datei enthaelt nur den Token als Klartext in der ersten Zeile.
        $firstLine = ($raw -split "`r?`n" | Select-Object -First 1).Trim()
        if (-not [string]::IsNullOrWhiteSpace($firstLine) -and -not $firstLine.StartsWith('#')) {
            $token = $firstLine.Trim('"').Trim("'")
            if ($ExportToProcess) {
                $env:BSM_ACCESS_TOKEN = $token
                $env:BWS_ACCESS_TOKEN = $token
                if (-not $env:BW_TOKEN_FILE) {
                    $env:BW_TOKEN_FILE = $candidate
                }
            }
            return $token
        }
    }

    if (-not $Quiet) {
        Write-Host '[ERROR] Kein Bitwarden Access Token gefunden.' -ForegroundColor Red
        Write-Host 'Setze BSM_ACCESS_TOKEN/BW_ACCESS_TOKEN oder BW_TOKEN_FILE auf eine gitignored Datei.' -ForegroundColor Yellow
    }

    return $null
}

function Resolve-BitwardenOrganizationId {
    param(
        [string]$TokenFile,
        [switch]$ExportToProcess
    )

    foreach ($envName in @('BSM_ORGANIZATION_ID', 'BWS_ORGANIZATION_ID', 'BW_ORGANIZATION_ID')) {
        $value = [Environment]::GetEnvironmentVariable($envName)
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            if ($ExportToProcess) {
                $env:BSM_ORGANIZATION_ID = $value
                $env:BWS_ORGANIZATION_ID = $value
            }
            return $value.Trim()
        }
    }

    try {
        $null = Resolve-BitwardenAccessToken -TokenFile $TokenFile -ExportToProcess -Quiet
        if ($env:BSM_ACCESS_TOKEN) {
            $projectsRaw = Invoke-BwsCommand -Arguments @('project', 'list', '--output', 'json') -TokenFile $TokenFile -Quiet
            $projects = $projectsRaw | ConvertFrom-Json
            $orgIds = @($projects | ForEach-Object { $_.organizationId } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)
            if ($orgIds.Count -eq 1) {
                $resolved = [string]$orgIds[0]
                if ($ExportToProcess) {
                    $env:BSM_ORGANIZATION_ID = $resolved
                    $env:BWS_ORGANIZATION_ID = $resolved
                }
                return $resolved
            }
        }
    }
    catch {
        # still return null and let the caller decide whether this is fatal
    }

    return $null
}

function Invoke-BwsCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,
        [string]$TokenFile,
        [switch]$Quiet
    )

    $token = Resolve-BitwardenAccessToken -TokenFile $TokenFile -ExportToProcess -Quiet:$Quiet
    if ([string]::IsNullOrWhiteSpace($token)) {
        throw 'Bitwarden Access Token fehlt.'
    }

    $argsToUse = @($Arguments)
    if ($argsToUse -notcontains '--server-url') {
        $argsToUse += @('--server-url', 'https://vault.bitwarden.eu')
    }

    if (Get-Command bws -ErrorAction SilentlyContinue) {
        $result = & bws @argsToUse 2>&1
    }
    elseif (Get-Command docker -ErrorAction SilentlyContinue) {
        $result = & docker run --rm -e "BWS_ACCESS_TOKEN=$token" ghcr.io/bitwarden/bws @argsToUse 2>&1
    }
    else {
        throw "Weder 'bws' noch Docker wurde gefunden. Bitte bws installieren oder Docker verfuegbar machen."
    }

    if ($result -is [System.Array]) {
        $result = ($result | ForEach-Object { "$_" }) -join [Environment]::NewLine
    }
    else {
        $result = [string]$result
    }

    if ($LASTEXITCODE -ne 0) {
        throw ($result.Trim())
    }

    $trimmed = $result.Trim()
    $objectStart = $trimmed.IndexOf('{')
    $arrayStart = $trimmed.IndexOf('[')
    $startPositions = @($objectStart, $arrayStart) | Where-Object { $_ -ge 0 } | Sort-Object
    if ($startPositions.Count -gt 0 -and $startPositions[0] -gt 0) {
        return $trimmed.Substring($startPositions[0])
    }

    return $trimmed
}
