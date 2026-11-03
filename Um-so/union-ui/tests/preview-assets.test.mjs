import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import * as compiler from 'esbuild';
import {preparePreviewAssets,createPreviewAssetResponder} from '../src/preview-assets.js';

test('protected classic scripts and styles load through the parent before entering the opaque sandbox',async()=>{
 const files={
  '/previews/recovered/test.html':'<html><head><link rel="stylesheet" href="/previews/recovered/styles.css"></head><body><div id="root"></div><script src="/previews/recovered/runtime.js"></script><script>document.getElementById("root").textContent=window.demo.label;</script></body></html>',
  '/previews/recovered/styles.css':'@font-face{font-family:demo;src:url("/previews/recovered/assets/test.woff2")}',
  '/previews/recovered/assets/test.woff2':new Uint8Array([119,79,70,50]),
  '/previews/recovered/runtime.js':'window.demo={label:"Protected demo works"};',
 };
 const requests=[];const fetcher=async(url,options)=>{requests.push({url,options});const path=new URL(url).pathname;return new Response(files[path],{status:Object.hasOwn(files,path)?200:404});};
 const html=await preparePreviewAssets(files['/previews/recovered/test.html'],'https://app.example/previews/recovered/test.html',{fetcher});
 assert.ok(!html.includes('src="/previews/recovered/runtime.js"'));
 assert.match(html,/data:font\/woff2;base64,/);
 assert.ok(requests.every(request=>request.options.credentials==='same-origin'));
 const dom=new JSDOM(html,{runScripts:'dangerously'});try{assert.equal(dom.window.document.getElementById('root').textContent,'Protected demo works');}finally{dom.window.close();}
});

test('protected module graphs retain cycles and execute without anonymous module fetches',async()=>{
 const base='/previews/recovered/demos/test/';
 const files={
  [base+'a.js']:'import {message} from "./b.js";export function prefix(){return "Cycle"}document.getElementById("root").textContent=message();',
  [base+'b.js']:'import {prefix} from "./a.js";export function message(){return prefix()+" works"}',
 };
 const fetcher=async url=>new Response(files[new URL(url).pathname],{status:Object.hasOwn(files,new URL(url).pathname)?200:404});
 const html=await preparePreviewAssets('<html><head><link rel="modulepreload" href="'+base+'b.js"><script type="module" src="'+base+'a.js"></script></head><body><div id="root"></div></body></html>','https://app.example'+base+'index.html',{fetcher,compiler});
 assert.ok(!html.includes('type="module"'));assert.ok(!html.includes('modulepreload'));
 const dom=new JSDOM(html,{runScripts:'dangerously'});try{await new Promise(resolve=>dom.window.document.addEventListener('DOMContentLoaded',resolve,{once:true}));assert.equal(dom.window.document.getElementById('root').textContent,'Cycle works');}finally{dom.window.close();}
});

test('asset messages require the current frame and cannot read APIs, other origins or encoded traversal paths',async()=>{
 const replies=[],requests=[],frame={postMessage:reply=>replies.push(reply)};
 const responder=createPreviewAssetResponder(frame,'demo','https://app.example/component/demo',async(url,options)=>{requests.push({url,options});return new Response(new Uint8Array([1,2]),{headers:{'content-type':'image/png'}});});
 const data={type:'preview:asset',id:'demo',requestId:'1',url:'/assets/test.png'};
 for(const change of [{source:{}},{id:'other'},{url:'/api/auth/get-session'},{url:'https://other.example/assets/test.png'},{url:'/assets/%2e%2e%2fapi/auth/get-session'}])await responder({source:change.source||frame,data:{...data,...change}});
 assert.equal(requests.length,0);await responder({source:frame,data});assert.equal(requests.length,1);assert.equal(requests[0].options.credentials,'same-origin');assert.equal(replies[0].status,200);assert.deepEqual([...new Uint8Array(replies[0].bytes)],[1,2]);
});
