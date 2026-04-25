#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const root = process.cwd();

const filesToValidate = [
  '.vscode/tasks.json',
  '.vscode/extensions.json',
  '.vscode/settings.json',
  '.devcontainer/devcontainer.json',
  '.claude/launch.json',
  'mcp.json',
  '.vscode/mcp.json',
  'menschlichkeit-oesterreich.code-workspace',
  'package.json',
];

const governanceDocs = ['AGENTS.md', 'CLAUDE.md', '.github/copilot-instructions.md'];

const stalePathPatterns = [
  /E:\\Menschlichkeit-Osterreich\\menschlichkeit-oesterreich/gi,
  /C:\\Users\\[^\\\s]+/gi,
  /\/home\//gi,
];

const openClawBridgePatterns = [
  /openclawd-win-bridge/gi,
  /E:\\openclaw[d]?/gi,
  /E:\\openwolf/gi,
];

const activeOpenClawTerms = /openclaw|openwolf|open claw|open wolf/gi;

const activeConfigPrefixes = ['.vscode/', '.devcontainer/', '.claude/', '.github/workflows/', '.github/actions/'];

const activeConfigFiles = ['package.json', 'mcp.json', '.vscode/mcp.json'];

const forbiddenPathPatterns = [/(^|[^$])\b[A-Za-z]:\\/g, /\/home\//g];

const forbiddenSecretPatterns = [
  /ghp_[A-Za-z0-9]{20,}/g,
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  /\bsk_live_[A-Za-z0-9]+/g,
  /\bAIza[0-9A-Za-z\-_]{35}\b/g,
];

const servicePorts = [5173, 8000, 8001, 3001, 8002];

const warnings = [];
const errors = [];
const hardStops = [];

function rel(p) {
  return p.replaceAll('\\', '/');
}

function addWarning(code, file, message) {
  warnings.push({ code, file, message });
}

function addError(code, file, message) {
  errors.push({ code, file, message });
}

function addHardStop(code, file, message) {
  hardStops.push({ code, file, message });
}

async function readMaybeJson(file) {
  const abs = path.join(root, file);
  try {
    const raw = await fs.readFile(abs, 'utf8');
    const parsed = JSON.parse(raw);
    return { exists: true, raw, parsed };
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      addWarning('MISSING_FILE', file, 'File not found; skipped.');
      return { exists: false, raw: '', parsed: null };
    }
    addError('JSON_PARSE', file, `Invalid JSON: ${error.message}`);
    return { exists: true, raw: '', parsed: null };
  }
}

async function readMaybeText(file) {
  const abs = path.join(root, file);
  try {
    const raw = await fs.readFile(abs, 'utf8');
    return { exists: true, raw };
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      addWarning('MISSING_FILE', file, 'File not found; skipped.');
      return { exists: false, raw: '' };
    }
    addError('READ_FAIL', file, error.message);
    return { exists: false, raw: '' };
  }
}

function scanForSecrets(file, raw) {
  for (const pattern of forbiddenSecretPatterns) {
    if (pattern.test(raw)) {
      addHardStop('SECRET_LITERAL', file, `Potential secret literal detected (${pattern}).`);
      return;
    }
  }
}

function scanForForbiddenPaths(file, raw) {
  for (const pattern of forbiddenPathPatterns) {
    if (pattern.test(raw)) {
      addError('ABSOLUTE_PATH', file, `Forbidden absolute path detected (${pattern}).`);
    }
  }
}

function scanForOpenClawBridgePaths(file, raw) {
  for (const pattern of openClawBridgePatterns) {
    if (pattern.test(raw)) {
      addError(
        'OPENCLAW_BRIDGE_PATH',
        file,
        `Personal OpenClaw/OpenWolf bridge path detected (${pattern}).`
      );
    }
  }
}

async function getTrackedFiles() {
  try {
    const { stdout } = await execFileAsync('git', ['ls-files', '-z'], { cwd: root, maxBuffer: 10 * 1024 * 1024 });
    return stdout
      .split('\u0000')
      .map(item => item.trim())
      .filter(Boolean)
      .map(rel);
  } catch (error) {
    addWarning('GIT_LS_FILES_FAILED', 'scripts/validate-workspace-config.mjs', error.message);
    return [];
  }
}

