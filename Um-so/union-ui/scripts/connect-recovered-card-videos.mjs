import fs from 'node:fs/promises';
import path from 'node:path';
import {connectRecoveredCardVideos} from './lib/recovered-card-video.mjs';
const originals=JSON.parse(await fs.readFile('../research/profitize/catalog.json','utf8'));
const pending=[];
for(const file of ['catalog.json','catalog-live.json']){
 const target=path.resolve('public/data',file),rows=JSON.parse(await fs.readFile(target,'utf8'));
 const changed=await connectRecoveredCardVideos(rows,originals,path.resolve('public'));
 pending.push({target,rows,changed});
}
// Validate both inventories before changing either; keep existing IDs and content.
for(const {target,rows,changed}of pending)if(changed.length)await fs.writeFile(target,JSON.stringify(rows));
console.log(JSON.stringify(pending.map(({target,changed})=>({file:path.basename(target),count:changed.length,ids:changed}))));
