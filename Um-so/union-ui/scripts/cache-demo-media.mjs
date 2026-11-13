import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {injectDemoAssets} from '../src/demo-asset-bridge.js';
const root=path.resolve('public'),report=JSON.parse(await fs.readFile('var/audits/demo-resources.json','utf8')),manifestFile=path.join(root,'data/demo-local-assets.json');
let previous={urls:{},items:{},failures:[]};try{previous=JSON.parse(await fs.readFile(manifestFile,'utf8'));}catch{}
const urls=previous.urls||{},items=previous.items||{},failures=[];const sources=new Map(report.external.map(e=>[e.url,{...e,ids:new Set(e.ids)}]));
try{const results=(await fs.readFile('var/audits/browser/results.ndjson','utf8')).trim().split('\n').filter(Boolean).map(JSON.parse);for(const row of results)for(const image of row.images||[]){if(!/^https?:\/\//.test(image.src)||new URL(image.src).hostname==='127.0.0.1')continue;if(!sources.has(image.src))sources.set(image.src,{url:image.src,ids:new Set(),files:[]});sources.get(image.src).ids.add(row.id);}}catch{}
const queue=[...sources.values()].filter(e=>!e.url.includes('${')&&!e.url.includes('{'));let cursor=0,done=0;
await fs.mkdir(path.join(root,'assets/demo-cache'),{recursive:true});
async function save(){await fs.writeFile(manifestFile,JSON.stringify({...previous,generatedAt:new Date().toISOString(),urls,items,failures}));}
await Promise.all(Array.from({length:8},async()=>{while(cursor<queue.length){const entry=queue[cursor++],url=entry.url;let local=urls[url];
 try{if(local)await fs.access(path.join(root,local));else{
  const response=await fetch(url.replaceAll('&amp;','&'),{signal:AbortSignal.timeout(18000)});if(!response.ok)throw Error('HTTP '+response.status);const type=response.headers.get('content-type')||'';if(!/^(image|video|audio|font)\//.test(type)&&!/(woff|octet-stream|gltf)/.test(type))throw Error('Unexpected content: '+type);const length=Number(response.headers.get('content-length')||0);if(length>50*1024*1024){await response.body?.cancel();throw Error('Asset larger than 50 MB');}
  let bytes=Buffer.from(await response.arrayBuffer());if(!bytes.length||bytes.length>50*1024*1024)throw Error('Asset size invalid');
  let ext=path.extname(new URL(url).pathname).toLowerCase().slice(1);if(type.startsWith('image/')&&!type.includes('svg')&&!type.includes('gif')){const img=await loadImage(bytes),ratio=Math.min(1,1600/Math.max(img.width,img.height)),canvas=createCanvas(Math.max(1,Math.round(img.width*ratio)),Math.max(1,Math.round(img.height*ratio)));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);bytes=await canvas.encode('webp',88);ext='webp';}else if(type.includes('svg'))ext='svg';else if(type.includes('gif'))ext='gif';else if(!ext||ext.length>5)ext=type.includes('mp4')?'mp4':type.includes('webm')?'webm':type.includes('woff2')?'woff2':type.includes('woff')?'woff':type.includes('mpeg')?'mp3':'bin';
  local='/assets/demo-cache/'+crypto.createHash('sha256').update(url).digest('hex').slice(0,24)+'.'+ext;await fs.writeFile(path.join(root,local),bytes);urls[url]=local;
 }
 for(const id of entry.ids){items[id]??={};items[id][url]=local;}
 }catch(error){failures.push({url,ids:[...entry.ids],reason:error.message});}
 done++;if(done%100===0){await save();console.log(done+'/'+queue.length+' · cached '+Object.keys(urls).length+' · failed '+failures.length);}
}}));await save();
const rows=JSON.parse(await fs.readFile(path.join(root,'data/catalog-live.json'),'utf8'));let patched=0;
for(const item of rows){const mapping=items[item.id];if(!mapping)continue;const preview=item.runtimePreviewPath||item.previewPath;for(const file of [preview,...(preview.startsWith('/previews/runtime/')?[preview.replace(/\.html$/,'.light.html')]:[])]){let html=await fs.readFile(path.join(root,file),'utf8');html=injectDemoAssets(html,mapping);await fs.writeFile(path.join(root,file),html);}patched++;}
console.log(JSON.stringify({cached:Object.keys(urls).length,failed:failures.length,patched}));
