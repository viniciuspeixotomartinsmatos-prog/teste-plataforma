import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

test('submission freezes source and a different moderator controls verified publication, reports and removal',async()=>{
 const db=new PGlite();
 const author='00000000-0000-4000-8000-000000000001',reviewer='00000000-0000-4000-8000-000000000002',draft='00000000-0000-4000-8000-000000000003';
 const identity=async(id,moderator=false)=>{
   await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",[id,JSON.stringify({app_metadata:{nitido_moderator:moderator}})]);
 };
 const command=async(action,input={})=>(await db.query('select public.creator_command($1,$2) as value',[action,JSON.stringify(input)])).rows[0].value;
 const gallery=async()=>(await db.query('select public.creator_gallery() as value')).rows[0].value;
 try{
   await db.exec("create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create function auth.jwt() returns jsonb language sql as $$select current_setting('request.jwt.claims',true)::jsonb$$;grant usage on schema auth to authenticated;");
   for(const name of ['20261110_creator_workspaces.sql','20261111_creator_review.sql','20261111_creator_metrics.sql'])await db.exec(await readFile('supabase/migrations/'+name,'utf8'));
   await db.query('insert into auth.users values ($1),($2)',[author,reviewer]);
   await identity(author);
   const workspace={profile:{displayName:'Test author',bio:'Public bio'},drafts:[{id:draft,name:'Button',source:'original source',license:'Own',rightsConfirmed:true}]};
   await db.query('insert into public.creator_workspaces(user_id,revision,data) values ($1,1,$2)',[author,JSON.stringify(workspace)]);
   await db.exec('set role authenticated');
   await assert.rejects(command('submit',{draft}));
   const v1=await command('submit',{draft,consent:true});
   assert.deepEqual(await command('submit',{draft,consent:true}),v1);
   assert.deepEqual(await gallery(),[]);
   const approval={id:v1.id,decision:'approved',tested:true,licensed:true};
   await assert.rejects(command('review',approval));
   await identity(author,true);await assert.rejects(command('review',approval));
   await identity(reviewer);await assert.rejects(command('source',{id:v1.id}));
   await identity(reviewer,true);await assert.rejects(command('review',{...approval,tested:false}));await command('review',approval);
   assert.equal((await db.query('select public.creator_metrics() as m')).rows[0].m.published,1);
   await db.exec('reset role;set role anon');
   const published=await gallery();
   assert.equal(published[0].display_name,'Test author');assert.equal(published[0].version,1);
   assert.equal(published[0].snapshot,undefined);assert.equal(published[0].owner_id,undefined);
   await assert.rejects(command('source',{id:v1.id}));
   await db.exec('reset role;set role authenticated');await identity(author);
   workspace.drafts[0].source='new source';
   await db.query('update public.creator_workspaces set revision=2,data=$1 where user_id=$2',[JSON.stringify(workspace),author]);
   const v2=await command('submit',{draft,consent:true});assert.equal(v2.version,2);
   assert.equal((await command('source',{id:v1.id})).source,'original source');
   await command('report',{id:v1.id,reason:'Review this record'});
   assert.equal((await command('export')).versions.length,2);
   await identity(reviewer,true);assert.equal((await command('reports')).length,1);
   await command('review',{...approval,id:v2.id});
   assert.equal((await gallery())[0].version,2);
   await command('withdraw',{id:v2.id,reason:'Withdraw technical test'});
   assert.deepEqual(await gallery(),[]);
 } finally{await db.close();}
});
