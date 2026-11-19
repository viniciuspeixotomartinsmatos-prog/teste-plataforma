import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {build} from 'esbuild';import {JSDOM} from 'jsdom';import React,{act} from 'react';import {createRoot} from 'react-dom/client';
await fs.mkdir('var',{recursive:true});
await build({entryPoints:['src/ComponentPage.jsx'],outfile:'var/component-integration-experience.mjs',bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},logLevel:'silent',plugins:[{name:'isolate-preview-execution',setup(builder){
 builder.onLoad({filter:/[\\/]Preview\.jsx$/},()=>({loader:'jsx',contents:'import React from "react";export function Preview(){return <div>Isolated preview fixture</div>}'}));
 builder.onLoad({filter:/[\\/]CodeView\.jsx$/},()=>({loader:'jsx',contents:'import React from "react";export function CodeView({code}){return <pre>{code}</pre>}'}));
 }}]});
const {default:Component}=await import('../var/component-integration-experience.mjs');
test('prompt failure preserves the selected tool and preview, and a retry copies only its prompt',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/component/demo'});
 globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.localStorage=dom.window.localStorage;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const root=createRoot(document.querySelector('#root')),requests=[],notifications=[];
 let clipboard='';
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async text=>{clipboard=text;}}}});
 globalThis.fetch=async(url,options)=>{
  assert.equal(url,'/api/catalog-prompt');
  requests.push(JSON.parse(options.body));
  return requests.length===1?Response.json({error:'Tente novamente.'},{status:503}):Response.json({prompt:'Prompt de integração para Gemini.'});
 };
 try{
  await act(async()=>root.render(React.createElement(Component,{item:{id:'demo',name:'Demo',availability:'code',framework:'react',codePath:'/code/demo.json',previewPath:'/previews/demo.html',dependencies:['react']},rows:[],collections:[],theme:'dark',notify:message=>notifications.push(message)})));
  assert.equal(requests.length,0);
  const select=document.querySelector('.prompt-tool-select select');
  await act(async()=>{select.value='gemini';select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});
  const copy=()=>[...document.querySelectorAll('button')].find(button=>button.textContent.trim()==='Copiar prompt').click();
  await act(async()=>copy());
  assert.equal(notifications.at(-1),'Tente novamente.');
  assert.equal(clipboard,'');
  assert.equal(select.value,'gemini');
  assert.ok(document.body.textContent.includes('Isolated preview fixture'));
  await act(async()=>copy());
  assert.equal(clipboard,'Prompt de integração para Gemini.');
  assert.equal(notifications.at(-1),'Prompt copiado.');
  assert.deepEqual(requests.map(request=>request.tool),['gemini','gemini']);
  assert.equal(requests[0].resource,requests[1].resource);
  assert.equal(document.querySelector('.code-view, .file-tree'),null);
 }finally{await act(async()=>root.unmount());dom.window.close();}
});
