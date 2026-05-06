# MCP Server Management Script
# Starts all required MCP servers for the development environment

param(
    [switch]$Stop = $false,
    [switch]$Restart = $false
)

$serverProcesses = @()

function Start-McpServer {
    param($Name, $Port, $ScriptPath)
    
    Write-Host "Starting $Name MCP Server on port $Port..." -ForegroundColor Green
    
    $process = Start-Process -FilePath "node" -ArgumentList $ScriptPath -WindowStyle Hidden -PassThru
    $serverProcesses += @{Name = $Name; Process = $process; Port = $Port}
    
    Start-Sleep -Seconds 2
    return $process
}

function Stop-McpServers {
    Write-Host "Stopping all MCP servers..." -ForegroundColor Yellow
    
    # Stop by process name
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*mcp-stub*" -or $_.CommandLine -like "*mcp-servers*"
    } | Stop-Process -Force
    
    Write-Host "All MCP servers stopped." -ForegroundColor Red
}

if ($Stop) {
    Stop-McpServers
    exit 0
}

if ($Restart) {
    Stop-McpServers
    Start-Sleep -Seconds 3
}

Write-Host "No standalone Figma HTTP MCP server is configured anymore." -ForegroundColor Cyan
Write-Host "Active MCP integrations are loaded directly from mcp.json and .vscode/mcp.json." -ForegroundColor Green
Write-Host "Current baseline: GitHub, filesystem, memory, sequential-thinking, playwright, context7, plus repo-local helpers." -ForegroundColor Gray
Write-Host "Use 'npm run mcp:check' to verify the active stack." -ForegroundColor Gray