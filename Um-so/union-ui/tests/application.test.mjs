import test from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import {createApplication,PLANS} from '../server/application.mjs';
const origin='http://127.0.0.1:4173';
const password='Disposable_test_password_73!';
const secret='isolated-test-secret-with-more-than-32-characters';
function request(route,{method='GET',body,cookie,origin:requestOrigin=origin,headers={}}={}){return new Request(origin+route,{method,headers:{origin:requestOrigin,...(body?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{}),...headers},...(body?{body:typeof body==='string'?body:JSON.stringify(body)}:{})});}
async function signup(app,email='one@example.test'){const result=await app.handle(request('/api/auth/sign-up/email',{method:'POST',body:{name:'Test user',email,password}}));assert.equal(result.status,200,await result.clone().text());return{cookie:result.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),data:await result.json()};}

test('accounts use real password hashing, HttpOnly sessions and user-isolated persistent collections',async()=>{
 const app=await createApplication({database:':memory:',directory:'var/test-runtime',secret,production:false});
 try{
  assert.equal((await app.handle(request('/api/workspace'))).status,401);
  const a=await signup(app),b=await signup(app,'two@example.test');
  assert.ok(a.cookie);assert.notEqual(app.db.prepare('SELECT password FROM account WHERE userId=?').get(a.data.user.id).password,password);
  const stored=await app.handle(request('/api/workspace',{method:'PUT',cookie:a.cookie,body:{revision:0,data:{saved:['one','one','two'],collections:[{id:'work',name:'Projeto',items:['one']}]}}}));assert.equal(stored.status,200);assert.deepEqual((await stored.json()).data.saved,['one','two']);
  assert.deepEqual((await(await app.handle(request('/api/workspace',{cookie:b.cookie}))).json()).data.saved,[]);
  assert.equal((await app.handle(request('/api/workspace',{method:'PUT',cookie:a.cookie,body:{revision:0,data:{saved:[]}}}))).status,409);
  assert.equal((await app.handle(request('/api/workspace',{method:'PUT',cookie:a.cookie,origin:'https://untrusted.example',body:{revision:1,data:{saved:[]}}}))).status,403);
  const logout=await app.handle(request('/api/auth/sign-out',{method:'POST',cookie:a.cookie,body:{}}));assert.equal(logout.status,200);assert.equal((await app.handle(request('/api/workspace',{cookie:a.cookie}))).status,401);
 }finally{app.close();}
});

test('password recovery delivers a one-time link and revokes previous sessions',async()=>{
 const mail=[];const app=await createApplication({database:':memory:',directory:'var/test-runtime',secret,production:false,sendMail:async message=>mail.push(message)});
 try{const user=await signup(app);const result=await app.handle(request('/api/auth/request-password-reset',{method:'POST',body:{email:'one@example.test',redirectTo:origin+'/account/reset'}}));assert.equal(result.status,200);assert.equal(mail.length,1);const link=new URL(mail[0].text.match(/https?:\/\/\S+/)[0]);const token=link.pathname.split('/').at(-1);const reset=await app.handle(request('/api/auth/reset-password',{method:'POST',body:{token,newPassword:'Replacement_test_password_84!'}}));assert.equal(reset.status,200,await reset.clone().text());assert.equal((await app.handle(request('/api/workspace',{cookie:user.cookie}))).status,401);const login=await app.handle(request('/api/auth/sign-in/email',{method:'POST',body:{email:'one@example.test',password:'Replacement_test_password_84!'}}));assert.equal(login.status,200);const reuse=await app.handle(request('/api/auth/reset-password',{method:'POST',body:{token,newPassword:password}}));assert.notEqual(reuse.status,200);}finally{app.close();}
});

test('subscription access is granted only by signed, idempotent webhooks and revoked on cancellation',async()=>{
 const sdk=new Stripe('sk_test_only_for_unit_tests'),webhookSecret='whsec_local_test_fixture';
 let subscription={id:'sub_fixture',customer:'cus_fixture',status:'active',items:{data:[{price:{id:'price_month'},current_period_end:Math.floor(Date.now()/1000)+86400}]},cancel_at_period_end:false};let checkoutParams;
 const stripe={webhooks:sdk.webhooks,customers:{create:async()=>({id:'cus_fixture'})},checkout:{sessions:{create:async params=>{checkoutParams=params;return{url:'https://checkout.stripe.com/test-only'}}}},subscriptions:{retrieve:async()=>subscription,cancel:async()=>({...subscription,status:'canceled'})},billingPortal:{sessions:{create:async()=>({url:'https://billing.stripe.com/test-only'})}}};
 const app=await createApplication({database:':memory:',directory:'var/test-runtime',secret,production:false,requireSubscription:true,stripe,billing:{prices:{monthly:'price_month',quarterly:'price_quarter',annual:'price_annual'},webhookSecret}});
 try{const user=await signup(app);assert.equal(await app.canReadCode(request('/code/test.json',{cookie:user.cookie})),false);assert.deepEqual(PLANS.map(x=>[x.amount,x.months]),[[8000,1],[15000,3],[50000,12]]);
  const checkout=await app.handle(request('/api/billing/checkout',{method:'POST',cookie:user.cookie,body:{plan:'quarterly'}}));assert.equal(checkout.status,200);assert.equal(checkoutParams.mode,'subscription');assert.equal(checkoutParams.line_items[0].price,'price_quarter');assert.ok(!checkoutParams.payment_method_types);assert.equal(await app.canReadCode(request('/code/test.json',{cookie:user.cookie})),false);
  const emit=async(id,type)=>{const body=JSON.stringify({id,type,data:{object:subscription}});return app.handle(request('/api/billing/webhook',{method:'POST',body,headers:{'stripe-signature':sdk.webhooks.generateTestHeaderString({payload:body,secret:webhookSecret})}}));};
  assert.equal((await app.handle(request('/api/billing/webhook',{method:'POST',body:'{}'}))).status,400);
  assert.equal((await emit('evt_one','customer.subscription.updated')).status,200);assert.equal(await app.canReadCode(request('/code/test.json',{cookie:user.cookie})),true);
  assert.equal((await(await emit('evt_one','customer.subscription.updated')).json()).duplicate,true);
  subscription={...subscription,status:'canceled'};assert.equal((await emit('evt_two','customer.subscription.deleted')).status,200);assert.equal(await app.canReadCode(request('/code/test.json',{cookie:user.cookie})),false);
 }finally{app.close();}
});
