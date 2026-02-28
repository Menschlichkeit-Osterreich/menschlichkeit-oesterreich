#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TOKENS_PATH = resolve(__dirname, '../../figma-design-system/00_design-tokens.json');
const OUT_PATH = resolve(__dirname, '../src/styles/tokens.css');
const SOURCE_INFO = resolve(__dirname, '../../figma-design-system/figma-source.json');

function toKebab(str) {
  return String(str)
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

function quoteFont(f) {
  const generic = ['serif', 'sans-serif', 'monospace', 'system-ui'];
  if (generic.includes(f)) return f;
  // wrap if contains space or hyphen or not purely alnum
  if (/[^a-z0-9]/i.test(f)) return `"${f}"`;
  return f;
}

function normalizeValue(val) {
  if (Array.isArray(val)) {
    return val.map(quoteFont).join(', ');
  }
  return String(val);
}

function flatten(obj, prefix = []) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const k = toKebab(key);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(value, [...prefix, k]));
    } else {
      const name = ['ds', ...prefix, k].join('-');
      out[name] = normalizeValue(value);
    }
  }
  return out;
}

function buildCss(vars, theme = 'root') {
  const sel = theme === 'root' ? ':root' : `[data-theme="${theme}"]`;
  const lines = Object.entries(vars)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `  --${name}: ${value};`);
  return `${sel} {\n${lines.join('\n')}\n}\n`;
}

const json = JSON.parse(readFileSync(TOKENS_PATH, 'utf-8'));
const tokens = json.designTokens || json;

const flattened = flatten(tokens);
const css = `/* Auto-generated from figma-design-system/00_design-tokens.json */\n${buildCss(flattened, 'root')}`;

mkdirSync(resolve(__dirname, '../src/styles'), { recursive: true });
writeFileSync(OUT_PATH, css);
console.log(`Generated ${OUT_PATH}`);
try {
  const src = JSON.parse(readFileSync(SOURCE_INFO, 'utf-8'));
  console.log(`Figma source: fileKey=${src.fileKey}`);
} catch {
  // ignore
}

