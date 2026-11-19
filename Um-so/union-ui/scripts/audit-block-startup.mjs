import fs from 'node:fs/promises';
import {JSDOM,VirtualConsole} from 'jsdom';
import {compileItem} from '../server/preview-service.mjs';

const overrides=JSON.parse(await fs.readFile('public/data/runtime-overrides.json','utf8'));
const prior=process.argv.includes('--failed-only')?JSON.parse(await fs.readFile('../research/block-startup-audit.json','utf8')).results:[];
const ids=Object.keys(overrides).filter(id=>id.startsWith('shadcnblocks-block-')&&(!prior.length||prior.some(x=>x.id===id&&!x.passed)));
const results=prior.filter(x=>x.passed);
for(const id of ids){
 let dom;const errors=[];
 try{
  const {js}=await compileItem(id,{cache:false});
  const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e.message));
  dom=new JSDOM('<!doctype html><html class="dark" data-theme="dark"><body><div id="root"></div></body></html>',{url:'http://localhost:4173/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole});
  const w=dom.window;
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
  w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
  w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.Element.prototype.getAnimations=()=>[];
  w.Element.prototype.animate=()=>({finished:Promise.resolve(),cancel(){},finish(){},play(){},pause(){},playState:'finished',currentTime:0});
  w.HTMLElement.prototype.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,right:1000,bottom:700,width:1000,height:700});
  w.URL.createObjectURL=()=>'blob:dom-test';w.URL.revokeObjectURL=()=>{};
  w.postMessage=data=>{if(data.type==='preview-error')errors.push(data.message)};
  w.eval(js);await new Promise(r=>setTimeout(r,100));
  if(!w.document.querySelector('#root')?.children.length)errors.push('No rendered content');
  results.push({id,passed:errors.length===0,errors});
 }catch(error){results.push({id,passed:false,errors:[error.errors?.map(x=>x.text).join('; ')||error.message]});}
 finally{dom?.window.close();}
 if(results.at(-1).errors.length)console.log('FAIL',id,JSON.stringify(results.at(-1).errors));
 if(results.length%20===0)console.log(results.length+'/'+ids.length);
}
const report={checkedAt:new Date().toISOString(),environment:'JSDOM startup audit; layout, GPU rendering and remote media require separate browser verification',passed:results.filter(x=>x.passed).length,failed:results.filter(x=>!x.passed).length,results};
await fs.writeFile('../research/block-startup-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({checked:ids.length,passed:report.passed,failed:report.failed}));
if(report.failed)process.exitCode=1;
