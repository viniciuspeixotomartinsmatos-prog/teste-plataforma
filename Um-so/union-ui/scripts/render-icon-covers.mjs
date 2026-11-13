import fs from 'node:fs/promises';
import {JSDOM,VirtualConsole} from 'jsdom';
const rows=JSON.parse(await fs.readFile('public/data/catalog-live.json','utf8')).filter(r=>r.kind==='icon'&&(!r.image||r.image.startsWith('/assets/thumbnails/icons/')));
await fs.mkdir('public/assets/thumbnails/icons',{recursive:true});
const covers={},failed=[];let done=0;
let cursor=0;await Promise.all(Array.from({length:4},async()=>{while(cursor<rows.length){const row=rows[cursor++];let dom;
 try{
  const cached='/assets/thumbnails/icons/'+row.id+'.svg';let exists=false;try{await fs.access('public'+cached);exists=true;}catch{}if(exists){covers[row.id]={image:cached,mediaKind:'rendered-original-icon'};done++;continue;}
  const html=await fs.readFile('public'+row.previewPath,'utf8'),src=html.match(/<script[^>]+src="([^"]+)"/)?.[1];if(!src)throw Error('Missing local bundle');
  const code=await fs.readFile('public'+src,'utf8');
  dom=new JSDOM('<!doctype html><html class="dark"><body><div id="root"></div></body></html>',{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost:4174/',virtualConsole:new VirtualConsole()});
  const w=dom.window;w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};w.IntersectionObserver=class{observe(){}disconnect(){}};
  w.Element.prototype.getAnimations=()=>[];w.Element.prototype.animate=()=>({finished:Promise.resolve(),cancel(){},play(){},pause(){},finish(){}});
  w.eval(code);for(let attempt=0;attempt<20&&!w.document.querySelector('svg path,svg circle,svg rect,svg line,svg polygon,svg polyline,svg ellipse');attempt++)await new Promise(resolve=>setTimeout(resolve,50));
  const svg=w.document.querySelector('svg');if(!svg||!svg.querySelector('path,circle,rect,line,polyline,polygon,ellipse'))throw Error('No rendered icon geometry');
  svg.setAttribute('x','256');svg.setAttribute('y','160');svg.setAttribute('width','128');svg.setAttribute('height','128');svg.setAttribute('color','#ededf0');
  // Geometry is taken from the mounted original component, not an invented label.
  const image='<svg xmlns="http://www.w3.org/2000/svg" width="640" height="448" viewBox="0 0 640 448"><rect width="640" height="448" fill="#111114"/>'+svg.outerHTML+'</svg>';
  const target='/assets/thumbnails/icons/'+row.id+'.svg';await fs.writeFile('public'+target,image);covers[row.id]={image:target,mediaKind:'rendered-original-icon'};
 }catch(error){failed.push({id:row.id,error:error.message});}finally{dom?.window.close();}
 if(++done%200===0)console.log(JSON.stringify({processed:done,total:rows.length,rendered:Object.keys(covers).length}));
}}));
await fs.writeFile('public/data/icon-covers.json',JSON.stringify(covers));await fs.writeFile('var/media/icon-cover-report.json',JSON.stringify({processed:done,rendered:Object.keys(covers).length,failed},null,2));console.log(JSON.stringify({processed:done,rendered:Object.keys(covers).length,failed:failed.length}));
