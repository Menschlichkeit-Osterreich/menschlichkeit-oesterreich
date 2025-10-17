#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const workspaceRoot = process.cwd();
const mcpConfigPath = path.join(workspaceRoot, '.vscode', 'mcp.json');
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

async function main() {
  const report = {
    timestamp: new Date().toISOString(),
    workspace: workspaceRoot,
    config: mcpConfigPath,
    results: {},
    notes: []
  };

  try {
    const raw = await fs.readFile(mcpConfigPath, 'utf8');
    const cfg = JSON.parse(raw);
    const servers = cfg?.servers || {};
    const entries = Object.entries(servers);

    for (const [name, srv] of entries) {
      const type = srv?.type || 'stdio';
      const result = { type };
      if (type === 'http' && srv?.url && isLocalUrl(srv.url)) {
        // Only probe local HTTP endpoints to avoid external calls
        const res = await httpGet(srv.url);
        Object.assign(result, res);
        if (!res.ok) {
          result.hint = `HTTP endpoint not reachable. If this is a local MCP server, start it (e.g., npm run figma:mcp:server).`;
        }
      } else if (type === 'http') {
        result.ok = null;
        result.skipped = true;
        result.reason = 'Skipping external HTTP checks to avoid network calls.';
      } else {
        result.ok = null;
        result.skipped = true;
        result.reason = 'STDIO server command presence not verified to avoid side-effects (npx/uvx installs).';
      }
      report.results[name] = result;
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
