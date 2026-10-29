import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
await fs.mkdir('var',{recursive:true});
await build({entryPoints:['src/CatalogMedia.jsx'],outfile:'var/test-catalog-media.mjs',bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},logLevel:'silent'});
const {CatalogMedia}=await import('../var/test-catalog-media.mjs');
test('a failed cover displays its own sandboxed demo, and offscreen demos are unmounted',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost:4174'});
 for(const key of ['window','document'])globalThis[key]=dom.window[key];
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 let observed;globalThis.IntersectionObserver=class{constructor(callback){observed=callback;}observe(){}disconnect(){}};globalThis.ResizeObserver=class{observe(){}disconnect(){}};
 const root=createRoot(document.getElementById('root'));
 try{
  await act(async()=>root.render(React.createElement(CatalogMedia,{name:'Actual demo',item:{id:'demo',image:'/missing.png',previewPath:'/previews/actual.html'}})));
  assert.ok(document.querySelector('img'));assert.equal(document.querySelector('iframe'),null);
  await act(async()=>observed([{isIntersecting:true}]));
  await act(async()=>document.querySelector('img').dispatchEvent(new dom.window.Event('error')));
  const frame=document.querySelector('iframe');assert.ok(frame);assert.equal(frame.getAttribute('src'),'/previews/actual.html');assert.equal(frame.getAttribute('sandbox'),'allow-scripts');assert.equal(frame.tabIndex,-1);
  await act(async()=>observed([{isIntersecting:false}]));assert.equal(document.querySelector('iframe'),null);
 }finally{await act(async()=>root.unmount());dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;delete globalThis.IntersectionObserver;delete globalThis.ResizeObserver;}
});
test('preview videos stay muted and stop when the card leaves the visible region',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost:4174'});for(const key of ['window','document'])globalThis[key]=dom.window[key];globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 let observed,paused=0;globalThis.IntersectionObserver=class{constructor(callback){observed=callback;}observe(){}disconnect(){}};
 dom.window.HTMLMediaElement.prototype.pause=function(){paused++;};
 const root=createRoot(document.getElementById('root'));
 try{await act(async()=>root.render(React.createElement(CatalogMedia,{name:'Video demo',item:{id:'video',image:'/cover.webp',video:'/demo.mp4',previewPath:'/demo.html'}})));
 assert.equal(document.querySelector('video'),null);await act(async()=>observed([{isIntersecting:true}]));const video=document.querySelector('video');assert.equal(video.muted,true);assert.equal(video.preload,'none');
 await act(async()=>observed([{isIntersecting:false}]));assert.equal(document.querySelector('video'),null);assert.ok(paused>0);
 }finally{await act(async()=>root.unmount());dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;delete globalThis.IntersectionObserver;}
});
