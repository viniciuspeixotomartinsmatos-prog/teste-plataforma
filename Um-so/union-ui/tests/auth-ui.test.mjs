import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
let appModule;
async function loadApp(){appModule??=(async()=>{await fs.mkdir('var',{recursive:true});await build({entryPoints:['src/App.jsx'],outfile:'var/auth-ui-test.mjs',platform:'node',format:'esm',bundle:true,packages:'external',loader:{'.css':'empty'},logLevel:'silent'});return import('../var/auth-ui-test.mjs');})();return appModule;}

test('direct platform links show login; successful login returns to the requested page; logout hides it',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost:4173/tools'});
 for(const key of ['window','document','history','localStorage','HTMLElement','Node','MutationObserver','Event','MouseEvent'])globalThis[key]=dom.window[key];
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;window.scrollTo=()=>{};
 let user=null,catalogRequests=0;
 const response=(data,status=200)=>({ok:status<400,status,json:async()=>data});
 globalThis.fetch=async(path,options={})=>{
  if(path==='/api/auth/get-session')return response({user});
  if(path==='/api/access')return response({canExport:Boolean(user)});
  if(path==='/api/auth/sign-in/email'){user={id:'one',name:'Teste',email:'one@example.test'};return response({user});}
  if(path==='/api/auth/sign-out'){user=null;return response({ok:true});}
  if(path==='/api/workspace')return response({revision:0,data:{saved:[],collections:[]}});
  if(path==='/data/catalog-live.json'){catalogRequests++;return response([]);}
  return response({},404);
 };
 const {App}=await loadApp();const root=createRoot(document.getElementById('root'));
 const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,50));});
 const click=async element=>{assert.ok(element);await act(async()=>element.dispatchEvent(new MouseEvent('click',{bubbles:true})));await settle();};
 try{
  await act(async()=>root.render(React.createElement(App)));await settle();
  assert.ok(document.querySelector('.auth-card'));assert.equal(document.querySelector('.main-nav'),null);assert.equal(catalogRequests,0);assert.equal(window.location.pathname,'/account');
  await act(async()=>document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));await settle();
  assert.equal(window.location.pathname,'/tools');assert.ok(document.querySelector('.main-nav'));assert.equal(catalogRequests,1);
  await click(document.querySelector('.account-trigger'));
  await click([...document.querySelectorAll('button')].find(el=>el.textContent.includes('Sair da conta')));
  assert.ok(document.querySelector('.auth-card'));assert.equal(document.querySelector('.main-nav'),null);
 }finally{await act(async()=>root.unmount());dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});

test('email confirmation waits for a user click, sends the token only by POST and shows a useful legacy callback error',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost:4173/account?token_hash='+('a'.repeat(64))+'&type=email'}),original=globalThis.fetch;
 for(const key of ['window','document','history','localStorage','HTMLElement','Node','MutationObserver','Event','MouseEvent'])globalThis[key]=dom.window[key];
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 let verified=0,destination;const account={sessionLoading:false,user:null,refreshAccess:async()=>{},refreshSession:async()=>({id:'one',name:'Teste'})};
 globalThis.fetch=async(url,options)=>{assert.equal(url,'/api/auth/verify-email');assert.equal(options.method,'POST');assert.deepEqual(JSON.parse(options.body),{tokenHash:'a'.repeat(64),type:'email'});verified++;return Response.json({ok:true,next:'/'});};
 await build({entryPoints:['src/AccountPage.jsx'],outfile:'var/email-ui-test.mjs',platform:'node',format:'esm',bundle:true,packages:'external',loader:{'.css':'empty'},logLevel:'silent'});
 const {default:AccountPage}=await import('../var/email-ui-test.mjs');const root=createRoot(document.getElementById('root'));
 try{
  const render=async search=>act(async()=>root.render(React.createElement(AccountPage,{account,path:'/account',search,navigate:path=>{destination=path;},notify:()=>{}})));
  await render(window.location.search);assert.equal(verified,0);assert.ok(document.querySelector('button').textContent.includes('Confirmar e continuar'));assert.equal(document.querySelectorAll('input').length,0);
  await act(async()=>document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
  assert.equal(verified,1);assert.equal(destination,'/');
  await render('?auth_error=confirmation_browser');assert.ok(document.querySelector('[role=alert]').textContent.includes('entre com sua senha'));assert.ok(document.querySelector('input[type=password]'));assert.ok([...document.querySelectorAll('button')].some(button=>button.textContent==='Reenviar confirmação'));assert.equal(verified,1);
 }finally{await act(async()=>root.unmount());globalThis.fetch=original;dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});

test('pending signup does not revalidate a missing or stale session and erase its PKCE cookies',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost:4173/account'}),original=globalThis.fetch;
 for(const key of ['window','document','history','localStorage','HTMLElement','Node','MutationObserver','Event','MouseEvent'])globalThis[key]=dom.window[key];globalThis.IS_REACT_ACT_ENVIRONMENT=true;window.scrollTo=()=>{};
 let reads=0,signups=0;globalThis.fetch=async url=>{if(url==='/api/auth/get-session'){reads++;return Response.json({user:null});}if(url==='/api/access')return Response.json({canExport:false});if(url==='/api/auth/sign-up/email'){signups++;return Response.json({verificationRequired:true});}return Response.json({},{status:404});};
 const {App}=await loadApp();const root=createRoot(document.getElementById('root'));
 const settle=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,50));});
 try{
  await act(async()=>root.render(React.createElement(App)));await settle();
  const before=reads;await act(async()=>[...document.querySelectorAll('button')].find(button=>button.textContent==='Criar uma conta').click());
  await act(async()=>document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));await settle();
  assert.equal(signups,1);assert.equal(reads,before);assert.match(document.querySelector('[role=status]').textContent,/Confira seu e-mail/);
 }finally{await act(async()=>root.unmount());globalThis.fetch=original;dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
