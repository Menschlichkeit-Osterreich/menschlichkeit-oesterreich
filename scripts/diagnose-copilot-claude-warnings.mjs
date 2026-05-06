import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const OFFICIAL_MODEL_IDS = new Set([
  'claude-opus-4-1-20250805',
  'claude-opus-4-20250514',
  'claude-sonnet-4-20250514',
  'claude-3-7-sonnet-20250219',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'claude-3-haiku-20240307',
  'claude-opus-4-0',
  'claude-sonnet-4-0',
  'claude-3-7-sonnet-latest',
  'claude-3-5-sonnet-latest',
  'claude-3-5-haiku-latest',
]);

const DEFAULT_REPORT = {
  workspace: process.cwd(),
  generatedAt: new Date().toISOString(),
  findings: [],
  stats: {
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  },
};

function parseArgs(argv) {
  const args = {
    json: false,
    stdin: false,
    logPath: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === '--json') {
      args.json = true;
      continue;
    }

    if (value === '--stdin') {
      args.stdin = true;
      continue;
    }

    if (value === '--log') {
      args.logPath = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${value}`);
  }

  return args;
}

function stripJsonComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(stripJsonComments(raw));
}

async function safeReadJson(filePath) {
  try {
    return await readJsonFile(filePath);
  } catch (error) {
    return { __error: error.message };
  }
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(directory, matcher, result = []) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await walkFiles(fullPath, matcher, result);
      continue;
    }

    if (matcher(fullPath)) {
      result.push(fullPath);
    }
  }

  return result;
}

function addFinding(report, severity, category, message, detail, evidence = []) {
  report.findings.push({ severity, category, message, detail, evidence });
  report.stats[severity] += 1;
}

function extractModel(content) {
  const match = content.match(/^model:\s*(.+)$/m);
  return match ? match[1].trim() : null;
}

function relativeToWorkspace(filePath) {
  return path.relative(process.cwd(), filePath) || '.';
}

async function inspectPluginModels(report) {
  const pluginRoot = path.join(process.cwd(), '.claude', 'plugins');

  if (!(await pathExists(pluginRoot))) {
    addFinding(
      report,
      'info',
      'plugin-models',
      'Kein .claude/plugins-Verzeichnis gefunden.',
      'Die Modellpruefung wurde uebersprungen.',
    );
    return;
  }

  const agentFiles = await walkFiles(
    pluginRoot,
    (filePath) => filePath.endsWith('.md') && filePath.includes(`${path.sep}agents${path.sep}`),
  );

  for (const filePath of agentFiles) {
    const content = await fs.readFile(filePath, 'utf8');
    const model = extractModel(content);

    if (!model) {
      continue;
    }

    if (!OFFICIAL_MODEL_IDS.has(model)) {
      addFinding(
        report,
        'high',
        'plugin-models',
        `Unbekannte oder nicht offiziell verifizierte Claude-Modell-ID in ${relativeToWorkspace(filePath)}.`,
        `Gefunden: ${model}`,
        [model],
      );
    }
  }
}

function normalizeMcpServers(config) {
  if (!config || config.__error) {
    return {};
  }

  if (config.mcpServers && typeof config.mcpServers === 'object') {
    return config.mcpServers;
  }

  if (config.servers && typeof config.servers === 'object') {
    return config.servers;
  }

  return {};
}

async function inspectMcpConfig(report) {
  const rootConfigPath = path.join(process.cwd(), 'mcp.json');
  const vscodeConfigPath = path.join(process.cwd(), '.vscode', 'mcp.json');

  const rootConfig = await safeReadJson(rootConfigPath);
  const vscodeConfig = await safeReadJson(vscodeConfigPath);

  if (rootConfig.__error) {
    addFinding(
      report,
      'medium',
      'mcp-config',
      'mcp.json konnte nicht geparst werden.',
      rootConfig.__error,
    );
  }

  if (vscodeConfig.__error) {
    addFinding(
      report,
      'medium',
      'mcp-config',
      '.vscode/mcp.json konnte nicht geparst werden.',
      vscodeConfig.__error,
    );
  }

  const rootServers = normalizeMcpServers(rootConfig);
  const vscodeServers = normalizeMcpServers(vscodeConfig);
  const overlappingServerIds = Object.keys(rootServers).filter((serverId) => serverId in vscodeServers);

  if (overlappingServerIds.length > 0) {
    addFinding(
      report,
      'medium',
      'mcp-config',
      'Doppelt konfigurierte MCP-Server zwischen mcp.json und .vscode/mcp.json gefunden.',
      'Das kann die Anzahl registrierter Tools erhoehen und zu "virtual-tools ... limit constraints" beitragen.',
      overlappingServerIds,
    );
  }
}

async function inspectWorkspaceSettings(report) {
  const settingsPath = path.join(process.cwd(), '.vscode', 'settings.json');

  if (!(await pathExists(settingsPath))) {
    addFinding(
      report,
      'info',
      'workspace-settings',
      'Keine .vscode/settings.json gefunden.',
      'Es gibt daher keine workspace-spezifischen Claude- oder Copilot-Overrides zu pruefen.',
    );
    return;
  }

  const settings = await safeReadJson(settingsPath);

  if (settings.__error) {
    addFinding(
      report,
      'medium',
      'workspace-settings',
      '.vscode/settings.json konnte nicht geparst werden.',
      settings.__error,
    );
    return;
  }

  const allKeys = Object.keys(settings);
  const claudeKeys = allKeys.filter((key) => /claude|anthropic/i.test(key));
  const copilotKeys = allKeys.filter((key) => /copilot/i.test(key));

  if (claudeKeys.length === 0) {
    addFinding(
      report,
      'info',
      'workspace-settings',
      'Keine Claude- oder Anthropic-spezifischen Workspace-Settings gefunden.',
      'Im aktuellen settings.json ist daher kein offensichtlicher Claude-Fehl-Override sichtbar.',
    );
  } else {
    addFinding(
      report,
      'medium',
      'workspace-settings',
      'Claude- oder Anthropic-spezifische Workspace-Settings gefunden.',
      'Diese Keys sollten gezielt auf Kompatibilitaet geprueft werden.',
      claudeKeys,
    );
  }

  if (!copilotKeys.includes('github.copilot.chat.codeGeneration.useInstructionFiles')) {
    addFinding(
      report,
      'low',
      'workspace-settings',
      'github.copilot.chat.codeGeneration.useInstructionFiles ist nicht gesetzt.',
      'Ohne diese Option kann repo-spezifische Governance in Copilot schlechter greifen.',
    );
  }
}

async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function inspectLogPatterns(report, logContent) {
  if (!logContent.trim()) {
    addFinding(
      report,
      'info',
      'log-analysis',
      'Kein Log-Inhalt uebergeben.',
      'Die Log-Musterpruefung wurde uebersprungen.',
    );
    return;
  }

  const checks = [
    {
      severity: 'high',
      category: 'log-analysis',
      pattern: /Unknown content_block type 'text'.*model ([^\s]+)/g,
      message: 'Claude-Messages-API meldet einen unbekannten content_block-Typ.',
      detail:
        'Das deutet auf eine Inkompatibilitaet zwischen GitHub Copilot Chat, der Agent-Serialisierung oder dem ausgewaehlten Claude-Modell hin.',
    },
    {
      severity: 'high',
      category: 'log-analysis',
      pattern: /Nothing to summarize/g,
      message: 'ConversationHistorySummarizer meldet "Nothing to summarize".',
      detail:
        'Das ist sehr wahrscheinlich ein interner Prompt-/Renderfehler der Copilot-Extension und kein Repo-Dateifehler.',
    },
    {
      severity: 'high',
      category: 'log-analysis',
      pattern: /No lowest priority node found/g,
      message: 'Copilot Prompt-Renderer meldet "No lowest priority node found".',
      detail:
        'Das deutet auf einen Fehler im Prompt-Element-Tree der Extension hin, oft nach aggressiver Konversationskompaktierung.',
    },
    {
      severity: 'high',
      category: 'log-analysis',
      pattern: /Invalid input path: ([^.]+.*?)\. Be sure to use an absolute path/gi,
      message: 'Ein Tool-Aufruf verwendet einen relativen Pfad, obwohl ein absoluter Pfad verlangt wird.',
      detail:
        'Das ist typischerweise ein Agent-/Tool-Aufruffehler und kein Hinweis darauf, dass die Datei fehlt.',
    },
    {
      severity: 'medium',
      category: 'log-analysis',
      pattern: /Had to drop \d+ tools due to limit constraints/g,
      message: 'Copilot musste Tools wegen Limitgrenzen verwerfen.',
      detail:
        'Das ist ein Degradationssignal. Doppelte MCP-Server oder sehr viele registrierte Tools koennen dazu beitragen.',
    },
    {
      severity: 'medium',
      category: 'log-analysis',
      pattern: /unknown keyword: "enumDescriptions"/g,
      message: 'Tool-Schema enthaelt enumDescriptions, die vom Validator nicht akzeptiert werden.',
      detail:
        'Das deutet auf eine Inkompatibilitaet zwischen Extension-Version und Tool-Schema hin.',
    },
  ];

  for (const check of checks) {
    const matches = [...logContent.matchAll(check.pattern)];

    if (matches.length === 0) {
      continue;
    }

    const evidence = matches
      .map((match) => match[0].trim())
      .filter(Boolean)
      .slice(0, 5);

    addFinding(report, check.severity, check.category, check.message, check.detail, evidence);
  }

  const modelMentions = [...logContent.matchAll(/claude-[a-z0-9.-]+/gi)]
    .map((match) => match[0])
    .filter((model, index, allModels) => allModels.indexOf(model) === index)
    .filter((model) => !OFFICIAL_MODEL_IDS.has(model));

  if (modelMentions.length > 0) {
    addFinding(
      report,
      'medium',
      'log-analysis',
      'Im Log tauchen Claude-Modellbezeichner auf, die nicht in der offiziellen Snapshot-Liste liegen.',
      'Diese Modell-IDs koennen Aliasnamen, provider-spezifische Umbenennungen oder inkompatible Bezeichner sein.',
      modelMentions,
    );
  }
}

function buildSummary(report) {
  const priority = ['high', 'medium', 'low', 'info'];
  const topFindings = [];

  for (const severity of priority) {
    for (const finding of report.findings.filter((entry) => entry.severity === severity)) {
      if (topFindings.length >= 3) {
        return topFindings;
      }

      topFindings.push(`${finding.severity.toUpperCase()}: ${finding.message}`);
    }
  }

  return topFindings;
}

function renderTextReport(report) {
  const lines = [];
  lines.push('Copilot/Claude Diagnostic Report');
  lines.push(`Workspace: ${report.workspace}`);
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('Summary:');

  const summaryLines = buildSummary(report);

  if (summaryLines.length === 0) {
    lines.push('- Keine Befunde.');
  } else {
    for (const line of summaryLines) {
      lines.push(`- ${line}`);
    }
  }

  lines.push('');
  lines.push('Findings:');

  if (report.findings.length === 0) {
    lines.push('- Keine Befunde.');
    return lines.join('\n');
  }

  for (const finding of report.findings) {
    lines.push(`- [${finding.severity.toUpperCase()}] ${finding.category}: ${finding.message}`);
    lines.push(`  ${finding.detail}`);

    if (finding.evidence.length > 0) {
      lines.push(`  Evidence: ${finding.evidence.join(' | ')}`);
    }
  }

  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = structuredClone(DEFAULT_REPORT);

  await inspectPluginModels(report);
  await inspectMcpConfig(report);
  await inspectWorkspaceSettings(report);

  let logContent = '';

  if (args.logPath) {
    const absoluteLogPath = path.resolve(args.logPath);
    logContent = await fs.readFile(absoluteLogPath, 'utf8');
  } else if (args.stdin || !process.stdin.isTTY) {
    logContent = await readStdin();
  }

  if (args.logPath || args.stdin || !process.stdin.isTTY) {
    inspectLogPatterns(report, logContent);
  }

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(renderTextReport(report));
}

main().catch((error) => {
  console.error(`Diagnostic failed: ${error.message}`);
  process.exitCode = 1;
});
