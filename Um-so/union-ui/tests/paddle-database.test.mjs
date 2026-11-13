import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
// Isolated PostgreSQL WASM harness; never points at the live Supabase account.
const modulePath=process.env.PADDLE_TEST_PGLITE_MODULE||'@electric-sql/pglite';
test('Paddle PostgreSQL RPC ledger is atomic, idempotent, ordered and ownership-bound',{skip:!modulePath},async()=>{
 const {PGlite}=await import(modulePath);const db=new PGlite();
 try{
 await db.exec(`create role anon; create role authenticated; create role service_role;
 create schema auth; create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`);
 await db.exec(await readFile(new URL('../supabase/migrations/20261106_paddle_billing.sql',import.meta.url),'utf8'));
 const user='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
 const id=(prefix,letter='a')=>prefix+'_'+letter.repeat(26);
 await db.query('insert into auth.users(id) values($1),($2)',[user,other]);
 await db.query('select paddle_bind_customer($1,$2,$3)',[user,'sandbox',id('ctm')]);
 const reservation='33333333-3333-4333-8333-333333333333';
 await db.query('select paddle_reserve_checkout($1,$2,$3,$4,$5)',[user,'sandbox','monthly',id('pri'),reservation]);
 await db.query('select paddle_bind_checkout($1,$2,$3,$4,$5,$6,$7)',[user,'sandbox',id('ctm'),id('txn'),'monthly',id('pri'),reservation]);
 let sequence=0;
 const event=(extra={})=>({id:id('evt',String.fromCharCode(97+sequence++)),type:'transaction.completed',occurred_at:'2026-11-06T12:00:00Z',customer_id:id('ctm'),subscription_id:id('sub'),transaction_id:id('txn'),plan_id:'monthly',price_id:id('pri'),status:'active',paid_through:'2026-12-06T12:00:00Z',cancel_at_period_end:false,revoke:false,payment_completed:true,...extra});
 const apply=e=>db.query('select paddle_apply_event($1,$2) result',['sandbox',JSON.stringify(e)]);
 // No user/custom_data is accepted as evidence of ownership.
 await assert.rejects(()=>apply(event({transaction_id:id('txn','z')})),/unbound transaction/);
 assert.equal((await db.query('select count(*)::int n from paddle_events')).rows[0].n,0);
 const activated=event({type:'subscription.activated',payment_completed:false,paid_through:null});
 await apply(activated);
 assert.equal((await db.query('select payment_confirmed from paddle_subscriptions')).rows[0].payment_confirmed,false);
 const paid=event();await apply(paid);
 assert.equal((await apply(paid)).rows[0].result.duplicate,true);
 assert.equal((await db.query('select count(*)::int n from paddle_events')).rows[0].n,2);
 await apply(event({type:'subscription.updated',occurred_at:'2026-11-07T12:00:00Z',payment_completed:false,status:'canceled',cancel_at_period_end:true,paid_through:null}));
 await apply(event({type:'subscription.updated',occurred_at:'2026-11-05T12:00:00Z',payment_completed:false,status:'active',paid_through:null}));
 let sub=(await db.query('select * from paddle_subscriptions')).rows[0];assert.equal(sub.status,'canceled');assert.equal(sub.cancel_at_period_end,true);assert.equal(sub.payment_confirmed,true);
 await assert.rejects(()=>apply(event({customer_id:id('ctm','z')})),/customer mismatch|unbound customer/);
 // An old chargeback still revokes, and a late completed retry never removes revocation.
 await apply(event({type:'adjustment.created',occurred_at:'2026-11-04T12:00:00Z',payment_completed:false,revoke:true,paid_through:null}));
 await apply(event());sub=(await db.query('select * from paddle_subscriptions')).rows[0];assert.equal(sub.revoked,true);
 await db.exec(`set role authenticated; set request.jwt.claim.sub='${other}';`);
 assert.equal((await db.query('select * from paddle_subscriptions')).rows.length,0);
 await assert.rejects(()=>db.query('select paddle_apply_event($1,$2)',['sandbox',JSON.stringify(event())]),/permission denied/);
 await assert.rejects(()=>db.query('update paddle_subscriptions set revoked=false'),/permission denied/);
 }finally{await db.close();}
});
test('expired/revoked subscriptions can be replaced; late historical events never change current access',{skip:!modulePath},async()=>{
 const {PGlite}=await import(modulePath);const db=new PGlite();
 try{
 await db.exec(`create role anon; create role authenticated; create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$ select null::uuid $$;`);
 await db.exec(await readFile(new URL('../supabase/migrations/20261106_paddle_billing.sql',import.meta.url),'utf8'));
 const user='11111111-1111-4111-8111-111111111111',id=(p,c='a')=>p+'_'+c.repeat(26);let seq=0;
 await db.query('insert into auth.users values($1)',[user]);
 await db.query('select paddle_bind_customer($1,$2,$3)',[user,'sandbox',id('ctm')]);
 const bind=async c=>{
  const reservation='33333333-3333-4333-8333-333333333333';
  const result=await db.query('select paddle_reserve_checkout($1,$2,$3,$4,$5) r',[user,'sandbox','monthly',id('pri'),reservation]);
  if(result.rows[0].r.state!=='reserved')throw Error('subscription already paid or pending');
  return db.query('select paddle_bind_checkout($1,$2,$3,$4,$5,$6,$7)',[user,'sandbox',id('ctm'),id('txn',c),'monthly',id('pri'),reservation]);
 };
 const event=(c,extra={})=>({id:id('evt',String.fromCharCode(97+seq++)),type:'transaction.completed',occurred_at:new Date().toISOString(),customer_id:id('ctm'),subscription_id:id('sub',c),transaction_id:id('txn',c),plan_id:'monthly',price_id:id('pri'),status:'active',paid_through:new Date(Date.now()+86400000).toISOString(),payment_completed:true,revoke:false,cancel_at_period_end:false,...extra});
 const apply=e=>db.query('select paddle_apply_event($1,$2)',['sandbox',JSON.stringify(e)]);
 await bind('a');await assert.rejects(()=>bind('z'),/pending/);await apply(event('a',{status:'canceled',paid_through:new Date(Date.now()-86400000).toISOString()}));
 await bind('b');await apply(event('b'));
 let current=(await db.query('select * from paddle_subscriptions where is_current')).rows;
 assert.equal(current.length,1);assert.equal(current[0].subscription_id,id('sub','b'));
 // An unbound second draft cannot create another current paid entitlement.
 await assert.rejects(()=>apply(event('z')),/unbound transaction/);
 await apply(event('a',{type:'adjustment.created',payment_completed:false,paid_through:null,revoke:true}));
 current=(await db.query('select * from paddle_subscriptions where is_current')).rows;
 assert.equal(current[0].subscription_id,id('sub','b'));assert.equal(current[0].revoked,false);
 // A canceled prepaid subscription is still paid-through; a second checkout is prohibited.
 await apply(event('b',{type:'subscription.canceled',payment_completed:false,status:'canceled',paid_through:null}));
 await assert.rejects(()=>bind('c'),/subscription already paid/);
 await apply(event('b',{type:'adjustment.created',payment_completed:false,paid_through:null,revoke:true}));
 await bind('c');await apply(event('c'));
 await apply(event('b',{paid_through:new Date(Date.now()+999999999).toISOString()}));
 current=(await db.query('select * from paddle_subscriptions where is_current')).rows;
 assert.equal(current[0].subscription_id,id('sub','c'));assert.equal(current[0].revoked,false);
 assert.equal((await db.query('select count(*)::int n from paddle_subscriptions')).rows[0].n,3);
 // Simultaneous draft checkouts cannot supersede the current paid subscription.
 await assert.rejects(()=>apply(event('d')),/unbound transaction/);
 }finally{await db.close();}
});
test('reservation RPC serializes double clicks and never expires into a second payable checkout',{skip:!modulePath},async()=>{
 const {PGlite}=await import(modulePath);const db=new PGlite();
 try{
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$ select null::uuid $$;`);
 await db.exec(await readFile(new URL('../supabase/migrations/20261106_paddle_billing.sql',import.meta.url),'utf8'));
 const user='11111111-1111-4111-8111-111111111111',one='33333333-3333-4333-8333-333333333333',two='44444444-4444-4444-8444-444444444444',id=(p,c='a')=>p+'_'+c.repeat(26);
 await db.query('insert into auth.users values($1)',[user]);
 await db.query('select paddle_bind_customer($1,$2,$3)',[user,'sandbox',id('ctm')]);
 const reserve=(token=one,price=id('pri'))=>db.query('select paddle_reserve_checkout($1,$2,$3,$4,$5) r',[user,'sandbox','monthly',price,token]);
 const results=await Promise.all([reserve(one),reserve(two)]);
 assert.deepEqual(results.map(r=>r.rows[0].r.state).sort(),['creating','reserved']);
 const token=results.find(r=>r.rows[0].r.state==='reserved').rows[0].r.reservation;
 await db.exec(`update paddle_checkout_reservations set expires_at=now()-interval '1 hour'`);
 assert.equal((await reserve()).rows[0].r.state,'stale');
 await db.query('select paddle_bind_checkout($1,$2,$3,$4,$5,$6,$7)',[user,'sandbox',id('ctm'),id('txn'),'monthly',id('pri'),token]);
 const pending=(await reserve()).rows[0].r;assert.equal(pending.state,'pending');assert.equal(pending.transaction_id,id('txn'));
 assert.equal((await reserve(two,id('pri','b'))).rows[0].r.state,'different');
 // Wrong transaction cannot release another payable reservation.
 assert.equal((await db.query('select paddle_release_checkout($1,$2,$3,$4) r',[user,'sandbox',id('txn','z'),token])).rows[0].r,false);
 assert.equal((await reserve()).rows[0].r.state,'pending');
 assert.equal((await db.query('select paddle_release_checkout($1,$2,$3,$4) r',[user,'sandbox',id('txn'),token])).rows[0].r,true);
 assert.equal((await reserve(two)).rows[0].r.state,'reserved');
 }finally{await db.close();}
});
