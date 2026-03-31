#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const activeFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  ".github/copilot-instructions.md",
  ".github/instructions/copilot-workflow.md",
  ".github/prompts/README.md",
  ".github/chatmodes/README.md",
  ".github/agents/task-planner.agent.md",
  ".github/instructions/core/project-development.instructions.md",
  ".github/instructions/core/documentation.instructions.md",
  ".github/instructions/core/figma-mcp.instructions.md",
  ".github/chatmodes/development/MCPAPIDesign_DE.chatmode.md",
  ".github/chatmodes/operations/MCPPerformanceOptimierung_DE.chatmode.md",
  ".github/chatmodes/general/MCPDesignSystemSync_DE.chatmode.md",
  ".github/chatmodes/general/README_DE.chatmode.md",
  ".github/prompts/MCPFeatureImplementation_DE.prompt.md",
  ".github/prompts/TestGeneration_DE.prompt.md",
  ".claude/launch.json",
  ".claude/prompts/PROMPT_BACKEND.md",
  ".claude/prompts/PROMPT_GAME.md",
  ".claude/plugins/menschlichkeit-dev-suite/hooks/session-start.js",
  ".claude/plugins/menschlichkeit-dev-suite/agents/accessibility-expert.md",
  ".claude/plugins/menschlichkeit-dev-suite/agents/security-officer.md",
  ".claude/plugins/menschlichkeit-dev-suite/agents/menschlichkeit-architect.md",
  ".claude/plugins/menschlichkeit-dev-suite/skills/democracy-game-dev/SKILL.md",
  ".claude/plugins/menschlichkeit-dev-suite/skills/transparency-audit/SKILL.md",
  ".claude/plugins/moe-ops/agents/ops-engineer.md",
  ".claude/plugins/moe-ops/commands/services.md",
  ".claude/plugins/moe-ops/skills/quality-gate/SKILL.md",
  ".claude/plugins/moe-qa/skills/a11y-audit/SKILL.md",
  ".vscode/settings.json",
  ".vscode/launch.json",
  ".vscode/tasks.json",
  ".vscode/extensions.json",
  ".vscode/mcp.json",
  "menschlichkeit-oesterreich.code-workspace",
  "package.json"
];

const requiredPaths = [
  ".github/instructions/core/project-development.instructions.md",
  ".github/instructions/core/documentation.instructions.md",
  ".github/instructions/core/dsgvo-compliance.instructions.md",
  ".github/instructions/core/quality-gates.instructions.md",
  ".github/instructions/core/plesk-deployment.instructions.md",
  ".github/instructions/core/mcp-integration.instructions.md",
  ".github/chatmodes/general/Architekturplan_DE.chatmode.md",
  ".github/chatmodes/general/CodeReview_DE.chatmode.md",
  ".github/chatmodes/general/SicherheitsAudit_DE.chatmode.md",
  ".github/chatmodes/general/BarrierefreiheitAudit_DE.chatmode.md",
  ".github/chatmodes/general/PerformanceOptimierung_DE.chatmode.md",
  ".github/chatmodes/development/MCPCodeReview_DE.chatmode.md",
  ".github/chatmodes/development/MCPAPIDesign_DE.chatmode.md",
  ".github/prompts/Architekturplan_DE.prompt.md",
  ".github/prompts/MCPFeatureImplementation_DE.prompt.md",
  ".github/prompts/MCPMultiServiceDeployment_DE.prompt.md",
  ".github/prompts/CIPipeline_DE.prompt.md",
  ".github/prompts/SicherheitsAudit_DE.prompt.md",
  ".github/prompts/TestGeneration_DE.prompt.md",
  ".github/agents/devops-expert.agent.md",
  ".github/agents/mentor.agent.md",
  ".claude/agents/security-reviewer.md",
  ".claude/agents/github-auditor.md",
  ".claude/agents/infrastructure-hardener.md",
  ".claude/plugins/moe-brand/agents/brand-designer.md",
  ".claude/plugins/moe-brand/agents/brand-reviewer.md",
  "openclaw-system/configs/agent_roles.yaml"
];

