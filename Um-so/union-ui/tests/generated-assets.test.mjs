import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createServer} from 'vite';
import {publicAssetCors} from '../server/demo-assets.mjs';
test('a newly generated preview bundle is served as JavaScript instead of the SPA shell',async t=>{
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'umso-dev-assets-'));await fs.mkdir(path.join(directory,'public'),{recursive:true});await fs.writeFile(path.join(directory,'index.html'),'<h1>Application shell</h1>');
 const server=await createServer({configFile:false,root:directory,logLevel:'silent',plugins:[publicAssetCors()],server:{host:'127.0.0.1',port:0,watch:{ignored:['**/public/**']}},optimizeDeps:{noDiscovery:true,include:[]}});
 await server.listen();t.after(async()=>{await server.close();assert.ok(path.resolve(directory).startsWith(path.join(os.tmpdir(),'umso-dev-assets-')));await fs.rm(directory,{recursive:true,force:true});});
 const base='http://127.0.0.1:'+server.httpServer.address().port;await fs.mkdir(path.join(directory,'public/previews/runtime'),{recursive:true});const code='window.generatedPreview = true;';await fs.writeFile(path.join(directory,'public/previews/runtime/new-content-hash.js'),code);
 const response=await fetch(base+'/previews/runtime/new-content-hash.js',{headers:{origin:'null'}});assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/javascript/);assert.equal(response.headers.get('access-control-allow-origin'),'*');assert.equal(await response.text(),code);
 assert.equal((await fetch(base+'/previews/%2e%2e%2f..%2fsecret.pem')).status,403);
});
