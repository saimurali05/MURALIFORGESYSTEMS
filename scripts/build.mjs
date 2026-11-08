// Dependency-light production build: esbuild bundles TS/React, copies static assets, emits dist/.
// Usage: node scripts/build.mjs            -> production build into dist/
//        node scripts/build.mjs --serve    -> watch + serve on http://127.0.0.1:5173
import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySeo, crawlerFiles } from './seo.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const serve = process.argv.includes('--serve');

const opts = {
  entryPoints: { app: resolve(root, 'src/main.tsx') },
  bundle: true,
  outdir: resolve(dist, 'assets'),
  format: 'iife',  // classic script: works over http AND when index.html is opened straight from disk (file://)
  target: ['es2022', 'chrome110', 'safari16', 'firefox110'],
  jsx: 'automatic',
  minify: !serve,
  sourcemap: serve ? 'inline' : true,
  external: ['../fonts/*'],

  alias: { '@': resolve(root, 'src') },
  define: { 'process.env.NODE_ENV': serve ? '"development"' : '"production"' },
  logLevel: 'info',
  metafile: true,
};

async function copyStatic() {
  mkdirSync(dist, { recursive: true });
  cpSync(resolve(root, 'public'), dist, { recursive: true });
  let html = readFileSync(resolve(root, 'index.html'), 'utf8');
  html = await applySeo(root, html);
  writeFileSync(resolve(dist, 'index.html'), html);
  const cfg = crawlerFiles(root, dist);
  console.log(`  SEO: ${cfg.siteUrl ? 'site URL ' + cfg.siteUrl : 'no site URL configured — canonical, og:image and sitemap omitted'}`);
}

rmSync(dist, { recursive: true, force: true });
if (serve) {
  const ctx = await esbuild.context(opts);
  await copyStatic();
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: dist, host: '127.0.0.1', port: 5173 });
  console.log(`MFS dev server: http://127.0.0.1:${port}   (rebuilds on save; Ctrl+C to stop)`);
} else {
  const res = await esbuild.build(opts);
  await copyStatic();
  const out = Object.entries(res.metafile.outputs).filter(([k]) => !k.endsWith('.map'));
  let total = 0;
  for (const [k, v] of out) { total += v.bytes; console.log(`  ${k.replace(root + '/', '')}  ${(v.bytes / 1024).toFixed(1)} KB`); }
  console.log(`Build OK — ${(total / 1024).toFixed(1)} KB emitted into dist/`);
}
