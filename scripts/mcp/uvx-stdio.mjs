#!/usr/bin/env node
import { spawn } from 'node:child_process';

if (process.argv.length < 3) {
  console.error('[uvx-stdio] Usage: node scripts/mcp/uvx-stdio.mjs <package==version> [args...]');
  process.exit(64);
}

const pkg = process.argv[2];
const extraArgs = process.argv.slice(3);

const child = spawn('uvx', [pkg, ...extraArgs], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('error', (err) => {
  console.error('[uvx-stdio] Failed to start uvx:', err?.message || err);
  console.error('[uvx-stdio] Please install uv (https://docs.astral.sh/uv/getting-started/install/) or run the server manually.');
  process.exit(127);
});

child.on('exit', (code) => process.exit(code ?? 1));
