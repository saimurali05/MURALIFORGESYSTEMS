const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();let ok=true;const chk=(n,c)=>{console.log((c?'ok  ':'FAIL')+' '+n);ok=ok&&c;};const errs=[];
// desktop: dock destinations + scroll spy
let p=await b.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errs.push(e.message));await p.goto('http://127.0.0.1:5180/');await p.waitForTimeout(1000);
const items=await p.$$eval('.hdr a[href^="#"]',as=>as.map(a=>a.getAttribute('href')));console.log('   dock hrefs',JSON.stringify([...new Set(items)]));
for(const id of ['services','demos','advantage','about','contact']){await p.click(`.hdr .dock a[href="#${id}"], .hdr a[href="#${id}"] >> nth=0`).catch(()=>{});await p.waitForTimeout(1600);const on=await p.evaluate(()=>document.querySelector('.hdr [aria-current="page"], .hdr [aria-current="true"], .hdr .is-active')?.getAttribute('href')||document.querySelector('.hdr [aria-current]')?.getAttribute('href'));const top=await p.evaluate(i=>Math.round(document.getElementById(i).getBoundingClientRect().top),id);chk(`dock → #${id}: section near top (${top}px), active=${on}`,Math.abs(top)<260&&on==='#'+id);}
// keyboard: tab order reaches skip/CTA; focus ring visible
await p.goto('http://127.0.0.1:5180/');await p.keyboard.press('Tab');const f1=await p.evaluate(()=>document.activeElement.className+'|'+document.activeElement.getAttribute('href'));console.log('   first Tab →',f1);
await p.close();
// mobile menu
p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await p.goto('http://127.0.0.1:5180/');await p.waitForTimeout(900);
await p.click('.hdr button[aria-expanded]');await p.waitForTimeout(500);chk('mobile menu opens',(await p.getAttribute('.hdr button[aria-expanded]','aria-expanded'))==='true');
await p.keyboard.press('Escape');await p.waitForTimeout(400);chk('Escape closes menu',(await p.getAttribute('.hdr button[aria-expanded]','aria-expanded'))==='false');
chk('focus returns to menu button after Escape',await p.evaluate(()=>document.activeElement===document.querySelector('.hdr button[aria-expanded]')));
await p.click('.hdr button[aria-expanded]');await p.waitForTimeout(400);await p.click('a[href="#contact"] >> visible=true >> nth=0');await p.waitForTimeout(1500);chk('menu link navigates + closes',(await p.getAttribute('.hdr button[aria-expanded]','aria-expanded'))==='false'&&await p.evaluate(()=>Math.abs(document.getElementById('contact').getBoundingClientRect().top)<300));
await p.close();
// map keyboard
p=await b.newPage({viewport:{width:1440,height:900}});await p.goto('http://127.0.0.1:5180/#demo-dashboard');await p.waitForSelector('.dm');await p.waitForTimeout(1500);
chk('deep link #demo-dashboard opens the dashboards demo',await p.getAttribute('#tab-dashboard','aria-selected')==='true');
await p.focus('#tab-dashboard');await p.keyboard.press('Home');await p.waitForTimeout(400);chk('demo tabs: Home selects the first demo',await p.getAttribute('#tab-lead','aria-selected')==='true');
await p.keyboard.press('End');await p.waitForTimeout(400);chk('demo tabs: End selects the last demo (nine in total)',await p.getAttribute('#tab-dashboard','aria-selected')==='true'&&await p.locator('[aria-label="Choose a demo"] [role=tab]').count()===9);
console.log('errors',JSON.stringify(errs),ok?'ALL OK':'FAILED');process.exitCode=ok?0:1;await b.close();})();
