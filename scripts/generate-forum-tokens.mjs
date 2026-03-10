/**
 * Forum Design-Token-Generator
 * Issue #173: Design-Token-Synchronisation Figma → Forum Theme
 *
 * Liest figma-design-system/00_design-tokens.json und
 * schreibt web/forum/styles/moe-theme/theme/tokens.css
 *
 * Aufruf: node scripts/generate-forum-tokens.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = join(__dir, '..');

const tokensPath = join(ROOT, 'figma-design-system', '00_design-tokens.json');
const outputPath = join(ROOT, 'web', 'forum', 'styles', 'moe-theme', 'theme', 'tokens.css');

const { designTokens: t } = JSON.parse(readFileSync(tokensPath, 'utf8'));

const lines = [
  '/*',
  ' * Menschlichkeit Österreich – phpBB Design-Token-Bridge',
  ` * Automatisch generiert: ${new Date().toISOString()}`,
  ' * Quelle: figma-design-system/00_design-tokens.json',
  ' * Issue #173: Design-Token-Synchronisation Figma → Forum Theme',
  ' * NICHT manuell bearbeiten – Änderungen werden überschrieben.',
  ' */',
  '',
  ':root {',
];

// Farbpaletten
for (const [paletteName, shades] of Object.entries(t.colors)) {
  if (paletteName === 'semantic') continue;
  lines.push(`  /* ── ${paletteName} ── */`);
  for (const [shade, value] of Object.entries(shades)) {
    lines.push(`  --ds-${paletteName}-${shade}: ${value};`);
  }
  lines.push('');
}

// Semantische Farben
lines.push('  /* ── Semantisch ── */');
for (const [key, value] of Object.entries(t.colors.semantic)) {
  lines.push(`  --ds-${key}: ${value};`);
}
lines.push('');

// Typografie – Schriftfamilien
lines.push('  /* ── Schriftfamilien ── */');
for (const [key, value] of Object.entries(t.typography.fontFamily)) {
  const quoted = value.includes(',') ? value : `'${value}'`;
  lines.push(`  --ds-font-${key}: ${quoted};`);
}
lines.push('');

// Schriftgrößen
lines.push('  /* ── Schriftgrößen ── */');
for (const [key, value] of Object.entries(t.typography.fontSize)) {
  lines.push(`  --ds-text-${key}: ${value};`);
}
lines.push('');

// Abstände
lines.push('  /* ── Abstände ── */');
for (const [key, value] of Object.entries(t.spacing)) {
  lines.push(`  --ds-space-${key}: ${value};`);
}
lines.push('');

// Radien
lines.push('  /* ── Radien ── */');
for (const [key, value] of Object.entries(t.borderRadius)) {
  lines.push(`  --ds-radius-${key}: ${value};`);
}
lines.push('');

// Schatten
lines.push('  /* ── Schatten ── */');
for (const [key, value] of Object.entries(t.shadows)) {
  lines.push(`  --ds-shadow-${key}: ${value};`);
}

lines.push('}', '');

writeFileSync(outputPath, lines.join('\n'), 'utf8');
console.log(`✓ Forum-Tokens generiert: ${outputPath}`);
