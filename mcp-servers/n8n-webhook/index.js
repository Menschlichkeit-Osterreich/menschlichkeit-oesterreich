#!/usr/bin/env node

/**
 * MCP n8n Webhook Server für Menschlichkeit Österreich
 * Triggert n8n Workflows und zeigt deren Status
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');

class N8nWebhookMCP {
  constructor() {
    this.server = new Server(
      { name: 'menschlichkeit-n8n-webhook', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.projectRoot = process.env.PROJECT_ROOT || process.cwd();
    this.n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    this.workflowsDir = path.join(this.projectRoot, 'automation', 'n8n', 'workflows');
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_workflows',
          description: 'Listet alle verfügbaren n8n Workflows (aus workflows/ Verzeichnis)',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_workflow_details',
          description: 'Zeigt Details eines spezifischen n8n Workflows',
          inputSchema: {
            type: 'object',
            properties: {
              workflow: {
                type: 'string',
                description: 'Dateiname des Workflows (z.B. right-to-erasure.json)',
              },
            },
            required: ['workflow'],
          },
        },
        {
          name: 'trigger_webhook',
          description: 'Triggert einen n8n Webhook (nur Development-Umgebung)',
          inputSchema: {
            type: 'object',
            properties: {
              webhookPath: {
                type: 'string',
                description: 'Webhook-Pfad (z.B. /webhook/build-notify)',
              },
              payload: {
                type: 'object',
                description: 'JSON-Payload für den Webhook (optional)',
              },
            },
            required: ['webhookPath'],
          },
        },
        {
          name: 'get_n8n_status',
          description: 'Prüft ob n8n erreichbar ist und zeigt Version',
          inputSchema: { type: 'object', properties: {} },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'list_workflows':
          return await this.listWorkflows();
        case 'get_workflow_details':
          return await this.getWorkflowDetails(request.params.arguments);
        case 'trigger_webhook':
          return await this.triggerWebhook(request.params.arguments);
        case 'get_n8n_status':
          return await this.getN8nStatus();
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  async listWorkflows() {
    try {
      const items = await fs.readdir(this.workflowsDir, { withFileTypes: true });
      const workflows = [];

      for (const item of items.filter(i => i.isFile() && i.name.endsWith('.json'))) {
        try {
          const content = await fs.readFile(path.join(this.workflowsDir, item.name), 'utf8');
          const data = JSON.parse(content);
          workflows.push({
            file: item.name,
            name: data.name || item.name.replace('.json', ''),
            nodes: (data.nodes || []).length,
            active: data.active ?? false,
          });
        } catch {
          workflows.push({ file: item.name, name: item.name, error: 'parse failed' });
        }
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(workflows, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Fehler: ${error.message}` }],
        isError: true,
      };
    }
  }

  async getWorkflowDetails({ workflow }) {
    try {
      const safeName = path.basename(workflow);
      const filePath = path.join(this.workflowsDir, safeName);
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);

      const details = {
        name: data.name || safeName,
        active: data.active ?? false,
        nodes: (data.nodes || []).map(n => ({
          name: n.name,
          type: n.type,
          position: n.position,
        })),
        connections: Object.keys(data.connections || {}),
        settings: data.settings || {},
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(details, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Fehler: ${error.message}` }],
        isError: true,
      };
    }
  }

  async triggerWebhook({ webhookPath, payload = {} }) {
    return new Promise((resolve) => {
      try {
        const url = new URL(webhookPath, this.n8nBaseUrl);
        const body = JSON.stringify(payload);

        const options = {
          hostname: url.hostname,
          port: url.port || 5678,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
          timeout: 10000,
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            resolve({
              content: [{
                type: 'text',
                text: `Webhook ${webhookPath} triggered.\nStatus: ${res.statusCode}\nResponse: ${data}`,
              }],
            });
          });
        });

        req.on('error', (error) => {
          resolve({
            content: [{
              type: 'text',
              text: `Webhook-Fehler: ${error.message}\nIst n8n gestartet? (npm run n8n:start)`,
            }],
            isError: true,
          });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({
            content: [{ type: 'text', text: 'Webhook-Timeout nach 10s. Ist n8n erreichbar?' }],
            isError: true,
          });
        });

        req.write(body);
        req.end();
      } catch (error) {
        resolve({
          content: [{ type: 'text', text: `Fehler: ${error.message}` }],
          isError: true,
        });
      }
    });
  }

  async getN8nStatus() {
    return new Promise((resolve) => {
      const url = new URL('/healthz', this.n8nBaseUrl);
      const req = http.get(url, { timeout: 5000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({
            content: [{
              type: 'text',
              text: `n8n Status: ${res.statusCode === 200 ? 'OK' : 'FEHLER'}\nURL: ${this.n8nBaseUrl}\nResponse: ${data}`,
            }],
          });
        });
      });

      req.on('error', () => {
        resolve({
          content: [{
            type: 'text',
            text: `n8n nicht erreichbar unter ${this.n8nBaseUrl}\nStarten mit: npm run n8n:start`,
          }],
          isError: true,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          content: [{ type: 'text', text: `n8n-Timeout. Nicht erreichbar unter ${this.n8nBaseUrl}` }],
          isError: true,
        });
      });
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

if (require.main === module) {
  const server = new N8nWebhookMCP();
  server.start().catch(console.error);
}

module.exports = N8nWebhookMCP;
