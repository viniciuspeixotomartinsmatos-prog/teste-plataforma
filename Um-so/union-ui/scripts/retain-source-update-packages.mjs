// Retain public registry originals for review. No source execution, catalog
// publication, authentication bypass or claims of browser acceptance.
import fs from'node:fs/promises';import path from'node:path';import{createHash}from'node:crypto';import{fileURLToPath}from'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),research=path.resolve(root,'../research'),date=process.argv[2]||'2026-11-12';
if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Invalid release date');
const folder=path.join(research,'source-checks/releases',date),check=JSON.parse(await fs.readFile(path.join(research,'source-checks/latest.json'),'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function read(url){const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('HTTP_'+r.status);const chunks=[];let bytes=0;for await(const chunk of r.body){bytes+=chunk.length;if(bytes>2500000)throw Error('resource_limit');chunks.push(chunk);}return Buffer.concat(chunks);}
const jobs=[],records=[];
for(const source of ['magic','kokonut']){
 const evidence=check.sources.find(row=>row.source===source),names=new Set([...(evidence.registry?.addedNames||[]),...(evidence.registry?.changedMetadataNames||[])]);
 if(source==='kokonut'){
  const registry=JSON.parse((await read('https://raw.githubusercontent.com/kokonut-labs/kokonutui/main/registry.json')).toString());
  for(const route of evidence.unmatchedRoutes){const name=route.split('/').pop();if(registry.items.some(item=>item.name===name))names.add(name);}
 }
 for(const name of names)if(/^[a-z0-9-]+$/.test(name))jobs.push({source,name,url:(source==='magic'?'https://magicui.design/r/':'https://kokonutui.com/r/')+name+'.json'});
}
for(const route of check.sources.find(row=>row.source==='aceternity').addedSincePreviousCheck||[]){const name=route.split('/').pop();if(/^[a-z0-9-]+$/.test(name))jobs.push({source:'aceternity',name,url:'https://ui.aceternity.com/registry/'+name+'.json'});}
let cursor=0;
await Promise.all(Array.from({length:4},async()=>{while(cursor<jobs.length){const job=jobs[cursor++];try{
 const bytes=await read(job.url),data=JSON.parse(bytes);if(!data.files?.length||!data.files.some(file=>typeof file.content==='string'&&file.content.length>100))throw Error('source_not_exposed');
 const target=path.join(folder,job.source,job.name+'.json');await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bytes);
 const record={...job,status:'retained_unvalidated',sha256:hash(bytes),bytes:bytes.length,files:data.files.length,published:false};
 if(job.source==='magic')try{const previous=JSON.parse(await fs.readFile(path.join(research,'catalog-a/code/magic',job.name+'.json'),'utf8'));const source=record=>JSON.stringify(record.files.map(file=>[file.path,file.content]));record.sourceChanged=source(previous)!==source(data);}catch{record.sourceChanged='baseline_unavailable';}
 records.push(record);
 }catch(error){records.push({...job,status:'unavailable',reason:String(error.message).slice(0,100),published:false});}
}}));
records.sort((a,b)=>(a.source+'/'+a.name).localeCompare(b.source+'/'+b.name));await fs.mkdir(folder,{recursive:true});await fs.writeFile(path.join(folder,'public-registry-acquisition.json'),JSON.stringify({checkedAt:new Date().toISOString(),scope:'Public original registry source only; no rendering, interaction, media or portable-export acceptance.',published:0,records},null,2)+'\n');
console.log(JSON.stringify({candidates:jobs.length,retained:records.filter(row=>row.status==='retained_unvalidated').length,unavailable:records.filter(row=>row.status==='unavailable').length,published:0}));
