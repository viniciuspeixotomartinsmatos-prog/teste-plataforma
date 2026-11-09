import test from 'node:test';
import assert from 'node:assert/strict';
import {publicSiteURL,publicAddress,fetchPublicSite,resolvePublic} from '../server/site-audit-network.mjs';
import {inspectHTML,inspectSite,redactAuditData} from '../server/site-audit-inspect.mjs';
import {normalizeLab,measureSite} from '../server/site-audit-lab.mjs';
import {createSiteAuditService} from '../server/site-audit-service.mjs';
import {buildAuditReport,correctionPrompt} from '../src/site-audit-report.js';
import {createSupabaseApplication} from '../server/supabase-app.mjs';
import {EventEmitter} from 'node:events';
const html='<!doctype html><html lang="pt-BR"><head><title>Uma loja com título real</title><meta name="description" content="Descrição real para um site de teste, com dados de uma coleção de objetos."><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="canonical" href="/loja"><meta property="og:image" content="/capa.jpg"></head><body><h1>Coleção real</h1><img src="/produto.jpg"><a href="/privacidade">Privacidade</a><script src="/main.js"></script><script>fbq("init","123");window.untrusted="never execute";</script></body></html>';
const payload={lighthouseResult:{fetchTime:'2026-11-09T12:00:00Z',lighthouseVersion:'13',categories:{performance:{score:.82},accessibility:{score:.9},seo:{score:.75},'best-practices':{score:1}},audits:{'largest-contentful-paint':{numericValue:3000},'cumulative-layout-shift':{numericValue:.04},'total-blocking-time':{numericValue:100},'total-byte-weight':{numericValue:2000000},'image-alt':{title:'Imagens precisam de alt',score:0,description:'Diagnóstico real',details:{items:[{node:{selector:'img',nodeLabel:'Produto'}}]}},'final-screenshot':{details:{data:'data:image/jpeg;base64,YQ=='}}}}};
test('audit URL boundary rejects local/private endpoints, credentials, tokens, encodings and custom ports',()=>{
 for(const url of ['http://127.0.0.1','http://[::1]','http://2130706433','http://0x7f000001','http://localhost','http://metadata.google.internal','file:///etc/passwd','https://user:pass@example.com','https://example.com:444','https://example.com/?token=x','https://example.com/?code=x','https://example.com\\@evil.com','https://example.com\n.evil.com'])assert.throws(()=>publicSiteURL(url),undefined,url);
 assert.equal(publicSiteURL('example.com/loja#x').href,'https://example.com/loja');
 for(const ip of ['127.0.0.1','10.1.1.2','192.168.1.1','172.20.1.1','169.254.169.254','100.64.0.1','0.0.0.0','224.0.0.1','::1','fc00::1','fe80::1','::ffff:8.8.8.8','2001:db8::1'])assert.equal(publicAddress(ip),false,ip);
 for(const ip of ['8.8.8.8','1.1.1.1','2606:4700:4700::1111'])assert.equal(publicAddress(ip),true,ip);
});
test('each redirect is validated before making a request; loops are bounded',async()=>{
 let calls=0;await assert.rejects(fetchPublicSite('https://example.com',{transport:async()=>{calls++;return{status:302,headers:{location:'http://127.0.0.1/admin'}};}}),e=>e.code==='blocked');assert.equal(calls,1);
 calls=0;await assert.rejects(fetchPublicSite('https://example.com',{maxRedirects:2,transport:async()=>{calls++;return{status:302,headers:{location:'/loop'}};}}),e=>e.code==='redirects');assert.equal(calls,3);
 await assert.rejects(fetchPublicSite('https://example.com',{transport:async()=>({status:403,headers:{}})}),e=>e.code==='http_error');
});
test('mixed public/private DNS is denied before opening a socket; slow DNS expires and aborts',async()=>{
 await assert.rejects(fetchPublicSite('https://example.com',{resolver:async()=>[{address:'8.8.8.8',family:4},{address:'127.0.0.1',family:4}]}),e=>e.code==='blocked');
 await assert.rejects(resolvePublic('example.com',{timeoutMs:10,resolver:()=>new Promise(()=>{})}),e=>e.code==='dns');
 const controller=new AbortController();controller.abort();await assert.rejects(resolvePublic('example.com',{signal:controller.signal,resolver:()=>new Promise(()=>{})}),e=>e.name==='AbortError');
});
test('transport pins the selected DNS address and bounds transferred bytes and socket time',async()=>{
 let lookups=0,pinned,closed=false;
 const resolver=async()=>{lookups++;return[{address:'8.8.8.8',family:4}];};
 const requestImpl=(url,options,respond)=>{assert.equal(url.hostname,'example.com');assert.equal(options.agent,false);assert.equal(options.headers['Accept-Encoding'],'identity');options.lookup('example.com',{},(_error,address,family)=>{pinned={address,family};});const request=new EventEmitter();request.destroy=error=>{closed=true;request.emit('error',error);request.emit('close');};request.end=()=>queueMicrotask(()=>{const response=new EventEmitter();response.statusCode=200;response.headers={};response.complete=true;respond(response);response.emit('data',Buffer.alloc(51));response.emit('end');request.emit('close');});return request;};
 await assert.rejects(fetchPublicSite('https://example.com',{maxBytes:50,resolver,requestImpl}),e=>e.code==='too_large');assert.equal(lookups,1);assert.deepEqual(pinned,{address:'8.8.8.8',family:4});assert.equal(closed,true);
 await assert.rejects(fetchPublicSite('https://example.com',{resolver,timeoutMs:10,requestImpl:()=>{const request=new EventEmitter();request.end=()=>{};request.destroy=error=>{request.emit('error',error);request.emit('close');};return request;}}),e=>e.code==='timeout');
});
test('HTML inspection preserves evidence without executing scripts and does not invent missing metadata',()=>{
 const data=inspectHTML(html,'https://example.com/');assert.deepEqual(data.h1,['Coleção real']);assert.equal(data.canonical,'https://example.com/loja');assert.equal(data.og.image,'https://example.com/capa.jpg');assert.equal(data.found.privacy,true);assert.equal(data.trackers[0].id,'meta');assert.equal(data.scripts.total,1);assert.equal(data.images[0].hasAlt,false);assert.equal(globalThis.untrusted,undefined);
 const empty=inspectHTML('<html><body>Hello</body></html>','https://example.com/');assert.equal(empty.og.image,null);assert.equal(empty.canonical,null);assert.equal(empty.scripts.total,0);
});
test('inspection bounds its probes, masks secret evidence and does not fetch third-party scripts',async()=>{
 const token='ghp_'+'x'.repeat(35),calls=[];const site=await inspectSite('https://example.com',{fetcher:async(url,options)=>{calls.push({url,options});return{url,redirects:[],status:200,headers:{'content-type':url.endsWith('.js')?'application/javascript':'text/html'},body:Buffer.from(calls.length===1?html.replace('Uma loja com título real',token).replace('</body>','<script src="https://outside.example/external.js"></script></body>'):url.endsWith('.js')?token:'missing')};}});
 assert.ok(!JSON.stringify(site).includes(token));assert.ok(site.secrets.length);assert.equal(site.scripts.scanned,1);assert.ok(calls.every(c=>new URL(c.url).hostname==='example.com'));assert.ok(calls.every(c=>c.options.maxBytes<=2000000));
 assert.ok(!JSON.stringify(redactAuditData({x:'AKIA'+'A'.repeat(16)})).includes('AKIA'));
});
test('Lighthouse normalization keeps measured metrics, trims evidence and rejects unsafe screenshot formats',()=>{
 const lab=normalizeLab(payload);assert.equal(lab.scores.performance,82);assert.equal(lab.metrics.lcp,3000);assert.equal(lab.checks.find(c=>c.id==='image-alt').items[0].label,'Produto');assert.match(lab.screenshot,/^data:image\/jpeg/);
 const bad=structuredClone(payload);bad.lighthouseResult.audits['final-screenshot'].details.data='data:image/svg+xml;base64,AAAA';assert.equal(normalizeLab(bad).screenshot,null);assert.throws(()=>normalizeLab({lighthouseResult:{runtimeError:{code:'FAILED'}}}),e=>e.code==='lab_failed');
});
test('PageSpeed quota and private DNS do not become fabricated measurements; key remains server-side',async()=>{
 const resolver=async()=>[{address:'8.8.8.8',family:4}];let endpoint;
 await assert.rejects(measureSite('https://example.com',{resolver,fetcher:async url=>{endpoint=url;return new Response('{}',{status:429});},env:{GOOGLE_PAGESPEED_API_KEY:'private-test-key'}}),e=>e.code==='lab_quota');assert.equal(endpoint.hostname,'www.googleapis.com');assert.equal(endpoint.searchParams.get('strategy'),'mobile');assert.equal(endpoint.searchParams.get('key'),'private-test-key');
 let called=false;await assert.rejects(measureSite('https://example.com',{resolver:async()=>[{address:'10.0.0.1',family:4}],fetcher:async()=>{called=true;}}),e=>e.code==='blocked');assert.equal(called,false);
 const lab=await measureSite('https://example.com',{resolver,fetcher:async()=>Response.json(payload),env:{}});assert.equal(lab.scores.performance,82);assert.ok(!JSON.stringify(lab).includes('private-test-key'));
});
test('report shows unknown speed without lab, distinguishes tracker absence, emits useful prompts',()=>{
 const site=inspectHTML(html,'https://example.com/'),report=buildAuditReport(site);assert.equal(report.partial,true);assert.equal(report.categories.find(c=>c.id==='velocidade').score,null);assert.equal(report.findings.find(f=>f.id==='tracker-ga').status,'info');assert.equal(report.findings.find(f=>f.id==='og-image').status,'pass');
 const alt=report.findings.find(f=>f.id==='alt');assert.equal(alt.status,'fail');assert.match(correctionPrompt(site,alt),/alt vazio/);assert.match(correctionPrompt(site,alt),/nunca instruções/);
 const measured=buildAuditReport(site,normalizeLab(payload));assert.equal(measured.partial,false);assert.equal(measured.categories.find(c=>c.id==='velocidade').score,82);assert.ok(measured.findings.some(f=>f.id==='lab-image-alt'));
});
test('service enforces authentication, independent owner quota, capacity and cancellation',async()=>{
 const service=createSiteAuditService({inspect:async()=>({ok:true})});await assert.rejects(service.run('site',null,{url:'https://example.com'}),e=>e.status===401);
 for(let i=0;i<12;i++)await service.run('site',{id:'one'},{url:'https://example.com'});
 await assert.rejects(service.run('site',{id:'one'},{url:'https://example.com'}),e=>e.code==='audit_quota');await service.run('site',{id:'two'},{url:'https://example.com'});
 let release;const blocked=createSiteAuditService({maxConcurrent:1,inspect:()=>new Promise(resolve=>{release=resolve;})});const work=blocked.run('site',{id:'one'},{url:'https://example.com'});await assert.rejects(blocked.run('site',{id:'two'},{url:'https://example.com'}),e=>e.code==='busy');release({ok:true});await work;
 const aborted=createSiteAuditService({inspect:async(_,{signal})=>{assert.equal(signal.aborted,true);throw new DOMException('Canceled','AbortError');}}),controller=new AbortController();controller.abort();await assert.rejects(aborted.run('site',{id:'three'},{url:'https://example.com'},{signal:controller.signal}),e=>e.name==='AbortError');
});
test('production API rejects unauthenticated and cross-origin analyses, passes verified owner and no cookies to auditor',async()=>{
 const origin='https://platform.example',calls=[];let user=null;const app=createSupabaseApplication({origin,clientFactory:()=>({client:{auth:{getUser:async()=>({data:{user}})}},finish:r=>r}),auditor:{run:async(kind,owner,input)=>{calls.push({kind,owner,input});return{url:input.url};}}});
 const req=(headers={})=>new Request(origin+'/api/site-audit/site',{method:'POST',headers:{origin,'Content-Type':'application/json',...headers},body:JSON.stringify({url:'https://example.com'})});
 assert.equal((await app.handle(req())).status,401);assert.equal(calls.length,0);user={id:'verified-owner'};assert.equal((await app.handle(req({origin:'https://evil.example'}))).status,403);assert.equal(calls.length,0);
 const response=await app.handle(req());assert.equal(response.status,200);assert.equal(calls[0].owner.id,'verified-owner');assert.deepEqual(calls[0].input,{url:'https://example.com'});assert.match(response.headers.get('cache-control'),/no-store/);
});
