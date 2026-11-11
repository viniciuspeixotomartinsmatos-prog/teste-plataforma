import test from 'node:test';
import assert from 'node:assert/strict';
import {standalonePreview,componentPrompt,componentArchive} from '../src/component-export.js';
import {unzipSync,strFromU8} from 'fflate';

test('authorized original releases copy their actual prompts and export byte-identical supporting packages',async()=>{
 const fs=await import('node:fs/promises'),path=await import('node:path'),original=globalThis.fetch;
 globalThis.fetch=async url=>{try{if(typeof url!=='string'||!url.startsWith('/'))return new Response('',{status:404});const bytes=await fs.readFile(path.join('public',url));return new Response(bytes,{headers:{'content-type':url.endsWith('.mp4')?'video/mp4':url.endsWith('.webp')?'image/webp':url.endsWith('.js')?'text/javascript':'application/octet-stream'}});}catch{return new Response('',{status:404});}};
 try{
  const catalog=JSON.parse(await fs.readFile('public/data/catalog-live.json','utf8'));
  for(const slug of ['kairo','orbo','alisio','patio','scoopie','trami','arbo','sticker-slap-footer']){
   const item=catalog.find(row=>row.id==='recovered--'+slug);assert.ok(item,slug);
   const payload=JSON.parse(await fs.readFile('public'+item.codePath,'utf8'));
   const prompt=await fs.readFile('../research/source-checks/releases/2026-11-09/profitize/'+slug+'/PROMPT-ORIGINAL.md','utf8');
   const normalizePrompt=text=>text.replace(/\r\n/g,'\n');
   assert.equal(normalizePrompt(await componentPrompt(item,payload)),normalizePrompt(prompt),slug);
   const archive=unzipSync(await componentArchive(item,payload));
   assert.equal(normalizePrompt(strFromU8(archive['src/PROMPT-ORIGINAL.md'])),normalizePrompt(prompt));
   if(slug==='sticker-slap-footer'){
    assert.ok(archive['src/components/ui/sticker-slap-footer.tsx']);
    assert.ok(archive['src/components/sticker-slap-footer-demo.tsx']);
    assert.ok(!/<script[^>]+src="\/previews\//.test(strFromU8(archive['preview.html'])));
   }else{
    assert.deepEqual(archive[slug+'-arquivos.zip'],new Uint8Array(await fs.readFile('../research/source-checks/releases/2026-11-09/profitize/'+slug+'/arquivos.zip')));
    const embedded=strFromU8(archive['preview.html']).match(/<video[^>]+src="data:video\/mp4;base64,([^"]+)"/)?.[1];assert.ok(embedded,slug);
    const media=(await fs.readFile('public'+item.previewPath,'utf8')).match(/<video[^>]+src="([^"]+)"/)[1];
    assert.deepEqual(Buffer.from(embedded,'base64'),await fs.readFile('public'+media));
   }
  }
 }finally{globalThis.fetch=original;}
});

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

test('new interactive component exports embed dynamically assembled poster and dish URLs',async()=>{
 const fs=await import('node:fs/promises'),path=await import('node:path'),original=globalThis.fetch;
 globalThis.fetch=async url=>{try{if(typeof url!=='string'||!url.startsWith('/'))return new Response('',{status:404});const bytes=await fs.readFile(path.join('public',url.split('?')[0])),ext=path.extname(url).slice(1);return new Response(bytes,{headers:{'content-type':{webp:'image/webp',png:'image/png',jpg:'image/jpeg',js:'text/javascript',css:'text/css',woff2:'font/woff2',json:'application/json'}[ext]||'application/octet-stream'}});}catch{return new Response('',{status:404});}};
 try{const catalog=JSON.parse(await fs.readFile('public/data/catalog-live.json','utf8'));for(const slug of ['sushi-conveyor-menu','glassy-coverflow-carousel','clothing-rail-hero']){const item=catalog.find(r=>r.slug===slug&&r.sourceId==='recovered');assert.ok(Object.keys(item.previewAssets).length>=6);const html=await standalonePreview(item);for(const url of Object.keys(item.previewAssets))assert.ok(html.includes(JSON.stringify(url)+':"data:image/webp;base64,'),url+' must map to embedded pixels');assert.ok(!/<script[^>]+src="\/previews\/recovered/.test(html));}}finally{globalThis.fetch=original;}
});

test('daily release downloads embed original video bytes and retain reusable Dither source dependencies',async()=>{
 const fs=await import('node:fs/promises'),path=await import('node:path'),original=globalThis.fetch;
 globalThis.fetch=async url=>{try{if(typeof url!=='string'||!url.startsWith('/'))return new Response('',{status:404});const ext=path.extname(url),bytes=await fs.readFile(path.join('public',url));return new Response(bytes,{headers:{'content-type':{'.mp4':'video/mp4','.webp':'image/webp','.json':'application/json','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2'}[ext]||'text/plain'}});}catch{return new Response('',{status:404});}};
 try{
  const catalog=JSON.parse(await fs.readFile('public/data/catalog-live.json','utf8'));
  for(const slug of ['argila','lavri','skeleton','colina']){
   const item=catalog.find(item=>item.sourceId==='recovered'&&item.slug===slug),payload=JSON.parse(await fs.readFile('public'+item.codePath,'utf8'));
   const files=unzipSync(await componentArchive(item,payload)),html=strFromU8(files['preview.html']);
   const embedded=html.match(/<video[^>]+src="data:video\/mp4;base64,([^"]+)"/)?.[1];assert.ok(embedded,slug);
   const local=(await fs.readFile('public'+item.previewPath,'utf8')).match(/<video[^>]+src="([^"]+)"/)[1];
   assert.deepEqual(Buffer.from(embedded,'base64'),await fs.readFile('public'+local),slug);
   assert.ok(strFromU8(files['src/RECONSTRUCTION.md']).includes('Não é o prompt original'));
  }
  const item=catalog.find(item=>item.id==='magic--dither-field'),payload=JSON.parse(await fs.readFile('public'+item.codePath,'utf8'));
  const files=unzipSync(await componentArchive(item,payload));assert.ok(files['src/lib/utils.ts']);assert.ok(files['src/registry/magicui/dither-field.tsx']);
  assert.ok(strFromU8(files['README.md']).includes('clsx, tailwind-merge'));assert.ok(!/<script[^>]+src="\/previews\/runtime\//.test(strFromU8(files['preview.html'])));
 }finally{globalThis.fetch=original;}
});
