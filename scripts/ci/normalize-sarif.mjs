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

/**
 * GitHub Code Scanning rejects uploads containing multiple SARIF runs with the
 * same tool driver name under one category. Codacy CLI emits one run per tool
 * invocation, so merge runs sharing a driver name into a single run and remap
 * rule index references onto the merged, deduplicated rules array.
 */
function mergeRunsByDriverName(runs) {
  const merged = new Map();

  for (const run of runs) {
    const driverName = run?.tool?.driver?.name || 'unknown';
    const incomingRules = Array.isArray(run?.tool?.driver?.rules) ? run.tool.driver.rules : [];
    const incomingResults = Array.isArray(run?.results) ? run.results : [];

    if (!merged.has(driverName)) {
      merged.set(driverName, { base: run, rules: [], ruleIndexById: new Map(), results: [] });
    }
    const target = merged.get(driverName);

    for (const rule of incomingRules) {
      if (rule?.id && !target.ruleIndexById.has(rule.id)) {
        target.ruleIndexById.set(rule.id, target.rules.length);
        target.rules.push(rule);
      }
    }

    for (const result of incomingResults) {
      const ruleId = result?.ruleId ?? result?.rule?.id;
      const mergedIndex = ruleId !== undefined ? target.ruleIndexById.get(ruleId) : undefined;
      const normalized = { ...result };
      if (mergedIndex !== undefined) {
        if ('ruleIndex' in normalized) normalized.ruleIndex = mergedIndex;
        if (normalized.rule && typeof normalized.rule === 'object' && 'index' in normalized.rule) {
          normalized.rule = { ...normalized.rule, index: mergedIndex };
        }
      } else {
        delete normalized.ruleIndex;
        if (normalized.rule && typeof normalized.rule === 'object') {
          const { index: _dropped, ...ruleRest } = normalized.rule;
          normalized.rule = ruleRest;
        }
      }
      target.results.push(normalized);
    }
  }

  return [...merged.values()].map(({ base, rules, results }) => {
    const run = { ...base, results };
    if (run.tool?.driver) {
      run.tool = { ...run.tool, driver: { ...run.tool.driver } };
      if (rules.length > 0) {
        run.tool.driver.rules = rules;
      } else {
        delete run.tool.driver.rules;
      }
    }
    return run;
  });
}

if (sarif.runs.length > 1) {
  sarif.runs = mergeRunsByDriverName(sarif.runs);
}

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
