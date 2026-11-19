// Publish only the existing, individually accepted candidates. No acquisition or paid requests.
import fs from'node:fs/promises';import path from'node:path';import{createHash}from'node:crypto';import{fileURLToPath}from'node:url';import{verifyReleaseEvidence}from'./lib/release-evidence.mjs';
const app=fileURLToPath(new URL('../',import.meta.url)),root=path.join(app,'public'),date=process.argv[2],evidencePath=process.argv.find(arg=>arg.startsWith('--evidence='))?.slice(11);
if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!evidencePath)throw Error('Release date and actual browser evidence are required.');
const read=async file=>JSON.parse(await fs.readFile(file,'utf8')),folder=path.resolve(app,'../research/source-checks/releases',date,'profitize');
const candidates=await read(path.join(folder,'staged-catalog.json')),evidence=await read(path.resolve(app,evidencePath));if(!Array.isArray(evidence)||!evidence.length)throw Error('Authorized browser evidence is missing.');
const accepted=[];for(const proof of evidence){const staged=candidates.find(row=>row.id===proof.id);if(!staged||staged.promptOrigin!=='original'||!['recorded-video','interactive-original-source'].includes(staged.recoveryMode))throw Error('Invalid original candidate.');await verifyReleaseEvidence(root,staged,proof);
 const id='recovered--'+staged.slug,item={...staged,id,approvedRelease:date,publicSlug:staged.slug+'-'+createHash('sha1').update(id).digest('hex').slice(0,6)};
 if(staged.recoveryMode==='recorded-video'){const html=await fs.readFile(path.join(root,staged.previewPath),'utf8'),video=html.match(/<video\b[^>]*\bsrc="([^"\s]+\.mp4)"/)?.[1];if(!video||!proof.artifacts[video])throw Error('Validated hover video is missing.');item.video=video;}
 accepted.push({item,stagedId:staged.id,releaseDate:date,evidence:proof});
}
if(new Set(accepted.map(row=>row.item.id)).size!==accepted.length)throw Error('Duplicate release evidence.');
const [catalog,live,sources,coverage,canonical,recoveredReport]=await Promise.all(['data/catalog.json','data/catalog-live.json','data/sources.json','data/catalog-coverage.json'].map(file=>read(path.join(root,file))).concat([read(path.resolve(app,'../research/profitize/catalog.json')),read(path.join(root,'data/recovered-coverage.json'))]));
let manifest;try{manifest=await read(path.join(root,'data/catalog-approved-releases.json'));}catch(error){if(error.code!=='ENOENT')throw error;manifest={version:1,entries:[]};}
for(const entry of accepted){for(const rows of [catalog,live]){const old=rows.findIndex(row=>row.id===entry.item.id||row.sourceUrl===entry.item.sourceUrl||row.url===entry.item.url);if(old<0)rows.push(entry.item);else rows[old]={...entry.item,id:rows[old].id,publicSlug:rows[old].publicSlug||entry.item.publicSlug};}
 const old=manifest.entries.findIndex(row=>row.item.id===entry.item.id);if(old<0)manifest.entries.push(entry);else manifest.entries[old]=entry;
 const index=canonical.findIndex(row=>row.slug===entry.item.slug),record={slug:entry.item.slug,title:entry.item.name,type:entry.item.kind==='template'?'landing_page':entry.item.kind==='motion'?'motion':'component',niche:entry.item.description,tags:entry.item.tags,kind:{segment:entry.item.kind==='template'?'landing-pages':entry.item.kind==='motion'?'motion':'componentes'},approvedRelease:date,promptRelease:date};if(index<0)canonical.push(record);else canonical[index]={...canonical[index],...record};
}
for(const source of sources){source.count=catalog.filter(row=>row.sourceId===source.id).length;source.codeCount=catalog.filter(row=>row.sourceId===source.id&&row.availability==='code').length;}
Object.assign(coverage,{indexed:catalog.length,published:live.length,remaining:catalog.length-live.length,generatedAt:new Date().toISOString()});
coverage.recovered=catalog.filter(row=>row.sourceId==='recovered').length;
const recoveredRows=canonical.map(original=>live.find(row=>(row.sourceId==='recovered'||row.recoverySourceId==='recovered')&&row.slug===original.slug));if(recoveredRows.some(row=>!row))throw Error('An observed original is missing from the resulting catalog.');
Object.assign(recoveredReport,{generatedAt:new Date().toISOString(),observed:canonical.length,published:recoveredRows.length,newEntries:recoveredRows.filter(row=>row.sourceId==='recovered').length,executable:recoveredRows.filter(row=>row.recoveryMode!=='recorded-video').length,recorded:recoveredRows.filter(row=>row.recoveryMode==='recorded-video').length,items:recoveredRows.map(row=>({id:row.id,name:row.name,mode:row.recoveryMode,preview:row.previewPath,promptOrigin:row.promptOrigin}))});
// All checks precede index mutation. Each write is atomic within its existing directory.
const writes=[['data/catalog.json',catalog],['data/catalog-live.json',live],['data/sources.json',sources],['data/catalog-coverage.json',coverage],['data/catalog-approved-releases.json',manifest]].map(([name,data])=>[path.join(root,name),data]);writes.push([path.resolve(app,'../research/profitize/catalog.json'),canonical]);
writes.push([path.join(root,'data/recovered-coverage.json'),recoveredReport],[path.resolve(app,'../research/profitize/coverage.json'),recoveredReport]);
for(const [file,data]of writes){const temporary=file+'.release-pending',pretty=file.endsWith('coverage.json')||file===path.resolve(app,'../research/profitize/catalog.json');await fs.writeFile(temporary,JSON.stringify(data,null,pretty?2:undefined));await fs.rename(temporary,file);}
console.log(JSON.stringify({published:accepted.length,total:live.length,ids:accepted.map(entry=>entry.item.id)}));
