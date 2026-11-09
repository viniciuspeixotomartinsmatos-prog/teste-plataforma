import test from 'node:test';
import assert from 'node:assert/strict';
import {openPaddleCheckout,portalDestination} from '../src/paddle-checkout.js';
import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
const config={enabled:true,mode:'sandbox',clientToken:'test_client_token'};
test('checkout accepts only a bound transaction, never a client-provided price or entitlement',async()=>{
 const calls=[],fake={Environment:{set:env=>calls.push(['env',env])},Initialize:value=>calls.push(['init',value]),Checkout:{open:value=>calls.push(['open',value])}};
 let refreshed=0;await openPaddleCheckout({config,transactionId:'txn_'+'a'.repeat(26),locale:'en',onComplete:()=>refreshed++,paddle:fake});
 const open=calls.find(([type])=>type==='open')[1];assert.equal(open.transactionId,'txn_'+'a'.repeat(26));assert.equal(open.settings.locale,'en');assert.equal(open.items,undefined);
 assert.equal(refreshed,0);calls.find(([type])=>type==='init')[1].eventCallback({name:'checkout.completed'});assert.equal(refreshed,1);
 await assert.rejects(openPaddleCheckout({config,transactionId:'javascript:alert(1)',paddle:fake}));
 await assert.rejects(openPaddleCheckout({config:{...config,enabled:false},transactionId:'txn_'+'a'.repeat(26),paddle:fake}));
});
test('customer portal destinations reject javascript, foreign domains and credentials',()=>{
 for(const url of ['javascript:alert(1)','https://paddle.com.evil.test/a','https://evil.test/','https://user@customer-portal.paddle.com/a'])assert.throws(()=>portalDestination(url));
 assert.equal(portalDestination('https://customer-portal.paddle.com/cpl_one'),'https://customer-portal.paddle.com/cpl_one');
});
test('reopening checkout initializes Paddle only once and keeps the latest completion observer',async()=>{
 let starts=0,callback,observed='';const fake={Environment:{set:()=>{}},Initialize:value=>{starts++;callback=value.eventCallback;},Checkout:{open:()=>{}}};
 await openPaddleCheckout({config,transactionId:'txn_'+'a'.repeat(26),paddle:fake,onComplete:()=>observed='old'});
 await openPaddleCheckout({config,transactionId:'txn_'+'b'.repeat(26),paddle:fake,onComplete:()=>observed='new'});
 assert.equal(starts,1);callback({name:'checkout.completed'});assert.equal(observed,'new');
});
test('guest can inspect English plans without catalog access, SDK or enabled payment buttons',async()=>{
 await fs.mkdir('var',{recursive:true});await build({entryPoints:['src/App.jsx'],outfile:'var/billing-ui-app.mjs',platform:'node',format:'esm',bundle:true,packages:'external',loader:{'.css':'empty'},logLevel:'silent'});
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/plans?lang=en'});
 for(const key of ['window','document','history','localStorage','HTMLElement','Node','MutationObserver','Event','MouseEvent'])globalThis[key]=dom.window[key];globalThis.IS_REACT_ACT_ENVIRONMENT=true;window.scrollTo=()=>{};
 const requested=[];globalThis.fetch=async path=>{requested.push(path);return Response.json(path==='/api/auth/get-session'?{user:null}:path==='/api/billing/config'?{enabled:false,mode:'disabled',plans:[]}:{});};
 const {App}=await import('../var/billing-ui-app.mjs');const root=createRoot(document.getElementById('root'));
 try{await act(async()=>{root.render(React.createElement(App));await new Promise(resolve=>setTimeout(resolve,100));});await act(async()=>{await new Promise(resolve=>setTimeout(resolve,100));});
 assert.equal(window.location.pathname,'/plans');assert.match(document.body.textContent,/Choose your own rhythm/);assert.doesNotMatch(document.body.textContent,/Payment received/);
 assert.equal(document.querySelectorAll('.billing-grid button:disabled').length,3);assert.equal(requested.includes('/data/catalog-live.json'),false);assert.equal(document.querySelector('script[src*="paddle"]'),null);
 }finally{await act(async()=>root.unmount());dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
test('a signed-in account without a paid period is directed to plans',async()=>{
 await fs.mkdir('var',{recursive:true});
 await build({entryPoints:['src/App.jsx'],outfile:'var/locked-billing-ui-app.mjs',platform:'node',format:'esm',bundle:true,packages:'external',loader:{'.css':'empty'},logLevel:'silent'});
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/tools'});
 for(const key of ['window','document','history','localStorage','HTMLElement','Node','MutationObserver','Event','MouseEvent'])globalThis[key]=dom.window[key];
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;window.scrollTo=()=>{};
 globalThis.fetch=async path=>Response.json({
  '/api/auth/get-session':{user:{id:'test-member',name:'Membro',email:'member@example.test'}},
  '/api/access':{requiresSubscription:true,canExport:false},
  '/api/workspace':{revision:0,data:{saved:[],collections:[]}},
  '/api/billing/config':{enabled:false,mode:'disabled',plans:[]},
  '/api/billing/subscription':{subscription:null},
 }[path]??[]);
 const {App}=await import('../var/locked-billing-ui-app.mjs');
 const root=createRoot(document.getElementById('root'));
 try{
  await act(async()=>{root.render(React.createElement(App));await new Promise(resolve=>setTimeout(resolve,100));});
  await act(async()=>{await new Promise(resolve=>setTimeout(resolve,100));});
  assert.equal(window.location.pathname,'/plans');
  assert.match(document.body.textContent,/Escolha o seu ritmo/);
 }finally{await act(async()=>root.unmount());dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
