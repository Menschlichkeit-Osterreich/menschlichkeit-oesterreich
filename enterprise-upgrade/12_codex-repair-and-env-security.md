# VS Code Copilot/Codex Repair & Environment Security Implementation

## 🔍 Problem-Diagnose

### Identifizierte Probleme

1. **MCP-Server-Konfiguration geleert**: `.vscode/mcp.json` ist leer
2. **Viele MCP-Server-Dateien gelöscht**: `custom-mcp-servers/` Verzeichnis entfernt
3. **Copilot möglicherweise durch fehlende MCP-Konnektivität beeinträchtigt**

### Schnelle Reparatur-Schritte

## 1. MCP-Server-Konfiguration wiederherstellen

```powershell
# Backup der aktuellen Konfiguration
cp .vscode/mcp.json .vscode/mcp.json.broken

# Git-History prüfen für letzte funktionierende MCP-Config
git log -p -- .vscode/mcp.json | head -100

# Funktionsfähige MCP-Config wiederherstellen
git show HEAD~5:.vscode/mcp.json > .vscode/mcp.json.candidate
```

## 2. VS Code Extension Diagnose

### Befehlspalette (`Ctrl+Shift+P`)

1. **"Developer: Show Running Extensions"** - Status prüfen
2. **"GitHub Copilot: Sign in"** - Auth Status
3. **"MCP: Restart All Servers"** - MCP-Server neu starten
4. **"Developer: Toggle Developer Tools"** - Console Errors

### Output Panel (`View → Output`)

- **GitHub Copilot** - Auth/API Errors
- **GitHub Copilot Chat** - Chat-spezifische Probleme
- **MCP** - Server-Connection Issues

## 3. Systematische Fehlerbehebung

### A) Extensions deaktivieren/testen

```bash
# VS Code ohne Extensions starten
code --disable-extensions

# Nur Copilot aktivieren und testen
code --enable-extension GitHub.copilot
```

### B) Konfigurationsdateien prüfen

```powershell
# User Settings
$env:APPDATA\Code\User\settings.json

# Workspace Settings
.vscode/settings.json

# Suche nach verdächtigen Einstellungen:
# - http.proxy
# - github.copilot.*
# - mcp.*
```

### C) Netzwerk/Proxy Issues

```json
{
  "http.proxyStrictSSL": false,
  "github.copilot.advanced": {
    "debug.overrideEngine": "copilot-codex"
  }
}
```

## 4. MCP-Server Neukonfiguration

### Minimale funktionsfähige MCP-Konfiguration

```json
{
  "servers": {
    "filesystem": {
      "command": "node",
      "args": ["./servers/src/filesystem/dist/index.js"],
      "cwd": "./servers/src/filesystem"
    },
    "memory": {
      "command": "node",
      "args": ["./servers/src/memory/dist/index.js"],
      "cwd": "./servers/src/memory"
    },
    "sequential-thinking": {
      "command": "node",
      "args": ["./servers/src/sequentialthinking/dist/index.js"],
      "cwd": "./servers/src/sequentialthinking"
    }
  },
  "inputs": []
}
```

---

# 🔐 ENV-001: Environment Variables Security Implementation

## Kritische P0-Aufgabe: Secrets Management

### 1. Audit aktueller .env-Dateien

#### Finde alle .env-Dateien

```powershell
# Alle .env-Dateien im Projekt finden
Get-ChildItem -Recurse -Force -Name "*.env*" | Where-Object { $_ -notlike "*node_modules*" }

# Git-tracked .env-Dateien (SICHERHEITSPROBLEM!)
git ls-files | Select-String "\.env"

# Inhalt auf sensitive Daten prüfen
Get-ChildItem -Recurse -Force -Name "*.env*" | ForEach-Object {
    Write-Host "=== $_ ==="
    Get-Content $_ | Select-String -Pattern "(API_KEY|SECRET|PASSWORD|TOKEN|DATABASE_URL)"
}
```

