'use strict';
const lang=document.body.dataset.lang;
const themeButton=document.querySelector('.theme-toggle');
function syncTheme(){
 const light=document.documentElement.dataset.theme==='light';
 const label=lang==='zh'?(light?'切换深色外观':'切换浅色外观'):(light?'Switch to dark theme':'Switch to light theme');
 themeButton?.setAttribute('aria-label',label);themeButton?.setAttribute('title',label);
 if(themeButton)themeButton.querySelector('.theme-label').textContent=lang==='zh'?(light?'深色外观':'浅色外观'):(light?'Dark theme':'Light theme');
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',light?'#f4f6f3':'#10171c');
}
themeButton?.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=theme;try{localStorage.setItem('clash-theme',theme)}catch{}syncTheme()});syncTheme();

window.addEventListener('pageshow',()=>{try{const saved=localStorage.getItem('clash-theme');if(saved==='light'||saved==='dark')document.documentElement.dataset.theme=saved}catch{}syncTheme()});
try{localStorage.setItem('clash-language',lang)}catch{}
const language=document.querySelector('[data-language]');
function updateLanguage(){if(language){const u=new URL(language.href);u.search=location.search;u.hash=location.hash;language.href=u.pathname+u.search+u.hash}}
updateLanguage();
const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
function closeMenu(){if(!toggle)return;toggle.setAttribute('aria-expanded','false');nav.classList.remove('open')}
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus()}});
const form=document.querySelector('#filters');
if(form){
 let index=[];
 const q=form.elements.q,type=form.elements.type,cost=form.elements.cost;
 function read(){const p=new URLSearchParams(location.search);q.value=p.get('q')||'';type.value=p.get('type')||'';cost.value=p.get('cost')||''}
 function apply(write=false){form.querySelector('.search-clear').hidden=!q.value;const query=q.value.trim().toLocaleLowerCase();let total=0;for(const c of index){const show=(!query||c.names.some(n=>n.toLocaleLowerCase().includes(query)))&&(!type.value||(type.value==='formation'?c.formation:c.type===type.value))&&(!cost.value||(cost.value==='varies'?c.cost===null:c.cost===Number(cost.value)||c.alternateCosts.includes(Number(cost.value))));document.querySelector(`[data-card="${c.id}"]`).hidden=!show;if(show)total++}
 document.querySelector('#result-count').textContent=lang==='zh'?`显示 ${total} / ${index.length} 张可选卡牌`:`Showing ${total} of ${index.length} selectable cards`;
 document.querySelector('#empty').hidden=total!==0;
 if(write){const p=new URLSearchParams();if(q.value)p.set('q',q.value);if(type.value)p.set('type',type.value);if(cost.value)p.set('cost',cost.value);const target=location.pathname+(p.size?'?'+p:'');history.replaceState(null,'',target);updateLanguage()}}
 form.querySelector('.search-clear').addEventListener('click',()=>{q.value='';apply(true);q.focus()});
 document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){event.preventDefault();q.focus()}});
 read();fetch('/catalog-index.json').then(r=>{if(!r.ok)throw Error('Catalog unavailable');return r.json()}).then(json=>{index=json;apply()}).catch(()=>{document.querySelector('#result-count').textContent=lang==='zh'?'筛选暂不可用，仍可浏览全部卡牌。':'Filters unavailable. All cards are still available below.'});
 form.addEventListener('input',()=>apply(true));form.addEventListener('submit',e=>e.preventDefault());
 form.addEventListener('reset',()=>{setTimeout(()=>apply(true),0)});
 document.querySelector('[data-clear]')?.addEventListener('click',()=>{form.reset();q.focus()});
 window.addEventListener('popstate',()=>{read();apply();updateLanguage()});
 window.addEventListener('pageshow',()=>{read();if(index.length)apply()});
}
// TextMetrics reports the actual ink bounds, excluding side bearings and
// ascent/descent whitespace. Align those bounds to the coin's 20,20 center.
function centerCoinNumbers(){
 const context=document.createElement('canvas').getContext('2d');
 if(!context)return;
 for(const text of document.querySelectorAll('.coin-number text')){
  const style=getComputedStyle(text);context.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const m=context.measureText(text.textContent);
  if(!Number.isFinite(m.actualBoundingBoxAscent))continue;
  text.setAttribute('text-anchor','start');
  text.setAttribute('x',String(20+(m.actualBoundingBoxLeft-m.actualBoundingBoxRight)/2));
  text.setAttribute('y',String(20+(m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2));
 }
}
centerCoinNumbers();document.fonts?.ready.then(centerCoinNumbers);
