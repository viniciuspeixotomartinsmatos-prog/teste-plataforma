// Build styles only for an unapproved source release. Retained source remains inert.
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {approvedReleaseRows} from './lib/release-evidence.mjs';
const date=process.argv[2];if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))throw Error('Invalid release date');
const root=process.cwd(),folder=path.resolve('../research/source-checks/releases',date),staged=JSON.parse(await fs.readFile(path.join(folder,'21st-staged-catalog.json'),'utf8'));
const approved=await approvedReleaseRows('public'),items=staged.filter(item=>!approved.some(row=>row.sourceId==='21st'&&row.previewPath===item.previewPath&&row.url===item.url));
const published=JSON.parse(await fs.readFile('public/data/catalog-live.json','utf8'));
const sources=path.resolve('var/release-style-sources',date);await fs.mkdir(sources,{recursive:true});
for(const item of items){if(!/^staged-21st-\d+$/.test(item.id))throw Error('Invalid staged ID');if(published.some(row=>row.previewPath===item.previewPath||row.id===item.id))throw Error('Published preview cannot be restyled without new validation');const payload=JSON.parse(await fs.readFile('public'+item.codePath,'utf8'));await fs.writeFile(path.join(sources,item.id+'.tsx'),(payload.files||[]).map(file=>file.content||'').join('\n')+'\n'+(payload.demoCode||''));}
const template=await fs.readFile('styles/preview.css','utf8');if(!template.includes('@source "../.preview-sources";'))throw Error('Style template shape changed');
const input='styles/release-'+date+'.css',output='var/release-styles-'+date+'.css';await fs.writeFile(input,template.replace('@source "../.preview-sources";','@source "../var/release-style-sources/'+date+'";'));
const result=spawnSync(process.execPath,['node_modules/@tailwindcss/cli/dist/index.mjs','-i',input,'-o',output,'--minify'],{cwd:root,stdio:'pipe'});if(result.status!==0)throw Error(result.stderr.toString());
const css=await fs.readFile(output),hash=createHash('sha256').update(css).digest('hex'),pointer='/assets/releases/'+date+'/21st-examples-'+hash.slice(0,16)+'.css';await fs.mkdir(path.dirname('public'+pointer),{recursive:true});await fs.writeFile('public'+pointer,css);
for(const item of items)for(const file of [item.previewPath,item.previewPath.replace(/\.html$/,'.light.html')]){let html=await fs.readFile('public'+file,'utf8');html=html.replace(/<link rel="stylesheet" data-release-styles="true" href="[^"]+">/g,'');html=html.replace('</head>','<link rel="stylesheet" data-release-styles="true" href="'+pointer+'"></head>');await fs.writeFile('public'+file,html);}
await fs.writeFile(path.join(folder,'21st-style-report.json'),JSON.stringify({checkedAt:new Date().toISOString(),items:items.length,css:pointer,sha256:hash,bytes:css.length,scope:'Original source-class coverage for staged examples only. Browser acceptance is separate.'},null,2)+'\n');console.log(JSON.stringify({items:items.length,css:pointer,bytes:css.length}));
