import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {JSDOM,VirtualConsole} from 'jsdom';
import {unzipSync,strFromU8} from 'fflate';
import {componentArchive,componentPrompt} from '../src/component-export.js';
const release='../research/source-checks/releases/2026-11-09';
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));

test('all 125 observed routes resolve to public metadata without duplicate source identities',async()=>{
 const metadata=await read(release+'/21st-target-metadata.json');
 assert.equal(metadata.targets.length,125);assert.equal(metadata.resolved.length,125);assert.deepEqual(metadata.unresolved,[]);
 assert.equal(new Set(metadata.resolved.map(row=>row.type+':'+row.id)).size,125);
 const stage=await read(release+'/21st-stage.json');assert.equal(stage.length,144);assert.equal(new Set(stage.map(row=>row.id)).size,144);
 for(const item of stage){
  const payload=await read('public'+item.codePath);assert.ok(payload.files.some(file=>file.content.length>100));assert.ok(payload.demoCode.length>30);
 }
});

test('retained example media remains byte-identical and compilation failures are explicit',async()=>{
 const media=await read(release+'/21st-media.json');assert.ok(media.length>=200);assert.ok(media.every(row=>row.local&&!row.error));
 for(const item of media){const data=await fs.readFile('public'+item.local);assert.equal(data.length,item.bytes);assert.equal(crypto.createHash('sha256').update(data).digest('hex'),item.sha256);}
 const compile=await read(release+'/21st-compile.json');assert.equal(compile.length,144);assert.equal(compile.filter(row=>row.status==='compiled').length,138);
 for(const item of compile.filter(row=>row.status==='compiled'))assert.ok((await fs.stat('public'+item.previewPath)).size>100);
 const fallback=await read(release+'/21st-original-bundles.json');assert.equal(fallback.length,6);
 for(const item of fallback){assert.equal(item.originalPreviewStatus,'retained-specific-item');const original=(await read(release+'/21st-stage.json')).find(row=>row.id===item.id);assert.ok(new URL(item.bundleUrl).pathname.includes('/'+original.url.split('/').pop()+'/'));assert.ok((await fs.stat(release+'/'+item.file)).size>1000);}
});

test('theme demonstrations preserve original CSS and their controls work',async()=>{
 const themes=await read(release+'/21st-theme-candidates.json');assert.equal(themes.length,16);
 for(const item of themes){
  const payload=await read('public'+item.codePath);assert.ok(payload.files.find(file=>file.path==='theme.css').content.includes(':root'));
  const html=await fs.readFile('public'+item.previewPath,'utf8');if(item.id==='21st-theme-d85d5236-fa81-4abf-ad30-ceed37fdb932'){assert.match(html,/--foreground:hsl\(0 0% 100%\)/);assert.equal(payload.files.find(file=>file.path==='theme.css').content,':root{--background:0 0% 100%;--foreground:0 0% 0%}.dark{--background:0 0% 0%;--foreground:0 0% 100%}');}
  const dom=new JSDOM(html,{runScripts:'dangerously',virtualConsole:new VirtualConsole()});
  try{const doc=dom.window.document;doc.querySelector('#theme').click();assert.ok(doc.documentElement.classList.contains('dark'));doc.querySelector('#save').click();assert.match(doc.querySelector('#status').textContent,/salvo/);doc.querySelector('input').value='Example';doc.querySelector('#reset').click();assert.equal(doc.querySelector('input').value,'');assert.equal(doc.querySelectorAll('script').length,1);}finally{dom.window.close();}
 }
});

test('candidate prompt and portable downloads work without claiming missing editable helpers',async()=>{
 const previous=globalThis.fetch;
 globalThis.fetch=async url=>{try{assert.ok(typeof url==='string'&&url.startsWith('/'));const bytes=await fs.readFile(path.join('public',url.split('?')[0]));return new Response(bytes,{headers:{'content-type':url.endsWith('.js')?'text/javascript':url.endsWith('.webp')?'image/webp':url.endsWith('.png')?'image/png':url.endsWith('.woff2')?'font/woff2':'text/plain'}});}catch{return new Response('',{status:404});}};
 try{
  const candidates=await read(release+'/21st-candidate-catalog.json');
  for(const id of ['21st-release-18354','21st-release-19204','21st-release-31717',candidates.find(row=>row.kind==='theme').id]){
   const item=candidates.find(row=>row.id===id),payload=await read('public'+item.codePath);assert.ok(item);
   const prompt=await componentPrompt(item,payload);assert.ok(prompt.length>100);
   const archive=unzipSync(await componentArchive(item,payload));assert.ok(archive['preview.html']);assert.ok(strFromU8(archive['LICENSE-NOTICES.md']).length>10);
   if(item.recoveryMode==='interactive-compiled-example')assert.ok(archive['src/SOURCE-LIMITATIONS.md']);
   else assert.ok(payload.files.every(file=>archive['src/'+file.path]));
  }
 }finally{globalThis.fetch=previous;}
});

test('publication refuses candidates without actual browser evidence and leaves shipped catalog intact',async()=>{
 const before=await fs.readFile('public/data/catalog-live.json');
 const result=spawnSync(process.execPath,['scripts/publish-21st-release.mjs','--evidence=var/absent-browser-evidence.json'],{encoding:'utf8'});
 assert.notEqual(result.status,0);assert.match(result.stderr,/browser validation is missing/);
 assert.deepEqual(await fs.readFile('public/data/catalog-live.json'),before);
});
