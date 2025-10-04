#!/usr/bin/env node
/**
 * Workspace cleanup utility for Menschlichkeit Österreich.
 * Removes common build artefacts, caches, and dependency directories across
 * JavaScript, Python, and infrastructure projects. Supports dry-run and
 * filter options to keep destructive operations controlled.
 */

import { rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const DEPENDENCY_SEGMENTS = [
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}vendor${path.sep}`,
  `${path.sep}bower_components${path.sep}`,
  `${path.sep}civicrm${path.sep}ext${path.sep}`,
];

const TARGETS = {
  node_modules: {
    label: 'Node.js dependencies',
    match: (entry) => entry.isDirectory() && entry.name === 'node_modules',
  },
  dist: {
    label: 'Vite/webpack build output',
    match: (entry, fullPath) =>
      entry.isDirectory() &&
      entry.name === 'dist' &&
      !fullPath.includes(`${path.sep}node_modules${path.sep}`),
  },
  build: {
    label: 'Generic build output (build/)',
    match: (entry, fullPath) =>
      entry.isDirectory() &&
      entry.name === 'build' &&
      !fullPath.includes(`${path.sep}node_modules${path.sep}`),
  },
  coverage: {
    label: 'Coverage reports',
    match: (entry, fullPath) =>
      entry.isDirectory() &&
      entry.name === 'coverage' &&
      !fullPath.includes(`${path.sep}node_modules${path.sep}`),
  },
  turbo: {
    label: 'Turbo cache',
    match: (entry) => entry.isDirectory() && entry.name === '.turbo',
  },
  parcel: {
    label: 'Parcel cache',
    match: (entry) => entry.isDirectory() && entry.name === '.parcel-cache',
  },
  cache: {
    label: 'Generic cache directories',
    match: (entry) => entry.isDirectory() && entry.name === '.cache',
  },
  viteCache: {
    label: 'Vite cache',
    match: (entry) => entry.isDirectory() && entry.name === '.vite',
  },
  next: {
    label: 'Next.js build output',
    match: (entry) => entry.isDirectory() && (entry.name === '.next' || entry.name === '.nuxt'),
  },
  svelte: {
    label: 'SvelteKit build output',
    match: (entry) => entry.isDirectory() && entry.name === '.svelte-kit',
  },
  angular: {
    label: 'Angular build output',
    match: (entry) => entry.isDirectory() && entry.name === '.angular',
  },
  serverless: {
    label: 'Serverless build artefacts',
    match: (entry) => entry.isDirectory() && entry.name === '.serverless',
  },
  vercel: {
    label: 'Vercel build cache',
    match: (entry) => entry.isDirectory() && entry.name === '.vercel',
  },
  pycache: {
    label: 'Python __pycache__ directories',
    match: (entry) => entry.isDirectory() && entry.name === '__pycache__',
  },
  pytest: {
    label: 'pytest cache',
    match: (entry) => entry.isDirectory() && entry.name === '.pytest_cache',
  },
  mypy: {
    label: 'mypy cache',
    match: (entry) => entry.isDirectory() && entry.name === '.mypy_cache',
  },
  ruff: {
    label: 'ruff cache',
    match: (entry) => entry.isDirectory() && entry.name === '.ruff_cache',
  },
  pylint: {
    label: 'pylint cache',
    match: (entry) => entry.isDirectory() && entry.name === '.pylint.d',
  },
  htmlcov: {
    label: 'pytest html coverage',
    match: (entry) => entry.isDirectory() && entry.name === 'htmlcov',
  },
  tox: {
    label: 'tox virtualenvs',
    match: (entry) => entry.isDirectory() && entry.name === '.tox',
  },
  venv: {
    label: 'Python virtual environments',
    match: (entry) =>
      entry.isDirectory() && ['venv', '.venv', '.env'].includes(entry.name),
  },
  eggInfo: {
    label: 'Python egg metadata',
    match: (entry) => entry.name.endsWith('.egg-info'),
  },
  pyc: {
    label: 'Compiled Python bytecode',
    match: (entry) => entry.isFile() && entry.name.endsWith('.pyc'),
  },
};

const EXCLUDED_DIRS = new Set([
  '.git',
  '.github',
  '.idea',
  '.vscode',
  'analysis/archive',
  'docs',
  'quality-reports',
  'security',
]);

function parseArgs(argv) {
  const options = {
    dryRun: false,
    verbose: false,
    root: repoRoot,
    only: null,
    skip: new Set(),
  };

  for (const arg of argv) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg.startsWith('--root=')) {
      options.root = path.resolve(arg.split('=')[1]);
    } else if (arg.startsWith('--only=')) {
      const list = arg.split('=')[1]
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      options.only = new Set(list);
    } else if (arg.startsWith('--skip=')) {
      const list = arg.split('=')[1]
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      for (const value of list) {
        options.skip.add(value);
      }
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      console.warn(`Unknown option: ${arg}`);
      printHelp();
      process.exit(1);
    }
  }

  if (options.only) {
    for (const key of options.only) {
      if (!(key in TARGETS)) {
        console.error(`Unknown target '${key}'. Available keys: ${Object.keys(TARGETS).join(', ')}`);
        process.exit(1);
      }
    }
  }

  for (const key of options.skip) {
    if (!(key in TARGETS)) {
      console.error(`Unknown skip target '${key}'. Available keys: ${Object.keys(TARGETS).join(', ')}`);
      process.exit(1);
    }
  }

  return options;
}

function printHelp() {
  const names = Object.entries(TARGETS)
    .map(([key, value]) => `  - ${key.padEnd(12)} ${value.label}`)
    .join('\n');

  console.log(`Usage: node scripts/clean-workspace.mjs [options]\n\nOptions:\n  --dry-run          Print planned removals without deleting\n  --verbose          Log each deletion\n  --root=PATH        Override repository root\n  --only=a,b         Restrict removal to specific target keys\n  --skip=a,b         Omit specific target keys\n  -h, --help         Show this help message\n\nTargets:\n${names}`);
}

function shouldSkipDirectory(fullPath) {
  for (const excluded of EXCLUDED_DIRS) {
    if (fullPath === path.join(repoRoot, excluded)) {
      return true;
    }
  }
  return false;
}

function isInDependencyTree(fullPath) {
  return DEPENDENCY_SEGMENTS.some((segment) => fullPath.includes(segment));
}

function matchTarget(entry, activeTargets, fullPath) {
  const insideDependencies = isInDependencyTree(fullPath);
  for (const key of activeTargets) {
    const target = TARGETS[key];
    if (!target) {
      continue;
    }
    if (insideDependencies && key !== 'node_modules') {
      continue;
    }
    if (target.match(entry, fullPath)) {
      return { key, target };
    }
  }
  return null;
}

async function removePath(targetPath, dryRun, verbose, key, label, stats) {
  if (dryRun) {
    console.log(`[dry-run] ${label}: ${targetPath}`);
    stats.dryRunCount += 1;
    return;
  }
  await rm(targetPath, { recursive: true, force: true });
  if (verbose) {
    console.log(`Removed (${key}): ${targetPath}`);
  }
  stats.removed += 1;
}

async function walk(directory, options, activeTargets, stats) {
  if (shouldSkipDirectory(directory)) {
    return;
  }

  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    const matched = matchTarget(entry, activeTargets, fullPath);
    if (matched) {
      await removePath(fullPath, options.dryRun, options.verbose, matched.key, matched.target.label, stats);
      continue;
    }

    if (entry.isDirectory()) {
      await walk(fullPath, options, activeTargets, stats);
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const activeTargets = options.only ? Array.from(options.only) : Object.keys(TARGETS);

  if (options.skip.size > 0) {
    for (const key of options.skip) {
      const index = activeTargets.indexOf(key);
      if (index >= 0) {
        activeTargets.splice(index, 1);
      }
    }
  }

  if (activeTargets.length === 0) {
    console.log('No targets selected. Exiting.');
    return;
  }

  const stats = { removed: 0, dryRunCount: 0 };
  await walk(options.root, options, activeTargets, stats);

  const removedLabel = options.dryRun
    ? `${stats.dryRunCount} paths flagged`
    : `${stats.removed} paths removed`;
  console.log(`Cleanup complete: ${removedLabel} (${activeTargets.length} target groups considered).`);
}

main().catch((error) => {
  console.error('Workspace cleanup failed:', error);
  process.exit(1);
});
