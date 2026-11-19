import fs from 'node:fs/promises';
import path from 'node:path';
import {componentArchive} from '../src/component-export.js';
import {unzipSync,strFromU8} from 'fflate';
const root=path.resolve('public'),rows=JSON.parse(await fs.readFile(path.join(root,'data/catalog-live.json'),'utf8')).filter(x=>x.sourceId==='recovered'||x.recoverySourceId==='recovered');
const original=globalThis.fetch;const types={'.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2','.mp4':'video/mp4','.js':'text/javascript','.css':'text/css'};
globalThis.fetch=async url=>{if(typeof url!=='string'||!url.startsWith('/'))return original(url);const file=path.resolve(root,'.'+url);if(!file.startsWith(root+path.sep))return new Response('',{status:403});try{return new Response(await fs.readFile(file),{headers:{'Content-Type':types[path.extname(file)]||'text/plain'}});}catch{return new Response('',{status:404});}};
const failed=[];let passed=0;
try{for(const row of rows){try{const payload=JSON.parse(await fs.readFile(path.join(root,row.codePath),'utf8'));const files=unzipSync(await componentArchive(row,payload));const html=strFromU8(files['preview.html']);if(!html.includes('<html'))throw Error('Missing document');if(row.recoveryMode==='interactive-page'){if(!files['serve.mjs']||!files['README.md'])throw Error('Missing local module server');}else if(/<script\b[^>]*src=["']\/previews\/recovered\//.test(html))throw Error('Unembedded script');passed++;}catch(error){failed.push({id:row.id,name:row.name,error:error.message});}}}finally{globalThis.fetch=original;}
const report={passed,total:rows.length,failed};await fs.writeFile('../research/profitize/export-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(failed.length)process.exitCode=1;
