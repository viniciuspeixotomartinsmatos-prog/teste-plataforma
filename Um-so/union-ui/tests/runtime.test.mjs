import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createCanvas} from '@napi-rs/canvas';
import {compileItem,previewHTML} from '../server/preview-service.mjs';
import {instrumentPreviewHTML} from '../src/preview-document.js';
import {createSourceContext} from '../server/preview-catalog.mjs';
async function waitFor(condition,timeout=5000){
 const deadline=Date.now()+timeout;
 while(!condition()){
  assert.ok(Date.now()<deadline,'preview did not reach its expected state');
  await new Promise(resolve=>setTimeout(resolve,25));
 }
}

test('stylesheet imports resolve the CSS file when a component has the same basename',async()=>{
 const context=await createSourceContext({id:'resolver-regression',name:'Widget',slug:'widget',sourceId:'reactbits'}, {files:[{path:'Widget.tsx',content:'import "./Widget.css";export default function Widget(){return <div className="widget"/>}'},{path:'Widget.css',content:'.widget{height:400px;background:red}'}]});
 const css=await context.resolveSource('./Widget.css','Widget.tsx');
 assert.equal(css.path,'Widget.css');assert.match(css.content,/height:400px/);
});

test('retained previews report startup and errors instead of accepting iframe load as success',async()=>{
 const html=instrumentPreviewHTML('<!doctype html><html><head></head><body><div id="root"><button>Play</button></div></body></html>','retained-example','http://localhost/previews/example.html');
 const messages=[];
 const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.postMessage=data=>messages.push(data);}});
 try{await waitFor(()=>messages.some(m=>m.type==='preview-ready'&&m.id==='retained-example'));dom.window.dispatchEvent(new dom.window.ErrorEvent('error',{message:'Example failure'}));assert.ok(messages.some(m=>m.type==='preview-error'&&m.message==='Example failure'));assert.equal(dom.window.document.baseURI,'http://localhost/previews/example.html');}finally{dom.window.close();}
});

test('native preview bundles original source and local dependencies',async()=>{
 const result=await compileItem('magic--particles',{cache:false});
 assert.ok(result.hasDemo);assert.ok(result.bytes>100000);
 const html=previewHTML({name:'Particles',category:'Backgrounds'},result,'light');
 assert.ok(html.includes('/api/preview-bundle/'+result.key+'.js'));
 assert.ok(html.includes('data-theme="light"'));assert.ok(!html.includes('esm.sh'));
 await assert.rejects(()=>compileItem('missing-component'),/not found/i);
});

test('Particles draws requested count, responds to cursor and applies live settings',async()=>{
 const {js}=await compileItem('magic--particles',{cache:false});
 const dom=new JSDOM('<!doctype html><html data-theme="dark"><body><div id="root"></div></body></html>',{url:'http://localhost:4173/',runScripts:'dangerously',pretendToBeVisual:true});
 const w=dom.window,messages=[],contexts=[];
 w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
 w.postMessage=data=>messages.push(data);
 for(const [key,value] of [['offsetWidth',1000],['offsetHeight',600]])Object.defineProperty(w.HTMLElement.prototype,key,{get:()=>value});
 w.HTMLElement.prototype.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,right:1000,bottom:600,width:1000,height:600});
 const canvases=new WeakMap();
 w.HTMLCanvasElement.prototype.getContext=function(){
  if(canvases.has(this))return canvases.get(this).proxy;
  const canvas=createCanvas(1000,600),ctx=canvas.getContext('2d'),state={count:0,translations:[],canvas};
  state.proxy=new Proxy(ctx,{get(target,key){if(key==='clearRect')return(...args)=>{state.count=0;state.translations=[];return target.clearRect(...args)};if(key==='arc')return(...args)=>{state.count++;return target.arc(...args)};if(key==='translate')return(x,y)=>{state.translations.push([x,y]);return target.translate(x,y)};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;},set(target,key,value){Reflect.set(target,key,value,target);return true;}});
  canvases.set(this,state);contexts.push(state);return state.proxy;
 };
 try{
  w.eval(js);await waitFor(()=>messages.some(x=>x.type==='preview-ready'||x.type==='preview-error'));
  assert.ok(messages.some(x=>x.type==='preview-ready'));assert.ok(!messages.some(x=>x.type==='preview-error'),JSON.stringify(messages));
  assert.equal(contexts.at(-1).count,180,'quantity matches actual draw calls');
  const before=contexts.at(-1).translations.reduce((n,p)=>n+p[0],0);
  w.dispatchEvent(new w.MouseEvent('mousemove',{clientX:850,clientY:450}));await waitFor(()=>contexts.at(-1).translations.reduce((n,p)=>n+p[0],0)>before+10);
  const after=contexts.at(-1).translations.reduce((n,p)=>n+p[0],0);
  assert.ok(after>before+10,'cursor changes actual particle translations');
  w.dispatchEvent(new w.MessageEvent('message',{data:{type:'preview:set-props',props:{quantity:42,color:'#ff0000',size:2}}}));await waitFor(()=>contexts.at(-1).count===42);
  assert.equal(contexts.at(-1).count,42,'live quantity reaches canvas');
  const pixels=contexts.at(-1).canvas.getContext('2d').getImageData(0,0,1000,600).data;
  assert.ok(pixels.some((value,index)=>index%4===3&&value>0),'canvas contains pixels');
 }finally{w.close();}
});
