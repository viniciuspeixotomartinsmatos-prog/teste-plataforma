import fs from 'node:fs/promises';
let updated=0;
for(const file of await fs.readdir('public/code/runtime')){
 if(!file.startsWith('animate-vue-')||!file.endsWith('.json'))continue;
 const target='public/code/runtime/'+file;
 const payload=JSON.parse(await fs.readFile(target,'utf8'));
 const dependencies=new Set(['vue',...(payload.dependencies||[])]);
 for(const source of payload.files||[])for(const match of source.content.matchAll(/\b(?:from|import)\s*['"]([^'"]+)['"]/g)){
  const name=match[1];if(name.startsWith('.')||name.startsWith('@/')||name.startsWith('union-vue-'))continue;
  dependencies.add(name.match(/^(@[^/]+\/[^/]+|[^/]+)/)[1]);
 }
 payload.dependencies=[...dependencies];
 await fs.writeFile(target,JSON.stringify(payload));updated++;
}
console.log(JSON.stringify({updated}));
