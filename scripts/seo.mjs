// Build-time SEO: head tags, JSON-LD (Organization, WebSite, Service), crawlable no-JS content, robots.txt and sitemap.xml.
// Nothing is invented: absolute URLs, canonical, og:image and the sitemap exist only when a real site URL is configured.
import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
async function load(root, file) {
  const r = await esbuild.build({ entryPoints: [resolve(root, file)], bundle: true, format: 'esm', write: false, logLevel: 'silent' });
  return import('data:text/javascript;base64,' + Buffer.from(r.outputFiles[0].text).toString('base64'));
}
export const readConfig = (root) => {
  let c = {}; try { c = JSON.parse(readFileSync(resolve(root, 'site.config.json'), 'utf8')); } catch {}
  const url = String(process.env.SITE_URL || c.siteUrl || '').trim().replace(/\/+$/, '');
  if (url && !/^https:\/\/[^\s/]+(\/\S*)?$/.test(url)) throw new Error(`SITE_URL must be an https URL, got "${url}"`);
  return { siteUrl: url, allowAiTraining: c.allowAiTraining === true };
};
const TITLE = 'Murali Forge Systems | Software, AI & Automation';
const DESC = 'MFS builds business websites, AI assistants and workflow automation, and connects the tools your business already uses. Book a 30-minute discovery call.';

export async function applySeo(root, html) {
  const cfg = readConfig(root); const { SERVICES, CONTACT } = await load(root, 'src/data/services.ts'); const { FAQ } = await load(root, 'src/data/faq.ts');
  const u = cfg.siteUrl; const abs = (p) => (u ? `${u}${p}` : undefined);
  const head = [
    `<meta property="og:type" content="website" />`, `<meta property="og:site_name" content="Murali Forge Systems" />`, `<meta property="og:title" content="${esc(TITLE)}" />`,
    `<meta property="og:description" content="${esc(DESC)}" />`, `<meta property="og:locale" content="en" />`,
    `<meta name="twitter:card" content="${u ? 'summary_large_image' : 'summary'}" />`, `<meta name="twitter:title" content="${esc(TITLE)}" />`, `<meta name="twitter:description" content="${esc(DESC)}" />`,
    ...(u ? [`<link rel="canonical" href="${u}/" />`, `<meta property="og:url" content="${u}/" />`, `<meta property="og:image" content="${u}/og-image.png" />`, `<meta property="og:image:width" content="1200" />`, `<meta property="og:image:height" content="630" />`,
      `<meta property="og:image:alt" content="Murali Forge Systems — Software, AI and Automation" />`, `<meta name="twitter:image" content="${u}/og-image.png" />`] : []),
  ];
  const clean = (o) => JSON.parse(JSON.stringify(o));
  const graph = clean({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': `${u}/#org`, name: 'Murali Forge Systems', alternateName: 'MFS', slogan: 'Software • AI • Automation', description: DESC, email: CONTACT.email, url: abs('/'), logo: abs('/assets/mfs-logo.png'),
      contactPoint: { '@type': 'ContactPoint', contactType: 'sales', email: CONTACT.email } },
    { '@type': 'WebSite', '@id': `${u}/#website`, name: 'Murali Forge Systems', url: abs('/'), inLanguage: 'en', publisher: { '@id': `${u}/#org` } },
    ...SERVICES.map((s) => ({ '@type': 'Service', '@id': `${u}/#${s.hash}`, name: s.title, serviceType: s.nav, description: s.summary, provider: { '@id': `${u}/#org` } })),
  ] });
  const ld = JSON.stringify(graph).replace(/<\//g, '<\\/');
  head.push(`<script type="application/ld+json">${ld}</script>`);
  const body = `<noscript><div style="font-family:system-ui,sans-serif;max-width:860px;margin:0 auto;padding:2rem;line-height:1.6;color:#171918;background:#F9F6EF">
<h1>Murali Forge Systems — Software · AI · Automation</h1>
<p>${esc(DESC)} The interactive demos need JavaScript; the information below does not.</p>
<h2>Services</h2><ul>${SERVICES.map((s) => `<li><strong>${esc(s.title)}</strong> — ${esc(s.summary)}</li>`).join('')}</ul>
<h2>Working with MFS</h2>${FAQ.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}
<h2>Contact</h2><p>Email <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>. Book a 30-minute discovery call: <a href="https://cal.com/murali-forge-systems-1bhduf/30min">MFS Discovery Call</a>.</p></div></noscript>`;
  let out = html.replace('<!--SEO-HEAD-->', head.join('\n  ')).replace('<!--SEO-BODY-->', body);
  if (!out.includes('og:title') || !out.includes('<noscript>')) throw new Error('SEO placeholders missing from index.html');
  return out;
}

export function crawlerFiles(root, dist) {
  const cfg = readConfig(root);
  const L = ['# Search crawlers and user-triggered AI fetchers are allowed.', 'User-agent: *', 'Allow: /', ''];
  if (!cfg.allowAiTraining) L.push('# AI model-training crawlers: opted out (set allowAiTraining to true in site.config.json to allow).', ...['GPTBot', 'Google-Extended', 'ClaudeBot', 'CCBot'].flatMap((a) => [`User-agent: ${a}`, 'Disallow: /', '']));
  if (cfg.siteUrl) L.push(`Sitemap: ${cfg.siteUrl}/sitemap.xml`);
  writeFileSync(resolve(dist, 'robots.txt'), L.join('\n') + '\n');
  if (cfg.siteUrl) writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${cfg.siteUrl}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`);
  return cfg;
}
