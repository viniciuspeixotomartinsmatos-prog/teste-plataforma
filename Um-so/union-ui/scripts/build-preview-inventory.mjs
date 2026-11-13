import { promises as fs } from 'node:fs';
import path from 'node:path';
import { compileItem } from '../server/preview-service.mjs';
import { getCatalog, PUBLIC_ROOT } from '../server/preview-catalog.mjs';

const args=process.argv.slice(2);
const sourceFilter=args.find(a=>a.startsWith('--source='))?.split('=')[1];
const frameworkFilter=args.find(a=>a.startsWith('--framework='))?.split('=')[1];
const max=Number(args.find(a=>a.startsWith('--limit='))?.split('=')[1]||Infinity);
const concurrency=Number(args.find(a=>a.startsWith('--concurrency='))?.split('=')[1]||3);
const retry=args.includes('--retry-blocked');
const refresh=args.includes('--refresh');
const output=path.join(PUBLIC_ROOT,'data','preview-readiness.json');
const catalog=(await getCatalog()).items;
let previous={items:[]};try{previous=JSON.parse(await fs.readFile(output,'utf8'))}catch{}
const results=new Map(previous.items.map(r=>[r.id,r]));
for(const item of catalog)if(item.previewPath)results.set(item.id,{id:item.id,status:'ready',sourceId:item.sourceId,previewPath:item.previewPath,hasDemo:true,kind:'retained-original-preview'});
let selected=catalog.filter(r=>r.availability==='code'&&r.codePath&&(!sourceFilter||r.sourceId===sourceFilter)&&(!frameworkFilter||(r.slug.startsWith('vue/')?'vue':'react')===frameworkFilter)&&(refresh||!results.has(r.id)||(retry&&results.get(r.id).status==='blocked'&&results.get(r.id).code!=='nonvisual-source'))).slice(0,max);
if(args.includes('--upgrade-runtime')){
 const pending=await Promise.all(selected.map(async item=>{
  const result=results.get(item.id);
  if(result?.code==='nonvisual-source')return false;
  if(result?.status==='ready'&&result.previewPath?.startsWith('/previews/runtime/')){
   try{const html=await fs.readFile(path.join(PUBLIC_ROOT,result.previewPath),'utf8');if(html.includes('html.light{color-scheme:light;--background:#ffffff;'))return false;}catch{}
  }
  return true;
 }));
 selected=selected.filter((item,index)=>pending[index]);
}
// Put representative core UI and the known Particles issue first.
selected.sort((a,b)=>(a.kind==='icon'?1:0)-(b.kind==='icon'?1:0)||(a.slug==='particles'?-1:0)-(b.slug==='particles'?-1:0));
let cursor=0,completed=0;
let writing=Promise.resolve();
async function write(){const list=[...results.values()];const record={generatedAt:new Date().toISOString(),totalCatalog:catalog.length,totalCode:catalog.filter(r=>r.availability==='code').length,checked:list.length,ready:list.filter(r=>r.status==='ready').length,blocked:list.filter(r=>r.status==='blocked').length,definition:'Ready means original source and its local package dependencies compiled successfully with native esbuild. Browser rendering is separately verified for representative components. Blocked items retain their source and reason.',items:list};const text=JSON.stringify(record);writing=writing.then(async()=>{const temp=output+'.tmp';await fs.writeFile(temp,text);await fs.rename(temp,output)});return writing;}
await Promise.all(Array.from({length:concurrency},async()=>{
 while(cursor<selected.length){const item=selected[cursor++];try{const result=await compileItem(item.id,{cache:false,persist:true});results.set(item.id,{id:item.id,status:'ready',sourceId:item.sourceId,previewPath:result.previewPath,bytes:result.bytes,framework:result.framework,hasDemo:result.hasDemo,entry:result.entry,sourceFileCount:result.sourceFileCount});}catch(error){results.set(item.id,{id:item.id,status:'blocked',sourceId:item.sourceId,reason:error.errors?.map(e=>e.text).join('; ')||error.message,code:error.code||'compile-failed'});}completed++;if(completed%25===0){await write();console.log(`${completed}/${selected.length}; ready ${[...results.values()].filter(r=>r.status==='ready').length}`);}}
}));
await write();console.log(JSON.stringify({checked:results.size,ready:[...results.values()].filter(r=>r.status==='ready').length,blocked:[...results.values()].filter(r=>r.status==='blocked').length}));
