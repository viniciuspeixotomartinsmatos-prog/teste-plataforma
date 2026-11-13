import test from 'node:test';
import assert from 'node:assert/strict';
import {createApplication} from '../server/application.mjs';

const origin='http://127.0.0.1:4173';
const request=(route,options={})=>new Request(origin+route,options);
test('login is required even with billing disabled; a revoked cookie cannot read platform files',async()=>{
 const app=await createApplication({database:':memory:',directory:'var/test-runtime',production:false,secret:'auth-required-test-secret-at-least-32-characters'});
 try{
  assert.equal((await (await app.handle(request('/api/access'))).json()).canExport,false);
  assert.equal(await app.canReadCode(request('/code/item.json')),false);
  const signup=password=>app.handle(request('/api/auth/sign-up/email',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({name:'Teste',email:'auth-required@example.test',password})}));
  assert.equal((await signup('abcdefgh1234')).status,400);
  assert.equal((await signup('ABCDEFGHIJKL')).status,400);
  const result=await signup('ABCDEFG1');
  assert.equal(result.status,200);
  const cookie=result.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
  assert.equal(await app.canReadCode(request('/code/item.json',{headers:{cookie}})),true);
  assert.equal((await (await app.handle(request('/api/access',{headers:{cookie}}))).json()).canExport,true);
  await app.handle(request('/api/auth/sign-out',{method:'POST',headers:{origin,cookie,'Content-Type':'application/json'},body:'{}'}));
  assert.equal(await app.canReadCode(request('/code/item.json',{headers:{cookie}})),false);
 }finally{app.close();}
});
