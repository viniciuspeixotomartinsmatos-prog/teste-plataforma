import fs from 'node:fs/promises';
import path from 'node:path';
import {parse} from '@babel/parser';
const root=path.resolve('../research/reactbits-tools');
const tree=JSON.parse(await fs.readFile('../research/catalog-a/reactbits-tree.json','utf8')).tree;
const known=new Set(tree.filter(x=>x.type==='blob').map(x=>x.path));
const seen=new Set(),failed=[];
const queue=[...known].filter(x=>x.startsWith('src/tools/')&&!/\.test\./.test(x));
queue.push('studio-frame.html','shape-frame.html','src/css/fonts.css','src/styles.css','public/center-stage.js');
for(const file of known)if(/^src\/demo\/[^/]+\/presets\/.*\.js$/.test(file))queue.push(file);
for(const file of known)if(/^public\/assets\/(studio|texture-lab|shape-magic|center-stage)\//.test(file))queue.push(file);
for(const file of known)if(/^src\/constants\/code\/(Backgrounds|Animations)\/.*Code\.js$/.test(file)||/^src\/css\/.*\.css$/.test(file))queue.push(file);
function resolve(imported,from){
 const clean=imported.split('?')[0];
 const aliased=clean.match(/^@(content|tailwind|ts-default|ts-tailwind)\/(.*)/);
 const base=aliased?'src/'+aliased[1]+'/'+aliased[2]:clean.startsWith('@/')?'src/'+clean.slice(2):path.posix.normalize(path.posix.join(path.posix.dirname(from),clean));
 return[base,base+'.jsx',base+'.js',base+'.ts',base+'.tsx',base+'.css',base+'/index.jsx',base+'/index.js',base+'/index.ts'].find(x=>known.has(x));
}
async function get(file){const local=path.join(root,file);try{return await fs.readFile(local,'utf8');}catch{}const r=await fetch('https://raw.githubusercontent.com/DavidHDev/react-bits/main/'+file,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('HTTP '+r.status);const bytes=Buffer.from(await r.arrayBuffer());await fs.mkdir(path.dirname(local),{recursive:true});await fs.writeFile(local,bytes);return bytes.toString('utf8');}
function enqueue(imported,from){if(imported.startsWith('.')||imported.startsWith('@/')||/^@(content|tailwind|ts-default|ts-tailwind)\//.test(imported)){const file=resolve(imported,from);if(file&&!seen.has(file))queue.push(file);else if(!file)failed.push({file:from,imported});}}
while(queue.length){
 const file=queue.shift();if(seen.has(file))continue;seen.add(file);
 try{
  const code=await get(file);
  if(/\.[jt]sx?$/.test(file)){
   const ast=parse(code,{sourceType:'module',plugins:['jsx','typescript']});
   function visit(node){if(!node||typeof node!=='object')return;
    if(['ImportDeclaration','ExportNamedDeclaration','ExportAllDeclaration'].includes(node.type)&&node.source)enqueue(node.source.value,file);
    if(node.type==='CallExpression'&&node.callee.type==='Import'&&node.arguments[0]?.type==='StringLiteral')enqueue(node.arguments[0].value,file);
    if(node.type==='NewExpression'&&node.callee.name==='URL'&&node.arguments[0]?.type==='StringLiteral')enqueue(node.arguments[0].value,file);
    if(node.type==='StringLiteral'&&node.value.startsWith('/assets/')&&known.has('public'+node.value))queue.push('public'+node.value);
    for(const value of Object.values(node)){if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')visit(value);}
   }visit(ast);
  }else if(file.endsWith('.css'))for(const match of code.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)){const url=match[1];if(url.startsWith('/')&&known.has('public'+url))queue.push('public'+url);else if(url.startsWith('.'))enqueue(url,file);}
  else if(file.endsWith('.html'))for(const match of code.matchAll(/src="\/(src\/[^" ]+)"/g))queue.push(match[1]);
 }catch(error){failed.push({file,error:error.message});}
 if(seen.size%50===0)console.log('Imported',seen.size);
}
await fs.writeFile(path.join(root,'dependency-report.json'),JSON.stringify({imported:seen.size,failed},null,2));
console.log(JSON.stringify({imported:seen.size,unresolved:failed.length,failures:failed.slice(0,10)}));
