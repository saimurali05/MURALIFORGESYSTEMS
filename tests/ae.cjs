// node tests/ae.cjs <outDir> [widths] — Services automation stage: force each of the 5 scenes, screenshot the stage, check overflow
const { chromium } = require('playwright');
const out = process.argv[2] || '/tmp/claude-0/shots/ae';
const widths = (process.argv[3] || '1440,1024,390').split(',').map(Number);
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const w of widths) {
    const p = await b.newPage({ viewport: { width: w, height: w > 800 ? 900 : 844 } });
    p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await p.goto('http://127.0.0.1:5180/'); await p.waitForSelector('.ae'); await p.waitForTimeout(800);
    await p.evaluate(() => document.querySelector('.ae').scrollIntoView({ block: 'center' })); await p.waitForTimeout(900);
    for (let s = 0; s < 5; s++) {
      await p.evaluate((n) => { const e = document.querySelector('.ae'); e.dataset.step = String(n); e.style.setProperty('--step', String(n)); }, s);
      await p.waitForTimeout(s === 0 ? 1100 : 2600);
      const el = await p.$('.ae'); await el.screenshot({ path: `${out}/ae-${w}-s${s}.png` });
    }
    const ov = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, clip: [...document.querySelectorAll('.ae *')].filter((e) => { const r = e.getBoundingClientRect(); const a = document.querySelector('.ae').getBoundingClientRect(); return r.width && (r.right > a.right + 1 || r.left < a.left - 1) && getComputedStyle(e).display !== 'none'; }).slice(0, 4).map((e) => e.className + ':' + Math.round(e.getBoundingClientRect().right)) }));
    console.log(w, JSON.stringify(ov)); await p.close();
  }
  console.log('errors', JSON.stringify(errs)); await b.close();
})();
