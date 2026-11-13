import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {build} from 'esbuild';import {JSDOM} from 'jsdom';import React,{act} from 'react';import {createRoot} from 'react-dom/client';
await fs.mkdir('var',{recursive:true});
await build({entryPoints:['src/ComponentPage.jsx'],outfile:'var/component-integration-experience.mjs',bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},logLevel:'silent',plugins:[{name:'isolate-preview-execution',setup(builder){
 builder.onLoad({filter:/[\\/]Preview\.jsx$/},()=>({loader:'jsx',contents:'import React from "react";export function Preview(){return <div>Isolated preview fixture</div>}'}));
 builder.onLoad({filter:/[\\/]CodeView\.jsx$/},()=>({loader:'jsx',contents:'import React from "react";export function CodeView({code}){return <pre>{code}</pre>}'}));
 }}]});
const {default:Component}=await import('../var/component-integration-experience.mjs');
test('component file failure keeps selections and retries to real source and integration controls',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/component/demo'});globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.localStorage=dom.window.localStorage;globalThis.IS_REACT_ACT_ENVIRONMENT=true;const root=createRoot(document.querySelector('#root'));let requests=0;
 globalThis.fetch=async()=>++requests===1?new Response('',{status:503}):Response.json({files:[{path:'component.jsx',content:'export const Demo = () => "Actual source";'}]});
 try{await act(async()=>root.render(React.createElement(Component,{item:{id:'demo',name:'Demo',availability:'code',framework:'react',codePath:'/code/demo.json',previewPath:'/previews/demo.html',dependencies:['react']},rows:[],collections:[],theme:'dark',notify:()=>{}})));
  assert.match(document.querySelector('[role="alert"]').textContent,/carregar os arquivos/);assert.ok(document.body.textContent.includes('Isolated preview fixture'));
  await act(async()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Tentar carregar arquivos novamente').click());assert.equal(requests,2);assert.equal(document.querySelector('[role="alert"]'),null);
  await act(async()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Ver arquivos').click());assert.match(document.body.textContent,/Actual source/);assert.match(document.body.textContent,/react/);
 }finally{await act(async()=>root.unmount());dom.window.close();}
});
