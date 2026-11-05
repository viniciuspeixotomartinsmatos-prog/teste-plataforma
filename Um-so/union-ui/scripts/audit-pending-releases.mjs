// Acquisition validation only. Never marks a demo runnable or publishes it.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {parse} from '@babel/parser';
const date=process.argv[2];if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))throw Error('Supply YYYY-MM-DD');
const root=path.resolve('../research/source-checks/releases',date),hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const report={checkedAt:new Date().toISOString(),date,published:0,components:[],themes:[],files:[],limitations:['Syntax and retained-file integrity only. Imports, package dependencies, media decoding, browser rendering, interactions, prompts and portable exports require separate validation.']};
for(const name of (await fs.readdir(path.join(root,'21st'))).filter(name=>name.endsWith('.json'))){
 const data=JSON.parse(await fs.readFile(path.join(root,'21st',name),'utf8')),component=data.component;
 if(!component?.isPublic||!component.componentCode||!component.demoCode)throw Error('Missing public source or example: '+name);
 const errors=[],sources=[['component',component.componentCode],['demo',component.demoCode]];
 for(const [file,record]of Object.entries(component.registryDependencies?.filesWithRegistry||{}))if(typeof record?.code==='string')sources.push([file,record.code]);
 for(const [kind,source]of sources){try{parse(source,{sourceType:'module',plugins:['typescript','jsx']});}catch(error){errors.push({kind,error:error.message});}}
 report.components.push({id:component.id,name:component.name,url:data.metadata.url,sourceCount:sources.length,syntaxErrors:errors,published:false});
}
for(const name of await fs.readdir(path.join(root,'themes'))){const data=JSON.parse(await fs.readFile(path.join(root,'themes',name),'utf8'));if(!data.theme?.css?.includes(':root'))throw Error('Theme CSS missing: '+name);report.themes.push({id:data.theme.id,name:data.theme.name,published:false});}
async function walk(folder){for(const entry of await fs.readdir(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())await walk(file);else if(entry.name!=='integrity.json'){const bytes=await fs.readFile(file);report.files.push({file:path.relative(root,file).replaceAll('\\','/'),bytes:bytes.length,sha256:hash(bytes)});}}}
await walk(root);await fs.writeFile(path.join(root,'integrity.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({components:report.components.length,themes:report.themes.length,syntaxFailures:report.components.filter(item=>item.syntaxErrors.length).length,retainedFiles:report.files.length,published:0}));
