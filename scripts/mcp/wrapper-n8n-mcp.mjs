#!/usr/bin/env node
import { spawn } from 'node:child_process';

const requiredEnvVars = ['N8N_API_URL', 'N8N_API_KEY'];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  console.error(`[n8n-mcp] Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(64);
}

const child = spawn('npx', ['-y', 'n8n-mcp@2.50.5'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

child.on('error', (err) => {
  console.error('[n8n-mcp] Failed to start server:', err?.message || err);
  process.exit(127);
});

child.on('exit', (code) => process.exit(code ?? 1));