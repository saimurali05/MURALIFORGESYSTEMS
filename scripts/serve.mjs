// Zero-dependency static server for the prebuilt site (dist/). `npm start` — no `npm install` required.
// Serves only files inside dist/, with correct MIME types (ES modules need text/javascript). Listens on 127.0.0.1 only.
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT) || 5173;
const host = '127.0.0.1';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

if (!existsSync(join(root, 'index.html'))) {
  console.error('dist/index.html was not found. Run "npm install" and then "npm run build" first.');
  process.exit(1);
}

const fail = (res, code, msg) => { res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(msg); };

const server = createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.setHeader('Allow', 'GET, HEAD'); return fail(res, 405, 'Method not allowed'); }
  let rel;
  try { rel = decodeURIComponent(new URL(req.url, 'http://local').pathname); } catch { return fail(res, 400, 'Bad request'); }
  if (rel.includes('\0')) return fail(res, 400, 'Bad request');
  let file = resolve(root, '.' + rel);
  if (file !== root && !file.startsWith(root + sep)) return fail(res, 403, 'Forbidden');
  try { if (statSync(file).isDirectory()) file = join(file, 'index.html'); } catch { /* handled below */ }
  let st;
  try { st = statSync(file); if (!st.isFile()) throw new Error('not a file'); } catch { return fail(res, 404, 'Not found'); }
  res.writeHead(200, {
    'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
    'Content-Length': st.size,
    'Cache-Control': 'no-cache',
  });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).on('error', () => res.destroy()).pipe(res);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Close the other server, or pick another port:`);
    console.error(`  PowerShell:  $env:PORT=5180; npm start`);
    console.error(`  macOS/Linux: PORT=5180 npm start`);
  } else console.error(e.message);
  process.exit(1);
});

server.listen(port, host, () => console.log(`MFS site running at http://${host}:${port}   (press Ctrl+C to stop)`));
