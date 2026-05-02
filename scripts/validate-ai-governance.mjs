#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const registryPath = '.github/ai-registry.json';
const governanceDocs = [
  'AGENTS.md',
  'CLAUDE.md',
  '.github/copilot-instructions.md',
  '.github/instructions/copilot-workflow.md',
  '.github/instructions/core/analysis-planning.instructions.md',
  '.github/chatmodes/general/AnalysePlanung_DE.chatmode.md',
  '.github/chatmodes/README.md',
  '.github/prompts/README.md',
  '.github/agents/task-planner.agent.md',
  '.claude/prompts/PROMPT_ANALYSE.md',
  '.claude/plugins/menschlichkeit-dev-suite/hooks/session-start.js',
];

const jsonFiles = [
  registryPath,
  '.plugin-config/ai-pair-programming.json',
  '.plugin-config/claude-dev-helper.json',
  '.plugin-config/hook-auto-docs.json',
  '.plugin-config/hook-complexity-monitor.json',
  '.plugin-config/hook-git-auto-backup.json',
  '.plugin-config/hook-session-summary.json',
  '.plugin-config/hook-sound-notifications.json',
  '.plugin-config/hook-todo-collector.json',
  '.vscode/launch.json',
  '.vscode/tasks.json',
  '.vscode/extensions.json',
  '.vscode/mcp.json',
  '.claude/launch.json',
  'menschlichkeit-oesterreich.code-workspace',
  'package.json',
  '.claude/plugins/menschlichkeit-dev-suite/.claude-plugin/plugin.json',
  '.claude/plugins/moe-brand/.claude-plugin/plugin.json',
  '.claude/plugins/moe-compliance/.claude-plugin/plugin.json',
  '.claude/plugins/moe-ops/.claude-plugin/plugin.json',
  '.claude/plugins/moe-qa/.claude-plugin/plugin.json',
];

