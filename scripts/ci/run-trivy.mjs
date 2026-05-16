#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPORTS_DIR = resolve(globalThis['process'].cwd(), 'quality-reports');
const OUTPUT_SARIF = resolve(REPORTS_DIR, 'trivy-security.sarif');
const CACHE_DIR = resolve(REPORTS_DIR, '.trivy-cache');

function run(cmd, args = []) {
  return new Promise((resolveOk, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: false });
    p.on('error', reject);
    p.on('exit', code => (code === 0 ? resolveOk(0) : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function writeEmptySarif() {
  mkdirSync(REPORTS_DIR, { recursive: true });
  const sarif = {
    $schema: 'https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json',
    version: '2.1.0',
    runs: [{ results: [] }],
  };
  writeFileSync(OUTPUT_SARIF, JSON.stringify(sarif, null, 2));
}

async function main() {
  mkdirSync(REPORTS_DIR, { recursive: true });
  mkdirSync(CACHE_DIR, { recursive: true });

  try {
    await run('trivy', ['fs', '--format', 'sarif', '--output', OUTPUT_SARIF, '.']);
    globalThis['process'].exit(0);
  } catch (e) {
    globalThis['process'].stderr.write(`Lokales Trivy fehlgeschlagen, versuche Docker-Fallback: ${e.message}\n`);
  }

  try {
    const uid = typeof globalThis['process'].getuid === 'function' ? String(globalThis['process'].getuid()) : '0';
    const gid = typeof globalThis['process'].getgid === 'function' ? String(globalThis['process'].getgid()) : '0';

    await run('docker', [
      'run',
      '--rm',
      '--user',
      `${uid}:${gid}`,
      '-e',
      'HOME=/tmp',
      '-e',
      'XDG_CACHE_HOME=/tmp/.cache',
      '-e',
      'TRIVY_CACHE_DIR=/tmp/trivy-cache',
      '-v',
      `${globalThis['process'].cwd()}:/src`,
      '-v',
      `${REPORTS_DIR}:/out`,
      '-v',
      `${CACHE_DIR}:/.cache`,
      'aquasec/trivy:latest',
      '--cache-dir',
      '/.cache/trivy',
      'fs',
      '--format',
      'sarif',
      '--output',
      '/out/trivy-security.sarif',
      '/src',
    ]);
    globalThis['process'].exit(0);
  } catch (e) {
    globalThis['process'].stderr.write(`Trivy Docker-Fallback fehlgeschlagen: ${e.message}\n`);
    writeEmptySarif();
    globalThis['process'].exit(1);
  }
}

main();
