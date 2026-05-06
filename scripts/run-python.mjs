#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

function findWorkspacePython(startDir) {
  let current = startDir;
  const relativePython =
    process.platform === 'win32' ? ['.venv', 'Scripts', 'python.exe'] : ['.venv', 'bin', 'python'];

  while (true) {
    const candidate = path.join(current, ...relativePython);
    if (existsSync(candidate)) {
      return candidate;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

const forwardedArgs = process.argv.slice(2);
const workspacePython = findWorkspacePython(process.cwd());
const venvPython = process.env.VIRTUAL_ENV
  ? path.join(
      process.env.VIRTUAL_ENV,
      ...(process.platform === 'win32' ? ['Scripts', 'python.exe'] : ['bin', 'python'])
    )
  : null;

const candidates = [
  workspacePython ? { cmd: workspacePython, args: forwardedArgs, label: 'workspace .venv' } : null,
  venvPython && existsSync(venvPython)
    ? { cmd: venvPython, args: forwardedArgs, label: 'VIRTUAL_ENV' }
    : null,
  process.platform === 'win32'
    ? { cmd: 'py', args: ['-3', ...forwardedArgs], label: 'py -3' }
    : null,
  { cmd: 'python3', args: forwardedArgs, label: 'python3' },
  { cmd: 'python', args: forwardedArgs, label: 'python' },
].filter(Boolean);

function runCandidate(index) {
  if (index >= candidates.length) {
    console.error(
      'Kein nutzbarer Python-Interpreter gefunden. Erwartet wurde .venv, python3 oder python.'
    );
    process.exit(1);
  }

  const candidate = candidates[index];
  const child = spawn(candidate.cmd, candidate.args, {
    stdio: 'inherit',
    shell: false,
  });

  child.on('error', error => {
    if (error.code === 'ENOENT') {
      runCandidate(index + 1);
      return;
    }
    console.error(`Python-Start fehlgeschlagen (${candidate.label}): ${error.message}`);
    process.exit(1);
  });

  child.on('exit', code => {
    if ((code === 9009 || code === 127) && index + 1 < candidates.length) {
      runCandidate(index + 1);
      return;
    }
    process.exit(code ?? 1);
  });
}

runCandidate(0);
