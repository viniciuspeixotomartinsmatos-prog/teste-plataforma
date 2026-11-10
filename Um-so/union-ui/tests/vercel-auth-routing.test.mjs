import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {protectedPath} from '../src/auth-policy.js';

test('all named SPA entrypoints survive direct navigation without rewriting private files to HTML',async()=>{
 const config=JSON.parse(await fs.readFile('vercel.json','utf8'));
 const destination=input=>{
  const path=new URL(input,'https://platform.example').pathname;
  return config.rewrites.find(rule=>rule.source.endsWith('/:path*')
   ?path===rule.source.slice(0,-7)||path.startsWith(rule.source.slice(0,-7)+'/')
   :path===rule.source)?.destination;
 };
 for(const route of ['/creators','/shared','/icons?q=pessoa&family=ph','/compare','/sources','/resources','/component/example','/collections','/collections/example','/tools','/tools/raio-x','/builder','/account','/account/reset','/plans','/billing']){
  assert.equal(destination(route),'/index.html',route+' must open the existing app on a full navigation or refresh');
 }
 for(const path of ['/data/icon-library/index.json','/data/icon-library/chunks/ph-0.json','/code/example.json','/previews/example.html','/assets/catalog-cover.webp','/tools-runtime/example.html']){
  assert.notEqual(destination(path),'/index.html',path+' must retain its asset/auth handling');
  assert.equal(protectedPath(path),true,path);
 }
 assert.equal(protectedPath('/icons'),true);
});

test('Vercel routes nested auth and workspace requests through a concrete API entrypoint',async()=>{
 const config=JSON.parse(await fs.readFile('vercel.json','utf8'));
 const rule=config.rewrites.find(r=>r.source==='/api/:path*');
 assert.equal(rule?.destination,'/api');
 assert.equal(config.rewrites.find(r=>r.source==='/billing')?.destination,'/index.html');
 const entry=await import('../api/index.js');
 const response=await entry.default.fetch(new Request('https://platform.example/api/auth/get-session'));
 assert.equal(response.status,503);
 assert.equal((await response.json()).code,'auth_setup_required');
});
