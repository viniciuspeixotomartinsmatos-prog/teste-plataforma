import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {createPaddleBilling,paddleConfig} from '../server/paddle-billing.mjs';
import {resolvePlan} from '../server/plan-access.mjs';
import {billingPeriods,subscriptionPrices} from '../src/billing-catalog.js';

const id=(prefix,letter)=>prefix+'_'+letter.repeat(26);
const tierPrices=['pro','max'].flatMap((tier,index)=>billingPeriods.map((period,i)=>({tier,planId:period.id,priceId:id('pri','defghi'[index*3+i])})));
const env={PADDLE_BILLING_ENABLED:'true',PADDLE_ENV:'sandbox',PADDLE_API_KEY:'pdl_sdbx_apikey_mock',PADDLE_CLIENT_TOKEN:'test_mock',PADDLE_WEBHOOK_SECRET:'secret',PADDLE_PRODUCT_ID:id('pro','a'),SUPABASE_URL:'https://db.example',SUPABASE_SERVICE_ROLE_KEY:'service',PADDLE_TIER_PRICES_JSON:JSON.stringify(tierPrices)};

test('each tier and billing period uses its own server price, and confirmed price resolves the matching access tier',async()=>{
 const config=paddleConfig(env);
 assert.equal(config.enabled,true);
 assert.equal(config.tierPlans.length,6);
 assert.equal(paddleConfig({...env,PADDLE_TIER_PRICES_JSON:JSON.stringify(tierPrices.slice(1))}).enabled,false);
 for(const plan of config.tierPlans){
  const customer=id('ctm','a'),transaction=id('txn','a'),calls=[];
  const billing=createPaddleBilling({env,fetchImpl:async(url,options)=>{
   const body=options.body&&JSON.parse(options.body);calls.push({url,body});
   if(url.includes('/prices/'))return Response.json({data:{id:plan.priceId,status:'active',product_id:config.productId,unit_price:{currency_code:'BRL',amount:String(plan.amount)},billing_cycle:{interval:'month',frequency:plan.months},quantity:{minimum:1,maximum:1},trial_period:null}});
   if(url.endsWith('/paddle_reserve_checkout'))return Response.json({state:'reserved',reservation:'11111111-1111-4111-8111-111111111111'});
   if(url.endsWith('/paddle_customer_for_user'))return Response.json(customer);
   if(url.endsWith('/transactions'))return Response.json({data:{id:transaction,customer_id:customer}});
   if(url.endsWith('/paddle_bind_checkout'))return Response.json(true);
   throw Error('Unexpected provider call');
  }});
  await billing.checkout({id:'owner',email:'owner@example.test'},{tier:plan.tier,planId:plan.id,locale:'pt-BR'});
  assert.equal(calls.find(call=>call.url.endsWith('/transactions')).body.items[0].price_id,plan.priceId);
  assert.equal(calls.find(call=>call.url.endsWith('/paddle_bind_checkout')).body.p_user,'owner');
  assert.equal(plan.amount,subscriptionPrices[plan.tier][plan.id]);
  assert.equal(await resolvePlan(null,{id:'owner'},{...config,environment:'live'},{},{hasAccess:true,priceId:plan.priceId}),plan.tier);
  assert.equal(await resolvePlan(null,{id:'owner'},{...config,environment:'live'},{},{hasAccess:false,priceId:plan.priceId}),'free');
 }
});

test('plan buttons preserve tier and period through login, then open a bound checkout without granting access from the browser',async()=>{
 await fs.mkdir('var',{recursive:true});
 await build({entryPoints:['src/PlanTiers.jsx'],outfile:'var/plan-purchase-test.mjs',bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},logLevel:'silent'});
 const dom=new JSDOM('<div id="root"></div>',{url:'https://nitido.example/plans'});
 for(const key of ['window','document','history','localStorage','HTMLElement','Node','Event','MouseEvent'])globalThis[key]=dom.window[key];
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const transaction=id('txn','a'),requests=[],opened=[];
 let eventCallback,refreshed=0,next;
 window.Paddle={Environment:{set(){}},Initialize(options){eventCallback=options.eventCallback;},Checkout:{open:options=>opened.push(options)}};
 globalThis.fetch=async(path,options={})=>{
  if(path==='/api/billing/config')return Response.json(createPaddleBilling({env}).publicConfig());
  if(path==='/api/catalog-prompt')throw Error('Checkout cannot unlock a prompt');
  if(options.method==='POST')requests.push(JSON.parse(options.body));
  return Response.json(path==='/api/billing/checkout'?{transactionId:transaction}:{quotas:{}});
 };
 const {default:Plans}=await import('../var/plan-purchase-test.mjs');
 const root=createRoot(document.querySelector('#root'));
 const account={user:null,access:{planAccess:true,plan:'free'},refreshAccess:async()=>{refreshed++;return{plan:'free'};}};
 const button=name=>[...document.querySelectorAll('button')].find(node=>node.textContent.trim()===name);
 try{
  await act(async()=>{root.render(React.createElement(Plans,{account,navigate:value=>{next=value;}}));});
  await act(async()=>button('Trimestral').click());
  assert.match(document.body.textContent,/134,90/);assert.match(document.body.textContent,/242,90/);
  await act(async()=>button('Assinar Max').click());
  assert.equal(new URL(next,'https://nitido.example').pathname,'/account');
  const selected=new URL(new URL(next,'https://nitido.example').searchParams.get('next'),'https://nitido.example');
  assert.equal(selected.searchParams.get('tier'),'max');assert.equal(selected.searchParams.get('period'),'quarterly');
  account.user={id:'owner'};
  await act(async()=>root.render(React.createElement(Plans,{account,navigate:value=>{next=value;}})));
  await act(async()=>button('Assinar Pro').click());
  assert.deepEqual(requests,[{tier:'pro',planId:'quarterly',locale:'pt-BR',currency:'BRL'}]);
  assert.equal(opened[0].transactionId,transaction);
  await act(async()=>eventCallback({name:'checkout.completed'}));
  assert.equal(refreshed,1);
  assert.match(document.body.textContent,/Aguardando confirmação/);
  assert.match(document.body.textContent,/Seu plano · Gratuito/);
 }finally{await act(async()=>root.unmount());dom.window.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
