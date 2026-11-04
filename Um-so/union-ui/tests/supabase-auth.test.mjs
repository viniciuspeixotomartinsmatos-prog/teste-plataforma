import test from 'node:test';
import assert from 'node:assert/strict';
import {createSupabaseApplication} from '../server/supabase-app.mjs';
import {safeNext,protectedPath} from '../src/auth-policy.js';
import {signInResponse} from '../server/access-policy.mjs';
const origin='https://platform.example';
const request=(path,body)=>new Request(origin+path,body===undefined?{}:{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});

test('content and encoded paths are protected; account assets remain public; redirect targets stay internal',()=>{
 for(const path of ['/','/index.html','/tools','/builder','/component/x','/data/catalog-live.json','/code/a.json','/previews/x.html','/tools-runtime/a.js','/code%2fx.json','/assets/demo-cache/a.jpg'])assert.equal(protectedPath(path),true,path);
 for(const path of ['/account','/account/reset','/api/auth/callback','/assets/index-123.js','/assets/union-icon.svg'])assert.equal(protectedPath(path),false,path);
 for(const next of ['//evil.example','https://evil.example','/\\evil.example','/api/auth/sign-out'])assert.equal(safeNext(next),'/');
 assert.equal(safeNext('/tools?view=1'),'/tools?view=1');
 const redirect=signInResponse(new Request(origin+'/tools',{headers:{accept:'text/html'}}));assert.equal(redirect.status,303);assert.equal(redirect.headers.get('location'),'/account?next=%2Ftools');
 assert.equal(signInResponse(request('/code/a.json')).status,401);
});
test('Supabase verifies users remotely, refuses foreign mutations and gives explicit setup failures',async()=>{
 let verified=0;const client={auth:{getUser:async()=>{verified++;return{data:{user:null},error:null};}}};
 const app=createSupabaseApplication({origin,clientFactory:()=>({client,finish:r=>r})});
 assert.equal((await app.handle(request('/api/auth/get-session'))).status,200);
 assert.equal((await(await app.handle(request('/api/access'))).json()).canExport,false);
 assert.equal((await app.handle(request('/api/workspace'))).status,401);assert.equal(verified,3);
 const foreign=new Request(origin+'/api/auth/sign-in/email',{method:'POST',headers:{origin:'https://evil.example'},body:'{}'});assert.equal((await app.handle(foreign)).status,403);
 assert.equal((await createSupabaseApplication({}).handle(request('/api/auth/get-session'))).status,503);
});
test('signup without a session asks for email verification and does not claim authenticated access',async()=>{
 const client={auth:{signUp:async()=>({data:{user:{id:'one',email:'a@example.test',user_metadata:{name:'Um'}},session:null}})}};
 const app=createSupabaseApplication({origin,clientFactory:()=>({client,finish:r=>r})});
 const response=await app.handle(request('/api/auth/sign-up/email',{name:'Um',email:'a@example.test',password:'twelve_characters_73!'}));
 assert.equal(response.status,200);assert.equal((await response.json()).verificationRequired,true);
});