const bannedPatterns = [
  { label: 'old repo name', regex: /menschlichkeit-oesterreich-development/g },
  { label: 'legacy frontend path', regex: /\bfrontend\//g },
  { label: 'legacy API path', regex: /\bapi\.menschlichkeit-oesterreich\.at\b/g },
  { label: 'legacy game path', regex: /\bapps\/game\b/g },
  { label: 'old games port', regex: /\bPort 3000\b|\b3000\s*\|\s*Games\b/g },
  { label: 'old develop workflow', regex: /PRs?\s+auf\s+`?develop`?|PR back to `?develop`?/gi },
];

const requiredRegistryKeys = [
  'id',
  'kind',
  'status',
  'owner',
  'path',
  'role',
  'sourceOfTruth',
  'replacement',
];

const requiredSections = [
  'agents',
  'chatmodes',
  'instructions',
  'skills',
  'plugins',
  'prompts',
  'legacy',
];

const requiredAnalysisRefs = [
  '.github/instructions/core/analysis-planning.instructions.md',
  '.github/ai-registry.json',
];

const requiredIssueQuery = 'state:open repo:${owner}/${repository} sort:updated-desc';

const allowedOwners = new Set(['shared', 'copilot', 'claude', 'vendor']);
const allowedStatuses = new Set(['active', 'adapter', 'vendor', 'legacy', 'deprecated']);
const activeGithubAgents = new Set([
  '.github/agents/task-planner.agent.md',
  '.github/agents/developer.agent.md',
  '.github/agents/devops-expert.agent.md',
  '.github/agents/security-reviewer.agent.md',
  '.github/agents/qa-reviewer.agent.md',
]);

const requiredPathZones = {
  active: ['apps/', 'automation/', 'mcp-servers/', 'figma-design-system/'],
  legacy_read_only: [
    'api.menschlichkeit-oesterreich.at/',
    'crm.menschlichkeit-oesterreich.at/',
    'new/',
    'web/',
    'services/',
  ],
  evidence_ops: [
    'runbooks/',
    'monitoring/',
    'reports/',
    'analysis/',
    'deployment-scripts/',
    'security/',
    'tests/',
    'docs/',
  ],
  special_experimental: ['codacy-analysis-cli-master/'],
};

const readmeZoneMap = {
  aktiv: 'active',
  'legacy/mirror': 'legacy_read_only',
  'generated/evidence': 'evidence_ops',
  'vendor/spezial': 'special_experimental',
};

const legacyMarkerFiles = [
  'README.md',
  'LEGACY.md',
  'LEGACY-README.md',
  '.legacy',
  '.legacy-marker',
  '.read-only',
  '.reference-only',
];

const legacyMarkerTerms = ['legacy', 'read-only', 'reference-only', 'deprecated'];

function toAbsolute(relPath) {
  return path.join(root, relPath);
}

async function readText(relPath) {
  return fs.readFile(toAbsolute(relPath), 'utf8');
}

async function pathExists(relPath) {
  try {
    await fs.access(toAbsolute(relPath));
    return true;
  } catch {
    return false;
  }
}

function normalizeZonePath(value) {
  const normalized = String(value ?? '')
    .trim()
    .replaceAll('\\', '/');
  if (normalized.length === 0) {
    return normalized;
  }
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

function parseReadmeRootZones(readmeContent) {
  const zonePaths = {
    active: new Set(),
    legacy_read_only: new Set(),
    evidence_ops: new Set(),
    special_experimental: new Set(),
  };

  const lineRegex = /^- `([^`]+)`: (.+)$/gm;
  let match;
  while ((match = lineRegex.exec(readmeContent)) !== null) {
    const label = match[1].trim().toLowerCase();
    const zone = readmeZoneMap[label];
    if (!zone) {
      continue;
    }

    const bucket = zonePaths[zone];
    const paths = [...match[2].matchAll(/`([^`]+)`/g)].map(part => normalizeZonePath(part[1]));
    for (const relPath of paths) {
      if (relPath.endsWith('/')) {
        bucket.add(relPath);
      }
    }
  }

  return zonePaths;
}

function parseFrontmatterStatus(text) {
  if (!text.startsWith('---')) {
    return null;
  }

  const parts = text.split('---', 3);
  if (parts.length < 3) {
    return null;
  }

  for (const line of parts[1].split('\n')) {
    if (line.toLowerCase().startsWith('status:')) {
      return line.split(':', 2)[1].trim();
    }
  }

  return null;
}

