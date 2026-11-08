// About FAQ + Cal.com contact. app.cal.com is mocked (or blocked) because the live service is not reachable from every environment —
// this verifies OUR integration (lazy load, correct event link, states, fallback), not Cal.com's own booking flow.
const { chromium } = require('playwright'); const fs = require('fs');
const URL = process.argv[2] || 'http://localhost:5180/'; const out = process.argv[3] || '/tmp/claude-0/ac'; fs.mkdirSync(out, { recursive: true });
const W = (process.argv[4] || '1440x900,390x844').split(',').map((s) => s.split('x').map(Number));
const LINK = 'murali-forge-systems-1bhduf/30min'; let fails = 0; const chk = (ok, m) => { console.log((ok ? 'ok   ' : 'FAIL ') + m); if (!ok) fails++; };
const MOCK = `(() => { const q = window.Cal.ns.mfsdiscovery.q; window.__calls = []; let ready;
  for (const a of q) { const n = a[0]; if (n === 'on' && a[1].action === 'linkReady') ready = a[1].callback; if (n === 'inline') { window.__calls.push({ n, link: a[1].calLink, layout: a[1].layout }); const el = a[1].elementOrSelector; const f = document.createElement('iframe'); f.title = 'cal'; f.style.cssText = 'width:100%;height:640px;border:0'; f.srcdoc = '<body style="font:16px sans-serif;margin:0;padding:24px">Mock Cal.com event</body>'; el.appendChild(f); } else window.__calls.push({ n }); }
  setTimeout(() => ready && ready(), 400); })();`;
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of W) {
    console.log('--- ' + w + 'x' + h);
    // ---- mocked, working embed
    let ctx = await b.newContext({ viewport: { width: w, height: h } }); let p = await ctx.newPage(); const errs = []; let embedReq = 0;
    p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 140)));
    await p.route('https://app.cal.com/embed/embed.js', (r) => { embedReq++; r.fulfill({ contentType: 'application/javascript', body: MOCK }); });
    await p.goto(URL); await p.waitForSelector('#about'); await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    const go = async (id) => { await p.evaluate((i) => document.getElementById(i).scrollIntoView({ block: 'start' }), id); await p.waitForTimeout(1500); };
    await go('about');
    chk((await p.locator('.fq button.fq__b').count()) === 8, 'about: all eight questions in the DOM');
    const vis = async () => p.$$eval('.fq button.fq__b', (bs) => bs.filter((x) => !x.closest('[inert]') && getComputedStyle(x.closest('.fq__more') || document.body).visibility !== 'hidden').length);
    chk((await vis()) === 6, 'about: six priority questions visible initially');
    chk(!!(await p.$('.tg')), 'about: brand statement (animated tagline) still present');
    chk((await p.$eval('#about-title', (e) => e.innerText)).replace(/\s+/g, ' ').includes('Clear Expectations. Practical Solutions. Professional Delivery.'), 'about: new headline');
    const first = (await p.textContent('.fq__q >> nth=0'));
    chk(first.startsWith('How long does it take'), 'about: first priority question is project completion time');
    chk((await p.getAttribute('#fq-b0', 'aria-expanded')) === 'true', 'about: first question open by default');
    await p.click('#fq-b2'); await p.waitForTimeout(700);
    chk((await p.$$eval('.fq__i[data-open="true"]', (e) => e.length)) === 1 && (await p.getAttribute('#fq-b2', 'aria-expanded')) === 'true' && (await p.getAttribute('#fq-b0', 'aria-expanded')) === 'false', 'about: only one question open at a time');
    await p.click('#fq-b4'); await p.waitForTimeout(800);
    chk((await p.locator('.pay li').count()) === 3 && (await p.$$eval('.pay b', (e) => e.map((x) => x.textContent).join())) === '30%,40%,30%', 'about: payment structure 30/40/30 shown in advance-payment answer');
    await p.screenshot({ path: `${out}/about-${w}.png` });
    await p.focus('#fq-b4'); await p.keyboard.press('ArrowUp'); chk(await p.evaluate(() => document.activeElement.id) === 'fq-b3', 'about: ArrowUp moves focus to previous question');
    await p.keyboard.press('Home'); chk(await p.evaluate(() => document.activeElement.id) === 'fq-b0', 'about: Home focuses first question');
    await p.keyboard.press('Enter'); await p.waitForTimeout(500); chk((await p.getAttribute('#fq-b0', 'aria-expanded')) === 'true', 'about: Enter opens a question from the keyboard');
    await p.click('#fq-b0'); await p.waitForTimeout(500); chk((await p.$$eval('.fq__i[data-open="true"]', (e) => e.length)) === 0, 'about: an open question can be closed');
    chk((await p.$$eval('.fq > .fq__list > .fq__i', (e) => e.map((x) => +getComputedStyle(x).opacity))).every((o) => o === 1), 'about: every priority row stays visible after interactions (reveal state not clobbered)');
    await p.click('.fq__all'); await p.waitForTimeout(900);
    chk((await vis()) === 8 && (await p.textContent('.fq__all')).includes('Show fewer'), 'about: View All FAQs reveals the remaining two');
    await p.click('#fq-b7'); await p.waitForTimeout(800); chk((await p.getAttribute('#fq-b7', 'aria-expanded')) === 'true', 'about: extra question opens');
    await p.screenshot({ path: `${out}/about-all-${w}.png` });
    await p.click('.fq__all'); await p.waitForTimeout(900); chk((await vis()) === 6 && (await p.getAttribute('#fq-b7', 'aria-expanded')) === 'false', 'about: Show fewer collapses and closes the hidden item');

    // ---- contact
    await go('contact'); const c = '#contact';
    chk((await p.locator(`${c} form, ${c} input, ${c} textarea, ${c} select`).count()) === 0, 'contact: old form and all its fields are gone');
    chk(!(await p.textContent(c)).includes('cal.com'), 'contact: raw booking URL not shown as text');
    chk(embedReq === 0 && (await p.locator('iframe').count()) === 0, 'contact: Cal.com not loaded before it is requested');
    const hidden = await p.$eval('#ct-book', (e) => getComputedStyle(e).visibility === 'hidden' && e.inert && e.getBoundingClientRect().height < 2);
    chk(hidden, 'contact: booking calendar hidden + inert + zero height initially');
    chk((await p.textContent('.ct__btn')).trim() === 'Book an MFS Discovery Call', 'contact: CTA label');
    chk((await p.getAttribute('.ct__mail a', 'href')) === 'mailto:muraliforgesystems@gmail.com', 'contact: discreet email alternative');
    await p.screenshot({ path: `${out}/contact-closed-${w}.png` });
    await p.click('.ct__btn'); await p.waitForTimeout(2200);
    chk((await p.textContent('.ct__btn')).trim() === 'Hide Booking Calendar' && (await p.getAttribute('.ct__btn', 'aria-expanded')) === 'true', 'contact: button becomes "Hide Booking Calendar", aria-expanded true');
    chk(embedReq === 1, 'contact: official embed.js requested once, on demand');
    const calls = await p.evaluate(() => window.__calls);
    chk(calls.some((x) => x.n === 'inline' && x.link === LINK && x.layout === 'month_view'), 'contact: inline embed initialised with the exact event ' + LINK);
    chk(calls.some((x) => x.n === 'ui') && calls.some((x) => x.n === 'on'), 'contact: ui theme settings and ready/failed listeners registered');
    chk((await p.getAttribute('.cal', 'data-state')) === 'ready' && (await p.locator('.cal__fail').count()) === 0 && (await p.locator('.cal__load').count()) === 0, 'contact: loading cleared on ready, no fallback shown');
    const box = await p.$eval('.ct__panel', (e) => { const r = e.getBoundingClientRect(); return { w: r.width, h: r.height, vis: getComputedStyle(e).opacity }; });
    chk(box.h >= 600 && box.w > (w <= 560 ? w - 56 : w <= 1024 ? w - 200 : 700) && box.vis === '1', `contact: booking panel is large (${Math.round(box.w)}x${Math.round(box.h)}) and visible`);
    await p.screenshot({ path: `${out}/contact-open-${w}.png` });
    const ifr = await p.$eval('.cal iframe', (e) => (e.__k = 'kept', 1));
    await p.click('.ct__btn'); await p.waitForTimeout(1200);
    chk((await p.$eval('#ct-book', (e) => e.inert && e.getBoundingClientRect().height < 2 && getComputedStyle(e).visibility === 'hidden')) && (await p.textContent('.ct__btn')).trim() === 'Book an MFS Discovery Call', 'contact: Hide collapses the calendar and restores the label');
    await p.click('.ct__btn'); await p.waitForTimeout(1500);
    chk(embedReq === 1 && (await p.$eval('.cal iframe', (e) => e.__k)) === 'kept', 'contact: iframe instance preserved across hide/show (no reload, one script load)');
    await p.keyboard.press('Tab'); // keyboard path: button is a real button, focus ring exists
    chk((await p.$eval('.ct__btn', (e) => e.tagName)) === 'BUTTON', 'contact: CTA is a semantic button');
    // site-wide
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    chk(over <= 0, 'no horizontal overflow (' + over + ')');
    chk(errs.length === 0, 'no console/page errors ' + JSON.stringify(errs));
    await ctx.close();

    // ---- embed script blocked -> fallback appears only then
    ctx = await b.newContext({ viewport: { width: w, height: h } }); p = await ctx.newPage();
    await p.route('https://app.cal.com/**', (r) => r.abort()); await p.goto(URL); await p.waitForSelector('#contact'); await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    await p.evaluate(() => document.getElementById('contact').scrollIntoView()); await p.waitForTimeout(1200);
    chk((await p.locator('.cal__fail').count()) === 0, 'fallback: not present before opening');
    await p.click('.ct__btn'); await p.waitForTimeout(2000);
    chk((await p.locator('.cal__fail').count()) === 1 && (await p.textContent('.cal__fail-t')) === 'Having trouble opening the booking calendar?', 'fallback: message appears when the embed cannot load');
    const href = await p.getAttribute('.cal__fail a', 'href'); chk(href === 'https://cal.com/' + LINK && (await p.textContent('.cal__fail a')) === 'Open Booking Page', 'fallback: "Open Booking Page" opens the exact event URL');
    await p.screenshot({ path: `${out}/contact-fallback-${w}.png` });
    await ctx.close();
  }
  // reduced motion: states still correct
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); await p.route('https://app.cal.com/**', (r) => r.abort()); await p.goto(URL); await p.waitForSelector('#contact');
    await p.evaluate(() => document.getElementById('contact').scrollIntoView()); await p.waitForTimeout(800); await p.click('.ct__btn'); await p.waitForTimeout(600);
    chk(await p.$eval('#ct-book', (e) => !e.inert && e.getBoundingClientRect().height > 300), 'reduced motion: panel opens immediately'); await ctx.close(); }
  await b.close(); console.log(fails ? `FAILED ${fails}` : 'ALL OK'); process.exit(fails ? 1 : 0);
})();
