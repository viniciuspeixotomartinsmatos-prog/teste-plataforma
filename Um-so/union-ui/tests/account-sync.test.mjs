import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {useAccountWorkspace} from '../src/account.js';
test('a queued local edit survives an overlapping remote conflict without dropping remote favorites',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost:4173'});
 for(const key of ['window','document','localStorage'])globalThis[key]=dom.window[key];
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 let server={saved:['a'],collections:[]},revision=1,putCount=0,release;
 const response=(data,status=200)=>({ok:status<400,status,json:async()=>structuredClone(data)});
 globalThis.fetch=async(url,options={})=>{
  if(url==='/api/auth/get-session')return response({user:{id:'one',name:'Um',email:'one@example.test'}});
  if(url==='/api/access')return response({canExport:true});
  if(url==='/api/workspace'&&options.method!=='PUT')return response({data:server,revision});
  if(url==='/api/workspace'){
   if(++putCount===1)return new Promise(resolve=>{release=()=>resolve(response({error:'Conflito',code:'revision_conflict'},409));});
   const input=JSON.parse(options.body);if(input.revision!==revision)return response({error:'Conflito'},409);
   server=input.data;revision++;return response({data:server,revision});
  }
  throw Error('Unexpected request');
 };
 let account;function Harness(){account=useAccountWorkspace();return React.createElement('output',null,account.saved.join(','));}
 const root=createRoot(document.getElementById('root'));
 const wait=ms=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,ms));});
 try{
  await act(async()=>root.render(React.createElement(Harness)));await wait(30);assert.deepEqual(account.saved,['a']);
  await act(async()=>account.setSaved(['a','b']));await wait(500);assert.equal(putCount,1);
  await act(async()=>account.setSaved(['a','b','c']));await wait(500);
  server={saved:['a','remote'],collections:[]};revision=2;
  await act(async()=>release());await wait(50);await wait(500);
  assert.deepEqual(new Set(account.saved),new Set(['a','b','c','remote']));
  assert.deepEqual(new Set(server.saved),new Set(['a','b','c','remote']));assert.equal(account.sync,'saved');
 }finally{await act(async()=>root.unmount());dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
