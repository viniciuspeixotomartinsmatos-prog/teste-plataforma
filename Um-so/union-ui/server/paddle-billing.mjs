import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import {fail,paddleId,paddleConfig} from './paddle-access.mjs';
export {paddleConfig,subscriptionAccess,readPaddleSubscription} from './paddle-access.mjs';

export function verifyPaddleSignature(body,header,secret,now=Date.now()){
 if(!header||!secret||header.length>2048)return false;
 const fields=header.split(';').map(v=>v.trim().split('='));const timestamps=fields.filter(([k])=>k==='ts');
 if(timestamps.length!==1||!/^\d{10,11}$/.test(timestamps[0][1]||''))return false;
 const ts=timestamps[0][1];if(Math.abs(now/1000-Number(ts))>5)return false;
 const expected=createHmac('sha256',secret).update(ts+':').update(body).digest();
 return fields.some(([k,v])=>k==='h1'&&/^[a-f0-9]{64}$/i.test(v||'')&&timingSafeEqual(expected,Buffer.from(v,'hex')));
}
export async function readLimitedBody(request,limit=262144){
 if(Number(request.headers.get('content-length'))>limit)throw fail(413,'Arquivo muito grande.');
 if(!request.body)return Buffer.alloc(0);
 const reader=request.body.getReader(),chunks=[];let size=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw fail(413,'Arquivo muito grande.');}chunks.push(Buffer.from(value));}}finally{reader.releaseLock();}
 return Buffer.concat(chunks);
}
export function createPaddleBilling({env=process.env,fetchImpl=fetch,now=Date.now}={}){
 const config=paddleConfig(env),base=config.environment==='sandbox'?'https://sandbox-api.paddle.com':'https://api.paddle.com';
 const requireEnabled=()=>{if(!config.enabled)throw fail(503,'Assinaturas ainda não foram ativadas.','billing_disabled');};
 async function api(path,body){
  const response=await fetchImpl(base+path,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+env.PADDLE_API_KEY,'Content-Type':'application/json','Paddle-Version':'1'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw fail(502,'Não foi possível consultar a cobrança. Tente novamente.','billing_provider_error');
  const result=await response.json();if(!result.data)throw fail(502,'Resposta de cobrança inválida.');return result.data;
 }
 async function rpc(name,args){
  const response=await fetchImpl(env.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw fail(503,'Não foi possível atualizar a assinatura.','billing_persistence_error');return response.json();
 }
 const allPlans=[...config.plans,...config.regionalPlans];
 function publicConfig(){return{provider:'paddle',enabled:config.enabled,mode:config.mode,clientToken:config.clientToken,plans:config.plans.map(({priceId,...p})=>p),regionalPlans:config.regionalPlans.map(({priceId,...p})=>p),currencies:config.currencies,locales:config.locales};}
 async function checkout(user,input){
  requireEnabled();
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['planId','locale','currency'].includes(k))||!['pt-BR','en'].includes(input.locale||'pt-BR'))throw fail(400,'Plano inválido.');
  const plan=allPlans.find(p=>p.id===input.planId&&p.currency===(input.currency||'BRL'));if(!plan)throw fail(400,'Plano inválido.');
  // Re-read the server-owned catalog: a dashboard edit cannot silently change agreed terms.
  const price=await api('/prices/'+plan.priceId);
  if(price.status!=='active'||price.product_id!==config.productId||price.unit_price?.currency_code!==plan.currency||String(price.unit_price?.amount)!==String(plan.amount)||price.billing_cycle?.interval!=='month'||price.billing_cycle?.frequency!==plan.months||price.trial_period||price.unit_price_overrides?.length)throw fail(503,'Este plano está em configuração.','billing_price_mismatch');
  const reserve=()=>rpc('paddle_reserve_checkout',{p_user:user.id,p_environment:config.environment,p_plan:plan.id,p_price:plan.priceId,p_reservation:randomUUID()});
  let reservation=await reserve();
  if(['pending','different'].includes(reservation.state)){
   if(!paddleId(reservation.transaction_id,'txn'))throw fail(503,'Reserva inválida.');
   const pending=await api('/transactions/'+reservation.transaction_id);
   if(pending.id!==reservation.transaction_id)throw fail(502,'Transação inválida.');
   if(pending.status==='canceled'){
    await rpc('paddle_release_checkout',{p_user:user.id,p_environment:config.environment,p_transaction:pending.id,p_reservation:reservation.reservation});
    reservation=await reserve();
   }else if(reservation.state==='pending'&&['draft','ready'].includes(pending.status)){
    const ownerCustomer=await rpc('paddle_customer_for_user',{p_user:user.id,p_environment:config.environment});
    if(pending.customer_id!==ownerCustomer||pending.currency_code!==plan.currency||pending.items?.length!==1||pending.items[0].quantity!==1||pending.items[0].price?.id!==plan.priceId)throw fail(409,'Seu checkout precisa de verificação. Contate o suporte.','billing_checkout_mismatch');
    return{transactionId:pending.id,checkoutUrl:null};
   }
   else throw fail(409,'Você já tem um checkout em andamento. Retome-o ou aguarde a confirmação.','billing_checkout_pending');
  }
  if(reservation.state!=='reserved')throw fail(409,reservation.state==='stale'?'Seu checkout precisa de verificação. Contate o suporte antes de tentar novamente.':'Você já tem uma assinatura ou checkout em andamento. Aguarde e tente novamente.','billing_checkout_pending');
  let customer=await rpc('paddle_customer_for_user',{p_user:user.id,p_environment:config.environment});
  if(!customer){
   // Never search or bind accounts by email. A new provider customer belongs only to this authenticated user.
   const created=await api('/customers',{email:user.email,name:String(user.user_metadata?.name||'').slice(0,100)||undefined});
   if(!paddleId(created.id,'ctm'))throw fail(502,'Cliente de cobrança inválido.');
   customer=await rpc('paddle_bind_customer',{p_user:user.id,p_environment:config.environment,p_customer:created.id});
  }
  if(!paddleId(customer,'ctm'))throw fail(503,'Cliente de cobrança indisponível.');
  const transaction=await api('/transactions',{items:[{price_id:plan.priceId,quantity:1}],customer_id:customer,collection_mode:'automatic',currency_code:plan.currency});
  if(!paddleId(transaction.id,'txn')||transaction.customer_id!==customer)throw fail(502,'Transação de cobrança inválida.');
  await rpc('paddle_bind_checkout',{p_user:user.id,p_environment:config.environment,p_customer:customer,p_transaction:transaction.id,p_plan:plan.id,p_price:plan.priceId,p_reservation:reservation.reservation});
  // Return the transaction ID only; Paddle.js opens this immutable server-created transaction.
  return{transactionId:transaction.id,checkoutUrl:null};
 }
 async function portal(user){
  requireEnabled();const customer=await rpc('paddle_customer_for_user',{p_user:user.id,p_environment:config.environment});
  if(!paddleId(customer,'ctm'))throw fail(404,'Você ainda não tem uma assinatura.');
  const session=await api('/customers/'+customer+'/portal-sessions',{}),url=session.urls?.general?.overview;
  if(typeof url!=='string'||!/^https:\/\/([a-z0-9-]+\.)?customer-portal\.paddle\.com\//.test(url))throw fail(502,'Portal indisponível.');
  return{url};
 }
 async function webhook(request){
  requireEnabled();const raw=await readLimitedBody(request);
  if(!verifyPaddleSignature(raw,request.headers.get('paddle-signature'),env.PADDLE_WEBHOOK_SECRET,now()))throw fail(401,'Assinatura do webhook inválida.');
  let event;try{event=JSON.parse(raw.toString('utf8'));}catch{throw fail(400,'Evento inválido.');}
  if(!paddleId(event.event_id,'evt')||!Number.isFinite(Date.parse(event.occurred_at))||typeof event.event_type!=='string'||!event.data)throw fail(400,'Evento inválido.');
  const type=event.event_type;
  if(!['transaction.completed','subscription.created','subscription.activated','subscription.updated','subscription.canceled','subscription.past_due','subscription.paused','subscription.resumed','adjustment.created','adjustment.updated'].includes(type))return{ok:true,ignored:true};
  let transaction,subscription,adjustment;
  if(type.startsWith('adjustment.')){
   if(!paddleId(event.data.id,'adj'))throw fail(400,'Ajuste inválido.');
   // Paddle exposes adjustments through the filtered list endpoint, not GET /adjustments/:id.
   const adjustments=await api('/adjustments?id='+event.data.id);
   adjustment=Array.isArray(adjustments)&&adjustments.find(item=>item.id===event.data.id);
   if(!adjustment)throw fail(502,'Ajuste de cobrança indisponível.');
   if(adjustment.status!=='approved')return{ok:true,ignored:true};
   if(!paddleId(adjustment.transaction_id,'txn'))throw fail(400,'Transação inválida.');
   transaction=await api('/transactions/'+adjustment.transaction_id);
  }else if(type==='transaction.completed'){
   if(!paddleId(event.data.id,'txn')||event.data.status!=='completed')throw fail(400,'Transação inválida.');
   transaction=await api('/transactions/'+event.data.id);
  }else{
   if(!paddleId(event.data.id,'sub'))throw fail(400,'Assinatura inválida.');
   subscription=await api('/subscriptions/'+event.data.id);
  }
  if(transaction){
   if(!paddleId(transaction.id,'txn')||!paddleId(transaction.subscription_id,'sub')||!paddleId(transaction.customer_id,'ctm')||transaction.status!=='completed'||transaction.collection_mode!=='automatic')throw fail(400,'Transação não confirmada.');
   subscription=await api('/subscriptions/'+transaction.subscription_id);
  }
  const items=(transaction||subscription).items;
  if(!Array.isArray(items)||items.length!==1||items[0].quantity!==1)throw fail(400,'Itens não autorizados.');
  const price=items[0].price,plan=allPlans.find(p=>p.priceId===price?.id);
  if(!plan||price.product_id!==config.productId||price.unit_price?.currency_code!==plan.currency||transaction&&transaction.currency_code!==plan.currency||String(price.unit_price?.amount)!==String(plan.amount)||price.billing_cycle?.interval!=='month'||price.billing_cycle?.frequency!==plan.months||price.trial_period||price.unit_price_overrides?.length)throw fail(400,'Preço não autorizado.');
  if(!paddleId(subscription?.id,'sub')||!paddleId(subscription?.customer_id,'ctm')||transaction&&transaction.customer_id!==subscription.customer_id)throw fail(400,'Vínculo inválido.');
  const period=transaction?.billing_period;
  if(type==='transaction.completed'&&(!period?.ends_at||!Number.isFinite(Date.parse(period.ends_at))))throw fail(400,'Período inválido.');
  const revoke=Boolean(adjustment&&['refund','chargeback','chargeback_warning'].includes(adjustment.action));
  const result=await rpc('paddle_apply_event',{p_environment:config.environment,p_event:{id:event.event_id,type,occurred_at:event.occurred_at,customer_id:subscription.customer_id,subscription_id:subscription.id,transaction_id:transaction?.id||null,plan_id:plan.id,price_id:plan.priceId,status:subscription.status,paid_through:type==='transaction.completed'?period.ends_at:null,cancel_at_period_end:subscription.scheduled_change?.action==='cancel',revoke,payment_completed:type==='transaction.completed'}});
  return{ok:true,...result};
 }
 return{config,publicConfig,checkout,portal,webhook};
}
