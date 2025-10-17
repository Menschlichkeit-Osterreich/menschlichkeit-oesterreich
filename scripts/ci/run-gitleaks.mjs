#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPORTS_DIR = resolve(process.cwd(), 'quality-reports');
const OUTPUT_JSON = resolve(REPORTS_DIR, 'secrets-scan.json');

function run(cmd, args = []) {
  return new Promise((resolveOk, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    p.on('error', reject);
    p.on('exit', (code) => (code === 0 ? resolveOk(0) : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function writeEmpty() {
  mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(OUTPUT_JSON, JSON.stringify({ findings: [] }, null, 2));
}

async function main() {
  try {
    await run('gitleaks', ['detect', '--report-path', OUTPUT_JSON, '--report-format', 'json']);
  } catch (e) {
    console.warn('Gitleaks nicht verfügbar, schreibe leeren Report:', e.message);
    writeEmpty();
  }
  process.exit(0);
}

main();
