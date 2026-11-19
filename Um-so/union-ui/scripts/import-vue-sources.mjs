import fs from 'node:fs/promises';
import path from 'node:path';
const rows=JSON.parse(await fs.readFile('public/data/catalog.json','utf8'));
const patches=JSON.parse(await fs.readFile('public/data/catalog-connected.json','utf8'));
const workspace=path.resolve('..'),repo=path.join(workspace,'research/catalog-c/animate-repo');
let recovered=0;
for(const row of rows.filter(r=>r.sourceId==='animate'&&r.slug.startsWith('vue/')&&r.availability!=='code'&&!r.slug.endsWith('/index'))){
 const doc=await fs.readFile(path.join(repo,'apps/v2/content/docs',row.slug+'.mdx'),'utf8');
 const name=doc.match(/<VueComponentPreview\b[^>]*\bname="([^"]+)"/)?.[1];if(!name)continue;
 const demo=path.join(repo,'apps/vue-demos/src/demos',name+'.vue');
 const payload={framework:'vue',files:[{path:path.relative(workspace,demo).replaceAll('\\','/'),content:await fs.readFile(demo,'utf8')}],examples:[],variants:[],additionalCodePaths:[],dependencies:['vue'],provenance:{documentation:row.url||row.originalUrl,originalDemo:name}};
 const codePath='/code/connected/'+row.id+'.json';
 await fs.writeFile('public'+codePath,JSON.stringify(payload));
 patches[row.id]={codePath,availability:'code',framework:'vue',dependencies:['vue']};recovered++;
}
await fs.writeFile('public/data/catalog-connected.json',JSON.stringify(patches));
console.log(JSON.stringify({recovered}));
