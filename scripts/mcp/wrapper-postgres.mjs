#!/usr/bin/env node
import { spawn } from 'node:child_process';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('[postgres-mcp] Missing DATABASE_URL environment variable.');
  process.exit(64);
}

const child = spawn('npx', ['-y', '@modelcontextprotocol/server-postgres@0.6.2', databaseUrl], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

child.on('error', (err) => {
  console.error('[postgres-mcp] Failed to start server:', err?.message || err);
  process.exit(127);
});

child.on('exit', (code) => process.exit(code ?? 1));