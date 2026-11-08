// node tests/dm-shot.cjs <out.png> <WxH> <demoId> [waitMs] [fullpage]  — screenshot of the demo stage after it has settled
const { chromium } = require('playwright');
(async () => { const [out, vp, id, wait = '3500'] = process.argv.slice(2); const [w, h] = vp.split('x').map(Number);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 }); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto('http://127.0.0.1:5180/'); await p.waitForTimeout(900); await p.evaluate(() => document.querySelector('#demos').scrollIntoView({ behavior: 'instant' })); await p.click('#tab-' + id); await p.waitForTimeout(400);
  await p.evaluate(() => { const e = document.querySelector('.dm'); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - 70, behavior: 'instant' }); });
  await p.waitForTimeout(+wait); await p.screenshot({ path: out }); console.log('errors', errs); await b.close(); })();
