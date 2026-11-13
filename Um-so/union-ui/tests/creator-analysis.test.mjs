import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeCreator} from '../server/creator-analysis.mjs';

test('analysis compiles supported examples without running submitted code and reports bounded evidence',()=>{
 const docs={description:'Counter',installation:'Import the component',requirements:'React 19',author:'Test',license:'MIT'};
 const result=analyzeCreator({...docs,framework:'react',source:'import React from "react";globalThis.__nitidoUntrustedExecuted=true;export default function Demo(){return <button>OK</button>}'});
 assert.equal(result.passed,true);assert.equal(result.score,100);assert.equal(globalThis.__nitidoUntrustedExecuted,undefined);assert.match(result.sourceSha256,/^[a-f0-9]{64}$/);
 assert.equal(analyzeCreator({...docs,framework:'vue',source:'<script setup>import {ref} from "vue";const n=ref(0)</script><template><button @click="n++">{{n}}</button></template>'}).passed,true);
 assert.equal(analyzeCreator({...docs,framework:'html',source:'<button>Try me</button><script>document.querySelector("button").onclick=()=>{}</script>'}).passed,true);
 for(const draft of [
  {framework:'react',source:'export default function ('},
  {framework:'react',source:'import x from "unknown-package";export default x'},
  {framework:'react',source:'export default ()=>{fetch("https://example.com");return <p>Hi</p>}'},
  {framework:'html',source:'<script src="https://example.com/x.js"></script>'},
  {framework:'html',filename:'style.css',source:'body{color:red}'},
  {framework:'html',source:'<meta http-equiv="refresh" content="0;url=https://example.com"><p>Bye</p>'}
 ])assert.equal(analyzeCreator(draft).passed,false,JSON.stringify(draft));
});
