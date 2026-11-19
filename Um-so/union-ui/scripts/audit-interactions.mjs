import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {JSDOM,VirtualConsole} from 'jsdom';
import {compileItem} from '../server/preview-service.mjs';

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const cases=[
 {id:'motion-accordion',run:async(w)=>{const button=w.document.querySelector('button');assert.ok(button);button.click();await wait(150);assert.equal(button.getAttribute('aria-expanded'),'true');button.click();await wait(150);assert.equal(button.getAttribute('aria-expanded'),'false');}},
 {id:'reactbits--stepper',run:async(w)=>{const buttons=()=>[...w.document.querySelectorAll('button')];const next=buttons().find(x=>/continue|next/i.test(x.textContent));assert.ok(next);const before=w.document.body.textContent;next.click();await wait(350);assert.notEqual(w.document.body.textContent,before);}},
 {id:'animate-primitives-animate-ui-tabs',run:async(w)=>{const tab=[...w.document.querySelectorAll('[role=tab]')].find(x=>x.textContent==='Analytics');assert.ok(tab);tab.click();await wait(250);assert.equal(tab.getAttribute('aria-selected'),'true');}},
 {id:'kokonut-switch-button',run:async(w)=>{const button=w.document.querySelector('button');assert.ok(button);const before=w.document.documentElement.className;button.click();await wait(150);assert.notEqual(w.document.documentElement.className,before);}},
 {id:'shadcnblocks-block-data-table1',run:async(w)=>{const button=w.document.querySelector('thead button');assert.ok(button);const before=w.document.querySelector('tbody').textContent;button.click();await wait(150);if(w.document.querySelector('tbody').textContent===before){button.click();await wait(150);}assert.notEqual(w.document.querySelector('tbody').textContent,before);}},
];
const results=[];
for(const entry of cases){
 const errors=[];let dom;
 try{
  const built=await compileItem(entry.id,{cache:false});
  const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',error=>errors.push(error.message));
  dom=new JSDOM('<!doctype html><html class="dark" data-theme="dark"><body><div id="root"></div></body></html>',{url:'http://localhost:4173/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole});
  const w=dom.window;
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
  w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.scrollTo=()=>{};
  w.Element.prototype.getAnimations=()=>[];
  w.Element.prototype.animate=()=>({finished:Promise.resolve(),cancel(){},finish(){},play(){},pause(){},playState:'finished',currentTime:0});
  w.HTMLElement.prototype.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,right:600,bottom:400,width:600,height:400});
  w.postMessage=data=>{if(data.type==='preview-error')errors.push(data.message)};
  w.eval(built.js);await wait(220);
  assert.deepEqual(errors,[],'initial render');
  await entry.run(w);
  assert.deepEqual(errors,[],'interaction');
  results.push({id:entry.id,passed:true});console.log('PASS',entry.id);
 }catch(error){results.push({id:entry.id,passed:false,error:error.message,errors});console.log('FAIL',entry.id,error.message,errors);}
 finally{dom?.window.close();}
}
await fs.writeFile('../research/interaction-audit.json',JSON.stringify({checkedAt:new Date().toISOString(),environment:'JSDOM, actual compiled React components; not a browser or visual audit',results},null,2));
if(results.some(x=>!x.passed))process.exitCode=1;
