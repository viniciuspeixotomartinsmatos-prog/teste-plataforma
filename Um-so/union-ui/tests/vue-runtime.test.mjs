import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM,VirtualConsole} from 'jsdom';
import {compileItem} from '../server/preview-service.mjs';

async function until(condition,timeout=5000){const deadline=Date.now()+timeout;while(!condition()){assert.ok(Date.now()<deadline,'Vue preview did not reach the expected state');await new Promise(r=>setTimeout(r,20));}}
async function preview(id){
 const {js,framework,hasDemo}=await compileItem(id,{cache:false});
 assert.equal(framework,'vue');assert.ok(hasDemo);
 const errors=[],messages=[],console=new VirtualConsole();
 console.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM('<!doctype html><html class="dark"><body><div id="root"></div></body></html>',{url:'http://localhost:4173/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:console});
 const w=dom.window;
 w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
 w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
 w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.Element.prototype.getAnimations=()=>[];
 w.Element.prototype.animate=()=>({finished:Promise.resolve(),cancel(){},finish(){},play(){},pause(){},playState:'finished',currentTime:0});
 w.HTMLElement.prototype.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,right:600,bottom:400,width:600,height:400});
 w.SVGElement.prototype.getBBox=()=>({x:0,y:0,width:24,height:24});
 w.document.elementFromPoint=()=>w.document.activeElement||w.document.body;
 w.postMessage=data=>{messages.push(data);if(data.type==='preview-error')errors.push(data.message)};
 w.eval(js);await until(()=>messages.some(x=>x.type==='preview-ready')||errors.length>0);
 assert.deepEqual(errors,[]);
 return{dom,w,errors};
}

test('Vue animated icon mounts original SVG and its pause control updates state',async()=>{
 const {dom,w,errors}=await preview('animate-vue-hugeicons-accessibility');
 try{assert.ok(w.document.querySelector('#root svg path'));const button=w.document.querySelector('button');assert.equal(button.dataset.playing,'true');button.click();await until(()=>button.dataset.playing==='false');assert.equal(button.textContent,'Reproduzir animação');assert.deepEqual(errors,[]);}finally{dom.window.close();}
});

test('Vue tabs select a different panel and preserve ARIA state',async()=>{
 const {dom,w,errors}=await preview('animate-vue-primitives-animate-ui-tabs');
 try{const tab=[...w.document.querySelectorAll('[role=tab]')].find(t=>t.textContent==='Analytics');assert.ok(tab);tab.click();await until(()=>tab.getAttribute('aria-selected')==='true');assert.ok(w.document.body.textContent.includes('3,240'));assert.deepEqual(errors,[]);}finally{dom.window.close();}
});

test('Vue dialog opens original form and closes through Cancel',async()=>{
 const {dom,w,errors}=await preview('animate-vue-primitives-reka-ui-dialog');
 try{const open=[...w.document.querySelectorAll('button')].find(t=>t.textContent.trim()==='Open Dialog');assert.ok(open);open.click();await until(()=>w.document.querySelector('[role=dialog]'));assert.equal(w.document.querySelector('#name-1').value,'Pedro Duarte');const cancel=[...w.document.querySelectorAll('[role=dialog] button')].find(t=>t.textContent.trim()==='Cancel');assert.ok(cancel);cancel.click();await until(()=>!w.document.querySelector('[role=dialog]')||open.getAttribute('aria-expanded')==='false');assert.deepEqual(errors,[]);}finally{dom.window.close();}
});

test('Vue one-time password demo resolves its barrel and displays typed digits',async()=>{
 const {dom,w,errors}=await preview('animate-vue-primitives-animate-ui-input-otp');
 try{const input=w.document.querySelector('input');assert.ok(input);input.focus();input.value='123456';input.dispatchEvent(new w.Event('input',{bubbles:true}));await until(()=>w.document.querySelector('#root').textContent.replace(/\s/g,'').includes('123456'));assert.deepEqual(errors,[]);}finally{dom.window.close();}
});
