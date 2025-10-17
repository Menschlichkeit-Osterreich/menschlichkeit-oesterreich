#!/usr/bin/env node
const url = 'http://127.0.0.1:3845/mcp';

async function main() {
  try {
    const res = await fetch(url, { method: 'GET' });
    console.log(`Figma MCP GET ${url} → ${res.status} ${res.statusText}`);
    // Treat 2xx-4xx as reachable (many MCP servers return 400 for GET without payload)
    if (res.status >= 200 && res.status < 500) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (e) {
    console.error(`Figma MCP not reachable at ${url}.`);
    console.error('Tipp: Starte den lokalen Server mit: npm run figma:mcp:server');
    process.exit(2);
  }
}

main();
