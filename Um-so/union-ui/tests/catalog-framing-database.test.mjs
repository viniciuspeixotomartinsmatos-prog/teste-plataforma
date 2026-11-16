import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createSupabaseApplication} from '../server/supabase-app.mjs';

test('authenticated catalog readers cannot write; live moderator revocation blocks the RPC',async()=>{
 const db=new PGlite();
 try {
  await db.exec(`create role anon; create role authenticated;
   create schema auth; create schema nitido_community;
   create table auth.users(id uuid primary key, raw_app_meta_data jsonb);
   create function auth.uid() returns uuid language sql as $$
   select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;`);
  const roleAudit=await readFile(new URL('../supabase/migrations/20261111_creator_role_audit.sql',import.meta.url),'utf8');
  await db.exec(roleAudit.split('create table if not exists')[0]);
  await db.exec(await readFile(new URL('../supabase/migrations/20261116_catalog_preview_framing.sql',import.meta.url),'utf8'));
  const id='f65f627a-c8fe-48db-8370-a6fa51acc7a6';
  await db.query('insert into auth.users values($1,$2)',[id,{nitido_moderator:true}]);
  await db.exec('set role anon');
  await assert.rejects(db.query('select * from public.catalog_preview_framing'),error=>error.code==='42501');
  await db.exec('set role authenticated');
  await assert.rejects(db.query("select public.save_catalog_preview_framing('demo','{}')"),error=>error.code==='42501');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);
  await db.query("select public.save_catalog_preview_framing('demo','{\"fit\":\"cover\"}')");
  await db.query("select public.save_catalog_preview_framing('demo','{\"fit\":\"contain\"}')");
  assert.deepEqual((await db.query('select resource_id,settings from public.catalog_preview_framing')).rows,[{resource_id:'demo',settings:{fit:'contain'}}]);
  await assert.rejects(db.query("update public.catalog_preview_framing set settings='{}'"),error=>error.code==='42501');
  await db.exec("reset role; update auth.users set raw_app_meta_data='{}'; set role authenticated");
  await assert.rejects(db.query("select public.save_catalog_preview_framing('demo','{}')"),error=>error.code==='42501');
 } finally {await db.close();}
});

test('framing API requires a session, ignores self-declared roles and normalizes moderator inputs',async()=>{
 let user=null,lastWrite;
 const origin='https://catalog.test';
 const client={
  auth:{getUser:async()=>({data:{user}})},
  rpc:async(name,parameters)=>{lastWrite={name,parameters};return {error:null};}
 };
 const app=createSupabaseApplication({origin,clientFactory:()=>({client,finish:response=>response}),limiter:()=>{}});
 const write=()=>app.handle(new Request(origin+'/api/catalog-framing',{method:'PUT',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({id:'demo',settings:{fit:'custom',x:2,zoom:3,ignored:'test'}})}));
 assert.equal((await write()).status,401);
 user={id:'qa',user_metadata:{nitido_moderator:true}};
 assert.equal((await write()).status,403);
 assert.equal(lastWrite,undefined);
 user.app_metadata={nitido_moderator:true};
 assert.equal((await write()).status,200);
 assert.equal(lastWrite.name,'save_catalog_preview_framing');
 assert.equal(lastWrite.parameters.p_settings.x,1);
 assert.equal(lastWrite.parameters.p_settings.zoom,1.15);
 assert.equal(lastWrite.parameters.p_settings.ignored,undefined);
});
