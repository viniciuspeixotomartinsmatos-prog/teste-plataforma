import {fetchPublicSite} from '../server/site-audit-network.mjs';
// Mirror only public static demo artifacts. No auth, purchase, API or form actions.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const release='../research/source-checks/releases/2026-11-09';
const allCandidates=JSON.parse(await fs.readFile(release+'/21st-templates.json','utf8'));
const retry=process.argv.includes('--retry-incomplete');
const previous=retry?JSON.parse(await fs.readFile(release+'/21st-template-captures.json','utf8')):[];
const complete=new Set(previous.filter(row=>row.status==='retained').map(row=>row.metadata.id));
const candidates=retry?allCandidates.filter(row=>!complete.has(row.metadata.id)):allCandidates;
const reports=retry?previous.filter(row=>complete.has(row.metadata.id)):[];
const extensions=/\.(?:m?js|css|html|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|mp4|webm|glb|gltf|wasm)(?:\?|$)/i;
for(const candidate of candidates){
 const metadata=candidate.metadata,url=candidate.links?.find(link=>link.label==='Open preview')?.url;
 if(!url){reports.push({metadata,status:'blocked',reason:'No original public demo URL'});continue;}
 const base=new URL(url),slug='21st-template-'+metadata.id,prefix='/previews/recovered/demos/'+slug;
 const files=new Map(),errors=[],queue=[];let bytes=0;
 const local=link=>prefix+(link.origin===base.origin?'':'/external/'+crypto.createHash('sha1').update(link.origin).digest('hex').slice(0,8))+(link.pathname==='/'?'/index.html':link.pathname)+(link.search?'.'+crypto.createHash('sha1').update(link.search).digest('hex').slice(0,8)+path.extname(link.pathname):'');
 async function load(link,entry=false){
  const key=link.href;if(files.has(key))return files.get(key);
  if(files.size>=500)throw Error('Demo exceeds bounded 500 static resources');
  const work=(async()=>{
   if(link.protocol!=='https:'||/^(?:localhost|127\.|10\.|192\.168\.)/.test(link.hostname)||/^\/api(?:\/|$)/.test(link.pathname))throw Error('Non-static or private reference omitted');
   const response=await fetchPublicSite(link.href,{timeoutMs:18000,maxBytes:35000000});
   const type=response.headers['content-type']||'';if(!entry&&!extensions.test(link.href)&&!/^image\//.test(type))throw Error('Unclassified resource');
   const data=response.body;bytes+=data.length;if(data.length>35000000||bytes>160000000)throw Error('Static demo exceeds bounded media size');
   let body=data;
   if(entry||/javascript|text\/css|text\/html/.test(type)){
    let text=data.toString('utf8');const refs=new Map();
    // Capture whole literals. Truncating at an extension inside a query drops
    // Next image width/quality parameters and mistakes hostnames for JS files.
    for(const match of text.matchAll(/(?:["'`(])((?:https:\/\/|\/(?!\/)|\.\.?\/)[^"'`()\s<>\\]+)/gi)){
     try{const ref=new URL(match[1].replaceAll('&amp;','&'),link);if(ref.protocol!=='https:'||ref.pathname.startsWith('/api/'))continue;if(!extensions.test(ref.pathname)&&ref.pathname!=='/_next/image')continue;refs.set(match[1],ref);}catch{}
    }
    // Preserve static paths assembled by the original runtime (e.g. /assets/foo).
    for(const [raw,ref]of refs){text=text.split(raw).join(local(ref));queue.push(ref);}
    if(entry){text=text.replace(/<base\b[^>]*>/gi,'');text=text.replace(/<head(?:\s[^>]*)?>/i,tag=>tag+'<base href="'+base.href.replace(/"/g,'&quot;')+'"><script src="/previews/recovered/compat.js"></script>');}
    body=Buffer.from(text);
   }
   const target='public'+(entry?prefix+'/index.html':local(link));await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,body);
   return target.slice(6);
  })();files.set(key,work);return work;
 }
 try{
  await load(base,true);
  while(queue.length){const batch=queue.splice(0,6);await Promise.all(batch.map(link=>load(link).catch(error=>errors.push({url:link.href,error:error.message}))));}
  const manifest=[];async function walk(folder){for(const f of await fs.readdir(folder,{withFileTypes:true})){const name=path.join(folder,f.name);if(f.isDirectory())await walk(name);else manifest.push(path.relative('public'+prefix,name).replaceAll('\\','/'));}}await walk('public'+prefix);
  reports.push({metadata,status:errors.length?'needs-validation':'retained',previewPath:prefix+'/index.html',slug,files:manifest,bytes,errors,originalDemoUrl:url});
 }catch(error){reports.push({metadata,status:'blocked',reason:error.message,bytes,errors});}
 await fs.writeFile(release+'/21st-template-captures.json',JSON.stringify(reports,null,2));console.log(JSON.stringify({name:metadata.name,status:reports.at(-1).status,files:files.size,errors:errors.length}));
}
