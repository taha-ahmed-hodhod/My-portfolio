import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleChat } from './chat-api.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
try { process.loadEnvFile(path.join(root, '.env')); }
catch (error) { if (error?.code !== 'ENOENT') throw error; }

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.pdf': 'application/pdf',
};

async function serve(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/chat') return handleChat(req, res);
  if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
    res.writeHead(405, { allow: 'GET, HEAD' }).end();
    return;
  }
  if (!existsSync(dist)) {
    res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' }).end('Build the frontend first with npm run build.');
    return;
  }

  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { res.writeHead(400).end(); return; }
  const relative = pathname.replace(/^\/+/, '');
  let file = path.resolve(dist, relative || 'index.html');
  if (!file.startsWith(dist + path.sep) && file !== path.join(dist, 'index.html')) {
    res.writeHead(403).end();
    return;
  }
  if (!existsSync(file) || !statSync(file).isFile()) file = path.join(dist, 'index.html');
  res.writeHead(200, {
    'content-type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'x-content-type-options': 'nosniff',
  });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
}

const server = createServer((req, res) => {
  serve(req, res).catch(async () => {
    if (!res.headersSent) res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
    if (!res.writableEnded) res.end(JSON.stringify({ error: 'Server error.' }));
  });
});
const isLocalApi = Boolean(process.env.CHAT_PORT);
const port = Number(process.env.CHAT_PORT || process.env.PORT || 8791);
const host = process.env.HOST || (!isLocalApi && process.env.PORT ? '0.0.0.0' : '127.0.0.1');
server.listen(port, host, () => console.log(`Digital Twin server listening on ${host}:${port}`));