### 2. SOPS Implementation für sichere Secrets

#### SOPS Installation und Setup

```powershell
# SOPS via Chocolatey installieren
choco install sops

# Oder direkte Download
$sopsUrl = "https://github.com/mozilla/sops/releases/download/v3.8.1/sops-v3.8.1.windows.amd64.exe"
Invoke-WebRequest -Uri $sopsUrl -OutFile "C:\tools\sops.exe"

# PATH erweitern
$env:PATH += ";C:\tools"
```

#### GPG-Schlüssel für SOPS generieren

```powershell
# GPG installieren (falls nicht vorhanden)
choco install gpg4win

# Neuen GPG-Schlüssel generieren
gpg --batch --generate-key --quiet <<EOF
%echo Generating GPG key for SOPS
Key-Type: RSA
Key-Length: 4096
Subkey-Type: RSA
Subkey-Length: 4096
Name-Real: Menschlichkeit Österreich Secrets
Name-Email: secrets@menschlichkeit-oesterreich.at
Expire-Date: 2y
%no-protection
%commit
%echo GPG key generation complete
EOF

# Schlüssel-ID abrufen
gpg --list-secret-keys --keyid-format LONG
```

### 3. SOPS Konfigurationsdatei erstellen

#### `.sops.yaml` Konfiguration

```yaml
# SOPS-Konfiguration für verschiedene Umgebungen
creation_rules:
  # Produktions-Secrets (höchste Sicherheit)
  - path_regex: secrets/production/.*\.yaml$
    pgp: 'YOUR_PRODUCTION_GPG_FINGERPRINT'
    encrypted_regex: '^(data|stringData|.*(password|secret|key|token|url|host|user))$'

  # Staging-Secrets
  - path_regex: secrets/staging/.*\.yaml$
    pgp: 'YOUR_STAGING_GPG_FINGERPRINT'
    encrypted_regex: '^(data|stringData|.*(password|secret|key|token|url|host|user))$'

  # Development-Secrets (lokale Entwicklung)
  - path_regex: secrets/development/.*\.yaml$
    pgp: 'YOUR_DEV_GPG_FINGERPRINT'
    encrypted_regex: '^(data|stringData|.*(password|secret|key|token|url|host|user))$'

  # Environment-spezifische .env-Dateien
  - path_regex: \.env\..*$
    pgp: 'YOUR_GPG_FINGERPRINT'
```

### 4. Secrets-Struktur implementieren

#### Verzeichnisstruktur für Secrets

```
secrets/
├── production/
│   ├── database.yaml
│   ├── api-keys.yaml
│   ├── ssl-certificates.yaml
│   └── third-party-services.yaml
├── staging/
│   ├── database.yaml
│   ├── api-keys.yaml
│   └── services.yaml
├── development/
│   ├── local-database.yaml
│   └── dev-services.yaml
└── shared/
    └── common-config.yaml
```

#### Beispiel Secrets-Template

```yaml
# secrets/production/database.yaml
# Encrypt mit: sops -e -i secrets/production/database.yaml
database:
  primary:
    host: 'db.menschlichkeit-oesterreich.at'
    port: 5432
    name: 'production_main'
    username: 'prod_user'
    password: 'ENCRYPTED_BY_SOPS'
    ssl_mode: 'require'

  readonly:
    host: 'db-readonly.menschlichkeit-oesterreich.at'
    port: 5432
    name: 'production_main'
    username: 'readonly_user'
    password: 'ENCRYPTED_BY_SOPS'

redis:
  host: 'redis.menschlichkeit-oesterreich.at'
  port: 6379
  password: 'ENCRYPTED_BY_SOPS'
  database: 0
```

### 5. Environment Variable Injection Scripts

#### PowerShell Secrets-Management

