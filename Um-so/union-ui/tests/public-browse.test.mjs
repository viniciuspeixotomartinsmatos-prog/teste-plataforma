import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';

test('guests browse and preview a component, then copying requires login with the component preserved',async()=>{
 await fs.mkdir('var',{recursive:true});
 await build({entryPoints:['src/App.jsx'],outfile:'var/public-browse-test.mjs',bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},logLevel:'silent',plugins:[{name:'isolate-demo',setup(builder){
  builder.onLoad({filter:/[\\/]Preview\.jsx$/},()=>({loader:'jsx',contents:'import React from "react";export function Preview(){return <div>Public interactive preview</div>}'}));
 }}]});
 const dom=new JSDOM('<div id="root"></div>',{url:'https://nitido.example/'});
 for(const key of ['window','document','history','localStorage','HTMLElement','Node','MutationObserver','Event','MouseEvent'])globalThis[key]=dom.window[key];
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;window.scrollTo=()=>{};
 const item={id:'reactbits--aurora',publicSlug:'aurora-demo',name:'Aurora',category:'Backgrounds',kind:'component',framework:'react',image:'/assets/aurora.webp',previewPath:'/previews/aurora.html'};
 const calls=[];
 globalThis.fetch=async path=>{
  calls.push(path);
  return Response.json(path==='/api/auth/get-session'?{user:null}:path==='/api/access'?{planAccess:true,plan:'free',canExport:false}:path==='/data/catalog-live.json'?[item]:{});
 };
 const {App}=await import('../var/public-browse-test.mjs');
 const root=createRoot(document.querySelector('#root'));
 const settle=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,40));});
 try{
  await act(async()=>root.render(React.createElement(App)));
  for(let i=0;i<30&&!document.querySelector('.card-link');i++)await settle();
  assert.equal(window.location.pathname,'/');
  const card=document.querySelector('.gallery-card');
  assert.ok(card);
  assert.equal(card.querySelector('.card-caption'),null);
  assert.equal(card.querySelector('.card-link').getAttribute('aria-label'),'Aurora');
  await act(async()=>card.querySelector('.card-link').click());
  for(let i=0;i<30&&!document.querySelector('.detail-heading');i++)await settle();
  assert.equal(window.location.pathname,'/component/aurora-demo');
  assert.match(document.body.textContent,/Public interactive preview/);
  assert.equal(calls.includes('/api/catalog-prompt'),false);
  const copy=[...document.querySelectorAll('button')].find(button=>button.textContent.trim()==='Copiar prompt');
  await act(async()=>copy.click());
  assert.equal(window.location.pathname,'/account');
  assert.equal(new URLSearchParams(window.location.search).get('next'),'/component/aurora-demo');
  assert.equal(calls.includes('/api/catalog-prompt'),false);
 }finally{await act(async()=>root.unmount());dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
