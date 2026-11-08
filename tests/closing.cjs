// node tests/closing.cjs <outDir> — closing composition: plays once, settles on exact statement, no controls, narrow layout, reduced motion
const { chromium } = require('playwright');
const out = process.argv[2] || '/tmp/claude-0/shots/cl'; require('fs').mkdirSync(out, { recursive: true });
let ok = true; const errs = []; const check = (c, m) => { if (!c) { ok = false; console.log('  FAIL', m); } };
const hide = () => document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '.hdr,.dock,.skip,body::after{display:none!important}'; document.head.appendChild(s); });
const text = (p) => p.$$eval('.tfb__cell', (cs) => cs.map((c) => c.dataset.ch || ' ').join(''));
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1440, 900], [1100, 800], [768, 900], [390, 844], [360, 740]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); await p.addInitScript(hide);
    p.on('pageerror', (e) => errs.push(w + ' ' + e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(w + ' ' + m.text()));
    await p.goto('http://127.0.0.1:5180/'); await p.waitForSelector('.cl'); await p.waitForTimeout(500);
    await p.evaluate(() => document.getElementById('closing').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.waitForTimeout(w === 1440 ? 2500 : 500); if (w === 1440) await p.screenshot({ path: `${out}/cl-${w}-mid.png` });
    await p.waitForTimeout(9000);
    const phase = await p.$eval('.cl', (e) => e.dataset.phase); const t = await text(p);
    await p.screenshot({ path: `${out}/cl-${w}.png` });
    const r = await p.evaluate(() => { const f = document.querySelector('.cl__frame').getBoundingClientRect(), a = document.querySelector('.cl__stage').getBoundingClientRect(); return { sw: document.documentElement.scrollWidth, iw: innerWidth, frameW: Math.round(f.width), stageW: Math.round(a.width), over: f.left < a.left - 1 || f.right > a.right + 1, btns: document.querySelectorAll('.cl button').length, lede: getComputedStyle(document.querySelector('.cl__lede')).opacity, cta: getComputedStyle(document.querySelector('.cl__cta')).visibility }; });
    const cols = w < 720 ? 12 : 22; const rows = w < 720 ? ['YOU KNOW THE', 'BUSINESS.', 'I KNOW THE', 'CHEMISTRY.'] : ['YOU KNOW THE BUSINESS.', 'I KNOW THE CHEMISTRY.'];
    const got = rows.map((_, i) => t.slice(i * cols, (i + 1) * cols).trim());
    console.log(w, phase, JSON.stringify(got), JSON.stringify(r));
    check(phase === '3', `${w}: phase ${phase}`); check(got.join('|') === rows.join('|'), `${w}: board text`);
    check(r.sw <= r.iw && !r.over, `${w}: overflow`); check(r.btns === 0, `${w}: controls inside board`); check(r.lede === '1' && r.cta === 'visible', `${w}: lede/cta not shown`);
    await p.waitForTimeout(3000); check((await text(p)) === t, `${w}: board changed after settling`);
    await p.close();
  }
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); await p.addInitScript(hide);
  await p.goto('http://127.0.0.1:5180/'); await p.waitForSelector('.cl'); await p.evaluate(() => document.getElementById('closing').scrollIntoView({ block: 'center', behavior: 'instant' })); await p.waitForTimeout(800);
  const t = await text(p); check(t.slice(0, 22).trim() === 'YOU KNOW THE BUSINESS.' && t.slice(22).trim() === 'I KNOW THE CHEMISTRY.', 'reduced: immediate final text'); check((await p.$eval('.cl', (e) => e.dataset.phase)) === '3', 'reduced: phase 3');
  await p.screenshot({ path: `${out}/cl-reduced.png` });
  console.log('errors', JSON.stringify(errs)); check(!errs.length, 'console errors'); await b.close(); console.log(ok ? 'CLOSING: ALL OK' : 'CLOSING: FAILED'); process.exitCode = ok ? 0 : 1;
})();
