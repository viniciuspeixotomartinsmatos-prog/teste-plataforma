import {DatabaseSync} from 'node:sqlite';
import {randomBytes,randomInt} from 'node:crypto';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {betterAuth} from 'better-auth';
import {getMigrations} from 'better-auth/db/migration';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';

export const PLANS=[
 {id:'monthly',name:'Mensal',amount:8000,currency:'brl',months:1},
 {id:'quarterly',name:'Trimestral',amount:15000,currency:'brl',months:3},
 {id:'annual',name:'Anual',amount:50000,currency:'brl',months:12},
];
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
const fail=(status,message,code)=>Object.assign(new Error(message),{status,code});
const cleanIds=value=>Array.isArray(value)?[...new Set(value.filter(x=>typeof x==='string'&&x.length<200))].slice(0,20000):[];
function cleanWorkspace(value){
 if(!value||typeof value!=='object')throw fail(400,'Dados de coleção inválidos.');
 return{saved:cleanIds(value.saved),collections:(Array.isArray(value.collections)?value.collections:[]).slice(0,500).map(c=>({id:String(c.id||'').slice(0,100),name:String(c.name||'Coleção').slice(0,80),items:cleanIds(c.items)})).filter(c=>c.id)};
}

export async function createApplication(options={}){
 const directory=path.resolve(options.directory||'var');await fs.mkdir(directory,{recursive:true});
 const production=options.production??process.env.NODE_ENV==='production';
 const origin=options.origin||process.env.APP_ORIGIN||'http://127.0.0.1:4173';
 if(production&&!origin.startsWith('https://'))throw Error('APP_ORIGIN must use HTTPS in production.');
 let secret=options.secret||process.env.BETTER_AUTH_SECRET;
 if(!secret){const file=path.join(directory,'auth-secret');try{secret=await fs.readFile(file,'utf8');}catch{secret=randomBytes(48).toString('base64url');await fs.writeFile(file,secret,{mode:0o600});}}
 const db=new DatabaseSync(options.database||path.join(directory,'app.sqlite'));
 db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 const smtp=options.smtp||process.env.SMTP_URL;
 if(production&&!smtp)throw Error('SMTP_URL is required to deliver account verification and recovery messages.');
 const transport=smtp?nodemailer.createTransport(smtp):null;
 const mail=async({to,subject,text})=>{
  if(options.sendMail)return options.sendMail({to,subject,text});
  if(transport)return transport.sendMail({from:process.env.MAIL_FROM||'Um só. <conta@localhost>',to,subject,text});
  const outbox=path.join(directory,'mail');await fs.mkdir(outbox,{recursive:true});await fs.writeFile(path.join(outbox,randomBytes(12).toString('hex')+'.json'),JSON.stringify({to,subject,text}),{mode:0o600});
 };
 const authOptions={
  database:db,secret,baseURL:origin,basePath:'/api/auth',trustedOrigins:[origin],
  advanced:{ipAddress:{ipAddressHeaders:['x-umso-client-ip']}},
  emailAndPassword:{enabled:true,minPasswordLength:12,requireEmailVerification:production,revokeSessionsOnPasswordReset:true,sendResetPassword:async({user,url})=>mail({to:user.email,subject:'Redefinir sua senha — Um só.',text:'Use este link para redefinir sua senha: '+url})},
  emailVerification:{sendOnSignUp:production,autoSignInAfterVerification:true,sendVerificationEmail:async({user,url})=>mail({to:user.email,subject:'Confirme seu e-mail — Um só.',text:'Confirme sua conta: '+url})},
  user:{deleteUser:{enabled:true,beforeDelete:async user=>{const active=db.prepare("SELECT id FROM subscription WHERE user_id=? AND status IN ('active','trialing','past_due','unpaid')").all(user.id);if(active.length&&!stripe)throw Error('Não foi possível cancelar sua assinatura. Tente novamente.');for(const subscription of active)await stripe.subscriptions.cancel(subscription.id);}}},
  session:{expiresIn:60*60*24*30,updateAge:60*60*24},
  rateLimit:{enabled:true,storage:'database',window:60,max:60,customRules:{'/sign-in/email':{window:60,max:8},'/sign-up/email':{window:60,max:5},'/request-password-reset':{window:60,max:3}}},
 };
 await(await getMigrations(authOptions)).runMigrations();
 const auth=betterAuth(authOptions);
 db.exec(`CREATE TABLE IF NOT EXISTS workspace(user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,revision INTEGER NOT NULL,data TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS billing_customer(user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,customer_id TEXT UNIQUE NOT NULL);
 CREATE TABLE IF NOT EXISTS subscription(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,status TEXT NOT NULL,period_end INTEGER,price_id TEXT,cancel_at_period_end INTEGER NOT NULL DEFAULT 0);
 CREATE TABLE IF NOT EXISTS stripe_event(id TEXT PRIMARY KEY,processed_at TEXT NOT NULL);`);
 let config=options.billing||{};
 if(!options.billing)try{config=JSON.parse(await fs.readFile(path.join(directory,'billing.json'),'utf8'));}catch{}
 const billingEnabled=Boolean(options.stripe)||process.env.BILLING_ENABLED==='true';
 const key=billingEnabled?(process.env.STRIPE_SECRET_KEY||config.secretKey):null;
 const stripe=options.stripe||(key?new Stripe(key):null);
 const mode=key?(key.includes('_test_')?'test':'live'):(options.stripe?'test':'unconfigured');
 const prices={monthly:process.env.STRIPE_PRICE_MONTHLY||config.prices?.monthly,quarterly:process.env.STRIPE_PRICE_QUARTERLY||config.prices?.quarterly,annual:process.env.STRIPE_PRICE_ANNUAL||config.prices?.annual};
 const requireSubscription=options.requireSubscription??(billingEnabled&&(process.env.REQUIRE_SUBSCRIPTION==='true'||production));
 if(production&&billingEnabled&&(!stripe||mode!=='live'||Object.values(prices).some(x=>!x)))throw Error('Live Stripe configuration and all three plan prices are required in production.');
 const session=request=>auth.api.getSession({headers:request.headers});
 const requireUser=async request=>{const current=await session(request);if(!current?.user)throw fail(401,'Entre na sua conta para continuar.','sign_in_required');return current.user;};
 function access(user){
  const subscriptions=user?db.prepare('SELECT * FROM subscription WHERE user_id=?').all(user.id):[];
  const active=subscriptions.find(s=>['active','trialing'].includes(s.status)&&(!s.period_end||s.period_end>Date.now()/1000));
  return{canExport:!requireSubscription||Boolean(active),subscription:active||subscriptions[0]||null,billingMode:mode,requiresSubscription:requireSubscription};
 }
 async function readJSON(request){const text=await request.text();if(Buffer.byteLength(text)>1500000)throw fail(413,'Arquivo muito grande.');try{return JSON.parse(text);}catch{throw fail(400,'Dados inválidos.');}}
 async function webhook(request){
  let webhookSecret=process.env.STRIPE_WEBHOOK_SECRET||config.webhookSecret;
  if(!webhookSecret&&!options.billing)try{webhookSecret=JSON.parse(await fs.readFile(path.join(directory,'billing.json'),'utf8')).webhookSecret;}catch{}
  if(!stripe||!webhookSecret)throw fail(503,'Confirmação de pagamentos não configurada.');
  const body=await request.text();if(Buffer.byteLength(body)>1000000)throw fail(413,'Evento muito grande.');
  let event;try{event=stripe.webhooks.constructEvent(body,request.headers.get('stripe-signature'),webhookSecret);}catch{throw fail(400,'Assinatura do evento inválida.');}
  if(db.prepare('SELECT id FROM stripe_event WHERE id=?').get(event.id))return json({received:true,duplicate:true});
  if(event.type.startsWith('customer.subscription.')){
   let subscription=event.data.object;
   if(event.type!=='customer.subscription.deleted')subscription=await stripe.subscriptions.retrieve(subscription.id);
   const customerId=typeof subscription.customer==='string'?subscription.customer:subscription.customer.id;
   const customer=db.prepare('SELECT user_id FROM billing_customer WHERE customer_id=?').get(customerId);
   if(customer){const item=subscription.items?.data?.[0];db.prepare('INSERT INTO subscription(id,user_id,status,period_end,price_id,cancel_at_period_end) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,period_end=excluded.period_end,price_id=excluded.price_id,cancel_at_period_end=excluded.cancel_at_period_end').run(subscription.id,customer.user_id,subscription.status,item?.current_period_end||subscription.current_period_end||null,item?.price?.id||null,subscription.cancel_at_period_end?1:0);}
  }
  if(event.type==='checkout.session.completed'&&event.data.object.mode==='subscription'){
   const checkout=event.data.object;
   const id=typeof checkout.subscription==='string'?checkout.subscription:checkout.subscription?.id;
   if(id){const sub=await stripe.subscriptions.retrieve(id);const customer=db.prepare('SELECT user_id FROM billing_customer WHERE customer_id=?').get(typeof checkout.customer==='string'?checkout.customer:checkout.customer?.id);if(customer){const item=sub.items?.data?.[0];db.prepare('INSERT INTO subscription(id,user_id,status,period_end,price_id,cancel_at_period_end) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,period_end=excluded.period_end,price_id=excluded.price_id,cancel_at_period_end=excluded.cancel_at_period_end').run(sub.id,customer.user_id,sub.status,item?.current_period_end||sub.current_period_end||null,item?.price?.id||null,sub.cancel_at_period_end?1:0);}}
  }
  db.prepare('INSERT OR IGNORE INTO stripe_event(id,processed_at) VALUES(?,?)').run(event.id,new Date().toISOString());
  return json({received:true});
 }
 async function handle(request){
  const url=new URL(request.url),route=url.pathname;
  try{
   if(route.startsWith('/api/auth/'))return auth.handler(request);
   if(route==='/api/billing/webhook'&&request.method==='POST')return await webhook(request);
   if(route==='/api/health')return json({ok:true,billingMode:mode});
   if(route==='/api/plans')return json({plans:PLANS,mode,available:Boolean(stripe&&Object.values(prices).every(Boolean))});
   if(route==='/api/access'){const current=await session(request);return json(access(current?.user));}
   if(request.method!=='GET'&&request.headers.get('origin')!==origin)throw fail(403,'Origem não autorizada.');
   if(route==='/api/workspace'){
    const user=await requireUser(request),existing=db.prepare('SELECT revision,data,updated_at FROM workspace WHERE user_id=?').get(user.id);
    if(request.method==='GET')return json(existing?{revision:existing.revision,data:JSON.parse(existing.data),updatedAt:existing.updated_at}:{revision:0,data:{saved:[],collections:[]}});
    if(request.method==='PUT'){
     const input=await readJSON(request);const data=cleanWorkspace(input.data);
     const current=db.prepare('SELECT revision FROM workspace WHERE user_id=?').get(user.id);
     if(input.revision!==(current?.revision||0))throw fail(409,'Suas coleções foram alteradas em outra sessão. Recarregue para sincronizar.','revision_conflict');
     const next=(current?.revision||0)+1,updatedAt=new Date().toISOString();
     const changed=db.prepare('INSERT INTO workspace(user_id,revision,data,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET revision=excluded.revision,data=excluded.data,updated_at=excluded.updated_at WHERE workspace.revision=?').run(user.id,next,JSON.stringify(data),updatedAt,input.revision);
     if(!changed.changes)throw fail(409,'Suas coleções foram alteradas em outra sessão. Recarregue para sincronizar.','revision_conflict');
     return json({revision:next,data,updatedAt});
    }
   }
   if(route==='/api/billing/checkout'&&request.method==='POST'){
    const user=await requireUser(request),input=await readJSON(request);
    const plan=PLANS.find(p=>p.id===input.plan);if(!plan)throw fail(400,'Escolha um plano válido.');
    if(!stripe||!prices[plan.id])throw fail(503,'O pagamento ainda não foi configurado.','billing_setup_required');
    const subscribed=access(user).subscription;
    if(subscribed&&['active','trialing'].includes(subscribed.status)&&(!subscribed.period_end||subscribed.period_end>Date.now()/1000))throw fail(409,'Sua assinatura já está ativa. Use Gerenciar assinatura.');
    let customer=db.prepare('SELECT customer_id FROM billing_customer WHERE user_id=?').get(user.id)?.customer_id;
    if(!customer){const created=await stripe.customers.create({email:user.email,name:user.name,metadata:{userId:user.id}},{idempotencyKey:'customer:'+user.id});customer=created.id;db.prepare('INSERT OR IGNORE INTO billing_customer(user_id,customer_id) VALUES(?,?)').run(user.id,customer);}
    const suffix=Array.from({length:8},()=>String.fromCharCode(97+randomInt(26))).join('');
    const checkout=await stripe.checkout.sessions.create({mode:'subscription',customer,line_items:[{price:prices[plan.id],quantity:1}],success_url:origin+'/account?checkout=complete',cancel_url:origin+'/plans?checkout=canceled',locale:'pt-BR',client_reference_id:user.id,subscription_data:{metadata:{userId:user.id,plan:plan.id}},integration_identifier:'umso_'+suffix},{idempotencyKey:'checkout:'+user.id+':'+plan.id+':'+Math.floor(Date.now()/600000)});
    return json({url:checkout.url});
   }
   if(route==='/api/billing/portal'&&request.method==='POST'){
    const user=await requireUser(request),customer=db.prepare('SELECT customer_id FROM billing_customer WHERE user_id=?').get(user.id)?.customer_id;
    if(!stripe||!customer)throw fail(400,'Nenhuma assinatura para gerenciar.');
    const portal=await stripe.billingPortal.sessions.create({customer,return_url:origin+'/account',...(config.portalConfiguration?{configuration:config.portalConfiguration}:{})});return json({url:portal.url});
   }
   return json({error:'Rota não encontrada.'},404);
  }catch(error){if(error.status)return json({error:error.message,code:error.code},error.status);console.error('Application request failed:',error.name,error.code||'internal_error');return json({error:'Não foi possível concluir. Tente novamente.'},500);}
 }
 async function canReadCode(request){if(!requireSubscription)return true;const current=await session(request);return access(current?.user).canExport;}
 await auth.$context;
 return{handle,auth,db,canReadCode,origin,close:()=>db.close()};
}
