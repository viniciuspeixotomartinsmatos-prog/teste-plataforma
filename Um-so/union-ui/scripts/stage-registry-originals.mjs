// Compile public originals in isolation. AI-labelled examples do not provision an AI backend.
import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';import{compileStagedItem}from'../server/preview-service.mjs';
const app=fileURLToPath(new URL('../',import.meta.url)),date=process.argv[2]||'2026-11-12';if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Invalid date');
const root=path.resolve(app,'../research/source-checks/releases',date),read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const jobs=(await read(path.join(root,'public-registry-acquisition.json'))).records.filter(row=>row.status==='retained_unvalidated'&&row.sourceChanged!==false),candidates=[],results=[];
for(const row of jobs)try{
 const original=await read(path.join(root,row.source,row.name+'.json')),files=original.files.map(file=>({path:file.path.replace(/^\//,''),content:file.content}));
 let demoCode;
 if(row.source==='magic'){
  const exampleName=row.name==='magic-card'?'magic-card-demo':'code-comparison-demo';
  const example=await read(row.name==='magic-card'?path.join(root,'magic',exampleName+'.json'):path.resolve(app,'../research/catalog-a/code/magic',exampleName+'.json'));
  demoCode=example.files.find(file=>file.path.includes(exampleName))?.content;if(!demoCode)throw Error('Original example missing');
  if(row.name==='magic-card'){
   // Explicitly retained supporting shadcn label, not recovered Magic UI source.
   files.push({path:'components/ui/label.tsx',content:await fs.readFile(path.resolve(app,'../research/catalog-b/motion-repo/components/ui/label.tsx'),'utf8')});
   files.push({path:'SUPPORTING-SOURCE.md',content:'The original Magic Card example imports a shadcn Label. This supporting Label is retained from research/catalog-b/motion-repo/components/ui/label.tsx. Preserve the project shadcn/Radix source notices and licenses. It is separate supporting source, not newly recovered Magic UI code.'});
  }
 }
 const name=original.title||row.name.split('-').map(word=>word[0].toUpperCase()+word.slice(1)).join(' '),id='staged-'+row.source+'-'+row.name;
 const payload={name,framework:'react',files,demoCode,dependencies:original.dependencies||[],sourceUrl:row.url,license:'Preserve original source notices and applicable upstream license.',retrievedVia:'public-original-registry'};
 const item={id,sourceId:row.source,name,slug:row.name,url:row.source==='magic'?'https://magicui.design/docs/components/'+row.name:'https://kokonutui.com/docs/components/'+row.name,description:original.description||'',category:/ai-/.test(row.name)?'AI components':'Interactions',kind:'component',framework:'react',availability:'code',codePath:'/code/releases/'+id+'.json',image:'',dependencies:payload.dependencies,license:payload.license,tags:['React'],updated:date};
 const built=await compileStagedItem(item,payload,{persist:true});await fs.mkdir(path.join(app,'public/code/releases'),{recursive:true});await fs.writeFile(path.join(app,'public',item.codePath),JSON.stringify(payload));
 candidates.push({...item,previewPath:built.previewPath});results.push({id,name,status:'compiled',bytes:built.bytes,previewPath:built.previewPath,acceptance:'pending-authorized-browser'});
 }catch(error){results.push({source:row.source,name:row.name,status:'blocked',reason:error.errors?.map(row=>row.text).join('; ')||error.message});}
await fs.writeFile(path.join(root,'registry-staged-catalog.json'),JSON.stringify(candidates,null,2)+'\n');await fs.writeFile(path.join(root,'registry-stage-report.json'),JSON.stringify({checkedAt:new Date().toISOString(),published:0,results},null,2)+'\n');console.log(JSON.stringify({selected:jobs.length,compiled:candidates.length,blocked:results.filter(row=>row.status==='blocked').length,published:0}));
