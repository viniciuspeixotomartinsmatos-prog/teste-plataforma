import test from 'node:test';import assert from 'node:assert/strict';
import {allowedRenderRequest,renderDesign} from '../server/rendered-design.mjs';
import {createSiteAuditService} from '../server/site-audit-service.mjs';
import {createSupabaseApplication} from '../server/supabase-app.mjs';
const main=new URL('https://example.com/');
const request=(url,method='GET',type='script',navigation=false)=>({url:()=>url,method:()=>method,resourceType:()=>type,isNavigationRequest:()=>navigation,frame:()=>({parentFrame:()=>null})});
test('render relay rejects private/sensitive URLs, writes, trackers and unsolicited navigation',()=>{
 for(const url of ['http://127.0.0.1/','https://internal.local/x','https://user:secret@example.com/x','https://example.com/x?api_key=secret'])assert.throws(()=>allowedRenderRequest(request(url),main));
 assert.equal(allowedRenderRequest(request('https://example.com/write','POST'),main),false);
 assert.equal(allowedRenderRequest(request('https://www.google-analytics.com/g.js'),main),false);
 assert.equal(allowedRenderRequest(request('https://example.com/other','GET','document',true),main),false);
 assert.equal(allowedRenderRequest(request(main.href,'GET','document',true),main).href,main.href);
 assert.equal(allowedRenderRequest(request('https://cdn.example.org/style.css'),main).hostname,'cdn.example.org');
});
test('renderer closes context and browser on sampling failures and never transmits caller headers',async()=>{
 let closedContext=0,closedBrowser=0,relay,options;
 const page={on(){},goto:async()=>{},waitForLoadState:async()=>{},evaluate:async fn=>fn.name==='sampleRenderedDesign'?Promise.reject(Error('sampling failed')):null};
 const context={setOffline:async value=>assert.equal(value,true),routeWebSocket:async()=>{},route:async(_pattern,handler)=>{relay=handler;},newPage:async()=>page,close:async()=>{closedContext++;}};
 const browser={newContext:async value=>{options=value;return context;},close:async()=>{closedBrowser++;}};
 await assert.rejects(renderDesign(main.href,{launch:async()=>browser,fetcher:async(url,opts)=>{assert.equal(opts.headers,undefined);return {url,status:200,headers:{'content-type':'text/html'},body:Buffer.from('<h1>Fixture</h1>')};}}),/sampling failed/);
 assert.ok(relay);assert.equal(options.serviceWorkers,'block');assert.equal(options.ignoreHTTPSErrors,false);assert.equal(options.acceptDownloads,false);assert.equal(closedContext,1);assert.equal(closedBrowser,1);
});
test('render stage requires owner, has a separate quota, validates stage and limits concurrency',async()=>{
 const service=createSiteAuditService({render:async()=>({computed:{}})});
 await assert.rejects(service.run('render',null,{url:main.href}),e=>e.status===401);
 await assert.rejects(service.run('unknown',{id:'owner'},{url:main.href}),e=>e.code==='invalid');
 for(let i=0;i<4;i++)await service.run('render',{id:'owner'},{url:main.href});
 await assert.rejects(service.run('render',{id:'owner'},{url:main.href}),e=>e.status===429);
 let release;const bounded=createSiteAuditService({render:()=>new Promise(resolve=>{release=resolve;})});
 const work=bounded.run('render',{id:'first'},{url:main.href});await assert.rejects(bounded.run('render',{id:'second'},{url:main.href}),e=>e.status===429);release({});await work;
});
test('render endpoint remains authenticated and Origin-protected in production adapter',async()=>{
 let user=null,calls=0;const origin='https://platform.example',app=createSupabaseApplication({origin,clientFactory:()=>({client:{auth:{getUser:async()=>({data:{user}})}},finish:r=>r}),auditor:{run:async(kind,owner,input)=>{calls++;assert.equal(kind,'render');assert.equal(owner.id,'owner');return {url:input.url};}}});
 const req=source=>new Request(origin+'/api/site-audit/render',{method:'POST',headers:{origin:source,'content-type':'application/json'},body:JSON.stringify({url:main.href})});
 assert.equal((await app.handle(req(origin))).status,401);user={id:'owner'};assert.equal((await app.handle(req('https://evil.example'))).status,403);
 const response=await app.handle(req(origin));assert.equal(response.status,200);assert.equal(calls,1);assert.equal((await response.json()).render.url,main.href);
});

test('parallel render resources reserve the remaining byte budget before fetching',async()=>{
 let handler;const relayed=[];
 const route=url=>({request:()=>request(url),abort:async()=>{},fulfill:async()=>{}});
 const page={on(){},goto:async()=>{await handler(route(main.href));await Promise.all(['a.js','b.js','c.js'].map(name=>handler(route(new URL(name,main).href))));},waitForLoadState:async()=>{},evaluate:async fn=>fn.name==='sampleRenderedDesign'?{sampledElements:1,scope:'fixture'}:null};
 const context={setOffline:async()=>{},routeWebSocket:async()=>{},route:async(_pattern,callback)=>{handler=callback;},newPage:async()=>page,close:async()=>{}};
 const result=await renderDesign(main.href,{limits:{requests:8,bytes:100,perResource:60,timeoutMs:1000,nodes:1},launch:async()=>({newContext:async()=>context,close:async()=>{}}),fetcher:async(url,options)=>{
  if(url===main.href)return {url,status:200,headers:{'content-type':'text/html'},body:Buffer.alloc(10)};
  relayed.push(options.maxBytes);await new Promise(resolve=>setImmediate(resolve));return {url,status:200,headers:{'content-type':'application/javascript'},body:Buffer.alloc(options.maxBytes)};
 }});
 assert.deepEqual(relayed,[60,30]);assert.equal(result.coverage.bytes,100);assert.equal(result.coverage.blocked,1);
});

test('browser subprocess retains packaged native-library paths without application credentials',async()=>{
 const {designBrowserEnvironment}=await import('../server/rendered-design.mjs');
 const result=designBrowserEnvironment({PATH:'/usr/bin',HOME:'/tmp',LD_LIBRARY_PATH:'/tmp/al2023/lib:/lib64',FONTCONFIG_PATH:'/tmp/fonts',SUPABASE_SERVICE_ROLE_KEY:'private',GOOGLE_PAGESPEED_API_KEY:'private',VERCEL_OIDC_TOKEN:'private'});
 assert.equal(result.LD_LIBRARY_PATH,'/tmp/al2023/lib:/lib64');assert.equal(result.FONTCONFIG_PATH,'/tmp/fonts');assert.equal(Object.keys(result).length,4);assert.ok(!JSON.stringify(result).includes('private'));
});
