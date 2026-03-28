#!/usr/bin/env node

/**
 * SessionStart Hook — Menschlichkeit Österreich Dev-Suite
 *
 * Checks critical environment variables and provides git context
 * on session startup or resume.
 */

'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function main() {
  const lines = [];

  // Find project root (walk up from plugin dir)
  const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || __dirname;
  const projectRoot = path.resolve(pluginRoot, '..', '..', '..', '..');
  const devRoot = path.join(projectRoot, 'menschlichkeit-oesterreich-development');

  // Check .env existence
  const envPath = path.join(devRoot, '.env');
  const envExists = fs.existsSync(envPath);

  if (!envExists) {
    lines.push('⚠ .env-Datei fehlt in menschlichkeit-oesterreich-development/');
    lines.push('  Erstelle sie aus .env.example: cp .env.example .env');
  } else {
    // Check critical env vars by reading .env
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const criticalVars = ['DATABASE_URL', 'JWT_SECRET_KEY'];
      const optionalVars = ['STRIPE_SECRET_KEY', 'N8N_BASE_URL'];
      const missing = [];
      const missingOptional = [];

      for (const v of criticalVars) {
        if (!envContent.includes(`${v}=`)) {
          missing.push(v);
        }
      }
      for (const v of optionalVars) {
        if (!envContent.includes(`${v}=`)) {
          missingOptional.push(v);
        }
      }

      if (missing.length > 0) {
        lines.push(`⚠ Fehlende kritische Umgebungsvariablen: ${missing.join(', ')}`);
      }
      if (missingOptional.length > 0) {
        lines.push(`ℹ Optionale Variablen nicht gesetzt: ${missingOptional.join(', ')}`);
      }
      if (missing.length === 0) {
        lines.push('✓ Kritische Umgebungsvariablen vorhanden');
      }
    } catch {
      lines.push('⚠ .env-Datei konnte nicht gelesen werden');
    }
  }

  // Git context: last 5 commits
  try {
    const gitLog = execFileSync(
      'git',
      ['log', '--oneline', '-5', '--no-color'],
      { cwd: projectRoot, encoding: 'utf8', timeout: 5000 }
    ).trim();

    if (gitLog) {
      lines.push('');
      lines.push('Letzte 5 Commits:');
      for (const line of gitLog.split('\n')) {
        lines.push(`  ${line}`);
      }
    }
  } catch {
    // Git not available or not a repo — skip silently
  }

  // Git branch
  try {
    const branch = execFileSync(
      'git',
      ['branch', '--show-current'],
      { cwd: projectRoot, encoding: 'utf8', timeout: 3000 }
    ).trim();

    if (branch) {
      lines.push(`Aktueller Branch: ${branch}`);
    }
  } catch {
    // Skip
  }

  if (lines.length > 0) {
    const output = JSON.stringify({
      additionalContext: `[menschlichkeit-dev-suite] Projektkontext:\n${lines.join('\n')}`
    });
    process.stdout.write(output);
  }
}

main();
