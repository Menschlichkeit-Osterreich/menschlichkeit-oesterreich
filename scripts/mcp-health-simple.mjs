#!/usr/bin/env node
// Ultra-einfacher MCP Health Check - KEINE hängenden Prozesse
import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';

const workspaceRoot = process.cwd();
const reportPath = path.join(workspaceRoot, 'quality-reports', 'mcp-health.json');

async function httpCheck(url) {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, { signal: controller.signal });
    return { ok: true, status: res.status };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function syncCheck(cmd, timeoutMs = 3000) {
  try {
    const output = execSync(cmd, { 
      timeout: timeoutMs, 
      encoding: 'utf8',
      stdio: 'pipe',
      windowsHide: true
    });
    return { ok: true, output: output.trim() };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function main() {
  console.log('🔍 MCP Health Check (schnelle Version)...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // HTTP Checks (schnell)
  console.log('→ Figma HTTP...');
  results.checks['figma-http'] = await httpCheck('http://127.0.0.1:3845/mcp');

  // Nur kritische Tool-Checks (synchron mit Timeout)
  console.log('→ uvx...');
  results.checks['uvx'] = syncCheck('uvx --version', 1000);

  console.log('→ npx...');
  results.checks['npx'] = syncCheck('npx --version', 1000);

  console.log('→ node...');
  results.checks['node'] = syncCheck('node --version', 1000);

  // Package installations ÜBERSPRINGEN (zu langsam)
  const mcpPackages = [
    '@modelcontextprotocol/server-memory',
    '@modelcontextprotocol/server-filesystem',
    '@sethdouglasford/mcp-figma',
    '@playwright/mcp',
    '@microsoft/clarity-mcp-server',
    '@microsoft/devbox-mcp',
    'markitdown-mcp'
  ];

  results.checks['mcp-packages'] = {
    note: 'Package-Installation übersprungen (zu langsam)',
    configured: mcpPackages,
    recommendation: 'Manuelle Prüfung via VS Code MCP Extension'
  };

  // Report schreiben
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Report: ${path.relative(workspaceRoot, reportPath)}`);
  console.log(`⏱️  Dauer: < 5 Sekunden (keine hängenden Prozesse)`);
}

main().catch(e => {
  console.error('❌ Fehler:', e.message);
  process.exit(1);
});
