// node tests/standalone.cjs <file:// URL of dist/index.html> <http URL>
// Verifies the build works BOTH when index.html is opened by double-click (file://) and through `npm start` (http).
const { chromium } = require('playwright');
const targets = [['file://', process.argv[2]], ['http', process.argv[3]]];
(async () => {
  const b = await chromium.launch(); let fails = 0;
  const chk = (ok, msg) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) fails++; };
  for (const [label, url] of targets) {
    console.log('\n== ' + label + '  ' + url);
    const p = await b.newPage({ viewport: { width: 1366, height: 800 } }); const errs = [], bad = [];
    p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
    p.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errs.push(m.type() + ': ' + m.text().slice(0, 160)));
    p.on('requestfailed', (r) => bad.push('failed ' + r.url().slice(-60)));
    p.on('response', (r) => r.status() >= 400 && bad.push(r.status() + ' ' + r.url().slice(-60)));
    await p.goto(url); await p.waitForTimeout(2600);
    const r = await p.evaluate(async () => {
      await document.fonts.ready;
      return {
        h1: document.querySelector('h1')?.textContent, cards: document.querySelectorAll('.hp__card').length, ts: !!document.querySelector('.ts'),
        fonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '') + ' ' + f.weight).sort(),
        brokenImgs: [...document.images].filter((i) => i.complete && !i.naturalWidth && i.loading !== 'lazy').length,
        h1Font: getComputedStyle(document.querySelector('h1')).fontFamily.slice(0, 40),
      };
    });
    console.log('   ', JSON.stringify(r));
    chk(!!r.h1 && r.h1.includes('time back'), 'hero headline rendered');
    chk(r.cards === 11, '11 service cards');
    chk(r.fonts.some((f) => f.startsWith('GFS Baskerville')) && r.fonts.some((f) => f.startsWith('Inter')), 'webfonts actually loaded: ' + r.fonts.join(', '));
    chk(r.brokenImgs === 0, 'no broken images');
    // hero is moving
    const s1 = await p.screenshot({ clip: { x: 600, y: 200, width: 700, height: 500 } }); await p.waitForTimeout(700); const s2 = await p.screenshot({ clip: { x: 600, y: 200, width: 700, height: 500 } });
    chk(Buffer.compare(s1, s2) !== 0, 'hero background is animating');
    // nav + demo run under this protocol
    await p.evaluate(() => { location.hash = '#demo-lead'; }); await p.waitForSelector('.dm[data-demo="lead"]'); await p.evaluate(() => document.querySelector('.dm[data-demo="lead"]').scrollIntoView()); await p.waitForTimeout(800);
    await p.getByRole('button', { name: 'Next step' }).click(); await p.waitForTimeout(500);
    const done = (await p.textContent('.dm__cap b')).startsWith('2/6'); chk(done, 'lead demo steps forward under this protocol');
    await p.waitForTimeout(1800); // the outcome panel finishes expanding (~1 s) before we jump away
    await p.evaluate(() => document.getElementById('closing').scrollIntoView({ block: 'center' })); await p.waitForTimeout(20000); // the board needs ~17 s to play all four lines
    const board = await p.$$eval('.tfb__cell', (cs) => { const t = cs.map((c) => c.dataset.ch || ' ').join(''); return [t.slice(0, 22).trim(), t.slice(22).trim()]; });
    chk(board[0] === 'YOU KNOW THE BUSINESS.' && board[1] === 'I KNOW THE CHEMISTRY.', 'closing board settles: ' + JSON.stringify(board));
    chk(errs.length === 0, 'no console errors/warnings ' + JSON.stringify(errs));
    chk(bad.length === 0, 'no failed requests ' + JSON.stringify(bad));
    await p.close();
  }
  console.log(fails ? '\n' + fails + ' FAILED' : '\nALL OK'); process.exitCode = fails ? 1 : 0; await b.close();
})();
