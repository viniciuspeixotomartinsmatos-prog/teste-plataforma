import test from 'node:test';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {readCreatorFile,creatorDraftZip} from '../src/creator-files.js';

const file=(name,text)=>{const bytes=new TextEncoder().encode(text);return{name,size:bytes.length,arrayBuffer:async()=>bytes.buffer};};
test('source import preserves UTF-8 as inert text and rejects binary, oversized and unsupported files',async()=>{
 const source='<template><h1>Criação original</h1></template><script>throw Error("never execute")</script>';
 assert.deepEqual(await readCreatorFile(file('original.vue',source)),{source,filename:'original.vue',framework:'vue'});
 for(const value of [file('payload.exe','text'),file('large.jsx','x'.repeat(64001)),file('null.js','a\0b'),{name:'invalid.ts',size:1,arrayBuffer:async()=>new Uint8Array([255]).buffer},{name:'huge.jsx',size:256001,arrayBuffer:()=>{throw Error('must reject before reading');}}])await assert.rejects(readCreatorFile(value));
});
test('version exports reflect published and withdrawn lifecycle without changing original source or license',()=>{
 const source={name:'Version',filename:'demo.jsx',source:'export default ()=>null',license:'MIT',analysis:{score:100}};
 for(const status of ['approved','withdrawn']){
  const files=unzipSync(creatorDraftZip(source,{id:'version-id',version:2,status}));
  const metadata=JSON.parse(strFromU8(files['draft.json']));assert.equal(metadata.status,status);assert.equal(metadata.analysis,undefined);
  assert.equal(strFromU8(files['LICENSE-NOTES.txt']),'MIT');
  const readme=strFromU8(files['README.md']);assert.ok(status==='approved'?readme.includes('publicada após revisão'):readme.includes('retirada'));
 }
});
test('draft ZIP preserves exact source and declared license without traversal or a false verified status',()=>{
 const source='export default()=>"<script>inert</script>"',license='Original author license — preserve this text';
 const files=unzipSync(creatorDraftZip({id:'own',name:'Criação',filename:'../../payload.jsx',source,license,author:'Original',dependencies:['react@19'],status:'published'}));
 const names=Object.keys(files);assert.equal(names.length,4);assert.ok(names.every(name=>!name.split('/').includes('..')));
 assert.equal(strFromU8(files[names.find(name=>name.startsWith('source/'))]),source);assert.equal(strFromU8(files['LICENSE-NOTES.txt']),license);
 const metadata=JSON.parse(strFromU8(files['draft.json']));assert.equal(metadata.status,'draft');assert.equal(metadata.source,source);assert.match(strFromU8(files['README.md']),/Não representa publicação nem aprovação técnica/);assert.match(strFromU8(files['README.md']),/react@19/);
});