function isActiveConfigContext(file) {
  if (activeConfigFiles.includes(file)) {
    return true;
  }
  if (file.endsWith('.code-workspace')) {
    return true;
  }
  return activeConfigPrefixes.some(prefix => file.startsWith(prefix));
}

async function checkGovernanceDocs() {
  for (const file of governanceDocs) {
    const { exists, raw } = await readMaybeText(file);
    if (!exists) {
      continue;
    }
    for (const pattern of stalePathPatterns) {
      if (pattern.test(raw)) {
        addError('STALE_ROOT_PATH', file, `Stale hardcoded root path found (${pattern}).`);
      }
    }
  }
}

async function checkPackageAndTasks(packageData, taskData) {
  const pkgScripts = packageData?.scripts ?? {};

  if (!('workspace:config:check' in pkgScripts)) {
    addError('MISSING_SCRIPT', 'package.json', 'Missing script workspace:config:check.');
  }
  if (!('governance:workspace' in pkgScripts)) {
    addError('MISSING_SCRIPT', 'package.json', 'Missing script governance:workspace.');
  }

  for (const scriptName of Object.keys(pkgScripts)) {
    if (/^openclaw:|^openwolf:/i.test(scriptName)) {
      addError(
        'OPENCLAW_PACKAGE_SCRIPT',
        'package.json',
        `Deprecated script namespace detected: '${scriptName}'.`
      );
    }
  }

  if (!taskData) {
    return;
  }

  if (taskData.options?.shell) {
    addError('GLOBAL_SHELL', '.vscode/tasks.json', 'Top-level options.shell is not allowed.');
  }

  const tasks = Array.isArray(taskData.tasks) ? taskData.tasks : [];
  const labels = new Set(tasks.map(task => task.label).filter(Boolean));

  for (const task of tasks) {
    const file = '.vscode/tasks.json';
    const label = task.label || '<unnamed-task>';

    if (typeof task.command === 'string') {
      if (/quality-reports\//.test(task.command.replaceAll('\\', '/'))) {
        addError(
          'QUALITY_REPORTS_TASK_SOURCE',
          file,
          `${label}: command references quality-reports path.`
        );
      }
      if (/^[A-Za-z]:\\/.test(task.command) || /^\//.test(task.command)) {
        addError('ABSOLUTE_TASK_COMMAND', file, `${label}: command uses absolute path.`);
      }
      if (/\$\{workspaceFolder\}python\.exe/i.test(task.command)) {
        addError(
          'BROKEN_WORKSPACE_PYTHON_PATH',
          file,
          `${label}: invalid workspaceFolder python.exe path.`
        );
      }
    }

    if (Array.isArray(task.args)) {
      for (const arg of task.args) {
        if (typeof arg !== 'string') {
          continue;
        }
        const normalized = arg.replaceAll('\\', '/');

        if (normalized.includes('quality-reports/')) {
          addError(
            'QUALITY_REPORTS_TASK_SOURCE',
            file,
            `${label}: args reference quality-reports path.`
          );
        }
        if (/^[A-Za-z]:\//.test(normalized) || arg.startsWith('/')) {
          addError('ABSOLUTE_TASK_ARG', file, `${label}: args contain absolute path (${arg}).`);
        }
      }
    }

    const dependsOn = Array.isArray(task.dependsOn)
      ? task.dependsOn
      : task.dependsOn
        ? [task.dependsOn]
        : [];

    for (const dep of dependsOn) {
      if (typeof dep === 'string' && !labels.has(dep)) {
        addError(
          'TASK_DEPENDS_ON_MISSING',
          file,
          `${label}: dependsOn references unknown task '${dep}'.`
        );
      }
    }

    if (task.options?.cwd && typeof task.options.cwd === 'string') {
      const cwdRaw = task.options.cwd;
      const resolved = cwdRaw.replaceAll('${workspaceFolder}', root);
      const absolute = path.isAbsolute(resolved) ? resolved : path.join(root, resolved);
      try {
        await fs.access(absolute);
      } catch {
        addError('TASK_CWD_MISSING', file, `${label}: options.cwd does not exist (${cwdRaw}).`);
      }
    }

    if (
      typeof task.command === 'string' &&
      task.command.toLowerCase() === 'pwsh' &&
      task.group &&
      typeof task.group === 'object' &&
      task.group.isDefault === true
    ) {
      addWarning(
        'DEFAULT_PWSH_TASK',
        file,
        `${label}: PowerShell task is default; verify this is intended.`
      );
    }

    if (
      typeof task.command === 'string' &&
      task.command.toLowerCase() === 'npm' &&
      Array.isArray(task.args) &&
      task.args[0] === 'run' &&
      typeof task.args[1] === 'string'
    ) {
      if (!(task.args[1] in pkgScripts)) {
        addError(
          'TASK_SCRIPT_MISSING',
          file,
          `${label}: npm script '${task.args[1]}' not found in package.json.`
        );
      }
    }
  }
}

