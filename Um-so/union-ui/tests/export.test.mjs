import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {unzipSync,strFromU8} from 'fflate';
import {componentArchive,componentPrompt} from '../src/component-export.js';
const rows=JSON.parse(await fs.readFile('public/data/catalog.json','utf8'));
globalThis.fetch=async url=>{try{const bytes=await fs.readFile(path.join('public',String(url)));return{ok:true,text:async()=>bytes.toString('utf8'),json:async()=>JSON.parse(bytes.toString('utf8')),arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};}catch{return{ok:false,status:404};}};
test('export includes original code, current settings, notices and a standalone preview',async()=>{
 const original=rows.find(r=>r.id==='magic--particles');
 const item={...original,previewPath:'/previews/runtime/magic--particles.html'};
 const payload=JSON.parse(await fs.readFile('public/code/runtime/magic--particles.json','utf8'));
 const zip=await componentArchive(item,payload,{name:'Particles',config:{quantity:42,color:'#ff0000'}});
 const files=unzipSync(zip),html=strFromU8(files['preview.html']);
 assert.ok(html.includes('createRoot'));assert.ok(html.includes('preview:set-props'));
 assert.ok(!/<script[^>]+src="\/previews\/runtime\//.test(html),'preview has no dependency on local JS server');
 assert.ok(!/href="\/assets\/preview\.css/.test(html),'stylesheet is included');
 assert.ok(html.includes('data:font/woff2;base64,'),'local font is portable');
 assert.ok(!html.includes('/assets/fonts/Inter.woff2'));
 assert.equal(JSON.parse(strFromU8(files['preview-settings.json'])).quantity,42);
 assert.ok(files['LICENSE-NOTICES.md']);assert.ok(Object.keys(files).some(p=>p.startsWith('src/')&&p.endsWith('particles.tsx')));
 assert.ok(Object.keys(files).some(p=>p.startsWith('licenses/')&&p.includes('magic')),'full technical notices accompany exported source');
});

test('prompt for a retained preview includes executable HTML instead of an unresolved usage import',async()=>{
 const item={...rows.find(r=>r.id==='magic--particles'),availability:'usage',previewPath:'/previews/runtime/magic--particles.html'};
 const text=await componentPrompt(item,{files:[{path:'usage.tsx',content:'import Example from "unresolved-usage-only";'}]},{name:'Example'});
 assert.ok(text.includes('DEMONSTRAÇÃO HTML COMPLETA'));
 assert.ok(text.includes('<!doctype html>'));
 assert.ok(text.includes('createRoot'));
 assert.ok(!text.includes('unresolved-usage-only'));
});

test('Vue export preserves SFC files, Vue example extension and correct integration instructions',async()=>{
 const item={...rows.find(row=>row.id==='animate-vue-hugeicons-accessibility'),framework:'vue',previewPath:'/previews/runtime/animate-vue-hugeicons-accessibility.html'};
 const payload=JSON.parse(await fs.readFile('public/code/runtime/animate-vue-hugeicons-accessibility.json','utf8'));
 const files=unzipSync(await componentArchive(item,payload));
 assert.ok(files['example.vue']);assert.ok(!files['example.tsx']);
 assert.ok(Object.keys(files).some(name=>name.startsWith('src/')&&name.endsWith('.vue')));
 assert.ok(strFromU8(files['README.md']).includes('projeto Vue'));
 const prompt=await componentPrompt(item,payload);
 assert.ok(prompt.includes('IMPLEMENTAÇÃO VUE E ARQUIVOS AUXILIARES'));
 assert.ok(prompt.includes('<template>'));
 assert.ok(payload.dependencies.includes('motion-v'));
});
