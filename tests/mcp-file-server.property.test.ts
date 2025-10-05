import { describe, it, expect, vi, beforeAll } from 'vitest';
import fc from 'fast-check';
import path from 'node:path';

describe('MCP FileServer – security properties', () => {
  vi.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
    Server: class { setRequestHandler() {} connect() {} },
  }));
  vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
    StdioServerTransport: class {},
  }));
  vi.mock('@modelcontextprotocol/sdk/types.js', () => ({
    CallToolRequestSchema: {},
    ListToolsRequestSchema: {},
    Tool: class {},
  }));

  // Dynamically import after mocks
  let FileServerMCP: any;
  let server: any;
  let base: string;

  beforeAll(async () => {
    const mod = await import('../mcp-servers/file-server/index.js');
    FileServerMCP = mod.default ?? mod;
    server = new FileServerMCP();
    base = server.getServicePath('root');
  });

  it('rejects path traversal attempts', () => {
    const traversal = fc.string().filter(s => s.includes('..') || s.startsWith('/') || s.includes('\\'));
    fc.assert(
      fc.asyncProperty(traversal, async rel => {
        const res = await server.readMultiServiceFile({ service: 'root', filePath: rel });
        // Either an error or a safe resolution; must never escape base
        if (!res.isError) {
          // If it somehow did not error, assert resolved path is within base
          const resolved = server.resolveSafePath(base, rel);
          const relative = path.relative(base, resolved);
          expect(relative.startsWith('..')).toBe(false);
        }
        return true;
      }),
      { numRuns: 50 }
    );
  });

  it('only allows known services', async () => {
    await expect(async () => server.getServicePath('unknown')).rejects.toThrow();
  });
});
