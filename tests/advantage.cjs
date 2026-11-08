// node tests/advantage.cjs <outDir> [widths]
// MFS Advantage ("Same business. Connected."): structure, forced states 0/1/2 (screenshots), overflow, natural playback,
// column toggles, reduced motion, console errors. Screenshots are for the eye; assertions are for the machine.
const { chromium } = require('playwright');
const out = process.argv[2] || '/tmp/claude-0/shots/adv';
const widths = (process.argv[3] || '1440,1100,1024,768,390,360').split(',').map(Number);
const URL = 'http://127.0.0.1:5180/';
require('fs').mkdirSync(out, { recursive: true });
let ok = true; const errs = [];
const check = (c, m) => { if (!c) { ok = false; console.log('  FAIL', m); } };

(async () => {
  const b = await chromium.launch();

  // ---- visuals + overflow at each width
  for (const w of widths) {
    const p = await b.newPage({ viewport: { width: w, height: 1500 } });
    await p.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '.hdr,.dock,.skip,.skip-link,body::after{display:none!important}'; document.head.appendChild(s); }); });
    p.on('pageerror', (e) => errs.push(w + ' ' + e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(w + ' ' + m.text()));
    await p.goto(URL); await p.waitForSelector('.wc'); await p.waitForTimeout(700);
    await p.evaluate(() => document.querySelector('.wc').scrollIntoView({ block: 'center' })); await p.waitForTimeout(500);
    // stop the timeline from fighting the forced state (hold the stage by scrolling nothing; we write the attribute directly)
    for (const s of [0, 1, 2]) {
      await p.evaluate((n) => { const e = document.querySelector('.wc'); e.dataset.step = String(n); e.style.setProperty('--step', String(n)); }, s);
      await p.waitForTimeout(s === 0 ? 1000 : 2900);
      await (await p.$('.wc')).screenshot({ path: `${out}/wc-${w}-s${s}.png` });
    }
    const r = await p.evaluate(() => {
      const wc = document.querySelector('.wc').getBoundingClientRect();
      const stray = [...document.querySelectorAll('.wc *')].filter((e) => { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return false; const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > wc.right + 1 || r.left < wc.left - 1); }).slice(0, 5).map((e) => (e.className.baseVal ?? e.className) + '@' + Math.round(e.getBoundingClientRect().right));
      // overlap check between visible tile captions in the connected state
      const caps = [...document.querySelectorAll('.wc__t')].map((e) => e.getBoundingClientRect());
      let overlaps = 0; for (let i = 0; i < caps.length; i++) for (let j = i + 1; j < caps.length; j++) { const a = caps[i], c = caps[j]; if (a.left < c.right - 2 && c.left < a.right - 2 && a.top < c.bottom - 2 && c.top < a.bottom - 2) overlaps++; }
      const hub = document.querySelector('.wc__hub'); const hr = hub.getBoundingClientRect();
      const hubClip = [...hub.children].filter((c) => { const r = c.getBoundingClientRect(); return r.bottom > hr.bottom + 1 || r.top < hr.top - 1; }).length;
      return { sw: document.documentElement.scrollWidth, iw: innerWidth, stray, overlaps, hubH: Math.round(hr.height), hubClip, font: getComputedStyle(document.querySelector('.wc__world')).fontSize };
    });
    console.log(w, JSON.stringify(r));
    check(r.sw <= r.iw, `${w}: page overflows horizontally (${r.sw} > ${r.iw})`);
    check(r.stray.length === 0, `${w}: content leaves the stage ${r.stray}`);
    check(r.overlaps === 0, `${w}: ${r.overlaps} app tiles overlap in the connected state`);
    check(r.hubClip === 0, `${w}: hub content overflows its panel`);
    // the six advantage cards each carry a miniature interface
    const cards = await p.$$eval('.adv__card', (els) => els.map((e) => !!e.querySelector('.mini') && !!e.querySelector('h3') && e.querySelectorAll('dd').length === 3));
    check(cards.length === 6 && cards.every(Boolean), `${w}: expected 6 advantage cards with mini interface (got ${cards.length})`);
    if (w === widths[0] || w === 390) {
      await p.evaluate(() => document.querySelector('.adv__grid').scrollIntoView({ block: 'start' })); await p.waitForTimeout(2600);
      await (await p.$('.adv__grid')).screenshot({ path: `${out}/grid-${w}.png` });
    }
    await p.close();
  }

  // ---- natural playback: starts when visible, ends connected and stays there (loop:false)
  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(URL); await p.waitForSelector('.wc'); await p.waitForTimeout(500);
    const read = () => p.evaluate(() => document.querySelector('.wc').dataset.step);
    const before = await read();
    await p.evaluate(() => document.querySelector('.wc').scrollIntoView({ block: 'center' }));
    const seen = new Set(); const t0 = Date.now();
    while (Date.now() - t0 < 12000) { seen.add(await read()); await p.waitForTimeout(250); }
    const end = await read();
    console.log('playback', 'before', before, 'seen', [...seen].join(','), 'end', end);
    check(before === '0', 'stage should start at step 0');
    check(seen.has('1') && seen.has('2'), 'timeline should pass through 1 and 2');
    check(end === '2', 'timeline should rest on the connected state');
    // column toggles
    await p.click('.wc__col--no .wc__colhead'); await p.waitForTimeout(400);
    const a = await p.evaluate(() => ({ step: document.querySelector('.wc').dataset.step, no: document.querySelector('.wc__col--no .wc__colhead').getAttribute('aria-pressed'), yes: document.querySelector('.wc__col--yes .wc__colhead').getAttribute('aria-pressed') }));
    console.log('toggle → without', JSON.stringify(a)); check(a.step === '0' && a.no === 'true' && a.yes === 'false', 'clicking "Without" should show step 0');
    await p.click('.wc__col--yes .wc__colhead'); await p.waitForTimeout(400);
    const c = await p.evaluate(() => ({ step: document.querySelector('.wc').dataset.step, no: document.querySelector('.wc__col--no .wc__colhead').getAttribute('aria-pressed'), yes: document.querySelector('.wc__col--yes .wc__colhead').getAttribute('aria-pressed') }));
    console.log('toggle → with', JSON.stringify(c)); check(c.step === '2' && c.no === 'false' && c.yes === 'true', 'clicking "With MFS" should show step 2');
    // keyboard
    await p.focus('.wc__col--no .wc__colhead'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
    check((await read()) === '0', 'Enter on the "Without" header should show step 0');
    await p.close();
  }

  // ---- reduced motion: finished state, no running animation on the flow lines
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push('rm ' + e.message));
    await p.goto(URL); await p.waitForSelector('.wc'); await p.waitForTimeout(600);
    await p.evaluate(() => document.querySelector('.wc').scrollIntoView({ block: 'center' })); await p.waitForTimeout(800);
    const r = await p.evaluate(() => ({ step: document.querySelector('.wc').dataset.step, anim: getComputedStyle(document.querySelector('.wc__flow')).animationName, hub: getComputedStyle(document.querySelector('.wc__hub')).opacity }));
    console.log('reduced', JSON.stringify(r)); check(r.step === '2' && r.anim === 'none' && +r.hub === 1, 'reduced motion should show the finished state without animation');
    await (await p.$('.wc')).screenshot({ path: `${out}/wc-reduced.png` });
    await ctx.close();
  }

  console.log('errors', JSON.stringify(errs)); check(errs.length === 0, 'console/page errors');
  await b.close(); console.log(ok ? 'ADVANTAGE: ALL OK' : 'ADVANTAGE: FAILED'); process.exitCode = ok ? 0 : 1;
})();
