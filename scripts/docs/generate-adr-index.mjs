#!/usr/bin/env node
/**
 * Generate ADR Index
 *
 * This script scans docs/architecture/ADRs for Markdown files (excluding ADR-INDEX.md)
 * and generates an ADR index at docs/architecture/ADRs/ADR-INDEX.md.
 *
 * Goals:
 * - Be robust even if the ADRs directory or files do not exist
 * - Never fail the CI: always create a valid Markdown index
 * - Keep output deterministic and simple
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ADR_DIR = path.join(ROOT, 'docs', 'architecture', 'ADRs');
const ADR_INDEX = path.join(ADR_DIR, 'ADR-INDEX.md');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function listAdrFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.isDirectory()) {
      files.push(...listAdrFiles(path.join(dir, e.name)));
    } else if (e.isFile()) {
      const full = path.join(dir, e.name);
      const name = e.name.toLowerCase();
      if (name.endsWith('.md') && name !== 'adr-index.md') {
        files.push(full);
      }
    }
  }
  return files;
}

function readFirstHeading(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    for (const l of lines) {
      const m = l.match(/^#{1,6}\s+(.+?)\s*$/);
      if (m) return m[1].trim();
    }
  } catch {
    // ignore
  }
  return null;
}

function parseAdrIdAndSlug(file) {
  const base = path.basename(file);
  // Common pattern: ADR-0001-some-title.md or 0001-some-title.md
  const m = base.match(/(?:ADR-)?(\d{2,5})(?:[-_](.*))?\.md$/i);
  if (m) {
    const id = m[1];
    const slug = (m[2] || '').replace(/\s+/g, '-');
    return { id, slug };
  }
  return { id: null, slug: null };
}

function buildIndex(items) {
  const lines = [];
  lines.push('# Architecture Decision Records – Index');
  lines.push('');
  if (items.length === 0) {
    lines.push('Derzeit sind keine ADRs vorhanden.');
    lines.push('');
    lines.push('Hinweis: Lege neue ADRs unter `docs/architecture/ADRs/` an (z. B. `ADR-0001-titel.md`).');
    return lines.join('\n');
  }
  // Table header
  lines.push('| ID | Titel | Datei |');
  lines.push('| --- | --- | --- |');
  for (const it of items) {
    const id = it.id ?? '—';
    const title = it.title ?? it.name;
    const rel = path.relative(path.join(ROOT, 'docs'), it.file).replace(/\\/g, '/');
    lines.push(`| ${id} | ${title} | ${rel} |`);
  }
  lines.push('');
  return lines.join('\n');
}

function main() {
  ensureDir(ADR_DIR);
  const files = listAdrFiles(ADR_DIR).sort((a, b) => a.localeCompare(b));
  const items = files.map((file) => {
    const { id } = parseAdrIdAndSlug(file);
    const title = readFirstHeading(file) || path.basename(file);
    return {
      id,
      title,
      name: path.basename(file),
      file,
    };
  });
  const md = buildIndex(items);
  fs.writeFileSync(ADR_INDEX, md, 'utf8');
  // Output for CI logs
  console.log(`ADR index generated at: ${path.relative(ROOT, ADR_INDEX)}`);
  console.log(`Entries: ${items.length}`);
}

try {
  main();
} catch (err) {
  // Do not fail CI; create minimal file as fallback
  try {
    ensureDir(ADR_DIR);
    const fallback = '# Architecture Decision Records – Index\n\nGeneriert, aber ein Fehler ist aufgetreten. Bitte Logs prüfen.';
    fs.writeFileSync(ADR_INDEX, fallback, 'utf8');
    console.warn('Fehler beim Generieren des ADR-Index, Fallback-Datei erstellt:', err?.message || err);
    process.exit(0);
  } catch (err2) {
    console.error('Konnte Fallback-Datei nicht erstellen:', err2?.message || err2);
    process.exit(0); // still do not fail CI
  }
}
