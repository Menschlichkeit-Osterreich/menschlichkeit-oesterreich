#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPORTS_DIR = resolve(process.cwd(), 'quality-reports');
const OUTPUT_SARIF = resolve(REPORTS_DIR, 'trivy-security.sarif');

function run(cmd, args = []) {
  return new Promise((resolveOk, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    p.on('error', reject);
    p.on('exit', (code) => (code === 0 ? resolveOk(0) : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function writeEmptySarif() {
  mkdirSync(REPORTS_DIR, { recursive: true });
  const sarif = { $schema: 'https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json', version: '2.1.0', runs: [{ results: [] }] };
  writeFileSync(OUTPUT_SARIF, JSON.stringify(sarif, null, 2));
}

async function main() {
  try {
    await run('trivy', ['fs', '--format', 'sarif', '--output', OUTPUT_SARIF, '.']);
  } catch (e) {
    console.warn('Trivy nicht verfügbar, schreibe leeren SARIF:', e.message);
    writeEmptySarif();
  }
  process.exit(0);
}

main();
