import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';

test('direct platform links show login; successful login returns to the requested page; logout hides it',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost:4173/tools'});
 for(const key of ['window','document','history','localStorage','HTMLElement','Node','MutationObserver','Event','MouseEvent'])globalThis[key]=dom.window[key];
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;window.scrollTo=()=>{};
 let user=null,catalogRequests=0;
 const response=(data,status=200)=>({ok:status<400,status,json:async()=>data});
 globalThis.fetch=async(path,options={})=>{
  if(path==='/api/auth/get-session')return response({user});
  if(path==='/api/access')return response({canExport:Boolean(user)});
  if(path==='/api/auth/sign-in/email'){user={id:'one',name:'Teste',email:'one@example.test'};return response({user});}
  if(path==='/api/auth/sign-out'){user=null;return response({ok:true});}
  if(path==='/api/workspace')return response({revision:0,data:{saved:[],collections:[]}});
  if(path==='/data/catalog-live.json'){catalogRequests++;return response([]);}
  return response({},404);
 };
 await fs.mkdir('var',{recursive:true});
 await build({entryPoints:['src/App.jsx'],outfile:'var/auth-ui-test.mjs',platform:'node',format:'esm',bundle:true,packages:'external',loader:{'.css':'empty'},logLevel:'silent'});
 const {App}=await import('../var/auth-ui-test.mjs');const root=createRoot(document.getElementById('root'));
 const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,50));});
 const click=async element=>{assert.ok(element);await act(async()=>element.dispatchEvent(new MouseEvent('click',{bubbles:true})));await settle();};
 try{
  await act(async()=>root.render(React.createElement(App)));await settle();
  assert.ok(document.querySelector('.auth-card'));assert.equal(document.querySelector('.main-nav'),null);assert.equal(catalogRequests,0);assert.equal(window.location.pathname,'/account');
  await act(async()=>document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));await settle();
  assert.equal(window.location.pathname,'/tools');assert.ok(document.querySelector('.main-nav'));assert.equal(catalogRequests,1);
  await click(document.querySelector('.account-trigger'));
  await click([...document.querySelectorAll('button')].find(el=>el.textContent.includes('Sair da conta')));
  assert.ok(document.querySelector('.auth-card'));assert.equal(document.querySelector('.main-nav'),null);
 }finally{await act(async()=>root.unmount());dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
