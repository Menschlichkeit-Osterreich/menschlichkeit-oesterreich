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
 * rule index references onto the merged, deduplicated rules array. Each run
 * also carries its own artifacts array with run-local indexes, so artifacts
 * are merged/deduplicated too and every artifactLocation.index is remapped.
 */
function artifactKey(artifact) {
  const uri = artifact?.location?.uri;
  if (typeof uri !== 'string') return null;
  const uriBaseId = artifact?.location?.uriBaseId ?? '';
  return `${uriBaseId}\u0000${uri}`;
}

function remapArtifactIndexes(node, indexMap) {
  if (Array.isArray(node)) {
    return node.map((item) => remapArtifactIndexes(item, indexMap));
  }
  if (node === null || typeof node !== 'object') return node;
  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === 'artifactLocation' && value && typeof value === 'object' && !Array.isArray(value)) {
      const loc = { ...value };
      if (typeof loc.index === 'number') {
        const mapped = indexMap.get(loc.index);
        if (mapped !== undefined) {
          loc.index = mapped;
        } else {
          delete loc.index;
        }
      }
      out[key] = loc;
    } else {
      out[key] = remapArtifactIndexes(value, indexMap);
    }
  }
  return out;
}

function mergeRunsByDriverName(runs) {
  const merged = new Map();

  for (const run of runs) {
    const driverName = run?.tool?.driver?.name || 'unknown';
    const incomingRules = Array.isArray(run?.tool?.driver?.rules) ? run.tool.driver.rules : [];
    const incomingArtifacts = Array.isArray(run?.artifacts) ? run.artifacts : [];
    const incomingResults = Array.isArray(run?.results) ? run.results : [];

    if (!merged.has(driverName)) {
      merged.set(driverName, {
        base: run,
        rules: [],
        ruleIndexById: new Map(),
        artifacts: [],
        artifactIndexByKey: new Map(),
        results: [],
      });
    }
    const target = merged.get(driverName);

    for (const rule of incomingRules) {
      if (rule?.id && !target.ruleIndexById.has(rule.id)) {
        target.ruleIndexById.set(rule.id, target.rules.length);
        target.rules.push(rule);
      }
    }

    // Map this run's local artifact indexes onto the merged artifacts array.
    const artifactIndexMap = new Map();
    incomingArtifacts.forEach((artifact, localIndex) => {
      const key = artifactKey(artifact);
      if (key !== null && target.artifactIndexByKey.has(key)) {
        artifactIndexMap.set(localIndex, target.artifactIndexByKey.get(key));
        return;
      }
      const mergedIndex = target.artifacts.length;
      target.artifacts.push(artifact);
      if (key !== null) target.artifactIndexByKey.set(key, mergedIndex);
      artifactIndexMap.set(localIndex, mergedIndex);
    });

    for (const result of incomingResults) {
      const ruleId = result?.ruleId ?? result?.rule?.id;
      const mergedIndex = ruleId !== undefined ? target.ruleIndexById.get(ruleId) : undefined;
      const normalized = remapArtifactIndexes({ ...result }, artifactIndexMap);
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

  return [...merged.values()].map(({ base, rules, artifacts, results }) => {
    const run = { ...base, results };
    if (run.tool?.driver) {
      run.tool = { ...run.tool, driver: { ...run.tool.driver } };
      if (rules.length > 0) {
        run.tool.driver.rules = rules;
      } else {
        delete run.tool.driver.rules;
      }
    }
    if (artifacts.length > 0) {
      run.artifacts = artifacts;
    } else {
      delete run.artifacts;
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
