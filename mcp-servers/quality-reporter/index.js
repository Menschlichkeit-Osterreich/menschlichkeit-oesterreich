#!/usr/bin/env node

/**
 * MCP Quality Reporter Server für Menschlichkeit Österreich
 * Liest und analysiert SARIF/JSON Quality Reports aus quality-reports/
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs').promises;
const path = require('path');

class QualityReporterMCP {
  constructor() {
    this.server = new Server(
      { name: 'menschlichkeit-quality-reporter', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.reportsDir = process.env.REPORTS_DIR ||
      path.join(process.env.PROJECT_ROOT || process.cwd(), 'quality-reports');
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_reports',
          description: 'Liste aller verfügbaren Quality Reports (SARIF, JSON)',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_findings',
          description: 'Lese einen spezifischen Report und zeige alle Findings',
          inputSchema: {
            type: 'object',
            properties: {
              report: {
                type: 'string',
                description: 'Dateiname des Reports (z.B. codacy-analysis.sarif)',
              },
            },
            required: ['report'],
          },
        },
        {
          name: 'get_summary',
          description: 'Zusammenfassung aller Reports mit Anzahl der Findings pro Kategorie',
          inputSchema: { type: 'object', properties: {} },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'list_reports':
          return await this.listReports();
        case 'get_findings':
          return await this.getFindings(request.params.arguments);
        case 'get_summary':
          return await this.getSummary();
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  async listReports() {
    try {
      const items = await fs.readdir(this.reportsDir, { withFileTypes: true });
      const reports = items
        .filter(i => i.isFile() && (i.name.endsWith('.sarif') || i.name.endsWith('.json')))
        .map(i => i.name);

      const details = [];
      for (const name of reports) {
        const filePath = path.join(this.reportsDir, name);
        const stat = await fs.stat(filePath);
        details.push({
          name,
          size: stat.size,
          modified: stat.mtime.toISOString(),
          format: name.endsWith('.sarif') ? 'SARIF' : 'JSON',
        });
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(details, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Fehler beim Lesen der Reports: ${error.message}` }],
        isError: true,
      };
    }
  }

  async getFindings({ report }) {
    try {
      // Prevent path traversal
      const safeName = path.basename(report);
      const filePath = path.join(this.reportsDir, safeName);
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);

      if (safeName.endsWith('.sarif')) {
        return this.parseSarif(safeName, data);
      }
      return {
        content: [{ type: 'text', text: `Report: ${safeName}\n\n${JSON.stringify(data, null, 2)}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Fehler beim Lesen von ${report}: ${error.message}` }],
        isError: true,
      };
    }
  }

  parseSarif(name, data) {
    const runs = data.runs || [];
    const findings = [];

    for (const run of runs) {
      const tool = run.tool?.driver?.name || 'unknown';
      for (const result of run.results || []) {
        findings.push({
          tool,
          ruleId: result.ruleId || 'unknown',
          level: result.level || 'warning',
          message: result.message?.text || '',
          location: result.locations?.[0]?.physicalLocation?.artifactLocation?.uri || '',
          line: result.locations?.[0]?.physicalLocation?.region?.startLine || null,
        });
      }
    }

    const summary = `Report: ${name}\nFindings: ${findings.length}\n\n`;
    const detail = findings.length > 0
      ? findings.map(f =>
        `[${f.level.toUpperCase()}] ${f.ruleId} — ${f.message}\n  ${f.location}${f.line ? ':' + f.line : ''} (${f.tool})`
      ).join('\n\n')
      : 'Keine Findings gefunden.';

    return {
      content: [{ type: 'text', text: summary + detail }],
    };
  }

  async getSummary() {
    try {
      const items = await fs.readdir(this.reportsDir, { withFileTypes: true });
      const reports = items.filter(i => i.isFile() && (i.name.endsWith('.sarif') || i.name.endsWith('.json')));

      const summary = { total_reports: reports.length, categories: {} };

      for (const item of reports) {
        const filePath = path.join(this.reportsDir, item.name);
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const data = JSON.parse(content);
          const category = item.name.replace(/\.(sarif|json)$/, '');

          if (item.name.endsWith('.sarif')) {
            let count = 0;
            for (const run of data.runs || []) {
              count += (run.results || []).length;
            }
            summary.categories[category] = { format: 'SARIF', findings: count };
          } else {
            const keys = Object.keys(data);
            summary.categories[category] = {
              format: 'JSON',
              entries: Array.isArray(data) ? data.length : keys.length,
            };
          }
        } catch {
          summary.categories[item.name] = { format: 'unknown', error: 'parse failed' };
        }
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Fehler: ${error.message}` }],
        isError: true,
      };
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

if (require.main === module) {
  const server = new QualityReporterMCP();
  server.start().catch(console.error);
}

module.exports = QualityReporterMCP;
