import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Repeatable import of observed public catalogs. No application source is changed.
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = path.resolve(appRoot, '..');
const publicRoot = path.join(appRoot, 'public');
const inputSpecs = [
  { dir: 'catalog-a', file: 'catalog-light.json', shape: 'a' },
  { dir: 'catalog-b', file: 'catalog.json', shape: 'b' },
  { dir: 'catalog-c', file: 'catalog.json', shape: 'c' },
  { dir: 'catalog-21st', file: 'catalog.json', shape: '21st' },
];
const sourceInfo = [
  ['21st', '21st', 'https://21st.dev/', 'Componentes, templates e temas da comunidade.', '#2864ff'],
  ['aceternity', 'Aceternity UI', 'https://ui.aceternity.com/', 'Componentes e efeitos para interfaces e landing pages.', '#b77bff'],
  ['magic', 'Magic UI', 'https://magicui.design/', 'Componentes animados para design engineers.', '#f0b95b'],
  ['reactbits', 'React Bits', 'https://reactbits.dev/', 'Animações, backgrounds e componentes interativos.', '#a479ff'],
  ['kokonut', 'Kokonut UI', 'https://kokonutui.com/', 'Componentes React com motion e interações cuidadosas.', '#ef7dac'],
  ['shadcnblocks', 'shadcnblocks', 'https://www.shadcnblocks.com/', 'Blocos, páginas, templates e temas com shadcn/ui.', '#e7e7e7'],
  ['motion', 'Motion Primitives', 'https://motion-primitives.com/', 'Primitivas para interfaces com animação.', '#76b8ff'],
  ['tailark', 'Tailark', 'https://tailark.com/', 'Blocos de marketing e páginas em Base UI e Radix UI.', '#a5d989'],
  ['animate', 'Animate UI', 'https://animate-ui.com/', 'Primitivas animadas, componentes e ícones.', '#ff9b64'],
];
const canonicalCategories = new Set(['Heroes','Backgrounds','Text effects','Buttons','Navigation','Cards','AI & inputs','Galleries','Pricing','Testimonials','Footers','Dashboards','Authentication','Interactions','Icons','Utilities','Components']);
const kindSet = new Set(['component','block','template','theme','shader','app','icon','page','hook']);
const norm = (s='') => String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const safe = s => String(s).replace(/[^a-zA-Z0-9._-]+/g,'-');
const digest = s => crypto.createHash('sha256').update(s).digest('hex').slice(0,16);
const parseJSON = async file => JSON.parse((await fs.readFile(file,'utf8')).replace(/^\uFEFF/,''));
const exists = async file => fs.access(file).then(()=>true,()=>false);
const publicPath = file => '/'+path.relative(publicRoot,file).split(path.sep).join('/');
const report = { importedAt: new Date().toISOString(), inputs: [], omitted: [], imageDownloads: { attempted: 0, downloaded: 0, failed: 0 }, notes: [] };
for (const dir of ['data','code','previews','assets','assets/fonts','assets/sources','assets/thumbnails','licenses']) await fs.mkdir(path.join(publicRoot,dir),{recursive:true});

