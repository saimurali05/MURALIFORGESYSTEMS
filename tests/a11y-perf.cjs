// Structural accessibility checks + measured load metrics (not a Lighthouse score).
const { chromium } = require('playwright'); let fails = 0; const chk = (o, m) => { console.log((o ? 'ok   ' : 'FAIL ') + m); if (!o) fails++; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(() => { window.__cls = 0; window.__lcp = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true }); new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true }); });
  await p.route('https://app.cal.com/**', (r) => r.abort());
  await p.goto('http://localhost:5180/'); await p.waitForTimeout(3000);
  const r = await p.evaluate(() => {
    const vis = (e) => !e.closest('[hidden],[inert]') && e.getClientRects().length;
    const name = (e) => (e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') && document.getElementById(e.getAttribute('aria-labelledby'))?.textContent || e.textContent || e.getAttribute('title') || '').trim();
    const unnamed = [...document.querySelectorAll('button,a[href],[role=tab],input,select,textarea')].filter((e) => !name(e) && !e.closest('[hidden]')).map((e) => e.outerHTML.slice(0, 80));
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    const badRef = [...document.querySelectorAll('[aria-controls],[aria-labelledby]')].flatMap((e) => ['aria-controls', 'aria-labelledby'].flatMap((a) => (e.getAttribute(a) || '').split(' ').filter(Boolean).filter((id) => !document.getElementById(id)).map((id) => a + '→' + id)));
    const hs = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => +h.tagName[1]); let jumps = 0; hs.forEach((l, i) => { if (i && l - hs[i - 1] > 1) jumps++; });
    const imgsNoAlt = [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length;
    const blank = [...document.querySelectorAll('a[target=_blank]')].filter((a) => !/noopener/.test(a.rel)).length;
    return { unnamed, dup, badRef, h1: document.querySelectorAll('h1').length, jumps, imgsNoAlt, blank, lang: document.documentElement.lang, main: document.querySelectorAll('main').length, cls: window.__cls, lcp: Math.round(window.__lcp), nodes: document.querySelectorAll('*').length };
  });
  console.log(JSON.stringify(r));
  chk(r.unnamed.length === 0, 'every visible control has an accessible name ' + JSON.stringify(r.unnamed.slice(0, 3)));
  chk(r.dup.length === 0, 'no duplicate ids ' + r.dup); chk(r.badRef.length === 0, 'aria-controls/labelledby targets exist ' + r.badRef);
  chk(r.h1 === 1 && r.main === 1 && r.lang === 'en', 'one h1, one main, lang=en'); chk(r.jumps === 0, 'no skipped heading levels (jumps: ' + r.jumps + ')');
  chk(r.imgsNoAlt === 0 && r.blank === 0, 'img alt present; _blank links have noopener');
  const m = await (await b.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })).newPage(); await m.goto('http://localhost:5180/'); await m.waitForTimeout(1500);
  chk((await m.evaluate(() => document.querySelectorAll('.hp__card').length)) === 11, 'reduced-motion: page renders fully');
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);
})();
