import fs from 'node:fs/promises';
import {compileItem} from '../server/preview-service.mjs';
const rows=JSON.parse(await fs.readFile('public/data/preview-readiness.json','utf8')).items.filter(x=>x.status==='ready'&&x.hasDemo&&x.previewPath?.startsWith('/previews/runtime/'));
let cursor=0,count=0,errors=[];
await Promise.all(Array.from({length:2},async()=>{while(cursor<rows.length){const row=rows[cursor++];try{await fs.access('public/code/runtime/'+row.id+'.json');}catch{try{await compileItem(row.id,{persist:true,cache:false});count++;}catch(error){errors.push({id:row.id,error:error.errors?.map(e=>e.text).join('; ')||error.message});}}}}));
await fs.writeFile('../research/export-failures.json',JSON.stringify(errors,null,2));console.log(JSON.stringify({packages:count,failures:errors.length}));
