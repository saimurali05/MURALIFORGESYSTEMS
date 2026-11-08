// node tests/sweep.cjs [url] [widthxheight,...] [prefix] — screenshots each major section for a visual pass
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://127.0.0.1:5180/';
const sizes = (process.argv[3] || '1440x900,390x844').split(',').map((s) => s.split('x').map(Number));
const prefix = process.argv[4] || 'sw';
const IDS = ['home', 'services', 'demos', 'advantage', 'process', 'about', 'closing', 'contact'];
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of sizes) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = [];
    p.on('pageerror', (e) => errs.push(e.message.slice(0, 120))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 120)));
    await p.goto(url); await p.waitForTimeout(1400);
    for (const id of IDS) {
      await p.evaluate((i) => document.getElementById(i)?.scrollIntoView({ block: 'start' }), id); await p.waitForTimeout(id === 'advantage' || id === 'closing' ? 2200 : 1300);
      await p.screenshot({ path: `/tmp/claude-0/shots/${prefix}-${w}-${id}.png` });
    }
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(900); await p.screenshot({ path: `/tmp/claude-0/shots/${prefix}-${w}-foot.png` });
    console.log(w + 'x' + h, 'errors', JSON.stringify(errs)); await p.close();
  }
  await b.close();
})();
