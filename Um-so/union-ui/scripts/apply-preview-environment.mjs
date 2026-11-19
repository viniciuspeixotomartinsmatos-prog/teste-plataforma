import fs from 'node:fs/promises';
import path from 'node:path';
import {injectPreviewEnvironment} from '../src/preview-environment.js';
const rows=JSON.parse(await fs.readFile('public/data/catalog-live.json','utf8'));let changed=0;
for(const item of rows){const preview=item.runtimePreviewPath||item.previewPath;for(const file of [preview,...(preview.startsWith('/previews/runtime/')?[preview.replace(/\.html$/,'.light.html')]:[])]){const target=path.join('public',file);const html=await fs.readFile(target,'utf8');let next=injectPreviewEnvironment(html);next=next.replace(/<link\b[^>]*href=["']\/vite\.svg["'][^>]*>/g,'');if(next!==html){await fs.writeFile(target,next);changed++;}}}
console.log('Preview environments repaired:',changed);
