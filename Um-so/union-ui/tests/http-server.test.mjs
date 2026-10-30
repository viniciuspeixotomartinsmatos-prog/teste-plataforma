import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createServer} from '../server/start.mjs';
test('HTTP server serves routes and ranges, protects paid files and refuses private paths and oversized bodies',async t=>{
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'umso-http-')),root=path.join(directory,'public');
 await fs.mkdir(path.join(root,'code'),{recursive:true});await fs.mkdir(path.join(root,'tools-runtime'),{recursive:true});await fs.mkdir(path.join(root,'assets'),{recursive:true});await fs.writeFile(path.join(root,'assets/demo.webp'),'image');
 await fs.writeFile(path.join(root,'index.html'),'<h1>Um só.</h1>');await fs.writeFile(path.join(root,'clip.mp4'),'0123456789');await fs.writeFile(path.join(root,'code/private.json'),'{}');await fs.writeFile(path.join(root,'tools-runtime/umso.html'),'tool');
 const {server}=await createServer({directory:path.join(directory,'private'),root,production:false,requireSubscription:true,origin:'http://127.0.0.1:4173'});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(async()=>{await new Promise(r=>server.close(r));await fs.rm(directory,{recursive:true,force:true});});
 const base='http://127.0.0.1:'+server.address().port;
 let response=await fetch(base+'/account',{headers:{accept:'text/html'}});assert.equal(response.status,200);assert.match(await response.text(),/Um só/);
 response=await fetch(base+'/assets/demo.webp',{headers:{origin:'null'}});assert.equal(response.headers.get('access-control-allow-origin'),'*');assert.equal(response.headers.get('content-type'),'image/webp');
 response=await fetch(base+'/api/health',{headers:{origin:'null'}});assert.notEqual(response.headers.get('access-control-allow-origin'),'*');
 for(const endpoint of ['/code/private.json','/code%2fprivate.json','/tools-runtime/umso.html']){response=await fetch(base+endpoint);assert.equal(response.status,403);assert.equal(response.headers.get('cache-control'),'no-store');}
 for(const endpoint of ['/var/app.sqlite','/.env','/%2egit/config','/missing.js'])assert.equal((await fetch(base+endpoint)).status,404);
 response=await fetch(base+'/clip.mp4',{headers:{range:'bytes=2-5'}});assert.equal(response.status,206);assert.equal(await response.text(),'2345');assert.equal(response.headers.get('content-range'),'bytes 2-5/10');
 response=await fetch(base+'/api/auth/sign-in/email',{method:'POST',headers:{'Content-Type':'application/json'},body:'x'.repeat(1500001)});assert.equal(response.status,413);
 assert.equal((await fetch(base+'/api/health')).status,200);
});
