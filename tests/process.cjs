// node tests/process.cjs <outDir> [widths]
// How MFS works: six stages, illustrations fit their frames, no overflow, motion ends in the finished picture, reduced motion = finished picture.
const { chromium } = require('playwright');
const out = process.argv[2] || '/tmp/claude-0/shots/pw';
const widths = (process.argv[3] || '1440,1280,1024,768,390,360').split(',').map(Number);
const URL = 'http://127.0.0.1:5180/';
require('fs').mkdirSync(out, { recursive: true });
let ok = true; const errs = [];
const check = (c, m) => { if (!c) { ok = false; console.log('  FAIL', m); } };
const hideChrome = () => { document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '.hdr,.dock,.skip,body::after{display:none!important}'; document.head.appendChild(s); }); };

(async () => {
  const b = await chromium.launch();
  for (const w of widths) {
    const p = await b.newPage({ viewport: { width: w, height: 2000 } });
    await p.addInitScript(hideChrome);
    p.on('pageerror', (e) => errs.push(w + ' ' + e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(w + ' ' + m.text()));
    await p.goto(URL); await p.waitForSelector('.pw__list'); await p.waitForTimeout(600);
    await p.evaluate(() => document.getElementById('process').scrollIntoView({ behavior: 'instant' })); await p.waitForTimeout(w === 1440 ? 1500 : 200);
    if (w === 1440) await (await p.$('#process')).screenshot({ path: `${out}/pw-${w}-early.png` });
    for (let i = 5; i >= 0; i--) { await p.evaluate((n) => document.querySelectorAll('.pw__stage')[n].scrollIntoView({ block: 'center', behavior: 'instant' }), i); await p.waitForTimeout(250); }
    await p.waitForTimeout(5200);
    await (await p.$('#process')).screenshot({ path: `${out}/pw-${w}.png` });
    const r = await p.evaluate(() => {
      const bad = [];
      document.querySelectorAll('.pw__scene').forEach((sc, i) => {
        const sr = sc.getBoundingClientRect();
        sc.querySelectorAll('.pa *').forEach((e) => {
          const cs = getComputedStyle(e); if (cs.display === 'none' || (cs.opacity === '0' && !e.classList.contains('pa__pre') && !e.classList.contains('pa__scan') && !e.classList.contains('pa__ring'))) return;
          if (e.closest('svg') && e.tagName !== 'svg') return;
          const r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
          if (r.right > sr.right + 0.5 || r.left < sr.left - 0.5 || r.bottom > sr.bottom + 0.5 || r.top < sr.top - 0.5) bad.push(`${i}:${e.className?.baseVal ?? e.className}@${Math.round(r.right - sr.right)}/${Math.round(r.bottom - sr.bottom)}`);
        });
      });
      // text boxes that are wider than their parent (ellipsis-free clipping check)
      const clipped = [...document.querySelectorAll('.pa b, .pa span, .pa small, .pa em, .pa li')].filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== 'inline').map((e) => e.textContent.slice(0, 18));
      const cards = [...document.querySelectorAll('.pw__card')].map((c) => Math.round(c.getBoundingClientRect().height));
      const outTops = [...document.querySelectorAll('.pw__out')].map((e) => Math.round(e.getBoundingClientRect().top + scrollY));
      const cols = new Set([...document.querySelectorAll('.pw__stage')].map((e) => Math.round(e.getBoundingClientRect().left))).size;
      const fs = getComputedStyle(document.querySelector('.pa')).fontSize;
      const scene = Math.round(document.querySelector('.pw__scene').getBoundingClientRect().width);
      return { sw: document.documentElement.scrollWidth, iw: innerWidth, bad: bad.slice(0, 6), clipped: clipped.slice(0, 6), cards, outTops, cols, fs, scene, shown: [...document.querySelectorAll('.pw__stage')].filter((e) => e.classList.contains('in')).length };
    });
    console.log(w, JSON.stringify(r));
    check(r.sw <= r.iw, `${w}: horizontal overflow`);
    check(r.bad.length === 0, `${w}: illustration parts leave their frame ${r.bad}`);
    check(r.clipped.length === 0, `${w}: clipped text ${r.clipped}`);
    check(r.cols === (w >= 1280 ? 3 : w >= 720 ? 2 : 1), `${w}: unexpected column count ${r.cols}`);
    check(r.shown === 6, `${w}: only ${r.shown} of 6 stages revealed`);
    if (w >= 720) { const per = w >= 1280 ? 3 : 2; for (let g = 0; g < 6; g += per) check(new Set(r.outTops.slice(g, g + per)).size === 1, `${w}: "You get" rows are not aligned ${r.outTops.slice(g, g + per)}`); }
    if (w >= 720) check(new Set(r.cards.slice(0, w >= 1280 ? 4 : 2)).size === 1, `${w}: cards in a row differ in height ${r.cards}`);
    await p.close();
  }
  // reduced motion → finished picture, nothing running
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 2000 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); await p.addInitScript(hideChrome); p.on('pageerror', (e) => errs.push('rm ' + e.message));
    await p.goto(URL); await p.waitForSelector('.pw__list'); await p.evaluate(() => document.getElementById('process').scrollIntoView({ behavior: 'instant' })); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => ({ anim: [...document.querySelectorAll('.pw__stage *')].filter((e) => { const n = getComputedStyle(e).animationName; return n && n !== 'none'; }).length,
      hiddenPart: [...document.querySelectorAll('.pa__n, .pa__app, .pa__rows li, .pa__bars i, .pa__line')].filter((e) => getComputedStyle(e).opacity === '0').length,
      scan: getComputedStyle(document.querySelector('.pa__scan')).opacity, pre: [...document.querySelectorAll('.pa__pre')].map((e) => getComputedStyle(e).opacity).join() }));
    console.log('reduced', JSON.stringify(r)); check(r.anim === 0 && r.hiddenPart === 0 && r.scan === '0' && /^0(,0)*$/.test(r.pre), 'reduced motion should show the finished picture with nothing running');
    await (await p.$('#process')).screenshot({ path: `${out}/pw-reduced.png` });
    await ctx.close();
  }
  console.log('errors', JSON.stringify(errs)); check(errs.length === 0, 'console/page errors');
  await b.close(); console.log(ok ? 'PROCESS: ALL OK' : 'PROCESS: FAILED'); process.exitCode = ok ? 0 : 1;
})();
