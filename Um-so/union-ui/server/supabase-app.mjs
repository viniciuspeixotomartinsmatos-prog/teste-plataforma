import {requestClient} from './supabase-client.mjs';
import {safeNext} from '../src/auth-policy.js';

const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
const fail=(status,message,code)=>Object.assign(Error(message),{status,code});
const profile=user=>user?{id:user.id,email:user.email,name:String(user.user_metadata?.name||user.email?.split('@')[0]||'Criador')}:null;
function cleanWorkspace(value){
 if(!value||typeof value!=='object')throw fail(400,'Dados de coleção inválidos.');
 const ids=value=>Array.isArray(value)?[...new Set(value.filter(x=>typeof x==='string'&&x.length<200))].slice(0,20000):[];
 return{saved:ids(value.saved),collections:(Array.isArray(value.collections)?value.collections:[]).slice(0,500).map(c=>({id:String(c.id||'').slice(0,100),name:String(c.name||'Coleção').slice(0,80),items:ids(c.items)})).filter(c=>c.id)};
}
export function createSupabaseApplication({origin=process.env.APP_ORIGIN,clientFactory=requestClient}={}){
 async function handle(request){
  let finish=response=>response;
  try{
   const url=new URL(request.url),route=url.pathname;
   // An explicit canonical origin prevents request headers controlling email links.
   if(!origin||!/^https?:\/\//.test(origin))throw fail(503,'O acesso está em configuração. Tente novamente mais tarde.','auth_setup_required');
   if(!['GET','HEAD'].includes(request.method)&&request.headers.get('origin')!==origin)throw fail(403,'Origem não autorizada.');
   const context=clientFactory(request);finish=context.finish;const client=context.client;
   const body=async()=>{const text=await request.text();if(new TextEncoder().encode(text).byteLength>1500000)throw fail(413,'Arquivo muito grande.');try{return JSON.parse(text);}catch{throw fail(400,'Dados inválidos.');}};
   const getUser=async()=>{const {data,error}=await client.auth.getUser();if(error?.status>=500)throw fail(503,'Não foi possível verificar sua sessão. Tente novamente.');return data?.user||null;};
   const requireUser=async()=>{const user=await getUser();if(!user)throw fail(401,'Entre na sua conta para continuar.','sign_in_required');return user;};
   const check=result=>{if(result.error){const code=result.error.code;throw fail(result.error.status===429?429:400,code==='email_not_confirmed'?'Confirme seu e-mail antes de entrar.':code==='invalid_credentials'?'E-mail ou senha incorretos.':'Não foi possível concluir. Confira seus dados e tente novamente.',code);}return result.data;};
   let response;
   if(route==='/api/health')response=json({ok:true,auth:'supabase',billingMode:'disabled'});
   else if(route==='/api/auth/get-session')response=json({user:profile(await getUser())});
   else if(route==='/api/access')response=json({canExport:Boolean(await getUser()),requiresSubscription:false,billingMode:'disabled',subscription:null});
   else if(route==='/api/auth/callback'&&request.method==='GET'){
    if(!url.searchParams.get('code'))throw fail(400,'Link inválido ou expirado. Solicite um novo link.');
    check(await client.auth.exchangeCodeForSession(url.searchParams.get('code')));
    response=new Response(null,{status:303,headers:{Location:origin+safeNext(url.searchParams.get('next'))}});
   }else if(route==='/api/auth/sign-up/email'&&request.method==='POST'){
    const input=await body();if(typeof input.name!=='string'||!input.name.trim()||input.name.length>100||typeof input.password!=='string'||input.password.length<12)throw fail(400,'Informe seu nome e uma senha com pelo menos 12 caracteres.');
    const data=check(await client.auth.signUp({email:input.email,password:input.password,options:{data:{name:input.name.trim()},emailRedirectTo:origin+'/api/auth/callback'}}));
    response=json({user:profile(data.user),verificationRequired:!data.session});
   }else if(route==='/api/auth/sign-in/email'&&request.method==='POST'){
    const input=await body();const data=check(await client.auth.signInWithPassword({email:input.email,password:input.password}));response=json({user:profile(data.user)});
   }else if(route==='/api/auth/sign-out'&&request.method==='POST'){
    check(await client.auth.signOut({scope:'local'}));response=json({ok:true});
   }else if(route==='/api/auth/request-password-reset'&&request.method==='POST'){
    const input=await body();check(await client.auth.resetPasswordForEmail(input.email,{redirectTo:origin+'/api/auth/callback?next=/account/reset'}));response=json({ok:true});
   }else if(route==='/api/auth/reset-password'&&request.method==='POST'){
    await requireUser();const input=await body();if(typeof input.newPassword!=='string'||input.newPassword.length<12)throw fail(400,'Use pelo menos 12 caracteres.');
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
  }catch(error){return finish(json({error:error.status?error.message:'Não foi possível concluir. Tente novamente.',code:error.code},error.status||500));}
 }
 async function isSignedIn(request){const {client}=clientFactory(request);const {data,error}=await client.auth.getUser();return !error&&Boolean(data?.user);}
 return{handle,isSignedIn,canReadCode:isSignedIn,origin,close:()=>{}};
}
