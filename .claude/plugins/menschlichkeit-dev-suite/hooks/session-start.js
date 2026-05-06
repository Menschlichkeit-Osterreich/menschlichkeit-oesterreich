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

  // Check .env existence
  const envPath = path.join(projectRoot, '.env');
  const envExists = fs.existsSync(envPath);
  const registryPath = path.join(projectRoot, '.github', 'ai-registry.json');
  const agentsPath = path.join(projectRoot, 'AGENTS.md');
  const claudePath = path.join(projectRoot, 'CLAUDE.md');

  lines.push(`Repo-Root: ${projectRoot}`);

  if (!envExists) {
    lines.push('⚠ .env-Datei fehlt im Repo-Root.');
    lines.push('  Erstelle sie aus .env.example: Copy-Item .env.example .env');
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

  try {
    const origin = execFileSync(
      'git',
      ['remote', 'get-url', 'origin'],
      { cwd: projectRoot, encoding: 'utf8', timeout: 3000 }
    ).trim();

    if (origin) {
      lines.push(`Origin: ${origin}`);
    }

    const expectedOrigin = 'https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich.git';
    if (origin !== expectedOrigin) {
      lines.push(`⚠ Git-Remote weicht vom erwarteten Repo ab: ${expectedOrigin}`);
    }
  } catch {
    // Skip
  }

  const requiredDocs = ['AGENTS.md', 'CLAUDE.md'];
  for (const doc of requiredDocs) {
    if (!fs.existsSync(path.join(projectRoot, doc))) {
      lines.push(`⚠ Governance-Datei fehlt: ${doc}`);
    }
  }

  if (!fs.existsSync(registryPath)) {
    lines.push('⚠ AI-Registry fehlt: .github/ai-registry.json');
  } else {
    try {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      const analysisPath = registry?.analysisEntry?.path;
      const analysisChatmode = registry?.chatmodes?.find((item) =>
        item.path === '.github/chatmodes/general/AnalysePlanung_DE.chatmode.md'
      );

      if (analysisPath) {
        lines.push(`Analyse-Einstieg: ${analysisPath}`);
      } else {
        lines.push('⚠ Kein aktiver Analyse-Einstieg in .github/ai-registry.json');
      }

      if (analysisChatmode) {
        lines.push(`Analyse-Chatmode: ${analysisChatmode.path}`);
      }

      lines.push('Rollenrouting: architect | developer | devops | security | qa');
    } catch {
      lines.push('⚠ .github/ai-registry.json konnte nicht gelesen werden');
    }
  }

  try {
    const agentsContent = fs.existsSync(agentsPath) ? fs.readFileSync(agentsPath, 'utf8') : '';
    const claudeContent = fs.existsSync(claudePath) ? fs.readFileSync(claudePath, 'utf8') : '';
    const expectedAnalysisPath = '.github/instructions/core/analysis-planning.instructions.md';

    if (!agentsContent.includes(expectedAnalysisPath) || !claudeContent.includes(expectedAnalysisPath)) {
      lines.push(`⚠ Analyse-Drift erkannt: ${expectedAnalysisPath} fehlt in AGENTS.md oder CLAUDE.md`);
    }
  } catch {
    lines.push('⚠ Governance-Dateien konnten nicht auf Analyse-Drift geprüft werden');
  }

  if (lines.length > 0) {
    const output = JSON.stringify({
      additionalContext: `[menschlichkeit-dev-suite] Projektkontext:\n${lines.join('\n')}`
    });
    process.stdout.write(output);
  }
}

main();
