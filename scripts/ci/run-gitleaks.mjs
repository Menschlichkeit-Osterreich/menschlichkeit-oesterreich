#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPORTS_DIR = resolve(globalThis['process'].cwd(), 'quality-reports');
const OUTPUT_JSON = resolve(REPORTS_DIR, 'secrets-scan.json');
const GITLEAKS_CONFIG = resolve(globalThis['process'].cwd(), '.gitleaks.toml');
const GITLEAKS_IGNORE = resolve(globalThis['process'].cwd(), '.gitleaksignore');
const args = globalThis['process'].argv.slice(2);
const historyMode = args.includes('--mode=history');
const DEFAULT_TIMEOUT_SECONDS = '180';

function run(cmd, args = [], allowedExitCodes = [0]) {
  return new Promise((resolveOk, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: false });
    p.on('error', reject);
    p.on('exit', code => (allowedExitCodes.includes(code) ? resolveOk(code) : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function writeEmpty() {
  mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(OUTPUT_JSON, JSON.stringify({ findings: [] }, null, 2));
}

function ensureReportGenerated() {
  if (!existsSync(OUTPUT_JSON)) {
    throw new Error(`Gitleaks-Report fehlt: ${OUTPUT_JSON}`);
  }

  const content = readFileSync(OUTPUT_JSON, 'utf8').trim();
  if (!content) {
    throw new Error(`Gitleaks-Report ist leer: ${OUTPUT_JSON}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`Gitleaks-Report ist kein gueltiges JSON: ${OUTPUT_JSON}`);
  }

  const isArray = Array.isArray(parsed);
  const hasFindingsArray = typeof parsed === 'object' && parsed !== null && Array.isArray(parsed.findings);
  if (!isArray && !hasFindingsArray) {
    throw new Error(`Gitleaks-Report hat ein unerwartetes Format: ${OUTPUT_JSON}`);
  }
}

async function main() {
  mkdirSync(REPORTS_DIR, { recursive: true });

  async function ensureWritableReportTarget() {
    try {
      writeFileSync(OUTPUT_JSON, '', { flag: 'a' });
      return;
    } catch (e) {
      if (e.code !== 'EACCES') {
        throw e;
      }
    }

    const uid = typeof globalThis['process'].getuid === 'function' ? String(globalThis['process'].getuid()) : '0';
    const gid = typeof globalThis['process'].getgid === 'function' ? String(globalThis['process'].getgid()) : '0';

    await run('docker', [
      'run',
      '--rm',
      '-v',
      `${globalThis['process'].cwd()}:/repo`,
      'alpine',
      'chown',
      `${uid}:${gid}`,
      '/repo/quality-reports/secrets-scan.json',
    ]);

    writeFileSync(OUTPUT_JSON, '', { flag: 'a' });
  }

  async function runLocal() {
    if (historyMode) {
      await run('gitleaks', [
        'detect',
        '--config',
        GITLEAKS_CONFIG,
        '--gitleaks-ignore-path',
        GITLEAKS_IGNORE,
        '--timeout',
        DEFAULT_TIMEOUT_SECONDS,
        '--no-banner',
        '--redact',
        '--log-opts=--all',
        '--report-path',
        OUTPUT_JSON,
        '--report-format',
        'json',
      ], [0, 1]);
    } else {
      await run('gitleaks', [
        'detect',
        '--source',
        '.',
        '--config',
        GITLEAKS_CONFIG,
        '--gitleaks-ignore-path',
        GITLEAKS_IGNORE,
        '--timeout',
        DEFAULT_TIMEOUT_SECONDS,
        '--no-banner',
        '--no-git',
        '--max-target-megabytes',
        '5',
        '--redact',
        '--report-path',
        OUTPUT_JSON,
        '--report-format',
        'json',
      ], [0, 1]);
    }
  }

  async function runDocker() {
    const uid = typeof globalThis['process'].getuid === 'function' ? String(globalThis['process'].getuid()) : '0';
    const gid = typeof globalThis['process'].getgid === 'function' ? String(globalThis['process'].getgid()) : '0';

    const dockerBase = [
      'run',
      '--rm',
      '--user',
      `${uid}:${gid}`,
      '-v',
      `${globalThis['process'].cwd()}:/repo`,
      '-w',
      '/repo',
      '--entrypoint',
      'gitleaks',
      'ghcr.io/gitleaks/gitleaks:latest',
    ];

    if (historyMode) {
      await run('docker', [
        ...dockerBase,
        'detect',
        '--config',
        '.gitleaks.toml',
        '--gitleaks-ignore-path',
        '.gitleaksignore',
        '--timeout',
        DEFAULT_TIMEOUT_SECONDS,
        '--no-banner',
        '--redact',
        '--log-opts=--all',
        '--report-path',
        'quality-reports/secrets-scan.json',
        '--report-format',
        'json',
      ], [0, 1]);
    } else {
      await run('docker', [
        ...dockerBase,
        'detect',
        '--source',
        '.',
        '--config',
        '.gitleaks.toml',
        '--gitleaks-ignore-path',
        '.gitleaksignore',
        '--timeout',
        DEFAULT_TIMEOUT_SECONDS,
        '--no-banner',
        '--no-git',
        '--max-target-megabytes',
        '5',
        '--redact',
        '--report-path',
        'quality-reports/secrets-scan.json',
        '--report-format',
        'json',
      ], [0, 1]);
    }
  }

  try {
    await ensureWritableReportTarget();
  } catch (e) {
    globalThis.console.warn('Report-Zieldatei konnte nicht vorab schreibbar gemacht werden:', e.message);
  }

  try {
    await runLocal();
    ensureReportGenerated();
    globalThis['process'].exit(0);
  } catch (e) {
    globalThis['console'].warn('Lokales Gitleaks fehlgeschlagen, versuche Docker-Fallback:', e.message);
  }

  try {
    await runDocker();
    ensureReportGenerated();
    globalThis['process'].exit(0);
  } catch (e) {
    globalThis['console'].warn('Gitleaks Docker-Fallback fehlgeschlagen:', e.message);
    try {
      writeEmpty();
    } catch (writeErr) {
      globalThis['console'].warn('Leerer Gitleaks-Report konnte nicht geschrieben werden:', writeErr.message);
    }
    globalThis['process'].exit(1);
  }
}

main();