async function validateRegistry(registry, errors) {
  if (!registry.meta || typeof registry.meta !== 'object') {
    errors.push('Registry is missing meta information');
  }

  if (!registry.analysisEntry || typeof registry.analysisEntry !== 'object') {
    errors.push('Registry is missing analysisEntry');
    return;
  }

  for (const section of requiredSections) {
    if (!Array.isArray(registry[section])) {
      errors.push(`Registry section must be an array: ${section}`);
    }
  }

  const pluginConfigEntries = Array.isArray(registry.pluginConfigs) ? registry.pluginConfigs : [];
  const allEntries = [
    registry.analysisEntry,
    ...requiredSections.flatMap(section => registry[section] ?? []),
    ...pluginConfigEntries,
  ];

  let activeAnalysisEntries = 0;
  for (const entry of allEntries) {
    for (const key of requiredRegistryKeys) {
      if (!(key in entry)) {
        errors.push(`Registry entry is missing key "${key}": ${JSON.stringify(entry)}`);
      }
    }

    if (!allowedStatuses.has(entry.status)) {
      errors.push(`Invalid registry status "${entry.status}" for ${entry.path}`);
    }

    if (!allowedOwners.has(entry.owner)) {
      errors.push(`Invalid registry owner "${entry.owner}" for ${entry.path}`);
    }

    if (!(await pathExists(entry.path))) {
      errors.push(`Registry path does not exist: ${entry.path}`);
    }

    if (entry.replacement && !(await pathExists(entry.replacement))) {
      errors.push(`Replacement path does not exist for ${entry.path}: ${entry.replacement}`);
    }

    if (entry === registry.analysisEntry && entry.status === 'active') {
      activeAnalysisEntries += 1;
    }

    if (
      entry.kind === 'skill' &&
      entry.status === 'active' &&
      !entry.path.startsWith('.github/skills/')
    ) {
      errors.push(`Active skill must live in .github/skills/: ${entry.path}`);
    }

    if (
      entry.kind === 'skill' &&
      entry.status === 'adapter' &&
      (!entry.replacement || !entry.replacement.startsWith('.github/skills/'))
    ) {
      errors.push(`Adapter skill must map to a canonical .github/skills entry: ${entry.path}`);
    }

    if (
      entry.kind === 'agent' &&
      entry.path.startsWith('.github/agents/') &&
      entry.status === 'active' &&
      !activeGithubAgents.has(entry.path)
    ) {
      errors.push(`Non-canonical GitHub agent is marked active: ${entry.path}`);
    }

    if ((entry.kind === 'mode' || entry.kind === 'legacy-chatmode') && entry.status === 'active') {
      errors.push(`Legacy mode/chatmode cannot be active: ${entry.path}`);
    }
  }

  if (activeAnalysisEntries !== 1) {
    errors.push(`Exactly one active analysisEntry is required, found ${activeAnalysisEntries}`);
  }
}

async function validateVisibleCopilotAgents(registry, errors) {
  const agentDir = '.github/agents';
  const entries = await fs.readdir(toAbsolute(agentDir), { withFileTypes: true });
  const visibleAgents = entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.agent.md'))
    .map(entry => `${agentDir}/${entry.name}`)
    .sort();

  if (visibleAgents.length !== activeGithubAgents.size) {
    errors.push(
      `.github/agents/ must contain exactly ${activeGithubAgents.size} visible Copilot agents, found ${visibleAgents.length}`
    );
  }

  for (const expectedPath of activeGithubAgents) {
    if (!visibleAgents.includes(expectedPath)) {
      errors.push(`Missing canonical visible Copilot agent: ${expectedPath}`);
    }
  }

  for (const relPath of visibleAgents) {
    if (!activeGithubAgents.has(relPath)) {
      errors.push(`Unexpected visible Copilot agent: ${relPath}`);
    }
    if (
      relPath === '.github/agents/mentor.agent.md' ||
      relPath === '.github/agents/mcp-operations.agent.md'
    ) {
      errors.push(`Deprecated Copilot agent must not stay visible: ${relPath}`);
    }
  }

  const registryAgentPaths = new Set((registry.agents ?? []).map(agent => agent.path));
  for (const relPath of visibleAgents) {
    if (!registryAgentPaths.has(relPath)) {
      errors.push(`Visible Copilot agent is missing from registry: ${relPath}`);
    }
  }

  const activeCopilotEntries = (registry.agents ?? []).filter(
    agent => agent.owner === 'copilot' && agent.status === 'active'
  );

  if (activeCopilotEntries.length !== activeGithubAgents.size) {
    errors.push(
      `Registry must mark exactly ${activeGithubAgents.size} active Copilot agents, found ${activeCopilotEntries.length}`
    );
  }

  for (const agent of activeCopilotEntries) {
    if (!activeGithubAgents.has(agent.path)) {
      errors.push(`Registry active Copilot agent is not canonical: ${agent.path}`);
    }
  }

  for (const relPath of activeGithubAgents) {
    const content = await readText(relPath);
    if (content.includes('.copilot-tracking')) {
      errors.push(`Active Copilot agent must not require .copilot-tracking paths: ${relPath}`);
    }
  }
}

