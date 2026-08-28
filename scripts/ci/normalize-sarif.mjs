#!/usr/bin/env node
/**
 * normalize-sarif.mjs
 *
 * Normalizes a SARIF file produced by codacy-analysis-cli:
 * - Ensures required top-level fields are present (version, $schema, runs)
 * - Adds a minimal placeholder run when runs is empty (prevents upload rejection)
 *
 * Uses a standalone .mjs script instead of an inline shell one-liner to avoid
 * Bash/PowerShell variable-expansion issues with the literal "$schema" key.
 *
 * Environment:
 *   CODACY_SARIF_PATH  Path to the SARIF file to normalize (required)
 */

import { readFileSync, writeFileSync } from 'node:fs';

const sarifPath = process.env.CODACY_SARIF_PATH;
if (!sarifPath) {
  console.error('Error: CODACY_SARIF_PATH environment variable is not set.');
  process.exit(1);
}

const SARIF_SCHEMA = 'https://json.schemastore.org/sarif-2.1.0.json';

let sarif = {
  version: '2.1.0',
  // Intentional: property name is "$schema", not a variable reference.
  $schema: SARIF_SCHEMA,
  runs: [],
};

try {
  const raw = readFileSync(sarifPath, 'utf8');
  sarif = JSON.parse(raw);
} catch {
  // File missing or invalid JSON — use the default skeleton above.
}

// Ensure required fields
if (!sarif.version) sarif.version = '2.1.0';
if (!sarif['$schema']) sarif['$schema'] = SARIF_SCHEMA;
if (!Array.isArray(sarif.runs)) sarif.runs = [];

// Add a minimal placeholder run if empty (upload-sarif requires at least one run)
if (sarif.runs.length === 0) {
  sarif.runs.push({
    tool: {
      driver: {
        name: 'codacy-analysis',
        informationUri: 'https://www.codacy.com/',
      },
    },
    results: [],
  });
}

writeFileSync(sarifPath, JSON.stringify(sarif, null, 2));
console.log(`SARIF normalized: ${sarifPath} (${sarif.runs.length} run(s))`);