function categoryOf(row) {
  if (row.kind==='icon') return 'Icons';
  const c=String(row.category||'').toLowerCase(), n=String(row.name||'').toLowerCase(), s=String(row.slug||'').toLowerCase();
  const text=`${c} ${n} ${s}`;
  if (/hero/.test(text)) return 'Heroes';
  if (/background|shader|gradient|aurora|particle|caustic|galaxy|iridescen|liquid chrome|silk/.test(text)) return 'Backgrounds';
  if (/text.effect|text.effects|typograph|type.writer|typewriter|text-animation|scroll-velocity|split-text|scrambl|blur-text|shiny-text|rotating-text|shimmer-text|number-ticker|count-up|sliding-number|text-shimmer|text-roll|text-morph|text-loop/.test(text)) return 'Text effects';
  if (/footer/.test(text)) return 'Footers';
  if (/pricing|price.table/.test(text)) return 'Pricing';
  if (/testimonial|review.card/.test(text)) return 'Testimonials';
  if (/login|log-in|sign-in|sign-up|sign in|sign up|authentication|forgot-password|reset-password|two-factor|otp|auth-form|signup/.test(text)) return 'Authentication';
  if (/dashboard|analytics|data.visual|chart|statistics|kpi|stats|data-table/.test(text)) return 'Dashboards';
  if (/button|toggle/.test(text)) return 'Buttons';
  if (/navigation|navbar|nav-|sidebar|breadcrumb|menu|toolbar|dock|pagination|command.palette|tab-group|tabs/.test(text)) return 'Navigation';
  if (/input|textarea|ai |ai-|chat|agent|prompt|autocomplete|form|select|checkbox|radio|switch|search.bar|search-bar|calendar|date-picker|file.upload|file-upload|token|model.selector/.test(text)) return 'AI & inputs';
  if (/gallery|carousel|image|video|media|lightbox|slider|photo|marquee/.test(text)) return 'Galleries';
  if (/card|bento|grid/.test(text)) return 'Cards';
  if (/hook|utilit|helpers|use-|^cn$|motion.config|reduced.motion/.test(text)||row.type==='registry:hook'||row.kind==='hook') return 'Utilities';
  if (/accordion|dialog|modal|drawer|popover|tooltip|toast|collaps|cursor|hover|scroll|progress|spinner|loading|animation|transition|tilt|magnetic|gesture|expand|reveal|border|glow|spotlight|animated|ripple/.test(text)) return 'Interactions';
  if (canonicalCategories.has(row.category)) return row.category;
  return 'Components';
}

