import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const manifestPath=process.argv[2];
const root=path.resolve('public'),catalog=await fs.readFile(path.join(root,'data/catalog-live.json')),rows=JSON.parse(catalog);
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const seen=new Set(),records=new Array(rows.length);
for(const {id} of rows){if(!id||seen.has(id))throw Error('ID ausente ou duplicado: '+id);seen.add(id);}
const missing=[],invalid=[],checked=new Map();let index=0,previews=0,images=0,videos=0;
async function exists(url){if(!checked.has(url))checked.set(url,fs.stat(path.join(root,url.split(/[?#]/)[0])).then(s=>s.isFile()&&s.size>0).catch(()=>false));return checked.get(url);}
async function worker(){while(index<rows.length){const position=index++,item=rows[position],url=item.runtimePreviewPath||item.previewPath;
 const entry=records[position]={id:item.id,name:item.name,kind:item.kind,recoveryMode:item.recoveryMode,route:item.publicSlug?'/component/'+encodeURIComponent(item.publicSlug):null,preview:url||null,sha256:null};
 if(!url||!url.startsWith('/previews/')||!await exists(url)){missing.push({id:item.id,type:'preview',path:url||null});continue;}
 previews++;const bytes=await fs.readFile(path.join(root,url.split(/[?#]/)[0]));if(manifestPath)entry.sha256=sha256(bytes);
 const html=bytes.toString('utf8');if(!/<(?:html|body|script|div|canvas)\b/i.test(html))invalid.push({id:item.id,path:url,reason:'empty-document'});
 const localRefs=new Set([...html.matchAll(/(?:src|href)=["'](\/(?:previews|assets)\/[^"'#?]+)["']/g)].map(m=>m[1]));for(const ref of localRefs)if(!await exists(ref))missing.push({id:item.id,type:'dependency',path:ref});
 for(const field of ['image','video'])if(item[field]?.startsWith('/')){if(await exists(item[field]))field==='image'?images++:videos++;else missing.push({id:item.id,type:field,path:item[field]});}
 for(const field of ['codePath','reconstructionPromptPath'])if(item[field]?.startsWith('/')&&!await exists(item[field]))missing.push({id:item.id,type:field,path:item[field]});
 if(url.startsWith('/previews/runtime/')){const light=url.replace(/\.html$/,'.light.html');if(!await exists(light))missing.push({id:item.id,type:'light-preview',path:light});}
 }}
await Promise.all(Array.from({length:8},worker));const report={generatedAt:new Date().toISOString(),scope:'Static integrity only; browser execution is tested separately. External resources are not certified by this audit.',published:rows.length,previews,images,videos,uniqueLocalFiles:checked.size,missing,invalid};
if(manifestPath){
 const issues=new Map();for(const {id,...issue} of [...missing,...invalid]){if(!issues.has(id))issues.set(id,[]);issues.get(id).push(issue);}
 const header={schema:1,...report,missing:missing.length,invalid:invalid.length,commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),catalogSha256:sha256(catalog),environment:'local checkout',otherChecks:'Startup, rendered content, media playback, interactions, desktop/mobile, clipboard, ZIP, standalone execution and production are not tested by this inventory.'};
 await fs.writeFile(manifestPath,[header,...records.map(row=>({...row,static:issues.has(row.id)?'failed':'passed',issues:issues.get(row.id)}))].map(row=>JSON.stringify(row)).join('\n')+'\n');
}
await fs.mkdir('var/audits',{recursive:true});await fs.writeFile('var/audits/preview-files.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,missing:missing.slice(0,12),invalid:invalid.slice(0,12),missingCount:missing.length,invalidCount:invalid.length},null,2));if(missing.length||invalid.length)process.exitCode=1;
