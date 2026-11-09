import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
await fs.mkdir('var',{recursive:true});
await build({entryPoints:['src/SiteAuditPage.jsx'],bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},outfile:'var/site-audit-ui-test.mjs',logLevel:'silent'});
const {default:SiteAuditPage}=await import('../var/site-audit-ui-test.mjs');
test('audit UI filters and copies meaningful corrections, keeps owner-isolated history, handles failures and cancels',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/tools/raio-x'});globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.localStorage=dom.window.localStorage;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 let copied='',calls=[];Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async text=>{copied=text;}}}});
 const root=createRoot(document.querySelector('#root')),click=async element=>{assert.ok(element);await act(async()=>element.click());},button=text=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text));
 try{
  await act(async()=>root.render(React.createElement(SiteAuditPage,{owner:'one',navigate:()=>{}})));
  await click(button('Ver um exemplo'));assert.match(document.body.textContent,/DADOS FICTÍCIOS/);assert.equal(localStorage.length,0);
  await click(document.querySelector('.rx-filters button:nth-child(4)'));assert.ok([...document.querySelectorAll('.rx-finding summary')].every(e=>e.textContent.includes('SEO')));
  await click(button('Copiar todas'));assert.match(copied,/Corrija o ponto/);assert.match(copied,/https:\/\/exemplo.nitido.com.br/);
  const fixture=JSON.parse(JSON.stringify({site:{url:'https://example.com/',host:'example.com',title:'Example Domain',description:'',lang:'en',viewport:'width=device-width',robots:'',canonical:null,og:{},h1:['Example'],images:[],scripts:{urls:[]},trackers:[],thirdPartyHosts:[],schema:{count:0,valid:0},found:{},insecure:[],secrets:[],resources:{}},at:new Date().toISOString(),lab:null}));
  globalThis.fetch=async(url,options)=>{calls.push({url,options});return url.endsWith('/site')?Response.json({site:fixture.site}):Response.json({error:'Cota do Google atingida.'},{status:429});};
  const input=document.querySelector('input'),set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;await act(async()=>{set.call(input,'https://example.com');input.dispatchEvent(new window.Event('input',{bubbles:true}));});
  await act(async()=>document.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));
  assert.equal(calls.length,2);assert.match(document.body.textContent,/Medição móvel indisponível/);assert.match(document.body.textContent,/Resultado parcial/);assert.equal(JSON.parse(localStorage.getItem('nitido:site-audit:v1:one'))[0].site.host,'example.com');
  await act(async()=>root.render(React.createElement(SiteAuditPage,{owner:'two',navigate:()=>{}})));await click(button('Histórico'));assert.match(document.body.textContent,/Nenhuma análise salva/);assert.ok(!document.body.textContent.includes('example.com'));
  globalThis.fetch=(_url,{signal})=>new Promise((_,reject)=>{signal.addEventListener('abort',()=>reject(new DOMException('Canceled','AbortError')));});
  await act(async()=>{set.call(document.querySelector('input'),'https://example.com');document.querySelector('input').dispatchEvent(new window.Event('input',{bubbles:true}));document.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));});
  assert.match(document.body.textContent,/Lendo o seu site/);await click(button('Cancelar'));assert.match(document.body.textContent,/Análise cancelada/);assert.equal(document.querySelector('.rx-progress'),null);
 }finally{await act(async()=>root.unmount());dom.window.close();}
});
