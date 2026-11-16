// Fail closed: compilation, a canvas element or a cover are not runtime evidence.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {verifyReleaseEvidence} from './lib/release-evidence.mjs';
const app=fileURLToPath(new URL('../',import.meta.url)),root=path.join(app,'public');
const date=process.argv[2]?.startsWith('--')?'2026-11-09':process.argv[2]||'2026-11-09';
if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Invalid release date.');
const folder=path.resolve(app,'../research/source-checks/releases',date);
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const evidencePath=process.argv.find(arg=>arg.startsWith('--evidence='))?.slice(11)||path.join(folder,'21st-browser-validation.json');
const evidence=await read(path.resolve(app,evidencePath)).catch(()=>[]);
if(!Array.isArray(evidence)||!evidence.length)throw Error('Authorized browser validation is missing; no entries published.');
const candidatePath=process.argv.find(arg=>arg.startsWith('--candidates='))?.slice(13)||path.join(folder,'21st-selected-review.json');
const candidates=await read(path.resolve(app,candidatePath));
const [catalog,live,sources,coverage]=await Promise.all(['catalog','catalog-live','sources','catalog-coverage'].map(name=>read(path.join(root,'data',name+'.json'))));
let manifest;try{manifest=await read(path.join(root,'data/catalog-approved-releases.json'));}catch(error){if(error.code!=='ENOENT')throw error;manifest={version:1,entries:[]};}
if(manifest.version!==1||!Array.isArray(manifest.entries))throw Error('Invalid approved release manifest.');
const accepted=[];
for(const proof of evidence){
 const staged=candidates.find(row=>row.id===proof.id);
 if(!staged||staged.sourceId!=='21st'||staged.availability!=='code'||!staged.url?.startsWith('https://21st.dev/'))throw Error('Unknown original release candidate.');
 await verifyReleaseEvidence(root,staged,proof);
 if(!staged.image)throw Error('Validated catalog cover is missing: '+staged.id);
 const existing=catalog.find(row=>row.url===staged.url||row.id===staged.id);
 const id=existing?.id||staged.id.replace(/^staged-/,'');
 const slug=staged.name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'componente';
 const item={...staged,id,approvedRelease:date,publicSlug:existing?.publicSlug||slug+'-'+createHash('sha1').update(id).digest('hex').slice(0,6)};
 if(staged.previewPath.startsWith('/previews/runtime/'))item.runtimePreviewPath=staged.previewPath;
 accepted.push({item,stagedId:staged.id,releaseDate:date,evidence:proof});
}
if(new Set(accepted.map(row=>row.item.id)).size!==accepted.length)throw Error('Duplicate release evidence.');
// Validate the entire batch before mutating any index; preserve existing IDs and URLs.
for(const entry of accepted){
 for(const rows of [catalog,live]){const index=rows.findIndex(row=>row.id===entry.item.id||row.url===entry.item.url);if(index<0)rows.push(entry.item);else rows[index]={...rows[index],...entry.item};}
 const index=manifest.entries.findIndex(row=>row.item.id===entry.item.id);if(index<0)manifest.entries.push(entry);else manifest.entries[index]=entry;
}
for(const source of sources){source.count=catalog.filter(row=>row.sourceId===source.id).length;source.codeCount=catalog.filter(row=>row.sourceId===source.id&&row.availability==='code').length;}
Object.assign(coverage,{indexed:catalog.length,published:live.length,remaining:catalog.length-live.length,generatedAt:new Date().toISOString()});
for(const [name,data]of [['catalog',catalog],['catalog-live',live],['sources',sources],['catalog-coverage',coverage],['catalog-approved-releases',manifest]]){const file=path.join(root,'data',name+'.json'),temporary=file+'.release-pending';await fs.writeFile(temporary,JSON.stringify(data,null,name==='catalog-coverage'?2:undefined));await fs.rename(temporary,file);}
console.log(JSON.stringify({published:accepted.length,total:live.length,ids:accepted.map(row=>row.item.id)}));
