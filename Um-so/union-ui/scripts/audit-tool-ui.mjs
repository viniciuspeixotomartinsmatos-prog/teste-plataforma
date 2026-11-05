import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {JSDOM,VirtualConsole} from 'jsdom';
import webAudio from 'web-audio-engine';
const html=await fs.readFile('public/tools-runtime/umso.html','utf8'),entry=html.match(/<script[^>]+src="([^"]+)"/)?.[1];
if(!entry)throw Error('Build the tools first.');
const bundled=await build({entryPoints:[path.resolve('public'+entry)],bundle:true,write:false,platform:'browser',format:'iife',loader:{'.css':'empty'},logLevel:'silent',plugins:[{name:'local-runtime',setup(api){api.onResolve({filter:/^\/tools-runtime\//},args=>({path:path.resolve('public'+args.path)}));}}]});
const tool=process.argv[2]||'sound-lab';if(!['sound-lab','background-studio'].includes(tool))throw Error('Unsupported UI audit case');
const errors=[],messages=[],downloads=[];let clipboard='';
const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>{if(!/Not implemented: (HTMLCanvasElement|navigation)/.test(e.message))errors.push(e.message);});
const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'http://localhost:4173/tools-runtime/umso.html?tool='+tool+'&theme=dark',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole}),w=dom.window;
w.matchMedia=query=>({matches:/min-width: (1024|1280)px/.test(query),addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
w.OfflineAudioContext=webAudio.OfflineAudioContext;w.AudioBuffer=webAudio.api.AudioBuffer;w.AudioContext=webAudio.RenderingAudioContext;
w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.structuredClone=structuredClone;
w.HTMLElement.prototype.scrollIntoView=()=>{};w.scrollTo=()=>{};
w.HTMLCanvasElement.prototype.getContext=()=>null;
const append=w.Node.prototype.appendChild;w.Node.prototype.appendChild=function(node){const result=append.call(this,node);if(node.tagName==='LINK'&&node.rel==='stylesheet')setTimeout(()=>node.dispatchEvent(new w.Event('load')),0);return result;};
w.HTMLElement.prototype.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,right:1000,bottom:700,width:1000,height:700});
w.URL.createObjectURL=blob=>{downloads.push(blob);return'blob:tool-test';};w.URL.revokeObjectURL=()=>{};
w.fetch=async value=>{const url=new URL(value,w.location.href);const text=await fs.readFile('public'+url.pathname,'utf8');return{ok:true,text:async()=>text};};
Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async text=>{clipboard=text;}}});
w.addEventListener('message',event=>messages.push(event.data));
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try{
 w.eval(bundled.outputFiles[0].text);
 for(let i=0;i<60&&!messages.some(m=>m.type==='tool-ready')&&!errors.length;i++)await wait(100);
 assert.deepEqual(errors,[]);assert.ok(messages.some(m=>m.type==='tool-ready'),'tool reports mounted UI: '+w.document.querySelector('#root')?.innerHTML.slice(-400));
 if(tool==='sound-lab'){
 assert.ok(w.document.querySelector('.snd-title')?.textContent,'sound title rendered');
 assert.ok(w.document.querySelectorAll('.snd-tile').length||w.document.querySelectorAll('.snd-tile').length,'sound library rendered');
 const initial=w.document.querySelector('.snd-title').textContent;
 const soundButtons=[...w.document.querySelectorAll('button')].filter(b=>b.className.includes('snd-tile'));
 if(soundButtons.length>1){soundButtons.find(b=>!b.textContent.includes(initial))?.click();await wait(100);assert.notEqual(w.document.querySelector('.snd-title').textContent,initial);}
 }
 w.document.querySelector(tool==='sound-lab'?'.snd-export':'.bs-export').click();
 for(let i=0;i<30&&!w.document.querySelector('.um-code-export');i++)await wait(100);
 assert.ok(w.document.querySelector('[role="dialog"]'),'export dialog opens');
 const copy=[...w.document.querySelectorAll('button')].find(b=>b.textContent==='Copiar prompt completo');assert.ok(copy);copy.click();await wait(50);assert.ok(clipboard.includes(tool==='sound-lab'?'react-bits-sound':'Topography'));assert.ok(clipboard.includes('Example.jsx'));
 const zip=[...w.document.querySelectorAll('button')].find(b=>b.textContent==='Baixar arquivos .zip');assert.ok(zip);zip.click();await wait(100);assert.equal(downloads.length,1);assert.ok(downloads[0].size>10000);
 assert.deepEqual(errors,[]);
 console.log('PASS: '+tool+' production UI mounts, opens code export, copies complete files and prepares a ZIP in JSDOM. GPU rendering, iframe shaders and browser playback are not covered.');
}finally{dom.window.close();}
