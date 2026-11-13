/**
 * Build executable demo metadata from original checked-out demonstration files.
 * No source component is replaced with an approximate implementation.
 * The only authored examples are direct instances of the actual animated icon
 * export using its observed IconProps (animate/animateOnHover/loop/size).
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKSPACE = path.dirname(APP);
const PUBLIC = path.join(APP, 'public');
const REPO = path.join(WORKSPACE, 'research/catalog-c/animate-repo');
const SITE = path.join(REPO, 'apps/v2');
const DOCS = path.join(SITE, 'content/docs');
const normalize = value => String(value).replaceAll('\\', '/');
const relative = file => normalize(path.relative(WORKSPACE, file));
const extension = /\.(tsx?|jsx?|vue|css)$/;
const imports = text => [...String(text).matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)['"]([^'"]+)['"]/g)].map(match => match[1]);
const exportNames = code => {
  const names = new Set();
  for (const match of code.matchAll(/export\s+(?:function|const|class)\s+([A-Za-z_$][\w$]*)/g)) names.add(match[1]);
  for (const match of code.matchAll(/export\s*\{([\s\S]*?)\}/g)) {
    for (const part of match[1].split(',')) {
      const name=part.trim().replace(/^type\s+/, '');
      if (!name||/^type\s/.test(part.trim())) continue;
      const alias=name.match(/\bas\s+([\w$]+)$/);
      const selected=alias ? alias[1] : name;
      if (/^[A-Za-z_$][\w$]*$/.test(selected))names.add(selected);
    }
  }
  return [...names];
};

async function walk(root) {
  const found=[];
  for (const entry of await fs.readdir(root,{withFileTypes:true})) {
    const file=path.join(root,entry.name);
    if (entry.isDirectory())found.push(...await walk(file)); else found.push(file);
  }
  return found;
}

async function fileAt(base) {
  for(const file of [base,base+'.tsx',base+'.ts',base+'.jsx',base+'.js',path.join(base,'index.tsx'),path.join(base,'index.ts')]) {
    try{if((await fs.stat(file)).isFile())return file;}catch{}
  }
  return null;
}

async function readPublic(publicPath) {
  if(!publicPath)return null;
  try {return JSON.parse(await fs.readFile(path.join(PUBLIC,publicPath.replace(/^\//,'')),'utf8'));}catch{return null;}
}

/** Collect original local demonstration dependencies, retaining their disk paths.
 * Package primitives are resolved by the compiler from their original package.
 */
async function demoDependencies(demoFile,demoCode) {
  const files=[];
  const seen=new Set();
  async function visit(importPath,importer) {
    if(!importPath.startsWith('.')&&!importPath.startsWith('@/'))return;
    const requested=importPath.startsWith('@/')?path.join(SITE,importPath.slice(2)):path.resolve(path.dirname(importer),importPath);
    if(!requested.startsWith(SITE+path.sep))return;
    const target=await fileAt(requested);
    if(!target||seen.has(target)||!extension.test(target))return;
    seen.add(target);
    const content=await fs.readFile(target,'utf8');
    const actual=normalize(path.relative(SITE,target));
    // Source path remains explicit; directory aliases are duplicated with an
    // index-less virtual name for registry module resolution.
    const alias=importPath.startsWith('@/')?normalize(importPath.slice(2)):actual;
    const virtual=alias.endsWith('/index')?alias+'.tsx':(path.extname(alias)?alias:alias+'.tsx');
    files.push({path:virtual,content,originalPath:actual,diskPath:target});
    if(virtual!==actual)files.push({path:actual,content,originalPath:actual,diskPath:target});
    for(const child of imports(content))await visit(child,target);
  }
  for(const imported of imports(demoCode))await visit(imported,demoFile);
  return files;
}

