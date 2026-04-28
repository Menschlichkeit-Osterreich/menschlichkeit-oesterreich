#!/usr/bin/env node
import fs, { access } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const workspaceRoot = process.cwd();
const repoMcpConfigPath = path.join(workspaceRoot, 'mcp.json');
const vscodeMcpConfigPath = path.join(workspaceRoot, '.vscode', 'mcp.json');
const reportDir = path.join(workspaceRoot, 'quality-reports');
const reportPath = path.join(reportDir, 'mcp-access.json');

/** Simple fetch with timeout using undici if available, fallback to http/https */
async function httpGet(url, timeoutMs = 2000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Use built-in fetch in Node 18+
    const res = await fetch(url, { method: 'GET', signal: controller.signal });
    return { ok: true, status: res.status, statusText: res.statusText };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  } finally {
    clearTimeout(t);
  }
}

function isLocalUrl(u) {
  try {
    const { hostname } = new URL(u);
    return hostname === '127.0.0.1' || hostname === 'localhost';
  } catch {
    return false;
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

function normalizeRepoServers(cfg) {
  const servers = cfg?.mcpServers || {};
  return Object.entries(servers).map(([name, server]) => ({
    name,
    source: 'mcp.json',
    type: 'stdio',
    config: server,
  }));
}

function normalizeVscodeServers(cfg) {
  const servers = cfg?.servers || {};
  return Object.entries(servers).map(([name, server]) => ({
    name,
    source: '.vscode/mcp.json',
    type: server?.type || 'stdio',
    config: server,
  }));
}

async function main() {
  const report = {
    timestamp: new Date().toISOString(),
    workspace: workspaceRoot,
    configs: [repoMcpConfigPath, vscodeMcpConfigPath],
    results: {},
    notes: [],
  };

  try {
    const [repoCfg, vscodeCfg] = await Promise.all([
      loadJsonIfPresent(repoMcpConfigPath),
      loadJsonIfPresent(vscodeMcpConfigPath),
    ]);

    const entries = [...normalizeRepoServers(repoCfg), ...normalizeVscodeServers(vscodeCfg)];

    if (entries.length === 0) {
      report.notes.push('Keine MCP-Server in mcp.json oder .vscode/mcp.json gefunden.');
    }

    for (const entry of entries) {
      const { name, type, source, config } = entry;
      const result = { type, source };
      if (type === 'http' && config?.url && isLocalUrl(config.url)) {
        // Only probe local HTTP endpoints to avoid external calls
        const res = await httpGet(config.url);
        Object.assign(result, res);
        if (!res.ok) {
          result.hint = `Lokaler HTTP-MCP nicht erreichbar. Starten Sie den passenden Server oder entfernen Sie den stale Eintrag aus ${source}.`;
        }
      } else if (type === 'http') {
        result.ok = null;
        result.skipped = true;
        result.reason = 'Skipping external HTTP checks to avoid network calls.';
      } else if (
        config?.command === 'node' &&
        Array.isArray(config?.args) &&
        config.args.length > 0
      ) {
        const entryFile = resolveWorkspaceValue(config.args[0]);
        const absoluteEntryFile = path.isAbsolute(entryFile)
          ? entryFile
          : path.join(workspaceRoot, entryFile);

        const exists = await fileExists(absoluteEntryFile);
        result.ok = exists;
        result.command = config.command;
        result.entry = path.relative(workspaceRoot, absoluteEntryFile);
        if (!exists) {
          result.hint = `Lokaler STDIO-MCP verweist auf eine fehlende Node-Entry-Datei in ${source}.`;
        }
      } else {
        result.ok = null;
        result.skipped = true;
        result.reason =
          'STDIO server command presence not verified to avoid side-effects (npx/uvx installs).';
      }
      const resultKey = report.results[name] ? `${name} (${source})` : name;
      report.results[resultKey] = result;
      // Tiny pause to avoid hammering anything
      await delay(25);
    }
  } catch (e) {
    report.error = e?.message || String(e);
  }

  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`MCP access report written to: ${path.relative(workspaceRoot, reportPath)}`);
  if (report.error) {
    console.error('Error during MCP access check:', report.error);
    process.exitCode = 1;
  }
}

main();
