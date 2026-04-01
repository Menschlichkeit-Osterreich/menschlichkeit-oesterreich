#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const registryPath = ".github/ai-registry.json";
const governanceDocs = [
  "AGENTS.md",
  "CLAUDE.md",
  ".github/copilot-instructions.md",
  ".github/instructions/copilot-workflow.md",
  ".github/instructions/core/analysis-planning.instructions.md",
  ".github/chatmodes/general/AnalysePlanung_DE.chatmode.md",
  ".github/chatmodes/README.md",
  ".github/prompts/README.md",
  ".github/agents/task-planner.agent.md",
  ".claude/prompts/PROMPT_ANALYSE.md",
  ".claude/plugins/menschlichkeit-dev-suite/hooks/session-start.js"
];

const jsonFiles = [
  registryPath,
  ".plugin-config/ai-pair-programming.json",
  ".plugin-config/claude-dev-helper.json",
  ".plugin-config/hook-auto-docs.json",
  ".plugin-config/hook-complexity-monitor.json",
  ".plugin-config/hook-git-auto-backup.json",
  ".plugin-config/hook-session-summary.json",
  ".plugin-config/hook-sound-notifications.json",
  ".plugin-config/hook-todo-collector.json",
  ".vscode/settings.json",
  ".vscode/launch.json",
  ".vscode/tasks.json",
  ".vscode/extensions.json",
  ".vscode/mcp.json",
  ".claude/launch.json",
  "menschlichkeit-oesterreich.code-workspace",
  "package.json",
  ".claude/plugins/menschlichkeit-dev-suite/.claude-plugin/plugin.json",
  ".claude/plugins/moe-brand/.claude-plugin/plugin.json",
  ".claude/plugins/moe-compliance/.claude-plugin/plugin.json",
  ".claude/plugins/moe-ops/.claude-plugin/plugin.json",
  ".claude/plugins/moe-qa/.claude-plugin/plugin.json"
];

const bannedPatterns = [
  { label: "old repo name", regex: /menschlichkeit-oesterreich-development/g },
  { label: "legacy frontend path", regex: /\bfrontend\//g },
  { label: "legacy API path", regex: /\bapi\.menschlichkeit-oesterreich\.at\b/g },
  { label: "legacy game path", regex: /\bapps\/game\b/g },
  { label: "old games port", regex: /\bPort 3000\b|\b3000\s*\|\s*Games\b/g },
  { label: "old develop workflow", regex: /PRs?\s+auf\s+`?develop`?|PR back to `?develop`?/gi }
];

const requiredRegistryKeys = [
  "id",
  "kind",
  "status",
  "owner",
  "path",
  "role",
  "sourceOfTruth",
  "replacement"
];

const requiredSections = [
  "agents",
  "chatmodes",
  "instructions",
  "skills",
  "plugins",
  "prompts",
  "legacy"
];

const requiredAnalysisRefs = [
  ".github/instructions/core/analysis-planning.instructions.md",
  ".github/ai-registry.json"
];

const requiredIssueQuery = "state:open repo:${owner}/${repository} sort:updated-desc";

const allowedOwners = new Set(["shared", "copilot", "claude", "vendor"]);
const allowedStatuses = new Set(["active", "adapter", "vendor", "legacy", "deprecated"]);
const activeGithubAgents = new Set([
  ".github/agents/task-planner.agent.md",
  ".github/agents/devops-expert.agent.md",
  ".github/agents/mentor.agent.md"
]);

function toAbsolute(relPath) {
  return path.join(root, relPath);
}

async function readText(relPath) {
  return fs.readFile(toAbsolute(relPath), "utf8");
}

async function pathExists(relPath) {
  try {
    await fs.access(toAbsolute(relPath));
    return true;
  } catch {
    return false;
  }
}

function parseFrontmatterStatus(text) {
  if (!text.startsWith("---")) {
    return null;
  }

  const parts = text.split("---", 3);
  if (parts.length < 3) {
    return null;
  }

  for (const line of parts[1].split("\n")) {
    if (line.toLowerCase().startsWith("status:")) {
      return line.split(":", 2)[1].trim();
    }
  }

  return null;
}

async function validateRegistry(registry, errors) {
  if (!registry.meta || typeof registry.meta !== "object") {
    errors.push("Registry is missing meta information");
  }

  if (!registry.analysisEntry || typeof registry.analysisEntry !== "object") {
    errors.push("Registry is missing analysisEntry");
    return;
  }

  for (const section of requiredSections) {
    if (!Array.isArray(registry[section])) {
      errors.push(`Registry section must be an array: ${section}`);
    }
  }

  const pluginConfigEntries = Array.isArray(registry.pluginConfigs) ? registry.pluginConfigs : [];
  const allEntries = [registry.analysisEntry, ...requiredSections.flatMap((section) => registry[section] ?? []), ...pluginConfigEntries];

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

    if (entry === registry.analysisEntry && entry.status === "active") {
      activeAnalysisEntries += 1;
    }

    if (entry.kind === "skill" && entry.status === "active" && !entry.path.startsWith(".github/skills/")) {
      errors.push(`Active skill must live in .github/skills/: ${entry.path}`);
    }

    if (entry.kind === "skill" && entry.status === "adapter" && (!entry.replacement || !entry.replacement.startsWith(".github/skills/"))) {
      errors.push(`Adapter skill must map to a canonical .github/skills entry: ${entry.path}`);
    }

    if (entry.kind === "agent" && entry.path.startsWith(".github/agents/") && entry.status === "active" && !activeGithubAgents.has(entry.path)) {
      errors.push(`Non-canonical GitHub agent is marked active: ${entry.path}`);
    }

    if ((entry.kind === "mode" || entry.kind === "legacy-chatmode") && entry.status === "active") {
      errors.push(`Legacy mode/chatmode cannot be active: ${entry.path}`);
    }
  }

  if (activeAnalysisEntries !== 1) {
    errors.push(`Exactly one active analysisEntry is required, found ${activeAnalysisEntries}`);
  }
}