```powershell
# scripts/secrets-decrypt.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$Environment = "development",

    [Parameter(Mandatory=$false)]
    [switch]$ExportToEnv = $false
)

$SecretsPath = "secrets/$Environment"
$TempEnvFile = ".env.$Environment.decrypted"

Write-Host "🔓 Decrypting secrets for environment: $Environment" -ForegroundColor Green

# Alle SOPS-verschlüsselten Dateien in der Umgebung finden
$SecretFiles = Get-ChildItem -Path $SecretsPath -Filter "*.yaml" -Recurse

if ($SecretFiles.Count -eq 0) {
    Write-Error "No encrypted secret files found in $SecretsPath"
    exit 1
}

# Temporäre .env-Datei erstellen
"# Generated environment variables from SOPS secrets" | Out-File $TempEnvFile
"# Environment: $Environment" | Out-File $TempEnvFile -Append
"# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File $TempEnvFile -Append
"" | Out-File $TempEnvFile -Append

foreach ($SecretFile in $SecretFiles) {
    Write-Host "  Processing: $($SecretFile.Name)" -ForegroundColor Cyan

    try {
        # SOPS entschlüsseln und YAML zu ENV konvertieren
        $DecryptedContent = & sops -d $SecretFile.FullName | ConvertFrom-Yaml

        # Rekursiv durch YAML-Struktur und ENV-Variablen erstellen
        function ConvertTo-EnvVars($obj, $prefix = "") {
            foreach ($key in $obj.Keys) {
                $envKey = if ($prefix) { "${prefix}_${key}".ToUpper() } else { $key.ToUpper() }
                $value = $obj[$key]

                if ($value -is [hashtable] -or $value -is [PSCustomObject]) {
                    ConvertTo-EnvVars $value $envKey
                } else {
                    "$envKey=$value" | Out-File $TempEnvFile -Append
                }
            }
        }

        ConvertTo-EnvVars $DecryptedContent

    } catch {
        Write-Error "Failed to decrypt $($SecretFile.Name): $($_.Exception.Message)"
        continue
    }
}

Write-Host "✅ Secrets decrypted to: $TempEnvFile" -ForegroundColor Green

# Optional: Environment Variables exportieren
if ($ExportToEnv) {
    Write-Host "🌐 Exporting to environment variables..." -ForegroundColor Yellow

    Get-Content $TempEnvFile | ForEach-Object {
        if ($_ -match '^([^#].+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "  Exported: $name" -ForegroundColor DarkGreen
        }
    }
}

# Cleanup nach 5 Minuten (Security)
Start-Job -ScriptBlock {
    param($FilePath)
    Start-Sleep -Seconds 300  # 5 Minuten
    if (Test-Path $FilePath) {
        Remove-Item $FilePath -Force
        Write-Host "🗑️ Cleaned up temporary secrets file" -ForegroundColor Gray
    }
} -ArgumentList $TempEnvFile | Out-Null

Write-Host "⚠️ Temporary secrets file will be auto-deleted in 5 minutes" -ForegroundColor Yellow
```

### 6. .gitignore Security Update

#### Erweiterte .gitignore für Secrets

```gitignore
# Environment Variables & Secrets
.env
.env.local
.env.development
.env.staging
.env.production
.env.*.local
.env.*.decrypted

# SOPS decrypted files
*.decrypted
secrets/**/*.decrypted

# Private keys
*.pem
*.key
*.p12
*.pfx
*.crt

# Database dumps
*.sql
*.dump
*.backup

# Configuration with secrets
config/local.json
config/production.json
config/secrets.json

# IDE secrets
.vscode/settings.local.json
```

### 7. Docker Integration für sichere Deployments

#### Dockerfile mit Secrets-Management