function checkExtensions(extensionsData, editorConfigExists) {
  if (!extensionsData) {
    return;
  }

  const file = '.vscode/extensions.json';
  const recommendations = Array.isArray(extensionsData.recommendations)
    ? extensionsData.recommendations
    : [];

  const recSet = new Set(recommendations);

  if (recSet.has('ms-eslint.vscode-eslint')) {
    addError(
      'WRONG_ESLINT_EXTENSION',
      file,
      'Use dbaeumer.vscode-eslint instead of ms-eslint.vscode-eslint.'
    );
  }

  if (!editorConfigExists && recSet.has('EditorConfig.EditorConfig')) {
    addWarning(
      'EDITORCONFIG_WITHOUT_FILE',
      file,
      'EditorConfig extension is recommended but no .editorconfig file was found in the repository.'
    );
  }
}

function checkDevcontainer(devcontainerData, docsAiInstructionsExists) {
  if (!devcontainerData) {
    return;
  }

  const file = '.devcontainer/devcontainer.json';
  const settings = devcontainerData.customizations?.vscode?.settings ?? {};

  if ('python.linting.enabled' in settings || 'python.linting.pylintEnabled' in settings) {
    addError(
      'DEPRECATED_PYTHON_LINTING_SETTINGS',
      file,
      'Deprecated python.linting settings are present.'
    );
  }

  const extensions = devcontainerData.customizations?.vscode?.extensions;
  if (Array.isArray(extensions) && extensions.includes('ms-eslint.vscode-eslint')) {
    addError(
      'WRONG_ESLINT_EXTENSION',
      file,
      'Use dbaeumer.vscode-eslint in devcontainer extensions.'
    );
  }

  const forwardPorts = Array.isArray(devcontainerData.forwardPorts)
    ? devcontainerData.forwardPorts
    : [];
  for (const expectedPort of servicePorts) {
    if (!forwardPorts.includes(expectedPort)) {
      addError('MISSING_FORWARD_PORT', file, `Missing forward port ${expectedPort}.`);
    }
  }

  if (forwardPorts.includes(3000) && !forwardPorts.includes(3001)) {
    addWarning(
      'LEGACY_GAMES_PORT',
      file,
      'Port 3000 present without 3001; verify games port mapping.'
    );
  }

  const chatLocations = settings['chat.instructionsFilesLocations'];
  if (chatLocations && typeof chatLocations === 'object') {
    const hasLower = Object.prototype.hasOwnProperty.call(chatLocations, 'docs/ai-instructions');
    if (hasLower && docsAiInstructionsExists) {
      addError(
        'INSTRUCTION_PATH_CASE',
        file,
        'Use docs/AI-INSTRUCTIONS (correct case) in chat.instructionsFilesLocations.'
      );
    }
  }

  const postCreate = devcontainerData.postCreateCommand;
  if (typeof postCreate === 'string') {
    const scriptPath = path.join(root, 'scripts', 'dev', 'codespace-ssh-setup.sh');
    if (
      postCreate.includes('scripts/dev/codespace-ssh-setup.sh') &&
      !postCreate.includes('if [ -f')
    ) {
      try {
        void scriptPath;
        addWarning(
          'POSTCREATE_NOT_DEFENSIVE',
          file,
          'postCreateCommand calls scripts/dev/codespace-ssh-setup.sh without an existence guard.'
        );
      } catch {
        // no-op
      }
    }
  }
}

