import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {build} from 'esbuild';import {JSDOM} from 'jsdom';import React,{act} from 'react';import {createRoot} from 'react-dom/client';
await fs.mkdir('var',{recursive:true});
await build({entryPoints:['src/DiscoveryExperience.jsx','src/IntegrationGuide.jsx','src/AuditNextSteps.jsx'],outdir:'var/experience-ui-tests',bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},logLevel:'silent'});
const {default:Discovery}=await import('../var/experience-ui-tests/DiscoveryExperience.js');const {default:Guide}=await import('../var/experience-ui-tests/IntegrationGuide.js');const {default:Priorities}=await import('../var/experience-ui-tests/AuditNextSteps.js');
test('discovery goals, active-filter removal, recent resources, collections and compatibility remain operable',async()=>{
 const dom=new JSDOM('<div id="root"></div>');globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;const root=createRoot(document.querySelector('#root')),events=[];
 try{await act(async()=>root.render(React.createElement(Discovery,{filter:{q:'hero',category:'all',kind:'all'},onGoal:g=>events.push(g.id),onFilter:(...args)=>events.push(args),onClear:()=>events.push('clear'),onOpen:id=>events.push(id),navigate:url=>events.push(url),recent:[{id:'actual',name:'Actual hero'}],collections:[{id:'project',name:'Projeto',items:['actual']}],total:1})));
 const click=async text=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text));assert.ok(button);await act(async()=>button.click());};
 await click('Escolher um hero');await click('Busca: hero');await click('Actual hero');await click('Projeto');
 const select=document.querySelector('select');await act(async()=>{select.value='vue';select.dispatchEvent(new window.Event('change',{bubbles:true}));});
 assert.deepEqual(events,['hero',['q',''],'actual','/collections/project',['framework','vue']]);assert.match(document.body.textContent,/1 resultados/);
 }finally{await act(async()=>root.unmount());dom.window.close();}
});
test('integration clearly discloses the video limit and exposes retry, prompt, source and download actions',async()=>{
 const dom=new JSDOM('<div id="root"></div>');globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;const root=createRoot(document.querySelector('#root')),actions=[];
 try{await act(async()=>root.render(React.createElement(Guide,{item:{recoveryMode:'recorded-video',framework:'html'},error:'Arquivos indisponíveis',onRetry:()=>actions.push('retry'),onPrompt:()=>actions.push('prompt'),onDownload:()=>actions.push('zip'),onCode:()=>actions.push('code')})));
 assert.match(document.body.textContent,/não é uma implementação interativa/);assert.match(document.body.textContent,/não é uma confirmação/);
 for(const button of document.querySelectorAll('button'))await act(async()=>button.click());assert.deepEqual(actions,['retry','prompt','zip','code']);
 }finally{await act(async()=>root.unmount());dom.window.close();}
});
test('audit next steps copy a real prioritized finding without presenting unmeasured comparisons',async()=>{
 const dom=new JSDOM('<div id="root"></div>');globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;const root=createRoot(document.querySelector('#root'));let copied;
 try{await act(async()=>root.render(React.createElement(Priorities,{report:{findings:[{id:'indexavel',category:'seo',severity:'alta',status:'fail',weight:30,title:'Noindex detectado',steps:['Confirm']}],score:null},result:{site:{url:'https://example.com'},at:new Date().toISOString()},onCopy:f=>{copied=f;}})));
 await act(async()=>document.querySelector('button').click());assert.equal(copied.id,'indexavel');assert.match(document.body.textContent,/duas análises completas/);assert.match(document.body.textContent,/sem estimativa de horas/);
 }finally{await act(async()=>root.unmount());dom.window.close();}
});
