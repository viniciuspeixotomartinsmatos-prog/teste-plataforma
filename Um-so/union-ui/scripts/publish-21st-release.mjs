// Fail closed: compilation, a canvas element or a cover are not runtime evidence.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const root='../research/source-checks/releases/2026-11-09';
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const candidates=await read(root+'/21st-candidate-catalog.json');
const evidencePath=process.argv.find(arg=>arg.startsWith('--evidence='))?.slice('--evidence='.length)||root+'/21st-browser-validation.json';
const evidence=await read(evidencePath).catch(()=>[]);
if(!evidence.length)throw Error('Authorized browser validation is missing; no entries published.');
const accepted=[];
for(const proof of evidence){
 const item=candidates.find(row=>row.id===proof.id);if(!item)throw Error('Unknown release candidate');
 const required=['startupVerified','visualConfirmed','interactionVerified','mediaVerified','promptVerified','downloadVerified'];
 if(required.some(key=>proof[key]!==true)||!proof.checkedAt||!proof.notes)throw Error('Incomplete runtime evidence: '+item.id);
 const bytes=await fs.readFile('public'+item.previewPath);
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==proof.previewSha256)throw Error('Preview changed after validation: '+item.id);
 if(proof.errors?.length)throw Error('Unresolved browser errors: '+item.id);
 accepted.push(item);
}
const rows=await read('public/data/catalog-live.json');
for(const item of accepted){const index=rows.findIndex(row=>row.id===item.id||row.url===item.url);if(index<0)rows.push(item);else rows[index]={...rows[index],...item,id:rows[index].id,publicSlug:rows[index].publicSlug||item.publicSlug};}
await fs.writeFile('public/data/catalog-live.json',JSON.stringify(rows));
const indexed=await read('public/data/catalog.json');for(const item of accepted){const index=indexed.findIndex(row=>row.id===item.id||row.url===item.url);if(index<0)indexed.push(item);else indexed[index]={...indexed[index],...item,id:indexed[index].id};}
await fs.writeFile('public/data/catalog.json',JSON.stringify(indexed));
const sources=await read('public/data/sources.json');for(const source of sources){source.count=indexed.filter(item=>item.sourceId===source.id).length;source.codeCount=indexed.filter(item=>item.sourceId===source.id&&item.availability==='code').length;}await fs.writeFile('public/data/sources.json',JSON.stringify(sources));
console.log(JSON.stringify({published:accepted.length}));
