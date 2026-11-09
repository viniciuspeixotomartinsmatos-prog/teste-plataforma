export const fail=(status,message,code)=>Object.assign(Error(message),{status,code});
export const paddleId=(value,prefix)=>typeof value==='string'&&new RegExp('^'+prefix+'_[a-z0-9]{26}$').test(value);
const catalog=[{id:'monthly',name:'Mensal',amount:8500,currency:'BRL',months:1},{id:'quarterly',name:'Trimestral',amount:16500,currency:'BRL',months:3},{id:'yearly',name:'Anual',amount:55000,currency:'BRL',months:12}];
export function paddleConfig(env=process.env){
 const environment=env.PADDLE_ENV==='live'?'live':'sandbox';
 const plans=catalog.map(p=>({...p,priceId:env['PADDLE_PRICE_'+p.id.toUpperCase()]}));
 let regionalPlans=[],regionalValid=true;
 try{
  const entries=JSON.parse(env.PADDLE_REGIONAL_PRICES_JSON||'[]');
  if(!Array.isArray(entries)||entries.length>6)throw Error('invalid regional map');
  const seen=new Set(),priceIds=new Set(plans.map(p=>p.priceId));
  regionalPlans=entries.map(entry=>{
   const base=catalog.find(p=>p.id===entry?.planId),key=entry?.planId+':'+entry?.currency;
   if(!base||Object.keys(entry).some(k=>!['planId','currency','amount','priceId'].includes(k))||!['USD','EUR'].includes(entry.currency)||!Number.isSafeInteger(entry.amount)||entry.amount<=0||entry.amount>100000000||!paddleId(entry.priceId,'pri')||seen.has(key)||priceIds.has(entry.priceId))throw Error('invalid regional price');
   seen.add(key);priceIds.add(entry.priceId);return{...base,currency:entry.currency,amount:entry.amount,priceId:entry.priceId};
  });
 }catch{regionalValid=false;regionalPlans=[];}
 const enabled=regionalValid&&env.PADDLE_BILLING_ENABLED==='true'&&['sandbox','live'].includes(env.PADDLE_ENV)&&Boolean(env.PADDLE_API_KEY?.startsWith(environment==='sandbox'?'pdl_sdbx_apikey_':'pdl_live_apikey_'))&&Boolean(env.PADDLE_CLIENT_TOKEN?.startsWith(environment==='sandbox'?'test_':'live_'))&&Boolean(env.PADDLE_WEBHOOK_SECRET)&&paddleId(env.PADDLE_PRODUCT_ID,'pro')&&plans.every(p=>paddleId(p.priceId,'pri'))&&new Set(plans.map(p=>p.priceId)).size===3&&Boolean(env.SUPABASE_URL&&env.SUPABASE_SERVICE_ROLE_KEY)&&(environment!=='live'||env.PADDLE_LIVE_APPROVED==='true'&&env.PADDLE_LICENSE_APPROVED==='true');
 return{provider:'paddle',enabled,requiresSubscription:env.PADDLE_BILLING_ENABLED==='true',mode:enabled?environment:'disabled',environment,plans,regionalPlans,currencies:[...new Set(['BRL',...regionalPlans.map(p=>p.currency)])],productId:env.PADDLE_PRODUCT_ID,clientToken:enabled?env.PADDLE_CLIENT_TOKEN:undefined,locales:['pt-BR','en']};
}
export function subscriptionAccess(subscription,now=Date.now()){
 return Boolean(subscription?.payment_confirmed&&!subscription.revoked&&['active','past_due','canceled'].includes(subscription.status)&&Date.parse(subscription.paid_through)>now);
}
export async function readPaddleSubscription(client,userId,environment){
 const {data,error}=await client.from('paddle_subscriptions').select('status,plan_id,paid_through,payment_confirmed,revoked,cancel_at_period_end,environment').eq('user_id',userId).eq('environment',environment).eq('is_current',true).maybeSingle();
 if(error)throw fail(503,'Não foi possível verificar sua assinatura.','billing_unavailable');
 return data?{status:data.status,planId:data.plan_id,paidThrough:data.paid_through,cancelAtPeriodEnd:data.cancel_at_period_end,hasAccess:subscriptionAccess(data)}:null;
}
