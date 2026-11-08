// Measures the left/right content edges of each section's heading and first content block at ten widths.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); let bad = 0;
  for (const w of [1920, 1440, 1280, 1024, 820, 768, 430, 390, 375, 360]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } }); await p.goto('http://localhost:5180/'); await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' }); await p.waitForTimeout(600);
    const r = await p.evaluate(() => {
      const wraps = [...document.querySelectorAll('main section, section.sec, #contact, #about, #demos, #services, #service-directory, #advantage, #process')].filter((x, i, a) => a.indexOf(x) === i);
      return wraps.map((s) => { const c = s.querySelector('.wrap') || s; const e = s.querySelector('.eyebrow, h2'); const cr = c.getBoundingClientRect(); const er = e && e.getBoundingClientRect(); const cs = getComputedStyle(c);
        return { id: s.id || s.className.split(' ')[0], wrapL: Math.round(cr.left + parseFloat(cs.paddingLeft)), wrapR: Math.round(cr.right - parseFloat(cs.paddingRight)), headL: er ? Math.round(er.left) : null, w: innerWidth }; });
    });
    const lefts = new Set(r.filter((x) => x.id !== 'home' && x.headL !== null).map((x) => x.wrapL)); const drift = r.filter((x) => x.headL !== null && Math.abs(x.headL - x.wrapL) > 2);
    console.log(w, 'container left edges:', [...lefts].join(','), drift.length ? 'HEAD DRIFT ' + JSON.stringify(drift.map((d) => `${d.id}:${d.headL}vs${d.wrapL}`)) : 'headings aligned'); bad += drift.length; await p.close(); }
  await b.close(); process.exit(bad ? 1 : 0); })();