async function validateCopilotGovernanceDocs(errors) {
  const docs = [
    'AGENTS.md',
    'CLAUDE.md',
    '.github/copilot-instructions.md',
    '.github/instructions/copilot-workflow.md',
  ];

  for (const relPath of docs) {
    const content = await readText(relPath);
    for (const agentPath of activeGithubAgents) {
      if (!content.includes(agentPath)) {
        errors.push(`${relPath} must mention canonical Copilot agent ${agentPath}`);
      }
    }

    for (const deprecatedPath of [
      '.github/agents/mentor.agent.md',
      '.github/agents/mcp-operations.agent.md',
    ]) {
      if (content.includes(deprecatedPath)) {
        errors.push(`${relPath} still references deprecated visible agent ${deprecatedPath}`);
      }
    }

    if (
      content.includes('.github/agents/task-planner.agent.md') &&
      content.includes('.github/agents/devops-expert.agent.md') &&
      content.includes('.github/agents/mentor.agent.md')
    ) {
      errors.push(`${relPath} still contains the old three-agent Copilot list`);
    }
  }
}

async function validatePathZones(registry, errors) {
  const pathZones = registry?.meta?.pathZones;
  if (!pathZones || typeof pathZones !== 'object' || Array.isArray(pathZones)) {
    errors.push('Registry meta.pathZones is missing or invalid');
    return;
  }

  const pathAssignments = new Map();
  for (const [zoneName, requiredPaths] of Object.entries(requiredPathZones)) {
    const configuredPaths = pathZones[zoneName];
    if (!Array.isArray(configuredPaths)) {
      errors.push(`Registry meta.pathZones.${zoneName} must be an array`);
      continue;
    }

    if (configuredPaths.length === 0) {
      errors.push(`Registry meta.pathZones.${zoneName} must not be empty`);
      continue;
    }

    const normalizedConfigured = configuredPaths.map(entry => normalizeZonePath(entry));
    const zoneSet = new Set(normalizedConfigured);
    if (zoneSet.size !== normalizedConfigured.length) {
      errors.push(`Registry meta.pathZones.${zoneName} contains duplicate paths`);
    }

    for (const requiredPath of requiredPaths) {
      if (!zoneSet.has(requiredPath)) {
        errors.push(`Registry meta.pathZones.${zoneName} is missing required path ${requiredPath}`);
      }
    }

    for (const relPath of zoneSet) {
      if (!(await pathExists(relPath))) {
        errors.push(`Registry meta.pathZones.${zoneName} references missing path ${relPath}`);
      }

      const zones = pathAssignments.get(relPath) ?? [];
      zones.push(zoneName);
      pathAssignments.set(relPath, zones);
    }
  }

  for (const [relPath, zones] of pathAssignments.entries()) {
    if (zones.length > 1) {
      errors.push(`Path zone conflict for ${relPath}: assigned to ${zones.join(', ')}`);
    }
  }

  const readmeContent = await readText('README.md');
  const readmeZones = parseReadmeRootZones(readmeContent);
  for (const [zoneName, requiredPaths] of Object.entries(requiredPathZones)) {
    const bucket = readmeZones[zoneName] ?? new Set();
    for (const requiredPath of requiredPaths) {
      if (!bucket.has(requiredPath)) {
        errors.push(
          `README root classification drift: ${requiredPath} is missing in zone ${zoneName}`
        );
      }
    }
  }

  for (const [zoneName, requiredPaths] of Object.entries(requiredPathZones)) {
    for (const requiredPath of requiredPaths) {
      for (const [otherZoneName, bucket] of Object.entries(readmeZones)) {
        if (otherZoneName !== zoneName && bucket.has(requiredPath)) {
          errors.push(
            `README root classification drift: ${requiredPath} is listed under ${otherZoneName}, expected ${zoneName}`
          );
        }
      }
    }
  }

  for (const legacyRoot of requiredPathZones.legacy_read_only) {
    let markerFound = false;
    let markerHasTerms = false;
    for (const markerFile of legacyMarkerFiles) {
      const markerPath = `${legacyRoot}${markerFile}`;
      if (!(await pathExists(markerPath))) {
        continue;
      }

      markerFound = true;
      const markerText = (await readText(markerPath)).toLowerCase();
      markerHasTerms = legacyMarkerTerms.some(term => markerText.includes(term));
      if (markerHasTerms) {
        break;
      }
    }

    if (!markerFound) {
      errors.push(`Legacy root ${legacyRoot} is missing a visible read-only marker file`);
      continue;
    }

    if (!markerHasTerms) {
      errors.push(
        `Legacy root ${legacyRoot} marker must include one of: ${legacyMarkerTerms.join(', ')}`
      );
    }
  }
}

