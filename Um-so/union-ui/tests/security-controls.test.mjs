import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {protectedPath} from '../src/auth-policy.js';
import {createRequestLimiter,readJSONObject,securityHeaders,securityEvent} from '../server/security-controls.mjs';
import {createSupabaseApplication} from '../server/supabase-app.mjs';
import {createApplication} from '../server/application.mjs';
import {requestClient} from '../server/supabase-client.mjs';
import {exportPersonalData,deletePersonalAccount,POLICY_VERSION} from '../server/privacy-service.mjs';
import {renderLegalPage,legalRoutes} from '../server/legal-pages.mjs';
import {encryptBackup,decryptBackup,backupKey} from '../scripts/backup-encryption.mjs';
const origin='https://platform.example';
test('normal session client rejects privileged keys and non-TLS production auth endpoints',()=>{
 const base={SUPABASE_URL:'https://mock.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_mock'};
 for(const env of [{...base,SUPABASE_PUBLISHABLE_KEY:'sb_secret_demo_not_a_real_key'},{...base,SUPABASE_PUBLISHABLE_KEY:' sb_secret_demo_not_a_real_key '},{...base,SUPABASE_PUBLISHABLE_KEY:'x.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.x'},{...base,SUPABASE_URL:'http://mock.supabase.co'},{...base,SUPABASE_URL:'http://localhost',NODE_ENV:'production'},{...base,SUPABASE_URL:'ftp://localhost'}])assert.throws(()=>requestClient(new Request(origin),{env}),error=>error.status===503);
});
const request=(route,input,method=input===undefined?'GET':'POST',headers={})=>new Request(origin+route,{method,headers:{origin,...(input===undefined?{}:{'content-type':'application/json'}),...headers},...(input===undefined?{}:{body:JSON.stringify(input)})});
function clientFixture({user={id:'owner',email:'owner@example.test',user_metadata:{name:'Owner'}},subscriptions=[],passwordError=false}={}){
 const calls=[],client={rpc:async()=>({error:{code:'PGRST202'}}),auth:{getUser:async()=>({data:{user}}),signInWithPassword:async input=>{calls.push(['reauth',input.email]);return passwordError?{error:{}}:{data:{user}};},signOut:async input=>{calls.push(['revoke',input.scope]);return{};},signUp:async input=>{calls.push(['signup',input]);return{data:{user,session:null}};},updateUser:async input=>({data:{user:{...user,user_metadata:input.data}}})},from(table){const data=table==='workspaces'?{revision:1,data:{saved:['one'],collections:[]}}:subscriptions;const query={select(){return query;},eq(key,value){calls.push([table,key,value]);return query;},in(){return query;},limit(){return Promise.resolve({data});},maybeSingle(){return Promise.resolve({data});},then(resolve,reject){return Promise.resolve({data}).then(resolve,reject);}};return query;}};
 return{client,calls,user};
}
test('only boot assets are public; private sibling media and encoded representations stay gated',()=>{
 for(const url of ['/assets/video/aeroshards.webm','/assets/original/reactbits/test.png','/assets/studio/test.json','/assets/pro/components/test.webp','/assets/releases/21st/test.mp4','/assets/demo-cache/test.jpg','/assets/esbuild.wasm','/assets%2fvideo/test.mp4','/assets/auth%2f..%2fvideo/test.mp4','/assets/auth/x.png/extra','/assets/%252e%252e/private','/assets/%','/assets/auth/\\x.png','/data/icon-library/index.json','/data/icon-library/chunks/ph-0.json','/assets/branding/private.png','/assets/branding/nitido-glass-layers-private.png','/public/assets/glass.css/extra','/public/assets/demo-cache/private.css','/public/assets/apple.css/extra'])assert.equal(protectedPath(url),true,url);
 for(const url of ['/account','/account/reset','/assets/index-deadbeef.js','/assets/AccountPage-deadbeef.css','/assets/auth/cosmic-login.png','/assets/fonts/GeneralSans-Medium.woff2','/assets/marketing.js','/assets/union-icon.svg','/legal/privacy','/assets/branding/nitido-company.png','/assets/brand.css','/assets/apple.css','/assets/glass.css','/assets/branding/nitido-glass-layers.png','/public/assets/brand.css','/public/assets/apple.css','/public/assets/glass.css'])assert.equal(protectedPath(url),false,url);
});
test('JSON reader bounds streamed bytes, rejects wrong content types, primitives and invalid UTF8',async()=>{
 assert.deepEqual(await readJSONObject(request('/api/x',{name:'A'})),{name:'A'});
 for(const value of [null,[],1,'x'])await assert.rejects(readJSONObject(request('/api/x',value)),error=>error.status===400);
 await assert.rejects(readJSONObject(new Request(origin,{method:'POST',body:'{}'})),error=>error.status===415);
 let canceled=false;const stream=new ReadableStream({start(controller){controller.enqueue(new Uint8Array(100));},cancel(){canceled=true;}});
 await assert.rejects(readJSONObject(new Request(origin,{method:'POST',headers:{'content-type':'application/json'},body:stream,duplex:'half'}),{limit:20}),error=>error.status===413);assert.equal(canceled,true);
 await assert.rejects(readJSONObject(new Request(origin,{method:'POST',headers:{'content-type':'application/json'},body:new Uint8Array([0xff])})),error=>error.status===400);
});
test('limiter resists spoofed forwarding, expires windows and bounds bucket memory',()=>{
 let now=0;const limit=createRequestLimiter({now:()=>now,maxBuckets:2});
 for(let i=0;i<8;i++)limit(request('/api/auth/sign-in/email',{},'POST',{'x-forwarded-for':'1.1.1.'+i}),{env:{}});
 assert.throws(()=>limit(request('/api/auth/sign-in/email',{}),{env:{}}),error=>error.status===429&&error.retryAfter===60);
 now=61000;limit(request('/api/auth/sign-in/email',{}),{env:{}});
 limit(request('/api/access',undefined,'GET',{'x-vercel-forwarded-for':'1.2.3.4'}),{env:{VERCEL:'1'}});
 assert.throws(()=>limit(request('/api/access',undefined,'GET',{'x-vercel-forwarded-for':'2.3.4.5'}),{env:{VERCEL:'1'}}),error=>error.status===429);
});
test('API throttling and cross-site controls reject before touching account services and keep safe headers',async()=>{
 const {client}=clientFixture({user:null});let calls=0;const app=createSupabaseApplication({origin,clientFactory:()=>{calls++;return{client,finish:r=>r};},limiter:createRequestLimiter(),securityLogger:()=>{}});
 const foreign=request('/api/auth/sign-in/email',{email:'owner@example.test',password:'value'},'POST',{'sec-fetch-site':'cross-site'});assert.equal((await app.handle(foreign)).status,403);assert.equal(calls,0);
 for(let i=0;i<5;i++)await app.handle(request('/api/auth/sign-up/email',{}));
 const limited=await app.handle(request('/api/auth/sign-up/email',{}));assert.equal(limited.status,429);assert.ok(limited.headers.get('retry-after'));assert.equal(limited.headers.get('x-content-type-options'),'nosniff');assert.equal(limited.headers.get('referrer-policy'),'no-referrer');assert.ok(limited.headers.get('strict-transport-security'));
 assert.equal(securityHeaders('http://localhost')['Strict-Transport-Security'],undefined);
});
test('signup requires current terms acknowledgement, without creating marketing consent or privileges',async()=>{
 const {client,calls}=clientFixture(),app=createSupabaseApplication({origin,clientFactory:()=>({client,finish:r=>r}),limiter:()=>{}}),input={name:'Owner',email:'owner@example.test',password:'Strong password!123'};
 assert.equal((await app.handle(request('/api/auth/sign-up/email',input))).status,400);
 assert.equal((await app.handle(request('/api/auth/sign-up/email',{...input,termsAccepted:true,policyVersion:'old'}))).status,400);assert.equal(calls.length,0);
 const response=await app.handle(request('/api/auth/sign-up/email',{...input,termsAccepted:true,policyVersion:POLICY_VERSION}));assert.equal(response.status,200);const data=calls[0][1].options.data;assert.equal(data.terms_version,POLICY_VERSION);assert.equal(data.marketing,undefined);assert.equal(data.role,undefined);
});
test('personal export and correction use the verified owner and exclude credentials',async()=>{
 const {client,calls,user}=clientFixture();user.user_metadata.secret='do-not-export';const data=await exportPersonalData(user,client);assert.equal(data.account.id,user.id);assert.ok(calls.every(row=>row[1]==='user_id'&&row[2]===user.id));assert.ok(!JSON.stringify(data).includes('do-not-export'));
 const app=createSupabaseApplication({origin,clientFactory:()=>({client,finish:r=>r}),limiter:()=>{},securityLogger:()=>{}});
 const exported=await app.handle(request('/api/privacy/export'));assert.equal(exported.status,200);assert.match(exported.headers.get('content-disposition'),/attachment/);assert.match(exported.headers.get('cache-control'),/no-store/);
 assert.equal((await app.handle(request('/api/privacy/profile',{name:'Other',role:'admin'},'PATCH'))).status,400);
 assert.equal((await app.handle(request('/api/privacy/profile',{name:'Updated'},'PATCH'))).status,200);
 const anonymous=createSupabaseApplication({origin,clientFactory:()=>({client:clientFixture({user:null}).client,finish:r=>r}),limiter:()=>{}});assert.equal((await anonymous.handle(request('/api/privacy/export'))).status,401);
});
test('export tolerates an unprovisioned Paddle ledger only while billing is disabled',async()=>{
 const {client,user}=clientFixture(),from=client.from.bind(client);
 let code='PGRST205';
 client.from=table=>table==='paddle_subscriptions'?{select(){return this;},eq(){return Promise.resolve({error:{code}});}}:from(table);
 assert.deepEqual((await exportPersonalData(user,client)).subscriptions,[]);
 await assert.rejects(exportPersonalData(user,client,{requiresBillingLedger:true}),{code:'privacy_export_unavailable'});
 code='42501';
 await assert.rejects(exportPersonalData(user,client),{code:'privacy_export_unavailable'});
});
test('account deletion fails closed until configured and requires reauth, no active subscription and global revocation',async()=>{
 const input={password:'Strong password!123',confirmation:'EXCLUIR'},fixture=clientFixture();
 await assert.rejects(deletePersonalAccount(fixture.user,fixture.client,input,{env:{}}),error=>error.code==='deletion_setup_required');assert.equal(fixture.calls.length,0);
 const env={ACCOUNT_DELETION_READY:'true',SUPABASE_SERVICE_ROLE_KEY:'test-server-only-key',SUPABASE_URL:'https://mock.supabase.co'};
 const active=clientFixture({subscriptions:[{status:'active'}]});await assert.rejects(deletePersonalAccount(active.user,active.client,input,{env}),error=>error.status===409);assert.ok(!active.calls.some(row=>row[0]==='reauth'));
 const wrong=clientFixture({passwordError:true});await assert.rejects(deletePersonalAccount(wrong.user,wrong.client,input,{env}),error=>error.status===401);assert.ok(!wrong.calls.some(row=>row[0]==='revoke'));
 let adminCalls=0;const result=await deletePersonalAccount(fixture.user,fixture.client,input,{env,logger:()=>{},fetchImpl:async(url,options)=>{adminCalls++;assert.equal(fixture.calls.at(-1)[0],'revoke');assert.equal(fixture.calls.at(-1)[1],'global');assert.equal(url,'https://mock.supabase.co/auth/v1/admin/users/owner');assert.equal(options.method,'DELETE');assert.ok(!options.body);return new Response('{}');}});assert.equal(result.deleted,true);assert.equal(adminCalls,1);assert.ok(!JSON.stringify(result).includes(env.SUPABASE_SERVICE_ROLE_KEY));
});
test('security logs whitelist fields and never retain request bodies, tokens or identifiers',()=>{
 const records=[];securityEvent('auth_failure',401,{logger:line=>records.push(JSON.parse(line)),password:'secret',email:'private@example.test'});securityEvent('<script>',500,{logger:line=>records.push(line)});assert.equal(records.length,1);assert.deepEqual(Object.keys(records[0]).sort(),['at','event','status','type']);
});
test('historical and sandbox subscriptions cannot block deletion of an account without current live obligations',async()=>{
 const fixture=clientFixture(),records=[{user_id:'owner',environment:'sandbox',is_current:true,status:'active'},{user_id:'owner',environment:'live',is_current:false,status:'active'},{user_id:'another',environment:'live',is_current:true,status:'active'}];
 fixture.client.from=()=>{const filters=[];const query={select(){return query;},eq(key,value){filters.push(row=>row[key]===value);return query;},in(key,values){filters.push(row=>values.includes(row[key]));return query;},limit(max){return Promise.resolve({data:records.filter(row=>filters.every(filter=>filter(row))).slice(0,max)});}};return query;};
 const options={env:{ACCOUNT_DELETION_READY:'true',SUPABASE_SERVICE_ROLE_KEY:'demo-server-key',SUPABASE_URL:'https://mock.supabase.co'},fetchImpl:async()=>new Response('{}'),logger:()=>{}};
 assert.equal((await deletePersonalAccount(fixture.user,fixture.client,{password:'Strong password!123',confirmation:'EXCLUIR'},options)).deleted,true);
 records.push({user_id:'owner',environment:'live',is_current:true,status:'active'});
 await assert.rejects(deletePersonalAccount(fixture.user,fixture.client,{password:'Strong password!123',confirmation:'EXCLUIR'},options),error=>error.status===409);
});
test('legal documents remain explicit drafts with escaped identity and real user-provided contact',()=>{
 const provider=renderLegalPage('/legal/provider',{env:{}});
 assert.match(provider,/VINICIUS PEIXOTO MARTINS MATOS/);
 assert.match(provider,/Rua Sacadura Cabral, 988 — Campo Grande\/MS — CEP 79036-060/);
 assert.doesNotMatch(provider,/CEP pendente|Nome\/razão social pendente/);
 assert.match(renderLegalPage('/legal/privacy',{env:{}}),/Resend.*Google PageSpeed Insights/s);
 for(const url of legalRoutes){const html=renderLegalPage(url,{env:{}});assert.match(html,/nitidocompany@gmail.com/);assert.match(html,/Documento em preparação/);assert.match(html,/60\.317\.226\/0001-42/);assert.match(html,/Campo Grande\/MS/);assert.ok(!html.includes('<script'));}
 const html=renderLegalPage('/legal/provider',{env:{LEGAL_ENTITY_NAME:'<img src=x onerror=alert(1)>'}});assert.ok(!html.includes('<img src=x'));assert.match(html,/&lt;img/);assert.equal(renderLegalPage('/legal/unknown'),null);
});
test('encrypted backup format authenticates content, rejects tampering and uses unique nonces',()=>{
 const key=backupKey(randomBytes(32).toString('base64')),plain=Buffer.from('private database records: do not store plaintext'),first=encryptBackup(plain,key),second=encryptBackup(plain,key);assert.deepEqual(decryptBackup(first,key),plain);assert.notDeepEqual(first,second);assert.ok(!first.includes(plain));first[20]^=1;assert.throws(()=>decryptBackup(first,key));assert.throws(()=>backupKey('invalid'));
});
test('backup CLI refuses the real checkout even when invoked from an unrelated working directory',()=>{
 const script=fileURLToPath(new URL('../scripts/backup-database.mjs',import.meta.url)),repository=fileURLToPath(new URL('../../../',import.meta.url));
 const result=spawnSync(process.execPath,[script],{cwd:os.tmpdir(),encoding:'utf8',env:{...process.env,NITIDO_BACKUP_DIRECTORY:repository,SUPABASE_DB_URL:'',NITIDO_BACKUP_KEY_BASE64:''}});
 assert.notEqual(result.status,0);assert.match(result.stderr,/Backups must be outside the project checkout/);
});
test('local account data export, correction and deletion preserve ownership and revoke the deleted session',async()=>{
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'nitido-privacy-')),app=await createApplication({directory,origin,production:false});
 try{const signed=await app.handle(request('/api/auth/sign-up/email',{name:'Owner',email:'owner@example.test',password:'Strong password!123'})),cookie=signed.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
  const own=(route,input,method)=>request(route,input,method,{cookie});
  assert.equal((await app.handle(request('/api/privacy/export'))).status,401);
  let response=await app.handle(own('/api/privacy/export'));assert.equal(response.status,200);const data=await response.json();assert.equal(data.account.email,'owner@example.test');assert.ok(!JSON.stringify(data).includes('Strong password'));
  response=await app.handle(own('/api/privacy/profile',{name:'Changed'},'PATCH'));assert.equal(response.status,200);
  assert.equal((await app.handle(own('/api/privacy/delete',{password:'wrong',confirmation:'EXCLUIR'}))).status,400);
  response=await app.handle(own('/api/privacy/delete',{password:'Strong password!123',confirmation:'EXCLUIR'}));assert.equal(response.status,200);
  assert.equal((await app.handle(own('/api/privacy/export'))).status,401);assert.equal(app.db.prepare('SELECT count(*) AS count FROM user').get().count,0);
 }finally{app.close();await fs.rm(directory,{recursive:true,force:true});}
});

