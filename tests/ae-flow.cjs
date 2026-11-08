// node tests/ae-flow.cjs — automation stage behaviour: natural 5-scene loop, rail jump, pause off-screen, reduced motion
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://127.0.0.1:5180/';
(async () => {
  const b = await chromium.launch(); let fails = 0; const chk = (ok, m) => { console.log((ok ? 'ok   ' : 'FAIL ') + m); if (!ok) fails++; };
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(URL); await p.waitForSelector('.ae'); await p.evaluate(() => document.querySelector('.ae').scrollIntoView({ block: 'center' }));
  const seq = []; const t0 = Date.now();
  while (Date.now() - t0 < 24000) { const s = await p.$eval('.ae', (e) => e.dataset.step); if (seq[seq.length - 1] !== s) seq.push(s); await p.waitForTimeout(250); }
  console.log('   sequence over 24s:', seq.join(' → '));
  chk(['0', '1', '2', '3', '4'].every((s, i) => seq[i] === s), 'plays 0→1→2→3→4 in order');
  chk(seq.slice(5).includes('0'), 'loops back to scene 0 after the hold');
  await p.click('.ae__step:has-text("Engine")'); await p.waitForTimeout(300);
  chk((await p.$eval('.ae', (e) => e.dataset.step)) === '2', 'rail button jumps to scene 03');
  chk((await p.$eval('.ae__step[aria-current="step"]', (e) => e.textContent)).includes('Engine'), 'aria-current follows the scene');
  await p.keyboard.press('Tab'); // focus moves on without error
  // off-screen pause
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(800); const a = await p.$eval('.ae', (e) => e.dataset.step); await p.waitForTimeout(9000); const c = await p.$eval('.ae', (e) => e.dataset.step);
  chk(a === c, `stage pauses off-screen (step ${a} → ${c} after 9 s)`);
  const copy = await p.$$eval('.ae__cap', (n) => n.map((x) => x.textContent.length > 20));
  chk(copy.length === 5 && copy.every(Boolean), 'five readable captions present');
  chk(await p.$$eval('.ae button', (n) => n.every((x) => x.getBoundingClientRect().height >= 40 || getComputedStyle(x).display === 'none')), 'rail buttons are ≥ 40px tall');
  console.log('   console errors:', JSON.stringify(errs)); chk(errs.length === 0, 'no console errors');
  // reduced motion
  const r = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const q = await r.newPage(); await q.goto(URL); await q.waitForSelector('.ae'); await q.waitForTimeout(1200);
  await q.evaluate(() => document.querySelector('.ae').scrollIntoView({ block: 'center' })); await q.waitForTimeout(4000);
  chk((await q.$eval('.ae', (e) => e.dataset.step)) === '4', 'reduced motion: finished state (step 4), never advances');
  chk((await q.$eval('.ae__pk', (e) => getComputedStyle(e).display)) === 'none', 'reduced motion: packets hidden');
  await q.screenshot({ path: '/tmp/claude-0/shots/ae/reduced.png' });
  console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exitCode = fails ? 1 : 0; await b.close();
})();
