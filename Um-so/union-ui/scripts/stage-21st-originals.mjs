// Retained source is inert input. This never updates a live catalog or asserts browser acceptance.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {compileStagedItem} from '../server/preview-service.mjs';
const app=fileURLToPath(new URL('../',import.meta.url));
const date=process.argv[2]||'2026-11-12';
if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Invalid release date');
const root=path.resolve(app,'../research/source-checks/releases',date),folder=path.join(root,'21st');
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const candidates=[],results=[],seen=new Set();
for(const filename of (await fs.readdir(folder)).filter(name=>name.endsWith('.json')).sort()){
 const record=await read(path.join(folder,filename)),c=record.component,m=record.metadata;
 if(!c?.isPublic||!c.componentCode||!c.demoCode||!m?.url||seen.has(c.id))continue;
 seen.add(c.id);
 const id='staged-21st-'+c.id,slug=m.url.split('/').pop();
 try{
  const files=Object.entries(c.registryDependencies?.filesWithRegistry||{}).filter(([,file])=>typeof file?.code==='string').map(([name,file])=>({path:name.replace(/^\//,''),content:file.code}));
  const imports=[...c.demoCode.matchAll(/from\s*["'](@\/[^"']+)["']/g)].map(match=>match[1].slice(2));
  const main=imports.find(name=>!/(?:^|\/)(?:utils|use-[^/]+)$/.test(name)&&!files.some(file=>file.path.replace(/\.[jt]sx?$/,'')===name))||'components/ui/'+slug;
  files.unshift({path:/\.[jt]sx?$/.test(main)?main:main+'.tsx',content:c.componentCode});
  const dependencies=new Set(Object.keys(c.registryDependencies?.npmDependencies||{}));
  for(const file of [...files,{content:c.demoCode}])for(const match of file.content.matchAll(/(?:from\s*|import\s*\()["']([^"']+)["']/g)){
   const value=match[1];if(/^(?:\.|@\/|~\/|https?:)/.test(value))continue;
   dependencies.add(value.startsWith('@')?value.split('/').slice(0,2).join('/'):value.split('/')[0]);
  }
  const text=(slug+' '+c.name).toLowerCase(),category=/shader|background|field|mesh/.test(text)?'Backgrounds':/carousel|gallery|slider/.test(text)?'Galleries':/hero|landing/.test(text)?'Heroes':/button/.test(text)?'Buttons':/menu|nav|dock/.test(text)?'Navigation':/footer/.test(text)?'Footers':/login|sign-in/.test(text)?'Authentication':/text|headline|typewriter/.test(text)?'Text effects':'Components';
  const codePath='/code/releases/'+id+'.json';
  const payload={name:c.name,framework:'react',files,demoCode:c.demoCode,dependencies:[...dependencies],sourceUrl:m.url,license:'Source terms; preserve original notices and bundled asset restrictions.',retrievedVia:'authorized-connected-retrieval'};
  const item={id,sourceId:'21st',name:c.name,slug,description:c.description||m.description||'',category,kind:'component',url:m.url,sourceUrl:m.url,image:'',codePath,availability:'code',framework:'react',dependencies:[...dependencies],tags:['React',category],license:payload.license,updated:date};
  await fs.mkdir(path.join(app,'public/code/releases'),{recursive:true});
  await fs.writeFile(path.join(app,'public',codePath),JSON.stringify(payload));
  const compiled=await compileStagedItem(item,payload,{persist:true});
  candidates.push({...item,previewPath:compiled.previewPath});
  results.push({id,url:m.url,status:'compiled',bytes:compiled.bytes,previewPath:compiled.previewPath,acceptance:'pending-authorized-browser'});
 }catch(error){results.push({id,url:m.url,status:'blocked',reason:error.errors?.map(row=>row.text).join('; ')||error.message});}
}
await fs.writeFile(path.join(root,'21st-staged-catalog.json'),JSON.stringify(candidates,null,2)+'\n');
await fs.writeFile(path.join(root,'21st-stage-report.json'),JSON.stringify({checkedAt:new Date().toISOString(),published:0,results},null,2)+'\n');
console.log(JSON.stringify({selected:results.length,compiled:candidates.length,blocked:results.filter(row=>row.status==='blocked').length,published:0}));
