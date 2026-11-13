import fs from 'node:fs/promises';
import path from 'node:path';
import {compileItem} from '../server/preview-service.mjs';
import {injectDemoAssets} from '../src/demo-asset-bridge.js';
import {injectPreviewEnvironment} from '../src/preview-environment.js';
const root=path.resolve('public'),manifest=JSON.parse(await fs.readFile(path.join(root,'data/demo-local-assets.json'),'utf8'));
let changed=[];try{changed=JSON.parse(await fs.readFile('var/audits/native-demo-repairs.json','utf8')).changed;}catch{}
const rebuild=[...new Set([...changed,'magic--backlight','magic--pixel-image','animate-vue-primitives-reka-ui-sidebar','21st-852d57575034'])];let cursor=0;
await Promise.all(Array.from({length:2},async()=>{while(cursor<rebuild.length){const id=rebuild[cursor++];await compileItem(id,{cache:false,persist:true});console.log('Compiled',id);}}));
const rows=JSON.parse(await fs.readFile(path.join(root,'data/catalog-live.json'),'utf8'));let updated=0;
for(const row of rows){const preview=row.runtimePreviewPath||row.previewPath;for(const file of [preview,...(preview.startsWith('/previews/runtime/')?[preview.replace(/\.html$/,'.light.html')]:[])]){const target=path.join(root,file),html=await fs.readFile(target,'utf8'),next=injectPreviewEnvironment(injectDemoAssets(html,manifest.items[row.id]));if(html!==next){await fs.writeFile(target,next);updated++;}}}
await fs.writeFile('var/audits/verification-ids.json',JSON.stringify([...new Set([...Object.keys(manifest.items),...rebuild])]));console.log('Finalized documents:',updated);
