const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http');
(async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(fs.readFileSync('dist/index.html'))});
 await new Promise(r=>server.listen(4178,r));
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://localhost:4178/#grammar');
  assert.equal(await p.locator('#sidebarToggle').getAttribute('aria-expanded'),'true');
  const original=await p.locator('.app').evaluate(e=>e.getBoundingClientRect().width);
  await p.locator('#sidebarToggle').click();assert.equal(await p.locator('#sidebar').evaluate(e=>e.inert),true);
  assert.ok(await p.locator('.app').evaluate(e=>e.getBoundingClientRect().width)>original);
  await p.reload();assert.equal(await p.locator('#sidebarToggle').getAttribute('aria-expanded'),'false');
  await p.locator('#sidebarToggle').click();await p.locator('#sidebarClose').click();
  await p.locator('[data-grammar-unit="deep-perfect-progress"]').click();await p.locator('[data-grammar-set="0"]').click();
  await p.locator('[data-grammar-answer]').first().click();const quiz=await p.evaluate(()=>JSON.stringify({index:grammarQuiz.index,score:grammarQuiz.score,answered:grammarQuiz.answered,answers:state.grammar.answers}));
  for(const font of ['13','14','16','18','20']){
   await p.locator('#settingsButton').click();await p.locator('#fontSize').selectOption(font);await p.locator('#closeSettings').click();
   assert.equal(await p.evaluate(()=>getComputedStyle(document.documentElement).fontSize),font+'px');
   assert.equal(await p.evaluate(()=>JSON.stringify({index:grammarQuiz.index,score:grammarQuiz.score,answered:grammarQuiz.answered,answers:state.grammar.answers})),quiz);
  }
  await p.locator('#settingsButton').click();await p.locator('#fontSize').selectOption('14');await p.locator('#closeSettings').click();await p.reload();assert.equal(await p.locator('#fontSize').inputValue(),'14');
  assert.equal(await p.evaluate(()=>validState(JSON.parse(localStorage.getItem('opic-pocket-v2'))).font),14);
  assert.equal(await p.evaluate(()=>validState({version:2}).sidebarCollapsed),false);
  assert.equal(await p.evaluate(()=>validState({version:2,font:12}).font),16);
  const contrast=()=>{
   const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),l=c=>rgb(c).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
   const el=document.querySelector('.grammar-hub-title p'),a=l(getComputedStyle(el).color),b=l(getComputedStyle(document.body).backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  };
  assert.ok(await p.evaluate(contrast)>=4.5);await p.locator('#theme').click();assert.ok(await p.evaluate(contrast)>=4.5);
  await p.locator('#theme').click();await p.screenshot({path:'display-desktop-collapsed.png',fullPage:true});
  await p.setViewportSize({width:390,height:844});await p.locator('#sidebarToggle').click();
  assert.equal(await p.locator('#sidebar').getAttribute('aria-modal'),'true');assert.equal(await p.locator('.app').evaluate(e=>e.inert),true);
  assert.equal(await p.evaluate(()=>document.activeElement.id),'sidebarClose');await p.keyboard.press('Shift+Tab');assert.equal(await p.evaluate(()=>document.activeElement.getAttribute('href')),'#progress');await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'sidebarClose');
  await p.screenshot({path:'display-mobile-drawer.png',fullPage:true});await p.keyboard.press('Escape');assert.equal(await p.locator('#sidebarToggle').getAttribute('aria-expanded'),'false');assert.equal(await p.evaluate(()=>document.activeElement.id),'sidebarToggle');
  await p.locator('#sidebarToggle').click();await p.locator('#sidebarBackdrop').click({position:{x:370,y:100}});assert.equal(await p.locator('#sidebar').evaluate(e=>e.inert),true);
  await p.locator('#sidebarToggle').click();await p.locator('#nav a[href="#library"]').click();await p.waitForURL('**/#library');assert.equal(await p.locator('#sidebarToggle').getAttribute('aria-expanded'),'false');
  await p.setViewportSize({width:320,height:740});
  for(const font of ['13','20']){
   await p.locator('#settingsButton').click();await p.locator('#fontSize').selectOption(font);await p.locator('#closeSettings').click();
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await p.locator('#sidebarToggle').click();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.locator('#sidebarClose').click();
  }
  await p.setViewportSize({width:1440,height:1000});assert.equal(await p.locator('#sidebarToggle').getAttribute('aria-expanded'),'false');await p.locator('#sidebarToggle').click();await p.reload();assert.equal(await p.locator('#sidebarToggle').getAttribute('aria-expanded'),'true');
  assert.deepEqual(errors,[]);console.log('PASS desktop collapse/persistence, mobile drawer/backdrop/Escape/focus trap, 13–20px settings, preserved quiz, text contrast, 320px layout');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
