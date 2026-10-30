import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('public'),rows=JSON.parse(await fs.readFile(path.join(root,'data/catalog-live.json'),'utf8'));
const missing=[],invalid=[],checked=new Map();let index=0,previews=0,images=0,videos=0;
async function exists(url){if(!checked.has(url))checked.set(url,fs.stat(path.join(root,url.split(/[?#]/)[0])).then(s=>s.isFile()&&s.size>0).catch(()=>false));return checked.get(url);}
async function worker(){while(index<rows.length){const item=rows[index++],url=item.runtimePreviewPath||item.previewPath;if(!url||!url.startsWith('/previews/')){missing.push({id:item.id,type:'preview',path:url||null});continue;}if(!await exists(url)){missing.push({id:item.id,type:'preview',path:url});continue;}previews++;const html=await fs.readFile(path.join(root,url),'utf8');if(!/<(?:html|body|script|div|canvas)\b/i.test(html))invalid.push({id:item.id,path:url,reason:'empty-document'});
 const localRefs=new Set([...html.matchAll(/(?:src|href)=["'](\/(?:previews|assets)\/[^"'#?]+)["']/g)].map(m=>m[1]));for(const ref of localRefs)if(!await exists(ref))missing.push({id:item.id,type:'dependency',path:ref});
 for(const field of ['image','video'])if(item[field]?.startsWith('/')){if(await exists(item[field]))field==='image'?images++:videos++;else missing.push({id:item.id,type:field,path:item[field]});}
 if(url.startsWith('/previews/runtime/')){const light=url.replace(/\.html$/,'.light.html');if(!await exists(light))missing.push({id:item.id,type:'light-preview',path:light});}
 }}
await Promise.all(Array.from({length:8},worker));const report={generatedAt:new Date().toISOString(),scope:'Static integrity only; browser execution is tested separately. External resources are not certified by this audit.',published:rows.length,previews,images,videos,uniqueLocalFiles:checked.size,missing,invalid};
await fs.mkdir('var/audits',{recursive:true});await fs.writeFile('var/audits/preview-files.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,missing:missing.slice(0,12),invalid:invalid.slice(0,12),missingCount:missing.length,invalidCount:invalid.length},null,2));if(missing.length||invalid.length)process.exitCode=1;
