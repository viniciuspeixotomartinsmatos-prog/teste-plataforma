import fs from 'node:fs/promises';
import path from 'node:path';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const manifest='public/data/catalog-media.json',media=JSON.parse(await fs.readFile(manifest,'utf8'));
const entries=Object.entries(media).filter(([,r])=>!r.optimized),root=path.resolve('public/assets/thumbnails/recovered'),temporary=path.resolve('var/media/optimized');
await fs.mkdir(temporary,{recursive:true});let cursor=0,done=0,before=0,after=0;const prepared=[];
if(process.argv.includes('--prepared')){const saved=JSON.parse(await fs.readFile('var/media/optimized-index.json','utf8'));prepared.push(...saved.prepared);before=saved.before;after=saved.after;done=prepared.length;}else await Promise.all(Array.from({length:4},async()=>{while(cursor<entries.length){const [id,row]=entries[cursor++],source=path.resolve('public'+row.image);
 if(!source.startsWith(root+path.sep)||!/^21st-[a-z0-9-]+$/.test(id))throw Error('Unexpected cover path');
 const input=await fs.readFile(source),image=await loadImage(input),scale=Math.min(1,800/image.width),canvas=createCanvas(Math.max(1,Math.round(image.width*scale)),Math.max(1,Math.round(image.height*scale)));
 canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);const bytes=await canvas.encode('webp',82),target=path.join(temporary,id+'.webp');await fs.writeFile(target,bytes);
 prepared.push({id,source,target,bytes:bytes.length});before+=input.length;after+=bytes.length;if(++done%1000===0)console.log(JSON.stringify({prepared:done,total:entries.length}));
}}));
await fs.writeFile('var/media/optimized-index.json',JSON.stringify({before,after,prepared}));
console.log(JSON.stringify({prepared:done,beforeMB:Math.round(before/1048576),afterMB:Math.round(after/1048576),next:'Run with --apply after preparation to replace published covers.'}));
if(process.argv.includes('--apply')){
 const backup=path.resolve('var/media/original-covers');await fs.mkdir(backup,{recursive:true});
 for(const {id,source,target}of prepared){
  const saved=path.resolve(backup,path.basename(source)),destination=path.resolve(root,id+'.webp');
  if(!source.startsWith(root+path.sep)||!destination.startsWith(root+path.sep)||!saved.startsWith(backup+path.sep))throw Error('Unsafe cover destination');
  await fs.rename(source,saved);await fs.copyFile(target,destination);media[id]={...media[id],image:'/assets/thumbnails/recovered/'+id+'.webp',optimized:true};
 }
 await fs.writeFile(manifest,JSON.stringify(media));console.log('Optimized covers applied; originals retained in private var directory.');
}
