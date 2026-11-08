// node tests/open-site.cjs <file:// URL of OPEN-SITE.html> — the redirect page lands on the working site
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(process.argv[2]); await p.waitForSelector('h1', { timeout: 15000 }); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => ({ url: location.pathname.slice(-24), h1: document.querySelector('h1').textContent, cards: document.querySelectorAll('.hp__card').length }));
  console.log(JSON.stringify(r), 'errors', JSON.stringify(errs)); await p.screenshot({ path: '/tmp/claude-0/shots/open-site.png' });
  process.exitCode = r.cards === 10 && !errs.length ? 0 : 1; await b.close(); })();
