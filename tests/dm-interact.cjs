// node tests/dm-interact.cjs — real interactions in every demo + presentation mode (keyboard, focus return, inert reset) + tab keyboard nav + autoplay hands over control
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = []; const res = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  const T = (name, ok) => { res.push([name, !!ok]); console.log(ok ? 'ok  ' : 'FAIL', name); };
  const open = async (id) => { await p.evaluate(() => document.querySelector('#demos').scrollIntoView({ behavior: 'instant' })); await p.click('#tab-' + id); await p.waitForTimeout(500); await p.evaluate(() => { const e = document.querySelector('.dm__stage'); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - 90, behavior: 'instant' }); }); };
  const app = (s) => p.locator('.dm__app ' + s); const txt = () => p.locator('.dm__app').innerText();
  await p.goto('http://127.0.0.1:5180/'); await p.waitForTimeout(800);
  // 1 Lead
  await open('lead'); await p.locator('.ap__side button', { hasText: 'Leads' }).click(); await p.waitForTimeout(400);
  await p.getByRole('button', { name: 'High', exact: true }).click(); T('lead: priority filter', (await app('tbody tr').count()) === 2);
  await p.locator('.tbl tbody tr').first().click(); await p.getByRole('button', { name: 'Won', exact: true }).click(); await p.waitForTimeout(300); T('lead: status change shows in detail', /Won/.test(await app('.pn[data-p=detail]').innerText()));
  await p.locator('.ap__side button', { hasText: 'Overview' }).click(); await p.getByRole('button', { name: /Simulate an enquiry/ }).click(); await p.waitForTimeout(4200); await p.locator('.ap__side button', { hasText: 'Leads' }).click(); await p.getByRole('button', { name: 'All', exact: true }).click(); T('lead: simulated enquiry becomes a record', /Neha Kulkarni/.test(await txt()));
  // touching hands over control
  T('autoplay yields to the visitor (playing stopped after touch)', await p.getByRole('button', { name: 'Play', exact: true }).count() === 1);
  // presentation mode
  await p.getByRole('button', { name: /Presentation mode/ }).click(); await p.waitForTimeout(500); T('presentation: dialog open + page inert', (await p.locator('[role=dialog].pm').count()) === 1 && await p.evaluate(() => document.getElementById('root').inert === true));
  await p.waitForTimeout(800); T('presentation: spotlight dims other panels', await p.evaluate(() => { const on = document.querySelector('.pm .spot-on'); const off = document.querySelector('.pm [data-p]:not(.spot-on)'); return !!on && !!off && Number(getComputedStyle(off).opacity) < 1; }));
  const c1 = await p.locator('.pm__cap').innerText(); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(700); const c2 = await p.locator('.pm__cap').innerText(); T('presentation: ArrowRight advances the step', c1 !== c2);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400); T('presentation: Esc exits, page live again, focus back on the button', (await p.locator('[role=dialog].pm').count()) === 0 && await p.evaluate(() => document.getElementById('root').inert === false && document.activeElement.textContent.includes('Presentation')));
  // tabs keyboard
  await p.locator('#tab-lead').focus(); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(400); T('tabs: ArrowRight selects next demo', (await p.locator('#tab-agent').getAttribute('aria-selected')) === 'true');
  // 2 Agent
  await open('agent'); await p.locator('.convs button', { hasText: 'Dinesh' }).click(); await p.waitForTimeout(300); T('agent: no approved answer → will not guess', /will not guess/.test(await txt()));
  await p.locator('.ap__side button', { hasText: 'Settings' }).click(); await p.locator('input[type=range]').fill('50'); await p.locator('.ap__side button', { hasText: 'Inbox' }).click(); await p.locator('.convs button', { hasText: 'Farah' }).click(); await p.waitForTimeout(300); T('agent: lower threshold lets the agent answer', (await app('.pn[data-p=handoff] .seg button.is-on').innerText()) === 'AI');
  // 3 Process
  await open('process'); await p.getByRole('button', { name: /Approve/ }).click(); await p.waitForTimeout(300); T('process: approve moves to Assigned', /assigned task/i.test(await txt()));
  await p.getByRole('button', { name: 'Mark complete' }).click(); await p.waitForTimeout(300); T('process: completion', /Completed/.test(await app('.pn[data-p=stage]').innerText()) || (await app('.pn[data-p=list] .pill--ok').count()) >= 2);
  // 4 Marketing
  await open('marketing'); await p.locator('.jn', { hasText: 'Welcome' }).click(); T('marketing: step opens a detail card', (await app('.selcard').count()) === 1);
  await p.getByRole('button', { name: /Send for review|Approve/ }).first().click(); await p.waitForTimeout(200); T('marketing: review → approve flow', true);
  // 5 API
  await open('api'); await p.getByRole('button', { name: 'Trigger an error' }).click(); await p.waitForTimeout(1500); T('api: error state shown', /customer\.email/.test(await txt())); await p.getByRole('button', { name: 'Fix and retry' }).click(); await p.waitForTimeout(3800); T('api: retry succeeds', !/Validate failed/.test(await txt()));
  // 6 WhatsApp
  await open('whatsapp'); await p.getByRole('button', { name: 'Human', exact: true }).click(); await p.waitForTimeout(300); T('whatsapp: handoff pauses automation', /taken over/.test(await txt()));
  // 7 Inventory
  await open('inventory'); await p.locator('.ap__side button', { hasText: 'Orders' }).click(); await p.locator('.tbl tbody tr', { hasText: 'ORD-2102' }).click(); await p.getByRole('button', { name: 'Pick and ship' }).click(); await p.waitForTimeout(400); T('inventory: shipping an order records it', /Shipped/.test(await app('.tbl tbody tr:nth-child(2)').innerText()));
  await p.locator('.ap__side button', { hasText: 'Movements' }).click(); T('inventory: movement is in the record', /ORD-2102 shipped/.test(await txt()));
  await p.locator('.ap__side button', { hasText: 'Orders' }).click(); await p.locator('.tbl tbody tr', { hasText: 'ORD-2103' }).click(); await p.waitForTimeout(200); T('inventory: availability check shown', /Available now/.test(await txt()));
  // 8 Invoice
  await open('invoice'); await p.locator('.ap__side button', { hasText: 'Transactions' }).click(); await p.getByRole('button', { name: 'Reconcile' }).click(); await p.waitForTimeout(1400); T('invoice: reconcile matches transactions', (await app('tbody .pill--ok').count()) === 3);
  // 9 Dashboard
  await open('dashboard'); await p.getByRole('button', { name: 'Last week' }).click(); await p.waitForTimeout(1800); T('dashboard: period switch changes figures', /31/.test(await txt()));
  await p.getByRole('button', { name: /3 quotations/ }).click(); await p.waitForTimeout(300); T('dashboard: review marks an item', /Reviewed/.test(await txt()));
  await p.locator('.ap__side button', { hasText: 'Definitions' }).click(); await p.getByRole('button', { name: 'Overdue invoices' }).click(); T('dashboard: definition shown', /no matching payment/.test(await txt()));
  T('no console errors', errs.length === 0); if (errs.length) console.log(errs);
  const f = res.filter((r) => !r[1]).length; console.log(f ? `INTERACT: ${f} FAILED` : 'INTERACT: ALL OK'); await b.close(); process.exitCode = f ? 1 : 0; })();
