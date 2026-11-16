import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {includesPlan,planPermission} from '../src/plan-access.js';
import {enforcePlanAsset,resolvePlan} from '../server/plan-access.mjs';
import {createSupabaseApplication} from '../server/supabase-app.mjs';

test('entitlements are cumulative and only trusted production subscriptions grant a mapped tier',async()=>{
 assert.equal(includesPlan('pro','free'),true);
 assert.equal(includesPlan('pro','max'),false);
 assert.equal(planPermission('free','prompt','reactbits--aurora').limit,5);
 assert.equal(planPermission('free','prompt','other').allowed,false);
 assert.deepEqual(planPermission('pro','prompt','demo'),{allowed:true,limit:60,weeklyLimit:15});
 assert.equal(planPermission('pro','studio','center-stage').allowed,false);
 assert.equal(planPermission('max','audit','site').limit,null);
 const user={id:'qa',user_metadata:{nitido_plan:'max'}};
 const priceId='pri_'+'a'.repeat(26);
 const env={NITIDO_PADDLE_PRICE_TIERS:JSON.stringify({[priceId]:'pro'})};
 const paid={priceId,hasAccess:true};
 assert.equal(await resolvePlan(null,user,{enabled:true,environment:'sandbox'},env,paid),'free');
 assert.equal(await resolvePlan(null,user,{enabled:true,environment:'live'},env,paid),'pro');
 assert.equal(await resolvePlan(null,user,{enabled:true,environment:'live'},env,{...paid,hasAccess:false}),'free');
 assert.equal(await resolvePlan(null,{...user,app_metadata:{nitido_plan:'max'}},{enabled:false},{}),'max');
 await assert.rejects(enforcePlanAsset(new Request('https://nitido.example/code/secret.json'),'free',user,{}),{status:403});
 await assert.rejects(enforcePlanAsset(new Request('https://nitido.example/data/skill-packages/profitize-estilo-wise.zip'),'pro',user,{}),{status:403});
 await assert.rejects(enforcePlanAsset(new Request('https://nitido.example/tools-runtime/umso.html?tool=center-stage&launch='+randomUUID()),'pro',user,{}),{status:403});
});

test('access API lets a signed-in free account browse, while restricted actions require the right tier and quota',async()=>{
 const origin='https://nitido.example';
 let user=null,used=0;
 const unlocked=new Set();
 const app=createSupabaseApplication({
  origin,billingEnv:{NITIDO_PLAN_ACCESS_ENABLED:'true'},limiter:()=>{},
  clientFactory:()=>({finish:response=>response,client:{auth:{getUser:async()=>({data:{user}})}}}),
  planStore:()=>({rpc:async(name,args)=>{
   if(name==='nitido_read_plan_quotas')return {data:{prompt:used,prompt_weekly:used}};
   assert.equal(name,'nitido_unlock_prompt');
   if(unlocked.has(args.p_resource))return {data:{allowed:true,remaining:args.p_limit-used}};
   if(args.p_weekly_limit!==null){
    assert.equal(args.p_limit,60);
    assert.equal(args.p_weekly_limit,15);
    if(used>=args.p_weekly_limit)return {data:{allowed:false,period:'week'}};
   }
   const allowed=used<args.p_limit;
   if(allowed){used++;unlocked.add(args.p_resource);}
   return {data:{allowed,remaining:args.p_limit-used}};
  }})
 });
 const request=(path,value)=>app.handle(new Request(origin+path,value===undefined?undefined:{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(value)}));
 const prompt=resource=>request('/api/plan-usage',{resource,operation:randomUUID()});
 assert.equal((await prompt('reactbits--aurora')).status,401);
 user={id:randomUUID(),app_metadata:{}};
 assert.equal(await app.canAccessPlatform(new Request(origin+'/')),true);
 const access=await (await request('/api/access')).json();
 assert.equal(access.plan,'free');
 assert.equal(access.canExport,false);
 assert.equal((await prompt('private-example')).status,403);
 assert.equal((await request('/api/site-audit/site',{url:'https://example.org'})).status,403);
 for(const sample of ['reactbits--aurora','reactbits--orb','reactbits--magic-bento','aceternity--background-beams','kokonut-background-paths']){
  assert.equal((await prompt(sample)).status,200);
 }
 assert.equal((await prompt('reactbits--aurora')).status,200);
 assert.equal(used,5);
 const usage=await (await request('/api/plan-usage')).json();
 assert.equal(usage.quotas.prompt.remaining,0);
 user.app_metadata={nitido_plan:'max'};
 assert.equal((await prompt('private-example')).status,200);
 assert.equal(used,5);
 assert.equal((await request('/api/billing/checkout',{})).status,503);
 user.app_metadata={nitido_plan:'pro'};
 for(let i=0;i<10;i++)assert.equal((await prompt('private-example-'+i)).status,200);
 assert.equal((await prompt('private-example-0')).status,200);
 const blocked=await prompt('private-example-new');
 assert.equal(blocked.status,429);
 assert.match((await blocked.json()).error,/cota semanal/);
 assert.deepEqual((await (await request('/api/plan-usage')).json()).quotas.prompt_weekly,{limit:15,remaining:0});
});

