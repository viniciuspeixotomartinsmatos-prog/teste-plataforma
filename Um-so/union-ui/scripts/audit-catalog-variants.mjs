import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {frameworkCounterpart,svgGeometry} from './lib/catalog-variant-audit.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const rows=JSON.parse(await fs.readFile(path.join(root,'public/data/catalog-live.json'),'utf8'));
const index=new Map(rows.map(row=>[row.id,row]));
const approved=[],unresolved=[];
async function original(row){
 const relative=row.originalCodePath||row.codePath;
 if(!relative?.startsWith('/code/'))throw Error('Invalid source pointer.');
 const target=path.resolve(root,'public','.'+relative);
 if(!target.startsWith(path.resolve(root,'public/code')+path.sep))throw Error('Source outside catalog.');
 const payload=JSON.parse(await fs.readFile(target,'utf8'));
 return payload.files?.find(file=>row.framework==='vue'?/\.vue$/i.test(file.path):/\.[jt]sx$/i.test(file.path))?.content||'';
}
for(const vue of rows.filter(row=>row.id.startsWith('animate-vue-')&&row.kind==='icon')){
 const react=index.get(vue.id.replace(/^animate-vue-/,'animate-'));
 if(!frameworkCounterpart(react,vue)){unresolved.push({id:vue.id,reason:'counterpart_metadata'});continue;}
 const [a,b]=await Promise.all([original(react),original(vue)]);
 const geometry=svgGeometry(a);
 if(!geometry||geometry!==svgGeometry(b)){unresolved.push({id:vue.id,reason:'geometry_not_proven'});continue;}
 approved.push({slug:react.id.slice('animate-'.length),geometrySha256:createHash('sha256').update(geometry).digest('hex')});
}
approved.sort((a,b)=>a.slug.localeCompare(b.slug));
const report={method:'Matching explicit framework counterparts and static SVG geometry; no runtime-equivalence or license-clearance claim.',approved,unresolved};
await fs.writeFile(path.join(root,'src/catalog-icon-variants.json'),JSON.stringify(approved.map(row=>row.slug),null,2)+'\n');
await fs.mkdir(path.join(root,'var/audits'),{recursive:true});
await fs.writeFile(path.join(root,'var/audits/catalog-framework-variants.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({approved:approved.length,unresolved:unresolved.length}));
