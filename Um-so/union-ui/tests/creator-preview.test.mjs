import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import * as compiler from 'esbuild';
import {creatorPreview} from '../src/creator-preview.js';

test('React and Vue source compile and handle a click with packaged local runtimes',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async url=>new Response(await readFile('public'+url));
 try{
   for(const [framework,source] of [
     ['react','import React,{useState} from "react"; export default function Demo(){const [n,set]=useState(0);return <button onClick={()=>set(n+1)}>{n}</button>}'],
     ['vue','<script setup>import {ref} from "vue";const n=ref(0)</script><template><button @click="n++">{{n}}</button></template>']
   ]){
     const html=await creatorPreview({framework,source},AbortSignal.timeout(10000),async()=>compiler);
     assert.ok(html.includes("default-src 'none'"));
     const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://synthetic.example/'});
     try{
       await new Promise(resolve=>setTimeout(resolve,100));
       const button=dom.window.document.querySelector('button');
       assert.equal(button?.textContent,'0',framework);
       button.click();await new Promise(resolve=>setTimeout(resolve,40));assert.equal(button.textContent,'1',framework);
     }finally{dom.window.close();}
   }
 }finally{globalThis.fetch=original;}
});
