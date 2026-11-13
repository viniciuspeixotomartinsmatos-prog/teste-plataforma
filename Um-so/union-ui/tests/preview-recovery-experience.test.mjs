import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {build} from 'esbuild';import {JSDOM} from 'jsdom';import React,{act} from 'react';import {createRoot} from 'react-dom/client';
await fs.mkdir('var',{recursive:true});
await build({entryPoints:['src/Preview.jsx'],outfile:'var/preview-recovery-experience.mjs',bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},logLevel:'silent'});
const {Preview}=await import('../var/preview-recovery-experience.mjs');
test('failed preview exposes retry, source, download and explicitly recorded video fallback without weakening the iframe',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/component/demo'});globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;const root=createRoot(document.querySelector('#root')),actions=[];let requests=0;
 globalThis.fetch=async()=>{requests++;return new Response('Unavailable',{status:503});};
 try{await act(async()=>root.render(React.createElement(Preview,{item:{id:'demo',name:'Demo',previewPath:'/previews/demo.html',video:'/assets/demo.mp4'},onViewCode:()=>actions.push('code'),onDownload:()=>actions.push('zip')})));
  assert.ok(document.querySelector('[role="alert"]'));const click=async text=>act(async()=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===text).click());
  await click('Ver arquivos');await click('Baixar pacote');await click('Ver vídeo demonstrativo');assert.deepEqual(actions,['code','zip']);assert.match(document.body.textContent,/Referência gravada, sem interação/);
  assert.equal(document.querySelector('video').getAttribute('src'),'/assets/demo.mp4');assert.equal(document.querySelector('iframe').getAttribute('sandbox'),'allow-scripts allow-downloads');
  await click('Tentar novamente');assert.equal(requests,2);assert.ok(document.querySelector('[role="alert"]'));
 }finally{await act(async()=>root.unmount());dom.window.close();}
});
