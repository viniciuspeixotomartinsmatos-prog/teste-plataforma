import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {frameworkCounterpart,svgGeometry} from '../scripts/lib/catalog-variant-audit.mjs';
import slugs from '../src/catalog-icon-variants.json' with {type:'json'};
import {catalogVariants,groupCatalogResults} from '../src/catalog.js';

test('variant evidence rejects dynamic paths and different geometry, and normalizes static JSX/Vue numbers',()=>{
 const react='<svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={3}/><path d="M0 0 L1 1"/></svg>';
 const vue='<svg viewBox="0 0 24 24"><circle :cx="12" :cy="12" :r="3"/><path d="M0 0 L1 1"/></svg>';
 assert.equal(svgGeometry(react),svgGeometry(vue));
 assert.notEqual(svgGeometry(react),svgGeometry(vue.replace('L1 1','L2 2')));
 assert.equal(svgGeometry('<svg viewBox="0 0 24 24"><path :d="userPath"/></svg>'),null);
 assert.equal(svgGeometry('<svg viewBox="0 0 24 24"><path d={userPath}/></svg>'),null);
});

test('every linked icon pair retains matching source geometry, framework, metadata and both stable IDs',async()=>{
 const rows=JSON.parse(await fs.readFile('public/data/catalog-live.json','utf8')),index=new Map(rows.map(row=>[row.id,row]));
 assert.ok(slugs.length>700);assert.equal(new Set(slugs).size,slugs.length);
 for(const slug of slugs){
  const pair=[index.get('animate-'+slug),index.get('animate-vue-'+slug)];
  assert.ok(frameworkCounterpart(...pair),slug);
  const geometries=await Promise.all(pair.map(async row=>{const payload=JSON.parse(await fs.readFile('public'+(row.originalCodePath||row.codePath),'utf8'));const source=payload.files.find(file=>row.framework==='vue'?/\.vue$/i.test(file.path):/\.[jt]sx$/i.test(file.path))?.content;return svgGeometry(source||'');}));
  assert.ok(geometries[0],slug);assert.equal(...geometries,slug);
  const groups=groupCatalogResults(pair);assert.equal(groups.length,1,slug);assert.deepEqual(groups[0]._variants.map(row=>row.id),pair.map(row=>row.id));
  assert.deepEqual(catalogVariants(pair[0],rows).map(row=>row.id).sort(),pair.map(row=>row.id).sort());
 }
 const unrelated={id:'hugeicons-accessibility',name:'Accessibility Icon',kind:'icon',category:'Icons'};
 assert.equal(groupCatalogResults([index.get('animate-hugeicons-accessibility'),unrelated]).length,2);
});
