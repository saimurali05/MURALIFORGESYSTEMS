// node tests/shots.cjs <outDir> <width>x<height>  — one screenshot per section (instant scroll), console errors reported
const { chromium } = require('playwright');
const [out, size = '1440x900', only] = process.argv.slice(2); const [w, h] = size.split('x').map(Number);
const IDS = ['home', 'services', 'demos', 'advantage', 'process', 'about', 'closing', 'contact'];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto('http://127.0.0.1:5180/'); await p.waitForTimeout(2200);
  for (const id of (only ? only.split(',') : IDS)) {
    await p.evaluate((i) => { const t = document.getElementById(i).getBoundingClientRect().top + scrollY; window.scrollTo({ top: t, behavior: 'instant' }); }, id);
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `${out}/${id}-${w}.png` });
  }
  await p.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })); await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/footer-${w}.png` });
  console.log('errors', JSON.stringify(errs)); await b.close();
})();
