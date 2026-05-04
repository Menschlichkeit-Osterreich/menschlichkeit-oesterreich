#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const WORKFLOW_ROOT = path.join('automation', 'n8n', 'workflows');
const DONATION_WORKFLOW = path.join(
  'automation',
  'n8n',
  'workflows',
  'finance-donation-processing.json'
);

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
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

async function validateJsonFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  JSON.parse(content);
}

async function main() {
  const repositoryRoot = process.cwd();
  const workflowDirectory = path.join(repositoryRoot, WORKFLOW_ROOT);
  const requiredDonationPath = path.join(repositoryRoot, DONATION_WORKFLOW);

  let files;
  try {
    files = await collectJsonFiles(workflowDirectory);
  } catch (error) {
    console.error(`❌ ${toPosixPath(WORKFLOW_ROOT)}: ${error.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`❌ ${toPosixPath(WORKFLOW_ROOT)}: no workflow JSON files found.`);
    process.exit(1);
  }

  const sortedFiles = files.sort((a, b) => a.localeCompare(b));
  const relativeFiles = sortedFiles.map(filePath =>
    toPosixPath(path.relative(repositoryRoot, filePath))
  );
  const requiredRelativePath = toPosixPath(path.relative(repositoryRoot, requiredDonationPath));

  const missingRequiredWorkflow = !relativeFiles.includes(requiredRelativePath);
  const errors = [];

  if (missingRequiredWorkflow) {
    errors.push(`❌ ${requiredRelativePath}: required donation workflow file is missing.`);
  }

  for (const absolutePath of sortedFiles) {
    const relativePath = toPosixPath(path.relative(repositoryRoot, absolutePath));
    try {
      await validateJsonFile(absolutePath);
    } catch (error) {
      errors.push(`❌ ${relativePath}: ${error.message}${extractErrorPosition(error.message)}`);
    }
  }

  if (errors.length > 0) {
    console.error('n8n JSON validation failed:');
    for (const message of errors) {
      console.error(message);
    }
    process.exit(1);
  }

  console.log(
    `✅ n8n JSON validation passed for ${sortedFiles.length} file(s) in ${toPosixPath(WORKFLOW_ROOT)}.`
  );
  console.log(`✅ Required donation workflow is valid: ${requiredRelativePath}`);
}

main().catch(error => {
  console.error(`❌ Unexpected validation error: ${error.message}`);
  process.exit(1);
});
