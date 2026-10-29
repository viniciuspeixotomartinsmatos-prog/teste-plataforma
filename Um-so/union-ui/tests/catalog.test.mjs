import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {prepareCatalog,searchCatalog} from '../src/catalog.js';
const base=path.resolve('public');
const rows=JSON.parse(fs.readFileSync(path.join(base,'data/catalog.json'),'utf8'));
const sources=JSON.parse(fs.readFileSync(path.join(base,'data/sources.json'),'utf8'));
const prepared=prepareCatalog(rows);

test('published catalog contains only local previews, neutral unique routes and all source groups',()=>{const live=JSON.parse(fs.readFileSync(path.join(base,'data/catalog-live.json'),'utf8'));assert.equal(new Set(live.map(r=>r.publicSlug)).size,live.length);assert.equal(new Set(live.map(r=>r.sourceId)).size,9);for(const item of live){assert.ok(item.previewPath&&fs.existsSync(path.join(base,item.previewPath)),item.id);assert.ok(!/^(?:21st|magic--|reactbits--|aceternity--)/.test(item.publicSlug));if(item.codePath)assert.ok(fs.existsSync(path.join(base,item.codePath)));}});
test('native previews include both themes and reference complete local JavaScript bundles',()=>{
 const live=JSON.parse(fs.readFileSync(path.join(base,'data/catalog-live.json'),'utf8'));
 for(const item of live.filter(row=>row.previewPath.startsWith('/previews/runtime/'))){
  for(const preview of [item.previewPath,item.previewPath.replace(/\.html$/,'.light.html')]){
   const html=fs.readFileSync(path.join(base,preview),'utf8');
   const script=html.match(/<script src="(\/previews\/runtime\/[^" ]+\.js)"/);
   assert.ok(script,item.id+' has a local script');
   assert.ok(fs.statSync(path.join(base,script[1])).size>1000,item.id+' has a complete bundle');
   assert.ok(html.includes('html.light{color-scheme:light'),item.id+' supports internal theme controls');
  }
 }
});
test('all nine catalogs contain unique items and truthful source totals',()=>{assert.equal(sources.length,9);assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);for(const s of sources){const rs=rows.filter(r=>r.sourceId===s.id);assert.equal(rs.length,s.count,s.id);assert.equal(rs.filter(r=>r.availability==='code').length,s.codeCount,s.id);}});
test('every local code, image, example, variant and preview pointer resolves',()=>{for(const r of rows){for(const p of [r.image,r.codePath,r.previewPath,...(r.examples||[]).map(x=>x.codePath),...(r.variants||[]).map(x=>x.codePath)].filter(Boolean)){assert.ok(p.startsWith('/'),r.id+' uses nonlocal pointer '+p);assert.ok(fs.existsSync(path.join(base,p)),r.id+': '+p);}}});
test('full-source items have real file contents; usage examples stay explicitly labelled',()=>{for(const r of rows.filter(r=>r.codePath)){const data=JSON.parse(fs.readFileSync(path.join(base,r.codePath),'utf8'));assert.ok(data.files?.length,r.id);assert.ok(data.files.some(f=>typeof f.content==='string'&&f.content.length>0),r.id);if(data.usageOnly)assert.equal(r.availability,'usage',r.id);}});
test('search combines source, category, type and local-code filters',()=>{const result=searchCatalog(prepared,{source:'reactbits',category:'Backgrounds',kind:'component',codeOnly:true,q:'aurora'});assert.ok(result.length);assert.ok(result.every(r=>r.sourceId==='reactbits'&&r.category==='Backgrounds'&&r.availability==='code'));assert.equal(searchCatalog(prepared,{q:'xxxyyyzzznomatch123'}).length,0);assert.ok(searchCatalog(prepared,{q:'botões'}).some(r=>/button/i.test(r.name)));assert.ok(searchCatalog(prepared,{q:'Motion Primitives'}).some(r=>r.sourceId==='motion'));});
test('saved-only and deterministic ordering do not mutate the master catalog',()=>{const id=prepared.find(r=>r.sourceId==='magic').id;const one=searchCatalog(prepared,{savedOnly:true,saved:[id]});assert.deepEqual(one.map(r=>r.id),[id]);const before=prepared.map(r=>r.id);const result=searchCatalog(prepared,{source:'magic',sort:'name'});assert.ok(result[0].name.localeCompare(result.at(-1).name)<=0);assert.deepEqual(prepared.map(r=>r.id),before);});
