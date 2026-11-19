import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root='../research/source-checks/releases/2026-11-09',read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const candidates=await read(root+'/21st-component-candidates.json');
const compiled=await read(root+'/21st-compile.json'),originals=await read(root+'/21st-original-bundles.json');
const stages=await read(root+'/21st-stage.json'),media=await read(root+'/21st-media.json');
const mapping=await read('public/data/demo-local-assets.json');
for(const item of candidates){
 const result=compiled.find(row=>row.id===item.id);
 if(result?.status==='compiled'){
  item.originalCodePath=item.codePath;item.codePath='/code/runtime/'+item.id+'.json';item.previewPath=result.previewPath;item.runtimePreviewPath=result.previewPath;
 }else{
  const bundle=originals.find(row=>row.id===item.id&&row.originalPreviewStatus==='retained-specific-item');
  if(!bundle){item.integrationBlocked=result?.reason||'Original example unavailable';continue;}
  const slug=item.id,prefix='/previews/recovered/demos/'+slug;
  const html=await fs.readFile(root+'/'+bundle.file,'utf8');
  await fs.mkdir('public'+prefix,{recursive:true});await fs.writeFile('public'+prefix+'/index.html',html);
  const manifest=await read('public/data/recovered-demo-assets.json');manifest[slug]=['index.html'];await fs.writeFile('public/data/recovered-demo-assets.json',JSON.stringify(manifest));
  const payload=await read('public'+item.codePath);
  payload.framework='html';payload.sourceFramework='react';payload.recoveryMode='interactive-compiled-example';payload.promptOrigin='reconstructed';
  payload.reconstructionPrompt='# '+item.name+'\n\nRecrie o componente usando o exemplo original executável e os arquivos-fonte disponíveis no pacote. A demonstração compilada é original; o texto destas instruções foi preparado para integração. A recuperação editável está incompleta: '+result.reason+'. Use preview.html como referência para preservar as interações. Não afirme que os auxiliares ausentes foram recuperados.\n\n'+item.description;
  payload.files.push({path:'SOURCE-LIMITATIONS.md',content:result.reason+'\nOriginal public demo: '+bundle.bundleUrl});
  await fs.writeFile('public'+item.codePath,JSON.stringify(payload));
  item.availability='preview';item.framework='html';item.sourceFramework='react';item.recoveryMode='interactive-compiled-example';item.promptOrigin='reconstructed';item.previewPath=prefix+'/index.html';
 }
 const cover=media.find(row=>row.local&&row.uses.some(([id,isCover])=>id===item.id&&isCover));if(cover)item.image=cover.local;
 item.previewAssets=mapping.items[item.id]||{};
 item.publicSlug=item.slug+'-'+crypto.createHash('sha1').update(item.id).digest('hex').slice(0,6);
}
const themes=await read(root+'/21st-theme-candidates.json');
const templates=await read(root+'/21st-template-captures.json'),templateCandidates=[];
for(const template of templates){
 if(template.status!=='retained')continue;
 const metadata=template.metadata,id='21st-template-'+metadata.id,html=await fs.readFile('public'+template.previewPath,'utf8'),codePath='/code/releases/'+id+'.json';
 const instructions='# '+metadata.name+'\n\nImplemente a página conforme a demonstração original compilada incluída no pacote. Preserve composição, animações, responsividade e estados interativos. O código-fonte editável e os serviços de backend não foram recuperados nesta captura. Este prompt é uma instrução de reconstrução, não um prompt original do autor.\n\n'+(metadata.description||'');
 const payload={name:metadata.name,framework:'html',recoveryMode:'interactive-compiled-page',promptOrigin:'reconstructed',reconstructionPrompt:instructions,license:'Original source terms and notices apply; retain original notices in captured artifacts.',files:[{path:'preview.html',content:html},{path:'RECONSTRUCTION.md',content:instructions}]};
 await fs.writeFile('public'+codePath,JSON.stringify(payload));
 const manifest=await read('public/data/recovered-demo-assets.json');manifest[id]=template.files;await fs.writeFile('public/data/recovered-demo-assets.json',JSON.stringify(manifest));
 templateCandidates.push({id,sourceId:'21st',name:metadata.name,slug:id,description:metadata.description,category:'Heroes',kind:'template',url:metadata.url,sourceUrl:metadata.url,previewPath:template.previewPath,codePath,availability:'preview',framework:'html',promptOrigin:'reconstructed',recoveryMode:'interactive-compiled-page',tags:['Template','HTML'],license:payload.license,updated:'2026-11-09',publicSlug:id});
}
const all=[...candidates,...themes,...templateCandidates];
await fs.writeFile(root+'/21st-candidate-catalog.json',JSON.stringify(all,null,2));
await fs.writeFile('var/21st-audit-catalog.json',JSON.stringify(all.filter(row=>row.previewPath)));
console.log(JSON.stringify({components:candidates.length,compiledComponents:compiled.filter(r=>r.status==='compiled').length,originalCompiledFallbacks:candidates.filter(r=>r.recoveryMode==='interactive-compiled-example').length,themes:themes.length,templates:templateCandidates.length,published:0}));
