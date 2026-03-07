#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import net from 'node:net';
import os from 'node:os';
import { chromium } from 'playwright-core';

async function getFreePort(preferred) {
  if (preferred) {
    const ok = await canBind(preferred).catch(() => false);
    if (ok) return preferred;
  }
  // Let the OS assign a free port
  return await new Promise((resolvePort, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const address = srv.address();
      const port = typeof address === 'object' && address ? address.port : preferred || 4173;
      srv.close(() => resolvePort(String(port)));
    });
    srv.on('error', reject);
  });
}

function canBind(port) {
  return new Promise((resolveOk, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(Number(port), '127.0.0.1', () => srv.close(() => resolveOk(true)));
  });
}

let PREVIEW_PORT = process.env.LH_PREVIEW_PORT || '';
let PREVIEW_URL = '';
// Always write inside frontend/.lighthouse regardless of CWD
const REPORT_DIR = resolve(process.cwd(), '.lighthouse');
const REPORT_BASE = resolve(REPORT_DIR, 'report');

function run(cmd, args, opts = {}) {
  return new Promise((resolvePromise, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts });
    p.on('error', reject);
    p.on('exit', (code) => (code === 0 ? resolvePromise(code) : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function waitForUrl(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      // Use GET to avoid servers that do not implement HEAD correctly
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch (_error) {
      // Ignore connection errors while waiting for server to start
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

// No CDP wait needed when Lighthouse launches the browser itself

async function main() {
  mkdirSync(REPORT_DIR, { recursive: true });
  console.log(`[Lighthouse] Report-Verzeichnis: ${REPORT_DIR}`);
  await run('npx', ['vite', 'build']);

  // Determine preview port
  PREVIEW_PORT = await getFreePort(PREVIEW_PORT);
  PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

  const preview = spawn('npx', ['vite', 'preview', '--port', PREVIEW_PORT], { stdio: 'inherit', shell: process.platform === 'win32' });
  try {
    await waitForUrl(PREVIEW_URL);
    // Resolve a Chrome/Chromium path
    let chromeExe = '';
    try {
      chromeExe = chromium.executablePath();
    } catch (_) {
      chromeExe = '';
    }
    if (!chromeExe || !existsSync(chromeExe)) {
      const candidates = [
        'C:/Program Files/Google/Chrome/Application/chrome.exe',
        'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      ];
      for (const p of candidates) {
        if (existsSync(p)) { chromeExe = p; break; }
      }
      if (!chromeExe) {
        throw new Error('Keine Chromium-/Chrome-/Edge-Installation gefunden. Bitte Chrome/Edge installieren oder CHROME_PATH setzen.');
      }
    }
    console.log(`[Lighthouse] Verwende Browser: ${chromeExe}`);

    // Helper: Lighthouse-Lauf mit variablen Flags
    const userDataDir = resolve(REPORT_DIR, `chrome-profile`);
    mkdirSync(userDataDir, { recursive: true });
    const env = { ...process.env, CHROME_PATH: chromeExe };

    async function runLighthouseWith(flags, label) {
      console.log(`[Lighthouse] Versuch (${label}) mit Flags: ${flags.join(' ')}`);
      await run('npx', [
        'lighthouse',
        PREVIEW_URL,
        '--config-path=./lighthouse.config.cjs',
        '--quiet',
        '--preset=desktop',
        '--emulated-form-factor=desktop',
        '--throttling-method=devtools',
        '--max-wait-for-load=120000',
        '--output=json',
        '--output=html',
        `--output-path=${REPORT_BASE}`,
        `--chrome-flags=${flags.join(' ')}`,
      ], { env });
      console.log(`[Lighthouse] Reporte geschrieben nach Basis: ${REPORT_BASE}.*`);
    }

    // Drei Versuche: headless=new → headless=old → headed (kein headless)
    const baseFlags = [
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-features=PaintHolding',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--mute-audio',
      '--hide-scrollbars',
      '--force-color-profile=srgb',
      '--window-size=1366,768',
      `--user-data-dir=${userDataDir}`,
    ];

    const attempts = [
      { label: 'headless=new', flags: ['--headless=new', ...baseFlags] },
      { label: 'headless=old', flags: ['--headless=old', ...baseFlags] },
      { label: 'headed', flags: [...baseFlags, '--start-maximized'] },
    ];

    console.log(`[Lighthouse] Starte Audit für ${PREVIEW_URL} …`);
    let lastErr = null;
    for (const att of attempts) {
      try {
        await runLighthouseWith(att.flags, att.label);
        lastErr = null;
        break; // Erfolg
      } catch (e) {
        lastErr = e;
        const msg = String(e?.message || e);
        console.warn(`[Lighthouse] Versuch fehlgeschlagen (${att.label}): ${msg}`);
        // Bei NO_FCP weiterversuchen, sonst direkt abbrechen
        if (!/NO_FCP/i.test(msg)) {
          throw e;
        }
      }
    }
    if (lastErr) {
      throw lastErr; // alle Versuche gescheitert
    }
  } finally {
    try { preview.kill('SIGTERM'); } catch {}
  }

  // Basic score checks
  try {
  const reportJsonPath = `${REPORT_BASE}.report.json`;
  const reportHtmlPath = `${REPORT_BASE}.report.html`;
  const reportJson = readFileSync(reportJsonPath, 'utf-8');
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

    // Zusätzlich: Kopie in Root-Quality-Reports schreiben, damit Aggregator die Datei sicher findet
    try {
      const rootDir = resolve(process.cwd(), '..');
      const qrDir = resolve(rootDir, 'quality-reports');
      mkdirSync(qrDir, { recursive: true });
      const outJson = resolve(qrDir, 'lighthouse-report.json');
      const outHtml = resolve(qrDir, 'lighthouse-report.html');
      copyFileSync(reportJsonPath, outJson);
      if (existsSync(reportHtmlPath)) copyFileSync(reportHtmlPath, outHtml);
      console.log(`[Lighthouse] Kopie erstellt: ${outJson}`);
    } catch (copyErr) {
      console.warn(`[Lighthouse] Konnte Report nicht nach quality-reports kopieren: ${copyErr.message}`);
    }
  } catch (e) {
    console.warn('Konnte Report nicht prüfen:', e.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