async function checkMcp(repoMcpData) {
  if (!repoMcpData) {
    return;
  }

  const file = 'mcp.json';
  const servers = repoMcpData.mcpServers ?? {};

  for (const [name, config] of Object.entries(servers)) {
    if (Array.isArray(config?.args)) {
      for (const arg of config.args) {
        if (typeof arg === 'string' && /@latest\b/i.test(arg)) {
          addWarning('MCP_LATEST_TAG', file, `${name}: '${arg}' uses @latest.`);
        }
      }

      if (config.command === 'node' && typeof config.args[0] === 'string') {
        const entry = config.args[0].replaceAll('${workspaceFolder}', root);
        const absolute = path.isAbsolute(entry) ? entry : path.join(root, entry);
        try {
          await fs.access(absolute);
        } catch {
          addError(
            'MCP_ENTRY_MISSING',
            file,
            `${name}: entry file not found (${rel(path.relative(root, absolute))}).`
          );
        }
      }
    }

    if (config?.env && typeof config.env === 'object') {
      for (const [envKey, envValue] of Object.entries(config.env)) {
        if (typeof envValue !== 'string') {
          continue;
        }
        scanForSecrets(file, envValue);

        const isPlaceholder = envValue.includes('${');
        if (!isPlaceholder && /(TOKEN|SECRET|PASSWORD|KEY)/i.test(envKey)) {
          addHardStop(
            'MCP_SECRET_LITERAL',
            file,
            `${name}: env.${envKey} should be placeholder-based, not a literal value.`
          );
        }
      }
    }
  }
}

async function checkTrackedHelperFilesAndActiveContexts() {
  const tracked = await getTrackedFiles();

  for (const file of tracked) {
    if (file.includes('/.claude-dev-helper/')) {
      addError(
        'TRACKED_CLAUDE_HELPER_FILE',
        file,
        'Tracked local Claude helper state is not allowed. Remove via git rm and keep ignored.'
      );
    }
  }

  for (const file of tracked) {
    if (!isActiveConfigContext(file)) {
      continue;
    }

    const abs = path.join(root, file);
    let raw = '';
    try {
      raw = await fs.readFile(abs, 'utf8');
    } catch {
      continue;
    }

    if (activeOpenClawTerms.test(raw)) {
      addError(
        'OPENCLAW_ACTIVE_CONTEXT',
        file,
        'OpenClaw/OpenWolf reference detected in active configuration context.'
      );
    }

    scanForOpenClawBridgePaths(file, raw);
  }
}

function printFindings() {
  const printGroup = (title, list) => {
    if (list.length === 0) {
      return;
    }
    console.log(`\n${title} (${list.length})`);
    for (const item of list) {
      console.log(`- [${item.code}] ${item.file}: ${item.message}`);
    }
  };

  printGroup('WARNINGS', warnings);
  printGroup('ERRORS', errors);
  printGroup('HARD STOPS', hardStops);

  const summary = {
    warnings: warnings.length,
    errors: errors.length,
    hardStops: hardStops.length,
  };

  console.log('\nSummary:', JSON.stringify(summary));
}

async function main() {
  for (const file of filesToValidate) {
    const { exists, raw } = await readMaybeText(file);
    if (!exists) {
      continue;
    }
    scanForSecrets(file, raw);
    scanForForbiddenPaths(file, raw);
    scanForOpenClawBridgePaths(file, raw);
    await readMaybeJson(file);
  }

  const packageJson = await readMaybeJson('package.json');
  const tasksJson = await readMaybeJson('.vscode/tasks.json');
  const extensionsJson = await readMaybeJson('.vscode/extensions.json');
  const devcontainerJson = await readMaybeJson('.devcontainer/devcontainer.json');
  const mcpJson = await readMaybeJson('mcp.json');

  const editorConfigMatches = await fs
    .readdir(root, { withFileTypes: true })
    .then(entries => entries.some(entry => entry.isFile() && entry.name === '.editorconfig'))
    .catch(() => false);

  const docsAiInstructionsExists = await fs
    .access(path.join(root, 'docs', 'AI-INSTRUCTIONS'))
    .then(() => true)
    .catch(() => false);

  await checkGovernanceDocs();
  await checkPackageAndTasks(packageJson.parsed, tasksJson.parsed);
  checkExtensions(extensionsJson.parsed, editorConfigMatches);
  checkDevcontainer(devcontainerJson.parsed, docsAiInstructionsExists);
  await checkMcp(mcpJson.parsed);
  await checkTrackedHelperFilesAndActiveContexts();

  printFindings();

  if (hardStops.length > 0) {
    process.exit(2);
  }
  if (errors.length > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch(error => {
  console.error('[workspace-config-check] fatal:', error);
  process.exit(2);
});
