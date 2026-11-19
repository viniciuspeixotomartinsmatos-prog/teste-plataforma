import test from 'node:test';import assert from 'node:assert/strict';import {JSDOM} from 'jsdom';import React,{act,useState} from 'react';import {createRoot} from 'react-dom/client';import {useDrawerFocus} from '../src/useDrawerFocus.js';
function Fixture(){const [open,setOpen]=useState(false);useDrawerFocus(open,'.drawer',()=>setOpen(false));return React.createElement(React.Fragment,null,React.createElement('button',{id:'trigger',onClick:()=>setOpen(true)},'Abrir'),open&&React.createElement('aside',{className:'drawer'},React.createElement('button',{id:'first'},'Primeiro'),React.createElement('button',{id:'last'},'Último')));}
test('filter drawers contain keyboard focus, close on Escape and restore the trigger',async()=>{
 const dom=new JSDOM('<div id="root"></div>');globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;const root=createRoot(document.querySelector('#root'));
 try{await act(async()=>root.render(React.createElement(Fixture)));const trigger=document.querySelector('#trigger');trigger.focus();await act(async()=>trigger.click());assert.equal(document.activeElement.id,'first');
 await act(async()=>document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true})));assert.equal(document.activeElement.id,'last');
 await act(async()=>document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true})));assert.equal(document.activeElement.id,'first');
 await act(async()=>document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})));assert.equal(document.querySelector('.drawer'),null);assert.equal(document.activeElement,trigger);
 }finally{await act(async()=>root.unmount());dom.window.close();}
});
