import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Recovered bundles have rewritten URLs. They must not claim the original
// Next.js globally immutable content addresses. Preserve retained source bytes;
// change only the copied distribution and its references, keeping all media.
export async function repackageRetainedStatic(outputDirectory){
 const root=await fs.realpath(path.resolve(outputDirectory));
 const within=target=>{const result=path.resolve(target);if(!result.startsWith(root+path.sep))throw Error('Static packaging path escaped its output directory.');return result;};
 const demos=within(path.join(root,'previews/recovered/demos'));
 let entries;try{entries=await fs.readdir(demos,{withFileTypes:true});}catch(error){if(error.code==='ENOENT')return{templates:0,rewritten:0};throw error;}
 if(await fs.realpath(demos)!==demos)throw Error('Unexpected symbolic path in retained static output.');
 const result={templates:0,rewritten:0};
 for(const entry of entries){
  if(!entry.isDirectory()||!/^21st-template-\d+$/.test(entry.name))continue;
  const template=within(path.join(demos,entry.name)),original=within(path.join(template,'_next/static/immutable')),destination=within(path.join(template,'_next/static/recovered'));
  let existing;try{existing=await fs.lstat(original);}catch(error){if(error.code!=='ENOENT')throw error;}
  if(existing){
   if(!existing.isDirectory()||existing.isSymbolicLink()||!(await fs.realpath(original)).startsWith(template+path.sep))throw Error('Unexpected retained static directory.');
   try{await fs.access(destination);throw Error('Retained static destination already exists; use a clean build.');}catch(error){if(error.code!=='ENOENT')throw error;}
   await fs.rename(original,destination);result.templates++;
  }else{try{await fs.access(destination);}catch{continue;}}
  const pending=[template];
  while(pending.length){
   const directory=pending.pop();
   for(const item of await fs.readdir(directory,{withFileTypes:true})){
    const filename=within(path.join(directory,item.name));
    if(item.isSymbolicLink())throw Error('Unexpected symbolic link in retained static output.');
    if(item.isDirectory()){pending.push(filename);continue;}
    if(!/\.(?:html|js|mjs|css|json|map|svg)$/.test(item.name))continue;
    const before=await fs.readFile(filename,'utf8');
    const after=before.replaceAll('static/immutable/','static/recovered/').replaceAll('static\\/immutable\\/','static\\/recovered\\/').replaceAll('static%2Fimmutable%2F','static%2Frecovered%2F');
    if(before!==after){await fs.writeFile(filename,after);result.rewritten++;}
   }
  }
 }
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await repackageRetainedStatic(path.resolve('dist/client'));
 console.log(`Packaged retained static assets: ${result.templates} templates; ${result.rewritten} reference files updated.`);
}
