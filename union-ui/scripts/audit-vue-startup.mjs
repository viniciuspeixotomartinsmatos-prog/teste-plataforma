import fs from 'node:fs/promises';
import {JSDOM,VirtualConsole} from 'jsdom';
import {createCanvas,Path2D,ImageData} from '@napi-rs/canvas';
import {getCatalog} from '../server/preview-catalog.mjs';
import {compileItem} from '../server/preview-service.mjs';

const catalog=(await getCatalog()).items;
const readiness=JSON.parse(await fs.readFile('public/data/preview-readiness.json','utf8'));
const prior=process.argv.includes('--retry-failed')?JSON.parse(await fs.readFile('../research/vue-startup-audit.json','utf8')).results:[];
const selected=readiness.items.filter(x=>x.framework==='vue'&&x.status==='ready'&&x.hasDemo&&catalog.find(r=>r.id===x.id)?.kind!=='icon'&&(!prior.length||prior.some(p=>p.id===x.id&&!p.passed&&!p.limited)));
const results=prior.filter(x=>x.passed||x.limited);
for(const item of selected){
 let dom;const errors=[];const messages=[];
 try{
  const {js}=await compileItem(item.id,{cache:false});
  const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e.message));
  dom=new JSDOM('<!doctype html><html class="dark"><body><div id="root"></div></body></html>',{url:'http://localhost:4173/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole});
  const w=dom.window;
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
  w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
  w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLElement.prototype.scrollTo=()=>{};
  w.Element.prototype.getAnimations=()=>[];
  w.Element.prototype.animate=()=>({finished:Promise.resolve(),cancel(){},finish(){},play(){},pause(){},playState:'finished',currentTime:0});
  w.HTMLElement.prototype.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,right:1000,bottom:700,width:1000,height:700});
  w.Range.prototype.getBoundingClientRect=w.HTMLElement.prototype.getBoundingClientRect;
  w.Range.prototype.getClientRects=()=>[];
  for(const [key,value]of[['offsetWidth',1000],['clientWidth',1000],['offsetHeight',700],['clientHeight',700]])Object.defineProperty(w.HTMLElement.prototype,key,{get:()=>value});
  w.SVGElement.prototype.getBBox=()=>({x:0,y:0,width:24,height:24});
  w.SVGGeometryElement=w.SVGElement;
  w.SVGElement.prototype.getTotalLength=()=>24;
  w.SVGElement.prototype.getPointAtLength=x=>({x,y:0});
  w.document.elementFromPoint=()=>w.document.activeElement||w.document.body;
  w.URL.createObjectURL=()=>'blob:dom-test';w.URL.revokeObjectURL=()=>{};
  w.fetch=(url,options={})=>{const controller=new AbortController();if(options.signal?.aborted)controller.abort();else options.signal?.addEventListener('abort',()=>controller.abort());return fetch(new URL(url,w.location.href),{...options,signal:AbortSignal.any([controller.signal,AbortSignal.timeout(5000)])});};
  w.Path2D=Path2D;w.ImageData=ImageData;
  Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async()=>{}}});
  const canvases=new WeakMap(),contexts=new WeakMap();
  w.HTMLCanvasElement.prototype.getContext=function(kind){
   if(kind!=='2d')throw Error('DOM audit does not provide a GPU context');
   if(!canvases.has(this))canvases.set(this,createCanvas(1000,700));
   if(!contexts.has(this)){
    const element=this,ctx=canvases.get(this).getContext('2d');
    contexts.set(this,new Proxy(ctx,{get(target,key){if(key==='canvas')return element;if(key==='drawImage'||key==='createPattern')return(source,...args)=>target[key](canvases.get(source)||source,...args);const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;},set(target,key,value){Reflect.set(target,key,value,target);return true;}}));
   }
   return contexts.get(this);
  };
  w.postMessage=data=>{messages.push(data);if(data.type==='preview-error')errors.push(data.message)};
  w.eval(js);const deadline=Date.now()+3000;while(!messages.some(m=>m.type==='preview-ready')&&!errors.length&&Date.now()<deadline)await new Promise(r=>setTimeout(r,25));
  await new Promise(r=>setTimeout(r,50));
  if(!messages.some(m=>m.type==='preview-ready'))errors.push('Preview did not confirm startup');
  if(!w.document.querySelector('#root')?.children.length)errors.push('No rendered content');
  const limited=errors.some(e=>e==='DOM audit does not provide a GPU context')&&errors.every(e=>/DOM audit does not provide a GPU context|Preview did not confirm startup|No rendered content/.test(e));
  results.push({id:item.id,passed:errors.length===0,limited,errors});
 }catch(error){results.push({id:item.id,passed:false,errors:[error.errors?.map(e=>e.text).join('; ')||error.message]});}
 finally{dom?.window.close();}
 if(results.at(-1).errors.length)console.log('FAIL',item.id,JSON.stringify(results.at(-1).errors));
 if(results.length%20===0)console.log(results.length+'/'+selected.length);
}
const report={checkedAt:new Date().toISOString(),environment:'JSDOM with real 2D canvas backend and standard web API shims. Does not verify visual layout, browser networking or GPU output.',passed:results.filter(x=>x.passed).length,limited:results.filter(x=>x.limited).length,failed:results.filter(x=>!x.passed&&!x.limited).length,results};
await fs.writeFile('../research/vue-startup-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({checked:results.length,checkedThisRun:selected.length,passed:report.passed,limited:report.limited,failed:report.failed}));
if(report.failed)process.exitCode=1;
