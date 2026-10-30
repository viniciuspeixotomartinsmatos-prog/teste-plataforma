import test from 'node:test';
import assert from 'node:assert/strict';
import {standalonePreview,componentPrompt} from '../src/component-export.js';

test('downloaded recovered demos embed their scripts, styles and local media',async()=>{
 const original=globalThis.fetch;
 const values={
  '/previews/recovered/demo.html':'<html><head><link rel="stylesheet" href="/previews/recovered/styles.css"></head><body><img src="/previews/recovered/build/image.webp"><script src="/previews/recovered/runtime.js"></script></body></html>',
  '/previews/recovered/styles.css':'body{background:url("/previews/recovered/build/image.webp")}',
  '/previews/recovered/runtime.js':'window.asset="/previews/recovered/build/image.webp";',
  '/previews/recovered/build/image.webp':new Uint8Array([1,2,3]),
 };
 globalThis.fetch=async url=>new Response(values[url],{status:Object.hasOwn(values,url)?200:404,headers:{'Content-Type':String(url).endsWith('.webp')?'image/webp':'text/plain'}});
 try{const html=await standalonePreview({previewPath:'/previews/recovered/demo.html'});assert.ok(html.includes('window.asset='));assert.ok(html.includes('data:image/webp;base64,AQID'));assert.ok(!html.includes('/previews/recovered/'));assert.ok(!html.includes('<link'));}finally{globalThis.fetch=original;}
});
test('recovered prompts carry the reconstruction disclosure into the copied prompt',async()=>{
 const result=await componentPrompt({name:'Example',framework:'html',availability:'preview'},{framework:'html',reconstructionPrompt:'PROMPT RECONSTRUÍDO',files:[{path:'preview.html',content:'<p>Demo</p>'}]});
 assert.ok(result.includes('PROMPT RECONSTRUÍDO'));assert.ok(result.includes('HTML'));
});
