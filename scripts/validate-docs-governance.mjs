#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';

const ROOT = process.cwd();
const DOCS_ROOT = resolve(ROOT, 'docs');
const REQUIRED_FRONTMATTER_FIELDS = ['title', 'description', 'lastUpdated', 'status'];
const modeArg = process.argv.find(arg => arg.startsWith('--mode='));
const mode = modeArg ? modeArg.split('=')[1] : 'all';
const strict = process.argv.includes('--strict');

function walk(dirPath) {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = resolve(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (fullPath.includes(resolve(DOCS_ROOT, 'archive'))) {
        continue;
      }
      files.push(...walk(fullPath));
      continue;
    }

    if (entry.isFile() && extname(entry.name).toLowerCase() === '.md') {
      files.push(fullPath);
    }
  }

  return files;
}

function getFrontmatter(content) {
  if (!content.startsWith('---\n') && !content.startsWith('---\r\n')) {
    return null;
  }

  const lines = content.split(/\r?\n/);
  const endIndex = lines.findIndex((line, idx) => idx > 0 && line.trim() === '---');
  if (endIndex < 0) {
    return null;
  }

  const raw = lines.slice(1, endIndex);
  const fields = {};
  for (const line of raw) {
    const sep = line.indexOf(':');
    if (sep > 0) {
      const key = line.slice(0, sep).trim();
      const value = line.slice(sep + 1).trim();
      fields[key] = value;
    }
  }

  return fields;
}

function checkFrontmatter(mdFiles) {
  const issues = [];

  for (const file of mdFiles) {
    const content = readFileSync(file, 'utf8');
    const frontmatter = getFrontmatter(content);

    if (!frontmatter) {
      issues.push(`Missing frontmatter: ${file}`);
      continue;
    }

    for (const field of REQUIRED_FRONTMATTER_FIELDS) {
      if (!frontmatter[field]) {
        issues.push(`Missing frontmatter field '${field}': ${file}`);
      }
    }
  }

  return issues;
}

function checkDirectoryIndexes() {
  const issues = [];
  const dirsToCheck = [];

  function walkDirs(dirPath) {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    dirsToCheck.push(dirPath);

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      const fullPath = resolve(dirPath, entry.name);
      if (fullPath.includes(resolve(DOCS_ROOT, 'archive'))) {
        continue;
      }
      walkDirs(fullPath);
    }
  }

  walkDirs(DOCS_ROOT);

  for (const dir of dirsToCheck) {
    const entries = readdirSync(dir, { withFileTypes: true });
    const markdownFiles = entries
      .filter(entry => entry.isFile() && extname(entry.name).toLowerCase() === '.md')
      .map(entry => entry.name);

    if (markdownFiles.length === 0) {
      continue;
    }

    const hasIndex = markdownFiles.includes('README.md') || markdownFiles.includes('index.md');
    if (!hasIndex) {
      issues.push(`Missing directory index (README.md or index.md): ${dir}`);
    }
  }

  return issues;
}

function sanitizeLinkTarget(rawTarget) {
  const trimmed = rawTarget.trim();
  const firstSpace = trimmed.indexOf(' ');
  return firstSpace > 0 ? trimmed.slice(0, firstSpace) : trimmed;
}

function checkLinks(mdFiles) {
  const issues = [];
  const linkRegex = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const file of mdFiles) {
    const content = readFileSync(file, 'utf8');
    const fileDir = dirname(file);

    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const target = sanitizeLinkTarget(match[1]);

      if (!target || target.startsWith('#')) {
        continue;
      }
      if (/^(https?:|mailto:|tel:)/i.test(target)) {
        continue;
      }

      const [pathPart] = target.split('#');
      if (!pathPart) {
        continue;
      }

      const absolutePath = resolve(fileDir, pathPart);

      let exists = false;
      try {
        exists = statSync(absolutePath).isFile() || statSync(absolutePath).isDirectory();
      } catch {
        if (!extname(pathPart)) {
          try {
            exists = statSync(`${absolutePath}.md`).isFile();
          } catch {
            exists = false;
          }
        }
      }

      if (!exists) {
        issues.push(`Broken local link in ${file}: ${target}`);
      }
    }
  }

  return issues;
}

function printResult(label, issues) {
  if (issues.length === 0) {
    console.log(`${label}: OK`);
    return;
  }

  console.error(`${label}: ${issues.length} issue(s)`);
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
}

function main() {
  const mdFiles = walk(DOCS_ROOT);
  const runLinks = mode === 'all' || mode === 'links';
  const runStructure = mode === 'all' || mode === 'structure';

  const linkIssues = runLinks ? checkLinks(mdFiles) : [];
  const frontmatterIssues = runStructure ? checkFrontmatter(mdFiles) : [];
  const indexIssues = runStructure ? checkDirectoryIndexes() : [];

  if (runLinks) {
    printResult('Docs link check', linkIssues);
  }
  if (runStructure) {
    printResult('Docs frontmatter check', frontmatterIssues);
    printResult('Docs index check', indexIssues);
  }

  const totalIssues = linkIssues.length + frontmatterIssues.length + indexIssues.length;
  if (strict && totalIssues > 0) {
    process.exit(1);
  }

  if (!strict && totalIssues > 0) {
    console.log(
      'Docs governance found legacy issues (non-blocking mode). Use --strict to enforce.'
    );
  }

  console.log('Docs governance validation passed.');
}

main();
