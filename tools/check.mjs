import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const data=JSON.parse(fs.readFileSync('content/catalog.json','utf8'));
const seen=new Set();
const sources=JSON.parse(fs.readFileSync('content/sources.json','utf8'));
assert.equal(sources.sourceCommit,data.sourceCommit);
assert.equal(sources.checkedAt,data.checkedAt);
assert.deepEqual(sources.excludedIds,data.excludedIds);
assert.deepEqual(data.excludedIds,['soul_tentacle']);
for(const id of data.excludedIds){
 assert(!data.cards.some(c=>c.id===id),`Excluded card ${id} in catalog`);
 assert(!sources.entities.some(c=>c.id===id),`Excluded card ${id} in sources`);
 assert(!sources.media.some(m=>m.path.includes(id)),`Excluded media ${id}`);
 for(const lang of ['zh','en'])assert(!fs.existsSync(`dist/${lang}/cards/${id}`),`Excluded route ${id}`);
}
const index=JSON.parse(fs.readFileSync('dist/catalog-index.json','utf8'));
assert.deepEqual(index.map(c=>c.id),data.cards.filter(c=>c.selectable).map(c=>c.id));
for(const c of data.cards){
 assert(!seen.has(c.id),`Duplicate ID ${c.id}`);seen.add(c.id);
 for(const k of ['zh','en']){assert(c.name[k]?.trim(),`${c.id} missing name ${k}`);assert(c.description[k]?.trim(),`${c.id} missing description ${k}`)}
 assert(c.cost===null||Number.isFinite(c.cost),`${c.id} invalid cost`);
 assert(fs.existsSync('dist'+c.image),`${c.id} missing image`);
 for(const k of [...c.related,...c.members])assert(data.cards.some(x=>x.id===k),`${c.id}: broken reference ${k}`);
 for(const s of c.skills){for(const k of ['zh','en'])assert(s.name[k]&&s.description[k],`${c.id} missing skill translation`);assert(fs.existsSync('dist'+s.icon),`${c.id} missing icon`)}
 for(const values of [c.values,...c.skills.map(s=>s.values),...c.forms.map(f=>f.values)])for(const [k,v] of Object.entries(values)){assert(data.fields[k]?.en&&data.fields[k]?.zh,`Unknown field ${k}`);const nums=Array.isArray(v)?v.flat(Infinity):[v];assert(nums.every(Number.isFinite),`Bad number ${c.id}.${k}`)}
}
const counts={selectable:data.cards.filter(c=>c.selectable).length,related:data.cards.filter(c=>!c.selectable).length,forms:data.cards.reduce((n,c)=>n+c.forms.length,0)};
assert.deepEqual(counts,{selectable:81,related:13,forms:5});
let files=0,links=0;
function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,d.name);if(d.isDirectory())walk(p);else if(p.endsWith('.html')){
 if(p.endsWith('/qa.html'))continue;
 const html=fs.readFileSync(p,'utf8');files++;
 assert(!html.includes('/Users/')&&!html.includes('res://'),`Private source path in ${p}`);
 assert(!/undefined|NaN|TODO|lorem ipsum/i.test(html),`Placeholder in ${p}`);
 for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const link=m[1];if(link.startsWith('http')){assert(link.startsWith('https://github.com/Coder-yui/ClashLegends'),`Unexpected external URL ${link}`);continue}
  const [base,fragment]=link.split('#');const local=base.split('?')[0];let target=local.startsWith('/')?'dist'+local:local?path.join(path.dirname(p),local):p;
  if(target.endsWith('/'))target+='index.html';assert(fs.existsSync(target),`Broken ${p} -> ${link}`);
  if(fragment&&target.endsWith('.html'))assert(fs.readFileSync(target,'utf8').includes(`id="${fragment}"`),`Broken fragment ${p} -> ${link}`);
  links++;
 }
 if(p.includes('/en/')&& !p.endsWith('/index.html'))throw Error('Expected static directory route');
 if(p.includes('/en/')){const clean=html.replace(/<[^>]*>/g,'').replace(/中文/g,'');assert(!/[\u3400-\u9fff]/u.test(clean),`Untranslated Chinese text in ${p}`)}
 }}}
walk('dist');
console.log(JSON.stringify({status:'passed',...counts,htmlFiles:files,localReferences:links,source:data.sourceCommit},null,2));
