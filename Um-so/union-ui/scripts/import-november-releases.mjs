// Incremental import of the public releases retained during the daily check.
// Original source notices remain in technical packages. This script does not
// claim browser validation; perform that separately before committing publication.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const research='../research',pending=research+'/source-checks';
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const write=async(file,value)=>{await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(value,null,2)+'\n');};
const manifest=await read(pending+'/pending-manifest-2026-11-04.json');
for(const item of manifest.files){const bytes=await fs.readFile(path.join(pending,item.file));if(bytes.length!==item.bytes||crypto.createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('Retained source changed: '+item.file);}

const candidates=await read(pending+'/profitize-candidates-2026-11-04.json');
const capture=await read(research+'/profitize/catalog.json');
for(const candidate of candidates){
 if(!['argila','lavri','skeleton','colina'].includes(candidate.slug)||candidate.item?.slug!==candidate.slug||candidate.item.type!=='landing_page'||!candidate.media.some(media=>media.kind==='video'&&media.status===200))throw Error('Unexpected landing-page metadata');
 if(!capture.some(item=>item.slug===candidate.slug))capture.push({...candidate.item,demoUrl:null,captureFile:'public-detail-2026-11-04',acquisitionDate:'2026-11-04'});
 for(const media of candidate.media){if(!media.url.startsWith('/build/media/')||media.url.includes('..'))throw Error('Invalid media path');const source=pending+'/pending/profitize/'+candidate.slug+'/'+path.basename(media.url),target='public/previews/recovered'+media.url;await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(source,target);}
}
await write(research+'/profitize/catalog.json',capture);

const source=await read(pending+'/pending/magic/dither-field.json');
const names=manifest.files.filter(item=>item.file.startsWith('pending/magic/')).map(item=>path.basename(item.file,'.json'));
const exampleNames=['dither-field-demo',...names.filter(name=>name!=='dither-field'&&name!=='dither-field-demo')];
const examples=exampleNames.map(name=>({name,codePath:'/code/a/magic/'+name+'.json'}));
for(const name of names){const record=await read(pending+'/pending/magic/'+name+'.json');await write('public/code/a/magic/'+name+'.json',{...record,framework:'react',license:'MIT'});await write(research+'/catalog-a/code/magic/'+name+'.json',record);}
const demo=await read(pending+'/pending/magic/dither-field-demo.json');
const utils={path:'lib/utils.ts',content:'import {clsx, type ClassValue} from "clsx";\nimport {twMerge} from "tailwind-merge";\nexport function cn(...values:ClassValue[]){return twMerge(clsx(values));}\n',type:'registry:lib'};
await write('public/code/a/magic/dither-field.json',{...source,files:[...source.files,utils],dependencies:['clsx','tailwind-merge'],framework:'react',license:'MIT',examples,demoCode:demo.files[0].content,demoPath:demo.files[0].path});
const item={id:'magic--dither-field',sourceId:'magic',name:source.title,slug:source.name,description:source.description,category:'Backgrounds',kind:'component',url:'https://magicui.design/docs/components/dither-field',image:'',codePath:'/code/a/magic/dither-field.json',previewPath:null,install:'npx shadcn@latest add "https://magicui.design/r/dither-field.json"',tags:['React','TypeScript','Tailwind CSS','WebGL2','Dither'],availability:'code',framework:'react',license:'MIT',dependencies:['clsx','tailwind-merge'],examples,updated:'2026-11-04'};
const catalog=await read('public/data/catalog.json');const position=catalog.findIndex(row=>row.id===item.id);if(position<0)catalog.push(item);else catalog[position]=item;await fs.writeFile('public/data/catalog.json',JSON.stringify(catalog));
for(const name of ['catalog-light','catalog']){const file=research+'/catalog-a/'+name+'.json',rows=await read(file);const original={...item,category:'backgrounds',codeFile:'code/magic/dither-field.json',examples:exampleNames.map(name=>({name,codeFile:'code/magic/'+name+'.json'}))};delete original.codePath;delete original.previewPath;if(name==='catalog')original.files=source.files;const index=rows.findIndex(row=>row.id===item.id);if(index<0)rows.push(original);else rows[index]=original;await write(file,rows);}

// Import compiler only after catalog writes: its catalog is cached per process.
const {compileItem}=await import('../server/preview-service.mjs');
const result=await compileItem(item.id,{cache:false,persist:true});
const readiness=await read('public/data/preview-readiness.json');
readiness.items=readiness.items.filter(row=>row.id!==item.id);readiness.items.push({id:item.id,sourceId:'magic',status:'ready',previewPath:result.previewPath,bytes:result.bytes,framework:'react',hasDemo:result.hasDemo,entry:result.entry,sourceFileCount:result.sourceFileCount});
readiness.generatedAt=new Date().toISOString();readiness.totalCatalog=catalog.length;readiness.totalCode=catalog.filter(row=>row.availability==='code').length;readiness.checked=readiness.items.length;readiness.ready=readiness.items.filter(row=>row.status==='ready').length;readiness.blocked=readiness.items.filter(row=>row.status==='blocked').length;await fs.writeFile('public/data/preview-readiness.json',JSON.stringify(readiness));
const live=await read('public/data/catalog-live.json'),published={...item,previewPath:result.previewPath,runtimePreviewPath:result.previewPath,originalCodePath:item.codePath,codePath:'/code/runtime/'+item.id+'.json',publicSlug:'dither-field-'+crypto.createHash('sha1').update(item.id).digest('hex').slice(0,6)},liveIndex=live.findIndex(row=>row.id===item.id);if(liveIndex<0)live.push(published);else live[liveIndex]=published;await fs.writeFile('public/data/catalog-live.json',JSON.stringify(live));
const sources=await read('public/data/sources.json');for(const row of sources)if(row.id==='magic'){row.count=catalog.filter(item=>item.sourceId==='magic').length;row.codeCount=catalog.filter(item=>item.sourceId==='magic'&&item.availability==='code').length;}await fs.writeFile('public/data/sources.json',JSON.stringify(sources));
console.log(JSON.stringify({profitizeObserved:capture.length,ditherPreview:result.previewPath,originalExamples:exampleNames.length,bytes:result.bytes}));
