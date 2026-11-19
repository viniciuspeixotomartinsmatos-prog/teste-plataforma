import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {framePreview} from '../src/preview-framing.js';

const root = path.resolve('public');
const output = path.join(root,'assets','thumbnails','framed');
const metadataPath = path.join(root,'data','catalog-framing-media.json');
const catalog = JSON.parse(await fs.readFile(path.join(root,'data','catalog-live.json'),'utf8'));
const args = process.argv.slice(2);
const capture = args.includes('--capture');
const refresh = args.includes('--refresh');
const ids = new Set(args.filter(value=>!['--capture','--refresh'].includes(value)));
if (!ids.size) throw new Error('Informe os IDs a processar. Use --capture apenas para demos locais interativas.');
const selected = catalog.filter(item=>ids.has(item.id));
if (selected.length!==ids.size) throw new Error('Um ou mais IDs não existem no catálogo publicado.');
let metadata = {};
try {metadata=JSON.parse(await fs.readFile(metadataPath,'utf8'));}
catch(error){if(error.code!=='ENOENT')throw error;}
await fs.mkdir(output,{recursive:true});

const playwright = process.env.PREVIEW_PLAYWRIGHT_MODULE;
const browser = capture ? await (await import(playwright?pathToFileURL(playwright).href:'playwright-core')).chromium.launch({
 executablePath:process.env.PREVIEW_BROWSER_EXECUTABLE
}) : null;
if(capture&&!/^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(process.env.PREVIEW_CAPTURE_ORIGIN||'')){
 await browser.close();
 throw new Error('Defina PREVIEW_CAPTURE_ORIGIN para um servidor de prévias isolado em localhost.');
}

async function captureDemo(item) {
 if (item.recoveryMode==='recorded-video'||item.recoveryMode?.includes('reference')) return null;
 const viewport = item.category==='Heroes' ? {width:1440,height:810} : {width:1280,height:720};
 const context=await browser.newContext({viewport,reducedMotion:'reduce'});
 try {
  const origin=process.env.PREVIEW_CAPTURE_ORIGIN;
  await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  const page=await context.newPage();
  const response=await page.goto(new URL(item.runtimePreviewPath||item.previewPath,origin).href,{waitUntil:'load',timeout:20000});
  if(!response?.ok())throw new Error('A demo não abriu no servidor de captura.');
  await page.evaluate(()=>Promise.race([
   Promise.all([document.fonts.ready,Promise.allSettled([...document.images].map(image=>image.decode()))]),
   new Promise(resolve=>setTimeout(resolve,4500))
  ]));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const region=await page.evaluate(()=>{
   const visible=[...document.querySelectorAll('h1,h2,p,a,button,img,video,[role="button"]')].map(element=>element.getBoundingClientRect())
    .filter(rect=>rect.width>10&&rect.height>8&&rect.left>=0&&rect.top>=0&&rect.right<=innerWidth&&rect.bottom<=innerHeight);
   if(!visible.length)return;
   return {left:Math.min(...visible.map(rect=>rect.left))/innerWidth,top:Math.min(...visible.map(rect=>rect.top))/innerHeight,
    right:Math.max(...visible.map(rect=>rect.right))/innerWidth,bottom:Math.max(...visible.map(rect=>rect.bottom))/innerHeight};
  });
  return {bytes:await page.screenshot({animations:'disabled',timeout:15000}),region};
 } finally {await context.close();}
}

function backgroundColor(image) {
 const canvas=createCanvas(24,24),context=canvas.getContext('2d');
 context.drawImage(image,0,0,24,24);
 const pixels=context.getImageData(0,0,24,24).data;
 const points=[[1,1],[1,12],[1,22],[22,1],[22,12],[22,22]].map(([x,y])=>[...pixels.slice((24*y+x)*4,(24*y+x)*4+4)]);
 if(points.some(point=>point[3]<250))return;
 const average=[0,1,2].map(channel=>Math.round(points.reduce((sum,point)=>sum+point[channel],0)/points.length));
 if(points.some(point=>average.some((value,channel)=>Math.abs(value-point[channel])>35)))return;
 return '#'+average.map(value=>value.toString(16).padStart(2,'0')).join('');
}

async function processItem(item) {
 const previous=metadata[item.id];
 if(!refresh&&previous?.source===(item.image||null)&&(!capture||previous.captured)){
  const present=await Promise.all(previous.variants.map(variant=>fs.access(path.join(root,variant.src)).then(()=>true,()=>false)));
  if(present.every(Boolean)){console.log(item.id,'reaproveitado');return;}
 }
 const captured=browser&&await captureDemo(item);
 const source=item.image?.startsWith('/assets/')&&path.resolve(root,'.'+item.image);
 if(!captured&&(!source||!source.startsWith(path.join(root,'assets')+path.sep)))return;
 const bytes=captured?.bytes||await fs.readFile(source);
 const hash=createHash('sha256').update(item.id).update(bytes).digest('hex').slice(0,24);
 const image=await loadImage(bytes),size={width:image.width,height:image.height};
 const color=backgroundColor(image);
 const previewFraming={background:color?'sampled':'neutral',color,region:captured?.region};
 const frame=framePreview({...item,previewFraming},size);
 const variants=[];
 for(const width of [...new Set([Math.min(480,image.width),Math.min(960,image.width)])]){
  const name=hash+'-'+width+'.webp',destination=path.join(output,name);
  try {await fs.access(destination);}
  catch {
   const canvas=createCanvas(width,Math.max(1,Math.round(image.height*width/image.width)));
   canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
   await fs.writeFile(destination,await canvas.encode('webp',84));
  }
  variants.push({src:'/assets/thumbnails/framed/'+name,width});
 }
 metadata[item.id]={source:item.image||null,captured:Boolean(captured),size,previewFraming,review:frame.review,variants};
 console.log(item.id,frame.fit,frame.review?'revisar':'enquadrado',variants.map(variant=>variant.width).join('/'));
}

let index=0;
try {
 const workers=Array.from({length:Math.min(2,selected.length)},async()=>{
  while(index<selected.length)await processItem(selected[index++]);
 });
 const results=await Promise.allSettled(workers);
 const failed=results.find(result=>result.status==='rejected');
 if(failed)throw failed.reason;
 await fs.writeFile(metadataPath,JSON.stringify(Object.fromEntries(Object.entries(metadata).sort(([a],[b])=>a.localeCompare(b))),null,2)+'\n');
} finally {await browser?.close();}
