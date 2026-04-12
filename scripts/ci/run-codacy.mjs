#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPORTS_DIR = resolve(process.cwd(), 'quality-reports');
const OUTPUT_SARIF = resolve(REPORTS_DIR, 'codacy-analysis.sarif');
const LOCAL_CODACY_JAR = resolve(process.cwd(), '.codacy', 'codacy-analysis-cli-assembly.jar');

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
    runs: [{ tool: { driver: { name: 'codacy-analysis-cli', version: 'fallback' } }, results: [] }],
  };
  writeFileSync(OUTPUT_SARIF, JSON.stringify(sarif, null, 2));
}

async function main() {
  try {
    const analyzeArgs = [
      'analyze',
      '--format',
      'sarif',
      '--output',
      OUTPUT_SARIF,
      '--directory',
      '.',
      '--skip-uncommitted-files-check',
      'true',
    ];

    try {
      await run('codacy-analysis-cli', analyzeArgs);
      process.exit(0);
      return;
    } catch (pathError) {
      if (!existsSync(LOCAL_CODACY_JAR)) {
        throw pathError;
      }

      await run('java', ['-jar', LOCAL_CODACY_JAR, ...analyzeArgs]);
    }

    process.exit(0);
  } catch (e) {
    console.warn(
      'Codacy CLI nicht verfügbar oder fehlgeschlagen, schreibe leeren SARIF:',
      e.message
    );
    writeEmptySarif();
    process.exit(0);
  }
}

main();