const catalog=JSON.parse(await fs.readFile(path.join(PUBLIC,'data/catalog.json'),'utf8'));
const docsFiles=(await walk(DOCS)).filter(file=>file.endsWith('.mdx')&&!normalize(path.relative(DOCS,file)).startsWith('vue/'));
const byRegistry=new Map();
const byDocument=new Map();
const byTitle=new Map();
for(const file of docsFiles) {
  const text=await fs.readFile(file,'utf8');
  const preview=[...text.matchAll(/<ComponentPreview\b[^>]*\bname="([^"]+)"/g)].map(match=>match[1]);
  const title=text.match(/^title:\s*['"]?(.+?)['"]?\s*$/m)?.[1];
  const document=normalize(path.relative(DOCS,file)).replace(/\.mdx$/,'');
  const record={file,text,preview,document,title};
  byDocument.set(document,record);
  if(title)byTitle.set(title.toLowerCase(),record);
  for(const match of text.matchAll(/<RegistryInstallation\b[^>]*\bname="([^"]+)"/g))byRegistry.set(match[1],record);
}

const output={};
const skipped=[];
for(const item of catalog) {
  if(item.sourceId!=='animate'||!item.codePath||item.availability!=='code')continue;
  if(item.slug.startsWith('vue/'))continue;
  const payload=await readPublic(item.codePath);
  if(!payload||payload.framework==='vue')continue;
  const primary=payload.files?.find(file=>/\.[jt]sx?$/.test(file.path||'')&&typeof file.content==='string');
  if(!primary)continue;
  const isIcon=item.kind==='icon'||/^(icons|hugeicons)\//.test(item.slug);
  if(isIcon) {
    const names=exportNames(primary.content);
    const name=names.find(n=>/^[A-Z]/.test(n)&&!/(?:Props|IconProps)$/.test(n)&&n!=='IconComponent')||names.find(n=>/^[A-Z]/.test(n));
    if(!name){skipped.push({id:item.id,reason:'icon-export-not-found'});continue;}
    const instancePath='__runtime_icon_'+item.id.replace(/[^\w-]/g,'_')+'.tsx';
    const importName='./'+instancePath.replace(/\.tsx$/,'');
    const entry=`import * as React from 'react';\nimport { ${name} } from ${JSON.stringify(importName)};\n\nexport default function OriginalIconDemo() {\n  const [playing,setPlaying]=React.useState(true);\n  return <div className="flex min-h-80 w-full flex-col items-center justify-center gap-8 p-10">\n    <${name} size={88} animate={playing} loop={playing} animateOnHover />\n    <button type="button" onClick={()=>setPlaying(value=>!value)} className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-accent">{playing?'Pausar animação':'Reproduzir animação'}</button>\n  </div>;\n}\n`;
    const metaFile=path.join(SITE,'registry',...item.slug.split('/'),'meta.json');
    let meta={};try{meta=JSON.parse(await fs.readFile(metaFile,'utf8'));}catch{}
    output[item.id]={entry,entryPath:'__runtime_demo_'+item.id+'.tsx',componentEntry:instancePath,
      files:[{path:instancePath,content:primary.content,originalPath:'registry/'+item.slug+'/index.tsx',diskPath:path.join(SITE,'registry',...item.slug.split('/'),'index.tsx')}],
      kind:'icon-instance',props:{size:88,animate:true,loop:true,animateOnHover:true},
      namespace:item.slug.startsWith('hugeicons/')?'Hugeicons':'Lucide',
      componentExport:name,tags:[...(meta.keywords||[]),...(meta.categories||[])],
      notes:'Original animated icon source and exact exported component; the preview wrapper only controls the documented animation props.'};
    continue;
  }
  const registryKey=item.slug.replaceAll('/','-');
  const record=byDocument.get(item.slug)||byRegistry.get(registryKey)||byTitle.get(item.name.toLowerCase());
  let candidates=record?.preview||[];
  if(!candidates.length) {
    const parts=item.slug.split('/');
    const base=parts.pop();
    candidates=[parts.at(-1)+'/'+base,'animate-ui/'+base,'backgrounds/'+base];
  }
  let matched=null;
  for(const candidate of candidates) {
    const demoFile=await fileAt(path.join(SITE,'demos',candidate));
    if(demoFile){matched={file:demoFile,name:candidate};break;}
  }
  if(matched) {
    const entry=await fs.readFile(matched.file,'utf8');
    const files=await demoDependencies(matched.file,entry);
    output[item.id]={entry,entryPath:normalize(path.relative(SITE,matched.file)),files,
      componentEntry:primary.path,kind:'original-demo',demoPath:relative(matched.file),
      notes:'Unmodified original public demonstration from Animate UI; controls exports retain original default props.'};
    continue;
  }
  // If an original docs snippet is itself a complete function, retain that exact
  // example rather than constructing a speculative primitive tree.
  const snippets=record?[...record.text.matchAll(/```(?:tsx|jsx)\s*\n([\s\S]*?)```/g)].map(match=>match[1]):[];
  const snippet=snippets.find(code=>/export\s+(?:default\s+)?function\s+[A-Z]/.test(code)&&/return\s*\(/.test(code));
  if(snippet) {
    const files=await demoDependencies(record.file,snippet);
    output[item.id]={entry:snippet,entryPath:'__documentation_'+item.id+'.tsx',componentEntry:primary.path,files,
      kind:'documentation-example',demoPath:relative(record.file),notes:'Exact complete React example retained from original component documentation.'};
  } else skipped.push({id:item.id,reason:'no-original-runnable-demo'});
}

// Original demonstration source already present in imported A/B payloads is
// carried in the same map for a single runtime consumer. React Bits full website
// demos are not substituted here; that source has its own preview extraction.
for(const item of catalog) {
  if(output[item.id]||!item.codePath||item.availability!=='code'||item.sourceId==='reactbits')continue;
  const payload=await readPublic(item.codePath);
  if(!payload||payload.framework==='vue')continue;
  if(typeof payload.demoCode==='string'&&payload.demoCode.trim()) {
    output[item.id]={entry:payload.demoCode,entryPath:payload.demoPath||'__payload_demo_'+item.id+'.tsx',
      componentEntry:payload.files?.find(file=>/\.[jt]sx?$/.test(file.path||''))?.path,
      files:[],kind:'original-demo',notes:'Original demo or documented usage retained by source importer; code is unchanged.'};
  }
}

const allUiFiles=(await walk(path.join(SITE,'components/ui'))).filter(file=>extension.test(file));
const shadcnRoot=path.join(WORKSPACE,'research/catalog-c/shadcn-repo/src/components/ui');
let shadcnUiFiles=[];try{shadcnUiFiles=(await walk(shadcnRoot)).filter(file=>extension.test(file));}catch{}
const dataFile=path.join(PUBLIC,'data/runtime-demos.json');
await fs.writeFile(dataFile,JSON.stringify(output));
const counts={};for(const [id,value] of Object.entries(output)){const source=catalog.find(item=>item.id===id)?.sourceId||'unknown';const key=source+'/'+value.kind;counts[key]=(counts[key]||0)+1;}
console.log(JSON.stringify({file:dataFile,entries:Object.keys(output).length,counts,skipped,
  sourceRoots:{animatePrimitives:relative(path.join(REPO,'packages/react/src')),animateRegistry:relative(path.join(SITE,'registry')),animateDemoUi:relative(path.join(SITE,'components/ui')),shadcnUi:relative(shadcnRoot)},
  uiInventory:{animate:allUiFiles.map(relative),shadcn:shadcnUiFiles.map(relative)}},null,2));
