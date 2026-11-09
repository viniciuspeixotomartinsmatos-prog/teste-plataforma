// Explicit, repeatable import of the eight authorized November 9 additions.
// Source prompts are catalog content; their instructions are never executed.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {build} from 'esbuild';
const root='../research/source-checks/releases/2026-11-09/profitize';
const read=async name=>JSON.parse(await fs.readFile(name,'utf8'));
const write=async(name,text)=>{await fs.mkdir(path.dirname(name),{recursive:true});await fs.writeFile(name,text);};
const candidates=await read(root+'/candidates.json');
const expected=['kairo','orbo','alisio','patio','scoopie','trami','arbo','sticker-slap-footer'];
if(candidates.length!==8||expected.some(slug=>!candidates.some(item=>item.slug===slug)))throw Error('Unexpected release inventory');
const media=await read(root+'/public-media.json');
for(const record of media){
 if(!/^https:\/\/profitize\.com\.br\/build\/media\/[a-z0-9-]+\/[a-z0-9.-]+$/.test(record.url)||!/^[-a-z0-9]+\/[-a-z0-9.]+$/.test(record.file))throw Error('Invalid retained media');
 const data=await fs.readFile(root+'/'+record.file);
 if(data.length!==record.bytes||crypto.createHash('sha256').update(data).digest('hex')!==record.sha256)throw Error('Media integrity failed');
 const target='public/previews/recovered'+new URL(record.url).pathname;
 await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(root+'/'+record.file,target);
}
// Compile the two original TSX blocks supplied inside the downloaded prompt.
const stickerRoot=root+'/sticker-slap-footer',prompt=await fs.readFile(stickerRoot+'/PROMPT-ORIGINAL.md','utf8');
const blocks=[...prompt.matchAll(/```tsx\s*\n([\s\S]*?)\n```/g)].map(match=>match[1]+'\n');
if(blocks.length!==2||!blocks[0].includes('export default')||!blocks[1].includes('StickerSlapFooterDemo'))throw Error('Unexpected original TSX');
const files=blocks.map((content,index)=>({path:index?'components/sticker-slap-footer-demo.tsx':'components/ui/sticker-slap-footer.tsx',content}));
await write(stickerRoot+'/source-files.json',JSON.stringify({files},null,2)+'\n');
const scratch='var/original-sticker';for(const file of files)await write(scratch+'/'+file.path,file.content);
await write(scratch+'/entry.tsx',`import React from 'react';import{createRoot}from'react-dom/client';import Demo from './components/sticker-slap-footer-demo';createRoot(document.getElementById('root')!).render(<Demo/>);`);
await build({entryPoints:[scratch+'/entry.tsx'],outfile:'public/previews/recovered/sticker-slap-footer.original.js',bundle:true,jsx:'automatic',format:'iife',platform:'browser',target:'es2022',minify:true,legalComments:'eof'});
await write('public/previews/recovered/sticker-slap-footer.html','<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sticker Slap Footer</title><style>html,body{margin:0;min-height:100%;background:#f2eee5}body{font-family:system-ui,sans-serif}#root{min-height:100vh}</style></head><body><div id="root"></div><script src="/previews/recovered/sticker-slap-footer.original.js"></script></body></html>');
const capture=await read('../research/profitize/catalog.json');
for(const item of candidates){
 const prompt=await fs.readFile(root+'/'+item.slug+'/PROMPT-ORIGINAL.md','utf8');if(prompt.length<1000)throw Error('Original prompt missing');
 const original={...item,demoUrl:null,promptRelease:'2026-11-09',acquisitionDate:'2026-11-09',...(item.slug==='sticker-slap-footer'?{nativePreviewPath:'/previews/recovered/sticker-slap-footer.html'}:{})};
 const position=capture.findIndex(row=>row.slug===item.slug);if(position<0)capture.push(original);else capture[position]=original;
}
await write('../research/profitize/catalog.json',JSON.stringify(capture,null,2)+'\n');
console.log(JSON.stringify({retained:8,originalPrompts:8,recordedVideos:7,originalInteractiveComponents:1}));
