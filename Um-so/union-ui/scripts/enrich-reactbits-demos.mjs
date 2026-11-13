import fs from 'node:fs/promises';
import path from 'node:path';
import {parse} from '@babel/parser';
const tree=JSON.parse(await fs.readFile('../research/catalog-a/reactbits-tree.json','utf8')).tree;
const catalog=JSON.parse(await fs.readFile('public/data/catalog.json','utf8'));
const paths=tree.filter(x=>x.path.startsWith('src/constants/code/')&&x.path.endsWith('Code.js')).map(x=>x.path);
const cache='../research/catalog-a/usage';await fs.mkdir(cache,{recursive:true});
const normalize=x=>x.toLowerCase().replace(/[^a-z0-9]/g,'');
const byName=new Map(paths.map(p=>[normalize(path.basename(p).replace(/Code\.js$/,'')),p]));
const output={},failures=[];let cursor=0;
const rows=catalog.filter(x=>x.sourceId==='reactbits'&&x.availability==='code');
await Promise.all(Array.from({length:5},async()=>{while(cursor<rows.length){const item=rows[cursor++];try{
 const remote=byName.get(normalize(item.name))||byName.get(normalize(item.slug));if(!remote)continue;
 const local=path.join(cache,path.basename(remote));let content;try{content=await fs.readFile(local,'utf8');}catch{const response=await fetch('https://raw.githubusercontent.com/DavidHDev/react-bits/main/'+remote,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('HTTP '+response.status);content=await response.text();await fs.writeFile(local,content);}
 const ast=parse(content,{sourceType:'module',plugins:['jsx','typescript']});let usage;
 const visit=node=>{if(!node||typeof node!=='object')return;if(node.type==='ObjectProperty'&&(node.key.name||node.key.value)==='usage'){const v=node.value;if(v.type==='TemplateLiteral'&&!v.expressions.length)usage=v.quasis[0].value.cooked;if(v.type==='StringLiteral')usage=v.value;}for(const value of Object.values(node)){if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')visit(value);}};visit(ast);
 if(!usage)throw Error('No static documented usage');
 const example=parse(usage,{sourceType:'module',plugins:['jsx','typescript']});const imports=[],body=[],views=[];
 for(const node of example.program.body){const text=usage.slice(node.start,node.end);if(node.type==='ImportDeclaration')imports.push(text);else if(node.type==='ExpressionStatement'&&['JSXElement','JSXFragment'].includes(node.expression.type))views.push(usage.slice(node.expression.start,node.expression.end));else body.push(text);}
 if(!views.length)throw Error('No JSX usage view');
 const entry=`import * as React from 'react';\n${imports.join('\n')}\nexport default function DocumentedDemo(){\n${body.join('\n')}\nreturn <div style={{width:'100%',minHeight:'100vh',display:'grid',placeItems:'center',position:'relative',padding:${item.category==='Backgrounds'?'0':'24'}}}>${views.join('\n')}</div>;\n}`;
 output[item.id]={entry,entryPath:'documented-usage/'+item.slug+'.tsx',files:[],kind:'documented-usage',originalUsage:usage};
 }catch(error){failures.push({id:item.id,reason:error.message});}}}));
await fs.writeFile('public/data/reactbits-demos.json',JSON.stringify(output));
await fs.writeFile('../research/catalog-a/usage-failures.json',JSON.stringify(failures,null,2));
console.log(JSON.stringify({examples:Object.keys(output).length,unavailable:failures.length}));