async function validatePromptStates(registry, errors) {
  for (const prompt of registry.prompts ?? []) {
    const text = await readText(prompt.path);
    const status = parseFrontmatterStatus(text);
    if (prompt.status === 'active' && status !== 'ACTIVE') {
      errors.push(`Active prompt must have frontmatter status ACTIVE: ${prompt.path}`);
    }
    if (prompt.status === 'deprecated' && status !== 'DEPRECATED') {
      errors.push(`Deprecated prompt must have frontmatter status DEPRECATED: ${prompt.path}`);
    }
  }

  for (const legacy of registry.legacy ?? []) {
    if (!legacy.path.endsWith('.yaml')) {
      continue;
    }
    const text = await readText(legacy.path);
    if (!text.includes('status: DEPRECATED')) {
      errors.push(`Legacy YAML must stay marked DEPRECATED: ${legacy.path}`);
    }
  }
}

async function validateDocs(errors) {
  for (const relPath of governanceDocs) {
    const content = await readText(relPath);
    for (const snippet of requiredAnalysisRefs) {
      if (relPath === snippet) {
        continue;
      }
      if (!content.includes(snippet)) {
        errors.push(`${relPath} must mention ${snippet}`);
      }
    }
    for (const rule of bannedPatterns) {
      if (rule.regex.test(content)) {
        errors.push(`Banned pattern "${rule.label}" found in ${relPath}`);
      }
    }
  }

  for (const relPath of [
    '.github/instructions/core/analysis-planning.instructions.md',
    '.github/chatmodes/general/AnalysePlanung_DE.chatmode.md',
    '.github/agents/task-planner.agent.md',
    '.claude/prompts/PROMPT_ANALYSE.md',
  ]) {
    const content = await readText(relPath);
    if (!content.includes(requiredIssueQuery)) {
      errors.push(`${relPath} must mention the canonical GitHub issue query`);
    }
  }

  const mcpDoc = await readText('docs/MCP-SERVERS-OVERVIEW.md');
  if (!mcpDoc.includes('@modelcontextprotocol/server-sequential-thinking')) {
    errors.push(
      'docs/MCP-SERVERS-OVERVIEW.md must document the real sequential-thinking MCP server'
    );
  }

  if (!mcpDoc.includes('.github/instructions/core/analysis-planning.instructions.md')) {
    errors.push('docs/MCP-SERVERS-OVERVIEW.md must mention analysis-planning.instructions.md');
  }
}

async function validateMigrationFiles(errors) {
  const migrationMapText = await readText('.github/prompts/MIGRATION_MAP.json');
  if (migrationMapText.includes('TBD')) {
    errors.push('.github/prompts/MIGRATION_MAP.json must not contain unresolved TBD entries');
  }

  const migrationDoc = await readText('.github/prompts/MIGRATION.md');
  if (!migrationDoc.includes('.github/ai-registry.json')) {
    errors.push('.github/prompts/MIGRATION.md must mention .github/ai-registry.json');
  }
}

