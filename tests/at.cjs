// node tests/at.cjs <out> <WxH> <selector> [offset] — screenshot with the element's top at `offset` px below the viewport top
const { chromium } = require('playwright'); const [out, size, sel, off = '0'] = process.argv.slice(2); const [w, h] = size.split('x').map(Number);
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://127.0.0.1:5180/'); await p.waitForTimeout(1800);
  await p.evaluate(([s, o]) => { const t = document.querySelector(s).getBoundingClientRect().top + scrollY; window.scrollTo({ top: t - Number(o), behavior: 'instant' }); }, [sel, off]); await p.waitForTimeout(2200);
  await p.screenshot({ path: out }); await b.close(); })();
