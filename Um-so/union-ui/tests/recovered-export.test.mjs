import test from 'node:test';
import assert from 'node:assert/strict';
import {standalonePreview,componentPrompt,componentArchive} from '../src/component-export.js';
import {unzipSync,strFromU8} from 'fflate';

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
 const result=await componentPrompt({name:'Example',framework:'html',availability:'preview'},{framework:'html',reconstructionPrompt:'PROMPT RECONSTRUÍDO',files:[{path:'preview.html',content:'<p>Demo</p>'}]},{settings:{accent:'#ff6600'}});
 assert.ok(result.includes('PROMPT RECONSTRUÍDO'));assert.ok(result.includes('HTML'));assert.ok(result.includes('PERSONALIZAÇÃO VISUAL'));assert.ok(result.length<10000);
});
test('template ZIP retains cyclic modules as files and supplies a local server',async()=>{
 const original=globalThis.fetch;const base='/previews/recovered/demos/example';
 const values={
  [base+'/index.html']:'<html><head></head><body><script type="module" src="'+base+'/assets/a.js"></script></body></html>',
  [base+'/assets/a.js']:'import "'+base+'/assets/b.js";',
  [base+'/assets/b.js']:'import "'+base+'/assets/a.js";',
  '/previews/recovered/compat.js':'window.compat=true;',
  '/data/recovered-demo-assets.json':JSON.stringify({example:['index.html','assets/a.js','assets/b.js']}),
  '/licenses/ATTRIBUTIONS.md':'Notices','/licenses/manifest.json':'[]',
 };
 globalThis.fetch=async url=>new Response(values[url],{status:Object.hasOwn(values,url)?200:404});
 try{const zip=unzipSync(await componentArchive({name:'Example',framework:'html',availability:'preview',previewPath:base+'/index.html'},{files:[]}));assert.ok(zip['serve.mjs']);assert.equal(strFromU8(zip['assets/a.js']),'import "/assets/b.js";');assert.ok(strFromU8(zip['README.md']).includes('node serve.mjs'));}finally{globalThis.fetch=original;}
});