async function validatePluginMetadata(errors) {
  const pluginFiles = jsonFiles.filter(entry => entry.endsWith('plugin.json'));
  for (const relPath of pluginFiles) {
    const plugin = JSON.parse(await readText(relPath));
    for (const key of [
      'exposesAgents',
      'exposesSkills',
      'mapsToRoles',
      'analysisCapable',
      'sourceOfTruth',
    ]) {
      if (!(key in plugin)) {
        errors.push(`Plugin metadata missing "${key}" in ${relPath}`);
      }
    }
    if (plugin.sourceOfTruth !== '.github/ai-registry.json') {
      errors.push(`Plugin sourceOfTruth must point to .github/ai-registry.json in ${relPath}`);
    }
  }
}

async function validateMcpConfiguration(errors) {
  const mcpConfig = JSON.parse(await readText('mcp.json'));
  const sequentialThinking = mcpConfig?.mcpServers?.['sequential-thinking'];
  if (!sequentialThinking) {
    errors.push('mcp.json must define sequential-thinking');
    return;
  }
  const args = JSON.stringify(sequentialThinking.args ?? []);
  if (!args.includes('@modelcontextprotocol/server-sequential-thinking')) {
    errors.push('mcp.json must use the official sequential-thinking MCP server');
  }

  const vscodeMcpConfig = JSON.parse(await readText('.vscode/mcp.json'));
  const vscodeServers = vscodeMcpConfig?.servers;
  if (!vscodeServers || typeof vscodeServers !== 'object' || Array.isArray(vscodeServers)) {
    errors.push('.vscode/mcp.json must define a servers object');
    return;
  }

  const vscodeServerIds = Object.keys(vscodeServers);
  if (vscodeServerIds.length !== 1 || vscodeServerIds[0] !== 'github') {
    errors.push('.vscode/mcp.json must only contain the github overlay server');
  }
}

async function validateVscodeTasks(errors) {
  const tasksConfig = JSON.parse(await readText('.vscode/tasks.json'));
  const tasks = tasksConfig?.tasks;
  if (!Array.isArray(tasks)) {
    errors.push('.vscode/tasks.json must define a tasks array');
    return;
  }

  const labels = new Map();
  for (const task of tasks) {
    if (!task || typeof task !== 'object') {
      errors.push('Each task entry in .vscode/tasks.json must be an object');
      continue;
    }

    if (typeof task.label !== 'string' || task.label.trim().length === 0) {
      errors.push('Each task in .vscode/tasks.json must have a non-empty label');
      continue;
    }

    labels.set(task.label, (labels.get(task.label) ?? 0) + 1);
  }

  for (const [label, count] of labels.entries()) {
    if (count > 1) {
      errors.push(`Duplicate VS Code task label found: ${label}`);
    }
  }
}

async function main() {
  const errors = [];

  for (const relPath of jsonFiles) {
    try {
      JSON.parse(await readText(relPath));
    } catch (error) {
      errors.push(`Invalid JSON in ${relPath}: ${error.message}`);
    }
  }

  const registry = JSON.parse(await readText(registryPath));
  await validateRegistry(registry, errors);
  await validateVisibleCopilotAgents(registry, errors);
  await validatePathZones(registry, errors);
  await validatePromptStates(registry, errors);
  await validateDocs(errors);
  await validateCopilotGovernanceDocs(errors);
  await validateMigrationFiles(errors);
  await validatePluginMetadata(errors);
  await validateMcpConfiguration(errors);
  await validateVscodeTasks(errors);

  try {
    const workspace = JSON.parse(await readText('menschlichkeit-oesterreich.code-workspace'));
    const folderPath = workspace.folders?.[0]?.path;
    if (folderPath !== '.') {
      errors.push("Workspace file must point to '.' as the primary folder");
    }
  } catch {
    errors.push('Unable to validate workspace file');
  }

  if (await pathExists('menschlichkeit-oesterreich-development.code-workspace')) {
    errors.push('Legacy workspace file should not remain in the repo root');
  }

  if (errors.length > 0) {
    console.error('AI governance validation failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('AI governance validation passed.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
