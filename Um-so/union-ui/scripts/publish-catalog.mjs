import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve('public');
const read=async name=>JSON.parse(await fs.readFile(path.join(root,'data',name+'.json'),'utf8'));
const [catalog,readiness,expanded]=await Promise.all([read('catalog'),read('preview-readiness'),read('preview-expansion')]);
let patches={};try{patches=await read('catalog-connected');}catch{}
let media={};try{media=await read('catalog-media');}catch{}
try{media={...media,...await read('icon-covers')};}catch{}
const compiled=new Map(readiness.items.filter(x=>x.status==='ready'&&x.hasDemo).map(x=>[x.id,x]));
const retained=new Map(expanded.filter(x=>x.previewPath).map(x=>[x.id,x]));
const live=[];
for(const original of catalog){
 const cover=media[original.id];
 const item={...original,...patches[original.id],...(cover?.image?{image:cover.image}:{}),...(cover?.video?{video:cover.video}:{})};
 const runtime=compiled.get(item.id),capture=retained.get(item.id);
 const previewPath=runtime?.previewPath||capture?.previewPath||item.previewPath;
 if(!previewPath)continue;
 const local='/'+previewPath.replace(/^\/+/, '');
 try{await fs.access(path.join(root,local));}catch{continue;}
 const slug=item.name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\b(?:21st|magic ui|react bits|aceternity|kokonut|tailark|animate ui)\b/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'componente';
 const row={...item,framework:runtime?.framework||item.framework||(item.slug.startsWith('vue/')?'vue':'react'),previewPath:local,publicSlug:slug+'-'+crypto.createHash('sha1').update(item.id).digest('hex').slice(0,6)};
 const runtimeCodePath='/code/runtime/'+item.id+'.json';
 try{await fs.access(path.join(root,runtimeCodePath));row.originalCodePath=row.codePath;row.codePath=runtimeCodePath;}catch{}
 if(local.startsWith('/previews/runtime/'))row.runtimePreviewPath=local;
 live.push(row);
}
await fs.writeFile(path.join(root,'data/catalog-live.json'),JSON.stringify(live));
await fs.writeFile(path.join(root,'data/catalog-coverage.json'),JSON.stringify({generatedAt:new Date().toISOString(),indexed:catalog.length,published:live.length,compiledWithExample:compiled.size,retained:retained.size,remaining:catalog.length-live.length},null,2));
console.log(JSON.stringify({published:live.length,indexed:catalog.length}));
