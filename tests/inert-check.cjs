const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; let fails = 0;
  const chk = (ok, m) => { console.log((ok ? 'ok   ' : 'FAIL ') + m); if (!ok) fails++; };
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errs.push(m.text().slice(0, 140)));
  await p.goto(process.argv[2]); await p.waitForSelector('.mnav__btn'); await p.waitForTimeout(1500);
  chk(await p.$eval('#mnav-panel', (e) => e.inert && e.hasAttribute('inert')), 'closed menu panel is inert');
  await p.focus('.mnav__btn'); const seen = [];
  for (let i = 0; i < 4; i++) { await p.keyboard.press('Tab'); seen.push(await p.evaluate(() => !!document.activeElement?.closest('#mnav-panel'))); }
  chk(!seen.some(Boolean), 'Tab never lands inside the closed menu panel');
  await p.click('.mnav__btn'); await p.waitForTimeout(700);
  chk(await p.$eval('#mnav-panel', (e) => !e.inert && !e.hasAttribute('inert')), 'open menu panel is interactive');
  chk(await p.evaluate(() => !!document.activeElement?.closest('#mnav-panel')), 'focus moves into the open menu');
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  chk(await p.$eval('#mnav-panel', (e) => e.inert), 'Escape closes and re-inerts the panel');
  chk(await p.evaluate(() => document.activeElement?.classList.contains('mnav__btn')), 'focus returned to the menu button');
  chk(errs.length === 0, 'no console errors/warnings ' + JSON.stringify(errs));
  console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exitCode = fails ? 1 : 0; await b.close(); })();