function kindOf(row) {
  if(kindSet.has(row.kind))return row.kind;
  if(row.type==='registry:hook')return 'hook';
  if(row.type==='registry:block')return 'block';
  if(/\/pages\//.test((row.files||[])[0]?.path||''))return 'page';
  return 'component';
}

const copied = new Map();
async function copyFile(source, dest) {
  if(!await exists(source))return null;
  await fs.mkdir(path.dirname(dest),{recursive:true});
  if(!copied.has(dest)){await fs.copyFile(source,dest);copied.set(dest,source);}
  return publicPath(dest);
}

async function copyCode(original, spec) {
  if(!original)return null;
  const relative = spec.shape==='a'||spec.shape==='21st';
  const source = path.resolve(relative?path.join(workspace,'research',spec.dir):workspace,original);
  const researchRoot=path.join(workspace,'research',spec.dir);
  if(!source.startsWith(researchRoot+path.sep))return null;
  const local=path.relative(path.join(researchRoot,'code'),source);
  const target=path.join(publicRoot,'code',spec.dir.replace('catalog-',''),local);
  if(!target.startsWith(path.join(publicRoot,'code')+path.sep))return null;
  return copyFile(source,target);
}

async function copyImage(row,spec) {
  const src=row.thumbnailLocal?path.join(workspace,'research',spec.dir,row.thumbnailLocal):row.thumbnailPath?path.join(workspace,row.thumbnailPath):row.localImagePath?path.join(workspace,row.localImagePath):null;
  if(!src)return null;
  const target=path.join(publicRoot,'assets','thumbnails',safe(row.id)+path.extname(src));
  return copyFile(src,target);
}

let rows=[];
for(const spec of inputSpecs){
  const file=path.join(workspace,'research',spec.dir,spec.file);
  if(!await exists(file)){report.notes.push(`Missing input: ${file}`);continue;}
  const input=await parseJSON(file);report.inputs.push({file:spec.dir+'/'+spec.file,count:input.length});
  for(const original of input){
    const row={...original};
    const kind=kindOf(row), category=categoryOf({...row,kind});
    if(!row.id||!row.name){report.omitted.push({id:row.id,reason:'missing identifier or name'});continue;}
    const bookkeeping=/^(introduction|installation|getting started|changelog|manual installation|configuration|cli|overview|migration|accessibility)$/i.test(row.name)&&!row.codePath&&!row.codeFile;
    if(bookkeeping){report.omitted.push({id:row.id,reason:'documentation bookkeeping'});continue;}
    const codePath=await copyCode(row.codeFile||row.codePath,spec);
    const examples=[];const variants=[];
    for(const [key,list] of [['examples',examples],['variants',variants]]){
      for(const item of row[key]||[]){
        const cp=await copyCode(item.codeFile||item.codePath,spec);
        if(cp)list.push({name:item.name||'Example',codePath:cp});
      }
    }
    const extra=[];
    for(const file of row.additionalCodeFiles||[]){const cp=await copyCode(typeof file==='string'?file:file.codeFile||file.codePath,spec);if(cp)extra.push(cp);}
    const previewPath=row.previewPath?await copyFile(path.join(workspace,'research',spec.dir,row.previewPath),path.join(publicRoot,'previews',safe(row.id)+'.html')):null;
    const localImage=await copyImage(row,spec);
    let availability=codePath?'code':row.availability==='pro'||row.access==='pro'?'pro':'external';
    if(spec.shape==='21st'&&codePath)availability='usage';
    // Keep code bodies outside metadata; enrich each independent code record.
    if(codePath){
      const codeFile=path.join(publicRoot,codePath.slice(1));
      try{
        const code=await parseJSON(codeFile);
        code.examples=examples;code.variants=variants;
        code.additionalCodePaths=extra;
        if(row.usage)code.usage=row.usage;
        code.framework=row.framework||'react';
        if(!code.dependencies&&row.dependencies)code.dependencies=row.dependencies;
        if(!code.registryDependencies&&row.registryDependencies)code.registryDependencies=row.registryDependencies;
        if(spec.shape==='21st')code.usageOnly=true;
        // Simple original registry examples can be rendered; full React Bits docs
        // examples remain separately linked because they require their docs shell.
        if(!code.demoCode&&examples.length&&row.sourceId!=='reactbits'){
          const example=await parseJSON(path.join(publicRoot,examples[0].codePath.slice(1)));
          const file=(example.files||[]).find(f=>/\.(tsx|jsx)$/.test(f.path||'')&&typeof f.content==='string');
          if(file){code.demoCode=file.content;code.demoPath=file.path;}
        }
        await fs.writeFile(codeFile,JSON.stringify(code),'utf8');
      }catch(error){report.notes.push(`Code enrichment skipped ${row.id}: ${error.message}`);}
    }
    const tags=[...new Set([...(row.tags||[]),...(row.framework?[row.framework]:[])])];
    const record={id:row.id,sourceId:row.sourceId,name:row.name,slug:row.slug||safe(row.name).toLowerCase(),description:row.description||'',category,kind,url:row.url||'',...(row.author?{author:row.author}:{}),image:localImage||'',codePath,previewPath,install:row.install||'',tags,availability,license:row.license||(row.sourceId==='reactbits'?'MIT + Commons Clause':['aceternity','21st'].includes(row.sourceId)?'Source terms':'MIT'),...(variants.length?{variants}:{}),...(examples.length?{examples}:{}),...(row.dependencies?.length?{dependencies:row.dependencies}:{}),...(row.featured?{featured:true}:{}),...(row.updated||row.publishedAt?{updated:row.updated||row.publishedAt}:{})};
    Object.defineProperty(record,'_imageUrl',{value:row.image||row.thumbnailUrl||row.thumbnail,enumerable:false});
    Object.defineProperty(record,'_spec',{value:spec,enumerable:false});
    rows.push(record);
  }
}
const seenIds=new Set();
rows=rows.filter(r=>{if(seenIds.has(r.id))return false;seenIds.add(r.id);return true;});

// Reuse already captured 21st assets by exact underlying resource URL.
const manifestFile='C:/Users/jorge/AppData/Local/Temp/browser-use/assets/71eeef63-798c-4f49-9217-e54f617208af/manifest.json';
const originalUrl=u=>{let x=String(u||'');const nested=x.indexOf('/https://');if(nested>=0)x=x.slice(nested+1);return x.split('?')[0];};
const assetsByUrl=new Map();
if(await exists(manifestFile)){
  const manifest=await parseJSON(manifestFile);
  for(const a of manifest.assets||[]){
    if(a.kind==='font'){
      const name=a.name.includes('GeneralSans-Medium')?'GeneralSans-Medium.woff2':a.name.includes('GeneralSans-Semibold')?'GeneralSans-Semibold.woff2':'Inter.woff2';
      await copyFile(a.path,path.join(publicRoot,'assets','fonts',name));
    }else if(a.kind==='image'){
      const output=await copyFile(a.path,path.join(publicRoot,'assets','thumbnails','21st-captured-'+safe(a.id)+path.extname(a.path)));
      if(output)assetsByUrl.set(originalUrl(a.url),output);
    }
  }
}
for(const row of rows)if(!row.image&&row._imageUrl)row.image=assetsByUrl.get(originalUrl(row._imageUrl))||'';

// Download only the real selected 21st preview images, never fake stand-ins.
const downloadImage=async(url,target)=>{
  if(await exists(target))return publicPath(target);
  try{
    const response=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'Mozilla/5.0'}});
    if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw new Error('not an image');
    await fs.writeFile(target,new Uint8Array(await response.arrayBuffer()));
    return publicPath(target);
  }catch{return null;}
};
const selected=rows.filter(r=>r.sourceId==='21st'&&r.featured&&!r.image&&r._imageUrl).slice(0,90);
let cursor=0;
await Promise.all(Array.from({length:8},async()=>{
  while(cursor<selected.length){const row=selected[cursor++];report.imageDownloads.attempted++;const target=path.join(publicRoot,'assets','thumbnails',safe(row.id)+'.webp');const image=await downloadImage(row._imageUrl,target);if(image){row.image=image;report.imageDownloads.downloaded++;}else report.imageDownloads.failed++;}
}));

