import fs from 'node:fs/promises';
import path from 'node:path';
import {loadImage} from '@napi-rs/canvas';
const read=async name=>JSON.parse(await fs.readFile('public/data/'+name+'.json','utf8'));
const [catalog,expanded]=await Promise.all([read('catalog-live'),read('preview-expansion')]);
const retained=new Map(expanded.map(r=>[r.id,r]));
await fs.mkdir('var/media',{recursive:true});await fs.mkdir('public/assets/thumbnails/recovered',{recursive:true});
let library;try{const response=await fetch('https://21st.dev/homepage/g3/library.json',{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(response.status);library=await response.json();await fs.writeFile('var/media/21st-library.json',JSON.stringify(library));}catch{library=JSON.parse(await fs.readFile('var/media/21st-library.json','utf8'));}
const originals=new Map([...library.categories.flatMap(c=>c.items),...(library.templates||[]),...(library.themes||[]),...(library.apps||[])].filter(r=>r.url).map(r=>[new URL(r.url,'https://21st.dev').href,r]));
let media={};try{media=await read('catalog-media');}catch{}
const tasks=catalog.filter(r=>r.sourceId==='21st'&&(!r.image||r.image.startsWith('/assets/thumbnails/recovered/')));
let cursor=0,done=0,recovered=0,writing=Promise.resolve();const failures=[];
async function image(url){
 if(!url||new URL(url).hostname!=='cdn.21st.dev')throw Error('Untrusted media URL');
 const r=await fetch(url,{signal:AbortSignal.timeout(12000)});if(!r.ok||!r.headers.get('content-type')?.startsWith('image/')){await r.body?.cancel();throw Error('Image unavailable');}
 const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length<100||bytes.length>15000000)throw Error('Invalid image size');
 const decoded=await loadImage(bytes);if(decoded.width<24||decoded.height<24)throw Error('Invalid image dimensions');
 const ext=r.headers.get('content-type').includes('png')?'png':r.headers.get('content-type').includes('jpeg')?'jpg':'webp';
 return{bytes,ext};
}
async function checkpoint(){await fs.writeFile('public/data/catalog-media.json',JSON.stringify(media));await fs.writeFile('var/media/recovery-report.json',JSON.stringify({checked:done,total:tasks.length,recovered,failures},null,2));}
await Promise.all(Array.from({length:16},async()=>{
 while(cursor<tasks.length){const row=tasks[cursor++];
  if(media[row.id]?.image){try{await fs.access('public'+media[row.id].image);recovered++;done++;continue;}catch{}}
  const original=originals.get(row.url),retention=retained.get(row.id);
  // Older bundles use the same version stem for their associated preview.
  // These inferred candidates are accepted only after successful image decoding.
  const stem=retention?.previewUrl?.replace(/\/bundle\./,'/preview.').replace(/\.html$/,'');
  const candidates=[original?.preview,...(stem?[stem+'.webp',stem+'.png']:[])].filter((v,i,a)=>v&&a.indexOf(v)===i);
  let found=false;
  for(const url of candidates)try{const file=await image(url),local='/assets/thumbnails/recovered/'+row.id+'.'+file.ext;await fs.writeFile('public'+local,file.bytes);media[row.id]={image:local,imageSource:url,...(original?.video?{videoSource:original.video}:{}),mediaKind:'original-image'};found=true;recovered++;break;}catch{}
  if(!found)failures.push(row.id);
  done++;if(done%250===0){const snapshot=JSON.stringify(media);writing=writing.then(()=>fs.writeFile('public/data/catalog-media.json',snapshot));console.log(JSON.stringify({checked:done,total:tasks.length,recovered}));}
 }
}));
await writing;await checkpoint();console.log(JSON.stringify({checked:done,total:tasks.length,recovered,withoutOriginalImage:failures.length}));