test('disabled billing tolerates only an absent deletion ledger; enabled billing and permission errors fail closed',async()=>{
 const env={ACCOUNT_DELETION_READY:'true',SUPABASE_SERVICE_ROLE_KEY:'test-only',SUPABASE_URL:'https://mock.supabase.co'},input={password:'Strong password!123',confirmation:'EXCLUIR'};
 function fixture(code){const value=clientFixture(),original=value.client.from.bind(value.client);value.client.from=table=>table==='paddle_subscriptions'?{select(){return this;},eq(){return this;},in(){return this;},limit:async()=>({error:{code}})}:original(table);return value;}
 for(const code of ['42P01','PGRST205']){const one=fixture(code);const result=await deletePersonalAccount(one.user,one.client,input,{env,requiresBillingLedger:false,logger:()=>{},fetchImpl:async()=>new Response('{}')});assert.equal(result.deleted,true);const two=fixture(code);await assert.rejects(deletePersonalAccount(two.user,two.client,input,{env,requiresBillingLedger:true}),{code:'deletion_billing_unavailable'});assert.equal(two.calls.length,0);}
 const denied=fixture('42501');await assert.rejects(deletePersonalAccount(denied.user,denied.client,input,{env,requiresBillingLedger:false}),{code:'deletion_billing_unavailable'});assert.equal(denied.calls.length,0);
});
