<#
.SYNOPSIS
    Starts the full OpenClaw Docker stack via WSL2.
.DESCRIPTION
    This script ensures WSL2 is running, navigates to the project directory within the WSL2 context,
    and executes the boot.sh script to start all Docker containers defined in docker-compose.oc.yml.
.EXAMPLE
    ./Start-Stack.ps1
#>

param()

$ErrorActionPreference = "Stop"

# Get the directory of the current script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path -Path (Join-Path $ScriptDir "..\..\..")

# Convert Windows path to WSL path
$WslProjectRoot = $ProjectRoot -replace '\\
