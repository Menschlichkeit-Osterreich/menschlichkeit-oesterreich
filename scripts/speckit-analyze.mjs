#!/usr/bin/env node
/**
 * speckit-analyze.mjs
 * Read-only Cross-Artifact-Konsistenzanalyse fuer alle Speckit-Features.
 * Analysiert spec.md, plan.md und tasks.md auf Inkonsistenzen und fehlende Artefakte.
 *
 * Entspricht .github/agents/speckit.analyze.agent.md
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SPECS_DIR = join(ROOT, 'specs');

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function c(color, text) {
  return `${ANSI[color]}${text}${ANSI.reset}`;
}

function readOptional(filePath) {
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf8');
}

function extractHeadings(md, level = 2) {
  if (!md) return [];
  const prefix = '#'.repeat(level) + ' ';
  return md
    .split('\n')
    .filter((l) => l.startsWith(prefix))
    .map((l) => l.slice(prefix.length).trim());
}

function countChecked(md) {
  if (!md) return { done: 0, total: 0 };
  const all = (md.match(/- \[[ xX]\]/g) || []).length;
  const done = (md.match(/- \[[xX]\]/g) || []).length;
  return { done, total: all };
}

function analyzeFeature(featureDir) {
  const name = featureDir.split('/').pop();
  const specPath = join(featureDir, 'spec.md');
  const planPath = join(featureDir, 'plan.md');
  const tasksPath = join(featureDir, 'tasks.md');

  const spec = readOptional(specPath);
  const plan = readOptional(planPath);
  const tasks = readOptional(tasksPath);

  const issues = [];
  const warnings = [];
  const info = [];

  // --- Artefakt-Vollstaendigkeit ---
  if (!spec) issues.push('spec.md fehlt');
  if (!plan) warnings.push('plan.md fehlt (optional aber empfohlen)');
  if (!tasks) warnings.push('tasks.md fehlt');

  if (!spec && !plan && !tasks) {
    return { name, issues, warnings, info, skip: true };
  }

  // --- Spec-Analyse ---
  if (spec) {
    const goals = extractHeadings(spec, 2);
    if (!goals.includes('Scope') && !goals.includes('Problemstellung')) {
      warnings.push('spec.md: Kein "Scope" oder "Problemstellung"-Abschnitt gefunden');
    }
    if (!goals.includes('Erfolgsmetriken') && !goals.includes('Ziele')) {
      warnings.push('spec.md: Keine Erfolgsmetriken oder Ziele definiert');
    }
    if (spec.length < 200) {
      warnings.push('spec.md: Sehr kurz (<200 Zeichen) — moeglicherweise unvollstaendig');
    }
  }

  // --- Plan-Analyse ---
  if (plan) {
    const sections = extractHeadings(plan, 2);
    if (sections.length === 0) {
      warnings.push('plan.md: Keine Abschnitte (H2) gefunden');
    }
    // Pruefen ob Plan auf Spec-Ziele verweist
    if (spec) {
      const specLower = spec.toLowerCase();
      const planLower = plan.toLowerCase();
      const specKeywords = ['scope', 'ziel', 'goal', 'problem', 'metrik'];
      const hasRefToSpec = specKeywords.some(
        (kw) => planLower.includes(kw) || specLower.includes(kw)
      );
      if (!hasRefToSpec) {
        info.push('plan.md: Kein direkter Bezug zu Spec-Schluesselwoertern erkennbar');
      }
    }
  }

  // --- Tasks-Analyse ---
  if (tasks) {
    const { done, total } = countChecked(tasks);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    info.push(`tasks.md: ${done}/${total} Tasks abgehakt (${pct}%)`);

    if (total === 0) {
      warnings.push('tasks.md: Keine Checkbox-Tasks gefunden ([ ] oder [x])');
    }

    // Pruefen ob Tasks Referenzen auf Plan-Abschnitte enthalten
    if (plan) {
      const planHeadings = extractHeadings(plan, 2).concat(extractHeadings(plan, 3));
      if (planHeadings.length > 0) {
        const tasksLower = tasks.toLowerCase();
        const unmapped = planHeadings.filter((h) => !tasksLower.includes(h.toLowerCase()));
        if (unmapped.length > 0 && unmapped.length <= 5) {
          warnings.push(
            `tasks.md: Folgende Plan-Abschnitte sind nicht in Tasks referenziert: ${unmapped.join(', ')}`
          );
        } else if (unmapped.length > 5) {
          warnings.push(
            `tasks.md: ${unmapped.length} Plan-Abschnitte nicht in Tasks referenziert`
          );
        }
      }
    }

    // Pruefen ob Tasks auf Spec-Ziele zurueckverfolgen
    if (spec) {
      const specHeadings = extractHeadings(spec, 2);
      const tasksLower = tasks.toLowerCase();
      const unmapped = specHeadings.filter(
        (h) =>
          !['nicht-ziele', 'abhaengigkeiten'].includes(h.toLowerCase()) &&
          !tasksLower.includes(h.toLowerCase())
      );
      if (unmapped.length > 0) {
        info.push(
          `tasks.md: Spec-Abschnitte ohne Tasks-Abdeckung: ${unmapped.slice(0, 4).join(', ')}${unmapped.length > 4 ? ' ...' : ''}`
        );
      }
    }
  }

  // --- Cross-Artifact: Spec <-> Plan Alignment ---
  if (spec && plan) {
    const specLen = spec.length;
    const planLen = plan.length;
    if (planLen < specLen * 0.3) {
      warnings.push(
        'plan.md deutlich kuerzer als spec.md — moeglicherweise unvollstaendig ausgearbeitet'
      );
    }
  }

  return { name, issues, warnings, info, skip: false };
}

function printResult(result) {
  const statusIcon = result.issues.length > 0 ? c('red', '✖') : result.warnings.length > 0 ? c('yellow', '⚠') : c('green', '✔');

  console.log(`\n${statusIcon} ${c('bold', result.name)}`);

  if (result.skip) {
    console.log(`  ${c('gray', '(keine Artefakte gefunden — uebersprungen)')}`);
    return;
  }

  for (const issue of result.issues) {
    console.log(`  ${c('red', '  FEHLER')}  ${issue}`);
  }
  for (const warn of result.warnings) {
    console.log(`  ${c('yellow', '  WARNUNG')} ${warn}`);
  }
  for (const i of result.info) {
    console.log(`  ${c('cyan', '  INFO')}    ${i}`);
  }

  if (result.issues.length === 0 && result.warnings.length === 0) {
    console.log(`  ${c('gray', '  Keine Probleme gefunden.')}`);
  }
}

function main() {
  console.log(c('bold', '\n=== Speckit Cross-Artifact-Analyse ==='));
  console.log(c('gray', `Verzeichnis: ${SPECS_DIR}\n`));

  if (!existsSync(SPECS_DIR)) {
    console.error(c('red', `FEHLER: specs/ Verzeichnis nicht gefunden: ${SPECS_DIR}`));
    process.exit(1);
  }

  const featureDirs = readdirSync(SPECS_DIR)
    .map((d) => join(SPECS_DIR, d))
    .filter((d) => statSync(d).isDirectory());

  if (featureDirs.length === 0) {
    console.log(c('yellow', 'Keine Feature-Verzeichnisse in specs/ gefunden.'));
    process.exit(0);
  }

  const results = featureDirs.map(analyzeFeature);

  let totalIssues = 0;
  let totalWarnings = 0;

  for (const result of results) {
    printResult(result);
    totalIssues += result.issues.length;
    totalWarnings += result.warnings.length;
  }

  console.log(c('bold', '\n=== Zusammenfassung ==='));
  console.log(`Features analysiert: ${c('bold', String(results.filter((r) => !r.skip).length))}`);
  console.log(
    `Fehler:   ${totalIssues > 0 ? c('red', String(totalIssues)) : c('green', '0')}`
  );
  console.log(
    `Warnungen: ${totalWarnings > 0 ? c('yellow', String(totalWarnings)) : c('green', '0')}`
  );

  if (totalIssues > 0) {
    console.log(c('red', '\nAnalyse abgeschlossen mit Fehlern.'));
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log(c('yellow', '\nAnalyse abgeschlossen mit Warnungen.'));
  } else {
    console.log(c('green', '\nAlle Artefakte konsistent. ✔'));
  }
}

main();
