import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {JSDOM} from 'jsdom';import {build} from 'esbuild';
const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'http://localhost:4173/'});
for(const name of ['window','document','history','localStorage','HTMLElement','Node','MutationObserver','Event','MouseEvent','KeyboardEvent'])globalThis[name]=dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT=true;window.scrollTo=()=>{};dom.window.HTMLMediaElement.prototype.pause=()=>{};
let clipboard='';Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{clipboard=text;}}});
let remoteWorkspace={revision:0,data:{saved:[],collections:[]}};
globalThis.fetch=async (url,options={})=>{if(url==='/api/auth/get-session')return{ok:true,json:async()=>({user:{id:'test',name:'Teste',email:'test@example.test'}})};if(url==='/api/access')return{ok:true,json:async()=>({canExport:true})};if(url==='/api/workspace'){if(options.method==='PUT'){const input=JSON.parse(options.body);remoteWorkspace={revision:input.revision+1,data:input.data};}return{ok:true,json:async()=>structuredClone(remoteWorkspace)};}const dest=path.join('public',String(url).split('?')[0]);try{const text=await fs.readFile(dest,'utf8');return {ok:true,json:async()=>JSON.parse(text),text:async()=>text};}catch{return{ok:false,status:404};}};
await build({entryPoints:['src/App.jsx'],outfile:'tests/.app-test-bundle.mjs',platform:'node',format:'esm',bundle:true,packages:'external',logLevel:'silent',loader:{'.css':'empty'}});
const React=await import('react'),{act}=React,{createRoot}=await import('react-dom/client'),{App}=await import('./.app-test-bundle.mjs');
const root=createRoot(document.getElementById('root'));
async function settle(){await act(async()=>{await new Promise(resolve=>setTimeout(resolve,35));});}
async function click(el){assert.ok(el,'target exists');await act(async()=>{el.dispatchEvent(new MouseEvent('click',{bubbles:true}));});await settle();}
function button(text){return [...document.querySelectorAll('button')].find(el=>el.textContent.trim()===text);}
async function fill(el,value){assert.ok(el);await act(async()=>{const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;setter.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));});await settle();}
test('unified workspace preserves search, categories, collections, comparison and source code',async t=>{
 t.after(async()=>{await act(async()=>root.unmount());dom.window.close();});
 await act(async()=>root.render(React.createElement(App)));for(let i=0;i<10&&!document.querySelector('.catalog-grid');i++)await settle();
 assert.equal(document.querySelectorAll('.catalog-grid .item-card').length,36);assert.ok(document.querySelector('h1').textContent.includes('Tudo para criar.'));assert.ok(document.querySelector('.brand').textContent.includes('nitido'));assert.equal(document.querySelector('.source-strip'),null);assert.equal(document.querySelector('.main-nav a[href="/sources"]'),null);
 const categoryButton=[...document.querySelectorAll('.sidebar-link')].find(el=>el.querySelector('span')?.textContent==='Botões');await click(categoryButton);assert.equal(new URLSearchParams(window.location.search).get('category'),'Buttons');assert.ok(document.querySelectorAll('.card-category').length>0);assert.ok([...document.querySelectorAll('.card-category')].every(el=>el.textContent.includes('Botões')));
 await fill(document.querySelector('input[aria-label="Buscar componentes"]'),'no-match-123xyz');assert.equal(document.querySelectorAll('.item-card').length,0);assert.ok(document.querySelector('.empty').textContent.includes('Nenhum componente'));
 await click(document.querySelector('[aria-label="Limpar busca"]'));assert.ok(document.querySelectorAll('.item-card').length>0);
 await click(document.querySelector('.card-actions button[aria-label^="Comparar "]'));await click(document.querySelector('.compare-bar button'));assert.ok(document.querySelector('.compare-item'));assert.ok(!/Magic UI|Aceternity|React Bits|Kokonut|Tailark|Motion Primitives|shadcnblocks|Animate UI/i.test(document.querySelector('.compare-page').textContent));await click(document.querySelector('.compare-page>.text-button'));
 await click(document.querySelector('.card-actions button[aria-label^="Salvar:"]'));assert.equal(JSON.parse(localStorage.getItem('union:account:test:v1')).data.saved.length,1);
 await click(document.querySelector('.main-nav a[href="/collections"]'));assert.equal(document.querySelectorAll('.item-card').length,1);
 await click(button('Nova coleção'));await fill(document.getElementById('collection-name'),'Projeto Aurora');await act(async()=>document.querySelector('.collection-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));await settle();assert.ok(document.querySelector('h1').textContent.includes('Projeto Aurora'));assert.equal(JSON.parse(localStorage.getItem('union:account:test:v1')).data.collections.length,1);
 await click(document.querySelector('.main-nav a[href="/"]'));await click(document.querySelector('.code-only input'));await click(document.querySelector('.card-link'));for(let i=0;i<10&&!document.querySelector('.detail-heading');i++)await settle();assert.ok(document.querySelector('.detail-heading'));await click([...document.querySelectorAll('[role=tab]')].find(el=>el.textContent.startsWith('Código')));for(let i=0;i<10&&!document.querySelector('.code-view');i++)await settle();assert.ok(document.querySelector('.code-view')?.textContent.length>100);await click(button('Copiar'));assert.ok(clipboard.length>100);
 const select=document.querySelector('[aria-label="Adicionar à coleção"]');const collection=JSON.parse(localStorage.getItem('union:account:test:v1')).data.collections[0];await act(async()=>{select.value=collection.id;select.dispatchEvent(new Event('change',{bubbles:true}));});await settle();assert.equal(JSON.parse(localStorage.getItem('union:account:test:v1')).data.collections[0].items.length,1);
 await click(document.querySelector('[aria-label="Ativar tema claro"]'));assert.equal(document.documentElement.dataset.theme,'light');assert.equal(JSON.parse(localStorage.getItem('union:theme:v1')),'light');
 await click(document.querySelector('.main-nav a[href="/resources"]'));assert.ok(document.querySelectorAll('.resource-card').length>0);assert.equal(document.querySelector('.source-strip'),null);assert.ok(!/Magic UI|Aceternity|React Bits|Kokonut|Tailark|Motion Primitives|shadcnblocks|Animate UI/i.test(document.querySelector('.resources-page').textContent));
 await click(document.querySelector('.global-search'));assert.ok(document.querySelector('[role="dialog"]'));await fill(document.querySelector('[aria-label="Busca global"]'),'aurora');assert.ok(document.querySelectorAll('[role="option"]').length>0);assert.ok(!/Magic UI|Aceternity|React Bits|Kokonut|Tailark|Motion Primitives|shadcnblocks|Animate UI/i.test(document.querySelector('.search-dialog').textContent));await click(document.querySelector('[role="option"]'));assert.ok(window.location.pathname.startsWith('/component/'));
 const retained=JSON.parse(await fs.readFile('public/data/catalog-live.json','utf8')).find(row=>row.availability!=='code'&&row.previewPath&&!row.previewPath.startsWith('/previews/runtime/'));
 assert.ok(retained,'catalog retains executable HTML when editable source is unavailable');
 await act(async()=>{history.pushState({},'','/component/'+retained.publicSlug);window.dispatchEvent(new dom.window.PopStateEvent('popstate'));});
 for(let i=0;i<40&&(!button('Copiar prompt')||button('Copiar prompt').disabled);i++)await settle();
 await click([...document.querySelectorAll('[role=tab]')].find(el=>el.textContent.startsWith('Código')));
 assert.match(document.querySelector('.code-view').textContent,/<!doctype html>/i);
 await click(button('Copiar prompt'));assert.ok(clipboard.includes('DEMONSTRAÇÃO HTML COMPLETA'));assert.match(clipboard,/<!doctype html>/i);
 const kairo=JSON.parse(await fs.readFile('public/data/catalog-live.json','utf8')).find(row=>row.id==='recovered--kairo');
 await act(async()=>{history.pushState({},'','/component/'+kairo.publicSlug);window.dispatchEvent(new dom.window.PopStateEvent('popstate'));});
 for(let i=0;i<40&&(!button('Copiar prompt')||button('Copiar prompt').disabled);i++)await settle();
 await click(button('Copiar prompt'));
 const originalKairo=await fs.readFile('../research/source-checks/releases/2026-11-09/profitize/kairo/PROMPT-ORIGINAL.md','utf8');
 // Git may check out the Markdown as CRLF while the JSON keeps the original LF.
 assert.ok(clipboard.replace(/\r\n/g,'\n').startsWith(originalKairo.replace(/\r\n/g,'\n')),'recorded preview copies its original authorized prompt, not a generic HTML reconstruction');
 assert.match(document.querySelector('.detail-about').textContent,/Prompt original incluído/);
});

