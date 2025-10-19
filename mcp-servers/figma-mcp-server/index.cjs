
const http = require('http');

const PORT = 3845;
const MCP_PATH = '/mcp';

const server = http.createServer((req, res) => {
  if (req.url === MCP_PATH && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('Received request on /mcp:');
      try {
        const parsedBody = JSON.parse(body);
        console.log(JSON.stringify(parsedBody, null, 2));
      } catch (e) {
        console.log(body);
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'success',
        message: 'This is a placeholder for the Figma MCP server.'
      }));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Figma MCP placeholder server listening on http://127.0.0.1:${PORT}${MCP_PATH}`);
});
