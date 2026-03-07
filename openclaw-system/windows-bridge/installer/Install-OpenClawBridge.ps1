#Requires -RunAsAdministrator
<#
.SYNOPSIS
    OpenClaw Windows-Bridge Installer für Menschlichkeit Österreich
    Installiert die Bridge unter C:\openclawd-win-bridge

.DESCRIPTION
    Dieses Skript installiert und konfiguriert die OpenClaw Windows-Bridge,
    die als Verbindungsschicht zwischen Windows-Anwendungen und dem
    OpenClaw Multi-Agent-System (auf WSL2/Docker) fungiert.

.PARAMETER InstallPath
    Installationspfad (Standard: C:\openclawd-win-bridge)

.PARAMETER WSLDistro
    WSL2-Distribution (Standard: Ubuntu)

.PARAMETER AgentRuntimePort
    Port des Agent-Runtime-Services (Standard: 9100)

.PARAMETER ToolGatewayPort
    Port des Tool-Gateway-Services (Standard: 9101)

.EXAMPLE
    .\Install-OpenClawBridge.ps1
    .\Install-OpenClawBridge.ps1 -InstallPath "D:\openclawd-win-bridge"
#>

param(
    [string]$InstallPath = "C:\openclawd-win-bridge",
    [string]$WSLDistro = "Ubuntu",
    [int]$AgentRuntimePort = 9100,
    [int]$ToolGatewayPort = 9101,
    [int]$BridgePort = 18790,
    [switch]$InstallService = $true,
    [switch]$OpenFirewall = $true
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# ─── Farben & Ausgabe ─────────────────────────────────────
function Write-Step { param($msg) Write-Host "  → $msg" -ForegroundColor Cyan }
function Write-OK   { param($msg) Write-Host "  ✓ $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "  ⚠ $msg" -ForegroundColor Yellow }
function Write-Err  { param($msg) Write-Host "  ✗ $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   OpenClaw Windows-Bridge Installer              ║" -ForegroundColor Magenta
Write-Host "║   Menschlichkeit Österreich                      ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# ─── 1. Voraussetzungen prüfen ────────────────────────────
Write-Host "1. Voraussetzungen prüfen..." -ForegroundColor White

# Windows-Version
$winVer = [System.Environment]::OSVersion.Version
if ($winVer.Major -lt 10 -or ($winVer.Major -eq 10 -and $winVer.Build -lt 19041)) {
    Write-Err "Windows 10 Version 2004 (Build 19041) oder höher erforderlich"
    exit 1
}
Write-OK "Windows-Version: $($winVer.ToString())"

# WSL2 prüfen
try {
    $wslStatus = wsl --status 2>&1
    Write-OK "WSL2 verfügbar"
} catch {
    Write-Warn "WSL2 nicht gefunden. Installiere WSL2..."
    wsl --install -d Ubuntu
    Write-OK "WSL2 installiert. Bitte System neu starten und Installer erneut ausführen."
    exit 0
}

# Node.js prüfen
try {
    $nodeVer = node --version 2>&1
    Write-OK "Node.js: $nodeVer"
} catch {
    Write-Warn "Node.js nicht gefunden. Bitte installieren: https://nodejs.org"
}

# Docker Desktop prüfen
try {
    $dockerVer = docker --version 2>&1
    Write-OK "Docker: $dockerVer"
} catch {
    Write-Warn "Docker Desktop nicht gefunden. Für volle Funktionalität empfohlen."
}

# ─── 2. Verzeichnisstruktur anlegen ───────────────────────
Write-Host "`n2. Verzeichnisstruktur anlegen..." -ForegroundColor White

$dirs = @(
    "$InstallPath",
    "$InstallPath\bin",
    "$InstallPath\config",
    "$InstallPath\logs",
    "$InstallPath\scripts",
    "$InstallPath\workspace",
    "$InstallPath\workspace\oc_out",
    "$InstallPath\service",
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-OK "Verzeichnisse angelegt: $InstallPath"

# ─── 3. Bridge-Konfiguration erstellen ───────────────────
Write-Host "`n3. Konfiguration erstellen..." -ForegroundColor White

$config = @{
    bridge = @{
        version = "1.0.0"
        install_path = $InstallPath
        bridge_port = $BridgePort
        wsl_distro = $WSLDistro
    }
    services = @{
        agent_runtime = "http://localhost:$AgentRuntimePort"
        tool_gateway = "http://localhost:$ToolGatewayPort"
        n8n = "http://localhost:5678"
        website = "http://localhost:5173"
    }
    github = @{
        token = "`${GITHUB_TOKEN}"
        personal_user = "`${GITHUB_PERSONAL_USER}"
        organisation = "Menschlichkeit-Osterreich"
        repos = @("menschlichkeit-oesterreich-development")
    }
    logging = @{
        level = "INFO"
        path = "$InstallPath\logs"
        max_size_mb = 50
        retention_days = 30
    }
} | ConvertTo-Json -Depth 10

$config | Out-File -FilePath "$InstallPath\config\config.json" -Encoding UTF8
Write-OK "Konfiguration: $InstallPath\config\config.json"

# .env Template
@"
# OpenClaw Windows-Bridge – Umgebungsvariablen
# Kopiere diese Datei als .env und trage deine Werte ein

GITHUB_TOKEN=ghp_DEIN_PERSONAL_ACCESS_TOKEN
GITHUB_PERSONAL_USER=DEIN_GITHUB_USERNAME
OPENAI_API_KEY=sk-DEIN_OPENAI_KEY
OC_BRIDGE_SECRET=ZUFAELLIGER_GEHEIMER_STRING
OC_AGENT_RUNTIME_URL=http://localhost:9100
OC_TOOL_GATEWAY_URL=http://localhost:9101
N8N_URL=http://localhost:5678
OC_WEBSITE_URL=http://localhost:5173
WSL_DISTRO=$WSLDistro
"@ | Out-File -FilePath "$InstallPath\config\.env.example" -Encoding UTF8
Write-OK ".env.example erstellt"

# ─── 4. Bridge-Server (Node.js) erstellen ─────────────────
Write-Host "`n4. Bridge-Server erstellen..." -ForegroundColor White

@"
/**
 * OpenClaw Windows-Bridge Server
 * Vermittelt zwischen Windows-Anwendungen und dem OpenClaw-System in WSL2/Docker
 * Port: $BridgePort
 */

const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'config.json');
const LOG_PATH = path.join(__dirname, '..', 'logs', 'bridge.log');

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

function log(level, msg, data = {}) {
    const entry = JSON.stringify({ ts: new Date().toISOString(), level, msg, ...data });
    console.log(entry);
    fs.appendFileSync(LOG_PATH, entry + '\n');
}

// ─── HTTP-Proxy zu WSL2-Services ──────────────────────────
function proxyRequest(targetUrl, req, res) {
    const url = new URL(targetUrl + req.url);
    const options = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname + url.search,
        method: req.method,
        headers: { ...req.headers, host: url.host },
    };

    const proxy = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxy.on('error', (e) => {
        log('ERROR', 'Proxy-Fehler', { error: e.message, target: targetUrl });
        res.writeHead(502);
        res.end(JSON.stringify({ error: 'Service nicht erreichbar', target: targetUrl }));
    });

    req.pipe(proxy);
}

// ─── WSL2-Befehl ausführen ────────────────────────────────
function runWSLCommand(command) {
    return new Promise((resolve, reject) => {
        exec(`wsl -d ${config.bridge.wsl_distro} -- ${command}`, (err, stdout, stderr) => {
            if (err) reject(new Error(stderr || err.message));
            else resolve(stdout.trim());
        });
    });
}

// ─── HTTP-Server ──────────────────────────────────────────
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const url = req.url.split('?')[0];
    log('INFO', 'Request', { method: req.method, url });

    // Health-Check
    if (url === '/health') {
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'ok', service: 'openclaw-win-bridge', version: '1.0.0',
            services: config.services,
        }));
        return;
    }

    // Proxy zu Agent-Runtime
    if (url.startsWith('/agent/')) {
        req.url = req.url.replace('/agent', '');
        proxyRequest(config.services.agent_runtime, req, res);
        return;
    }

    // Proxy zu Tool-Gateway
    if (url.startsWith('/tools/')) {
        req.url = req.url.replace('/tools', '');
        proxyRequest(config.services.tool_gateway, req, res);
        return;
    }

    // WSL2-Status
    if (url === '/wsl/status') {
        runWSLCommand('docker ps --format "{{.Names}}: {{.Status}}"')
            .then(output => {
                res.writeHead(200);
                res.end(JSON.stringify({ containers: output.split('\n').filter(Boolean) }));
            })
            .catch(err => {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            });
        return;
    }

    // Docker-Stack starten
    if (url === '/wsl/start-stack' && req.method === 'POST') {
        const cmd = 'cd /home/ubuntu/menschlichkeit-oesterreich-development && docker compose -f openclaw-system/docker/docker-compose.oc.yml up -d';
        runWSLCommand(cmd)
            .then(output => { res.writeHead(200); res.end(JSON.stringify({ started: true, output })); })
            .catch(err => { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); });
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint nicht gefunden' }));
});

