import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import * as compiler from 'esbuild';
import {preparePreviewAssets,createPreviewAssetResponder,addPreviewAssetClient,adaptTurbopackChunk} from '../src/preview-assets.js';
import {injectDemoAssets} from '../src/demo-asset-bridge.js';
import fs from 'node:fs/promises';

test('the retained HLS demo prefers MSE when native HLS reports only maybe',async()=>{
 const path='/previews/expanded/21st-8712cd5ba9a6.html';
 const original=await fs.readFile('public'+path,'utf8');
 const prepared=await preparePreviewAssets(original,'https://app.example'+path,{fetcher:async()=>new Response('')});
 const nativeProbe=prepared.match(/function ux\(\)\{[^}]+\}/)?.[0];
 assert.ok(nativeProbe);
 const choose=(native,mse)=>new Function('window','document','globalThis',nativeProbe+';return ux()')({}, {createElement:()=>({canPlayType:()=>native})}, {MediaSource:{isTypeSupported:()=>mse}});
 assert.equal(choose('maybe',true),false);
 assert.equal(choose('probably',true),true);
 assert.equal(choose('maybe',false),true);
 assert.equal(choose('',false),false);
});

test('Mosaik resolves Draco decoder files from protected paths also present in its ZIP manifest',async()=>{
 const base='/previews/recovered/demos/mosaik/';
 const manifest=JSON.parse(await fs.readFile('public/data/recovered-demo-assets.json','utf8')).mosaik;
 const js=await fs.readFile('public'+base+'assets/MosaikLogo3D-B9wrQNt1.js','utf8');
 assert.ok(js.includes('"'+base+'draco/"'));
 for(const file of ['draco_wasm_wrapper.js','draco_decoder.wasm','draco_decoder.js','LICENSE']){
  assert.ok(manifest.includes('draco/'+file),file);
  const bytes=await fs.readFile('public'+base+'draco/'+file);assert.ok(bytes.length>100,file);
  if(file.endsWith('.wasm'))assert.deepEqual([...bytes.subarray(0,4)],[0,97,115,109]);
 }
});

