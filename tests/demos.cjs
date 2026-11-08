// node tests/demos.cjs [WxH] [ids,comma]  — each demo autoplays through its guided sequence in view; checks errors, final step, page overflow; saves screenshots
const { chromium } = require('playwright'); const fs = require('fs');
const IDS = ['lead', 'agent', 'whatsapp', 'marketing', 'process', 'api', 'inventory', 'invoice', 'dashboard'];
(async () => { const vp = (process.argv[2] || '1440x900').split('x').map(Number); const ids = (process.argv[3] || IDS.join(',')).split(','); fs.mkdirSync('/tmp/claude-0/dm', { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: vp[0], height: vp[1] } }); const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto('http://127.0.0.1:5180/'); await p.waitForTimeout(800); let bad = 0;
  for (const id of ids) {
    await p.evaluate(() => document.querySelector('#demos').scrollIntoView({ behavior: 'instant' })); await p.click('#tab-' + id); await p.waitForTimeout(300);
    await p.evaluate(() => { const e = document.querySelector('.dm__stage'); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - 90, behavior: 'instant' }); });
    const n = await p.evaluate(() => document.querySelectorAll('.dm__prog li').length);
    let ok = false; for (let i = 0; i < 40 && !ok; i++) { await p.waitForTimeout(700); ok = (await p.textContent('.dm__cap b')).startsWith(`${n}/${n}`); }
    await p.waitForTimeout(1300); const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    await p.screenshot({ path: `/tmp/claude-0/dm/${id}-${vp[0]}.png` }); const flag = !ok || ov > 0; if (flag) bad++;
    console.log(id.padEnd(10), 'steps', n, 'finished', ok, 'overflow', ov, flag ? 'FAIL' : 'ok'); }
  console.log('errors', errs); console.log(bad || errs.length ? 'DEMOS: FAILED' : 'DEMOS: ALL OK'); await b.close(); process.exitCode = bad || errs.length ? 1 : 0; })();
