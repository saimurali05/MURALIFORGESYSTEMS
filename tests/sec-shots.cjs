// node tests/sec-shots.cjs <outDir> <sectionId> <width>x<height> <offset,offset,...>  — viewport screenshots at offsets (px) from the section top
const { chromium } = require('playwright');
const [out, id, size = '1440x900', offs = '0'] = process.argv.slice(2); const [w, h] = size.split('x').map(Number);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto('http://127.0.0.1:5180/'); await p.waitForTimeout(1200);
  for (const o of offs.split(',').map(Number)) {
    await p.evaluate(([i, off]) => { const t = document.getElementById(i).getBoundingClientRect().top + scrollY; window.scrollTo(0, t + off); }, [id, o]); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${out}/${id}-${w}-${o}.png` });
  }
  console.log('errors', JSON.stringify(errs)); await b.close();
})();
