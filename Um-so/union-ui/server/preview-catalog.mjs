import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const WORKSPACE=path.dirname(APP_ROOT);
export const PUBLIC_ROOT=path.join(APP_ROOT,'public');
const normalize=s=>String(s||'').replace(/\\/g,'/').replace(/^\.\//,'');
export const withoutExt=s=>normalize(s).replace(/\.(tsx?|jsx?|mjs|css)$/,'');
export const basename=s=>withoutExt(s).split('/').pop();
let catalogPromise;
let demoCache={mtime:0,data:{}};
let overrideCache={mtime:0,data:{}};
let reactbitsCache={mtime:0,data:{}};
async function getReactbitsDemos(){
 const file=path.join(PUBLIC_ROOT,'data/reactbits-demos.json');
 try{const stat=await fs.stat(file);if(stat.mtimeMs!==reactbitsCache.mtime)reactbitsCache={mtime:stat.mtimeMs,data:JSON.parse(await fs.readFile(file,'utf8'))};return reactbitsCache.data;}catch{return {};}
}
async function getRuntimeDemos(){
 const file=path.join(PUBLIC_ROOT,'data/runtime-demos.json');
 try{const stat=await fs.stat(file);if(stat.mtimeMs!==demoCache.mtime)demoCache={mtime:stat.mtimeMs,data:JSON.parse(await fs.readFile(file,'utf8'))};return demoCache.data.items||demoCache.data;}catch{return {};}
}
async function getRuntimeOverrides(){
 const file=path.join(PUBLIC_ROOT,'data/runtime-overrides.json');
 try{const stat=await fs.stat(file);if(stat.mtimeMs!==overrideCache.mtime)overrideCache={mtime:stat.mtimeMs,data:JSON.parse(await fs.readFile(file,'utf8'))};return overrideCache.data.items||overrideCache.data;}catch{return {};}
}
export async function getCatalog(){
 catalogPromise ||= (async()=>{const items=JSON.parse(await fs.readFile(path.join(PUBLIC_ROOT,'data/catalog.json'),'utf8'));let patches={};try{patches=JSON.parse(await fs.readFile(path.join(PUBLIC_ROOT,'data/catalog-connected.json'),'utf8'));}catch{}const merged=items.map(x=>({...x,...patches[x.id]}));return{items:merged,byId:new Map(merged.map(x=>[x.id,x]))};})();
 return catalogPromise;
}
export async function readPublicJSON(publicPath){
 if(typeof publicPath!=='string'||!publicPath.startsWith('/code/'))throw new Error('Invalid preview source path.');
 const file=path.resolve(PUBLIC_ROOT,'.'+publicPath);
 if(!file.startsWith(path.join(PUBLIC_ROOT,'code')+path.sep))throw new Error('Invalid preview source path.');
 return JSON.parse(await fs.readFile(file,'utf8'));
}
export async function loadItem(id){
 const {byId}=await getCatalog();const item=byId.get(id);
 if(!item)throw Object.assign(new Error('Component not found.'),{status:404});
 if(!item.codePath||item.availability!=='code')throw Object.assign(new Error('Original implementation is not available locally.'),{status:422,code:'source-unavailable'});
 const payload=await readPublicJSON(item.codePath);
 return {item:{...item,framework:payload.framework||item.framework||'react'},payload};
}

const libraryRoots={
 kokonut:['research/catalog-b/kokonut-repo'],
 motion:['research/catalog-b/motion-repo'],
 tailark:['research/catalog-b/tailark-repo'],
 animate:['research/catalog-c/animate-repo/packages/react/src'],
 shadcnblocks:['research/catalog-c/shadcn-repo/src'],
};
async function diskCandidate(roots,relative){
 for(const root of roots){
  const absoluteRoot=path.join(WORKSPACE,root);const full=path.resolve(absoluteRoot,relative);
  if(!full.startsWith(absoluteRoot+path.sep))continue;
  for(const file of [full,full+'.tsx',full+'.ts',full+'.jsx',full+'.js',path.join(full,'index.tsx'),path.join(full,'index.ts')]){
   try{if((await fs.stat(file)).isFile())return{path:normalize(path.relative(WORKSPACE,file)),content:await fs.readFile(file,'utf8'),diskPath:file};}catch{}
  }
 }
 return null;
}

export async function createSourceContext(item,payload){
 const files=new Map();
 const add=filesToAdd=>{for(const f of filesToAdd||[])if(typeof f.content==='string')files.set(normalize(f.path||f.name||'component.tsx'),{...f,path:normalize(f.path||f.name||'component.tsx')});};
 add(payload.files);
 if(item.sourceId==='animate'){
  await Promise.all([...files.values()].map(async file=>{
   const disk=await diskCandidate(libraryRoots.animate,file.path);
   if(disk)files.set(file.path,{...file,diskPath:disk.diskPath});
  }));
 }
 for(const cp of payload.additionalCodePaths||[])try{add((await readPublicJSON(cp)).files);}catch{}
 let runtimeDemo=null;
 runtimeDemo=(await getRuntimeOverrides())[item.id]||(await getReactbitsDemos())[item.id]||(await getRuntimeDemos())[item.id]||null;
 if(runtimeDemo?.files)add(runtimeDemo.files);
 let demoCode=runtimeDemo?.entry||payload.demoCode||null;
 let demoPath=runtimeDemo?.entryPath||payload.demoPath||'union-demo.tsx';
 if(!demoCode&&item.sourceId!=='reactbits'){
  const example=item.examples?.[0]||payload.examples?.[0];
  if(example?.codePath)try{const source=await readPublicJSON(example.codePath);add(source.files);const demo=(source.files||[]).find(f=>/\.[jt]sx?$/.test(f.path||'')&&typeof f.content==='string');if(demo){demoCode=demo.content;demoPath=demo.path;}}catch{}
 }
 const primary=(payload.files||[]).find(f=>/\.[jt]sx?$/.test(f.path||'')&&!/(?:^|\/)(?:use-|utils|hooks\/)/.test(f.path||''));
 if(!primary)throw Object.assign(new Error('This item is a hook, utility, or non-React asset without an executable view.'),{status:422,code:'nonvisual-source'});
 const baseName=basename(primary.path);
 let main=normalize(primary.path);
 if(demoCode){main='__union_demo__.tsx';files.set(main,{path:main,content:demoCode,originalPath:demoPath});}
 const loadedCodePaths=new Set([item.codePath]);
 const catalog=(await getCatalog()).items;
 async function loadOther(candidate){
  if(!candidate?.codePath||loadedCodePaths.has(candidate.codePath))return false;
  loadedCodePaths.add(candidate.codePath);try{add((await readPublicJSON(candidate.codePath)).files);return true;}catch{return false;}
 }
 function findLocal(importPath,importer){
  let p=normalize(importPath);
  const clean=p.replace(/^[@~]\//,'');
  const importerFile=files.get(importer);
  const relative=p.startsWith('.')?normalize(path.posix.join(path.posix.dirname(importerFile?.originalPath||importer),p)):clean;
  const extension=path.posix.extname(p);
  const eligible=[...files.values()].filter(f=>!extension||path.posix.extname(f.path)===extension);
  for(const f of eligible)if(f.path===relative||f.path===clean)return f;
  for(const f of eligible)if(withoutExt(f.path)===withoutExt(relative)||withoutExt(f.path)===withoutExt(clean))return f;
  const suffix=eligible.filter(f=>withoutExt(f.path).endsWith('/'+withoutExt(clean)));
  if(suffix.length===1)return suffix[0];
  const byBase=eligible.filter(f=>basename(f.path)===basename(p));
  if(byBase.length===1)return byBase[0];
  return null;
 }
 async function resolveSource(importPath,importer){
  if(item.sourceId==='shadcnblocks'&&/^@\/components\/(?:ui|diceui)\//.test(importPath)){
   const explicit=await diskCandidate(['research/shared-registry'],importPath.slice(2).replace(/^components\/diceui\//,'components/ui/'));
   if(explicit){add([explicit]);return explicit;}
  }
  // Resolve relative imports from their actual source directory before trying
  // registry basename fallbacks (index.tsx often re-exports extra symbols).
  if(importPath.startsWith('.')){
   const origin=files.get(importer);
   if(origin?.diskPath){const rel=normalize(path.relative(WORKSPACE,path.resolve(path.dirname(origin.diskPath),importPath)));const exact=await diskCandidate(['.'],rel);if(exact){add([exact]);return exact;}}
  }
  if(importPath.startsWith('@animate-ui/react/')){
   const exact=await diskCandidate(libraryRoots.animate,importPath.slice('@animate-ui/react/'.length));if(exact){add([exact]);return exact;}
  }
  let found=findLocal(importPath,importer);if(found)return found;
  const requested=basename(importPath);
  if(importPath.startsWith('@animate-ui/react/')){
   const rel=importPath.slice('@animate-ui/react/'.length);
   found=await diskCandidate(libraryRoots.animate,rel);if(found){add([found]);return found;}
  }
  if(importPath.startsWith('.')){
   const file=files.get(importer);
   if(file?.diskPath){const rel=normalize(path.relative(WORKSPACE,path.resolve(path.dirname(file.diskPath),importPath)));found=await diskCandidate(['.'],rel);if(found){add([found]);return found;}}
  }
  if(importPath.startsWith('@/')||importPath.startsWith('~/')){
   const relative=importPath.slice(2);
   // Shared registry helpers are explicit dependencies, not unrelated catalog
   // components that happen to have the same basename (such as file-upload).
   if(item.sourceId==='shadcnblocks'||item.sourceId==='aceternity'){
    found=await diskCandidate(['research/shared-registry'],relative);if(found){add([found]);return found;}
   }
   found=await diskCandidate(libraryRoots[item.sourceId]||[],relative);if(found){add([found]);return found;}
   if(relative.startsWith('components/ui/')||relative.startsWith('hooks/')){
    found=await diskCandidate(['research/catalog-b/kokonut-repo','research/catalog-c/shadcn-repo/src'],relative);if(found){add([found]);return found;}
   }
  }
  const namespace=importPath.startsWith('@magicui/')?'magic':importPath.startsWith('@aceternity/')?'aceternity':item.sourceId;
  let candidates=catalog.filter(r=>r.sourceId===namespace&&r.codePath&&r.availability==='code'&&(r.slug===requested||basename(r.slug)===requested));
  if(!candidates.length)candidates=catalog.filter(r=>r.codePath&&r.availability==='code'&&(r.slug===requested||r.slug===requested.replace(/-demo$/,'')));
  for(const candidate of candidates.slice(0,3)){await loadOther(candidate);found=findLocal(importPath,importer);if(found)return found;}
  return null;
 }
 return {item,payload,files,main,primary:normalize(primary.path),baseName,hasDemo:!!demoCode,demoKind:runtimeDemo?.kind,resolveSource};
}
