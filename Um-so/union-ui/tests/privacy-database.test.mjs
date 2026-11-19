import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

test('actual PostgreSQL workspace policies enforce owner isolation, WITH CHECK and deletion cascades',async()=>{
 const db=new PGlite(),one='11111111-1111-4111-8111-111111111111',two='22222222-2222-4222-8222-222222222222',other='33333333-3333-4333-8333-333333333333';
 try{
  await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
  await db.exec(await fs.readFile('supabase/migrations/20261104_accounts.sql','utf8'));
  await db.exec('grant truncate, references, trigger on public.workspaces to authenticated');
  await db.exec(await fs.readFile('supabase/migrations/20261110_workspace_grants.sql','utf8'));
  await db.query('insert into auth.users values($1),($2),($3)',[one,two,other]);
  await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[one]);
  await assert.rejects(db.exec('truncate public.workspaces'),error=>error.code==='42501');
  const malicious="<script>fetch('/api/secrets')</script>');delete from auth.users;--";
  await db.query('insert into public.workspaces(user_id,revision,data) values($1,1,$2)',[one,JSON.stringify({saved:[],collections:[{id:'one',name:malicious,items:[]}]})]);
  assert.equal((await db.query('select data from public.workspaces')).rows[0].data.collections[0].name,malicious);
  await assert.rejects(db.query('update public.workspaces set user_id=$1 where user_id=$2',[other,one]),error=>error.code==='42501');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[two]);assert.equal((await db.query('select * from public.workspaces')).rows.length,0);
  assert.equal((await db.query('update public.workspaces set revision=2 where user_id=$1 returning *',[one])).rows.length,0);
  assert.equal((await db.query('delete from public.workspaces where user_id=$1 returning *',[one])).rows.length,0);
  await assert.rejects(db.query('insert into public.workspaces(user_id,revision) values($1,1)',[other]),error=>error.code==='42501');
  await db.query('insert into public.workspaces(user_id,revision) values($1,1)',[two]);
  await db.exec('reset role;set role anon');await assert.rejects(db.query('select * from public.workspaces'),error=>error.code==='42501');
  await db.exec('reset role');await db.query('delete from auth.users where id=$1',[one]);const remaining=(await db.query('select user_id from public.workspaces')).rows;assert.deepEqual(remaining,[{user_id:two}]);assert.equal((await db.query('select count(*)::int n from auth.users')).rows[0].n,2);
 }finally{await db.close();}
});
