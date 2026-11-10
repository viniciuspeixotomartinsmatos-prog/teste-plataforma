import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {referenceAudit} from '../src/site-audit-reference-rules.js';
import {buildAuditReport} from '../src/site-audit-report.js';
const sample=JSON.parse(await fs.readFile(new URL('./fixtures/reference-audit-example.json',import.meta.url),'utf8'));
test('captured reference example retains its observed 77 and all five category scores',()=>{
 const result=referenceAudit(sample.site,sample.lab);assert.equal(result.score,77);
 assert.deepEqual(Object.fromEntries(result.categories.map(c=>[c.id,c.score])),{velocidade:61,celular:94,seo:75,pixel:84,privacidade:76});
});
test('normalized reference evidence preserves the same scores through the product adapter',()=>{
 const s=sample.site,l=sample.lab;
 const site={url:s.url,host:s.host,https:s.https,title:s.head.title,description:s.head.description,viewport:s.head.viewport,robots:s.head.robots,lang:s.head.lang,canonical:s.head.canonical,og:s.head.og,h1:Array(s.h1).fill('Título'),clientRendered:s.csr,images:Array.from({length:s.imgs.total},(_,i)=>({hasAlt:i>=s.imgs.noAlt,src:s.imgs.samples[i]||null})),scripts:s.scripts,found:s.found,trackers:[],thirdPartyHosts:[],secrets:s.secrets,insecure:[],httpToHttps:s.httpToHttps,resources:{sitemap:{found:s.sitemap.ok}},reference:{...s,favicon:s.head.favicon,jsonLd:s.head.jsonLd}};
 const lab={scores:{...l.scores,'best-practices':l.scores.bestPractices},metrics:l.metrics,bytes:l.bytes,reference:l};
 const result=buildAuditReport(site,lab);assert.equal(result.score,77);assert.equal(result.criteriaVersion,'reference-2026-11-09');assert.equal(result.partial,false);
 assert.equal(buildAuditReport(site).score,null);assert.equal(buildAuditReport(site).partial,true);
});