test('monthly quota receipts are idempotent, owner-scoped and only callable by service role',async()=>{
 const db=new PGlite();
 try{
  await db.exec('create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key);');
  await db.exec(await readFile(new URL('../supabase/migrations/20261116183000_nitido_plan_quotas.sql',import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('../supabase/migrations/20261116190000_nitido_weekly_prompts.sql',import.meta.url),'utf8'));
  const owner=randomUUID(),other=randomUUID(),operation=randomUUID();
  await db.query('insert into auth.users values($1),($2)',[owner,other]);
  const consume=(user,id,resource='demo')=>db.query("select public.nitido_consume_plan_quota($1,'prompt',1,$2,$3) result",[user,id,resource]);
  await db.exec('set role authenticated');
  await assert.rejects(consume(owner,operation),{code:'42501'});
  await db.exec('set role service_role');
  assert.equal((await consume(owner,operation)).rows[0].result.allowed,true);
  assert.equal((await consume(owner,operation)).rows[0].result.allowed,true);
  assert.equal((await consume(owner,operation,'other-resource')).rows[0].result.allowed,false);
  assert.equal((await consume(owner,randomUUID())).rows[0].result.allowed,false);
  assert.equal((await consume(other,operation)).rows[0].result.allowed,true);
  await db.exec('reset role');
  await db.query('delete from auth.users where id=$1',[owner]);
  assert.equal((await db.query('select count(*)::int total from public.nitido_plan_operations')).rows[0].total,1);
  const weeklyOperation=randomUUID();
  const consumeWeekly=async id=>(await db.query('select public.nitido_consume_prompt_quota($1,60,$2,$3,15) result',[other,id,'demo'])).rows[0].result;
  await db.exec('set role authenticated');
  await assert.rejects(consumeWeekly(weeklyOperation),{code:'42501'});
  await db.exec('set role service_role');
  assert.equal((await consumeWeekly(weeklyOperation)).weeklyRemaining,13);
  for(let i=0;i<13;i++)assert.equal((await consumeWeekly(randomUUID())).allowed,true);
  assert.equal((await consumeWeekly(randomUUID())).period,'week');
  assert.equal((await consumeWeekly(weeklyOperation)).allowed,true);
  await db.exec('reset role');
  await db.query("update public.nitido_plan_operations set used_at=now()-interval '7 days' where user_id=$1",[other]);
  await db.query('update public.nitido_plan_usage set used=59 where user_id=$1',[other]);
  assert.equal((await consumeWeekly(randomUUID())).weeklyRemaining,14);
  const monthlyBlocked=await consumeWeekly(randomUUID());
  assert.equal(monthlyBlocked.allowed,false);
  assert.equal(monthlyBlocked.remaining,0);

  await db.exec(await readFile(new URL('../supabase/migrations/20261116193000_nitido_prompt_unlocks.sql',import.meta.url),'utf8'));
  const unlock=async (user,resource)=>(await db.query('select public.nitido_unlock_prompt($1,60,$2,$3,15) result',[user,randomUUID(),resource])).rows[0].result;
  await db.exec('set role authenticated');
  await assert.rejects(unlock(other,'demo'),{code:'42501'});
  await db.exec('set role service_role');
  assert.equal((await unlock(other,'demo')).allowed,true);
  assert.equal((await unlock(other,'new')).allowed,false);
  await db.exec('reset role');
  const fresh=randomUUID();
  await db.query('insert into auth.users values($1)',[fresh]);
  assert.equal((await unlock(fresh,'demo')).weeklyRemaining,14);
  assert.equal((await unlock(fresh,'demo')).weeklyRemaining,14);
  for(let i=0;i<14;i++)assert.equal((await unlock(fresh,'new-'+i)).allowed,true);
  assert.equal((await unlock(fresh,'new-blocked')).period,'week');
  const repeated=await unlock(fresh,'demo');
  assert.equal(repeated.allowed,true);
  assert.equal(repeated.weeklyRemaining,0);
  await db.query('delete from public.nitido_plan_usage where user_id=$1',[fresh]);
  assert.equal((await unlock(fresh,'demo')).weeklyRemaining,15);
  await db.query('delete from auth.users where id=$1',[fresh]);
  assert.equal((await db.query('select count(*)::int total from public.nitido_prompt_unlocks where user_id=$1',[fresh])).rows[0].total,0);
 }finally{await db.close();}
});
