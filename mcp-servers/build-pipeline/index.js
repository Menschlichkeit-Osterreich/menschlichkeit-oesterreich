#!/usr/bin/env node

/**
 * MCP Build Pipeline Server für Menschlichkeit Österreich
 * Bietet Build-Status, Dry-Run und Target-Listing für die Multi-Service Build-Pipeline
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execFileAsync = promisify(execFile);

class BuildPipelineMCP {
  constructor() {
    this.server = new Server(
      { name: 'menschlichkeit-build-pipeline', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.projectRoot = process.env.PROJECT_ROOT || process.cwd();
    this.pipelineScript = path.join(this.projectRoot, 'build-pipeline.sh');
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'build_status',
          description: 'Zeigt den aktuellen Build-Status aller Services (letzte Build-Artefakte, Timestamps)',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'dry_run',
          description: 'Führt einen Dry-Run der Build-Pipeline aus (keine echten Änderungen)',
          inputSchema: {
            type: 'object',
            properties: {
              target: {
                type: 'string',
                enum: ['staging', 'production'],
                description: 'Zielumgebung für den Dry-Run',
              },
            },
            required: ['target'],
          },
        },
        {
          name: 'list_targets',
          description: 'Listet alle verfügbaren Build-Targets und Services',
          inputSchema: { type: 'object', properties: {} },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'build_status':
          return await this.buildStatus();
        case 'dry_run':
          return await this.dryRun(request.params.arguments);
        case 'list_targets':
          return await this.listTargets();
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  async buildStatus() {
    try {
      const services = [
        { name: 'Frontend', dir: 'apps/website', buildDir: 'apps/website/dist' },
        { name: 'API', dir: 'apps/api', buildDir: null },
        { name: 'CRM', dir: 'apps/crm', buildDir: null },
        { name: 'Games', dir: 'apps/game', buildDir: null },
      ];

      const statuses = [];
      for (const svc of services) {
        const status = { name: svc.name, dir: svc.dir };
        try {
          const pkgPath = path.join(this.projectRoot, svc.dir, 'package.json');
          const pkgStat = await fs.stat(pkgPath);
          status.lastModified = pkgStat.mtime.toISOString();
          status.exists = true;
        } catch {
          status.exists = false;
        }

        if (svc.buildDir) {
          try {
            const buildStat = await fs.stat(path.join(this.projectRoot, svc.buildDir));
            status.buildExists = true;
            status.buildDate = buildStat.mtime.toISOString();
          } catch {
            status.buildExists = false;
          }
        }
        statuses.push(status);
      }

      // Check build-pipeline.sh existence
      let pipelineExists = false;
      try {
        await fs.access(this.pipelineScript);
        pipelineExists = true;
      } catch { /* noop */ }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ pipelineScript: pipelineExists, services: statuses }, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Fehler: ${error.message}` }],
        isError: true,
      };
    }
  }

  async dryRun({ target }) {
    try {
      if (target !== 'staging' && target !== 'production') {
        throw new Error('Ungültiges Target. Erlaubt: staging, production');
      }

      const { stdout, stderr } = await execFileAsync(
        'bash',
        [this.pipelineScript, target, '--skip-tests'],
        {
          cwd: this.projectRoot,
          timeout: 30000,
          env: { ...process.env, DRY_RUN: '1' },
        }
      );

      return {
        content: [{
          type: 'text',
          text: `Dry-Run für ${target}:\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr || '(none)'}`,
        }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Dry-Run fehlgeschlagen: ${error.message}` }],
        isError: true,
      };
    }
  }

  async listTargets() {
    const targets = {
      environments: ['staging', 'production'],
      services: [
        { name: 'frontend', command: 'npm run build:frontend', dir: 'apps/website' },
        { name: 'api', command: 'uvicorn app.main:app', dir: 'apps/api' },
        { name: 'crm', command: 'drush cr', dir: 'apps/crm' },
        { name: 'games', command: 'npx prisma generate', dir: 'apps/game' },
      ],
      pipeline: {
        script: 'build-pipeline.sh',
        usage: './build-pipeline.sh staging|production [--skip-tests|--force]',
      },
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(targets, null, 2) }],
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

if (require.main === module) {
  const server = new BuildPipelineMCP();
  server.start().catch(console.error);
}

module.exports = BuildPipelineMCP;
