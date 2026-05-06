#!/usr/bin/env node
// Ultra-einfacher MCP Health Check - KEINE hängenden Prozesse
import { execSync } from 'node:child_process';
import fs, { access } from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const reportPath = path.join(workspaceRoot, 'quality-reports', 'mcp-health.json');
const repoMcpConfigPath = path.join(workspaceRoot, 'mcp.json');
const vscodeMcpConfigPath = path.join(workspaceRoot, '.vscode', 'mcp.json');

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
      windowsHide: true,
    });
    return { ok: true, output: output.trim() };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function resolveWorkspaceValue(value) {
  if (typeof value !== 'string') {
    return value;
  }

  return value
    .replaceAll('${workspaceFolder}', workspaceRoot)
    .replaceAll('${workspaceRoot}', workspaceRoot);
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadJsonIfPresent(configPath) {
  try {
    const raw = await fs.readFile(configPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

function collectServers(repoCfg, vscodeCfg) {
  const repoServers = Object.entries(repoCfg?.mcpServers || {}).map(([name, config]) => ({
    name,
    source: 'mcp.json',
    type: 'stdio',
    config,
  }));
  const vscodeServers = Object.entries(vscodeCfg?.servers || {}).map(([name, config]) => ({
    name,
    source: '.vscode/mcp.json',
    type: config?.type || 'stdio',
    config,
  }));

  return [...repoServers, ...vscodeServers];
}

async function main() {
  console.log('🔍 MCP Health Check (schnelle Version)...\n');

  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    configs: [repoMcpConfigPath, vscodeMcpConfigPath],
  };

  const [repoCfg, vscodeCfg] = await Promise.all([
    loadJsonIfPresent(repoMcpConfigPath),
    loadJsonIfPresent(vscodeMcpConfigPath),
  ]);

  const servers = collectServers(repoCfg, vscodeCfg);

  for (const server of servers) {
    const { name, source, type, config } = server;
    const key = results.checks[name] ? `${name} (${source})` : name;

    if (type === 'http' && config?.url) {
      const url = resolveWorkspaceValue(config.url);
      const isLocal = /localhost|127\.0\.0\.1/i.test(url);
      console.log(`→ ${name} HTTP...`);
      if (isLocal) {
        results.checks[key] = { type, source, url, ...(await httpCheck(url)) };
      } else {
        results.checks[key] = {
          type,
          source,
          url,
          ok: null,
          skipped: true,
          reason: 'Externer HTTP-MCP wird im Schnellcheck nicht aktiv angepingt.',
        };
      }
      continue;
    }

    if (config?.command === 'node' && Array.isArray(config?.args) && config.args.length > 0) {
      const entryFile = resolveWorkspaceValue(config.args[0]);
      const absoluteEntryFile = path.isAbsolute(entryFile)
        ? entryFile
        : path.join(workspaceRoot, entryFile);
      console.log(`→ ${name} local node entry...`);
      results.checks[key] = {
        type: 'stdio',
        source,
        command: 'node',
        entry: path.relative(workspaceRoot, absoluteEntryFile),
        ok: await fileExists(absoluteEntryFile),
      };
      continue;
    }

    results.checks[key] = {
      type: type || 'stdio',
      source,
      ok: null,
      skipped: true,
      reason: 'STDIO-Package-Checks fuer npx/uvx bleiben im Schnellcheck deaktiviert.',
    };
  }

  // Nur kritische Tool-Checks (synchron mit Timeout)
  console.log('→ uvx...');
  results.checks['uvx'] = syncCheck('uvx --version', 1000);

  console.log('→ npx...');
  results.checks['npx'] = syncCheck('npx --version', 1000);

  console.log('→ node...');
  results.checks['node'] = syncCheck('node --version', 1000);

  results.checks['mcp-packages'] = {
    note: 'Package-Installationen werden weiterhin nicht aktiv geprüft.',
    configured: servers
      .filter(server => server.config?.command === 'npx')
      .map(server => ({
        name: server.name,
        source: server.source,
        args: server.config.args,
      })),
    recommendation:
      'Bei Paketproblemen npm exec/npx manuell pruefen oder VS Code MCP-Logs kontrollieren.',
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