async function validatePromptStates(registry, errors) {
  for (const prompt of registry.prompts ?? []) {
    const text = await readText(prompt.path);
    const status = parseFrontmatterStatus(text);
    if (prompt.status === "active" && status !== "ACTIVE") {
      errors.push(`Active prompt must have frontmatter status ACTIVE: ${prompt.path}`);
    }
    if (prompt.status === "deprecated" && status !== "DEPRECATED") {
      errors.push(`Deprecated prompt must have frontmatter status DEPRECATED: ${prompt.path}`);
    }
  }

  for (const legacy of registry.legacy ?? []) {
    if (!legacy.path.endsWith(".yaml")) {
      continue;
    }
    const text = await readText(legacy.path);
    if (!text.includes("status: DEPRECATED")) {
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
    ".github/instructions/core/analysis-planning.instructions.md",
    ".github/chatmodes/general/AnalysePlanung_DE.chatmode.md",
    ".github/agents/task-planner.agent.md",
    ".claude/prompts/PROMPT_ANALYSE.md"
  ]) {
    const content = await readText(relPath);
    if (!content.includes(requiredIssueQuery)) {
      errors.push(`${relPath} must mention the canonical GitHub issue query`);
    }
  }

  const mcpDoc = await readText("docs/MCP-SERVERS-OVERVIEW.md");
  if (!mcpDoc.includes("@modelcontextprotocol/server-sequential-thinking")) {
    errors.push("docs/MCP-SERVERS-OVERVIEW.md must document the real sequential-thinking MCP server");
  }

  if (!mcpDoc.includes(".github/instructions/core/analysis-planning.instructions.md")) {
    errors.push("docs/MCP-SERVERS-OVERVIEW.md must mention analysis-planning.instructions.md");
  }
}

async function validateMigrationFiles(errors) {
  const migrationMapText = await readText(".github/prompts/MIGRATION_MAP.json");
  if (migrationMapText.includes("TBD")) {
    errors.push(".github/prompts/MIGRATION_MAP.json must not contain unresolved TBD entries");
  }

  const migrationDoc = await readText(".github/prompts/MIGRATION.md");
  if (!migrationDoc.includes(".github/ai-registry.json")) {
    errors.push(".github/prompts/MIGRATION.md must mention .github/ai-registry.json");
  }
}

async function validatePluginMetadata(errors) {
  const pluginFiles = jsonFiles.filter((entry) => entry.endsWith("plugin.json"));
  for (const relPath of pluginFiles) {
    const plugin = JSON.parse(await readText(relPath));
    for (const key of ["exposesAgents", "exposesSkills", "mapsToRoles", "analysisCapable", "sourceOfTruth"]) {
      if (!(key in plugin)) {
        errors.push(`Plugin metadata missing "${key}" in ${relPath}`);
      }
    }
    if (plugin.sourceOfTruth !== ".github/ai-registry.json") {
      errors.push(`Plugin sourceOfTruth must point to .github/ai-registry.json in ${relPath}`);
    }
  }
}

async function validateMcpConfiguration(errors) {
  const mcpConfig = JSON.parse(await readText("mcp.json"));
  const sequentialThinking = mcpConfig?.mcpServers?.["sequential-thinking"];
  if (!sequentialThinking) {
    errors.push("mcp.json must define sequential-thinking");
    return;
  }
  const args = JSON.stringify(sequentialThinking.args ?? []);
  if (!args.includes("@modelcontextprotocol/server-sequential-thinking")) {
    errors.push("mcp.json must use the official sequential-thinking MCP server");
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
  await validatePromptStates(registry, errors);
  await validateDocs(errors);
  await validateMigrationFiles(errors);
  await validatePluginMetadata(errors);
  await validateMcpConfiguration(errors);

  try {
    const workspace = JSON.parse(await readText("menschlichkeit-oesterreich.code-workspace"));
    const folderPath = workspace.folders?.[0]?.path;
    if (folderPath !== ".") {
      errors.push("Workspace file must point to '.' as the primary folder");
    }
  } catch {
    errors.push("Unable to validate workspace file");
  }

  if (await pathExists("menschlichkeit-oesterreich-development.code-workspace")) {
    errors.push("Legacy workspace file should not remain in the repo root");
  }

  if (errors.length > 0) {
    console.error("AI governance validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("AI governance validation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
