// Rehydrate only the exact originals recorded after runtime failures. This
// command never republishes the catalog or substitutes unrelated media.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {loadImage} from '@napi-rs/canvas';

const root=fileURLToPath(new URL('../',import.meta.url));
const manifest=JSON.parse(await fs.readFile(path.join(root,'public/data/runtime-media-repairs.json'),'utf8'));
const recover=process.argv.includes('--recover');
for(const item of manifest.items){
 const source=new URL(item.source);
 if(!['https://profitize.com.br','https://margem-demo-omega.vercel.app'].includes(source.origin)||!/^\/previews\/recovered\/(?:build\/componentes\/clothing-rail-hero\/260w|demos\/margem\/trabalhos)\/[a-z0-9-]+\.webp$/.test(item.local))throw Error('Unexpected retained-media target.');
 const file=path.join(root,'public',item.local);let bytes;
 try{bytes=await fs.readFile(file);}catch(error){
  if(error.code!=='ENOENT'||!recover)throw error;
  const response=await fetch(source,{signal:AbortSignal.timeout(25000),redirect:'error'});
  if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw Error('Original image unavailable: '+item.local);
  bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length!==item.bytes||createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('Original image changed; manual review required: '+item.local);
  await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,bytes,{flag:'wx'});
 }
 if(bytes.length!==item.bytes||createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('Retained image integrity failed: '+item.local);
 const image=await loadImage(bytes);
 if(image.width!==item.width||image.height!==item.height)throw Error('Retained image dimensions changed: '+item.local);
}
console.info(JSON.stringify({verified:manifest.items.length,mode:recover?'recover-missing-only':'offline-integrity'}));