// Exact long-name matches link equivalent public demos across source indexes.
const byName=new Map();
for(const row of rows)if(row.image&&row.sourceId!=='21st'){
  const key=norm(row.name);if(key.length<9)continue;
  if(!byName.has(key))byName.set(key,[]);byName.get(key).push(row);
}
for(const row of rows)if(row.sourceId==='21st'&&!row.image){
  const candidates=byName.get(norm(row.name))||[];
  const specific=candidates.filter(c=>norm(c.slug)===norm(row.slug));
  const images=new Set(specific.map(c=>c.image));
  if(images.size===1)row.image=specific[0].image;
}

// A captured 21st demo can also represent its original library when both the
// exact component name and the verified original-library author match.
const authorsBySource={magic:['dillionverma','magicui'],aceternity:['manuarora700','user_aceternity'],kokonut:['kokonutd','dorianbaffier'],motion:['ibelick'],tailark:['meschacirung'],reactbits:['davidhdev','reactbits']};
const originalDemoImages=new Map();
for(const captured of rows)if(captured.sourceId==='21st'&&captured.image){
  for(const[sourceId,authors]of Object.entries(authorsBySource))if(authors.includes(captured.author))originalDemoImages.set(sourceId+'|'+norm(captured.name),captured.image);
}
for(const row of rows)if(row.sourceId!=='21st'&&!row.image){
  const exact=originalDemoImages.get(row.sourceId+'|'+norm(row.name));
  if(exact)row.image=exact;
}

