import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {paddleConfig,verifyPaddleSignature,readLimitedBody,createPaddleBilling,subscriptionAccess} from '../server/paddle-billing.mjs';
const id=(prefix,n='a')=>prefix+'_'+n.repeat(26);
const env={PADDLE_BILLING_ENABLED:'true',PADDLE_ENV:'sandbox',PADDLE_API_KEY:'pdl_sdbx_apikey_test',PADDLE_CLIENT_TOKEN:'test_token',PADDLE_WEBHOOK_SECRET:'secret',PADDLE_PRODUCT_ID:id('pro'),PADDLE_PRICE_MONTHLY:id('pri','a'),PADDLE_PRICE_QUARTERLY:id('pri','b'),PADDLE_PRICE_YEARLY:id('pri','c'),SUPABASE_URL:'https://db.example',SUPABASE_SERVICE_ROLE_KEY:'service'};
test('a configured paywall stays closed when the provider loses configuration',async()=>{
 const origin='https://platform.example';
 const client={auth:{getUser:async()=>({data:{user:{id:'member'}},error:null})}};
 const app=createSupabaseApplication({origin,billingEnv:{...env,PADDLE_WEBHOOK_SECRET:''},clientFactory:()=>({client,finish:response=>response})});
 const request=new Request(origin+'/api/access');
 const access=await (await app.handle(request)).json();
 assert.equal(access.requiresSubscription,true);
 assert.equal(access.canExport,false);
 assert.equal(await app.canAccessPlatform(request),false);
});
test('disabled by default, live requires explicit approval and license approval',()=>{
 assert.equal(paddleConfig({}).enabled,false);
 assert.equal(paddleConfig(env).mode,'sandbox');
 assert.equal(paddleConfig({...env,PADDLE_ENV:'live'}).enabled,false);
 assert.equal(paddleConfig({...env,PADDLE_ENV:'live',PADDLE_LIVE_APPROVED:'true',PADDLE_LICENSE_APPROVED:'true',PADDLE_API_KEY:'pdl_live_apikey_test',PADDLE_CLIENT_TOKEN:'live_token'}).mode,'live');
 assert.deepEqual(paddleConfig(env).plans.map(p=>p.amount),[8500,16500,55000]);
});
test('raw signatures reject tampering, replay and malformed headers',()=>{
 const body=Buffer.from('{ "event":1 }'),ts='1700000000',sig=createHmac('sha256','secret').update(ts+':').update(body).digest('hex');
 assert.equal(verifyPaddleSignature(body,`ts=${ts};h1=${sig}`,'secret',1700000000000),true);
 for(const [b,h,time] of [[Buffer.from('{}'),`ts=${ts};h1=${sig}`,1700000000000],[body,`ts=${ts};h1=${sig}`,1700000006000],[body,'ts=no;h1=abc',1700000000000]])assert.equal(verifyPaddleSignature(b,h,'secret',time),false);
});
test('stream size limit is enforced without trusting content length',async()=>{
 const request=new Request('https://app.test',{method:'POST',body:'x'.repeat(30)});
 await assert.rejects(()=>readLimitedBody(request,20),e=>e.status===413);
});
test('access requires confirmed unrevoked paid-through time',()=>{
 const now=Date.now();const sub={status:'active',paid_through:new Date(now+10000).toISOString(),payment_confirmed:true};
 assert.equal(subscriptionAccess(sub,now),true);
 assert.equal(subscriptionAccess({...sub,payment_confirmed:false},now),false);
 assert.equal(subscriptionAccess({...sub,revoked:true},now),false);
 assert.equal(subscriptionAccess({...sub,status:'past_due'},now),true);
 assert.equal(subscriptionAccess({...sub,paid_through:new Date(now-1).toISOString()},now),false);
});
test('checkout rejects client-supplied billing identifiers and amounts before provider calls',async()=>{
 let calls=0;const billing=createPaddleBilling({env,fetchImpl:async()=>{calls++;throw Error('unexpected');}});
 for(const input of [{planId:'monthly',amount:1},{planId:'monthly',customerId:id('ctm')},{planId:'monthly',userId:'other'},{planId:'unknown'}])await assert.rejects(()=>billing.checkout({id:'user',email:'a@test.com'},input),e=>e.status===400);
 assert.equal(calls,0);
});
test('webhook verifies signature before any persistence or provider fetch',async()=>{
 let calls=0;const billing=createPaddleBilling({env,fetchImpl:async()=>{calls++;throw Error('unexpected');}});
 await assert.rejects(()=>billing.webhook(new Request('https://app.test/api/billing/webhook',{method:'POST',body:'{}'})),e=>e.status===401);
 assert.equal(calls,0);
});
import {createSupabaseApplication} from '../server/supabase-app.mjs';
const origin='https://platform.example';
const clientFactory=()=>({client:{auth:{getUser:async()=>({data:{user:null}})}},finish:r=>r});
test('public billing config works disabled and webhook bypasses browser Origin but stays disabled',async()=>{
 const app=createSupabaseApplication({origin,clientFactory,billingEnv:{}});
 const response=await app.handle(new Request(origin+'/api/billing/config'));
 assert.equal(response.status,200);assert.equal((await response.json()).mode,'disabled');
 assert.equal((await app.handle(new Request(origin+'/api/billing/webhook',{method:'POST',body:'{}'}))).status,503);
 assert.equal((await app.handle(new Request(origin+'/api/billing/checkout',{method:'POST',headers:{origin:'https://evil.test'},body:'{}'}))).status,403);
});
test('paid gate leaves signed-in users locked without confirmed subscription',async()=>{
 const user={id:'one',email:'a@example.test'};
 const signed=()=>({client:{auth:{getUser:async()=>({data:{user}})},from:()=>({select:()=>({eq(){return this;},maybeSingle:async()=>({data:null,error:null})})})},finish:r=>r});
 const app=createSupabaseApplication({origin,clientFactory:signed,billingEnv:env});
 const response=await app.handle(new Request(origin+'/api/access'));
 assert.equal((await response.json()).canExport,false);
 assert.equal(await app.canReadCode(new Request(origin+'/code/a.json')),false);
});
function fixture(){
 const price={id:id('pri'),product_id:id('pro'),status:'active',unit_price:{currency_code:'BRL',amount:'8500'},billing_cycle:{interval:'month',frequency:1},trial_period:null};
 const customer=id('ctm'),transaction={id:id('txn'),customer_id:customer,subscription_id:id('sub'),collection_mode:'automatic',currency_code:'BRL',status:'completed',items:[{quantity:1,price}],billing_period:{ends_at:'2026-12-06T12:00:00Z'}};
 const subscription={id:id('sub'),customer_id:customer,status:'active',items:[{quantity:1,price}],scheduled_change:null};
 return{price,customer,transaction,subscription};
}
function signedRequest(event,time=Date.now()){
 const body=JSON.stringify(event),ts=String(Math.floor(time/1000)),signature=createHmac('sha256','secret').update(ts+':'+body).digest('hex');
 return new Request(origin+'/api/billing/webhook',{method:'POST',headers:{'paddle-signature':`ts=${ts};h1=${signature}`},body});
}
const completedEvent=()=>({event_id:id('evt'),event_type:'transaction.completed',occurred_at:'2026-11-06T12:00:00Z',data:{id:id('txn'),status:'completed'}});
test('checkout uses server plan and bound customer; provider completion persists sanitized server state',async()=>{
 const f=fixture(),calls=[];
 const fetchImpl=async(url,options)=>{
  const body=options.body&&JSON.parse(options.body);calls.push({url,body});
  let result;
  if(url.endsWith('/prices/'+id('pri')))result={data:f.price};
  else if(url.endsWith('/paddle_reserve_checkout'))result={state:'reserved',reservation:'11111111-1111-4111-8111-111111111111'};
  else if(url.endsWith('/paddle_customer_for_user'))result=f.customer;
  else if(url.endsWith('/transactions')||url.endsWith('/transactions/'+id('txn')))result={data:f.transaction};
  else if(url.endsWith('/subscriptions/'+id('sub')))result={data:f.subscription};
  else if(url.endsWith('/paddle_bind_checkout'))result=true;
  else if(url.endsWith('/paddle_apply_event'))result={duplicate:false};
  else throw Error('unexpected '+url);
  return Response.json(result);
 };
 const billing=createPaddleBilling({env,fetchImpl});
 assert.deepEqual(await billing.checkout({id:'user',email:'a@test.com'},{planId:'monthly',locale:'en'}),{transactionId:id('txn'),checkoutUrl:null});
 const sent=calls.find(c=>c.url.endsWith('/transactions')).body;
 assert.deepEqual(sent,{items:[{price_id:id('pri'),quantity:1}],customer_id:f.customer,collection_mode:'automatic',currency_code:'BRL'});
 assert.equal((await billing.webhook(signedRequest(completedEvent()))).ok,true);
 const stored=calls.find(c=>c.url.endsWith('/paddle_apply_event')).body;
 assert.equal(stored.p_environment,'sandbox');assert.equal(stored.p_event.payment_completed,true);assert.equal(stored.p_event.paid_through,'2026-12-06T12:00:00Z');
 assert.equal('custom_data' in stored.p_event,false);
});
test('provider wrong product, price, quantity and incomplete transaction never persist',async()=>{
 for(const mutate of [f=>f.transaction.items[0].price.product_id=id('pro','z'),f=>f.transaction.items[0].price.unit_price.amount='1',f=>f.transaction.items[0].quantity=2,f=>f.transaction.status='paid',f=>f.transaction.currency_code='USD']){
  const f=fixture();mutate(f);let writes=0;
  const billing=createPaddleBilling({env,fetchImpl:async url=>{if(url.includes('/rest/')){writes++;return Response.json({});}return Response.json({data:url.includes('/transactions/')?f.transaction:f.subscription});}});
  await assert.rejects(()=>billing.webhook(signedRequest(completedEvent())),e=>e.status===400);assert.equal(writes,0);
 }
});
test('activated subscription cannot grant paid access; approved partial refund revokes conservatively',async()=>{
 const f=fixture();let stored;
 const billing=createPaddleBilling({env,fetchImpl:async(url,options)=>{
  if(url.includes('/rest/')){stored=JSON.parse(options.body).p_event;return Response.json({duplicate:false});}
  if(url.includes('/adjustments')){assert.equal(url,'https://sandbox-api.paddle.com/adjustments?id='+id('adj'));return Response.json({data:[{id:id('adj'),transaction_id:id('txn'),status:'approved',action:'refund',type:'partial'}]});}
  return Response.json({data:url.includes('/transactions/')?f.transaction:f.subscription});
 }});
 await billing.webhook(signedRequest({...completedEvent(),event_type:'subscription.activated',data:{id:id('sub')}}));
 assert.equal(stored.payment_completed,false);assert.equal(stored.paid_through,null);
 await billing.webhook(signedRequest({...completedEvent(),event_type:'adjustment.created',data:{id:id('adj')}}));
 assert.equal(stored.revoke,true);assert.equal(stored.payment_completed,false);
});
test('portal always resolves authenticated customer server-side and validates provider URL',async()=>{
 let path;
 const billing=createPaddleBilling({env,fetchImpl:async url=>{
  if(url.endsWith('/paddle_customer_for_user'))return Response.json(id('ctm'));
  path=url;return Response.json({data:{urls:{general:{overview:'https://customer-portal.paddle.com/session?token=test'}}}});
 }});
 assert.equal((await billing.portal({id:'user'})).url,'https://customer-portal.paddle.com/session?token=test');
 assert.equal(path,'https://sandbox-api.paddle.com/customers/'+id('ctm')+'/portal-sessions');
});
const regional=[{planId:'monthly',currency:'USD',amount:1900,priceId:id('pri','d')},{planId:'yearly',currency:'EUR',amount:9900,priceId:id('pri','e')}];
test('regional prices expose approved foreign amounts without leaking IDs; malformed maps fail closed',()=>{
 const cfg=paddleConfig({...env,PADDLE_REGIONAL_PRICES_JSON:JSON.stringify(regional)});
 assert.equal(cfg.enabled,true);assert.equal(cfg.regionalPlans[0].currency,'USD');assert.equal(cfg.regionalPlans[0].amount,1900);
 const publicConfig=createPaddleBilling({env:{...env,PADDLE_REGIONAL_PRICES_JSON:JSON.stringify(regional)}}).publicConfig();
 assert.deepEqual(publicConfig.currencies,['BRL','USD','EUR']);assert.equal('priceId' in publicConfig.regionalPlans[0],false);
 for(const value of ['invalid',JSON.stringify([{...regional[0],amount:0}]),JSON.stringify([...regional,regional[0]]),JSON.stringify([{...regional[0],priceId:id('pri')}])])assert.equal(paddleConfig({...env,PADDLE_REGIONAL_PRICES_JSON:value}).enabled,false);
});
test('regional checkout and completion require exact configured amount, currency and price',async()=>{
 const f=fixture();f.price.id=id('pri','d');f.price.unit_price={amount:'1900',currency_code:'USD'};f.transaction.currency_code='USD';
 let sent,stored;
 const billing=createPaddleBilling({env:{...env,PADDLE_REGIONAL_PRICES_JSON:JSON.stringify(regional)},fetchImpl:async(url,options)=>{
  const body=options.body&&JSON.parse(options.body);
  if(url.endsWith('/paddle_reserve_checkout'))return Response.json({state:'reserved',reservation:'11111111-1111-4111-8111-111111111111'});
  if(url.endsWith('/paddle_customer_for_user'))return Response.json(f.customer);
  if(url.endsWith('/paddle_bind_checkout')){assert.equal(body.p_price,id('pri','d'));return Response.json(true);}
  if(url.endsWith('/paddle_apply_event')){stored=body.p_event;return Response.json({duplicate:false});}
  if(url.endsWith('/transactions')){sent=body;return Response.json({data:f.transaction});}
  return Response.json({data:url.includes('/prices/')?f.price:url.includes('/transactions/')?f.transaction:f.subscription});
 }});
 await billing.checkout({id:'user',email:'a@test.com'},{planId:'monthly',locale:'en',currency:'USD'});
 assert.equal(sent.currency_code,'USD');assert.equal(sent.items[0].price_id,id('pri','d'));
 await billing.webhook(signedRequest(completedEvent()));assert.equal(stored.price_id,id('pri','d'));
 await assert.rejects(()=>billing.checkout({id:'user'},{planId:'quarterly',currency:'USD'}),e=>e.status===400);
 f.transaction.currency_code='EUR';await assert.rejects(()=>billing.webhook(signedRequest(completedEvent())),e=>e.status===400);
});
test('checkout reserves before provider create and reuses one pending transaction across repeated clicks',async()=>{
 const f=fixture();let creates=0,reserved=false,bound=false;
 const billing=createPaddleBilling({env,fetchImpl:async(url,options)=>{
  const body=options.body&&JSON.parse(options.body);
  if(url.endsWith('/paddle_reserve_checkout')){if(!reserved){reserved=true;return Response.json({state:'reserved',reservation:'11111111-1111-4111-8111-111111111111'});}return Response.json({state:bound?'pending':'creating',transaction_id:bound?f.transaction.id:null,price_id:f.price.id});}
  if(url.endsWith('/paddle_customer_for_user'))return Response.json(f.customer);
  if(url.endsWith('/paddle_bind_checkout')){bound=true;return Response.json(true);}
  if(url.endsWith('/transactions')){assert.equal(reserved,true);creates++;return Response.json({data:{...f.transaction,status:'draft'}});}
  if(url.includes('/transactions/'))return Response.json({data:{...f.transaction,status:'draft'}});
  if(url.includes('/prices/'))return Response.json({data:f.price});
  throw Error('unexpected '+url+' '+JSON.stringify(body));
 }});
 assert.equal((await billing.checkout({id:'user',email:'a@test.com'},{planId:'monthly'})).transactionId,f.transaction.id);
 assert.equal((await billing.checkout({id:'user',email:'a@test.com'},{planId:'monthly'})).transactionId,f.transaction.id);assert.equal(creates,1);
});
test('creating/stale reservation or different pending price never creates another transaction',async()=>{
 for(const state of ['creating','stale','paid']){
  let creates=0;const f=fixture();
  const billing=createPaddleBilling({env,fetchImpl:async(url)=>{
   if(url.includes('/prices/'))return Response.json({data:f.price});
   if(url.endsWith('/paddle_reserve_checkout'))return Response.json({state});
   creates++;throw Error('unexpected provider create');
  }});
  await assert.rejects(()=>billing.checkout({id:'user',email:'a@test.com'},{planId:'monthly'}),e=>e.status===409);assert.equal(creates,0);
 }
});
test('different pending checkout blocks switching; cancellation must be confirmed before replacement',async()=>{
 for(const canceled of [false,true]){
  const f=fixture();let reserveCalls=0,released=0,created=0;
  const token='11111111-1111-4111-8111-111111111111';
  const billing=createPaddleBilling({env,fetchImpl:async(url,options)=>{
   if(url.includes('/prices/'))return Response.json({data:f.price});
   if(url.endsWith('/paddle_reserve_checkout'))return Response.json(++reserveCalls===1?{state:'different',transaction_id:id('txn','z'),reservation:token,price_id:id('pri','b')}:{state:'reserved',reservation:token});
   if(url.endsWith('/transactions/'+id('txn','z')))return Response.json({data:{...f.transaction,id:id('txn','z'),status:canceled?'canceled':'draft'}});
   if(url.endsWith('/paddle_release_checkout')){released++;return Response.json(true);}
   if(url.endsWith('/paddle_customer_for_user'))return Response.json(f.customer);
   if(url.endsWith('/paddle_bind_checkout'))return Response.json(true);
   if(url.endsWith('/transactions')){assert.equal(released,1);created++;return Response.json({data:f.transaction});}
   throw Error('unexpected '+url);
  }});
  if(canceled){await billing.checkout({id:'user',email:'a@test.com'},{planId:'monthly'});assert.equal(created,1);}
  else {await assert.rejects(()=>billing.checkout({id:'user',email:'a@test.com'},{planId:'monthly'}),e=>e.status===409);assert.equal(created,0);assert.equal(released,0);}
 }
});
