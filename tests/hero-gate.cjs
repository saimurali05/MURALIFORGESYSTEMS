// Hero gate: proves the filament art really moves, freezes under reduced motion, has no overflow, and works on mobile.
// usage: node tests/hero-gate.cjs <baseUrl> <outDir>
const { chromium } = require('playwright');
const fs = require('fs');
const [base = 'http://127.0.0.1:5180/', out = '.'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

// mean absolute difference between two PNG buffers decoded in-page (no native deps)
async function diff(page, a, b, rect) {
  return page.evaluate(async ([a64, b64, rect]) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + s; });
    const [A, B] = [await load(a64), await load(b64)];
    const c = (im) => { const k = document.createElement('canvas'); k.width = im.width; k.height = im.height; const g = k.getContext('2d'); g.drawImage(im, 0, 0); return g.getImageData(rect.x, rect.y, rect.w, rect.h).data; };
    const da = c(A), db = c(B); let s = 0, changed = 0;
    for (let i = 0; i < da.length; i += 4) { const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]); s += d; if (d > 24) changed++; }
    return { mean: +(s / (da.length / 4) / 3).toFixed(3), changedPx: changed, totalPx: da.length / 4 };
  }, [a.toString('base64'), b.toString('base64'), rect]);
}

(async () => {
  const b = await chromium.launch();
  const report = {};
  const logs = [];
  // ---- desktop, motion on
  let ctx = await b.newContext({ viewport: { width: 1440, height: 810 } });
  let p = await ctx.newPage();
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', (e) => logs.push('pageerror: ' + e.message));
  await p.goto(base, { waitUntil: 'load' });
  await p.waitForTimeout(3500);
  const s1 = await p.screenshot(); fs.writeFileSync(out + '/gate_t0.png', s1);
  await p.waitForTimeout(2500);
  const s2 = await p.screenshot(); fs.writeFileSync(out + '/gate_t1.png', s2);
  // art region: right of the focal point (x 880..1440, y 200..780) — filaments, particles
  report.desktop_motion = await diff(p, s1, s2, { x: 880, y: 200, w: 560, h: 580 });
  report.desktop_overflow = await p.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth }));
  // line weight: every fibre stroke is expressed in css px — read what the canvas is actually using
  report.stroke_css_px = await p.evaluate(() => { const c = document.querySelector('canvas.fa__canvas'); return c ? { canvasCss: [c.style.width, c.style.height], dpr: window.devicePixelRatio } : null; });
  // decorative layers must not intercept clicks
  report.art_pointer_events = await p.evaluate(() => ['.fa', '.fa__canvas', '.hero__veil', '.hero__light', '.hero__stack'].map((s) => { const e = document.querySelector(s); return [s, e ? getComputedStyle(e).pointerEvents : 'missing']; }));
  report.cta_hit = await p.evaluate(() => { const a = document.querySelector('.hero__cta .btn--primary'); const r = a.getBoundingClientRect(); const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return a.contains(el); });
  await ctx.close();

  // ---- desktop, reduced motion: must be static and complete
  ctx = await b.newContext({ viewport: { width: 1440, height: 810 }, reducedMotion: 'reduce' });
  p = await ctx.newPage();
  await p.goto(base, { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  const r1 = await p.screenshot(); fs.writeFileSync(out + '/gate_reduced.png', r1);
  await p.waitForTimeout(2500);
  const r2 = await p.screenshot();
  report.reduced_motion_diff = await diff(p, r1, r2, { x: 0, y: 0, w: 1440, h: 810 });
  report.reduced_h1_visible = await p.evaluate(() => { const h = document.querySelector('h1'); const r = h.getBoundingClientRect(); return { opacity: getComputedStyle(h).opacity, w: Math.round(r.width) }; });
  await ctx.close();

  // ---- mobile
  ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  p = await ctx.newPage();
  p.on('pageerror', (e) => logs.push('mobile pageerror: ' + e.message));
  await p.goto(base, { waitUntil: 'load' });
  await p.waitForTimeout(3500);
  await p.screenshot({ path: out + '/gate_mobile.png' });
  report.mobile_overflow = await p.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth }));
  await ctx.close();

  await b.close();
  console.log(JSON.stringify(report, null, 1));
  console.log(logs.length ? 'CONSOLE:\n' + logs.join('\n') : 'no console errors/warnings');
})();
