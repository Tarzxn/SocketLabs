import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./dist/index.html', import.meta.url));

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
  if (path === '/healthz') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }).end('ok');
    return;
  }
  response.writeHead(404).end();
}).listen(Number(process.env.PORT ?? 10000), '0.0.0.0');
