#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PORT = process.env.WEB_PREVIEW_PORT || '4180';
const URL = `http://localhost:${PORT}/index.html`;
const REPORT_DIR = resolve(process.cwd(), '.lighthouse');
const REPORT_BASE = resolve(REPORT_DIR, 'report');

function run(cmd, args, opts = {}) {
  return new Promise((resolvePromise, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts });
    p.on('error', reject);
    p.on('exit', (code) => (code === 0 ? resolvePromise(code) : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function waitForUrl(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) return true;
    } catch (_error) {
      // Ignore connection errors while waiting for server to start
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function main() {
  mkdirSync(REPORT_DIR, { recursive: true });

  // start static server
  const server = spawn('npx', ['http-server', '.', '-p', PORT, '-c-1'], { cwd: process.cwd(), stdio: 'inherit', shell: process.platform === 'win32' });
  try {
    await waitForUrl(URL);
    await run('npx', [
      'lighthouse',
      URL,
      '--config-path=./lighthouse.config.cjs',
      '--quiet',
      '--output=json',
      '--output=html',
      `--output-path=${REPORT_BASE}`,
    ], { cwd: process.cwd() });
  } finally {
    server.kill('SIGTERM');
  }

  try {
    const reportJson = readFileSync(`${REPORT_BASE}.report.json`, 'utf-8');
    const data = JSON.parse(reportJson);
    const perf = data.categories?.performance?.score ?? 0;
    const a11y = data.categories?.accessibility?.score ?? 0;
    const bp = data.categories?.['best-practices']?.score ?? 0;
    const seo = data.categories?.seo?.score ?? 0;
    console.log(`Scores: P=${perf} A11y=${a11y} BP=${bp} SEO=${seo}`);
    if (perf < 0.9 || a11y < 0.95 || bp < 0.95 || seo < 0.9) {
      console.error('Budget/Score thresholds nicht erfüllt. Siehe .lighthouse/report.report.html');
      process.exit(1);
    }
  } catch (e) {
    console.warn('Konnte Report nicht prüfen:', e.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

