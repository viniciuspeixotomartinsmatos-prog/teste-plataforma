import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
let loaded;
async function mount({search='?lang=en',path='/account',account={},stored}={}){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://example.test'+path+search});
 for(const key of ['window','document','localStorage','HTMLElement','Node','Event','MouseEvent'])globalThis[key]=dom.window[key];
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 if(stored)localStorage.setItem('nitido:locale',stored);
 loaded??=(async()=>{await fs.mkdir('var',{recursive:true});await build({entryPoints:['src/AccountPage.jsx'],outfile:'var/account-language-test.mjs',platform:'node',format:'esm',bundle:true,packages:'external',loader:{'.css':'empty'},logLevel:'silent'});return import('../var/account-language-test.mjs');})();
 const {default:AccountPage}=await loaded,root=createRoot(document.getElementById('root'));let destination;
 const state={user:null,sessionLoading:false,saved:[],collections:[],refreshSession:async()=>({name:'Test'}),refreshAccess:async()=>{},authenticate:async()=>({}),...account};
 await act(async()=>root.render(React.createElement(AccountPage,{account:state,path,search,navigate:value=>{destination=value;},notify:()=>{}})));
 return{state,destination:()=>destination,click:async label=>{const button=[...document.querySelectorAll('button')].find(node=>node.textContent.trim()===label||node.getAttribute('aria-label')===label);assert.ok(button,label);await act(async()=>button.click());},submit:()=>act(async()=>document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))),close:async()=>{await act(async()=>root.unmount());dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}};
}
test('English login, signup constraints, language switching and safe requested destination',async()=>{
 const ui=await mount({search:'?lang=en&next='+encodeURIComponent('/plans?lang=en')});
 try{
  assert.equal(document.querySelector('h1').textContent,'Sign in to your account');
  assert.match(document.querySelector('.auth-art-quote').textContent,/Your ideas deserve a new universe/);
  await ui.click('Show password');assert.equal(document.getElementById('auth-password').type,'text');
  await ui.click('Create an account');assert.equal(document.getElementById('auth-password').minLength,12);assert.equal(document.getElementById('auth-name').maxLength,100);
  assert.match(document.querySelector('label').textContent,/Full name/);
  await ui.click('Sign in');await ui.submit();assert.equal(ui.destination(),'/plans?lang=en');
  await ui.click('Português');assert.equal(document.querySelector('h1').textContent,'Entre na sua conta');assert.equal(localStorage.getItem('nitido:locale'),'pt-BR');
 }finally{await ui.close();}
});
test('English failures are safe and pending signup preserves the language without storing credentials',async()=>{
 let pending=false;const ui=await mount({account:{authenticate:async()=>{if(pending)return{verificationRequired:true};throw Error('Não foi possível confirmar sua sessão. Tente novamente.');}}});
 try{await ui.submit();assert.match(document.querySelector('[role=alert]').textContent,/try again/i);assert.doesNotMatch(document.querySelector('[role=alert]').textContent,/Não/);
 pending=true;await ui.click('Create an account');await ui.submit();assert.match(document.querySelector('[role=status]').textContent,/Check your email/);assert.equal(localStorage.getItem('nitido:locale'),'en');assert.equal(localStorage.length,1);
 }finally{await ui.close();}
});
test('English recovery and callback errors use stored language across return links',async()=>{
 const original=globalThis.fetch;let body;globalThis.fetch=async(url,options)=>{body=JSON.parse(options.body);return Response.json({});};
 const ui=await mount({search:'?auth_error=recovery_link',stored:'en'});
 try{assert.equal(document.querySelector('h1').textContent,'Recover access');assert.match(document.querySelector('[role=alert]').textContent,/recovery/i);await ui.submit();assert.equal(body.redirectTo,'https://example.test/account/reset');assert.match(document.querySelector('[role=status]').textContent,/reset your password/);
 }finally{await ui.close();globalThis.fetch=original;}
});
test('English confirmation consumes a token only on click and retains POST verification behavior',async()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'/api/auth/verify-email');assert.equal(options.method,'POST');assert.equal(JSON.parse(options.body).tokenHash,'a'.repeat(64));return Response.json({next:'/account/reset'});};
 const ui=await mount({search:'?lang=en&type=recovery&token_hash='+('a'.repeat(64))});
 try{assert.equal(calls,0);assert.equal(document.querySelector('h1').textContent,'Confirm your access');await ui.submit();assert.equal(calls,1);assert.equal(ui.destination(),'/account/reset');}finally{await ui.close();globalThis.fetch=original;}
});
test('English signed-in panels and errors remain English',async()=>{
 const ui=await mount({account:{user:{name:'Test Person',email:'test@example.test'},sync:'saved',error:'Suas alterações ainda não foram sincronizadas. Tente novamente.'}});
 try{assert.match(document.querySelector('main').textContent,/Your account/);assert.match(document.querySelector('main').textContent,/Collections synced/);assert.doesNotMatch(document.querySelector('[role=alert]').textContent,/Suas/);}finally{await ui.close();}
});
test('English reset and resend retain localized success messages and POST fields',async()=>{
 const original=globalThis.fetch;const requests=[];globalThis.fetch=async(url,options)=>{requests.push({url,body:JSON.parse(options.body)});return Response.json({});};
 const ui=await mount({path:'/account/reset',search:'?lang=en&token=reset-token'});
 try{assert.equal(document.querySelector('h1').textContent,'Set your new password');assert.equal(document.getElementById('auth-password').minLength,12);await ui.submit();assert.equal(requests[0].url,'/api/auth/reset-password');assert.equal(requests[0].body.token,'reset-token');assert.match(document.querySelector('[role=status]').textContent,/Password changed/);await ui.click('Resend confirmation');await ui.submit();assert.equal(requests[1].url,'/api/auth/resend-confirmation');assert.match(document.querySelector('[role=status]').textContent,/still needs confirmation/);}finally{await ui.close();globalThis.fetch=original;}
});
test('English validation messages clear when switching back to Portuguese',async()=>{
 const ui=await mount();try{const input=document.getElementById('auth-email');await act(async()=>input.dispatchEvent(new Event('invalid',{bubbles:false,cancelable:true})));assert.equal(input.validationMessage,'Please fill out this field.');await ui.click('Português');assert.notEqual(input.validationMessage,'Please fill out this field.');}finally{await ui.close();}
});
test('foreign next URLs never become post-login destinations',async()=>{
 const ui=await mount({search:'?lang=en&next='+encodeURIComponent('https://outside.test')});try{await ui.submit();assert.equal(ui.destination(),'/');}finally{await ui.close();}
});
