import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {createCanvas} from '@napi-rs/canvas';
import {createSplashCursorCanvas} from '../src/demos/splash-cursor-canvas.js';
import {loadPreviewDocument} from '../src/preview-loading.js';
import {instrumentPreviewHTML} from '../src/preview-document.js';
import {compileItem} from '../server/preview-service.mjs';
import {build} from 'esbuild';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

test('rendered preview exits stalled loading, rejects late readiness and recovers on retry',async()=>{
 await build({entryPoints:['src/Preview.jsx'],outfile:'var/preview-loading-test.mjs',platform:'node',format:'esm',bundle:true,packages:'external',logLevel:'silent'});
 const {Preview}=await import('../var/preview-loading-test.mjs');
 const dom=new JSDOM('<div id="app"></div>',{url:'http://localhost/component/splash-cursor-47c705'});
 const keys=['window','document','HTMLElement','Node','MutationObserver','Event','MouseEvent','IS_REACT_ACT_ENVIRONMENT','fetch','setTimeout'];const originals=new Map(keys.map(key=>[key,globalThis[key]]));
 for(const key of keys.slice(0,7))globalThis[key]=dom.window[key];globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const nativeTimer=originals.get('setTimeout');globalThis.setTimeout=(callback,delay,...args)=>nativeTimer(callback,delay===20000?40:delay===30000?100:delay,...args);
 let requests=0;globalThis.fetch=async()=>{requests++;return requests===1?new Promise(()=>{}):new Response('<html><head></head><body><canvas></canvas></body></html>');};
 const root=createRoot(document.getElementById('app')),item={id:'splash',name:'Splash Cursor',previewPath:'/previews/runtime/reactbits--splash-cursor.html'};
 const settle=ms=>act(async()=>{await new Promise(r=>nativeTimer(r,ms));});
 const message=checked=>window.dispatchEvent(new window.MessageEvent('message',{source:document.querySelector('iframe').contentWindow,data:{type:'preview-ready',id:item.id,checked}}));
 try{
  await act(async()=>root.render(React.createElement(Preview,{item})));await settle(65);
  assert.ok(document.querySelector('[role=alert]'));assert.ok(!document.querySelector('.preview-loading'));
  await act(async()=>message(true));assert.ok(document.querySelector('[role=alert]'),'late old frame must not hide a failed load');
  await act(async()=>document.querySelector('[role=alert] button').click());await settle(10);
  assert.ok(document.querySelector('iframe').srcdoc.includes('<canvas>'));
  await act(async()=>message(false));assert.ok(document.querySelector('.preview-loading'),'iframe mount alone is insufficient');
  await settle(120);assert.ok(document.querySelector('[role=alert]'));assert.ok(!document.querySelector('iframe').getAttribute('srcdoc'),'unready renderer is unloaded at deadline');
  await act(async()=>document.querySelector('[role=alert] button').click());await settle(10);await act(async()=>message(true));
  assert.ok(document.querySelector('.preview-interaction-hint'));assert.ok(!document.querySelector('.preview-loading'));assert.ok(!document.querySelector('[role=alert]'));
 }finally{await act(async()=>root.unmount());dom.window.close();for(const [key,value]of originals){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});

test('preview preparation bounds stalled HTML and resource preparation and aborts on navigation',async()=>{
 for(const stage of ['html','resources']){
  let received;
  const fetcher=async(_,options)=>{received=options;return stage==='html'?new Promise(()=>{}):new Response('<html></html>');};
  await assert.rejects(loadPreviewDocument('/demo','https://app.example/demo',{timeoutMs:25,fetcher,prepare:()=>new Promise(()=>{})}),/demorou/);
  assert.equal(received.signal.aborted,true);assert.equal(received.credentials,'same-origin');
 }
 const controller=new AbortController(),work=loadPreviewDocument('/demo','https://app.example/demo',{signal:controller.signal,fetcher:()=>new Promise(()=>{})});controller.abort();
 await assert.rejects(work,{name:'AbortError'});
});

test('compatible Splash Cursor presents ink pixels, animates, responds to movement and click and resizes',()=>{
 const canvas=createCanvas(400,240),engine=createSplashCursorCanvas(canvas,{width:400,height:240,random:()=>.4});
 const pixels=()=>Buffer.from(canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data);
 assert.equal(engine.draw(16),true);const first=pixels();assert.ok(first.some((v,i)=>i%4===3&&v>0));
 engine.draw(48);assert.notDeepEqual(pixels(),first);
 engine.move(40,80);engine.move(210,100);engine.draw(64);const moved=pixels();
 engine.splash(320,170);engine.draw(80);assert.notDeepEqual(pixels(),moved);
 engine.resize(280,180,2);engine.draw(96);assert.equal(canvas.width,560);assert.equal(canvas.height,360);engine.dispose();assert.equal(engine.draw(112),false);
});

for(const failure of ['no-webgl','unsupported-float-target','context-throws'])test('Splash Cursor becomes ready and responds to pointer events when '+failure,async()=>{
 const {js}=await compileItem('reactbits--splash-cursor',{cache:false});
 const messages=[],contexts=[];
 const dom=new JSDOM(instrumentPreviewHTML('<html><head></head><body><div id="root"></div></body></html>','splash','http://localhost/preview.html'),{url:'http://localhost',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.postMessage=m=>messages.push(m);}}),w=dom.window;
 w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});w.ResizeObserver=class{observe(){}disconnect(){}};
 w.HTMLElement.prototype.getBoundingClientRect=()=>({width:400,height:240,left:0,top:0});Object.defineProperty(w.document.body,'innerText',{value:''});
 const backing=new WeakMap();
 w.HTMLCanvasElement.prototype.getContext=function(type){
  if(type==='webgl2'){if(failure==='context-throws')throw Error('GPU initialization rejected');return failure==='no-webgl'?null:{getExtension(){},createTexture(){return{};},bindTexture(){},texImage2D(){},createFramebuffer(){return{};},bindFramebuffer(){},framebufferTexture2D(){},checkFramebufferStatus(){return 1;},FRAMEBUFFER_COMPLETE:2,deleteFramebuffer(){},deleteTexture(){}};}
  if(type!=='2d')return null;
  if(!backing.has(this)){const canvas=createCanvas(this.width||400,this.height||240);backing.set(this,canvas);contexts.push(canvas);}
  const canvas=backing.get(this);if(canvas.width!==this.width)canvas.width=this.width;if(canvas.height!==this.height)canvas.height=this.height;return canvas.getContext('2d');
 };
 try{
  w.eval(js);const deadline=Date.now()+2500;while(!messages.some(m=>m.type==='preview-ready'&&m.checked)){assert.ok(Date.now()<deadline,'first presented decorative frame must confirm readiness');await wait(30);}
  assert.equal(w.document.querySelector('[data-renderer]').dataset.renderer,'canvas2d');assert.ok(!messages.some(m=>m.type==='preview-error'));
  const canvas=contexts.at(-1),bytes=()=>Buffer.from(canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data);assert.ok(bytes().some((v,i)=>i%4===3&&v>0));
  const previous=bytes();w.dispatchEvent(new w.MouseEvent('pointermove',{clientX:40,clientY:80}));w.dispatchEvent(new w.MouseEvent('pointermove',{clientX:240,clientY:100}));w.dispatchEvent(new w.MouseEvent('pointerdown',{clientX:320,clientY:160}));await wait(50);assert.notDeepEqual(bytes(),previous);
  const payload=JSON.parse(await fs.readFile('public/code/runtime/reactbits--splash-cursor.json','utf8')),original=JSON.parse(await fs.readFile('public/code/a/reactbits/SplashCursor-TS-TW.json','utf8')).files[0];
  assert.equal(payload.files.find(f=>f.path==='original/SplashCursor.original.tsx').content,original.content);assert.ok(payload.files.some(f=>f.path.endsWith('RENDERER-NOTES.md')));
 }finally{dom.window.close();}
});
