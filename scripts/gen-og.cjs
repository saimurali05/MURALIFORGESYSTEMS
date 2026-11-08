// Renders public/og-image.png (1200×630) from the brand palette and logo. Needs Playwright: node scripts/gen-og.cjs
const { chromium } = require('playwright'); const { readFileSync } = require('node:fs'); const { resolve } = require('node:path');
const root = resolve(__dirname, '..');
const logo = 'data:image/png;base64,' + readFileSync(resolve(root, 'public/assets/mfs-logo.png')).toString('base64');
const html = `<body style="margin:0;width:1200px;height:630px;background:linear-gradient(135deg,#F9F6EF,#E8E1D6);font-family:Georgia,'Times New Roman',serif;color:#171918;position:relative;overflow:hidden">
<svg style="position:absolute;inset:0" width="1200" height="630" viewBox="0 0 1200 630"><g fill="none" stroke="#B99865" stroke-width="1.4" opacity=".55"><path d="M-20 560 C 260 500 420 180 700 240 S 1080 520 1240 120"/><path d="M-20 600 C 300 540 470 250 720 300 S 1090 560 1240 200" opacity=".6"/></g></svg>
<img src="${logo}" style="position:absolute;left:72px;top:60px;height:104px"/>
<div style="position:absolute;left:72px;top:230px;width:860px;font-size:68px;line-height:1.08">We build systems that give your business <span style="color:#8a6c3d">its time back.</span></div>
<div style="position:absolute;left:72px;bottom:64px;font:600 22px system-ui,sans-serif;letter-spacing:.26em;text-transform:uppercase;color:#343A3A">Software · AI · Automation</div></body>`;
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(html); await p.waitForTimeout(300); await p.screenshot({ path: resolve(root, 'public/og-image.png') }); await b.close(); console.log('og-image.png written'); })();
