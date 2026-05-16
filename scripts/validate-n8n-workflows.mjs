#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const INVENTORY_PATH = path.join('automation', 'n8n', 'workflow-inventory.production.json');
const runtimeConsole = globalThis.console;
const runtimeProcess = globalThis.process;

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function normalizeRepoRelativePath(filePath) {
  return toPosixPath(path.normalize(filePath)).replace(/^\.\//, '');
}

async function collectJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const nestedFiles = await collectJsonFiles(fullPath);
      files.push(...nestedFiles);
      continue;
    }
    if (entry.isFile() && fullPath.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractErrorPosition(message) {
  const match = /position\s+(\d+)/i.exec(message);
  if (!match) {
    return '';
  }
  return ` (position ${match[1]})`;
}

function sortPaths(paths) {
  return [...paths].sort((a, b) => a.localeCompare(b, 'en'));
}

function hasExcludedPrefix(relativePath, excludes) {
  return excludes.some(excludePath => {
    const normalizedExclude = normalizeRepoRelativePath(excludePath).replace(/\/$/, '');
    if (normalizedExclude.length === 0) {
      return false;
    }
    return relativePath === normalizedExclude || relativePath.startsWith(`${normalizedExclude}/`);
  });
}

async function loadInventory(repositoryRoot) {
  const inventoryAbsolutePath = path.join(repositoryRoot, INVENTORY_PATH);
  const inventoryRelativePath = toPosixPath(path.relative(repositoryRoot, inventoryAbsolutePath));

  let inventoryRaw;
  try {
    inventoryRaw = await readFile(inventoryAbsolutePath, 'utf8');
  } catch (error) {
    throw new Error(`${inventoryRelativePath}: ${error.message}`);
  }

  let inventory;
  try {
    inventory = JSON.parse(inventoryRaw);
  } catch (error) {
    throw new Error(
      `${inventoryRelativePath}: ${error.message}${extractErrorPosition(error.message)}`
    );
  }

  if (!Array.isArray(inventory.workflows) || inventory.workflows.length === 0) {
    throw new Error(`${inventoryRelativePath}: field "workflows" must be a non-empty array.`);
  }

  const scopeRoots = Array.isArray(inventory.scope_roots)
    ? inventory.scope_roots.map(normalizeRepoRelativePath)
    : [];
  if (scopeRoots.length === 0) {
    throw new Error(`${inventoryRelativePath}: field "scope_roots" must be a non-empty array.`);
  }

  const excludePaths = Array.isArray(inventory.exclude_paths)
    ? inventory.exclude_paths.map(normalizeRepoRelativePath)
    : [];

  const workflows = sortPaths(
    inventory.workflows.map(entry => normalizeRepoRelativePath(String(entry)))
  );
  const requiredWorkflows = Array.isArray(inventory.required_workflows)
    ? sortPaths(inventory.required_workflows.map(entry => normalizeRepoRelativePath(String(entry))))
    : [];

  return {
    inventoryRelativePath,
    scopeRoots,
    excludePaths,
    workflows,
    requiredWorkflows
  };
}

async function validateJsonFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  JSON.parse(content);
}

async function main() {
  const repositoryRoot = runtimeProcess.cwd();

  let inventory;
  try {
    inventory = await loadInventory(repositoryRoot);
  } catch (error) {
    runtimeConsole.error(`❌ ${error.message}`);
    runtimeProcess.exit(1);
  }

  const errors = [];
  const warnings = [];

  const inventorySet = new Set(inventory.workflows);
  const requiredSet = new Set(inventory.requiredWorkflows);
  const discoveredInScope = new Set();

  for (const scopeRoot of inventory.scopeRoots) {
    const scopeAbsolutePath = path.join(repositoryRoot, scopeRoot);
    let scopeFiles;
    try {
      scopeFiles = await collectJsonFiles(scopeAbsolutePath);
    } catch (error) {
      errors.push(`❌ ${scopeRoot}: ${error.message}`);
      continue;
    }

    for (const absolutePath of scopeFiles) {
      const relativePath = toPosixPath(path.relative(repositoryRoot, absolutePath));
      if (hasExcludedPrefix(relativePath, inventory.excludePaths)) {
        continue;
      }
      discoveredInScope.add(relativePath);
    }
  }

  const scopeFiles = sortPaths([...discoveredInScope]);
  const missingInventoryFiles = inventory.workflows.filter(filePath => !scopeFiles.includes(filePath));
  for (const filePath of missingInventoryFiles) {
    errors.push(`❌ ${filePath}: listed in inventory but file is missing in scope.`);
  }

  const scopeDeviations = scopeFiles.filter(filePath => !inventorySet.has(filePath));
  for (const filePath of scopeDeviations) {
    warnings.push(`⚠️ ScopeDeviation: ${filePath} is in scope but missing from inventory.`);
  }

  const missingRequiredWorkflows = inventory.requiredWorkflows.filter(
    filePath => !inventorySet.has(filePath)
  );
  for (const filePath of missingRequiredWorkflows) {
    errors.push(`❌ ${filePath}: missing from inventory.required_workflows/workflows consistency.`);
  }

  for (const relativePath of inventory.workflows) {
    const absolutePath = path.join(repositoryRoot, relativePath);
    try {
      await validateJsonFile(absolutePath);
    } catch (error) {
      errors.push(`❌ ${relativePath}: ${error.message}${extractErrorPosition(error.message)}`);
    }
  }

  if (errors.length > 0) {
    runtimeConsole.error('n8n JSON validation failed:');
    for (const message of errors) {
      runtimeConsole.error(message);
    }
    runtimeProcess.exit(1);
  }

  if (warnings.length > 0) {
    runtimeConsole.warn('n8n JSON validation warnings:');
    for (const message of warnings) {
      runtimeConsole.warn(message);
    }
  }

  runtimeConsole.log(
    `✅ n8n JSON validation passed for ${inventory.workflows.length} inventarized file(s).`
  );
  runtimeConsole.log(`✅ Inventory source of truth: ${inventory.inventoryRelativePath}`);
  if (requiredSet.size > 0) {
    runtimeConsole.log(`✅ Required workflows verified: ${inventory.requiredWorkflows.length}`);
  }
}

main().catch(error => {
  runtimeConsole.error(`❌ Unexpected validation error: ${error.message}`);
  runtimeProcess.exit(1);
});
