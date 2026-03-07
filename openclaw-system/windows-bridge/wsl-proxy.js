const http = require('http');
const httpProxy = require('http-proxy');

// --- Konfiguration ---
const PROXY_PORT = 18790;
const TARGETS = {
    AGENT_RUNTIME: 'http://127.0.0.1:9100',
    TOOL_GATEWAY:  'http://127.0.0.1:9101',
};

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
    const url = req.url || '';

    // Routing-Logik
    if (url.startsWith('/agent/')) {
        console.log(`[PROXY] >> Agent Runtime: ${req.method} ${url}`);
        req.url = url.replace('/agent', ''); // Pfad anpassen
        proxy.web(req, res, { target: TARGETS.AGENT_RUNTIME }, (err) => {
            console.error('[PROXY] Agent Runtime Error:', err.message);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Agent Runtime not reachable' }));
        });
    } else if (url.startsWith('/tools/')) {
        console.log(`[PROXY] >> Tool Gateway: ${req.method} ${url}`);
        req.url = url.replace('/tools', ''); // Pfad anpassen
        proxy.web(req, res, { target: TARGETS.TOOL_GATEWAY }, (err) => {
            console.error('[PROXY] Tool Gateway Error:', err.message);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Tool Gateway not reachable' }));
        });
    } else {
        console.log(`[PROXY] 404 Not Found: ${req.method} ${url}`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint not found. Use /agent/ or /tools/ prefix.' }));
    }
});

console.log(`
=========================================
  OpenClaw WSL2 Bridge is running!
=========================================
`);
console.log(`  Proxy Port:    ${PROXY_PORT}`);
console.log(`  Agent Runtime: -> ${TARGETS.AGENT_RUNTIME}`);
console.log(`  Tool Gateway:  -> ${TARGETS.TOOL_GATEWAY}`);
console.log(`
Listening for requests...`);

server.listen(PROXY_PORT);
