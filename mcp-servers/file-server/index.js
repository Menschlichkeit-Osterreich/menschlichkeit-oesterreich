#!/usr/bin/env node

/**
 * MCP File Server für Menschlichkeit Österreich
 * Bietet Dateizugriff für alle Services im Multi-Service Setup
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs').promises;
const fssync = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class FileServerMCP {
  constructor() {
    this.server = new Server(
      {
        name: 'menschlichkeit-file-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.projectRoot = process.env.PROJECT_ROOT || process.cwd();
    this.maxFileBytes = Number(process.env.MCP_FS_MAX_FILE_BYTES || 262144); // 256 KiB default
    this.allowedServices = new Set(['api', 'crm', 'frontend', 'games', 'website', 'n8n', 'root']);
    this.opaPolicyPath = process.env.MCP_OPA_POLICY || path.join(__dirname, '..', 'policies', 'opa', 'tool-io.rego');
    this._opaAvailable = undefined;
    // Simple token bucket: limit N requests per interval
    const rateLimit = Number(process.env.MCP_RATE_LIMIT || 30); // ops per interval
    const intervalMs = Number(process.env.MCP_RATE_INTERVAL_MS || 10000); // 10s
    this.rateLimiter = new TokenBucket(rateLimit, intervalMs);
    // Circuit breakers per operation
    this.cbRead = new CircuitBreaker({ threshold: 5, cooldownMs: 60000, halfOpenPass: 2 });
    this.cbList = new CircuitBreaker({ threshold: 5, cooldownMs: 60000, halfOpenPass: 2 });
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'read_multi_service_file',
            description: 'Read files from any service directory (API, CRM, Frontend, Games, n8n)',
            inputSchema: {
              type: 'object',
              properties: {
                service: {
                  type: 'string',
                  enum: ['api', 'crm', 'frontend', 'games', 'website', 'n8n', 'root'],
                  description: 'Service directory to read from',
                },
                filePath: {
                  type: 'string',
                  description: 'Relative path within the service directory',
                },
              },
              required: ['service', 'filePath'],
            },
          },
          {
            name: 'list_service_files',
            description: 'List files and directories in a service',
            inputSchema: {
              type: 'object',
              properties: {
                service: {
                  type: 'string',
                  enum: ['api', 'crm', 'frontend', 'games', 'website', 'n8n', 'root'],
                },
                directory: {
                  type: 'string',
                  description: 'Directory path within service (optional)',
                  default: '.',
                },
              },
              required: ['service'],
            },
          },
          {
            name: 'get_project_structure',
            description: 'Get overview of multi-service project structure',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'search_across_services',
            description: 'Search for text across all services',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Text to search for',
                },
                fileTypes: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'File extensions to include (e.g., [".js", ".php", ".py"])',
                },
              },
              required: ['query'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      if (!this.rateLimiter.tryRemoveToken()) {
        return {
          content: [
            { type: 'text', text: 'Rate limit exceeded. Please retry later.' },
          ],
          isError: true,
        };
      }
      switch (request.params.name) {
        case 'read_multi_service_file':
          return await this.readMultiServiceFile(request.params.arguments);
        case 'list_service_files':
          return await this.listServiceFiles(request.params.arguments);
        case 'get_project_structure':
          return await this.getProjectStructure();
        case 'search_across_services':
          return await this.searchAcrossServices(request.params.arguments);
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  getServicePath(service) {
    const serviceMap = {
      api: 'api.menschlichkeit-oesterreich.at',
      crm: 'crm.menschlichkeit-oesterreich.at',
      frontend: 'frontend',
      games: 'web',
      website: 'website',
      n8n: 'automation/n8n',
      root: '.',
    };

    // Strict allowlist: reject unknown services
    if (!this.allowedServices.has(service)) {
      throw new Error(`Unknown or disallowed service: ${service}`);
    }
    return path.join(this.projectRoot, serviceMap[service]);
  }

  // Resolve a relative path safely under a base directory.
  // Throws if the resolved path escapes the base (prevents path traversal).
  resolveSafePath(baseDir, relPath) {
    if (typeof relPath !== 'string' || relPath.trim().length === 0) {
      throw new Error('Invalid file path');
    }
    const base = path.resolve(baseDir);
    const target = path.resolve(base, relPath);
    const relative = path.relative(base, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Path traversal detected');
    }
    return target;
  }

  async opaAvailable() {
    if (this._opaAvailable !== undefined) return this._opaAvailable;
    try {
      // Require policy file to exist and opa in PATH
      if (!fssync.existsSync(this.opaPolicyPath)) {
        this._opaAvailable = false;
        return false;
      }
      await new Promise((resolve, reject) => {
        const p = spawn('opa', ['version']);
        p.on('error', reject);
        p.on('exit', code => (code === 0 ? resolve() : reject(new Error('opa exit'))));
      });
      this._opaAvailable = true;
    } catch {
      this._opaAvailable = false;
    }
    return this._opaAvailable;
  }

  async opaAllow(query, inputObj) {
    const ok = await this.opaAvailable();
    if (!ok) return null; // no decision
    return await new Promise(resolve => {
      try {
        const args = ['eval', '-f', 'pretty', '-I', '-d', this.opaPolicyPath, query, '-i', '-'];
        const p = spawn('opa', args, { stdio: ['pipe', 'pipe', 'pipe'] });
        let out = '';
        p.stdout.on('data', d => (out += d.toString()));
        p.stdin.write(JSON.stringify(inputObj));
        p.stdin.end();
        p.on('error', () => resolve(null));
        p.on('close', () => {
          const decision = out.trim();
          resolve(decision === 'true');
        });
      } catch {
        resolve(null);
      }
    });
  }

  async readMultiServiceFile({ service, filePath }) {
    try {
      if (!this.cbRead.allow()) {
        throw new Error('Circuit open for read operation');
      }
      const opaIn = await this.opaAllow('data.mcp.policy.toolio.allow_input', { service, filePath });
      if (opaIn === false) {
        throw new Error('OPA policy denied input');
      }
      const servicePath = this.getServicePath(service);
      const fullPath = this.resolveSafePath(servicePath, filePath);
      const st = await fs.stat(fullPath);
      if (!st.isFile()) {
        throw new Error('Requested path is not a file');
      }
      if (st.size > this.maxFileBytes) {
        throw new Error(`File too large (${st.size} bytes), limit is ${this.maxFileBytes}`);
      }
      const content = await fs.readFile(fullPath, 'utf8');
      const opaOut = await this.opaAllow('data.mcp.policy.toolio.allow_output', { content });
      if (opaOut === false) {
        throw new Error('OPA policy denied output');
      }

      this.cbRead.success();
      return {
        content: [
          {
            type: 'text',
            text: `File: ${service}/${filePath}\n\n${content}`,
          },
        ],
      };
    } catch (error) {
      this.cbRead.failure();
      return {
        content: [
          {
            type: 'text',
            text: `Error reading file: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async listServiceFiles({ service, directory = '.' }) {
    try {
      if (!this.cbList.allow()) {
        throw new Error('Circuit open for list operation');
      }
      const opaIn = await this.opaAllow('data.mcp.policy.toolio.allow_input', { service, filePath: directory });
      if (opaIn === false) {
        throw new Error('OPA policy denied input');
      }
      const servicePath = this.getServicePath(service);
      const fullPath = this.resolveSafePath(servicePath, directory);
      const items = await fs.readdir(fullPath, { withFileTypes: true });

      const fileList = items.map(item => ({
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
        path: path.join(directory, item.name),
      }));

      this.cbList.success();
      return {
        content: [
          {
            type: 'text',
            text: `Files in ${service}/${directory}:\n\n${JSON.stringify(fileList, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      this.cbList.failure();
      return {
        content: [
          {
            type: 'text',
            text: `Error listing files: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getProjectStructure() {
    const structure = {
      services: [
        {
          name: 'API Service',
          path: 'api.menschlichkeit-oesterreich.at/',
          technology: 'FastAPI/Python',
          purpose: 'Backend API für Frontend und CRM Integration',
        },
        {
          name: 'CRM System',
          path: 'crm.menschlichkeit-oesterreich.at/',
          technology: 'Drupal 10 + CiviCRM',
          purpose: 'Mitgliederverwaltung und Spendenverwaltung',
        },
        {
          name: 'Frontend',
          path: 'frontend/',
          technology: 'React/TypeScript + TailwindCSS',
          purpose: 'Hauptwebsite mit Design System Integration',
        },
        {
          name: 'Gaming Platform',
          path: 'web/',
          technology: 'Web Games + Prisma/PostgreSQL',
          purpose: 'Educational democracy games',
        },
        {
          name: 'Website',
          path: 'website/',
          technology: 'WordPress/HTML',
          purpose: 'Statische Website-Inhalte',
        },
        {
          name: 'Automation',
          path: 'automation/n8n/',
          technology: 'n8n Workflows',
          purpose: 'Automatisierte Workflows und Integrationen',
        },
      ],
      keyFiles: [
        'schema.prisma - Database schema für Gaming Platform',
        'package.json - Monorepo workspace configuration',
        'composer.json - PHP dependencies für CRM/API',
        'build-pipeline.sh - Multi-service build automation',
        'scripts/plesk-sync.sh - Deployment synchronization',
        'figma-design-system/ - Design tokens und Branding',
      ],
    };

    return {
      content: [
        {
          type: 'text',
          text: `Multi-Service Project Structure:\n\n${JSON.stringify(structure, null, 2)}`,
        },
      ],
    };
  }

  async searchAcrossServices({ query, fileTypes = ['.js', '.php', '.py', '.ts', '.jsx', '.tsx'] }) {
    // Implementation for cross-service search would go here
    return {
      content: [
        {
          type: 'text',
          text: `Search functionality for "${query}" across services - Implementation pending`,
        },
      ],
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

class TokenBucket {
  constructor(capacity, intervalMs) {
    this.capacity = Math.max(1, capacity);
    this.tokens = this.capacity;
    this.intervalMs = intervalMs;
    this.lastRefill = Date.now();
  }
  tryRemoveToken() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed >= this.intervalMs) {
      const periods = Math.floor(elapsed / this.intervalMs);
      this.tokens = Math.min(this.capacity, this.tokens + periods * this.capacity);
      this.lastRefill += periods * this.intervalMs;
    }
    if (this.tokens > 0) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}

class CircuitBreaker {
  constructor({ threshold = 5, cooldownMs = 60000, halfOpenPass = 1 } = {}) {
    this.threshold = threshold;
    this.cooldownMs = cooldownMs;
    this.halfOpenPass = halfOpenPass;
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.openedAt = 0;
  }
  allow() {
    if (this.state === 'open') {
      if (Date.now() - this.openedAt >= this.cooldownMs) {
        this.state = 'halfopen';
        this.successes = 0;
        this.failures = 0;
        return true;
      }
      return false;
    }
    return true;
  }
  failure() {
    if (this.state === 'halfopen') {
      this.trip();
      return;
    }
    this.failures += 1;
    if (this.failures >= this.threshold) {
      this.trip();
    }
  }
  success() {
    if (this.state === 'halfopen') {
      this.successes += 1;
      if (this.successes >= this.halfOpenPass) {
        this.reset();
      }
      return;
    }
    // closed: reset failure count on success
    this.failures = 0;
  }
  trip() {
    this.state = 'open';
    this.openedAt = Date.now();
    this.failures = 0;
    this.successes = 0;
  }
  reset() {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.openedAt = 0;
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new FileServerMCP();
  server.start().catch(console.error);
}

module.exports = FileServerMCP;