test('retained ASCII demos use compatible WebM without removing the original MP4',async()=>{
 for(const [id,asset] of [['21st-84b5c4cf7d2f','c721f302e4673e41bbd2b395'],['21st-000947d76d8c','a173a27bb35f6ab1e3f1fa8f']]){
  const path='/previews/expanded/'+id+'.html',original=await fs.readFile('public'+path,'utf8');
  const prepared=await preparePreviewAssets(original,'https://app.example'+path,{fetcher:async()=>new Response('')});
  const selector=prepared.match(/:\(([^;]+?)\),?["}]/)?.[1];
  const actual=prepared.match(/\(document\.createElement\("video"\)\.canPlayType\('[^']+'\)\?"\/assets\/demo-cache\/[^"]+":"\/assets\/demo-cache\/[^"]+"\)/)?.[0];
  assert.ok(actual,selector);
  const chosen=support=>new Function('document','return '+actual)({createElement:()=>({canPlayType:()=>support})});
  assert.equal(chosen(''),'/assets/demo-cache/'+asset+'.mp4');
  const alternative=chosen('probably');assert.equal(alternative,'/assets/demo-cache/'+asset+'.compat.webm');
  assert.deepEqual([...((await fs.readFile('public'+alternative)).subarray(0,4))],[0x1a,0x45,0xdf,0xa3]);
 }
});

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

test('relayed image sources remain decodable and are not overridden by unauthenticated responsive candidates',async()=>{
 const html=addPreviewAssetClient('<html><head></head><body><img src="/previews/demo/main.webp" srcset="/missing-small.webp 600w, /previews/demo/main.webp 1800w"></body></html>','demo','https://app.example/previews/demo/index.html');
 const dom=new JSDOM(html,{url:'https://app.example',runScripts:'dangerously',beforeParse(w){
  w.URL.createObjectURL=()=> 'blob:null/verified-image';w.URL.revokeObjectURL=()=>{};
  w.HTMLImageElement.prototype.decode=function(){return Promise.resolve(this.getAttribute('src'));};
  w.postMessage=data=>{if(data.type==='preview:asset')queueMicrotask(()=>w.dispatchEvent(new w.MessageEvent('message',{source:w,data:{type:'preview:asset-result',id:'demo',requestId:data.requestId,status:200,mime:'image/webp',bytes:new w.Uint8Array([1,2]).buffer}})));};
 }});
 try{await new Promise(resolve=>dom.window.document.addEventListener('DOMContentLoaded',resolve,{once:true}));await new Promise(resolve=>setTimeout(resolve,0));const image=dom.window.document.querySelector('img');assert.equal(image.getAttribute('srcset'),null);const pending=new dom.window.Image();pending.src='/previews/demo/next.webp';assert.equal(await pending.decode(),'blob:null/verified-image');}finally{dom.window.close();}
});

test('video and poster keep distinct live blobs and dynamic retained scripts use authenticated bytes',async()=>{
 const created=[],revoked=[],requests=[];
 const mapping={'https://original.example/movie.mp4':'/assets/movie.mp4','https://original.example/poster.webp':'/assets/poster.webp'};
 const base='https://app.example/previews/demo/index.html';
 const html=addPreviewAssetClient(injectDemoAssets('<html><head></head><body><video></video></body></html>',mapping),'demo',base);
 const dom=new JSDOM(html,{url:base,runScripts:'dangerously',beforeParse(w){
  w.URL.createObjectURL=blob=>{const url='blob:null/resource-'+created.length;created.push({url,type:blob.type});return url;};
  w.URL.revokeObjectURL=url=>revoked.push(url);
  w.postMessage=data=>{if(data.type!=='preview:asset')return;requests.push(data.url);queueMicrotask(()=>w.dispatchEvent(new w.MessageEvent('message',{source:w,data:{type:'preview:asset-result',id:'demo',requestId:data.requestId,status:200,mime:data.url.endsWith('.mp4')?'video/mp4':data.url.endsWith('.webp')?'image/webp':'text/javascript',bytes:new w.Uint8Array([1,2]).buffer}})));};
 }});
 try{
  const w=dom.window,video=w.document.querySelector('video');video.src='https://original.example/movie.mp4';video.poster='https://original.example/poster.webp';
  const script=w.document.createElement('script');script.src='/assets/renderer.js';
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(created.find(x=>x.url===video.getAttribute('src'))?.type,'video/mp4');
  assert.equal(created.find(x=>x.url===video.getAttribute('poster'))?.type,'image/webp');
  assert.equal(created.find(x=>x.url===script.getAttribute('src'))?.type,'text/javascript');
  assert.deepEqual(revoked,[],'setting a poster must not revoke the playing video');
  const oldVideo=video.getAttribute('src'),oldPoster=video.getAttribute('poster');video.src='/assets/another.mp4';
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.deepEqual(revoked,[oldVideo]);assert.equal(video.getAttribute('poster'),oldPoster);
  assert.ok(requests.every(url=>url.startsWith('https://app.example/assets/')));
 }finally{dom.window.close();}
});

test('a late authenticated source restarts an unloaded media element only', async () => {
 const base = 'https://app.example/previews/demo/index.html';
 const html = addPreviewAssetClient('<html><head></head><body><video></video><audio></audio></body></html>', 'demo', base);
 const reloaded = [];
 const dom = new JSDOM(html, {url: base, runScripts: 'dangerously', beforeParse(w) {
  w.URL.createObjectURL = () => 'blob:null/authenticated-media';
  w.HTMLMediaElement.prototype.load = function () { reloaded.push(this.tagName); };
  Object.defineProperty(w.HTMLMediaElement.prototype, 'networkState', {
   get() { return this.tagName === 'VIDEO' ? this.NETWORK_NO_SOURCE : this.NETWORK_IDLE; },
  });
  w.postMessage = data => {
   if (data.type !== 'preview:asset') return;
   queueMicrotask(() => w.dispatchEvent(new w.MessageEvent('message', {
    source: w,
    data: {type: 'preview:asset-result', id: 'demo', requestId: data.requestId, status: 200,
     mime: 'video/webm', bytes: new w.Uint8Array([1, 2]).buffer},
   })));
  };
 }});
 try {
  const {document} = dom.window;
  for (const media of document.querySelectorAll('video, audio')) {
   const source = document.createElement('source');
   source.src = '/assets/movie.webm';
   media.append(source);
  }
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(document.querySelector('video source').getAttribute('src'), 'blob:null/authenticated-media');
  assert.deepEqual(reloaded, ['VIDEO']);
 } finally {
  dom.window.close();
 }
});

test('retained Turbopack chunks keep their original identity when classic scripts are deferred and inlined',async()=>{
 const source='(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,[]]);window.literal="document.currentScript";';
 const html=await preparePreviewAssets('<html><head><script defer src="/previews/demo/chunk.js"></script></head><body></body></html>','https://app.example/previews/demo/index.html',{fetcher:async()=>new Response(source,{headers:{'content-type':'text/javascript'}})});
 const dom=new JSDOM(html,{runScripts:'dangerously'});try{await new Promise(resolve=>dom.window.document.addEventListener('DOMContentLoaded',resolve,{once:true}));assert.equal(dom.window.TURBOPACK[0][0],'https://app.example/previews/demo/chunk.js');assert.equal(dom.window.literal,'document.currentScript');}finally{dom.window.close();}
});

test('Next runtime startup resolves retained chunk registrations before enabling controls',async()=>{
 const chunk='(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,123,()=>{}]);';
 // Model the real runtime contract: string identities are already relative;
 // registrations resolve the same chunk keys requested by runtime entries.
 const runtime='(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,{otherChunks:["static/chunks/control.js"]}]);let base="/_next/";let registered=new Set(TURBOPACK.filter(r=>typeof r[1]==="number").map(r=>base+r[0]));let startup=TURBOPACK.find(r=>r[1]?.otherChunks);if(startup[1].otherChunks.every(p=>registered.has(base+p))){document.getElementById("control").onclick=()=>document.getElementById("result").textContent="interactive";}';
 const root='https://app.example/previews/recovered/demos/example/_next/';
 const html=await preparePreviewAssets('<html><head><script defer src="'+root+'static/chunks/control.js"></script><script defer src="'+root+'static/chunks/runtime.js"></script></head><body><button id="control">Test</button><p id="result"></p></body></html>',root+'../index.html',{fetcher:async url=>new Response(String(url).endsWith('control.js')?chunk:runtime,{headers:{'content-type':'text/javascript'}})});
 const dom=new JSDOM(html,{runScripts:'dangerously'});
 try{await new Promise(resolve=>dom.window.document.addEventListener('DOMContentLoaded',resolve,{once:true}));dom.window.document.getElementById('control').click();assert.equal(dom.window.document.getElementById('result').textContent,'interactive');assert.equal(dom.window.TURBOPACK[0][0],'static/chunks/control.js');}finally{dom.window.close();}
});

test('Next metadata and router use a hierarchical retained base without changing path tests',()=>{
 const url='https://app.example/previews/recovered/demos/example/_next/static/chunks/bootstrap.js';
 const source='globalThis.TURBOPACK=[];function metadata(){let e=document.currentScript;if(!(e instanceof HTMLScriptElement))throw Error("Expected document.currentScript");return new URL(e.src).pathname.indexOf("/_next/");}let base="/_next/";const router=new URL("/page","undefined"==typeof window?"http://n":window.location.href);window.proof={index:metadata(),base,router:router.href};';
 const adapted=adaptTurbopackChunk(source,url);
 const dom=new JSDOM('<base href="https://app.example/previews/example/index.html"><script>'+adapted+'</script>',{runScripts:'dangerously'});
 try{assert.ok(dom.window.proof.index>0);assert.equal(dom.window.proof.base,'/previews/recovered/demos/example/_next/');assert.equal(dom.window.proof.router,'https://app.example/page');assert.equal(dom.window.document.querySelectorAll('script[src]').length,0);}finally{dom.window.close();}
});

test('dynamic Turbopack blobs preserve chunk identity and never register their blob URL',async()=>{
 const source='(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,12,()=>{}]);';
 const base='https://app.example/previews/recovered/demos/example/index.html',created=[];
 const dom=new JSDOM(addPreviewAssetClient('<html><head></head><body></body></html>','dynamic',base),{url:base,runScripts:'dangerously',beforeParse(w){
  w.TextDecoder=TextDecoder;w.Blob=Blob;
  w.URL.createObjectURL=blob=>{created.push(blob);return 'blob:null/dynamic';};w.URL.revokeObjectURL=()=>{};
  w.postMessage=data=>{if(data.type!=='preview:asset')return;queueMicrotask(()=>w.dispatchEvent(new w.MessageEvent('message',{source:w,data:{type:'preview:asset-result',id:'dynamic',requestId:data.requestId,status:200,mime:'text/javascript',bytes:new TextEncoder().encode(source).buffer}})));};
 }});
 try{const script=dom.window.document.createElement('script');script.src='/previews/recovered/demos/example/_next/static/chunks/dynamic.js';await new Promise(resolve=>setTimeout(resolve,20));assert.equal(created.length,1);const retained=await created[0].text();dom.window.eval(retained);assert.equal(dom.window.TURBOPACK[0][0],'static/chunks/dynamic.js');assert.equal(script.src,'blob:null/dynamic');}finally{dom.window.close();}
});
