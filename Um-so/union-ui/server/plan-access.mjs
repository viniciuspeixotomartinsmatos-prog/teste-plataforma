import {createClient} from '@supabase/supabase-js';
import {creativeTools,includesPlan,planPermission,planQuotas,proPromptWeeklyLimit} from '../src/plan-access.js';
import {paddleId,readPaddleSubscription,fail} from './paddle-access.mjs';
import packages from '../public/data/skill-packages/index.json' with {type:'json'};
import {packageType} from '../src/skill-library-model.js';

// Production always enforces entitlements, including while checkout is disabled.
export const plansActive=env=>env.VERCEL_ENV==='production'||env.NITIDO_PLAN_ACCESS_ENABLED==='true';
const skillDirectory='/data/skill-packages/';
const designFiles=new Set(packages.filter(row=>packageType(row)==='design').flatMap(row=>[row.id+'.txt',row.id+'.zip',row.markdown].filter(Boolean)));
export const isPlanAsset=pathname=>/^\/(code\/|data\/skill-packages\/|tools-runtime\/umso\.html$)/.test(pathname);

function configuredTier(env,priceId){
 if(!paddleId(priceId,'pri'))return null;
 try{
  const tiers=JSON.parse(env.NITIDO_PADDLE_PRICE_TIERS||'{}');
  return Object.hasOwn(tiers,priceId)&&['pro','max'].includes(tiers[priceId])?tiers[priceId]:null;
 }catch{return null;}
}

export async function resolvePlan(client,user,billing,env=process.env,subscription){
 const grant=user.app_metadata?.nitido_plan;
 if(grant==='max'||grant==='pro')return grant;
 if(billing.environment!=='live'||!billing.enabled)return 'free';
 const paid=subscription===undefined?await readPaddleSubscription(client,user.id,'live',{includePrice:true}):subscription;
 return paid?.hasAccess?(billing.tierPlans?.find(plan=>plan.priceId===paid.priceId)?.tier||configuredTier(env,paid.priceId)||'free'):'free';
}

export function quotaStore(env){
 const url=env.SUPABASE_URL,key=env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key||new URL(url).protocol!=='https:')throw fail(503,'As cotas estão em configuração.','plan_setup_required');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

export async function consumePlanQuota(getStore,userId,plan,action,resource,operation){
 const {allowed,limit,weeklyLimit}=planPermission(plan,action,resource);
 if(!allowed||limit===undefined)throw fail(403,'Este recurso precisa de outro plano.','plan_required');
 if(limit===null)return {remaining:null,resetAt:null};
 const args={p_user:userId,p_limit:limit,p_operation:operation,p_resource:resource};
 const {data,error}=action==='prompt'
  ?await getStore().rpc('nitido_unlock_prompt',{...args,p_weekly_limit:weeklyLimit})
  :await getStore().rpc('nitido_consume_plan_quota',{...args,p_bucket:action});
 if(error)throw fail(503,'Não foi possível consultar sua cota. Tente novamente.','plan_quota_unavailable');
 if(!data?.allowed){
  const error=fail(429,data?.period==='week'?'Você atingiu sua cota semanal de prompts.':'Você atingiu sua cota mensal para este recurso.','plan_quota_reached');
  const reset=Date.parse(data?.resetAt);
  if(Number.isFinite(reset))error.retryAfter=Math.max(1,Math.ceil((reset-Date.now())/1000));
  throw error;
 }
 return {remaining:data.remaining,resetAt:data.resetAt,...(weeklyLimit===null||weeklyLimit===undefined?{}:{weeklyRemaining:data.weeklyRemaining})};
}

export async function readPlanQuotas(store,userId,plan){
 const {data,error}=await store.rpc('nitido_read_plan_quotas',{p_user:userId});
 if(error)throw fail(503,'Não foi possível consultar sua cota.','plan_quota_unavailable');
 const limits=plan==='pro'?{...planQuotas.pro,prompt_weekly:proPromptWeeklyLimit}:planQuotas[plan];
 return Object.fromEntries(Object.entries(limits).map(([key,limit])=>[key,{limit,remaining:limit===null?null:Math.max(0,limit-(data?.[key]||0))}]));
}

export async function enforcePlanAsset(request,plan,user,env){
 const url=new URL(request.url),path=decodeURIComponent(url.pathname);
 if(path.startsWith('/code/'))throw fail(403,'Use Copiar prompt na página do componente.','catalog_prompt_only');
 if(path.startsWith(skillDirectory)){
  const file=path.slice(skillDirectory.length);
  if(designFiles.has(file)&&plan!=='max')throw fail(403,'Design Systems está disponível no Max.','plan_required');
  if(file.endsWith('.zip')&&!includesPlan(plan,'pro'))throw fail(403,'Os downloads de Skills estão disponíveis no Pro e no Max.','plan_required');
 }
 if(path!=='/tools-runtime/umso.html')return;
 if(!['GET','HEAD'].includes(request.method))throw fail(405,'Método não permitido.');
 if(request.headers.get('sec-fetch-site')==='cross-site')throw fail(403,'Abra a ferramenta no nitido.','plan_launch_required');
 const tool=url.searchParams.get('tool'),operation=url.searchParams.get('launch');
 if(!creativeTools.includes(tool)||!operation||!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(operation))throw fail(403,'Abra a ferramenta pelo catálogo.','plan_launch_required');
 if(!planPermission(plan,'studio',tool).allowed)throw fail(403,'Esta ferramenta precisa de outro plano.','plan_required');
 if(request.method==='HEAD')return;
 await consumePlanQuota(()=>quotaStore(env),user.id,plan,'studio',tool,operation);
}
