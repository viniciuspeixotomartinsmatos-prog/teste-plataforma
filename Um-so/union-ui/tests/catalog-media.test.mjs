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
test('video previews load only on card hover, stay muted, reset on leave and reject late playback',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost:4174'});for(const key of ['window','document'])globalThis[key]=dom.window[key];globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 let observed,paused=0,played=0,resolvePlay;globalThis.IntersectionObserver=class{constructor(callback){observed=callback;}observe(){}disconnect(){}};
 dom.window.HTMLMediaElement.prototype.pause=function(){paused++;};
 dom.window.HTMLMediaElement.prototype.play=function(){played++;return new Promise(resolve=>{resolvePlay=resolve;});};
 const root=createRoot(document.getElementById('root'));
 try{await act(async()=>root.render(React.createElement('a',{className:'card-link',href:'/component/video'},React.createElement('div',{className:'card-overlay'},'Open'),React.createElement(CatalogMedia,{name:'Video demo',item:{id:'video',image:'/cover.webp',video:'/demo.mp4',previewPath:'/demo.html'}}))));
 assert.equal(document.querySelector('video'),null);await act(async()=>observed([{isIntersecting:true}]));const video=document.querySelector('video');assert.equal(video.muted,true);assert.equal(video.preload,'none');
 assert.equal(video.getAttribute('src'),null);assert.equal(played,0);
 const card=document.querySelector('.card-link');
 await act(async()=>card.dispatchEvent(new window.Event('pointerenter')));
 await act(async()=>new Promise(resolve=>setTimeout(resolve,150)));
 assert.equal(played,1);assert.equal(video.getAttribute('src'),'/demo.mp4');assert.equal(video.muted,true);
 await act(async()=>video.dispatchEvent(new window.Event('playing')));assert.ok(video.classList.contains('playing'));
 video.currentTime=5;
 await act(async()=>card.dispatchEvent(new window.Event('pointerleave')));assert.ok(!video.classList.contains('playing'));assert.equal(video.currentTime,0);assert.ok(paused>0);
 await act(async()=>{resolvePlay();await Promise.resolve();video.dispatchEvent(new window.Event('playing'));});assert.ok(!video.classList.contains('playing'));
 await act(async()=>card.dispatchEvent(new window.Event('pointerenter')));
 await act(async()=>observed([{isIntersecting:false}]));assert.equal(document.querySelector('video'),null);
 await act(async()=>new Promise(resolve=>setTimeout(resolve,150)));assert.equal(played,1,'leaving viewport cancels pending playback');
 }finally{await act(async()=>root.unmount());dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;delete globalThis.IntersectionObserver;}
});

test('keyboard focus previews without navigating; reduced motion and touch keep the cover',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost:4174'});for(const key of ['window','document'])globalThis[key]=dom.window[key];globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 let observed,changed,played=0;const preference={matches:false,addEventListener(_name,cb){changed=cb;},removeEventListener(){}};window.matchMedia=()=>preference;
 globalThis.IntersectionObserver=class{constructor(callback){observed=callback;}observe(){}disconnect(){}};
 window.HTMLMediaElement.prototype.play=function(){played++;return Promise.resolve();};window.HTMLMediaElement.prototype.pause=function(){};
 const root=createRoot(document.getElementById('root'));
 try{
  await act(async()=>root.render(React.createElement('a',{className:'card-link',href:'/component/video'},React.createElement(CatalogMedia,{name:'Video',item:{id:'video',image:'/cover.webp',video:'/demo.mp4'}}))));
  await act(async()=>observed([{isIntersecting:true}]));const link=document.querySelector('a');
  await act(async()=>{const event=new window.Event('pointerenter');Object.defineProperty(event,'pointerType',{value:'touch'});link.dispatchEvent(event);});
  await act(async()=>new Promise(resolve=>setTimeout(resolve,150)));assert.equal(played,0);
  await act(async()=>link.dispatchEvent(new window.FocusEvent('focusin',{bubbles:true})));
  await act(async()=>new Promise(resolve=>setTimeout(resolve,150)));assert.equal(played,1);assert.equal(window.location.pathname,'/');
  await act(async()=>{preference.matches=true;changed();});assert.equal(document.querySelector('video'),null);assert.ok(document.querySelector('img'));
 }finally{await act(async()=>root.unmount());dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;delete globalThis.IntersectionObserver;}
});
