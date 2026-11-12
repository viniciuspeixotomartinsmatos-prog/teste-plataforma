import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {build} from 'esbuild';import {JSDOM} from 'jsdom';import React,{act} from 'react';import {createRoot} from 'react-dom/client';
await fs.mkdir('var',{recursive:true});await build({entryPoints:['src/CosmicScene.jsx'],outfile:'var/cosmic-lifecycle.mjs',bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent',plugins:[{name:'isolate-raster-paint',setup(builder){builder.onLoad({filter:/cosmic-layer-renderer\.js$/},()=>({contents:'export function createLayeredCosmicRenderer(canvas,options){canvas.width=options.width;canvas.height=options.height;return {draw(){}}}',loader:'js'}));}}]});
const {CosmicScene}=await import('../var/cosmic-lifecycle.mjs');
test('scene pauses offscreen/hidden, follows motion preference and handles resize/context recovery with cleanup',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/account',pretendToBeVisual:true});globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const frames=new Map();let nextFrame=0,observe,disconnected=0,motionListener,hidden=false;const motion={matches:false,addEventListener(_event,cb){motionListener=cb;},removeEventListener(){motionListener=null;}};
 window.matchMedia=()=>motion;globalThis.requestAnimationFrame=cb=>{frames.set(++nextFrame,cb);return nextFrame;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 Object.defineProperty(document,'hidden',{get:()=>hidden});Object.defineProperty(window.HTMLImageElement.prototype,'naturalWidth',{get:()=>1672});Object.defineProperty(window.HTMLImageElement.prototype,'naturalHeight',{get:()=>941});Object.defineProperty(window.HTMLImageElement.prototype,'complete',{get:()=>true});
 class Asset{complete=true;naturalWidth=1672;naturalHeight=941;width=1672;height=941;get src(){return this.value||'';}set src(value){this.value=value;if(value)queueMicrotask(()=>this.onload?.());}}
 globalThis.Image=Asset;window.IntersectionObserver=globalThis.IntersectionObserver=class{constructor(cb){observe=cb;}observe(){}disconnect(){disconnected++;}};
 const root=createRoot(document.querySelector('#root'));
 try{await act(async()=>root.render(React.createElement(CosmicScene)));const canvas=document.querySelector('canvas'),image=document.querySelector('img');await act(async()=>observe([{isIntersecting:true}]));assert.equal(canvas.hidden,false);assert.equal(image.hidden,true);assert.equal(frames.size,1);
  await act(async()=>{hidden=true;document.dispatchEvent(new window.Event('visibilitychange'));});assert.equal(frames.size,0);
  await act(async()=>{hidden=false;document.dispatchEvent(new window.Event('visibilitychange'));motion.matches=true;motionListener();});assert.equal(canvas.hidden,true);assert.equal(image.hidden,false);assert.equal(frames.size,0);
  await act(async()=>{motion.matches=false;motionListener();});assert.equal(canvas.hidden,false);
  await act(async()=>canvas.dispatchEvent(new window.Event('contextlost',{cancelable:true})));assert.equal(canvas.hidden,true);assert.equal(image.hidden,false);
  await act(async()=>canvas.dispatchEvent(new window.Event('contextrestored')));assert.equal(canvas.hidden,false);
  Object.defineProperty(window,'innerWidth',{value:390,configurable:true});await act(async()=>{window.dispatchEvent(new window.Event('resize'));await new Promise(resolve=>setTimeout(resolve,150));});assert.ok(canvas.width<=640);
  await act(async()=>observe([{isIntersecting:false}]));assert.equal(frames.size,0);
 }finally{await act(async()=>root.unmount());assert.equal(frames.size,0);assert.equal(disconnected,1);assert.equal(motionListener,null);dom.window.close();delete globalThis.IntersectionObserver;}
});