```dockerfile
# Multi-stage build für sicherere Production
FROM node:18-alpine AS secrets-handler

# SOPS installieren
RUN apk add --no-cache gnupg sops

# GPG-Schlüssel importieren (nur zur Build-Zeit)
ARG GPG_PRIVATE_KEY
RUN echo "$GPG_PRIVATE_KEY" | gpg --import

WORKDIR /app
COPY secrets/ ./secrets/
COPY .sops.yaml ./

# Secrets zur Build-Zeit entschlüsseln
RUN sops -d secrets/production/database.yaml > /tmp/database.env
RUN sops -d secrets/production/api-keys.yaml > /tmp/api-keys.env

# Production Image
FROM node:18-alpine AS production

WORKDIR /app

# Nur entschlüsselte ENV-Files kopieren
COPY --from=secrets-handler /tmp/*.env ./config/

# Normale App-Files
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Startup-Script mit ENV-Loading
COPY scripts/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
```

### 8. Automated Security Checks

#### GitHub Actions Integration

```yaml
# .github/workflows/secrets-security.yml
name: 🔐 Secrets Security Audit

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  secrets-audit:
    name: Audit Secrets & Environment Variables
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history für Secret-Scanning

      - name: Install Security Tools
        run: |
          # TruffleHog für Secret-Detection
          curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sh -s -- -b /usr/local/bin

          # SOPS für Validation
          curl -LO https://github.com/mozilla/sops/releases/download/v3.8.1/sops-v3.8.1.linux.amd64
          chmod +x sops-v3.8.1.linux.amd64
          sudo mv sops-v3.8.1.linux.amd64 /usr/local/bin/sops

      - name: Scan for Exposed Secrets
        run: |
          echo "🔍 Scanning repository for exposed secrets..."
          trufflehog git file://. --only-verified --no-update

      - name: Validate .env Files Are Not Committed
        run: |
          echo "🚫 Checking for committed .env files..."
          if git ls-files | grep -E '\.env($|\.)' | grep -v '\.env\.example$'; then
            echo "❌ ERROR: .env files found in repository!"
            echo "These files should be encrypted with SOPS or added to .gitignore"
            exit 1
          else
            echo "✅ No .env files found in repository"
          fi

      - name: Validate SOPS Configuration
        run: |
          echo "🔧 Validating SOPS configuration..."
          if [ ! -f ".sops.yaml" ]; then
            echo "❌ ERROR: .sops.yaml configuration file missing!"
            exit 1
          fi

          # Validate SOPS encrypted files can be parsed
          if [ -d "secrets/" ]; then
            find secrets/ -name "*.yaml" -exec sops -d {} \; > /dev/null
            echo "✅ All SOPS encrypted files are valid"
          fi

      - name: Security Report
        if: failure()
        run: |
          echo "🚨 SECURITY ISSUES DETECTED!"
          echo "Please review and fix the security issues above before merging."
          echo "Refer to: scripts/SECRETS-SOPS.md for implementation guide"
```

## 9. Implementation Checklist

### ✅ Phase 1: Immediate Security (P0)

- [ ] Audit alle .env-Dateien im Repository
- [ ] SOPS Installation und GPG-Setup
- [ ] Erste verschlüsselte Secrets-Dateien erstellen
- [ ] .gitignore für Secrets erweitern
- [ ] Temporäre .env-Files aus Git-History entfernen

### ✅ Phase 2: Automation (P1)

- [ ] PowerShell Decrypt/Encrypt Scripts
- [ ] Docker Integration für sichere Deployments
- [ ] GitHub Actions für Secrets-Scanning
- [ ] Entwickler-Dokumentation und Training

### ✅ Phase 3: Monitoring (P2)

- [ ] Secrets Rotation Automation
- [ ] Access Logging für Secrets
- [ ] Compliance Reporting
- [ ] Incident Response Procedures

---

## 🚨 Sofortige Aktionen erforderlich

1. **MCP-Server Konfiguration reparieren**
2. **Secrets Audit durchführen**
3. **SOPS Implementation starten**
4. **VS Code Extensions neu konfigurieren**

Soll ich mit der **Secrets Audit** beginnen und dann die **MCP-Konfiguration** reparieren?
