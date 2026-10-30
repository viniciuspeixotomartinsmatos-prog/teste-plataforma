import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {JSDOM} from 'jsdom';
import {loadImage} from '@napi-rs/canvas';
import {injectPreviewEnvironment} from '../src/preview-environment.js';
import {injectDemoAssets} from '../src/demo-asset-bridge.js';
import {instrumentPreviewHTML} from '../src/preview-document.js';
import {standalonePreview} from '../src/component-export.js';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
test('opaque previews receive separate memory storage without exposing application storage',()=>{
 const a=new JSDOM(injectPreviewEnvironment('<html><head></head><body></body></html>'),{runScripts:'dangerously'}),b=new JSDOM(injectPreviewEnvironment('<html><head></head><body></body></html>'),{runScripts:'dangerously'});
 try{a.window.localStorage.setItem('history','react');assert.equal(a.window.localStorage.getItem('history'),'react');assert.equal(b.window.localStorage.getItem('history'),null);assert.equal(a.window.localStorage.key(0),'history');assert.equal(a.window.localStorage.length,1);a.window.localStorage.clear();assert.equal(a.window.localStorage.length,0);a.window.document.cookie='consent=true';assert.equal(a.window.document.cookie,'consent=true');assert.equal(b.window.document.cookie,'');}finally{a.window.close();b.window.close();}
});
test('recovered media replaces actual image, srcset, style and fetch bindings while preserving unrelated requests',async()=>{
 const calls=[],old='https://dead.example/image.jpg',local='/assets/demo-cache/test.webp';
 const html=injectDemoAssets('<html><head></head><body><img id="photo" src="'+old+'"><img id="empty"><div style="background-image:url('+old+')"></div></body></html>',{[old]:local,__emptyImage:local});
 const dom=new JSDOM(html,{url:'http://localhost/',runScripts:'dangerously',beforeParse(w){w.fetch=async(input,options)=>{calls.push({input,options});return{};};w.Request=Request;}});
 try{await wait(60);const w=dom.window,image=w.document.getElementById('photo');assert.equal(image.getAttribute('src'),local);assert.equal(w.document.getElementById('empty').getAttribute('src'),local);image.src=old;assert.equal(image.getAttribute('src'),local);image.srcset=old+' 1x';assert.match(image.getAttribute('srcset'),/test.webp 1x/);assert.match(w.document.querySelector('div').getAttribute('style'),/test.webp/);await w.fetch(old);assert.equal(calls[0].input,local);const options={method:'POST',body:'example'};await w.fetch('/api/demo',options);assert.equal(calls[1].input,'/api/demo');assert.equal(calls[1].options,options);}finally{dom.window.close();}
});
test('readiness waits for images and reports failures instead of calling broken media ready',async()=>{
 const messages=[];const dom=new JSDOM(instrumentPreviewHTML('<html><head></head><body><h1>Gallery</h1><img src="/photo.jpg"></body></html>','gallery','http://localhost/example.html'),{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.postMessage=data=>messages.push(data);}});
 try{const w=dom.window,image=w.document.querySelector('img');let loaded=false;Object.defineProperty(image,'complete',{get:()=>true});Object.defineProperty(image,'naturalWidth',{get:()=>loaded?640:0});await wait(50);assert.ok(messages.some(m=>m.type==='preview-media-error'&&m.checked));assert.ok(!messages.some(m=>m.type==='preview-ready'));loaded=true;image.dispatchEvent(new w.Event('load'));assert.ok(messages.some(m=>m.type==='preview-ready'&&m.checked));}finally{dom.window.close();}
});
test('Circular Carousel has three decoded local images and its downloaded preview embeds them',async()=>{
 const payload=JSON.parse(await fs.readFile('public/code/runtime/reactbits--circular-carousel.json','utf8')),sources=[...new Set([...payload.demoCode.matchAll(/src:\s*['"]([^'"]+)/g)].map(m=>m[1]))];assert.equal(sources.length,3);
 for(const url of sources){assert.ok(url.startsWith('/assets/'));const image=await loadImage(await fs.readFile(path.join('public',url)));assert.ok(image.width>100&&image.height>100);}
 const previous=globalThis.fetch;globalThis.fetch=async url=>{try{const bytes=await fs.readFile(path.join('public',String(url).split('?')[0]));return{ok:true,text:async()=>bytes.toString('utf8'),json:async()=>JSON.parse(bytes.toString('utf8')),arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};}catch{return{ok:false};}};
 try{const html=await standalonePreview({id:'reactbits--circular-carousel',previewPath:'/previews/runtime/reactbits--circular-carousel.html'});assert.match(html,/data:image\/jpeg;base64,/);assert.ok(!html.includes('/assets/demo-recovered/'),'export has no dependency on the local media server');}finally{globalThis.fetch=previous;}
});

test('serialized workers receive captured compiler helpers without changing exported binary blobs',async()=>{
 const bootstrap='var nameFunction=(fn,name)=>Object.defineProperty(fn,"name",{value:name,configurable:true});';
 const metadata='<script data-umso-worker-bootstrap type="application/json">'+JSON.stringify(bootstrap)+'</script>';
 const dom=new JSDOM(injectPreviewEnvironment('<html><head>'+metadata+'</head><body></body></html>'),{runScripts:'dangerously',beforeParse(w){w.Blob=Blob;w.Worker=function Worker(){};}});
 try{const WorkerBlob=dom.window.Blob;const script=new WorkerBlob(['"use strict";\nvar task=nameFunction(function(){return 42},"task");postMessage(task());'],{type:'text/javascript'});const source=await script.text();assert.ok(source.startsWith('"use strict";'));assert.match(source,/umso-worker-compat/);const values=[];new Function('postMessage',source)(value=>values.push(value));assert.deepEqual(values,[42]);const bytes=new Uint8Array([0,1,2,255]);const binary=new WorkerBlob([bytes],{type:'application/octet-stream'});assert.deepEqual(new Uint8Array(await binary.arrayBuffer()),bytes);assert.ok(new Blob(['native']) instanceof WorkerBlob);assert.equal(await new WorkerBlob(['name,value\na,1'],{type:'text/csv'}).text(),'name,value\na,1');}finally{dom.window.close();}
});

test('every recovered asset mapping resolves to a nonempty public file',async()=>{
 const manifest=JSON.parse(await fs.readFile('public/data/demo-local-assets.json','utf8')),files=new Set([...Object.values(manifest.urls),...Object.values(manifest.items).flatMap(map=>Object.values(map))]);
 for(const file of files){assert.ok(file.startsWith('/assets/'),file);const stat=await fs.stat(path.join('public',file));assert.ok(stat.isFile()&&stat.size>0,file);}
});
test('restored model remains binary GLB and captured Markdown no longer requires remote modules',async()=>{
 const manifest=JSON.parse(await fs.readFile('public/data/demo-local-assets.json','utf8')),model=manifest.items['21st-d0e4067d93f1']['https://danielcodepen.s3.us-east-1.amazonaws.com/figma.fbx.glb'];assert.equal((await fs.readFile(path.join('public',model))).subarray(0,4).toString(),'glTF');
 const rows=JSON.parse(await fs.readFile('public/data/catalog-live.json','utf8')),markdown=rows.find(r=>r.id==='21st-fa6fb3a3c735'),html=await fs.readFile(path.join('public',markdown.previewPath),'utf8');assert.ok(!html.includes('https://esm.sh/'));assert.ok(!html.includes('https://cdn.tailwindcss.com'));assert.match(html,/Release notes/);
});

test('readiness sees controls inside an open custom-element shadow root',async()=>{
 const messages=[];const dom=new JSDOM(instrumentPreviewHTML('<html><head></head><body><model-picker></model-picker></body></html>','picker','http://localhost/example.html'),{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.postMessage=data=>messages.push(data);}});
 try{const w=dom.window;Object.defineProperty(w.document.body,'innerText',{value:''});const shadow=w.document.querySelector('model-picker').attachShadow({mode:'open'}),button=w.document.createElement('button');button.textContent='Select model';button.getBoundingClientRect=()=>({width:100,height:40});shadow.append(button);await wait(180);assert.ok(messages.some(m=>m.type==='preview-ready'&&m.checked));}finally{dom.window.close();}
});
