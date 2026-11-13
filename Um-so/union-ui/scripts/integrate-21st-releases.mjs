// Stage acquired public originals, compile their actual examples, and retain failures.
// Publication is separate and requires browser evidence; source presence is insufficient.
import fs from 'node:fs/promises';
import path from 'node:path';
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const write=async(file,data)=>{await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(data));};
const output='../research/source-checks/releases/2026-11-09';
const originalCatalog=await fs.readFile('public/data/catalog.json');
const originalPatches=await fs.readFile('public/data/catalog-connected.json');
const catalog=JSON.parse(originalCatalog);
const records=[];
for(const date of ['2026-11-05','2026-11-09']){
 const folder='../research/source-checks/releases/'+date+'/21st';
 for(const name of await fs.readdir(folder)){
  if(!name.endsWith('.json'))continue;
  try{const record=await read(folder+'/'+name);if(record.component?.isPublic&&record.component.componentCode&&record.component.demoCode)records.push({...record,releaseDate:date});}catch{}
 }
}
const selected=new Map();
for(const record of records)selected.set(record.component.id,record);
const staged=[];
for(const {metadata,component:c,releaseDate}of selected.values()){
 const url=metadata.url,slug=url.split('/').pop();
 let item=catalog.find(row=>row.sourceId==='21st'&&row.url===url);
 const id=item?.id||'21st-release-'+c.id;
 const files=Object.entries(c.registryDependencies?.filesWithRegistry||{}).filter(([,f])=>typeof f?.code==='string').map(([file,f])=>({path:file.replace(/^\//,''),content:f.code}));
 const imports=[...c.demoCode.matchAll(/from\s*["'](@\/[^"']+)["']/g)].map(match=>match[1].slice(2));
 const main=imports.find(file=>!/(?:^|\/)(?:utils|use-[^/]+)$/.test(file)&&!files.some(f=>f.path.replace(/\.[jt]sx?$/,'')===file))||'components/ui/'+slug;
 files.unshift({path:/\.[jt]sx?$/.test(main)?main:main+'.tsx',content:c.componentCode});
 const packages=new Set(Object.keys(c.registryDependencies?.npmDependencies||{}));
 for(const file of [...files,{content:c.demoCode}])for(const match of file.content.matchAll(/(?:from\s*|import\s*\()["']([^"']+)["']/g)){
  const value=match[1];if(value.startsWith('.')||value.startsWith('@/')||value.startsWith('~/')||value.startsWith('http'))continue;
  packages.add(value.startsWith('@')?value.split('/').slice(0,2).join('/'):value.split('/')[0]);
 }
 const codePath='/code/releases/'+id+'.json';
 await write('public'+codePath,{name:c.name,framework:'react',files,demoCode:c.demoCode,dependencies:[...packages],license:'Source terms; preserve original notices in acquired files.',retrievedVia:'authorized-connected-retrieval',sourceUrl:url});
 const text=(slug+' '+c.name).toLowerCase();
 const category=/shader|background|field|mesh/.test(text)?'Backgrounds':/carousel|gallery|slider/.test(text)?'Galleries':/hero|landing/.test(text)?'Heroes':/button/.test(text)?'Buttons':/menu|nav|dock/.test(text)?'Navigation':/footer/.test(text)?'Footers':/login|sign-in/.test(text)?'Authentication':/text|headline|typewriter/.test(text)?'Text effects':'Components';
 const updated={...item,id,sourceId:'21st',name:c.name,slug,description:c.description||metadata.description||'',category:item?.category||category,kind:'component',url,image:item?.image||'',codePath,availability:'code',framework:'react',dependencies:[...packages],tags:item?.tags||['React',category],license:'Source terms',install:c.installCommand,updated:releaseDate};
 if(item)catalog[catalog.indexOf(item)]=updated;else catalog.push(updated);
 staged.push({id,demoId:c.id,name:c.name,url,codePath,releaseDate,metadata,previouslyPublished:Boolean(item?.previewPath)});
}
// Existing connected-code patches must point at the same acquired originals.
const patches=await read('public/data/catalog-connected.json');
for(const record of staged)if(patches[record.id])patches[record.id]={...patches[record.id],codePath:record.codePath,availability:'code'};
const results=[];let cursor=0;
try {
await write('public/data/catalog-connected.json',patches);
await write('public/data/catalog.json',catalog);
await write(output+'/21st-stage.json',staged);
const {compileItem}=await import('../server/preview-service.mjs');
await Promise.all(Array.from({length:2},async()=>{while(cursor<staged.length){const item=staged[cursor++];try{const result=await compileItem(item.id,{cache:false,persist:true});results.push({id:item.id,name:item.name,status:'compiled',previewPath:result.previewPath,hasDemo:result.hasDemo,bytes:result.bytes});}catch(error){results.push({id:item.id,name:item.name,status:'blocked',reason:error.errors?.map(e=>e.text).join('; ')||error.message});}if(results.length%10===0){await write(output+'/21st-compile.json',results);console.log(JSON.stringify({checked:results.length,total:staged.length,compiled:results.filter(r=>r.status==='compiled').length}));}}}));
await write(output+'/21st-compile.json',results);
await write(output+'/21st-component-candidates.json',staged.map(row=>catalog.find(item=>item.id===row.id)));
// Preserve the shipped index: only the evidence-gated publisher may expose candidates.
} finally {
await fs.writeFile('public/data/catalog.json',originalCatalog);await fs.writeFile('public/data/catalog-connected.json',originalPatches);
}
console.log(JSON.stringify({total:results.length,compiled:results.filter(r=>r.status==='compiled').length,blocked:results.filter(r=>r.status==='blocked').length}));
