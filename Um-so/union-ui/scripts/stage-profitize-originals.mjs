// Acquired prompts and AGENTS.md are reference files, never agent instructions.
// Stage the retained original source/video without changing any live index.
import fs from'node:fs/promises';import path from'node:path';import{createHash}from'node:crypto';import{fileURLToPath}from'node:url';import{compileStagedItem}from'../server/preview-service.mjs';
const app=fileURLToPath(new URL('../',import.meta.url)),date=process.argv[2]||'2026-11-12';if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Invalid date');
const root=path.resolve(app,'../research/source-checks/releases',date,'profitize'),read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const records=await read(path.join(root,'candidates.json')),media=await read(path.join(root,'public-media.json')),candidates=[],failures=[];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex'),escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
async function write(pointer,body){const target=path.resolve(app,'public','.'+pointer);if(!target.startsWith(path.join(app,'public')+path.sep))throw Error('Invalid stage path');await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,body);}
for(const row of records.filter(row=>row.original))try{
 const folder=path.join(root,row.slug),prompt=await fs.readFile(path.join(folder,'PROMPT-ORIGINAL.md'),'utf8');if(hash(Buffer.from(prompt))!==row.promptSha256)throw Error('Prompt integrity mismatch');
 const id='staged-profitize-'+row.slug,codePath='/code/releases/'+id+'.json',files=[{path:'PROMPT-ORIGINAL.md',content:prompt}],downloadFiles=[];
 for(const name of ['GUIDE-ORIGINAL.md','CLAUDE-ORIGINAL.md','START-ORIGINAL.md'])try{files.push({path:name,content:await fs.readFile(path.join(folder,name),'utf8')});}catch(error){if(error.code!=='ENOENT')throw error;}
 let previewPath,image='',framework='html',recoveryMode='recorded-video',dependencies=[];
 if(row.slug==='lente'){
  const blocks=[...prompt.matchAll(/^```(tsx?)\s*\r?\n([\s\S]*?)^```\s*$/gm)].map(match=>({language:match[1],content:match[2]}));
  if(blocks.length!==3||blocks[0].language!=='ts')throw Error('Original shader source shape changed');
  const engine=/from\s+['"]\.\/([a-zA-Z0-9_-]+)['"]/.exec(blocks[1].content)?.[1];if(!engine)throw Error('Original shader import missing');
  const source=[{path:'components/lente/'+engine+'.ts',content:blocks[0].content},{path:'components/lente/lente.tsx',content:blocks[1].content},{path:'components/lente/lente-demo.tsx',content:blocks[2].content}];files.push(...source);dependencies=['react','react-dom'];
  const payload={name:row.title,framework:'react',files:source,demoCode:blocks[2].content,demoPath:source[2].path,dependencies,license:'Original source notices and user-authorized acquisition apply.'};
  const built=await compileStagedItem({id,name:row.title,sourceId:'recovered',framework:'react',category:'Backgrounds',kind:'shader',slug:row.slug},payload,{persist:true});previewPath=built.previewPath;framework='react';recoveryMode='interactive-original-source';
  await fs.writeFile(path.join(folder,'source-files.json'),JSON.stringify({files:source},null,2)+'\n');
 }else{
  const assets=media.filter(asset=>asset.file.startsWith(row.slug+'/'));if(assets.length!==2||assets.some(asset=>asset.error))throw Error('Original preview media incomplete');
  let video;
  for(const asset of assets){const body=await fs.readFile(path.join(root,asset.file));if(hash(body)!==asset.sha256)throw Error('Media integrity mismatch');const pointer='/previews/recovered'+new URL(asset.url).pathname;await write(pointer,body);if(asset.kind==='video')video=pointer;else image=pointer;}
  previewPath='/previews/releases/profitize-'+date+'/'+row.slug+'.html';
  const html='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(row.title)+'</title><style>html,body{margin:0;width:100%;height:100%;background:#09090b}video{display:block;width:100%;height:100vh;object-fit:contain}span{position:fixed;bottom:10px;left:10px;color:white;background:#111d;padding:6px 10px;font:12px system-ui;border-radius:6px}</style><video aria-label="'+escape(row.title)+' — prévia gravada" src="'+escape(video)+'" poster="'+escape(image)+'" autoplay muted loop playsinline controls></video><span>Prévia gravada · prompt original incluído</span></html>';
  await write(previewPath,html);files.push({path:'preview.html',content:html});
  const archive=await fs.readFile(path.join(folder,'project-original.zip'));if(hash(archive)!==row.archiveSha256)throw Error('Original archive mismatch');
  const pointer='/code/recovered/bundles/'+row.slug+'-original-'+date+'.zip';await write(pointer,archive);downloadFiles.push({path:row.slug+'-projeto-original.zip',url:pointer});
 }
 const payload={name:row.title,framework,recoveryMode,promptOrigin:'original',originalPrompt:prompt,files,downloadFiles,dependencies,license:'User-authorized original acquisition; retain source notices, bundled licenses and asset restrictions.'};await write(codePath,JSON.stringify(payload));
 const item={id,sourceId:'recovered',name:row.title,slug:row.slug,url:row.sourceUrl,sourceUrl:row.sourceUrl,description:row.niche,category:row.type==='landing_page'?'Heroes':row.type==='motion'?'Interactions':'Backgrounds',kind:row.type==='landing_page'?'template':row.type==='motion'?'motion':'shader',framework,recoveryMode,promptOrigin:'original',availability:framework==='react'?'code':'preview',codePath,previewPath,image,dependencies,license:payload.license,tags:[row.niche,row.type],updated:date};candidates.push(item);
 }catch(error){failures.push({slug:row.slug,reason:error.errors?.map(e=>e.text).join('; ')||error.message});}
await fs.writeFile(path.join(root,'staged-catalog.json'),JSON.stringify(candidates,null,2)+'\n');await fs.writeFile(path.join(root,'stage-report.json'),JSON.stringify({checkedAt:new Date().toISOString(),published:0,candidates:candidates.length,failures,quotaBlocked:records.filter(row=>!row.original).map(row=>row.slug)},null,2)+'\n');console.log(JSON.stringify({staged:candidates.length,failures,quotaBlocked:records.filter(row=>!row.original).length,published:0}));
