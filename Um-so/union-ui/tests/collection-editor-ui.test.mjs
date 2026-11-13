import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import React,{act} from 'react';
const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/collections/one'});
globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const {createRoot}=await import('react-dom/client');
await build({entryPoints:['src/CollectionEditor.jsx'],outfile:'var/collection-editor-ui.mjs',bundle:true,format:'esm',platform:'node',packages:'external',loader:{'.css':'empty'},logLevel:'silent'});
const {default:Editor}=await import('../var/collection-editor-ui.mjs');
test('collection editor saves order and metadata, cancels without edits, and requires explicit deletion',async()=>{
 const original={id:'one',name:'Original',description:'Antes',items:['a','b','c']};let saved,removed,closed=0;const root=createRoot(document.querySelector('#root'));
 const render=async()=>act(async()=>root.render(React.createElement(Editor,{collection:original,rows:original.items.map(id=>({id,name:id.toUpperCase()})),onSave:value=>saved=value,onDelete:id=>removed=id,onClose:()=>closed++})));
 const click=async label=>act(async()=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent===label||b.getAttribute('aria-label')===label);assert.ok(button,label);button.click();});
 const fill=async(selector,value)=>act(async()=>{const input=document.querySelector(selector),setter=Object.getOwnPropertyDescriptor(input.tagName==='TEXTAREA'?dom.window.HTMLTextAreaElement.prototype:dom.window.HTMLInputElement.prototype,'value').set;setter.call(input,value);input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});
 try{await render();await click('Subir 2');await click('Remover item 3');await fill('#edit-collection-name','Novo nome');await fill('#edit-collection-description','Descrição <script>texto</script>');await act(async()=>document.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));assert.equal(saved.name,'Novo nome');assert.equal(saved.description,'Descrição <script>texto</script>');assert.deepEqual(saved.items,['b','a']);assert.deepEqual(original.items,['a','b','c']);assert.equal(document.querySelector('script'),null);await click('Fechar editor');assert.equal(closed,1);assert.equal(removed,undefined);await click('Excluir coleção');assert.equal(removed,undefined);await click('Manter coleção');assert.equal(removed,undefined);await click('Excluir coleção');await click('Confirmar exclusão da coleção');assert.equal(removed,'one');}finally{await act(async()=>root.unmount());dom.window.close();}
});
