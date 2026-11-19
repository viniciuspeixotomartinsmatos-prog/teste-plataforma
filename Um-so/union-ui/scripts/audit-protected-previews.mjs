import fs from 'node:fs/promises';
import path from 'node:path';
import * as compiler from 'esbuild';
import {preparePreviewAssets} from '../src/preview-assets.js';
const root=path.resolve('public'),rows=JSON.parse(await fs.readFile('public/data/catalog-live.json','utf8')).filter(item=>item.sourceId==='recovered'||item.recoverySourceId==='recovered');
const fetcher=async url=>{const file=path.resolve(root,'.'+new URL(url).pathname);if(!file.startsWith(root+path.sep))throw Error('Path outside public assets');try{return new Response(await fs.readFile(file));}catch{return new Response('',{status:404});}};
const results=[];
for(const item of rows){try{const html=await preparePreviewAssets(await fs.readFile(path.join(root,item.previewPath),'utf8'),'https://app.example'+item.previewPath,{fetcher,compiler});if(/<(?:script|link)\b[^>]*(?:src|href)=["']\/previews\//i.test(html))throw Error('Anonymous static bootstrap request remains');results.push({id:item.id,passed:true});}catch(error){results.push({id:item.id,passed:false,error:error.message});}}
const report={total:results.length,passed:results.filter(item=>item.passed).length,failed:results.filter(item=>!item.passed)};
console.log(JSON.stringify(report));if(report.failed.length)process.exitCode=1;
