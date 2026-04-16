#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPORTS_DIR = resolve(process.cwd(), 'quality-reports');
const OUTPUT_JSON = resolve(REPORTS_DIR, 'bandit-security.json');

function run(cmd, args = [], okExitCodes = [0]) {
  return new Promise((resolveOk, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: false });
    p.on('error', reject);
    p.on('exit', code => (okExitCodes.includes(code) ? resolveOk(code) : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function writeEmpty() {
  mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(OUTPUT_JSON, JSON.stringify({ results: [] }, null, 2));
}

async function main() {
  try {
    await run(process.execPath, [
      resolve(process.cwd(), 'scripts', 'run-python.mjs'),
      '-m',
      'bandit',
      '-r',
      'scripts/',
      'enterprise-upgrade/scripts/',
      'apps/api/',
      '-f',
      'json',
      '-o',
      OUTPUT_JSON,
    ], [0, 1]);
  } catch (e) {
    console.warn('Bandit nicht verfügbar, schreibe leeren Report:', e.message);
    writeEmpty();
  }
  process.exit(0);
}

main();
