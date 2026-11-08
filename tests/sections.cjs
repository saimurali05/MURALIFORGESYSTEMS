const {chromium}=require('playwright');const out=process.argv[2]||'/tmp';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://127.0.0.1:5180/');await p.waitForTimeout(800);let ok=true;const chk=(n,c)=>{console.log((c?'ok  ':'FAIL')+' '+n);ok=ok&&c;};
const go=async(id,wait=1500)=>{await p.evaluate(i=>document.getElementById(i).scrollIntoView(),id);await p.waitForTimeout(wait);};
// process — six stages, readable without animation, no controls to break
await go('process',2200);await p.screenshot({path:`${out}/sec-process.png`});
const stages=await p.$$eval('.pw__stage',els=>els.map(e=>({t:e.querySelector('h3')?.textContent.replace(/^Stage \d+:\s*/,''),n:e.querySelector('.pw__node')?.textContent,pts:e.querySelectorAll('.pw__pts li').length,out:!!e.querySelector('.pw__out'),art:!!e.querySelector('.pw__scene .pa'),tag:e.querySelector('.pw__tag')?.textContent})));
console.log('   stages:',JSON.stringify(stages.map(s=>s.n+' '+s.t)));
chk('process: exactly six stages in order Understand → Map → Design → Build → Test → Support',stages.length===6&&stages.map(s=>s.t).join()==='Understand the business,Map the workflow,Design the solution,Build and integrate,Test and refine,Support and improve'&&stages.map(s=>s.n).join()==='01,02,03,04,05,06');
chk('process: each stage has an illustration labelled Illustrative, 3 points and an outcome',stages.every(s=>s.art&&s.tag==='Illustrative'&&s.pts===3&&s.out));
chk('process: nothing to press (no play/pause/replay controls inside the stages)',(await p.locator('.pw__list button').count())===0);
chk('process: old five-stage map is gone',(await p.locator('.pm, #pm-n3').count())===0);
chk('process: closing link goes to #contact',(await p.getAttribute('.pw__cta a','href'))==='#contact');
chk('process: no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
// about / faq
await go('about');await p.click('#fq-b1');await p.waitForTimeout(600);await p.screenshot({path:`${out}/sec-about.png`});
chk('faq opens',(await p.getAttribute('#fq-b1','aria-expanded'))==='true');
// closing board
await go('closing',500);await p.waitForTimeout(16000);await p.screenshot({path:`${out}/sec-closing.png`});
const txt=await p.$$eval('.tfb__cell',cs=>{const t=cs.map(c=>c.textContent||' ').join('');return [t.slice(0,22).trim(),t.slice(22).trim()]});
console.log('   board text:',JSON.stringify(txt));chk('closing board settles on exact statement',txt[0]==='YOU KNOW THE BUSINESS.'&&txt[1]==='I KNOW THE CHEMISTRY.');
await p.waitForTimeout(4000);const t2=await p.$$eval('.tfb__cell',cs=>cs.map(c=>c.textContent||' ').join(''));chk('board does not rotate away',t2.slice(0,22).trim()==='YOU KNOW THE BUSINESS.');
// contact: covered by tests/about-contact.cjs (Cal.com booking; old form removed)
// demo CTA prefill
await p.goto('http://127.0.0.1:5180/#demo-invoice');await p.waitForSelector('.dm');await p.waitForTimeout(600);
await p.click('.dm__cta .btn');await p.waitForTimeout(1200);chk('demo CTA scrolls to the contact section',await p.$eval('#contact',e=>e.getBoundingClientRect().top<innerHeight*0.8));
// footer links
await go('contact',200);await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));await p.waitForTimeout(500);await p.screenshot({path:`${out}/sec-footer.png`});
const links=await p.$$eval('.ftr a[href^="#"]',as=>as.map(a=>a.getAttribute('href')));const missing=[];for(const h of links){if(h.startsWith('#demo-'))continue;const ex=await p.evaluate(h=>!!document.getElementById(h.slice(1)),h);if(!ex)missing.push(h);}
chk('footer anchors resolve ('+links.length+')',missing.length===0);if(missing.length)console.log('   missing',missing);
console.log('errors',JSON.stringify(errs));console.log(ok?'ALL OK':'FAILED');process.exitCode=ok?0:1;await b.close();})();