const jsonFiles = [
  ".vscode/settings.json",
  ".vscode/launch.json",
  ".vscode/tasks.json",
  ".vscode/extensions.json",
  ".vscode/mcp.json",
  ".claude/launch.json",
  "menschlichkeit-oesterreich.code-workspace",
  "package.json"
];

const bannedPatterns = [
  { label: "old repo name", regex: /menschlichkeit-oesterreich-development/g },
  { label: "legacy frontend path", regex: /\bfrontend\//g },
  { label: "legacy API path", regex: /\bapi\.menschlichkeit-oesterreich\.at\b/g },
  { label: "legacy game path", regex: /\bapps\/game\b/g },
  { label: "old games port", regex: /\bPort 3000\b|\b3000\s*\|\s*Games\b/g },
  { label: "old develop workflow", regex: /PRs?\s+auf\s+`?develop`?|PR back to `?develop`?/gi }
];

function toAbsolute(relPath) {
  return path.join(root, relPath);
}

async function readText(relPath) {
  return fs.readFile(toAbsolute(relPath), "utf8");
}

async function assertExists(relPath, errors) {
  try {
    await fs.access(toAbsolute(relPath));
  } catch {
    errors.push(`Missing required path: ${relPath}`);
  }
}

async function main() {
  const errors = [];

  for (const relPath of activeFiles) {
    await assertExists(relPath, errors);
  }

  for (const relPath of requiredPaths) {
    await assertExists(relPath, errors);
  }

  for (const relPath of jsonFiles) {
    try {
      JSON.parse(await readText(relPath));
    } catch (error) {
      errors.push(`Invalid JSON in ${relPath}: ${error.message}`);
    }
  }

  for (const relPath of activeFiles) {
    try {
      const content = await readText(relPath);
      for (const rule of bannedPatterns) {
        if (rule.regex.test(content)) {
          errors.push(`Banned pattern "${rule.label}" found in ${relPath}`);
        }
      }
    } catch {
      // existence handled separately
    }
  }

  try {
    const canonical = await readText("AGENTS.md");
    const mustMention = [
      "Codex",
      "Claude Code",
      "GitHub Copilot",
      ".github/chatmodes",
      ".github/prompts/chatmodes",
      "openclaw-system/configs/agent_roles.yaml"
    ];
    for (const snippet of mustMention) {
      if (!canonical.includes(snippet)) {
        errors.push(`AGENTS.md must mention: ${snippet}`);
      }
    }
  } catch {
    // handled above
  }

  try {
    const compatContent = await readText("agents.md");
    if (!compatContent.includes("AGENTS.md")) {
      errors.push("agents.md compatibility path must point to AGENTS.md");
    }
  } catch {
    // Windows checkouts cannot host a second file that differs only by case.
  }

  try {
    const workspaceFile = await readText("menschlichkeit-oesterreich.code-workspace");
    const workspace = JSON.parse(workspaceFile);
    const folderPath = workspace.folders?.[0]?.path;
    if (folderPath !== ".") {
      errors.push("Workspace file must point to '.' as the primary folder");
    }
  } catch {
    // handled above
  }

  try {
    await fs.access(toAbsolute("menschlichkeit-oesterreich-development.code-workspace"));
    errors.push("Legacy workspace file should not remain in the repo root");
  } catch {
    // expected
  }

  try {
    const promptYamlDir = await fs.readdir(toAbsolute(".github/prompts/chatmodes"));
    for (const entry of promptYamlDir) {
      if (!entry.endsWith(".yaml")) {
        continue;
      }
      const relPath = `.github/prompts/chatmodes/${entry}`;
      const content = await readText(relPath);
      if (!content.includes("status: DEPRECATED")) {
        errors.push(`Legacy chatmode YAML must stay marked as DEPRECATED: ${relPath}`);
      }
    }
  } catch (error) {
    errors.push(`Unable to inspect legacy chatmode YAML files: ${error.message}`);
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
