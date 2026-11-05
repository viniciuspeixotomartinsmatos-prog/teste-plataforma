import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const file=path.resolve('public/data/preview-expansion.json');
const rows=JSON.parse(await fs.readFile(file,'utf8'));
const pending=rows.filter(r=>!r.previewPath&&r.previewUrl);
const directory=path.resolve('public/previews/expanded');
await fs.mkdir(directory,{recursive:true});
let cursor=0,done=0,failed=0,writing=Promise.resolve();
function checkpoint(){const contents=JSON.stringify(rows);writing=writing.then(async()=>{await fs.writeFile(file+'.tmp',contents);await fs.rename(file+'.tmp',file)});return writing;}
await Promise.all(Array.from({length:6},async()=>{
 while(cursor<pending.length){
  const row=pending[cursor++];
  try{
   const url=new URL(row.previewUrl);
   if(url.protocol!=='https:'||url.hostname!=='cdn.21st.dev')throw Error('Unexpected preview host');
   const relative='previews/expanded/'+row.id.replace(/[^\w-]/g,'')+'.html';
   const destination=path.resolve('public',relative);
   let html;try{html=await fs.readFile(destination,'utf8');}catch{}
   if(!html){const response=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!response.ok)throw Error('HTTP '+response.status);html=await response.text();}
   if(!/<(?:!doctype html|html)[\s>]/i.test(html))throw Error('Invalid HTML');
   await fs.writeFile(destination,html);
   Object.assign(row,{previewPath:'/'+relative,bytes:Buffer.byteLength(html),sha256:crypto.createHash('sha256').update(html).digest('hex')});
   delete row.downloadError;
  }catch(error){failed++;row.downloadError=error.message;}
  done++;
  if(done%100===0){await checkpoint();console.log(JSON.stringify({processed:done,total:pending.length,failed}));}
  await new Promise(resolve=>setTimeout(resolve,150));
 }
}));
await checkpoint();console.log(JSON.stringify({downloaded:rows.filter(r=>r.previewPath).length,failed}));
