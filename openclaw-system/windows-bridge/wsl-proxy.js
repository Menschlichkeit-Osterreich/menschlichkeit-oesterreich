const http = require('http');
const httpProxy = require('http-proxy');
const { execFile } = require('child_process');
const path = require('path');

const PROXY_PORT = Number(process.env.OPENCLAW_BRIDGE_PORT || 18790);
const WSL_DISTRO = process.env.OPENCLAW_WSL_DISTRO || 'Ubuntu';
const START_STACK_SCRIPT = path.join(__dirname, 'scripts', 'Start-Stack.ps1');
const TARGETS = {
  AGENT_RUNTIME: process.env.OPENCLAW_AGENT_RUNTIME_URL || 'http://127.0.0.1:9100',
  TOOL_GATEWAY: process.env.OPENCLAW_TOOL_GATEWAY_URL || 'http://127.0.0.1:9101',
};

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  xfwd: true,
});

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { windowsHide: true, maxBuffer: 1024 * 1024, ...options }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error((stderr || stdout || error.message).trim()));
        return;
      }
      resolve({
        stdout: (stdout || '').trim(),
        stderr: (stderr || '').trim(),
      });
    });
  });
}

async function getWslStatus() {
  const { stdout } = await runCommand('wsl.exe', [
    '-d',
    WSL_DISTRO,
    '--',
    'sh',
    '-lc',
    "docker ps --format '{{.Names}}|{{.Status}}'",
  ]);

  const containers = stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [name, status] = line.split('|');
      return { name, status };
    });

  return { distro: WSL_DISTRO, containers };
}

async function startStack() {
  if (process.platform !== 'win32') {
    throw new Error('Stack-Start ueber PowerShell ist nur unter Windows verfuegbar.');
  }

  const { stdout, stderr } = await runCommand(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', START_STACK_SCRIPT],
    { timeout: 10 * 60 * 1000 }
  );

  return { stdout, stderr };
}

function proxyRequest(req, res, target, prefix, serviceName) {
  const originalUrl = req.url || '/';
  const rewrittenUrl = originalUrl.replace(prefix, '') || '/';
  req.url = rewrittenUrl.startsWith('/') ? rewrittenUrl : `/${rewrittenUrl}`;
  console.log(`[PROXY] >> ${serviceName}: ${req.method} ${originalUrl} -> ${req.url}`);
  proxy.web(req, res, { target }, (error) => {
    console.error(`[PROXY] ${serviceName} Error:`, error.message);
    writeJson(res, 502, { error: `${serviceName} not reachable`, target });
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url || '/';

  if (url === '/health') {
    writeJson(res, 200, {
      status: 'ok',
      bridge: 'openclaw-windows-bridge',
      port: PROXY_PORT,
      wslDistro: WSL_DISTRO,
      targets: TARGETS,
      routes: ['/health', '/agent/*', '/tools/*', '/wsl/status', '/wsl/start-stack'],
    });
    return;
  }

  if (url.startsWith('/agent/')) {
    proxyRequest(req, res, TARGETS.AGENT_RUNTIME, '/agent', 'Agent Runtime');
    return;
  }

  if (url.startsWith('/tools/')) {
    proxyRequest(req, res, TARGETS.TOOL_GATEWAY, '/tools', 'Tool Gateway');
    return;
  }

  if (url === '/wsl/status' && req.method === 'GET') {
    try {
      const status = await getWslStatus();
      writeJson(res, 200, { status: 'ok', ...status });
    } catch (error) {
      writeJson(res, 500, { status: 'error', message: error.message });
    }
    return;
  }

  if (url === '/wsl/start-stack' && req.method === 'POST') {
    try {
      const result = await startStack();
      writeJson(res, 202, { status: 'started', ...result });
    } catch (error) {
      writeJson(res, 500, { status: 'error', message: error.message });
    }
    return;
  }

  console.log(`[PROXY] 404 Not Found: ${req.method} ${url}`);
  writeJson(res, 404, {
    error: 'Endpoint not found. Use /health, /agent/*, /tools/*, /wsl/status or /wsl/start-stack.',
  });
});

console.log('\n=========================================');
console.log('  OpenClaw WSL2 Bridge is running!');
console.log('=========================================');
console.log(`  Proxy Port:    ${PROXY_PORT}`);
console.log(`  Agent Runtime: -> ${TARGETS.AGENT_RUNTIME}`);
console.log(`  Tool Gateway:  -> ${TARGETS.TOOL_GATEWAY}`);
console.log(`  WSL Distro:    ${WSL_DISTRO}`);
console.log('\nListening for requests...');

server.listen(PROXY_PORT, '127.0.0.1');
