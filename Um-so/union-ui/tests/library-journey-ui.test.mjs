import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {build} from 'esbuild';import {JSDOM} from 'jsdom';import React,{act} from 'react';
await fs.mkdir('var',{recursive:true});
await build({entryPoints:['src/App.jsx'],outfile:'var/library-journey-ui.mjs',bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},logLevel:'silent',plugins:[{name:'isolated-flow-fixture',setup(builder){
 builder.onLoad({filter:/[\\/]account\.js$/},()=>({loader:'js',contents:`import {useState} from 'react';export async function api(){throw Error('Unexpected account operation in navigation fixture');}export function useAccountWorkspace(){const [saved,setSaved]=useState([]),[collections,setCollections]=useState([]);return {user:{id:'journey-owner',name:'Teste'},sessionLoading:false,saved,setSaved,collections,setCollections,sync:'saved',access:{canExport:true,requiresSubscription:false}}}`}));
 builder.onLoad({filter:/[\\/](CatalogMedia|GlassLayers|Brand)\.jsx$/},args=>({loader:'jsx',contents:args.path.endsWith('CatalogMedia.jsx')?'import React from "react";export function CatalogMedia(){return <span>Isolated media fixture</span>}':'export default function Art(){return null}'}));
 builder.onLoad({filter:/[\\/]ComponentPage\.jsx$/},()=>({loader:'jsx',contents:'import React from "react";export default function Detail({item,onBack}){return <div><h1>{item.name}</h1><button onClick={onBack}>Voltar à exploração</button></div>}'}));
 }}]});
test('actual App returns to filtered library with expanded results, anchor position and recent context',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/?category=Heroes&framework=react',pretendToBeVisual:true});
 for(const key of ['window','document','localStorage','sessionStorage','history'])globalThis[key]=dom.window[key];globalThis.IS_REACT_ACT_ENVIRONMENT=true;globalThis.requestAnimationFrame=cb=>setTimeout(cb,0);globalThis.cancelAnimationFrame=clearTimeout;window.matchMedia=()=>({matches:false});
 let y=0;Object.defineProperty(window,'scrollY',{get:()=>y});window.scrollTo=options=>{y=options.top;};
 window.HTMLElement.prototype.getBoundingClientRect=function(){const index=Number(this.dataset.resourceId?.slice(1));return {top:index===40?1710-y:500,bottom:index<40?-1:2010-y,width:300,height:300};};
 const rows=Array.from({length:80},(_,i)=>({id:'r'+i,name:'Hero '+i,kind:'component',category:'Heroes',framework:'react',availability:'code',codePath:'/code/demo.json',image:'/cover.webp',previewPath:'/previews/demo.html'}));
 globalThis.fetch=async url=>String(url).includes('catalog-live')?Response.json(rows):new Response('',{status:404});
 const {createRoot}=await import('react-dom/client'),{App}=await import('../var/library-journey-ui.mjs'),root=createRoot(document.querySelector('#root'));
 const settle=()=>act(async()=>new Promise(resolve=>setTimeout(resolve,20)));
 try{
  await act(async()=>root.render(React.createElement(App)));await settle();
  assert.equal(document.querySelectorAll('.item-card').length,36);
  await act(async()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Continuar explorando')).click());assert.equal(document.querySelectorAll('.item-card').length,72);
  y=1800;await act(async()=>document.querySelector('[data-resource-id="r45"] a').click());await settle();assert.match(window.location.pathname,/component\/r45/);
  await act(async()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Voltar à exploração').click());await settle();
  assert.equal(window.location.search,'?category=Heroes&framework=react');assert.equal(document.querySelectorAll('.item-card').length,72);assert.equal(y,1800);assert.match(document.querySelector('[aria-label="Continuar seu trabalho"]').textContent,/Hero 45/);
 }finally{await act(async()=>root.unmount());dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});

