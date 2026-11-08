const { chromium } = require('playwright'); const fs = require('fs'); const out = '/tmp/claude-0/s11'; fs.mkdirSync(out, { recursive: true });
(async () => { const b = await chromium.launch(); for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 120)));
  await p.goto('http://localhost:5180/'); await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' }); await p.waitForTimeout(800);
  const at = async (sel, name, pad = 0) => { await p.evaluate(([s, pd]) => { const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - pd); }, [sel, pad]); await p.waitForTimeout(1400); await p.screenshot({ path: `${out}/${name}-${w}.png` }); };
  await at('#services', 'cards', 60); await at('#service-directory', 'dir', 70);
  await p.click('#sdt-website'); await at('#service-website .pf', 'portfolio', 120);
  await at('.lab', 'lab1', 90); await p.click('.lab__card >> nth=0'); await p.waitForTimeout(700); await at('.lab', 'lab2', 90);
  await p.click('.lab__stepper li:nth-child(3) button'); await p.click('.lab__probs li:nth-child(2) button'); await p.waitForTimeout(500); await at('.lab', 'lab3', 90);
  await p.click('.lab__stepper li:nth-child(4) button'); await p.waitForTimeout(500); await p.click('.lab__flow li:nth-child(6) button'); await at('.lab', 'lab4', 90);
  await p.click('.lab__stepper li:nth-child(5) button'); await p.click('text=Run the sample case'); await p.waitForTimeout(6500); await at('.lab', 'lab5', 90);
  await p.click('.lab__stepper li:nth-child(6) button'); await p.click('.lab__hobar .lab__link'); await p.waitForTimeout(900); await at('.lab', 'lab6', 90);
  for (const id of ['inventory', 'dashboard']) { await p.evaluate((i) => { location.hash = '#demo-' + i; }, id); await p.waitForTimeout(1500); await at('.demos__panel', 'demo-' + id, 90); }
  console.log(w, errs.length ? errs : 'no errors'); await p.close(); } await b.close(); })();
