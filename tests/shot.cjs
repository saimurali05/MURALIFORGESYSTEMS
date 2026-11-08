// usage: node tests/shot.cjs <url> <out.png> [width] [height] [waitMs] [scrollY]
const { chromium } = require('playwright');
(async () => {
  const [url, out, w = '1440', h = '810', wait = '3000', sy = '0'] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  const logs = [];
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', (e) => logs.push('pageerror: ' + e.message));
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(+wait);
  if (+sy) { await p.evaluate((y) => window.scrollTo(0, y), +sy); await p.waitForTimeout(1200); }
  await p.screenshot({ path: out });
  console.log(logs.length ? logs.join('\n') : 'no console errors/warnings');
  await b.close();
})();
