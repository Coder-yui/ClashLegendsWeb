import fs from 'node:fs';
import path from 'node:path';
import {createSite} from '../src/site.mjs';
const data=JSON.parse(fs.readFileSync('content/catalog.json','utf8'));
const render=createSite(data);
fs.mkdirSync('dist',{recursive:true});fs.cpSync('public','dist',{recursive:true});
fs.copyFileSync('src/styles.css','dist/styles.css');fs.copyFileSync('src/app.js','dist/app.js');
let count=0;
for(const lang of ['zh','en']){
 for(const page of ['home','cards','overview','mechanics','updates','about'])write(`${lang}/${page==='home'?'':page}`,render(lang,page));
 for(const c of data.cards)write(`${lang}/cards/${c.id}`,render(lang,'detail',c.id));
}
function write(p,text){const dir=path.join('dist',p);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),text);count++}
fs.writeFileSync('dist/catalog-index.json',JSON.stringify(data.cards.filter(c=>c.selectable).map(c=>({id:c.id,names:[c.name.zh,c.name.en,c.id,...({blitzcrank:['机器人','布里茨'],ekko:['艾克'],hecarim:['人马','赫卡里姆'],jayce:['杰斯'],samira:['莎弥拉'],powder_keg:['桶'],tidal_wave:['浪潮'],garen:['德玛西亚之力'],anivia:['冰鸟','艾尼维亚'],masteryi:['易大师','Master Yi'],xin:['赵信','德邦总管'],aatrox:['亚托克斯'],kayn:['凯隐'],jinx:['暴走萝莉'],malphite:['石头人'],aurelionsol:['龙王','奥瑞利安索尔'],kassadin:['卡萨丁'],yorick:['约里克'],tristana:['崔丝塔娜'],tryndamere:['泰达米尔'],missfortune:['厄运小姐']}[c.id]||[])],type:c.type,cost:c.cost,formation:c.members.length>1,alternateCosts:c.id==='kayle'?[data.cards.find(x=>x.id==='kayle_ranged').cost]:[]}))));
fs.writeFileSync('dist/index.html',`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ClashLegends</title><script>let l;try{l=localStorage.getItem('clash-language')}catch{}location.replace('/'+(l==='zh'||l==='en'?l:navigator.language.startsWith('zh')?'zh':'en')+'/')</script></head><body><a href="/zh/">中文</a> · <a href="/en/">English</a></body></html>`);
fs.writeFileSync('dist/404.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><title>Page not found · ClashLegends</title><main class="wrap page-head"><h1>404</h1><p>页面不存在 / Page not found</p><div class="actions"><a class="button" href="/zh/">返回首页</a><a class="button secondary" href="/en/">Go home</a></div></main></html>');
console.log(`Built ${count} localized pages, root and 404. Source ${data.sourceCommit}`);
