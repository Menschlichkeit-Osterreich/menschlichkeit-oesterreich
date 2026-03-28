#!/usr/bin/env node

/**
 * PreToolUse Hook (Bash) — Menschlichkeit Österreich Dev-Suite
 *
 * Blocks dangerous commands that could cause data loss or
 * compromise protected branches.
 */

'use strict';

function main() {
  let input = '';

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      const command = (data.tool_input && data.tool_input.command) || '';

      const result = checkCommand(command);
      if (result.blocked) {
        const output = JSON.stringify({
          error: result.message
        });
        process.stdout.write(output);
        process.exit(1);
      }

      process.exit(0);
    } catch {
      // Parse error — don't block
      process.exit(0);
    }
  });
}

function checkCommand(cmd) {
  if (!cmd) return { blocked: false };

  const normalized = cmd.toLowerCase().replace(/\s+/g, ' ').trim();

  // Catastrophic deletion
  if (/rm\s+-r[f ]*\s+[/~]/.test(normalized) || /rm\s+-fr\s+[/~]/.test(normalized)) {
    return {
      blocked: true,
      message: 'BLOCKIERT: Destruktiver Löschbefehl erkannt (rm -rf / oder ~). ' +
               'Dieser Befehl könnte das gesamte System oder Home-Verzeichnis löschen.'
    };
  }

  // SQL destruction
  if (/drop\s+(table|database)\b/i.test(cmd)) {
    return {
      blocked: true,
      message: 'BLOCKIERT: DROP TABLE/DATABASE erkannt. ' +
               'SQL-Strukturänderungen bitte manuell ausführen.'
    };
  }
  if (/\btruncate\s+/i.test(cmd)) {
    return {
      blocked: true,
      message: 'BLOCKIERT: TRUNCATE erkannt. ' +
               'Datenlöschung bitte manuell bestätigen.'
    };
  }

  // Force push to protected branches
  if (/git\s+push\s+.*--force/.test(normalized) && /(main|master)\b/.test(normalized)) {
    return {
      blocked: true,
      message: 'BLOCKIERT: git push --force auf geschütztem Branch (main/master). ' +
               'Verwende einen Feature-Branch und erstelle einen Pull Request.'
    };
  }

  // Hard reset on protected branches
  if (/git\s+reset\s+--hard/.test(normalized)) {
    // Check if on main/master — best effort via command context
    if (/(main|master)\b/.test(normalized)) {
      return {
        blocked: true,
        message: 'BLOCKIERT: git reset --hard auf main/master. ' +
                 'Verwende git revert für sichere Rücksetzungen.'
      };
    }
  }

  return { blocked: false };
}

main();