// Exact source copyrights, retained independently of catalog data.
for(const spec of inputSpecs){
  const rootDirectory=path.join(workspace,'research',spec.dir);
  for(const entry of await fs.readdir(rootDirectory,{withFileTypes:true})){
    if(entry.isFile()&&/license/i.test(entry.name))await copyFile(path.join(rootDirectory,entry.name),path.join(publicRoot,'licenses',safe(spec.dir)+'-'+entry.name));
  }
  const directory=path.join(workspace,'research',spec.dir,'licenses');
  if(!await exists(directory))continue;
  for(const entry of await fs.readdir(directory,{withFileTypes:true}))if(entry.isFile())await copyFile(path.join(directory,entry.name),path.join(publicRoot,'licenses',safe(spec.dir)+'-'+entry.name));
}
const visualFile=path.join(workspace,'research','visuals','source-summary.json');
const visuals=await exists(visualFile)?await parseJSON(visualFile):[];
const sources=[];
for(const [id,name,url,description,color]of sourceInfo){
  const iconUrl=id==='21st'?'https://21st.dev/favicon.ico':visuals.find(v=>v.id===id)?.icons?.[0];
  const ext=iconUrl?path.extname(new URL(iconUrl).pathname)||'.png':'.png';
  const icon=iconUrl?await downloadImage(iconUrl,path.join(publicRoot,'assets','sources',id+ext)):null;
  const items=rows.filter(r=>r.sourceId===id);
  sources.push({id,name,url,description,count:items.length,codeCount:items.filter(r=>r.availability==='code').length,icon:icon||'',color});
}

const esbuild=path.join(appRoot,'node_modules','esbuild-wasm','esbuild.wasm');
if(await exists(esbuild))await copyFile(esbuild,path.join(publicRoot,'assets','esbuild.wasm'));
else report.notes.push('esbuild.wasm is not installed yet. Rerun this importer after npm install.');

const coverage={...report,total:rows.length,codeCount:rows.filter(r=>r.availability==='code').length,usageCount:rows.filter(r=>r.availability==='usage').length,previewCount:rows.filter(r=>r.previewPath).length,localImageCount:rows.filter(r=>r.image).length,exampleCount:rows.filter(r=>r.examples?.length).length,variantCount:rows.filter(r=>r.variants?.length).length,bySource:sources.map(s=>({...s,usageCount:rows.filter(r=>r.sourceId===s.id&&r.availability==='usage').length,previewCount:rows.filter(r=>r.sourceId===s.id&&r.previewPath).length,imageCount:rows.filter(r=>r.sourceId===s.id&&r.image).length})),availability:Object.fromEntries(['code','usage','external','pro'].map(a=>[a,rows.filter(r=>r.availability===a).length])),definitions:{code:'Original source files are stored locally; dependency resolution may still be required to render.',usage:'Original usage snippet is stored, component implementation is not included.',external:'Public catalog metadata; implementation is not stored.',pro:'Public commercial catalog listing; private or paid source is not stored.'},limits:['The index combines observed public catalogs, not private account databases.','Local source availability is not proof that every source can run in the same framework without adaptation.','Tailark totals include Base UI/Radix variants, kits and supporting TSX components.','21st entries include public listings plus selected public previews and usage snippets.','Public paid listings are identifiable and never represented as locally available implementations.']};
await fs.writeFile(path.join(publicRoot,'data','catalog.json'),JSON.stringify(rows));
await fs.writeFile(path.join(publicRoot,'data','sources.json'),JSON.stringify(sources));
await fs.writeFile(path.join(publicRoot,'data','coverage.json'),JSON.stringify(coverage,null,2));
await fs.writeFile(path.join(publicRoot,'data','IMPORT.md'),`# UNION UI catalog import\n\nRun \`node scripts/import-catalog.mjs\` from union-ui.\n\n${rows.length} public catalog entries across nine sources. ${coverage.codeCount} include original local source; ${coverage.usageCount} include usage snippets only. ${coverage.previewCount} retained HTML previews; ${coverage.localImageCount} entries have exact local images. Code remains in independent JSON files, with original copyright notices under /licenses. See coverage.json for provenance and availability definitions.\n`);
console.log(JSON.stringify({total:coverage.total,codeCount:coverage.codeCount,usageCount:coverage.usageCount,previewCount:coverage.previewCount,localImageCount:coverage.localImageCount,bySource:coverage.bySource.map(s=>({id:s.id,count:s.count,code:s.codeCount,images:s.imageCount})),downloads:coverage.imageDownloads,notes:coverage.notes},null,2));
