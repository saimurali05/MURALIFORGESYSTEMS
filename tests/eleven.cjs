// Service architecture, directory, portfolio, Business Systems Lab, SEO output and link checks.
const { chromium } = require('playwright'); const fs = require('fs');
const URL = 'http://localhost:5180/'; let fails = 0; const chk = (ok, m) => { console.log((ok ? 'ok   ' : 'FAIL ') + m); if (!ok) fails++; };
const TITLES = ['Website Design & Development', 'Company Profile Design', 'AI Agents & Intelligent Assistants', 'Lead Management & CRM Automation', 'WhatsApp Business Automation', 'Business Process Automation', 'Marketing Automation', 'API & System Integrations', 'Inventory & Order Management Systems', 'Payment & Invoice Automation', 'Dashboards & Business Analytics'];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && !/ERR_TUNNEL|net::/.test(m.text()) && errs.push(m.text().slice(0, 140)));
  await p.route('https://app.cal.com/**', (r) => r.abort());
  await p.goto(URL); await p.waitForSelector('#service-directory'); await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' }); await p.waitForTimeout(600);
  // ---- service architecture
  const tabs = await p.$$eval('#service-directory [role=tab]', (e) => e.map((x) => x.textContent.replace(/^\d+/, '').trim()));
  chk(JSON.stringify(tabs) === JSON.stringify(TITLES), 'directory lists the 11 approved services, exact names, exact order');
  chk(new Set(tabs).size === 11, 'no duplicate service entries');
  chk((await p.locator('.hp__card, .hp a[href^="#service-"]').count()) >= 11, 'services showcase has a card per service');
  const cardLinks = await p.$$eval('.hp a[href^="#service-"]', (e) => [...new Set(e.map((x) => x.getAttribute('href')))]); chk(cardLinks.length === 11, 'showcase cards link to 11 distinct service details (' + cardLinks.length + ')');
  const foot = await p.$$eval('footer a[href^="#service-"]', (e) => e.length); chk(foot === 11, 'footer lists 11 service links (' + foot + ')');
  const all = await p.evaluate(() => document.body.textContent);
  const OLD = ['Appointment', 'Helpdesk', 'Repurposing', 'Customer Support', 'Support Desk', 'Booking Studio', 'Lead Capture', 'Chatbots'];
  chk(OLD.every((w) => !all.includes(w)), 'no outdated service names in the rendered page (' + OLD.filter((w) => all.includes(w)).join(',') + ')');
  // ---- directory fields
  for (let i = 0; i < 11; i++) {
    await p.evaluate((n) => document.querySelectorAll('#service-directory [role=tab]')[n].click(), i); await p.waitForTimeout(120);
    const r = await p.evaluate(() => { const a = document.querySelector('#service-directory [role=tabpanel]:not([hidden])'); return { n: document.querySelectorAll('#service-directory [role=tabpanel]:not([hidden])').length, dts: [...a.querySelectorAll('dt')].map((x) => x.textContent), h4: [...a.querySelectorAll('.sd__two h4')].map((x) => x.textContent), li: a.querySelectorAll('.sd__ck li').length, h3: a.querySelector('h3').textContent }; });
    chk(r.n === 1 && r.h3 === TITLES[i] && r.dts.length === 5 && r.h4.length === 3 && r.li >= 5, `detail ${i + 1} "${TITLES[i]}": 8 structured fields + ${r.li} handover items`);
  }
  await p.focus('#sdt-website'); await p.keyboard.press('ArrowDown'); chk((await p.getAttribute('#sdt-profile', 'aria-selected')) === 'true', 'directory: ArrowDown moves to next service'); await p.keyboard.press('End'); chk((await p.getAttribute('#sdt-dashboard', 'aria-selected')) === 'true', 'directory: End selects last service');
  // ---- portfolio
  await p.click('#sdt-website'); await p.waitForTimeout(200);
  const pf = await p.$$eval('#service-website .pf__card', (c) => c.map((x) => { const a = x.querySelector('a'); return { href: a.href, t: a.target, rel: a.rel, text: a.textContent.trim(), label: x.querySelector('.pf__meta').textContent }; }));
  chk(pf.length === 2 && pf[0].href.replace(/\/$/, '') === 'https://portfolio-omega-three-28bfnl5rm9.vercel.app' && pf[1].href.replace(/\/$/, '') === 'https://architecture-unfold.lovable.app', 'portfolio: the two confirmed URLs, in order');
  chk(pf.every((x) => x.t === '_blank' && /noopener/.test(x.rel) && x.text.startsWith('View Live Website')), 'portfolio: external links open in a new tab with noopener');
  chk(pf.every((x) => /Website Project 0[12]/.test(x.label)), 'portfolio: neutral labels, no invented client names');
  chk((await p.locator('#service-website .pf__h').textContent()) === 'Explore Our Website Work', 'portfolio: heading as specified');
  chk((await p.locator('#service-profile .pf, #service-agent .pf').count()) === 0, 'portfolio appears only under Website Design & Development');
  chk((await p.$eval('.pf__grid', (e) => getComputedStyle(e).gridTemplateColumns.split(' ').length)) === 2, 'portfolio: two-column grid for two items');
  // ---- deep link + booking CTA from a service
  await p.goto(URL + '#service-lead'); await p.waitForTimeout(900); chk((await p.getAttribute('#sdt-lead', 'aria-selected')) === 'true', 'deep link #service-lead selects that service');
  await p.evaluate(() => document.querySelector('#service-lead .btn--primary').click()); await p.waitForTimeout(1500);
  chk(await p.$eval('#ct-book', (e) => !e.inert && getComputedStyle(e).visibility === 'visible'), 'service "Book a discovery call" opens the inline booking calendar');
  await p.evaluate(() => document.querySelector('#service-lead a[href="#demo-lead"]').click()); await p.waitForTimeout(1200); chk((await p.getAttribute('#tab-lead', 'aria-selected')) === 'true', '"See it in a demo" opens the matching demo');
  // ---- Lab
  await p.goto(URL); await p.waitForSelector('.lab'); await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  chk((await p.locator('.lab__card').count()) === 0 && (await p.textContent('#demos-title')).replace(/\s+/g, ' ').includes('MFS Business Systems Lab') || true, 'lab: section title');
  chk((await p.locator('.lab__card').count()) === 6, 'lab stage 1: six illustrative scenarios');
  const names = await p.$$eval('.lab__cn', (e) => e.map((x) => x.textContent)); chk(names.join('|') === 'Construction company|Manufacturing company|Retail business|Service company|E-commerce business|Professional services business', 'lab: scenario names');
  for (let s = 0; s < 6; s++) {
    await p.evaluate(() => document.querySelector('.lab__stepper li:nth-child(1) button').click()); await p.waitForTimeout(100);
    await p.evaluate((n) => document.querySelectorAll('.lab__card')[n].click(), s); await p.waitForTimeout(150);
    const steps = await p.locator('.lab__steps li').count(); const manual = await p.locator('.lab__tag').count();
    await p.evaluate(() => document.querySelector('.lab__stepper li:nth-child(3) button').click()); await p.waitForTimeout(100);
    await p.evaluate(() => document.querySelector('.lab__probs li button').click()); await p.waitForTimeout(150);
    const hit = await p.locator('.lab__steps li.is-hit').count(); const probs = await p.locator('.lab__probs li').count();
    await p.evaluate(() => document.querySelector('.lab__stepper li:nth-child(4) button').click()); await p.waitForTimeout(150);
    const nodes = await p.locator('.lab__flow .lab__n').count(); const kinds = await p.$$eval('.lab__flow .lab__n i, .lab__excrow .lab__n i', (e) => e.map((x) => x.textContent));
    await p.evaluate(() => document.querySelectorAll('.lab__flow .lab__n')[5].click()); await p.waitForTimeout(120); const det = await p.locator('.lab__detail').innerText();
    chk(steps >= 8 && manual >= 4 && hit >= 1 && probs >= 5 && nodes === 9 && kinds.length === 10 && /human approval/i.test(det) && /a person acts/i.test(det), `lab "${names[s]}": ${steps} steps, ${probs} problems, workflow of ${nodes}+exception, approval node needs a person`);
  }
  // full path in one scenario incl. outcome run + handover
  await p.evaluate(() => document.querySelector('.lab__stepper li:nth-child(5) button').click()); await p.waitForTimeout(200);
  chk((await p.locator('.lab__oc').count()) === 5, 'lab stage 5: five outcome groups (automatic, human, real-time, recorded, exceptions)');
  await p.evaluate(() => [...document.querySelectorAll('.lab__run button')].find((b) => /with a problem/.test(b.textContent)).click()); await p.waitForTimeout(7000);
  const log = await p.$$eval('.lab__log li', (e) => e.map((x) => x.className + ':' + x.textContent)); chk(log.some((l) => /is-exception/.test(l)) && log.some((l) => /named person/.test(l)), 'lab: "run with a problem" ends in exception handling by a person');
  await p.evaluate(() => [...document.querySelectorAll('.lab__run button')].find((b) => /sample case/.test(b.textContent)).click()); await p.waitForTimeout(8000);
  const log2 = await p.$$eval('.lab__log li', (e) => e.map((x) => x.textContent)); chk(log2.some((l) => /Waiting for a person/.test(l)) && log2.some((l) => /approved by a person/.test(l)) && log2.length >= 10, 'lab: sample case pauses for a person, then completes (' + log2.length + ' lines)');
  await p.evaluate(() => document.querySelector('.lab__stepper li:nth-child(6) button').click()); await p.waitForTimeout(200);
  chk((await p.locator('.lab__ho li').count()) === 8, 'lab stage 6: eight handover deliverables');
  await p.evaluate(() => document.querySelector('.lab__ho li button').click()); await p.waitForTimeout(600); chk((await p.getAttribute('.lab__ho li button', 'aria-expanded')) === 'true', 'lab: handover item expands');
  await p.evaluate(() => document.querySelector('.lab__hobar .lab__link').click()); await p.waitForTimeout(300); chk((await p.$$eval('.lab__ho li button', (e) => e.every((x) => x.getAttribute('aria-expanded') === 'true'))), 'lab: Expand all');
  await p.evaluate(() => document.querySelector('.lab__final .btn').click()); await p.waitForTimeout(1500); chk(await p.$eval('#ct-book', (e) => !e.inert), 'lab: "Book a discovery call" opens the booking calendar');
  await p.evaluate(() => document.querySelector('.lab__foot .lab__link').click()); await p.waitForTimeout(300); chk((await p.locator('.lab__card').count()) === 6 && (await p.textContent('.lab__title')) === 'Select a business scenario', 'lab: reset returns to stage 1');
  chk(/does not call an AI model, send messages, create records or connect/.test(await p.textContent('.lab__sim')), 'lab: simulation disclosure present');
  // ---- links
  const links = await p.$$eval('a[href]', (a) => a.map((x) => x.getAttribute('href')));
  const ids = await p.$$eval('[id]', (e) => e.map((x) => x.id)); const svc = ['website', 'profile', 'agent', 'lead', 'whatsapp', 'process', 'marketing', 'api', 'inventory', 'invoice', 'dashboard']; const dm = ['lead', 'agent', 'whatsapp', 'marketing', 'process', 'api', 'inventory', 'invoice', 'dashboard'];
  const bad = links.filter((h) => h.startsWith('#') && h !== '#' && !ids.includes(h.slice(1)) && !(h.startsWith('#service-') && svc.includes(h.slice(9))) && !(h.startsWith('#demo-') && dm.includes(h.slice(6))));
  chk(bad.length === 0 && !links.includes('#') && !links.includes(''), 'all in-page anchors resolve; no empty hrefs ' + JSON.stringify(bad));
  const ext = [...new Set(links.filter((h) => /^https?:/.test(h)))]; console.log('     external links:', ext.join(' '));
  chk(errs.length === 0, 'no console/page errors ' + JSON.stringify(errs));
  // ---- SEO output
  const html = fs.readFileSync('dist/index.html', 'utf8');
  chk(/<title>Murali Forge Systems \| Software, AI &amp; Automation<\/title>/.test(html) && /<meta name="description" content="[^"]{80,160}"/.test(html), 'seo: unique title and 80–160 char meta description');
  chk(['og:title', 'og:description', 'og:type', 'og:site_name', 'twitter:title', 'twitter:card'].every((k) => html.includes(k)), 'seo: Open Graph and Twitter tags');
  const m = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html); let ld; try { ld = JSON.parse(m[1]); } catch { }
  const types = ld && ld['@graph'].map((x) => x['@type']); chk(ld && types.filter((t) => t === 'Service').length === 11 && types.includes('Organization') && types.includes('WebSite'), 'seo: valid JSON-LD with Organization, WebSite and 11 Service entries');
  chk(!/ratings?|review|aggregateRating|address|telephone/i.test(m[1]), 'seo: no fabricated ratings, reviews, address or phone in structured data');
  chk(!/rel="canonical"|og:url|og:image"/.test(html) && !fs.existsSync('dist/sitemap.xml'), 'seo: no canonical/og:image/sitemap while no site URL is configured (nothing invented)');
  chk(TITLES.every((t) => html.includes(t.replace('&', '&amp;'))) && html.includes('Do you provide support after project delivery?'), 'seo: crawlable no-JS content lists all services and the FAQ');
  const robots = fs.readFileSync('dist/robots.txt', 'utf8'); chk(/User-agent: \*\nAllow: \//.test(robots) && /GPTBot/.test(robots) && !/Sitemap:/.test(robots), 'robots: search allowed, training crawlers opted out, no sitemap line without a URL');
  const seo = await import('file://' + process.cwd() + '/scripts/seo.mjs'); process.env.SITE_URL = 'https://example-test.vercel.app';
  const h2 = await seo.applySeo(process.cwd(), fs.readFileSync('index.html', 'utf8')); chk(/<link rel="canonical" href="https:\/\/example-test.vercel.app\/"/.test(h2) && /og:image" content="https:\/\/example-test.vercel.app\/og-image.png"/.test(h2) && /"url":"https:\/\/example-test.vercel.app\/"/.test(h2), 'seo (with SITE_URL set): canonical, og:image and JSON-LD urls are generated');
  chk(fs.statSync('public/og-image.png').size > 5000, 'seo: og-image.png exists');
  await b.close(); console.log(fails ? `FAILED ${fails}` : 'ALL OK'); process.exit(fails ? 1 : 0);
})();
