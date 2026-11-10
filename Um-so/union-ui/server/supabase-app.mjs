import {community} from './community.mjs';
import {handleCollectionShare,supabaseShareStore} from './collection-shares.mjs';
import {PASSWORD_REQUIREMENTS,validNewPassword} from '../src/password-policy.js';
import {creatorWorkspace,supabaseCreatorStore} from './creator-workspaces.mjs';
import {siteAuditService} from './site-audit-service.mjs';
import {requestClient} from './supabase-client.mjs';
import {safeNext} from '../src/auth-policy.js';
import {createPaddleBilling,readPaddleSubscription} from './paddle-billing.mjs';
import {createRequestLimiter,readJSONObject,secureResponse,securityEvent} from './security-controls.mjs';
import {POLICY_VERSION,exportPersonalData,deletePersonalAccount} from './privacy-service.mjs';

const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
const fail=(status,message,code)=>Object.assign(Error(message),{status,code});
const profile=user=>user?{id:user.id,email:user.email,name:String(user.user_metadata?.name||user.email?.split('@')[0]||'Criador')}:null;
function cleanWorkspace(value){
 if(!value||typeof value!=='object')throw fail(400,'Dados de coleção inválidos.');
 const ids=value=>Array.isArray(value)?[...new Set(value.filter(x=>typeof x==='string'&&x.length<200))].slice(0,20000):[];
 return{saved:ids(value.saved),collections:(Array.isArray(value.collections)?value.collections:[]).slice(0,500).map(c=>({id:String(c.id||'').slice(0,100),name:String(c.name||'Coleção').slice(0,80),description:String(c.description||'').slice(0,1000),items:ids(c.items)})).filter(c=>c.id)};
}
const requestLimit=createRequestLimiter();
export function createSupabaseApplication({origin=process.env.APP_ORIGIN,clientFactory=requestClient,billingEnv=process.env,billingFetch=fetch,limiter=requestLimit,securityLogger=console.info,auditor=siteAuditService}={}){
 const billing=createPaddleBilling({env:billingEnv,fetchImpl:billingFetch});
 async function handleInternal(request){
  let finish=response=>response;
  try{
   const url=new URL(request.url),route=url.pathname;
   // Provider callbacks authenticate the exact raw bytes, without browser cookies or Origin.
   if(route==='/api/billing/webhook'){
    if(request.method!=='POST')throw fail(405,'Método não permitido.');
    return json(await billing.webhook(request));
   }
   if(route==='/api/billing/config'&&request.method==='GET')return json(billing.publicConfig());
   // An explicit canonical origin prevents request headers controlling email links.
   if(!origin||!/^https?:\/\//.test(origin))throw fail(503,'O acesso está em configuração. Tente novamente mais tarde.','auth_setup_required');
   if((process.env.NODE_ENV==='production'||process.env.VERCEL)&&!origin.startsWith('https://'))throw fail(503,'O acesso está em configuração.','https_required');
   if(!['GET','HEAD'].includes(request.method)&&request.headers.get('origin')!==origin)throw fail(403,'Origem não autorizada.');
   if(!['GET','HEAD'].includes(request.method)&&request.headers.get('sec-fetch-site')==='cross-site')throw fail(403,'Origem não autorizada.');
   limiter(request);
   const context=clientFactory(request);finish=context.finish;const client=context.client;
   const body=()=>readJSONObject(request);
   const getUser=async()=>{const {data,error}=await client.auth.getUser();if(error?.status>=500)throw fail(503,'Não foi possível verificar sua sessão. Tente novamente.');return data?.user||null;};
   const requireUser=async()=>{const user=await getUser();if(!user)throw fail(401,'Entre na sua conta para continuar.','sign_in_required');return user;};
   const check=result=>{if(result.error){const code=result.error.code;throw fail(result.error.status===429?429:400,result.error.status===429?'Aguarde um pouco antes de tentar novamente.':code==='email_not_confirmed'?'Confirme seu e-mail antes de entrar.':code==='otp_expired'?'Esse link expirou ou já foi usado. Solicite um novo link.':code==='invalid_credentials'?'E-mail ou senha incorretos.':'Não foi possível concluir. Confira seus dados e tente novamente.',code);}return result.data;};
   let response;
   if(route==='/api/community'||route==='/api/creator-command')return finish(await community(request,client,body,requireUser));
   if(['/api/collection-shares','/api/shared-collection','/api/sharing/config'].includes(route))response=json(await handleCollectionShare(request,{store:supabaseShareStore(client),requireUser,origin,readBody:body}));
   else if(route==='/api/creator-workspace')response=json(await creatorWorkspace(request,{store:supabaseCreatorStore(client),requireUser,readBody:body}));
   else if(route==='/api/health')response=json({ok:true,auth:'supabase',billingMode:billing.config.mode});
   else if(route==='/api/auth/get-session')response=json({user:profile(await getUser())});
   else if(route==='/api/access'){
    const user=await getUser(),subscription=user&&billing.config.enabled?await readPaddleSubscription(client,user.id,billing.config.environment):null;
    response=json({canExport:Boolean(user)&&(!billing.config.requiresSubscription||Boolean(subscription?.hasAccess)),requiresSubscription:billing.config.requiresSubscription,billingMode:billing.config.mode,subscription});
   }
   else if(route==='/api/billing/checkout'&&request.method==='POST')response=json(await billing.checkout(await requireUser(),await body()));
   else if(route==='/api/billing/portal'&&request.method==='POST'){
    const input=await body();if(!input||typeof input!=='object'||Object.keys(input).length)throw fail(400,'Dados inválidos.');
    response=json(await billing.portal(await requireUser()));
   }
   else if(route==='/api/billing/subscription'&&request.method==='GET'){
    const user=await requireUser();response=json({subscription:billing.config.enabled?await readPaddleSubscription(client,user.id,billing.config.environment):null,billingMode:billing.config.mode});
   }
   else if(/^\/api\/site-audit\/(site|lab)$/.test(route)&&request.method==='POST'){
    const user=await requireUser();response=json({ok:true,[route.endsWith('/site')?'site':'lab']:await auditor.run(route.endsWith('/site')?'site':'lab',user,await body(),{signal:request.signal})});
   }
   else if(route==='/api/privacy/export'&&request.method==='GET'){
    const user=await requireUser();response=json(await exportPersonalData(user,client,{requiresBillingLedger:billing.config.requiresSubscription}));
    response.headers.set('Content-Disposition','attachment; filename="nitido-meus-dados.json"');
    securityEvent('privacy_export',200,{logger:securityLogger});
   }
   else if(route==='/api/privacy/profile'&&request.method==='PATCH'){
    await requireUser();const input=await body();
    if(typeof input.name!=='string'||!input.name.trim()||input.name.length>100||Object.keys(input).some(key=>key!=='name'))throw fail(400,'Informe um nome válido.');
    const data=check(await client.auth.updateUser({data:{name:input.name.trim()}}));response=json({user:profile(data.user)});
   }
   else if(route==='/api/privacy/delete'&&request.method==='POST'){
    const user=await requireUser();response=json(await deletePersonalAccount(user,client,await body(),{logger:securityLogger}));
   }
   else if(route==='/api/auth/callback'&&request.method==='GET'){
    if(!url.searchParams.get('code'))throw fail(400,'Link inválido ou expirado. Solicite um novo link.');
    const flowId=url.searchParams.get('sb_flow_id');
    check(await client.auth.exchangeCodeForSession(url.searchParams.get('code'),flowId?{flowId}:undefined));
    response=new Response(null,{status:303,headers:{Location:origin+safeNext(url.searchParams.get('next'))}});
   }else if(route==='/api/auth/verify-email'&&request.method==='POST'){
    const input=await body();
    if(typeof input.tokenHash!=='string'||!/^[A-Za-z0-9_=-]{20,1024}$/.test(input.tokenHash)||!['email','recovery'].includes(input.type))throw fail(400,'Link inválido ou expirado. Solicite um novo link.','confirmation_invalid');
    const data=check(await client.auth.verifyOtp({token_hash:input.tokenHash,type:input.type}));
    if(!data?.session||!data.user)throw fail(400,'Não foi possível validar o link. Solicite um novo link.','confirmation_invalid');
    response=json({ok:true,next:input.type==='recovery'?'/account/reset':'/'});
   }else if(route==='/api/auth/resend-confirmation'&&request.method==='POST'){
    const input=await body();
    if(typeof input.email!=='string'||input.email.length>254||!/^\S+@\S+\.\S+$/.test(input.email))throw fail(400,'Informe um e-mail válido.');
    check(await client.auth.resend({type:'signup',email:input.email,options:{emailRedirectTo:origin+'/api/auth/callback'}}));
    response=json({ok:true});
   }else if(route==='/api/auth/sign-up/email'&&request.method==='POST'){
    const input=await body();if(typeof input.name!=='string'||!input.name.trim()||input.name.length>100)throw fail(400,'Informe um nome válido.');
    if(!validNewPassword(input.password))throw fail(400,PASSWORD_REQUIREMENTS,'weak_password');
    if(input.termsAccepted!==true||input.policyVersion!==POLICY_VERSION)throw fail(400,'Leia e aceite os termos atuais.','terms_required');
    if(typeof input.email!=='string'||input.email.length>254||!/^\S+@\S+\.\S+$/.test(input.email)||input.password.length>1024)throw fail(400,'Informe e-mail e senha válidos.');
    // Informational acknowledgement, not a trusted entitlement or consent ledger.
    const data=check(await client.auth.signUp({email:input.email,password:input.password,options:{data:{name:input.name.trim(),terms_version:POLICY_VERSION,privacy_notice_version:POLICY_VERSION},emailRedirectTo:origin+'/api/auth/callback'}}));
    response=json({user:profile(data.user),verificationRequired:!data.session});
   }else if(route==='/api/auth/sign-in/email'&&request.method==='POST'){
    const input=await body();if(typeof input.email!=='string'||input.email.length>254||typeof input.password!=='string'||!input.password||input.password.length>1024)throw fail(400,'Informe e-mail e senha válidos.');const data=check(await client.auth.signInWithPassword({email:input.email,password:input.password}));response=json({user:profile(data.user)});
   }else if(route==='/api/auth/sign-out'&&request.method==='POST'){
    check(await client.auth.signOut({scope:'local'}));response=json({ok:true});
   }else if(route==='/api/auth/request-password-reset'&&request.method==='POST'){
    const input=await body();check(await client.auth.resetPasswordForEmail(input.email,{redirectTo:origin+'/api/auth/callback?next=/account/reset'}));response=json({ok:true});
   }else if(route==='/api/auth/reset-password'&&request.method==='POST'){
    await requireUser();const input=await body();if(!validNewPassword(input.newPassword)||input.newPassword.length>1024)throw fail(400,PASSWORD_REQUIREMENTS,'weak_password');
    check(await client.auth.updateUser({password:input.newPassword}));check(await client.auth.signOut({scope:'global'}));response=json({ok:true});
   }else if(route==='/api/workspace'){
    const user=await requireUser();
    if(request.method==='GET'){
     const {data,error}=await client.from('workspaces').select('revision,data,updated_at').eq('user_id',user.id).maybeSingle();
     if(error)throw fail(503,'Não foi possível carregar suas coleções.');
     response=json(data?{revision:data.revision,data:data.data,updatedAt:data.updated_at}:{revision:0,data:{saved:[],collections:[]}});
    }else if(request.method==='PUT'){
     const input=await body();if(!Number.isSafeInteger(input.revision)||input.revision<0)throw fail(400,'Revisão inválida.');
     const record={user_id:user.id,revision:input.revision+1,data:cleanWorkspace(input.data),updated_at:new Date().toISOString()};
     const query=input.revision===0?client.from('workspaces').insert(record):client.from('workspaces').update(record).eq('user_id',user.id).eq('revision',input.revision);
     const {data,error}=await query.select('revision,data,updated_at').maybeSingle();
     if(error?.code==='23505'||!error&&!data)throw fail(409,'Suas coleções foram alteradas em outra sessão.','revision_conflict');
     if(error)throw fail(503,'Não foi possível salvar suas coleções.');
     response=json({revision:data.revision,data:data.data,updatedAt:data.updated_at});
    }else throw fail(405,'Método não permitido.');
   }else if(route.startsWith('/api/billing/'))throw fail(503,'Assinaturas ainda não foram ativadas.','billing_disabled');
   else response=json({error:'Rota não encontrada.'},404);
   return finish(response);
  }catch(error){
   // Never expose a raw callback error or reflect the one-time code into a page.
   if(new URL(request.url).pathname==='/api/auth/callback'&&request.method==='GET'&&error.status!==503){const recovery=new URL(request.url).searchParams.get('next')==='/account/reset',missing=error.code==='pkce_code_verifier_not_found';return finish(new Response(null,{status:303,headers:{Location:origin+'/account?auth_error='+(recovery?'recovery_link':missing?'confirmation_browser':'confirmation_link'),'Referrer-Policy':'no-referrer'}}));}
   if(error.status===429)securityEvent('rate_limit',429,{logger:securityLogger});
   const response=finish(json({error:error.status?error.message:'Não foi possível concluir. Tente novamente.',code:error.code},error.status||500));
   if(error.status===429)response.headers.set('Retry-After',String(error.retryAfter||60));
   return response;
  }
 }
 async function isSignedIn(request){const {client}=clientFactory(request);const {data,error}=await client.auth.getUser();return !error&&Boolean(data?.user);}
 async function canAccessPlatform(request){
  const {client}=clientFactory(request);const {data,error}=await client.auth.getUser();
  if(error||!data?.user)return false;
  if(!billing.config.requiresSubscription)return true;
  if(!billing.config.enabled)return false;
  return Boolean((await readPaddleSubscription(client,data.user.id,billing.config.environment))?.hasAccess);
 }
 async function handle(request){return secureResponse(await handleInternal(request),request.url);}
 return{handle,isSignedIn,canReadCode:canAccessPlatform,canAccessPlatform,origin,close:()=>{}};
}
