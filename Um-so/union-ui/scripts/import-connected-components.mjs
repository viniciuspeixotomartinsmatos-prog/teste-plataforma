import fs from 'node:fs/promises';
import path from 'node:path';
const raw='../research/connected-components';
const catalog=JSON.parse(await fs.readFile('public/data/catalog.json','utf8'));
const expanded=JSON.parse(await fs.readFile('public/data/preview-expansion.json','utf8'));
const patches={};
await fs.mkdir('public/code/connected',{recursive:true});
for(const file of await fs.readdir(raw)){
 if(!file.endsWith('.json'))continue;
 const data=JSON.parse(await fs.readFile(path.join(raw,file),'utf8'));
 if(!data.componentCode||!data.demoCode)continue;
 const found=expanded.find(x=>x.demoId===data.id);const item=catalog.find(x=>x.id===found?.id);if(!item)continue;
 const dependencies=data.registryDependencies?.filesWithRegistry||{};
 const files=Object.entries(dependencies).filter(([,f])=>typeof f?.code==='string').map(([p,f])=>({path:p.replace(/^\//,''),content:f.code}));
 const localImports=[...data.demoCode.matchAll(/from\s*["'](@\/[^"']+)["']/g)].map(m=>m[1].slice(2));
 const main=localImports.find(p=>!files.some(f=>f.path.replace(/\.[jt]sx?$/,'')===p))||'components/ui/'+item.slug;
 files.unshift({path:/\.[jt]sx?$/.test(main)?main:main+'.tsx',content:data.componentCode});
 const packages=new Set(Object.keys(data.registryDependencies?.npmDependencies||{}));
 for(const file of [...files,{content:data.demoCode}])for(const match of file.content.matchAll(/from\s*["']([^"']+)["']/g)){const p=match[1];if(!p.startsWith('.')&&!p.startsWith('@/'))packages.add(p.startsWith('@')?p.split('/').slice(0,2).join('/'):p.split('/')[0]);}
 const codePath='/code/connected/'+item.id+'.json';
 await fs.writeFile('public'+codePath,JSON.stringify({name:item.name,files,demoCode:data.demoCode,dependencies:[...packages],license:item.license,framework:'react',retrievedVia:'connected-component-retrieval'}));
 patches[item.id]={codePath,availability:'code',dependencies:[...packages]};
}
await fs.writeFile('public/data/catalog-connected.json',JSON.stringify(patches));
console.log(JSON.stringify({fullSourcePackages:Object.keys(patches).length}));
