#!/usr/bin/env node

/**
 * PostToolUse Hook (Bash|Edit|Write) — Menschlichkeit Österreich Dev-Suite
 *
 * Analyzes tool failures and suggests fixes in Austrian German.
 * Never blocks — always exits 0.
 */

'use strict';

function main() {
  let input = '';

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);

      // Only act on failures
      if (!data.error && data.tool_output !== undefined) {
        process.exit(0);
      }

      const errorText = data.error || data.tool_output || '';
      if (!errorText) {
        process.exit(0);
      }

      const suggestion = analyzeError(errorText);
      if (suggestion) {
        const output = JSON.stringify({
          additionalContext: `[menschlichkeit-dev-suite] Fehleranalyse:\n${suggestion}`
        });
        process.stdout.write(output);
      }
    } catch {
      // Don't block on parse errors
    }

    process.exit(0);
  });
}

function analyzeError(error) {
  const patterns = [
    {
      test: /ModuleNotFoundError:\s*No module named '([^']+)'/,
      suggest: (m) =>
        `Python-Modul '${m[1]}' fehlt.\n` +
        `Vorschlag: pip install ${m[1]}\n` +
        `Oder: cd apps/api && pip install -r requirements.txt`
    },
    {
      test: /ImportError:\s*cannot import name '([^']+)'/,
      suggest: (m) =>
        `Python-Import '${m[1]}' fehlgeschlagen.\n` +
        `Möglicherweise veraltetes Paket. Vorschlag: pip install --upgrade <paket>`
    },
    {
      test: /ENOENT|No such file or directory/,
      suggest: () =>
        'Datei oder Verzeichnis nicht gefunden.\n' +
        'Überprüfe den Dateipfad — relative Pfade beziehen sich auf das aktuelle Arbeitsverzeichnis.'
    },
    {
      test: /EACCES|Permission denied/,
      suggest: () =>
        'Zugriff verweigert.\n' +
        'Überprüfe die Dateiberechtigungen oder verwende einen anderen Pfad.'
    },
    {
      test: /SyntaxError/,
      suggest: () =>
        'Syntaxfehler in der bearbeiteten Datei.\n' +
        'Lies die Datei erneut und überprüfe die Klammerung und Einrückung.'
    },
    {
      test: /ECONNREFUSED.*(:5432|postgres)/,
      suggest: () =>
        'PostgreSQL-Verbindung abgelehnt.\n' +
        'Vorschlag: npm run docker:up (startet PostgreSQL und Redis)'
    },
    {
      test: /ECONNREFUSED.*(:6379|redis)/,
      suggest: () =>
        'Redis-Verbindung abgelehnt.\n' +
        'Vorschlag: npm run docker:up (startet PostgreSQL und Redis)'
    },
    {
      test: /alembic.*Target database is not up to date/,
      suggest: () =>
        'Alembic-Migrations nicht aktuell.\n' +
        'Vorschlag: cd apps/api && alembic upgrade head'
    },
    {
      test: /prisma.*migrate/i,
      suggest: () =>
        'Prisma-Migration erforderlich.\n' +
        'Vorschlag: npx prisma migrate dev'
    },
    {
      test: /command not found|not recognized/,
      suggest: () =>
        'Befehl nicht gefunden.\n' +
        'Überprüfe ob das Tool installiert ist (npm install, pip install, etc.)'
    }
  ];

  for (const pattern of patterns) {
    const match = error.match(pattern.test);
    if (match) {
      return pattern.suggest(match);
    }
  }

  return null;
}

main();
