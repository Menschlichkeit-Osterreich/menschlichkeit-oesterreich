#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { clearTimeout, setTimeout } from 'node:timers';

const REPORTS_DIR = resolve(process.cwd(), 'quality-reports');
const OUTPUT_SARIF = resolve(REPORTS_DIR, 'codacy-analysis.sarif');
const LOCAL_CODACY_JAR = resolve(
  process.cwd(),
  process.env.CODACY_LOCAL_JAR || '.cache/codacy/codacy-analysis-cli-assembly.jar'
);
const CODACY_JAR_URL =
  process.env.CODACY_JAR_URL ||
  'https://github.com/codacy/codacy-analysis-cli/releases/latest/download/codacy-analysis-cli-assembly.jar';
const MIN_JAR_BYTES = 1024 * 1024;
const DEFAULT_TOOLS = 'eslint,trivy';

function isStrictMode() {
  const fallback = process.env.CI ? '1' : '0';
  const raw = (process.env.CODACY_STRICT || fallback).trim().toLowerCase();
  return raw !== '0' && raw !== 'false' && raw !== 'no';
}

function shouldUseWslFallback() {
  const raw = (process.env.CODACY_USE_WSL_FALLBACK || '0').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

function toWslPath(winPath) {
  const normalized = winPath.replace(/\\/g, '/');
  const driveMatch = normalized.match(/^([A-Za-z]):\/(.*)$/);
  if (!driveMatch) {
    return normalized;
  }
  const drive = driveMatch[1].toLowerCase();
  const rest = driveMatch[2] || '';
  return `/mnt/${drive}/${rest}`;
}

function parseToolArgsFromEnv() {
  const rawTools = (process.env.CODACY_TOOLS || process.env.CODACY_DEFAULT_TOOLS || DEFAULT_TOOLS).trim();
  if (!rawTools || ['all', 'full', '*'].includes(rawTools.toLowerCase())) {
    return [];
  }
  return rawTools
    .split(',')
    .map(tool => tool.trim())
    .filter(Boolean)
    .flatMap(tool => ['--tool', tool]);
}

function shouldAllowNetwork() {
  const raw = (process.env.CODACY_ALLOW_NETWORK || '1').trim().toLowerCase();
  return raw !== '0' && raw !== 'false' && raw !== 'no';
}

function getTimeoutMs() {
  const raw = (process.env.CODACY_TIMEOUT_SECONDS || '300').trim();
  const seconds = Number(raw);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 5 * 60 * 1000;
  }
  return seconds * 1000;
}

function getAnalysisDirectory() {
  return process.env.CODACY_DIRECTORY || '.';
}

function logStep(message) {
  process.stderr.write(`[codacy] ${message}\n`);
}

function logError(message) {
  process.stderr.write(`${message}\n`);
}

function isValidJarFile(jarPath) {
  if (!existsSync(jarPath)) {
    return false;
  }
  try {
    const size = statSync(jarPath).size;
    if (size < MIN_JAR_BYTES) {
      return false;
    }
    const header = readFileSync(jarPath, { encoding: null }).subarray(0, 2);
    // JAR-Dateien sind ZIP-Container und starten mit "PK".
    return header[0] === 0x50 && header[1] === 0x4b;
  } catch {
    return false;
  }
}

async function ensureValidLocalJar() {
  if (isValidJarFile(LOCAL_CODACY_JAR)) {
    return;
  }
  if (!shouldAllowNetwork()) {
    throw new Error('Lokale Codacy-JAR ist ungültig und Netzwerkzugriff ist deaktiviert');
  }

  mkdirSync(resolve(LOCAL_CODACY_JAR, '..'), { recursive: true });
  logStep(`Downloading Codacy CLI JAR to ${LOCAL_CODACY_JAR}`);
  await run('curl', ['-fsSL', '--retry', '3', '--retry-delay', '2', '-o', LOCAL_CODACY_JAR, CODACY_JAR_URL]);

  if (!isValidJarFile(LOCAL_CODACY_JAR)) {
    throw new Error('Heruntergeladene Codacy-JAR ist ungültig oder unvollständig');
  }
}

