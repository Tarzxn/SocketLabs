import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./dist/index.html', import.meta.url));

const catalogue = readFileSync(new URL('./dist/catalogue.js', import.meta.url));

const preview = readFileSync(new URL('./dist/preview.js', import.meta.url));
const snapshot = readFileSync(new URL('./dist/snapshot.js', import.meta.url));
const compressedSnapshot = readFileSync(new URL('./dist/snapshot.js.gz', import.meta.url));

createServer((request, response) => {
  const path = request.url.split('?')[0];
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  if (path === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(app);
    return;
  }
  if (path === '/snapshot.js') {
    const gzip = /\bgzip\b/.test(request.headers['accept-encoding'] ?? '');
    const headers = { 'Content-Type': 'text/javascript; charset=utf-8', Vary: 'Accept-Encoding' };
    if (gzip) headers['Content-Encoding'] = 'gzip';
    response.writeHead(200, headers).end(gzip ? compressedSnapshot : snapshot);
    return;
  }
  if (path === '/preview.js') {
    response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' }).end(preview);
    return;
  }
  if (path === '/catalogue.js') {
    response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' }).end(catalogue);
    return;
  }
  if (path === '/healthz') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }).end('ok');
    return;
  }
  response.writeHead(404).end();
}).listen(Number(process.env.PORT ?? 10000), '0.0.0.0');
