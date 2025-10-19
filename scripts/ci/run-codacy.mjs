#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const REPORTS_DIR = resolve(process.cwd(), 'quality-reports');
const OUTPUT_SARIF = resolve(REPORTS_DIR, 'codacy-analysis.sarif');
const OUTPUT_SARIF_ROOT = resolve(process.cwd(), 'codacy-analysis.sarif');

function log(msg) {
  // Minimal, damit CI-Logs schlank bleiben
  console.log(`[codacy] ${msg}`);
}

function loadDotenvOnce() {
  const candidates = ['.env.local', '.env'];
  for (const f of candidates) {
    try {
      const p = resolve(process.cwd(), f);
      if (!existsSync(p)) continue;
      const content = readFileSync(p, 'utf8');
      for (const raw of content.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith('#') || !line.includes('=')) continue;
        const [k, ...rest] = line.split('=');
        const key = k.trim();
        const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
        if (key && process.env[key] == null) process.env[key] = val;
      }
    } catch {
      // best-effort
    }
  }
}

function run(cmd, args, env = process.env) {
  return new Promise((resolveOk, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', env });
    p.on('error', reject);
    p.on('exit', (code) => (code === 0 ? resolveOk(0) : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function writeEmptySarif() {
  mkdirSync(REPORTS_DIR, { recursive: true });
  const sarif = {
    $schema: 'https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json',
    version: '2.1.0',
    runs: [
      { tool: { driver: { name: 'codacy-analysis-cli', version: 'fallback' } }, results: [] }
    ],
  };
  const payload = JSON.stringify(sarif, null, 2);
  writeFileSync(OUTPUT_SARIF, payload);
  writeFileSync(OUTPUT_SARIF_ROOT, payload);
}

function toDockerPath(localPath) {
  if (process.platform !== 'win32') return localPath;
  const m = /^([A-Za-z]):[\\/](.*)$/.exec(localPath);
  if (!m) return localPath.replace(/\\/g, '/');
  const drive = m[1].toLowerCase();
  const rest = m[2].replace(/\\/g, '/');
  return `/${drive}/${rest}`;
}

async function validateSarifAndGate(strict) {
  try {
    const sz = statSync(OUTPUT_SARIF).size;
    if (strict && sz < 200) {
      console.error(`[codacy] SARIF-Datei wirkt leer/zu klein (${sz} Bytes). (STRICT on) -> Exit 3`);
      process.exit(3);
    }
    const sarif = JSON.parse(readFileSync(OUTPUT_SARIF, 'utf8'));
    const results = (sarif?.runs || []).flatMap((r) => r.results || []);
    const level = String(process.env.CODACY_FAIL_LEVEL || 'any').toLowerCase(); // any|error|warning
    const threshold = Number.parseInt(process.env.CODACY_FAIL_THRESHOLD || '1', 10);
    const countAny = results.length;
    const countErr = results.filter((r) => (r.level || '').toLowerCase() === 'error').length;
    const countWarn = results.filter((r) => (r.level || '').toLowerCase() === 'warning').length;
    log(`Results: total=${countAny}, error=${countErr}, warning=${countWarn}; level=${level}, threshold=${threshold}`);
    let fail = false;
    if (level === 'error') fail = countErr >= threshold;
    else if (level === 'warning') fail = countErr + countWarn >= threshold;
    else fail = countAny >= threshold;
    if (fail) {
      console.error(`[codacy] FAIL: ${level} findings >= ${threshold} (Exit 4).`);
      process.exit(4);
    }
  } catch (e) {
    if (strict) {
      console.error('[codacy] SARIF-Validierung fehlgeschlagen (STRICT on).', e?.message || e);
      process.exit(5);
    } else {
      console.warn('[codacy] SARIF-Validierung übersprungen (STRICT off).');
    }
  }
}

async function main() {
  loadDotenvOnce();

  const strict = String(process.env.CODACY_STRICT || 'true').toLowerCase() === 'true';
  const doUpload = String(process.env.CODACY_UPLOAD || '').toLowerCase() === 'true';
  const hasApi = !!process.env.CODACY_API_TOKEN;
  const hasProject = !!process.env.CODACY_PROJECT_TOKEN;

  const mountPath = toDockerPath(process.cwd());

  // Prüfe Docker Engine Erreichbarkeit vorab
  try {
    await run('docker', ['info']);
  } catch (e) {
    if (strict) {
      console.error('[codacy] Docker Engine nicht erreichbar (STRICT on) – Exit 2:', e?.message || e);
      process.exit(2);
    } else {
      console.warn('[codacy] Docker nicht erreichbar (STRICT off) – schreibe minimales SARIF und Exit 0');
      writeEmptySarif();
      process.exit(0);
    }
  }

  mkdirSync(REPORTS_DIR, { recursive: true });

  const image = process.env.CODACY_IMAGE || 'codacy/codacy-analysis-cli:latest';
  const dockerCmd = ['run', '--rm', '-v', `${mountPath}:/src`, '-w', '/src'];

  // Tokens für Upload/Analyse-Features mappen (optional)
  if (hasApi) dockerCmd.push('-e', `CODACY_API_TOKEN=${process.env.CODACY_API_TOKEN}`);
  if (hasProject) dockerCmd.push('-e', `CODACY_PROJECT_TOKEN=${process.env.CODACY_PROJECT_TOKEN}`);
  if (process.env.CODACY_PROVIDER) dockerCmd.push('-e', `CODACY_PROVIDER=${process.env.CODACY_PROVIDER}`);
  if (process.env.CODACY_ORGANIZATION_PROVIDER)
    dockerCmd.push('-e', `CODACY_ORGANIZATION_PROVIDER=${process.env.CODACY_ORGANIZATION_PROVIDER}`);
  if (process.env.CODACY_ORGANIZATION)
    dockerCmd.push('-e', `CODACY_ORGANIZATION=${process.env.CODACY_ORGANIZATION}`);

  dockerCmd.push(image, 'analyze', '--format', 'sarif', '--output', '/src/quality-reports/codacy-analysis.sarif');
  if (doUpload && (hasApi || hasProject)) {
    dockerCmd.push('--upload');
  } else if (doUpload) {
    console.warn('[codacy] CODACY_UPLOAD=true, aber kein Token gesetzt – Upload wird übersprungen.');
  }

  try {
    await run('docker', dockerCmd);
    // SARIF zusätzlich im Repo-Root spiegeln
    try {
      const content = readFileSync(OUTPUT_SARIF, 'utf8');
      writeFileSync(OUTPUT_SARIF_ROOT, content);
      log(`SARIF gespiegelt nach ${OUTPUT_SARIF_ROOT}`);
    } catch (copyErr) {
      console.warn('[codacy] Konnte SARIF nicht in Root spiegeln:', copyErr?.message || copyErr);
    }

    await validateSarifAndGate(strict);
    process.exit(0);
  } catch (e) {
    if (strict) {
      console.error('[codacy] Analyse fehlgeschlagen und STRICT aktiv – breche ab:', e?.message || e);
      process.exit(1);
    }
    console.warn('[codacy] Analyse nicht ausführbar (Docker/CLI), schreibe leeren SARIF (non-strict):', e?.message || e);
    writeEmptySarif();
    process.exit(0);
  }
}

main();