server.listen($BridgePort, '127.0.0.1', () => {
    log('INFO', 'Bridge gestartet', { port: $BridgePort });
    console.log('OpenClaw Windows-Bridge läuft auf http://127.0.0.1:$BridgePort');
});

process.on('SIGTERM', () => { server.close(); process.exit(0); });
process.on('SIGINT', () => { server.close(); process.exit(0); });
"@ | Out-File -FilePath "$InstallPath\bin\bridge-server.js" -Encoding UTF8
Write-OK "Bridge-Server: $InstallPath\bin\bridge-server.js"

# ─── 5. PowerShell-Hilfsskripte erstellen ─────────────────
Write-Host "`n5. Hilfsskripte erstellen..." -ForegroundColor White

# Start-Skript
@"
# OpenClaw Bridge starten
Set-Location "$InstallPath"
Write-Host "Starte OpenClaw Windows-Bridge..." -ForegroundColor Cyan
node bin\bridge-server.js
"@ | Out-File -FilePath "$InstallPath\scripts\Start-Bridge.ps1" -Encoding UTF8

# Stack-Start-Skript
@"
# OpenClaw Docker-Stack in WSL2 starten
Write-Host "Starte OpenClaw Docker-Stack..." -ForegroundColor Cyan
wsl -d $WSLDistro -- bash -c "cd ~/menschlichkeit-oesterreich-development && docker compose -f openclaw-system/docker/docker-compose.oc.yml up -d --build"
Write-Host "Stack gestartet. Warte auf Health-Checks..." -ForegroundColor Green
Start-Sleep -Seconds 10
# Health-Checks
`$services = @(
    @{Name="NATS";     Url="http://localhost:8222/healthz"},
    @{Name="Qdrant";   Url="http://localhost:6333/healthz"},
    @{Name="Tool-GW";  Url="http://localhost:9101/health"},
    @{Name="Agent-RT"; Url="http://localhost:9100/health"}
)
foreach (`$svc in `$services) {
    try {
        `$resp = Invoke-WebRequest -Uri `$svc.Url -TimeoutSec 5 -UseBasicParsing
        Write-Host "  ✓ `$(`$svc.Name): OK" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ `$(`$svc.Name): Nicht erreichbar" -ForegroundColor Red
    }
}
"@ | Out-File -FilePath "$InstallPath\scripts\Start-Stack.ps1" -Encoding UTF8

# Stop-Skript
@"
Write-Host "Stoppe OpenClaw Docker-Stack..." -ForegroundColor Yellow
wsl -d $WSLDistro -- bash -c "cd ~/menschlichkeit-oesterreich-development && docker compose -f openclaw-system/docker/docker-compose.oc.yml down"
Write-Host "Stack gestoppt." -ForegroundColor Green
"@ | Out-File -FilePath "$InstallPath\scripts\Stop-Stack.ps1" -Encoding UTF8

Write-OK "Hilfsskripte erstellt"

# ─── 6. Windows-Dienst registrieren ──────────────────────
if ($InstallService) {
    Write-Host "`n6. Windows-Dienst registrieren..." -ForegroundColor White
    
    $serviceName = "OpenClawBridge"
    $serviceExists = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    
    if ($serviceExists) {
        Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
        sc.exe delete $serviceName | Out-Null
    }
    
    # NSSM für Service-Verwaltung (falls vorhanden)
    $nssmPath = "C:\ProgramData\chocolatey\bin\nssm.exe"
    if (Test-Path $nssmPath) {
        & $nssmPath install $serviceName "node" "$InstallPath\bin\bridge-server.js"
        & $nssmPath set $serviceName AppDirectory $InstallPath
        & $nssmPath set $serviceName DisplayName "OpenClaw Windows-Bridge"
        & $nssmPath set $serviceName Description "Verbindet Windows-Anwendungen mit dem OpenClaw Multi-Agent-System"
        & $nssmPath set $serviceName Start SERVICE_AUTO_START
        Write-OK "Windows-Dienst '$serviceName' registriert (via NSSM)"
    } else {
        Write-Warn "NSSM nicht gefunden. Dienst wird als geplante Aufgabe eingerichtet."
        $action = New-ScheduledTaskAction -Execute "node" -Argument "$InstallPath\bin\bridge-server.js" -WorkingDirectory $InstallPath
        $trigger = New-ScheduledTaskTrigger -AtLogOn
        $settings = New-ScheduledTaskSettingsSet -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
        Register-ScheduledTask -TaskName "OpenClawBridge" -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest -Force | Out-Null
        Write-OK "Geplante Aufgabe 'OpenClawBridge' registriert"
    }
}

# ─── 7. Firewall-Regeln ───────────────────────────────────
if ($OpenFirewall) {
    Write-Host "`n7. Firewall-Regeln konfigurieren..." -ForegroundColor White
    
    $ports = @($BridgePort, $AgentRuntimePort, $ToolGatewayPort)
    foreach ($port in $ports) {
        $ruleName = "OpenClaw-Port-$port"
        Remove-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
        New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP `
            -LocalPort $port -Action Allow -Profile Private | Out-Null
        Write-OK "Firewall-Regel für Port $port"
    }
}

# ─── 8. PATH-Variable aktualisieren ──────────────────────
Write-Host "`n8. Umgebungsvariablen konfigurieren..." -ForegroundColor White
$currentPath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")
if ($currentPath -notlike "*$InstallPath\bin*") {
    [System.Environment]::SetEnvironmentVariable("PATH", "$currentPath;$InstallPath\bin", "Machine")
    Write-OK "PATH aktualisiert"
}

# ─── Abschluss ────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✓ Installation abgeschlossen!                  ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Nächste Schritte:" -ForegroundColor White
Write-Host "  1. Kopiere $InstallPath\config\.env.example → $InstallPath\config\.env"
Write-Host "  2. Trage deine Tokens in .env ein"
Write-Host "  3. Starte den Stack: $InstallPath\scripts\Start-Stack.ps1"
Write-Host "  4. Starte die Bridge: $InstallPath\scripts\Start-Bridge.ps1"
Write-Host "  5. Test: curl http://127.0.0.1:$BridgePort/health"
Write-Host ""
Write-Host "Bridge-URL: http://127.0.0.1:$BridgePort" -ForegroundColor Cyan
Write-Host "Agent-Runtime: http://localhost:$AgentRuntimePort" -ForegroundColor Cyan
Write-Host "Tool-Gateway: http://localhost:$ToolGatewayPort" -ForegroundColor Cyan
