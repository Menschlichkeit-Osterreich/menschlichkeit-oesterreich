#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, chmodSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..', '..');
const sourceRoot = resolve(repoRoot, 'Pdf');
const targetRoot = resolve(repoRoot, 'apps', 'website', 'public', 'docs');

const docs = [
  {
    source: 'Statuten-Verein-Menschlichkeit-Österreich.pdf',
    target: 'statuten-verein-menschlichkeit-oesterreich.pdf',
  },
  {
    source: 'Beitragsordnung-Verein-Menschlichkeit-Österreich.pdf',
    target: 'beitragsordnung-verein-menschlichkeit-oesterreich.pdf',
  },
  {
    source: 'Vereinsregisterauszug.pdf',
    target: 'vereinsregisterauszug.pdf',
  },
];

mkdirSync(targetRoot, { recursive: true });

function fileHash(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

for (const doc of docs) {
  const sourcePath = resolve(sourceRoot, doc.source);
  const targetPath = resolve(targetRoot, doc.target);

  if (!existsSync(sourcePath)) {
    throw new Error(`Pflichtdokument fehlt: ${sourcePath}`);
  }

  if (existsSync(targetPath) && fileHash(sourcePath) === fileHash(targetPath)) {
    console.log(`Unchanged ${doc.source} -> public/docs/${doc.target}`);
    continue;
  }

  try {
    copyFileSync(sourcePath, targetPath);
    try {
      chmodSync(targetPath, 0o644);
    } catch {
      // Best effort; ignore if not supported on this platform.
    }
    console.log(`Copied ${doc.source} -> public/docs/${doc.target}`);
  } catch (error) {
    if (error && error.code === 'EPERM') {
      // Attempt to remove the target file and retry once.
      try {
        unlinkSync(targetPath);
        copyFileSync(sourcePath, targetPath);
        try {
          chmodSync(targetPath, 0o644);
        } catch {
          // ignore
        }
        console.log(`Copied ${doc.source} -> public/docs/${doc.target} (after retry)`);
        continue;
      } catch {
        throw new Error(
          `Konnte ${doc.target} nicht aktualisieren. Datei ist vermutlich gesperrt. ` +
          `Bitte PDF-Viewer schließen und erneut ausführen.`,
        );
      }
    }
    throw error;
  }
}
