#!/usr/bin/env node
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const gameRoot = resolve(__dirname, '..');
const distDir = resolve(gameRoot, 'dist');

const copyTargets = [
  ['index.html', 'index.html'],
  ['manifest.json', 'manifest.json'],
  ['robots.txt', 'robots.txt'],
  ['sw.js', 'sw.js'],
  ['assets', 'assets'],
  ['css/babylon-game.css', 'css/babylon-game.css'],
  ['js/babylon-app.js', 'js/babylon-app.js'],
  ['js/babylon-engine.js', 'js/babylon-engine.js'],
  ['js/babylon-content.js', 'js/babylon-content.js'],
  ['js/core', 'js/core'],
  ['js/content', 'js/content'],
  ['js/scenes', 'js/scenes'],
  ['js/services', 'js/services'],
  ['js/ui', 'js/ui'],
];

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

for (const [source, target] of copyTargets) {
  const sourcePath = resolve(gameRoot, source);
  const targetPath = resolve(distDir, target);
  mkdirSync(dirname(targetPath), { recursive: true });
  cpSync(sourcePath, targetPath, { recursive: true });
}

console.log(`Games-Build geschrieben nach ${distDir}`);
