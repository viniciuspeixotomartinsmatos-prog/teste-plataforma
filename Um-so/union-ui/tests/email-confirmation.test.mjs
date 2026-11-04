import test from 'node:test';
import assert from 'node:assert/strict';
import {requestClient} from '../server/supabase-client.mjs';
import {createSupabaseApplication} from '../server/supabase-app.mjs';

const origin='https://platform.example',env={SUPABASE_URL:'https://authmock.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_mock_key'};
const user={id:'verified-user',aud:'authenticated',email:'test@example.test',role:'authenticated',user_metadata:{name:'Teste'}};
const session=()=>({user,access_token:'mock-access-token',refresh_token:'mock-refresh-token',expires_in:3600,token_type:'bearer'});
const request=(path,body,cookie='')=>new Request(origin+path,{...(body===undefined?{}:{method:'POST',body:JSON.stringify(body)}),headers:{origin,'content-type':'application/json',...(cookie?{cookie}:{})}});
const application=()=>createSupabaseApplication({origin,clientFactory:r=>requestClient(r,{env})});
const cookieHeader=response=>response.headers.getSetCookie().map(cookie=>cookie.split(';')[0]).join('; ');

test('real SDK signup persists HttpOnly PKCE cookies and the callback exchanges the matching verifier',async()=>{
 const original=globalThis.fetch;let challenge,verifier,redirect;
 globalThis.fetch=async(url,init)=>{const parsed=new URL(url);if(parsed.pathname.endsWith('/signup')){challenge=JSON.parse(init.body).code_challenge;redirect=new URL(parsed.searchParams.get('redirect_to'));return Response.json(user);}if(parsed.pathname.endsWith('/token')){verifier=JSON.parse(init.body).code_verifier;return Response.json(session());}throw Error('Unexpected mock request');};
 try{
  const app=application(),signup=await app.handle(request('/api/auth/sign-up/email',{name:'Teste',email:user.email,password:'test-password-with-24-characters'}));
  assert.equal(signup.status,200);assert.equal((await signup.json()).verificationRequired,true);
  const cookies=signup.headers.getSetCookie();assert.ok(cookies.some(cookie=>cookie.includes('code-verifier=')));
  for(const cookie of cookies){assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);assert.match(cookie,/SameSite=Lax/i);}
  const flowId=redirect.searchParams.get('sb_flow_id')||cookies.map(cookie=>cookie.match(/-flow-([a-z0-9]{32})-code-verifier=/)?.[1]).find(Boolean);assert.ok(flowId);
  const callback=await app.handle(request('/api/auth/callback?code=mock-code&sb_flow_id='+flowId,undefined,cookieHeader(signup)));
  assert.equal(callback.status,303);assert.equal(callback.headers.get('location'),origin+'/');assert.ok(challenge&&verifier);
  assert.ok(callback.headers.getSetCookie().some(cookie=>cookie.startsWith('sb-authmock-auth-token=')));
 }finally{globalThis.fetch=original;}
});

test('email token verification works without a PKCE cookie and refuses reuse, unsafe types and foreign requests',async()=>{
 const original=globalThis.fetch;let used=false,calls=0;
 globalThis.fetch=async(url,init)=>{assert.ok(new URL(url).pathname.endsWith('/verify'));calls++;const input=JSON.parse(init.body);assert.equal(input.token_hash,'a'.repeat(64));assert.equal(input.type,'email');if(used)return Response.json({code:'otp_expired',msg:'Token has expired'},{status:403});used=true;return Response.json(session());};
 try{
  const app=application();
  assert.equal((await app.handle(request('/api/auth/verify-email?token_hash='+('a'.repeat(64))))).status,404);assert.equal(calls,0,'GET must not consume an emailed token');
  const result=await app.handle(request('/api/auth/verify-email',{tokenHash:'a'.repeat(64),type:'email'}));assert.equal(result.status,200);assert.equal((await result.json()).next,'/');assert.ok(result.headers.getSetCookie().some(cookie=>cookie.startsWith('sb-authmock-auth-token=')));
  assert.equal((await app.handle(request('/api/auth/verify-email',{tokenHash:'a'.repeat(64),type:'email'}))).status,400);
  assert.equal((await app.handle(request('/api/auth/verify-email',{tokenHash:'a'.repeat(64),type:'invite'}))).status,400);
  const foreign=new Request(origin+'/api/auth/verify-email',{method:'POST',headers:{origin:'https://evil.example'},body:JSON.stringify({tokenHash:'a'.repeat(64),type:'email'})});assert.equal((await app.handle(foreign)).status,403);assert.equal(calls,2);
 }finally{globalThis.fetch=original;}
});

test('missing PKCE verifier returns a safe login screen instead of raw JSON or a session',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>{throw Error('A missing verifier must not reach the token endpoint');};
 try{
  const app=application();for(const [query,message]of [['','confirmation_browser'],['&next=/account/reset','recovery_link']]){
   const response=await app.handle(request('/api/auth/callback?code=private-one-time-code'+query));assert.equal(response.status,303);assert.equal(response.headers.get('location'),origin+'/account?auth_error='+message);assert.equal(response.headers.get('referrer-policy'),'no-referrer');assert.ok(!response.headers.getSetCookie().some(cookie=>cookie.startsWith('sb-authmock-auth-token=')));assert.ok(!response.headers.get('location').includes('private-one-time-code'));
  }
 }finally{globalThis.fetch=original;}
});

test('recovery token is verified before entering password reset; resend uses the fixed canonical return URL',async()=>{
 let received,resends=0;
 const client={auth:{verifyOtp:async input=>{received=input;return{data:{session:{access_token:'verified'},user}};},resend:async input=>{resends++;assert.equal(input.type,'signup');assert.equal(input.options.emailRedirectTo,origin+'/api/auth/callback');return{data:{}};}}};
 const app=createSupabaseApplication({origin,clientFactory:()=>({client,finish:r=>r})});
 const response=await app.handle(request('/api/auth/verify-email',{tokenHash:'b'.repeat(64),type:'recovery'}));assert.equal(response.status,200);assert.equal((await response.json()).next,'/account/reset');assert.equal(received.type,'recovery');
 assert.equal((await app.handle(request('/api/auth/resend-confirmation',{email:user.email,redirectTo:'https://evil.example'}))).status,200);assert.equal(resends,1);
 assert.equal((await app.handle(request('/api/auth/resend-confirmation',{email:'invalid'}))).status,400);assert.equal(resends,1);
});

test('real SDK resend creates a fresh PKCE verifier for a browser that lost its signup cookies',async()=>{
 const original=globalThis.fetch;let challenge,verifier;
 globalThis.fetch=async(url,init)=>{const pathname=new URL(url).pathname;if(pathname.endsWith('/resend')){challenge=JSON.parse(init.body).code_challenge;return Response.json({});}if(pathname.endsWith('/token')){verifier=JSON.parse(init.body).code_verifier;return Response.json(session());}throw Error('Unexpected mock request');};
 try{
  const app=application(),resend=await app.handle(request('/api/auth/resend-confirmation',{email:user.email}));assert.equal(resend.status,200);assert.ok(resend.headers.getSetCookie().some(cookie=>cookie.includes('-code-verifier=')&&!/Max-Age=0\b/.test(cookie)));
  const callback=await app.handle(request('/api/auth/callback?code=new-mail-code',undefined,cookieHeader(resend)));assert.equal(callback.status,303);assert.equal(callback.headers.get('location'),origin+'/');assert.ok(challenge&&verifier);
 }finally{globalThis.fetch=original;}
});
