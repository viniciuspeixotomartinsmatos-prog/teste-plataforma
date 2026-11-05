import fs from 'node:fs/promises';
import path from 'node:path';
import {parse} from '@babel/parser';
import {injectPreviewEnvironment} from '../src/preview-environment.js';
const rows=JSON.parse(await fs.readFile('public/data/catalog-live.json','utf8')),repaired=[];
for(const row of rows){const file=path.join('public',row.runtimePreviewPath||row.previewPath);let html=await fs.readFile(file,'utf8');if(!html.includes('new Worker')||!html.includes('new Blob'))continue;
 const code=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].sort((a,b)=>b[1].length-a[1].length)[0]?.[1];if(!code||!code.includes('Object.defineProperty'))continue;
 let program;try{program=parse(code,{sourceType:'module'}).program;}catch{continue;}
 let end=0;for(const node of program.body){if(node.type!=='VariableDeclaration')break;const helper=node.declarations.every(declaration=>['ArrowFunctionExpression','FunctionExpression','MemberExpression','Identifier'].includes(declaration.init?.type));if(!helper)break;end=node.end;}
 const bootstrap=code.slice(0,end);if(!bootstrap||!bootstrap.includes('"name"'))continue;
 html=html.replace(/<script data-umso-worker-bootstrap type="application\/json">[\s\S]*?<\/script>/g,'');const metadata='<script data-umso-worker-bootstrap type="application/json">'+JSON.stringify(bootstrap).replace(/</g,'\\u003c')+'</script>';html=html.replace(/<\/head>/i,()=>metadata+'</head>');await fs.writeFile(file,injectPreviewEnvironment(html));repaired.push({id:row.id,bootstrapBytes:bootstrap.length});
}
await fs.writeFile('var/audits/worker-repairs.json',JSON.stringify(repaired,null,2));console.log('Restored serialized worker helpers:',repaired.length);
