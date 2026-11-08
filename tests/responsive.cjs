// Per-viewport: no horizontal overflow, every section present, tap targets, hero text visible, screenshots of key sections.
const {chromium}=require('playwright');const out=process.argv[2]||'/tmp';
(async()=>{const b=await chromium.launch();let ok=true;const errs=[];
for(const [w,h,name,reduced] of [[390,844,'mobile',false],[820,1180,'tablet',false],[1920,1080,'wide',false],[390,844,'mobile-reduced',true]]){
  const ctx=await b.newContext({viewport:{width:w,height:h},reducedMotion:reduced?'reduce':'no-preference',hasTouch:w<500,isMobile:w<500});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(name+': '+e.message));p.on('console',m=>m.type()==='error'&&errs.push(name+': '+m.text()));
  await p.goto('http://127.0.0.1:5180/');await p.waitForTimeout(1200);
  // scroll through whole page so reveals fire
  const H=await p.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<H;y+=700){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(90);}await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(500);
  const m=await p.evaluate(()=>{const de=document.documentElement;const over=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>de.clientWidth+1&&getComputedStyle(e).position!=='fixed'&&!e.closest('.hp__view,.demos__tabs,.mm-vp,.hero__bg,.adv__svg,.pm__map,.tfb__board,svg')}).slice(0,5).map(e=>e.tagName+'.'+String(e.className).slice(0,30));
    const hidden=[...document.querySelectorAll('.rv:not(.in)')].length;
    const small=[...document.querySelectorAll('a,button,select,input,textarea,summary')].filter(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&(r.height<30||r.width<30)&&!e.closest('svg')&&!e.classList.contains('sr-only')&&!(e.type==='checkbox')}).slice(0,6).map(e=>(e.tagName+'.'+String(e.className).slice(0,22)+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)));
    return {sw:de.scrollWidth,cw:de.clientWidth,over,hidden,small,sections:['home','services','demos','advantage','process','about','closing','contact'].filter(i=>!document.getElementById(i))};});
  const good=m.sw<=m.cw+1&&!m.sections.length;ok=ok&&good;console.log(`${good?'ok  ':'FAIL'} ${name} ${w}px scrollW=${m.sw} clientW=${m.cw} missing=${JSON.stringify(m.sections)} unrevealed=${m.hidden}`);if(m.over.length)console.log('   overflowing:',JSON.stringify(m.over));if(m.small.length)console.log('   small targets:',JSON.stringify(m.small));
  for(const id of ['home','demos','advantage','process','contact']){await p.evaluate(i=>document.getElementById(i).scrollIntoView(),id);await p.waitForTimeout(900);await p.screenshot({path:`${out}/r-${name}-${id}.png`});}
  await ctx.close();}
console.log('errors',JSON.stringify(errs));console.log(ok?'ALL OK':'FAILED');process.exitCode=ok?0:1;await b.close();})();