function run(cmd, args = [], timeoutMs = getTimeoutMs()) {
  return new Promise((resolveOk, reject) => {
    logStep(`Running ${cmd} ${args.join(' ')} with timeout ${Math.round(timeoutMs / 1000)}s`);
    const p = spawn(cmd, args, { stdio: 'inherit', shell: false });
    const timeout = setTimeout(() => {
      try {
        p.kill('SIGTERM');
      } catch {
        // ignore
      }
      setTimeout(() => {
        try {
          p.kill('SIGKILL');
        } catch {
          // ignore
        }
      }, 5000).unref();
      reject(new Error(`${cmd} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    p.on('error', reject);
    p.on('exit', code => {
      clearTimeout(timeout);
      code === 0 ? resolveOk(0) : reject(new Error(`${cmd} exited ${code}`));
    });
  });
}

function writeEmptySarif() {
  mkdirSync(REPORTS_DIR, { recursive: true });
  const sarif = {
    $schema: 'https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json',
    version: '2.1.0',
    runs: [{ tool: { driver: { name: 'codacy-analysis-cli', version: 'fallback' } }, results: [] }],
  };
  writeFileSync(OUTPUT_SARIF, JSON.stringify(sarif, null, 2));
}

async function runViaWslOnWindows(analyzeArgs) {
  if (process.platform !== 'win32') {
    return false;
  }

  const cwdWsl = toWslPath(process.cwd());
  const outputWsl = toWslPath(OUTPUT_SARIF);
  const stagedOutput = '/tmp/codacy-analysis.sarif';

  const stagedArgs = analyzeArgs
    .map(arg => (arg === OUTPUT_SARIF ? stagedOutput : arg))
    .map(arg => `'${String(arg).replace(/'/g, `'\\''`)}'`)
    .join(' ');

  // On Windows-mounted paths (/mnt/*), Codacy tools can fail with read-access errors.
  // Run analysis inside a native WSL temp workspace and copy only the SARIF output back.
  const command = [
    'set -euo pipefail',
    'tmp_dir="$(mktemp -d /tmp/codacy-run-XXXXXX)"',
    'cleanup() { rm -rf "$tmp_dir"; }',
    'trap cleanup EXIT',
    `rsync -a --delete --exclude '.git/' --exclude 'node_modules/' --exclude 'quality-reports/' --exclude '.pytest_cache/' --exclude '.venv/' --exclude 'apps/**/.next/' --exclude '**/__pycache__/' '${cwdWsl}/' "$tmp_dir/"`,
    'cd "$tmp_dir"',
    `DOCKER_HOST='' ./codacy-analysis-cli ${stagedArgs}`,
    `mkdir -p '${toWslPath(REPORTS_DIR)}'`,
    `cp '${stagedOutput}' '${outputWsl}'`,
  ].join(' && ');

  await run('wsl', ['-e', 'bash', '-lc', command]);
  return true;
}

async function main() {
  try {
    // Ensure SARIF target directory exists for both native CLI and java -jar fallback.
    mkdirSync(REPORTS_DIR, { recursive: true });

    const analyzeArgs = [
      'analyze',
      '--format',
      'sarif',
      '--output',
      OUTPUT_SARIF,
      '--directory',
      getAnalysisDirectory(),
      '--skip-uncommitted-files-check',
      'true',
      ...parseToolArgsFromEnv(),
      ...(shouldAllowNetwork() ? ['--allow-network'] : []),
    ];

    try {
      await run('codacy-analysis-cli', analyzeArgs);
      process.exit(0);
      return;
    } catch (pathError) {
      logStep(`Native Codacy CLI unavailable or failed: ${pathError.message}`);
      if (!existsSync(LOCAL_CODACY_JAR) && !shouldAllowNetwork()) {
        throw pathError;
      }

      await ensureValidLocalJar();
      logStep('Retrying with local Codacy CLI JAR fallback');
      await run('java', ['-jar', LOCAL_CODACY_JAR, ...analyzeArgs]);
      process.exit(0);
      return;
    }
  } catch (localError) {
    if (process.platform === 'win32' && shouldUseWslFallback()) {
      try {
        const analyzeArgs = [
          'analyze',
          '--format',
          'sarif',
          '--output',
          OUTPUT_SARIF,
          '--directory',
          getAnalysisDirectory(),
          '--skip-uncommitted-files-check',
          'true',
          ...parseToolArgsFromEnv(),
          ...(shouldAllowNetwork() ? ['--allow-network'] : []),
        ];
        await runViaWslOnWindows(analyzeArgs);
        process.exit(0);
        return;
      } catch (wslError) {
        const combinedError = new Error(
          `Lokale Codacy-Ausführung fehlgeschlagen (${localError.message}) und WSL-Fallback fehlgeschlagen (${wslError.message})`
        );
        if (isStrictMode()) {
          logError(combinedError.message);
          process.exit(1);
          return;
        }
        logError(`${combinedError.message}; schreibe leeren SARIF im non-strict Modus.`);
        writeEmptySarif();
        process.exit(0);
        return;
      }
    }

    if (isStrictMode()) {
      logError(`Codacy-Ausführung fehlgeschlagen: ${localError.message}`);
      process.exit(1);
      return;
    }
    logError(
      `Codacy CLI nicht verfügbar oder fehlgeschlagen, schreibe leeren SARIF (non-strict): ${localError.message}`
    );
    writeEmptySarif();
    process.exit(0);
  }
}

main();
